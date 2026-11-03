import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  auth, 
  db, 
  doc, 
  safeGetDoc as getDoc, 
  safeSetDoc as setDoc, 
  safeUpdateDoc as updateDoc 
} from '../services/firebase';

interface User {
  email: string;
  name?: string;
  class?: string;
  subjects?: string[];
  dob?: string;
  role?: 'user' | 'admin';
  avatar?: string;
  tutorialSeen?: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, userClass: string, subjects: string[]) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync localStorage data to Firestore once
  const syncLocalDataToCloud = async (email: string) => {
    const diaryKey = `ff_diary_${email}`;
    const localDiary = localStorage.getItem(diaryKey);
    if (localDiary) {
      const diaryData = JSON.parse(localDiary);
      await setDoc(doc(db, 'users', email, 'data', 'diary'), { logs: diaryData }, { merge: true });
      localStorage.removeItem(diaryKey);
    }
  };

  useEffect(() => {
    // Safety timeout: If auth takes more than 5 seconds, stop loading so we don't have a blank screen
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("Auth took too long, forcing load...");
        setLoading(false);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth State Changed:", firebaseUser?.email || "No User");
      try {
        if (firebaseUser && firebaseUser.email) {
          // Add a small retry delay if it says we are offline
          let userDoc;
          try {
            userDoc = await getDoc(doc(db, 'users', firebaseUser.email));
          } catch (e: any) {
            if (e.message.includes('offline')) {
              console.warn("Firestore thinks we are offline, retrying once...");
              await new Promise(r => setTimeout(r, 1000));
              userDoc = await getDoc(doc(db, 'users', firebaseUser.email));
            } else throw e;
          }

          if (userDoc?.exists()) {
            setCurrentUser(userDoc.data() as User);
          } else {
            const newUser = { 
              email: firebaseUser.email, 
              name: firebaseUser.email.split('@')[0], 
              role: 'user' as const,
              tutorialSeen: false
            };
            await setDoc(doc(db, 'users', firebaseUser.email), newUser);
            setCurrentUser(newUser);
          }
          await syncLocalDataToCloud(firebaseUser.email);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    // Explicitly fetch user data immediately to avoid race conditions
    const userDoc = await getDoc(doc(db, 'users', email));
    if (userDoc.exists()) {
      setCurrentUser(userDoc.data() as User);
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    if (user && user.email) {
      const userDoc = await getDoc(doc(db, 'users', user.email));
      if (userDoc.exists()) {
        setCurrentUser(userDoc.data() as User);
      } else {
        const newUser: User = { 
          email: user.email, 
          name: user.displayName || user.email.split('@')[0], 
          role: user.email === 'senabhranil7@gmail.com' ? 'admin' : 'user',
          avatar: user.photoURL || undefined,
          tutorialSeen: false
        };
        await setDoc(doc(db, 'users', user.email), newUser);
        setCurrentUser(newUser);
      }
      await syncLocalDataToCloud(user.email);
    }
  };

  const signup = async (email: string, password: string, name: string, userClass: string, subjects: string[]) => {
    await createUserWithEmailAndPassword(auth, email, password);
    const userData: User = { 
      email, 
      name, 
      class: userClass, 
      subjects, 
      role: email === 'senabhranil7@gmail.com' ? 'admin' : 'user',
      tutorialSeen: false
    };
    await setDoc(doc(db, 'users', email), userData);
    setCurrentUser(userData);
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (currentUser?.email) {
      const userRef = doc(db, 'users', currentUser.email);
      await updateDoc(userRef, data);
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, loginWithGoogle, logout, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
