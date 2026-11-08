import { initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  memoryLocalCache,
  type Firestore,
} from 'firebase/firestore';
import { connectStorageEmulator, getStorage, type FirebaseStorage } from 'firebase/storage';
import { parseFirebaseEnv } from '@/config/env';
import { AppError } from '@/lib/errors';

/** Instâncias dos serviços Firebase usados pela aplicação. */
export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
}

/** Portas padrão definidas em `firebase.json`. */
const EMULATOR_HOST = '127.0.0.1';
const EMULATOR_PORTS = { auth: 9099, firestore: 8080, storage: 9199 } as const;

let services: FirebaseServices | null = null;

/**
 * Inicializa (uma única vez) e retorna os serviços Firebase.
 *
 * - Firestore usa cache em memória (sem persistência IndexedDB) nesta versão, para não
 *   manter dados privados no disco de dispositivos compartilhados. Ver ADR-012.
 * - Com `VITE_USE_FIREBASE_EMULATORS=true`, conecta aos emuladores locais.
 *
 * @throws {AppError} quando variáveis obrigatórias de ambiente estão ausentes.
 */
export function getFirebase(): FirebaseServices {
  if (services) {
    return services;
  }

  const env = parseFirebaseEnv(import.meta.env);
  if (!env.ok) {
    throw new AppError('unknown', {
      message: `Variáveis de ambiente ausentes: ${env.missing.join(', ')}`,
    });
  }

  const { useEmulators, ...firebaseConfig } = env.config;
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = initializeFirestore(app, { localCache: memoryLocalCache() });
  const storage = getStorage(app);

  if (useEmulators) {
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`, {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, EMULATOR_HOST, EMULATOR_PORTS.firestore);
    connectStorageEmulator(storage, EMULATOR_HOST, EMULATOR_PORTS.storage);
  }

  services = { app, auth, db, storage };
  return services;
}
