// services/firebaseService.ts
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  getDoc,
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { 
  getAuth, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { AuditRecord, DomainLicense, CryptoPayment, User } from '../types';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: any;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db   = getFirestore(app);
export const auth = getAuth(app);

export const isFirebaseInitialized = () => !!app && !!db && !!auth;

export const onAuthStateChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

export const updateUserTier = async (userId: string, tier: User['tier']) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { tier, updatedAt: Date.now() });
  } catch {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { tier, updatedAt: Date.now(), createdAt: Date.now() }, { merge: true });
  }
};

export const watchUserTier = (
  userId: string,
  onUpdate: (tier: User['tier'], tierExpiresAt: number, vecWallet?: string) => void
): (() => void) => {
  const userRef = doc(db, "users", userId);
  const unsub   = onSnapshot(userRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data.tier) {
        onUpdate(
          data.tier         as User['tier'],
          data.tierExpiresAt as number || 0,
          data.vecWallet    as string  || ''
        );
      }
    }
  }, (err) => {
    console.warn("Tier watcher error:", err.message);
  });
  return unsub;
};

export const getUserProfile = async (userId: string): Promise<{ tier?: string; tierExpiresAt?: number; vecWallet?: string } | null> => {
  try {
    const userRef  = doc(db, 'users', userId);
    const snap     = await getDoc(userRef);
    if (snap.exists()) {
      const d = snap.data();
      return {
        tier:          d.tier          || 'Free',
        tierExpiresAt: d.tierExpiresAt || 0,
        vecWallet:     d.vecWallet     || '',
      };
    }
    return null;
  } catch (err) {
    console.warn('getUserProfile error:', err);
    return null;
  }
};

export const saveUserProfile = async (userId: string, data: Record<string, any>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { ...data, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('saveUserProfile error:', err);
  }
};

const sanitizeDataForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(v => sanitizeDataForFirestore(v));
  if (typeof obj === 'object') {
    if (obj instanceof Date) return obj.toISOString();
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const value = obj[key];
      if (value !== undefined && value !== null) {
        acc[key] = sanitizeDataForFirestore(value);
      }
      return acc;
    }, {});
  }
  return obj;
};

export const getUserAudits = async (userId: string): Promise<AuditRecord[]> => {
  try {
    const auditsRef     = collection(db, "audits");
    const q             = query(auditsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const results       = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as AuditRecord));
    return results.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  } catch (error) {
    console.error("Forensic Registry Fetch Error:", error);
    return [];
  }
};

export const saveAuditToFirebase = async (userId: string, record: AuditRecord) => {
  try {
    if (!userId) throw new Error("User ID is required");
    if (!record.id) record.id = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const auditDoc  = doc(db, "audits", record.id);
    const cleanData = sanitizeDataForFirestore({ ...record, userId, timestamp: record.timestamp || Date.now(), lastModified: Date.now() });
    await setDoc(auditDoc, cleanData, { merge: true });
    return record.id;
  } catch (err) {
    console.error("Cloud Sync Error:", err);
    throw err;
  }
};

export const deleteAuditFromFirebase = async (auditId: string) => {
  try {
    if (!auditId) throw new Error("Audit ID is required");
    await deleteDoc(doc(db, "audits", auditId));
  } catch (err) {
    console.error("Record Purge Error:", err);
    throw err;
  }
};

export const recordCryptoPayment = async (payment: Omit<CryptoPayment, 'id'>) => {
  try {
    const paymentId  = `PAY-VEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const paymentRef = doc(db, "crypto_payments", paymentId);
    await setDoc(paymentRef, sanitizeDataForFirestore({ ...payment, id: paymentId, createdAt: Date.now(), status: payment.status || 'pending' }));
    return paymentId;
  } catch (error) {
    console.error("Payment recording error:", error);
    throw error;
  }
};

export const getDomainLicenses = async (userId: string): Promise<DomainLicense[]> => {
  try {
    const licensesRef   = collection(db, "licenses");
    const q             = query(licensesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as DomainLicense));
  } catch (err) {
    console.error("License Registry Error:", err);
    return [];
  }
};

export const testFirebaseConnection = async () => {
  try {
    await setDoc(doc(db, "_test_", "connection-test"), { timestamp: Date.now() }, { merge: true });
    console.log("Firebase connection successful");
    return true;
  } catch (error) {
    console.error("Firebase connection failed:", error);
    return false;
  }
};

export default {
  db, auth,
  signOutUser, updateUserTier, watchUserTier, getUserProfile, saveUserProfile,
  getUserAudits, recordCryptoPayment, getDomainLicenses,
  saveAuditToFirebase, deleteAuditFromFirebase,
  onAuthStateChange, testFirebaseConnection, isFirebaseInitialized
};
