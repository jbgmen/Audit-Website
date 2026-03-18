// services/firebaseService.ts
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
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

// ── Firebase config — fill in your values ────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBE4PKZCdmsoImSJpC5k65H0coanvIgI2M",
  authDomain: "velacore-analytics.firebaseapp.com",
  projectId: "velacore-analytics",
  storageBucket: "velacore-analytics.firebasestorage.app",
  messagingSenderId: "630517813658",
  appId: "1:630517813658:web:4654c0323a0eb0a50d6a23",
  measurementId: "G-5ZSV9ZEY67"
};

// Initialize Firebase only once
let app: any;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db   = getFirestore(app);
export const auth = getAuth(app);

export const isFirebaseInitialized = () => !!app && !!db && !!auth;

// ── Auth ─────────────────────────────────────────────────────────────────────
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

// ── User tier ─────────────────────────────────────────────────────────────────
export const updateUserTier = async (userId: string, tier: User['tier']) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { tier, updatedAt: Date.now() });
  } catch {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { tier, updatedAt: Date.now(), createdAt: Date.now() }, { merge: true });
  }
};

// ── Real-time tier watcher ────────────────────────────────────────────────────
// Called when VEC payment is confirmed — vec-subscribe API updates Firestore
// onSnapshot fires instantly, user sees plan change without refresh
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

// ── Sanitize data for Firestore ───────────────────────────────────────────────
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

// ── Audits ────────────────────────────────────────────────────────────────────
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

// ── Payments ──────────────────────────────────────────────────────────────────
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

// ── Licenses ──────────────────────────────────────────────────────────────────
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

// ── Connection test ───────────────────────────────────────────────────────────
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
  signOutUser, updateUserTier, watchUserTier,
  getUserAudits, recordCryptoPayment, getDomainLicenses,
  saveAuditToFirebase, deleteAuditFromFirebase,
  onAuthStateChange, testFirebaseConnection, isFirebaseInitialized
};