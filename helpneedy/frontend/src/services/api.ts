import { 
  HelpRequest, 
  HelpOffer, 
  OrganizationResource, 
  AppNotification, 
  IncidentReport, 
  AuditLog, 
  User,
  HelpCategory
} from '../types';
import { 
  initialMockRequests, 
  initialMockOffers, 
  initialMockResources, 
  initialMockNotifications, 
  initialMockReports, 
  initialMockAuditLogs,
  mockUsers 
} from './mockData';

// Haversine Distance Calculation (in kilometers)
export function calculateDistanceKm(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Local Storage Helper
const getStoredData = <T>(key: string, defaultData: T): T => {
  try {
    const saved = localStorage.getItem(`disasteraid_${key}`);
    return saved ? JSON.parse(saved) : defaultData;
  } catch (e) {
    return defaultData;
  }
};

const setStoredData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`disasteraid_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to persist to localStorage', e);
  }
};

// Internal Reactive State Store (Backed by localStorage)
class DataStore {
  requests: HelpRequest[];
  offers: HelpOffer[];
  resources: OrganizationResource[];
  notifications: AppNotification[];
  reports: IncidentReport[];
  auditLogs: AuditLog[];

  constructor() {
    this.requests = getStoredData('requests', initialMockRequests);
    this.offers = getStoredData('offers', initialMockOffers);
    this.resources = getStoredData('resources', initialMockResources);
    this.notifications = getStoredData('notifications', initialMockNotifications);
    this.reports = getStoredData('reports', initialMockReports);
    this.auditLogs = getStoredData('auditLogs', initialMockAuditLogs);
  }

  save() {
    setStoredData('requests', this.requests);
    setStoredData('offers', this.offers);
    setStoredData('resources', this.resources);
    setStoredData('notifications', this.notifications);
    setStoredData('reports', this.reports);
    setStoredData('auditLogs', this.auditLogs);
  }

  resetToDefault() {
    this.requests = [...initialMockRequests];
    this.offers = [...initialMockOffers];
    this.resources = [...initialMockResources];
    this.notifications = [...initialMockNotifications];
    this.reports = [...initialMockReports];
    this.auditLogs = [...initialMockAuditLogs];
    this.save();
  }
}

export const db = new DataStore();

// =========================================================
// Transparent API Service Layer
// Mirrors the REST API specification in PRD Section 17
// =========================================================

export const api = {
  // Help Requests API
  requests: {
    async getAll(): Promise<HelpRequest[]> {
      return [...db.requests];
    },

    async getById(id: string): Promise<HelpRequest | null> {
      const req = db.requests.find(r => r.id === id);
      return req ? { ...req } : null;
    },

    async create(data: Omit<HelpRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<HelpRequest> {
      const randomHex = Math.random().toString(16).substring(2, 7).toUpperCase();
      const newRequest: HelpRequest = {
        ...data,
        id: `REQ-${randomHex}`,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.requests.unshift(newRequest);
      
      // Auto-create notification for nearby volunteers
      const notif: AppNotification = {
        id: `NOTIF-${Date.now()}`,
        userId: 'USR-VOL-02',
        type: 'NEW_MATCH',
        title: `New ${newRequest.urgency.toUpperCase()} Aid Request`,
        message: `${newRequest.category.replace('_', ' ').toUpperCase()}: "${newRequest.title}"`,
        targetId: newRequest.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      db.notifications.unshift(notif);

      db.save();
      return newRequest;
    },

    async accept(requestId: string, volunteer: User): Promise<HelpRequest> {
      const idx = db.requests.findIndex(r => r.id === requestId);
      if (idx === -1) throw new Error('Request not found');

      db.requests[idx] = {
        ...db.requests[idx],
        status: 'MATCHED',
        assignedVolunteerId: volunteer.id,
        assignedVolunteerName: volunteer.name,
        assignedVolunteerPhone: volunteer.phone,
        locationVisibility: 'helper_precise',
        updatedAt: new Date().toISOString(),
      };

      // Notify requester
      const notif: AppNotification = {
        id: `NOTIF-${Date.now()}`,
        userId: db.requests[idx].requesterId,
        type: 'REQUEST_ACCEPTED',
        title: 'Volunteer Found for Your Request!',
        message: `${volunteer.name} accepted your request "${db.requests[idx].title}". They have been given your contact details.`,
        targetId: requestId,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      db.notifications.unshift(notif);

      // Add audit log
      db.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        actorId: volunteer.id,
        actorName: volunteer.name,
        actorRole: volunteer.role,
        action: 'ACCEPTED_REQUEST',
        entityType: 'HelpRequest',
        entityId: requestId,
        createdAt: new Date().toISOString(),
      });

      db.save();
      return db.requests[idx];
    },

    async setInProgress(requestId: string): Promise<HelpRequest> {
      const idx = db.requests.findIndex(r => r.id === requestId);
      if (idx === -1) throw new Error('Request not found');

      db.requests[idx] = {
        ...db.requests[idx],
        status: 'IN_PROGRESS',
        updatedAt: new Date().toISOString(),
      };

      db.save();
      return db.requests[idx];
    },

    async fulfill(requestId: string, actorName: string = 'User'): Promise<HelpRequest> {
      const idx = db.requests.findIndex(r => r.id === requestId);
      if (idx === -1) throw new Error('Request not found');

      db.requests[idx] = {
        ...db.requests[idx],
        status: 'FULFILLED',
        updatedAt: new Date().toISOString(),
      };

      // Add notification
      db.notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        userId: db.requests[idx].requesterId,
        type: 'HELP_FULFILLED',
        title: 'Request Marked as Fulfilled',
        message: `Your aid request #${requestId} was marked as fulfilled. Thank you for using DisasterAid Hub!`,
        targetId: requestId,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // Add audit log
      db.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        actorId: 'SYSTEM',
        actorName,
        actorRole: 'REQUESTER',
        action: 'CLOSED_REQUEST',
        entityType: 'HelpRequest',
        entityId: requestId,
        metadata: { status: 'FULFILLED' },
        createdAt: new Date().toISOString(),
      });

      db.save();
      return db.requests[idx];
    },

    async cancel(requestId: string, reason: string = 'User cancelled'): Promise<HelpRequest> {
      const idx = db.requests.findIndex(r => r.id === requestId);
      if (idx === -1) throw new Error('Request not found');

      db.requests[idx] = {
        ...db.requests[idx],
        status: 'CANCELLED',
        updatedAt: new Date().toISOString(),
      };

      db.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        actorId: 'USER',
        actorName: 'Requester',
        actorRole: 'REQUESTER',
        action: 'CANCELLED_REQUEST',
        entityType: 'HelpRequest',
        entityId: requestId,
        metadata: { reason },
        createdAt: new Date().toISOString(),
      });

      db.save();
      return db.requests[idx];
    }
  },

  // Help Offers API
  offers: {
    async getAll(): Promise<HelpOffer[]> {
      return [...db.offers];
    },

    async create(data: Omit<HelpOffer, 'id' | 'createdAt' | 'updatedAt'>): Promise<HelpOffer> {
      const randomHex = Math.random().toString(16).substring(2, 7).toUpperCase();
      const newOffer: HelpOffer = {
        ...data,
        id: `OFF-${randomHex}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.offers.unshift(newOffer);
      db.save();
      return newOffer;
    }
  },

  // Deterministic Nearby Matching Engine (PRD Section 8 & 9)
  matching: {
    async getNearbyRequestsForVolunteer(
      volunteerLocation: { latitude: number; longitude: number },
      volunteerCategories: HelpCategory[],
      serviceRadiusKm: number = 10
    ): Promise<HelpRequest[]> {
      // Find open or matched requests
      const openRequests = db.requests.filter(r => r.status === 'OPEN');

      const scored = openRequests.map(req => {
        const distance = calculateDistanceKm(
          volunteerLocation.latitude,
          volunteerLocation.longitude,
          req.location.latitude,
          req.location.longitude
        );

        // Section 9 Algorithm Scoring:
        // Category match: +50
        // Distance <= 1km: +30, <= 3km: +20, <= 5km: +10
        // Available now: +15
        let score = 0;
        const hasCategory = volunteerCategories.includes(req.category);
        if (hasCategory) score += 50;

        if (distance <= 1) score += 30;
        else if (distance <= 3) score += 20;
        else if (distance <= 5) score += 10;

        // Urgency multiplier
        if (req.urgency === 'critical') score += 25;
        else if (req.urgency === 'urgent') score += 15;

        return {
          ...req,
          distanceKm: distance,
          matchedScore: score,
        };
      });

      // Filter by radius & category, then sort by highest score descending
      return scored
        .filter(r => (r.distanceKm || 0) <= serviceRadiusKm)
        .sort((a, b) => (b.matchedScore || 0) - (a.matchedScore || 0));
    }
  },

  // Organization Resources API
  resources: {
    async getAll(): Promise<OrganizationResource[]> {
      return [...db.resources];
    },

    async updateQuantity(id: string, availableQuantity: number): Promise<OrganizationResource> {
      const idx = db.resources.findIndex(r => r.id === id);
      if (idx === -1) throw new Error('Resource not found');

      db.resources[idx] = {
        ...db.resources[idx],
        availableQuantity,
        lastRestocked: new Date().toISOString(),
      };
      db.save();
      return db.resources[idx];
    },

    async addResource(data: Omit<OrganizationResource, 'id' | 'lastRestocked'>): Promise<OrganizationResource> {
      const newRes: OrganizationResource = {
        ...data,
        id: `RES-${Date.now().toString().slice(-4)}`,
        lastRestocked: new Date().toISOString(),
      };
      db.resources.unshift(newRes);
      db.save();
      return newRes;
    }
  },

  // Notifications API
  notifications: {
    async getAll(userId: string): Promise<AppNotification[]> {
      return db.notifications.filter(n => n.userId === userId || n.userId === 'ALL');
    },

    async markAsRead(id: string): Promise<void> {
      const notif = db.notifications.find(n => n.id === id);
      if (notif) {
        notif.isRead = true;
        db.save();
      }
    },

    async markAllAsRead(userId: string): Promise<void> {
      db.notifications.forEach(n => {
        if (n.userId === userId || n.userId === 'ALL') n.isRead = true;
      });
      db.save();
    }
  },

  // Admin & Analytics API
  admin: {
    async getDashboardStats() {
      const total = db.requests.length;
      const critical = db.requests.filter(r => r.urgency === 'critical' && r.status !== 'FULFILLED').length;
      const fulfilled = db.requests.filter(r => r.status === 'FULFILLED').length;
      const activeVolunteers = db.offers.length;
      const totalResources = db.resources.reduce((sum, r) => sum + r.availableQuantity, 0);

      return {
        totalRequests: total,
        criticalPending: critical,
        fulfilledCount: fulfilled,
        fulfillmentRate: total > 0 ? Math.round((fulfilled / total) * 100) : 0,
        activeVolunteers,
        totalResources,
      };
    },

    async getReports(): Promise<IncidentReport[]> {
      return [...db.reports];
    },

    async getAuditLogs(): Promise<AuditLog[]> {
      return [...db.auditLogs];
    },

    async resolveReport(id: string): Promise<void> {
      const report = db.reports.find(r => r.id === id);
      if (report) {
        report.status = 'RESOLVED';
        db.save();
      }
    }
  },

  // Reset helper
  resetData(): void {
    db.resetToDefault();
  }
};
