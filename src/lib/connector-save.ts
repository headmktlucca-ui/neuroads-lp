/**
 * connector-save.ts
 * Client-side helpers to persist connector connections in Firestore.
 * Schema: users/{uid}.connections.{storageKey} = ConnectorConnection
 */

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { CONNECTOR_CONNECTION_KEYS, type ConnectorKey, type ConnectorConnection } from './connectors';

// --- Firestore path helpers ---

function storageKey(connector: ConnectorKey): string {
  return CONNECTOR_CONNECTION_KEYS[connector];
}

// --- Save ---

export type SaveConnectionPayload = {
  connector: ConnectorKey;
  uid: string;
  accessToken: string;
  refreshToken?: string | null;
  accountId?: string | null;
  accountName?: string | null;
  expiresIn?: number | null;
  metadata?: Record<string, unknown>;
};

export async function saveConnection(payload: SaveConnectionPayload): Promise<void> {
  const db = getFirebaseDb();
  const key = storageKey(payload.connector);
  const expiresAt =
    payload.expiresIn && payload.expiresIn > 0
      ? Date.now() + payload.expiresIn * 1000
      : null;

  const connection: ConnectorConnection = {
    isActive: true,
    accessToken: payload.accessToken,
    ...(payload.refreshToken ? { refreshToken: payload.refreshToken } : {}),
    ...(payload.accountId ? { accountId: payload.accountId } : {}),
    ...(payload.accountName
      ? { metadata: { ...(payload.metadata ?? {}), accountName: payload.accountName } }
      : payload.metadata
      ? { metadata: payload.metadata }
      : {}),
    ...(expiresAt ? { expiresAt } : {}),
    connectedAt: Date.now(),
    updatedAt: Date.now(),
  };

  await setDoc(
    doc(db, 'users', payload.uid),
    { connections: { [key]: connection } },
    { merge: true }
  );
}

// --- Manual/API-key save ---

export type SaveApiKeyPayload = {
  connector: ConnectorKey;
  uid: string;
  apiKey: string;
  accountName?: string;
  metadata?: Record<string, unknown>;
};

export async function saveApiKeyConnection(payload: SaveApiKeyPayload): Promise<void> {
  const db = getFirebaseDb();
  const key = storageKey(payload.connector);

  const connection: ConnectorConnection = {
    isActive: true,
    accessToken: payload.apiKey,
    ...(payload.accountName
      ? { metadata: { accountName: payload.accountName, ...(payload.metadata ?? {}) } }
      : payload.metadata
      ? { metadata: payload.metadata }
      : {}),
    connectedAt: Date.now(),
    updatedAt: Date.now(),
  };

  await setDoc(
    doc(db, 'users', payload.uid),
    { connections: { [key]: connection } },
    { merge: true }
  );
}

// --- Disconnect ---

export async function disconnectConnector(uid: string, connector: ConnectorKey): Promise<void> {
  const db = getFirebaseDb();
  const key = storageKey(connector);

  await setDoc(
    doc(db, 'users', uid),
    {
      connections: {
        [key]: {
          isActive: false,
          updatedAt: Date.now(),
        },
      },
    },
    { merge: true }
  );
}

// --- Read ---

export type ConnectionsMap = Partial<Record<ConnectorKey, ConnectorConnection>>;

export async function loadUserConnections(uid: string): Promise<ConnectionsMap> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return {};

  const data = snap.data() as { connections?: Record<string, ConnectorConnection> };
  const raw = data?.connections ?? {};

  const result: ConnectionsMap = {};
  (Object.entries(CONNECTOR_CONNECTION_KEYS) as [ConnectorKey, string][]).forEach(([connKey, fsKey]) => {
    const conn = raw[fsKey];
    if (conn) result[connKey] = conn;
  });

  return result;
}

export function isConnectorActive(connections: ConnectionsMap, connector: ConnectorKey): boolean {
  return Boolean(connections[connector]?.isActive);
}

export function getConnectionMeta(
  connections: ConnectionsMap,
  connector: ConnectorKey
): { accountName?: string; accountId?: string; connectedAt?: number } {
  const conn = connections[connector];
  if (!conn) return {};
  return {
    accountName: (conn.metadata?.accountName as string | undefined) ?? undefined,
    accountId: conn.accountId ?? undefined,
    connectedAt: conn.connectedAt ?? undefined,
  };
}
