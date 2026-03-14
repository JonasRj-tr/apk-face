import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSession, FacebookGroup } from '../types';
import { FacebookService } from '../services/FacebookService';

interface AuthContextType {
  user: UserSession | null;
  groups: FacebookGroup[];
  isLoading: boolean;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  loadGroups: () => Promise<void>;
  toggleGroupSelection: (groupId: string) => void;
  selectAllGroups: () => void;
  deselectAllGroups: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [groups, setGroups] = useState<FacebookGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (): Promise<boolean> => {
    try {
      const userSession = await FacebookService.login();
      if (userSession) {
        setUser(userSession);
        await AsyncStorage.setItem('user', JSON.stringify(userSession));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await FacebookService.logout();
      await AsyncStorage.removeItem('user');
      setUser(null);
      setGroups([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const loadGroups = async () => {
    if (!user?.accessToken) return;
    
    try {
      const fetchedGroups = await FacebookService.getGroups(user.accessToken);
      const groupsWithSelection: FacebookGroup[] = fetchedGroups.map((g: any) => ({
        id: g.id,
        name: g.name,
        picture: g.picture?.data?.url,
        selected: false,
      }));
      setGroups(groupsWithSelection);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const toggleGroupSelection = (groupId: string) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, selected: !g.selected } : g
    ));
  };

  const selectAllGroups = () => {
    setGroups(prev => prev.map(g => ({ ...g, selected: true })));
  };

  const deselectAllGroups = () => {
    setGroups(prev => prev.map(g => ({ ...g, selected: false })));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        groups,
        isLoading,
        login,
        logout,
        loadGroups,
        toggleGroupSelection,
        selectAllGroups,
        deselectAllGroups,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
