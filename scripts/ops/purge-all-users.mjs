/**
 * purge-all-users.mjs
 * ──────────────────────────────────────────────────────────────────────────────
 * Apaga TODOS os usuários do Firebase Auth e TODOS os seus dados no Firestore.
 *
 * Uso:
 *   node scripts/ops/purge-all-users.mjs
 *
 * ⚠️  ESTA OPERAÇÃO É TOTALMENTE IRREVERSÍVEL.
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Carrega .env.local manualmente se dotenv não o fez
try {
  const envPath = resolve(process.cwd(), '.env.local');
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* .env.local optional */ }

import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// ─── Init Firebase Admin ──────────────────────────────────────────────────────

function initAdmin() {
  if (getApps().length > 0) return getApp();

  const projectId   = process.env.FIREBASE_PROJECT_ID    || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌  Variáveis de ambiente do Firebase Admin ausentes:');
    console.error('    FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    process.exit(1);
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

initAdmin();
const auth = getAuth();
const db   = getFirestore();

// ─── Config ───────────────────────────────────────────────────────────────────

const BATCH_SIZE = 450;

// Sub-coleções conhecidas em users/{uid}/
const SUBCOLLECTIONS = [
  'automations',
  'connectors',
  'reports',
  'conversations',
  'documents',
  'dna',
  'sessions',
  'agentRuns',
  'notifications',
];

// Coleções top-level onde o uid é usado como document ID
const TOP_LEVEL_COLLECTIONS = [
  'agentWorkspaces',
  'dnaProfiles',
  'conversations',
];

// ─── Utils ────────────────────────────────────────────────────────────────────

async function deleteCollection(colRef) {
  const docs = await colRef.listDocuments();
  if (docs.length === 0) return 0;
  let deleted = 0;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    docs.slice(i, i + BATCH_SIZE).forEach((ref) => batch.delete(ref));
    await batch.commit();
    deleted += Math.min(BATCH_SIZE, docs.length - i);
  }
  return deleted;
}

async function purgeFirestoreUser(uid) {
  const userRef = db.collection('users').doc(uid);

  // Delete known sub-collections
  await Promise.allSettled(
    SUBCOLLECTIONS.map((sub) => deleteCollection(userRef.collection(sub)))
  );

  // Delete root user doc
  await userRef.delete();

  // Delete top-level collection docs keyed by uid
  await Promise.allSettled(
    TOP_LEVEL_COLLECTIONS.map((col) => db.collection(col).doc(uid).delete())
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚨  PURGE-ALL-USERS — Exclusão completa e irreversível\n');

  // 1. Collect all Auth UIDs
  let allUsers = [];
  let nextPageToken;
  do {
    const result = await auth.listUsers(1000, nextPageToken);
    allUsers.push(...result.users);
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  console.log(`👥  Total de usuários encontrados no Firebase Auth: ${allUsers.length}\n`);

  if (allUsers.length === 0) {
    console.log('✅  Nenhum usuário para excluir. Banco já está vazio.');
    return;
  }

  // 2. For each user: delete Firestore data then Auth account
  let successCount = 0;
  let failCount    = 0;

  for (const user of allUsers) {
    const { uid, email } = user;
    process.stdout.write(`   🗑  ${uid}  ${email ?? '(sem email)'}  …  `);

    try {
      // Firestore
      await purgeFirestoreUser(uid);

      // Firebase Auth
      await auth.deleteUser(uid);

      console.log('✅ excluído');
      successCount++;
    } catch (err) {
      console.log(`❌ erro: ${err.message}`);
      failCount++;
    }
  }

  // 3. Attempt to delete any remaining docs in users/ collection
  //    (handles UIDs that existed in Firestore but not in Auth)
  console.log('\n🧹  Varrendo coleção `users` por documentos órfãos…');
  try {
    const snap = await db.collection('users').listDocuments();
    if (snap.length > 0) {
      console.log(`   Encontrados ${snap.length} documentos órfãos — removendo…`);
      for (let i = 0; i < snap.length; i += BATCH_SIZE) {
        const batch = db.batch();
        snap.slice(i, i + BATCH_SIZE).forEach((ref) => batch.delete(ref));
        await batch.commit();
      }
      console.log('   ✅ Documentos órfãos removidos.');
    } else {
      console.log('   ✅ Nenhum documento órfão encontrado.');
    }
  } catch (err) {
    console.log(`   ⚠️  Falha ao varrer coleção users: ${err.message}`);
  }

  // 4. Summary
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  Excluídos com sucesso : ${successCount}
❌  Falhas                : ${failCount}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  if (failCount > 0) {
    console.warn('⚠️  Alguns usuários não foram excluídos. Verifique os logs acima.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\n💥  Erro fatal:', err);
  process.exit(1);
});
