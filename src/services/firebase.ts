import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  getDoc, 
  setDoc, 
  updateDoc, 
  getDocs,
  deleteDoc,
  doc,
  collection
} from "firebase/firestore";


// Hardcoded for immediate cloud connection - Fixed casing typo (OdI)
const firebaseConfig = {
  apiKey: "AIzaSyAapOdIkoqvhSyIdVSSwbrKcg988-JEoqY",
  authDomain: "focusflow-a656a.firebaseapp.com",
  projectId: "focusflow-a656a",
  storageBucket: "focusflow-a656a.firebasestorage.app",
  messagingSenderId: "905401244986",
  appId: "1:905401244986:web:ee0b03f467f6fbfd46c403",
  measurementId: "G-6BJPVFQFWD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Re-export common firestore functions for convenience
export { doc, collection };

// Safe Database Wrappers with Timeout to avoid freezing when Firestore is disabled/offline
const TIMEOUT_MS = 2500;
const LOCAL_STORAGE_CACHE_PREFIX = "ff_firestore_cache_";

export const safeGetDoc = async (docRef: any) => {
  const path = docRef.path;
  const cacheKey = `${LOCAL_STORAGE_CACHE_PREFIX}${path}`;
  
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Firestore timeout")), TIMEOUT_MS);
  });
  
  try {
    const docSnap = await Promise.race([getDoc(docRef), timeoutPromise]);
    clearTimeout(timeoutId);
    
    if (docSnap.exists()) {
      localStorage.setItem(cacheKey, JSON.stringify({
        exists: true,
        data: docSnap.data()
      }));
    } else {
      localStorage.setItem(cacheKey, JSON.stringify({
        exists: false,
        data: null
      }));
    }
    
    return docSnap;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`Firestore getDoc failed for path "${path}". Trying cache...`, error);
    
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        exists: () => parsed.exists,
        data: () => parsed.data,
        id: docRef.id
      } as any;
    }
    
    return {
      exists: () => false,
      data: () => null,
      id: docRef.id
    } as any;
  }
};

export const safeSetDoc = async (docRef: any, data: any, options?: any) => {
  const path = docRef.path;
  const cacheKey = `${LOCAL_STORAGE_CACHE_PREFIX}${path}`;
  
  // Optimistically cache locally immediately
  const cached = localStorage.getItem(cacheKey);
  let mergedData = data;
  if (options?.merge && cached) {
    const parsed = JSON.parse(cached);
    if (parsed.exists) {
      mergedData = { ...parsed.data, ...data };
    }
  }
  localStorage.setItem(cacheKey, JSON.stringify({
    exists: true,
    data: mergedData
  }));
  
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Firestore timeout")), TIMEOUT_MS);
  });
  
  try {
    const result = await Promise.race([setDoc(docRef, data, options), timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`Firestore setDoc failed for path "${path}". Saved to local cache.`, error);
    return;
  }
};

export const safeUpdateDoc = async (docRef: any, data: any) => {
  const path = docRef.path;
  const cacheKey = `${LOCAL_STORAGE_CACHE_PREFIX}${path}`;
  
  // Optimistically cache locally immediately
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (parsed.exists) {
      localStorage.setItem(cacheKey, JSON.stringify({
        exists: true,
        data: { ...parsed.data, ...data }
      }));
    }
  }
  
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Firestore timeout")), TIMEOUT_MS);
  });
  
  try {
    const result = await Promise.race([updateDoc(docRef, data), timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`Firestore updateDoc failed for path "${path}". Saved to local cache.`, error);
    return;
  }
};

export const safeGetDocs = async (collectionRef: any) => {
  const path = collectionRef.path;
  const cacheKey = `${LOCAL_STORAGE_CACHE_PREFIX}_coll_${path}`;
  
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Firestore timeout")), TIMEOUT_MS);
  });
  
  try {
    const querySnapshot = await Promise.race([getDocs(collectionRef), timeoutPromise]);
    clearTimeout(timeoutId);
    
    const docsData = querySnapshot.docs.map(d => ({ id: d.id, data: d.data() }));
    localStorage.setItem(cacheKey, JSON.stringify(docsData));
    
    return querySnapshot;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`Firestore getDocs failed for collection "${path}". Trying cache/mock...`, error);
    
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        docs: parsed.map((item: any) => ({
          id: item.id,
          data: () => item.data
        }))
      } as any;
    }
    
    return {
      docs: []
    } as any;
  }
};

export const safeDeleteDoc = async (docRef: any) => {
  const path = docRef.path;
  const cacheKey = `${LOCAL_STORAGE_CACHE_PREFIX}${path}`;
  
  localStorage.removeItem(cacheKey);
  
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Firestore timeout")), TIMEOUT_MS);
  });
  
  try {
    const result = await Promise.race([deleteDoc(docRef), timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`Firestore deleteDoc failed for path "${path}". Removed from local cache.`, error);
    return;
  }
};


