import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../services/firebase';

// 1. We define exactly what our "Security Guard" will tell the app
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// 2. Create the "Channel" (Context)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. The Provider (This component wraps your whole app)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is the "Listener" that waits for Google to tell us who is logged in
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Once we hear from Google, we can stop loading
    });

    // Cleanup: If the app closes, we stop listening (Hanging up the phone)
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {/* We don't show the app until we've checked the user's status */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 4. A Custom Hook to make "tuning in" to the station easy
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};