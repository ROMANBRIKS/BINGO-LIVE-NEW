import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { initializeFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, onSnapshot, addDoc, serverTimestamp, Timestamp, getDocFromServer } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
console.log('Firebase initialized with project:', firebaseConfig.projectId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const callFunction = httpsCallable;

// Use long polling to bypass potential websocket issues in the sandbox
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

console.log('Firestore initialized with database:', firebaseConfig.firestoreDatabaseId || '(default)');
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    // Try to reach the server once
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection verified: ONLINE");
  } catch (error) {
    if(error instanceof Error && (error.message.includes('unavailable') || error.message.includes('the client is offline'))) {
      console.warn("Firestore connection: Offline mode (Network unavailable or restricted).");
    } else {
      console.error("Firestore initialization status:", error);
    }
  }
}
