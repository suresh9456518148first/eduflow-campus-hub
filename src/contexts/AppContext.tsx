import { useState, createContext, useContext, useEffect, ReactNode } from 'react';
import { initializeData, getCurrentUser, setCurrentUser } from '@/services/dataService';

interface User {
  id: string;
  name: string;
  branch: string;
  year: number;
  email: string;
  xp: number;
  badges: string[];
  attendance: Record<string, number>;
}

interface AppContextType {
  user: User | null;
  setUser: (userId: string) => void;
  isFacultyMode: boolean;
  setFacultyMode: (mode: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isFacultyMode, setFacultyMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    const init = async () => {
      await initializeData();
      const currentUser = getCurrentUser();
      setUserState(currentUser);
      setInitialized(true);
    };
    init();
  }, []);
  
  const setUser = (userId: string) => {
    const newUser = setCurrentUser(userId);
    setUserState(newUser);
  };
  
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse-glow" />
          <p className="text-muted-foreground">Loading EduFlow...</p>
        </div>
      </div>
    );
  }
  
  return (
    <AppContext.Provider value={{ 
      user, 
      setUser, 
      isFacultyMode, 
      setFacultyMode,
      sidebarOpen,
      setSidebarOpen
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
