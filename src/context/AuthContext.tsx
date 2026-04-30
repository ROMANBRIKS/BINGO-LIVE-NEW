import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      
      let profileUnsub: (() => void) | null = null;

      if (u) {
        const userDocRef = doc(db, 'users', u.uid);
        
        // Use onSnapshot for real-time profile updates
        profileUnsub = onSnapshot(userDocRef, async (snap) => {
          if (snap.exists()) {
            const existingProfile = snap.data() as UserProfile;
            
            // Handle one-time admin promotion if needed
            if (u.email === 'rogershep101@gmail.com' && existingProfile.role !== 'admin') {
              await updateDoc(userDocRef, { role: 'admin' });
            }
            
            setProfile(existingProfile);
            setLoading(false);
          } else {
            // Create new profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: u.uid,
              displayName: u.displayName || 'Anonymous',
              photoURL: u.photoURL || '',
              diamonds: 100,
              beans: 0,
              coins: 0,
              points: 0,
              role: u.email === 'rogershep101@gmail.com' ? 'admin' : 'user',
              nobleTitle: 'None',
              level: 1,
              friends: 0,
              following: 0,
              fans: 0,
              totalDiamondsSpent: 0,
              totalBeansEarned: 0,
              lastNoblePurchaseDate: new Date(),
              referralCode: Math.random().toString(36).substring(7).toUpperCase(),
            };
            await setDoc(userDocRef, newProfile);
            // Profile state will be updated by the next snapshot trigger
          }
        }, (error) => {
          console.error("Error listening to profile:", error);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
      
      return () => {
        if (profileUnsub) profileUnsub();
      };
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Sign in error", e);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
