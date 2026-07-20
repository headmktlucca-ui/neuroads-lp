/**
 * SCRIPT DE LIMPEZA — NeuroAds Production
 *
 * Apaga TODOS os usuários do Firebase Authentication e
 * todos os documentos da coleção `users` (com subcoleções) e `hub_usage`.
 *
 * Uso: node scripts/delete-all-users.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: 'neuroads-production',
  clientEmail: 'firebase-adminsdk-fbsvc@neuroads-production.iam.gserviceaccount.com',
  privateKey: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCdYNqB2s3RMzAS\ns7TgRWSTrtPc7X7JivB2QdfM2lDVRmMbflTshcw2KmESk3iIqJz2jzq6TNNNQjrb\n9iNpo+DXTBvcxGH0jhSFlcKLnAgesQem5rhl7Ml4/fosqF8gLJK95QhvFvLOgTnS\n7FZhAEbbfKH9U6mGcOetzQaMU+W3RbyiDJ2RzGyVz10rb1lnvwMSzKgpjYR/9Cxd\npGAMNPskG0g2RY6KdcC+lQ3eynr6XIjwyB8yRSaRRwPSothzX0y+ZRD37bxjfwj5\nlatyMOA9rvmdKFRYcOi3PZxjlhWkDoWYbbnpBR/eA3iYq+TsQOPgl91Dj2tMLc8c\nNwSBAyDZAgMBAAECggEAGVI6hfce82BhhTjNyuHPX2WbJ+o8YpAMxXItlwOvSsli\n68sFPfL/Gt3xtWvt0ksSyibcY5o1yzHzR23QX9BivjE8MGaWfiMYETA5132Y3ttL\n6GIp3BhfiCyRAntqpsIVMCF4HGucUHaBR7sH4N6LCAiDBb/ewEdNN20L9ysOhFCf\nAutgMZhM0lqg45lYpWwpuqq3JJ2LoKQ8xZMszVfenVXb3SxuBiXH9VZd6jlhJreF\nqAdJ1CdRoisxoEmmPUuWqQvZdv1Mm6RQXqq2QETosRonLJXToncgXj8bNu7tSpr2\ncb3Dlg4xgVvNr2jLLN4huT1Cr1+u4sTzLT15JtmWEwKBgQDLbkYpswQqAAcp9J/v\n92wZNFcT0d3r0t2EWce7hqCzuSdyguIkOOym+JcDnn1PCSuXQwSZ+eucrdLwgC4z\nRbzHr9W5vrFxnRv5hL57vxPiIVsykrJU6r4ylT4QyBCka56j7cs68wCPzdnxdnIp\n+1KGrzxkFYD0VHNg/c6oSRhUmwKBgQDGDAjmH53yCfQpZnZan2Q7daPexWG7EtdU\nP4nk1Xx8zN3VgXcsP/BN2+6LZWc/0tPHs2XJSPoFksgYPSUcEbs8Y622WVMfjJ6E\nXizODcN+FH0820OtGDJSK8VQu3Si6reAJhVofvzjsAmywZZTH835kieCDN8g2sS8\nzKKw3kClmwKBgBnBHz7ePBO5Jy8Hmkv+DgBu4OtQcYEOlB7SYvf5xlSah0T3Dvw4\n/LTy2eOKaCDeb1daE7YOruaKFx99itvQ42KAf1VhsANLOaRwStFN0o2ZXXtcmRkp\nEuVCgbYMLhcyzMXCMC2JYDPUgtgP/8oS2FLW0pV1J3tHScgoucYSYvMrAoGBAJ9E\nTmPCSWK8Xn5syAFY7WJj2MTuNwoavNAjyOEeTl6O4lcxJoWPZdE3bT7s7XuGMIoI\n23JkHa0dvYzAn3dTSx/liW17qD1W+KO6mI2cw/pAv/aQ3nv1WYJ7cNLb7ZCW8bs8\n5TqD5Ru2FhaLWDjA+wQZZWxQrZ/eTxkF+FAEbDjBAoGAD3Urw11+Ikf/p9sCVeLZ\nW7PpSi1M4P2YGVVcios+yDfL1duzxC94Wq5ZAzkoVEIMCNYI0ayEfbi27Pjmm9nD\n1tnsGYMnPNgWfz8E31kWy1AEJO7RCjFW4v9GFscHlBn0RR8YE+W4qr0t+ivk3kAj\n+h+VUyG71Xv0W/WYgjkJcQc=\n-----END PRIVATE KEY-----\n`,
};

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

// ── Apaga coleção recursivamente (inclui subcoleções) ─────────────────────
async function deleteCollectionRecursive(collRef) {
  const snap = await collRef.get();
  if (snap.empty) return 0;

  let total = 0;
  const BATCH_SIZE = 400;

  for (let i = 0; i < snap.docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = snap.docs.slice(i, i + BATCH_SIZE);

    for (const docSnap of chunk) {
      const subColls = await docSnap.ref.listCollections();
      for (const sub of subColls) {
        const subDeleted = await deleteCollectionRecursive(sub);
        total += subDeleted;
      }
      batch.delete(docSnap.ref);
      total++;
    }
    await batch.commit();
  }
  return total;
}

// ── Apaga todos os usuários do Firebase Auth ──────────────────────────────
async function deleteAllAuthUsers() {
  let pageToken;
  let deleted = 0;
  do {
    const result = await auth.listUsers(1000, pageToken);
    const uids = result.users.map((u) => u.uid);
    if (uids.length > 0) {
      await auth.deleteUsers(uids);
      deleted += uids.length;
      console.log(`  Apagando... ${deleted} usuário(s) no Auth até agora`);
    }
    pageToken = result.pageToken;
  } while (pageToken);
  return deleted;
}

// ── Main ──────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n============================================================');
  console.log('  LIMPEZA GERAL — Firebase (Auth + Firestore)');
  console.log('  Projeto: neuroads-production');
  console.log('============================================================\n');

  console.log('1/2 — Apagando usuários do Firebase Authentication...');
  const authDeleted = await deleteAllAuthUsers();
  console.log(`  ✅ ${authDeleted} usuário(s) apagado(s) do Auth.\n`);

  console.log('2/2 — Apagando coleções do Firestore (+ subcoleções)...');
  const collectionsToClean = [
    'users',
    'hub_usage',
    'agentWorkspaces',
    'dnaProfiles',
    'conversations',
    'companies',
    'leads',
    'notifications',
    'admin_workspaces',
    'integration_webhook_events',
  ];

  let totalDocsDeleted = 0;
  for (const collName of collectionsToClean) {
    const deletedCount = await deleteCollectionRecursive(db.collection(collName));
    totalDocsDeleted += deletedCount;
    if (deletedCount > 0) {
      console.log(`  ✅ ${deletedCount} documento(s) apagado(s) de "${collName}".`);
    } else {
      console.log(`  ℹ️ Coleção "${collName}" já está vazia.`);
    }
  }

  console.log('\n============================================================');
  console.log(`  ✅  LIMPEZA CONCLUÍDA`);
  console.log(`  Auth:      ${authDeleted} usuário(s) removido(s)`);
  console.log(`  Firestore: ${totalDocsDeleted} documento(s) removido(s) total`);
  console.log('============================================================\n');
  process.exit(0);
})();

