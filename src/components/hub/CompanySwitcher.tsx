'use client';

import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseDb } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

interface CompanySwitcherTriggerProps {
  companyName: string;
  userName: string;
  userPhoto?: string | null;
  isDark?: boolean;
  compact?: boolean;
  avatarOnly?: boolean;
  className?: string;
}

function compressImage(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CompanySwitcherTrigger({
  companyName,
  userName,
  userPhoto,
  isDark = true,
  compact = false,
  avatarOnly = false,
  className = '',
}: CompanySwitcherTriggerProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);

  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  const greeting = getGreeting();
  const activePhoto = localPhoto || userPhoto || user?.photoURL || null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const dataUrl = await compressImage(file, 400, 400, 0.85);
      setLocalPhoto(dataUrl);

      // Save to Firebase Auth profile if available
      try {
        await updateProfile(user, { photoURL: dataUrl });
      } catch (authErr) {
        console.warn('Firebase auth updateProfile notice:', authErr);
      }

      // Save to Firestore user document
      const db = getFirebaseDb();
      if (db) {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            photoURL: dataUrl,
            photoUrl: dataUrl,
            profilePhoto: dataUrl,
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.error('Error uploading profile avatar:', err);
    } finally {
      setUploading(false);
    }
  };

  const avatarSizeClass = avatarOnly
    ? 'w-10 h-10 text-[14px]'
    : compact
    ? 'w-9 h-9 text-[12px]'
    : 'w-[56px] h-[56px] text-[15px]';
  const companyTextSizeClass = compact ? 'text-[13px]' : 'text-[17px]';

  return (
    <div className={`flex items-center ${avatarOnly ? '' : compact ? 'w-full gap-2.5 py-0.5' : 'w-full gap-3 px-2 py-2'} ${className}`}>
      {/* Invisible file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Avatar Button */}
      <button
        type="button"
        onClick={handleAvatarClick}
        disabled={uploading}
        title="Clique para alterar a foto do avatar"
        className={`group relative ${avatarSizeClass} rounded-full overflow-hidden shrink-0 ring-2 ring-white/80 shadow-xs flex items-center justify-center text-white font-black select-none bg-gradient-to-tr from-[#cc4400] to-[#FF8805] cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200`}
      >
        {activePhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={activePhoto} alt={userName} className="w-full h-full object-cover" />
        ) : (
          (userName.charAt(0) || 'N').toUpperCase()
        )}

        {/* Hover Camera Icon Overlay */}
        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 text-white">
          {uploading ? (
            <Loader2 className={`${compact || avatarOnly ? 'w-3.5 h-3.5' : 'w-5 h-5'} animate-spin text-white`} />
          ) : (
            <Camera className={`${compact || avatarOnly ? 'w-3.5 h-3.5' : 'w-5 h-5'} text-white drop-shadow-md`} />
          )}
        </div>
      </button>

      {/* Info — Rendered ONLY if avatarOnly is false */}
      {!avatarOnly && (
        <div className="flex flex-col min-w-0 flex-1">
          {companyName && (
            <span className={`${companyTextSizeClass} font-black truncate block leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {companyName.charAt(0).toUpperCase() + companyName.slice(1).toLowerCase()}
            </span>
          )}
          <div className="flex items-baseline gap-1 mt-0.5 min-w-0">
            <span className={`text-[10px] font-normal leading-none shrink-0 ${isDark ? 'text-white/60' : 'text-slate-400'}`}>
              {greeting}
            </span>
            <span className={`text-[10px] font-normal truncate leading-none ${isDark ? 'text-white/70' : 'text-slate-500'}`}>
              {userName.split(' ')[0]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
