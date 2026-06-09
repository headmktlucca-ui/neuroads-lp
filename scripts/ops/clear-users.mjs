import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leitura manual do .env.local
const envPath = path.resolve(__dirname, '../../.env.local');
const envFile = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    value = value.trim().replace(/(^"|"$)/g, '');
    envVars[key] = value;
  }
});

async function clearAllUsers() {
  console.log('--- INICIANDO EXCLUSÃO EM MASSA DE USUÁRIOS (PERIGO) ---');
  console.log(`Projeto Alvo: ${envVars.FIREBASE_PROJECT_ID}\n`);

  if (!envVars.FIREBASE_PRIVATE_KEY) {
    console.error('ERRO: FIREBASE_PRIVATE_KEY não encontrada no .env.local!');
    return;
  }

  try {
    const privateKey = envVars.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: envVars.FIREBASE_PROJECT_ID || envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });

    const db = admin.firestore();
    const auth = admin.auth();
    
    // 1. Apagar do Firestore (Banco de Dados)
    console.log('[1/2] Lendo coleção "users" no Firestore...');
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();

    if (snapshot.empty) {
      console.log('      A coleção "users" já está vazia.');
    } else {
      console.log(`      Deletando ${snapshot.size} documentos do Firestore...`);
      
      const batches = [];
      let currentBatch = db.batch();
      let operationCount = 0;

      snapshot.docs.forEach((doc) => {
        currentBatch.delete(doc.ref);
        operationCount++;

        if (operationCount === 499) {
          batches.push(currentBatch.commit());
          currentBatch = db.batch();
          operationCount = 0;
        }
      });

      if (operationCount > 0) {
        batches.push(currentBatch.commit());
      }

      await Promise.all(batches);
      console.log(`      ✅ Todos os ${snapshot.size} documentos apagados com sucesso!`);
    }

    // 2. Apagar do Firebase Authentication (Contas de Login)
    console.log('\n[2/2] Buscando contas no Firebase Authentication...');
    const listUsersResult = await auth.listUsers(1000);
    
    if (listUsersResult.users.length === 0) {
      console.log('      Nenhuma conta encontrada no Authentication.');
    } else {
      console.log(`      Deletando ${listUsersResult.users.length} contas de login...`);
      const uids = listUsersResult.users.map(u => u.uid);
      const deleteResult = await auth.deleteUsers(uids);
      
      console.log(`      ✅ ${deleteResult.successCount} contas apagadas com sucesso!`);
      if (deleteResult.failureCount > 0) {
        console.log(`      ⚠️ Falha ao apagar ${deleteResult.failureCount} contas.`);
      }
    }

    console.log('\n--- LIMPEZA TOTAL CONCLUÍDA COM SUCESSO ---');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO DURANTE A EXCLUSÃO:', error.message);
    process.exit(1);
  }
}

clearAllUsers();
