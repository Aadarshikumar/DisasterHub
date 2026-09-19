import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HelpRequest, HelpCategory, UrgencyLevel, HelpOffer, OrganizationResource } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface RequestContextType {
  requests: HelpRequest[];
  offers: HelpOffer[];
  resources: OrganizationResource[];
  isLoading: boolean;
  selectedRequest: HelpRequest | null;
  setSelectedRequest: (req: HelpRequest | null) => void;
  refreshData: () => Promise<void>;
  createRequest: (data: Omit<HelpRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<HelpRequest>;
  acceptRequest: (requestId: string) => Promise<void>;
  markRequestFulfilled: (requestId: string) => Promise<void>;
  cancelRequest: (requestId: string, reason?: string) => Promise<void>;
  createOffer: (data: Omit<HelpOffer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<HelpOffer>;
  updateResourceStock: (id: string, qty: number) => Promise<void>;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { showToast, refreshNotifications } = useNotifications();

  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [offers, setOffers] = useState<HelpOffer[]>([]);
  const [resources, setResources] = useState<OrganizationResource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reqList, offList, resList] = await Promise.all([
        api.requests.getAll(),
        api.offers.getAll(),
        api.resources.getAll(),
      ]);
      setRequests(reqList);
      setOffers(offList);
      setResources(resList);
    } catch (e) {
      console.error('Failed to load aid hub data', e);
      showToast('Failed to load live data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createRequest = async (data: Omit<HelpRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<HelpRequest> => {
    const created = await api.requests.create(data);
    await refreshData();
    await refreshNotifications();
    showToast(`Help Request #${created.id} submitted successfully! Nearby helpers are being alerted.`, 'success');
    return created;
  };

  const acceptRequest = async (requestId: string) => {
    await api.requests.accept(requestId, currentUser);
    await refreshData();
    await refreshNotifications();
    showToast(`You have accepted request #${requestId}. Coordination channel opened.`, 'success');
  };

  const markRequestFulfilled = async (requestId: string) => {
    await api.requests.fulfill(requestId, currentUser.name);
    await refreshData();
    await refreshNotifications();
    showToast(`Request #${requestId} has been marked as FULFILLED. Thank you!`, 'success');
  };

  const cancelRequest = async (requestId: string, reason?: string) => {
    await api.requests.cancel(requestId, reason);
    await refreshData();
    await refreshNotifications();
    showToast(`Request #${requestId} cancelled.`, 'info');
  };

  const createOffer = async (data: Omit<HelpOffer, 'id' | 'createdAt' | 'updatedAt'>): Promise<HelpOffer> => {
    const created = await api.offers.create(data);
    await refreshData();
    showToast(`Your Volunteer Aid Offer has been activated across ${created.serviceRadiusKm} km!`, 'success');
    return created;
  };

  const updateResourceStock = async (id: string, qty: number) => {
    await api.resources.updateQuantity(id, qty);
    await refreshData();
    showToast('Inventory stock level updated.', 'success');
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        offers,
        resources,
        isLoading,
        selectedRequest,
        setSelectedRequest,
        refreshData,
        createRequest,
        acceptRequest,
        markRequestFulfilled,
        cancelRequest,
        createOffer,
        updateResourceStock,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};
