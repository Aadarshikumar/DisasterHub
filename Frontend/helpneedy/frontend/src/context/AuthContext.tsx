import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { mockUsers } from '../services/mockData';

interface AuthContextType {
  currentUser: User;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  updateUserLocation: (lat: number, lng: number, address?: string) => void;
  themeMode: 'light' | 'dark';
  toggleThemeMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    return (localStorage.getItem('disasteraid_active_role') as UserRole) || 'REQUESTER';
  });

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('disasteraid_theme') as 'light' | 'dark') || 'light';
  });

  const [userMap, setUserMap] = useState<Record<string, User>>(mockUsers);

  const getActiveUser = (role: UserRole): User => {
    switch (role) {
      case 'VOLUNTEER':
        return userMap.volunteer;
      case 'ORGANIZATION':
        return userMap.organization;
      case 'ADMIN':
      case 'MODERATOR':
        return userMap.admin;
      case 'REQUESTER':
      default:
        return userMap.requester;
    }
  };

  const currentUser = getActiveUser(activeRole);

  const switchRole = (newRole: UserRole) => {
    setActiveRole(newRole);
    localStorage.setItem('disasteraid_active_role', newRole);
  };

  const toggleThemeMode = () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
    localStorage.setItem('disasteraid_theme', next);
  };

  const updateUserLocation = (latitude: number, longitude: number, address?: string) => {
    const roleKey = activeRole.toLowerCase();
    setUserMap(prev => {
      const updatedUser = {
        ...prev[roleKey],
        location: {
          latitude,
          longitude,
          address: address || prev[roleKey]?.location?.address || 'Current Detected Location',
        },
      };
      return {
        ...prev,
        [roleKey]: updatedUser,
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        switchRole,
        updateUserLocation,
        themeMode,
        toggleThemeMode,
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
