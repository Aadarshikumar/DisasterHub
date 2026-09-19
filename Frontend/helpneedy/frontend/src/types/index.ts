// ==========================================
// Disaster Help Hub - TypeScript Core Types
// Matches schema specified in flowAndRequirement.md
// ==========================================

export type UserRole = 'REQUESTER' | 'VOLUNTEER' | 'ORGANIZATION' | 'MODERATOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  organizationName?: string;
  avatarUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
  };
  isVerified?: boolean;
  createdAt: string;
}

export type HelpCategory = 
  | 'food'
  | 'water'
  | 'medicine'
  | 'medical_assistance'
  | 'shelter'
  | 'evacuation'
  | 'power'
  | 'other';

export type UrgencyLevel = 'critical' | 'urgent' | 'normal';

export type RequestStatus = 
  | 'OPEN'
  | 'MATCHED'
  | 'IN_PROGRESS'
  | 'FULFILLED'
  | 'CANCELLED'
  | 'EXPIRED';

export type LocationVisibility = 'public_approximate' | 'helper_precise';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  address?: string;
  landmark?: string;
  city?: string;
}

export interface HelpRequest {
  id: string; // e.g. REQ-8F31A
  requesterId: string;
  requesterName: string;
  requesterPhone?: string;
  category: HelpCategory;
  title: string;
  description: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  location: LocationCoordinates;
  locationVisibility: LocationVisibility;
  peopleCount: number;
  imageUrl?: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  assignedVolunteerPhone?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  matchedScore?: number; // Calculated dynamically for volunteer matching
  distanceKm?: number;    // Calculated distance from viewer
}

export interface HelpOffer {
  id: string; // e.g. OFF-44A9B
  volunteerId: string;
  volunteerName: string;
  volunteerPhone: string;
  categories: HelpCategory[];
  description: string;
  location: LocationCoordinates;
  serviceRadiusKm: number; // 1, 3, 5, 10, 25
  isAvailableNow: boolean;
  availableUntil?: string; // e.g. "8:00 PM" or ISO string
  createdAt: string;
  updatedAt: string;
}

export type AssignmentStatus = 
  | 'PROPOSED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Assignment {
  id: string;
  requestId: string;
  volunteerId: string;
  status: AssignmentStatus;
  assignedAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

export type NotificationType = 
  | 'NEW_MATCH'
  | 'REQUEST_ACCEPTED'
  | 'STATUS_CHANGE'
  | 'HELP_FULFILLED'
  | 'BROADCAST_ALERT';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  targetId?: string; // requestId or offerId
  isRead: boolean;
  createdAt: string;
}

export interface OrganizationResource {
  id: string;
  organizationId: string;
  organizationName: string;
  category: HelpCategory;
  resourceName: string; // e.g. "Bottled Water (1L packs)"
  totalQuantity: number;
  availableQuantity: number;
  unit: string; // e.g. "bottles", "meals", "kits", "beds"
  location: LocationCoordinates;
  lastRestocked: string;
}

export interface IncidentReport {
  id: string;
  reportedBy: string;
  targetType: 'request' | 'offer' | 'user';
  targetId: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string; // e.g. "CLOSED_REQUEST", "MODERATED_USER"
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Filter State Interfaces
export interface MapFilterState {
  categories: HelpCategory[];
  urgencies: UrgencyLevel[];
  showRequests: boolean;
  showVolunteers: boolean;
  showOrgResources: boolean;
  radiusKm: number;
}
