import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { Snackbar, Alert, Slide, SlideProps } from '@mui/material';

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  showToast: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const refreshNotifications = useCallback(async () => {
    try {
      const items = await api.notifications.getAll(currentUser.id);
      setNotifications(items);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  }, [currentUser.id]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const markAsRead = async (id: string) => {
    await api.notifications.markAsRead(id);
    await refreshNotifications();
  };

  const markAllAsRead = async () => {
    await api.notifications.markAllAsRead(currentUser.id);
    await refreshNotifications();
  };

  const showToast = (message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        showToast,
      }}
    >
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity} 
          variant="filled"
          sx={{ width: '100%', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
