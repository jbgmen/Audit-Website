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
  deleteDoc 
} from 'firebase/firestore';
import { 
  getAuth, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { AuditRecord, DomainLicense, CryptoPayment, User } from '../types';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBE4PKZCdmsoImSJpC5k65H0coanvIgI2M",
  authDomain: "velacore-analytics.firebaseapp.com",
  projectId: "velacore-analytics",
  storageBucket: "velacore-analytics.firebasestorage.app",
  messagingSenderId: "630517813658",
  appId: "1:630517813658:web:4654c0323a0eb0a50d6a23",
  measurementId: "G-5ZSV9ZEY67"
};

// Initialize Firebase only once - FIXED
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);

// Helper function to check if Firebase is initialized
export const isFirebaseInitialized = () => {
  return !!app && !!db && !!auth;
};

// Auth state observer
export const onAuthStateChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Sign out function
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

// Update user tier
export const updateUserTier = async (userId: string, tier: User['tier']) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { tier, updatedAt: Date.now() });
  } catch (err) {
    console.warn("User profile sync error, creating/merging record.");
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { 
      tier, 
      updatedAt: Date.now(),
      createdAt: Date.now() 
    }, { merge: true });
  }
};

// Sanitize data for Firestore
const sanitizeDataForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(v => sanitizeDataForFirestore(v));
  } else if (typeof obj === 'object') {
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

// Get user audits
export const getUserAudits = async (userId: string): Promise<AuditRecord[]> => {
  try {
    const auditsRef = collection(db, "audits");
    const q = query(auditsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as AuditRecord));
    return results.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  } catch (error) {
    console.error("Forensic Registry Fetch Error:", error);
    return [];
  }
};

// Record crypto payment
export const recordCryptoPayment = async (payment: Omit<CryptoPayment, 'id'>) => {
  try {
    const paymentId = `PAY-VEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const paymentRef = doc(db, "crypto_payments", paymentId);
    const paymentData = {
      ...payment,
      id: paymentId,
      createdAt: Date.now(),
      status: payment.status || 'pending'
    };
    await setDoc(paymentRef, sanitizeDataForFirestore(paymentData));
    return paymentId;
  } catch (error) {
    console.error("Payment recording error:", error);
    throw error;
  }
};

// Get domain licenses
export const getDomainLicenses = async (userId: string): Promise<DomainLicense[]> => {
  try {
    const licensesRef = collection(db, "licenses");
    const q = query(licensesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as DomainLicense));
  } catch (err) {
    console.error("License Registry Error:", err);
    return [];
  }
};

// Save audit to Firebase
export const saveAuditToFirebase = async (userId: string, record: AuditRecord) => {
  try {
    if (!userId) throw new Error("User ID is required");
    if (!record.id) record.id = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const auditDoc = doc(db, "audits", record.id);
    const cleanData = sanitizeDataForFirestore({ 
      ...record, 
      userId, 
      timestamp: record.timestamp || Date.now(),
      lastModified: Date.now()
    });
    
    await setDoc(auditDoc, cleanData, { merge: true });
    return record.id;
  } catch (err) {
    console.error("Cloud Sync Error:", err);
    throw err;
  }
};

// Delete audit from Firebase
export const deleteAuditFromFirebase = async (auditId: string) => {
  try {
    if (!auditId) throw new Error("Audit ID is required");
    const auditDoc = doc(db, "audits", auditId);
    await deleteDoc(auditDoc);
  } catch (err) {
    console.error("Record Purge Error:", err);
    throw err;
  }
};

// Initialize Firebase connection test
export const testFirebaseConnection = async () => {
  try {
    const testDoc = doc(db, "_test_", "connection-test");
    await setDoc(testDoc, { timestamp: Date.now() }, { merge: true });
    console.log("Firebase connection successful");
    return true;
  } catch (error) {
    console.error("Firebase connection failed:", error);
    return false;
  }
};

// Export all functions as default
export default {
  db,
  auth,
  signOutUser,
  updateUserTier,
  getUserAudits,
  recordCryptoPayment,
  getDomainLicenses,
  saveAuditToFirebase,
  deleteAuditFromFirebase,
  onAuthStateChange,
  testFirebaseConnection,
  isFirebaseInitialized
};