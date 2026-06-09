import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leitura manual do .env.local sem depender do dotenv
const envPath = path.resolve(__dirname, '../../.env.local');
const envFile = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    value = value.trim().replace(/(^"|"$)/g, ''); // remove aspas
    envVars[key] = value;
  }
});

async function checkDatabase() {
  console.log('--- INICIANDO DIAGNÓSTICO DO FIREBASE ---');
  console.log(`Projeto Alvo (FIREBASE_PROJECT_ID): ${envVars.FIREBASE_PROJECT_ID}`);
  console.log(`Projeto Alvo (NEXT_PUBLIC_FIREBASE_PROJECT_ID): ${envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
  console.log(`Service Account Email: ${envVars.FIREBASE_CLIENT_EMAIL}`);

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
    
    console.log('\nListando coleções raízes no banco de dados...');
    const collections = await db.listCollections();
    
    if (collections.length === 0) {
      console.log('⚠️ O BANCO DE DADOS ESTÁ COMPLETAMENTE VAZIO! Nenhuma coleção encontrada.');
    } else {
      console.log(`✅ Foram encontradas ${collections.length} coleções:`);
      for (const col of collections) {
        console.log(`- ${col.id}`);
        // Tentar pegar 1 documento para ter certeza
        const snapshot = await col.limit(1).get();
        if (snapshot.empty) {
          console.log(`   └ Coleção vazia (nenhum documento encontrado)`);
        } else {
          console.log(`   └ Contém documentos (ex: ID ${snapshot.docs[0].id})`);
        }
      }
    }

    console.log('\n--- FIM DO DIAGNÓSTICO ---');
  } catch (error) {
    console.error('\n❌ ERRO DURANTE A COMUNICAÇÃO COM O FIREBASE:', error.message);
  }
}

checkDatabase();
