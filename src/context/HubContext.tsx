'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { collection, doc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: number;
}

interface HubContextType {
  selectedPeriod: string; // '7' | '15' | '30' | '90'
  setSelectedPeriod: (period: string) => void;
  dateRange: { dateFrom: string; dateTo: string };
  notifications: NotificationItem[];
  unreadCount: number;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const HubContext = createContext<HubContextType | undefined>(undefined);

export function HubProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Date range calculation
  const dateRange = useMemo(() => {
    const today = new Date();
    const days = parseInt(selectedPeriod, 10) || 30;
    const fromDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
    return {
      dateTo: today.toISOString().slice(0, 10),
      dateFrom: fromDate.toISOString().slice(0, 10),
    };
  }, [selectedPeriod]);

  // Load real notifications from Firestore
  useEffect(() => {
    if (!user) {
      setTimeout(() => {
        setNotifications([]);
      }, 0);
      return;
    }

    const db = getFirebaseDb();
    const notifsRef = collection(db, 'users', user.uid, 'notifications');

    const unsubscribe = onSnapshot(notifsRef, async (snap) => {
      if (snap.empty) {
        // Initialize default/real notifications based on connection state
        const initialNotifs: Omit<NotificationItem, 'id'>[] = [
          {
            title: 'Boas-vindas ao NeuroAds',
            message: 'Seu onboarding foi concluído com sucesso. Explore as ferramentas!',
            type: 'success',
            read: false,
            createdAt: Date.now() - 3600 * 1000 * 24, // 1 day ago
          },
        ];

        // Read connection status
        const conns = profile?.connections || {};
        if (conns.ga4?.isActive) {
          initialNotifs.push({
            title: 'GA4 Sincronizado',
            message: 'Coleta de dados de tráfego ativa no site.',
            type: 'success',
            read: false,
            createdAt: Date.now() - 3600 * 1000 * 4,
          });
        }
        if (conns.google_ads?.isActive) {
          initialNotifs.push({
            title: 'Google Ads Ativo',
            message: 'Integração de investimento e campanhas concluída.',
            type: 'success',
            read: false,
            createdAt: Date.now() - 3600 * 1000 * 2,
          });
        }

        const batch = writeBatch(db);
        initialNotifs.forEach((item) => {
          const newDocRef = doc(notifsRef);
          batch.set(newDocRef, item);
        });
        await batch.commit();
        return;
      }

      const list: NotificationItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<NotificationItem, 'id'>),
      }));

      // Sort by date desc
      list.sort((a, b) => b.createdAt - a.createdAt);
      setNotifications(list);
    });

    return () => unsubscribe();
  }, [user, profile]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markAsRead = async (id: string) => {
    if (!user) return;
    const db = getFirebaseDb();
    await setDoc(doc(db, 'users', user.uid, 'notifications', id), { read: true }, { merge: true });
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    const db = getFirebaseDb();
    const batch = writeBatch(db);
    notifications.forEach((n) => {
      if (!n.read) {
        batch.set(doc(db, 'users', user.uid, 'notifications', n.id), { read: true }, { merge: true });
      }
    });
    await batch.commit();
  };

  return (
    <HubContext.Provider
      value={{
        selectedPeriod,
        setSelectedPeriod,
        dateRange,
        notifications,
        unreadCount,
        isNotificationsOpen,
        setIsNotificationsOpen,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </HubContext.Provider>
  );
}

export function useHub() {
  const context = useContext(HubContext);
  if (context === undefined) {
    throw new Error('useHub must be used within a HubProvider');
  }
  return context;
}
