const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Carrega as variáveis de ambiente manualmente para maior robustez
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  }
});

const projectId = env.FIREBASE_PROJECT_ID;
const clientEmail = env.FIREBASE_CLIENT_EMAIL;
const privateKeyRaw = env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKeyRaw) {
  console.error("Erro: Variáveis do Firebase Admin não encontradas no .env.local");
  process.exit(1);
}

const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  })
});

const db = admin.firestore();
const auth = admin.auth();

async function deleteCollection(db, collectionRef, batchSize = 100) {
  const query = collectionRef.limit(batchSize);
  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve, reject);
  });
}

async function deleteQueryBatch(db, query, resolve, reject) {
  try {
    const snapshot = await query.get();
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      resolve();
      return;
    }
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    process.nextTick(() => {
      deleteQueryBatch(db, query, resolve, reject);
    });
  } catch (error) {
    reject(error);
  }
}

async function deleteSubcollections(docRef) {
  const subcollections = await docRef.listCollections();
  for (const sub of subcollections) {
    await deleteCollection(db, sub);
  }
}

async function run() {
  console.log("Iniciando limpeza do banco de dados...");
  
  // 1. Obter todos os usuários do Firestore
  const usersSnapshot = await db.collection('users').get();
  console.log(`Encontrados ${usersSnapshot.size} documentos de usuários no Firestore.`);
  
  let targetUid = null;
  const uidsToDelete = [];
  
  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    const email = (data.email || data.authEmail || '').toLowerCase();
    
    if (email === 'headmktlucca@gmail.com') {
      targetUid = doc.id;
      console.log(`Mantendo usuário headmktlucca@gmail.com com UID: ${targetUid}`);
    } else {
      uidsToDelete.push(doc.id);
    }
  }

  // 2. Se o usuário alvo não foi encontrado no Firestore, tentamos buscar no Auth
  if (!targetUid) {
    try {
      const userRecord = await auth.getUserByEmail('headmktlucca@gmail.com');
      targetUid = userRecord.uid;
      console.log(`headmktlucca@gmail.com não tinha doc no Firestore, mas UID encontrado no Auth: ${targetUid}`);
    } catch (e) {
      console.log("Aviso: headmktlucca@gmail.com não foi encontrado nem no Firestore nem no Auth.");
    }
  }

  // 3. Excluir documentos do Firestore (exceto do headmktlucca@gmail.com)
  for (const uid of uidsToDelete) {
    const docRef = db.collection('users').doc(uid);
    console.log(`Excluindo subcoleções de /users/${uid}...`);
    await deleteSubcollections(docRef);
    console.log(`Excluindo doc /users/${uid}...`);
    await docRef.delete();
  }

  // 4. Limpar workspaces do Firestore (/admin_workspaces/{uid})
  const workspacesSnapshot = await db.collection('admin_workspaces').get();
  for (const doc of workspacesSnapshot.docs) {
    if (doc.id !== targetUid) {
      console.log(`Excluindo subcoleções e doc de /admin_workspaces/${doc.id}...`);
      await deleteSubcollections(doc.ref);
      await doc.ref.delete();
    }
  }

  // 5. Excluir contas do Firebase Authentication (exceto headmktlucca@gmail.com)
  console.log("Buscando usuários no Firebase Auth...");
  let nextPageToken;
  let authUsersDeleted = 0;
  
  do {
    const listUsersResult = await auth.listUsers(1000, nextPageToken);
    for (const userRecord of listUsersResult.users) {
      const email = (userRecord.email || '').toLowerCase();
      if (email !== 'headmktlucca@gmail.com' && userRecord.uid !== targetUid) {
        console.log(`Excluindo do Firebase Auth: ${email || 'Sem email'} (${userRecord.uid})`);
        await auth.deleteUser(userRecord.uid);
        authUsersDeleted++;
      }
    }
    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);

  console.log(`\nLimpeza concluída com sucesso!`);
  console.log(`- Usuários excluídos do Firestore: ${uidsToDelete.length}`);
  console.log(`- Usuários excluídos do Firebase Auth: ${authUsersDeleted}`);
  console.log(`- Usuário headmktlucca@gmail.com preservado com sucesso (UID: ${targetUid || 'Não encontrado'}).`);
  process.exit(0);
}

run().catch(err => {
  console.error("Erro fatal durante a limpeza:", err);
  process.exit(1);
});
