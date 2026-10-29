// src/types/index.ts
// HelpNest Core Type Definitions

export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'user';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DEACTIVATED' | 'DELETED';

export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'REVOKED';

export type PostType = 'REQUEST' | 'OFFER';

export type PostCategory = 
  | 'blood'
  | 'rides'
  | 'education'
  | 'items'
  | 'lostfound'
  | 'events'
  | 'other';

export type UrgencyLevel = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type PostStatus = 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'REMOVED';

export type InteractionStatus = 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export type AppealStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  verifiedAt?: string;
  avatar?: string;
  generalLocation: string; // Aggregate locality (e.g., "Indiranagar, Bengaluru") - NEVER private exact coordinates
  bio?: string;
  organizationLabel?: string;
  createdAt: string;
  lastActiveAt: string;
  mustChangePassword?: boolean;
  isAnonymized?: boolean;
  // New fields for Women‑Only mode
  gender?: 'male' | 'female' | 'other';
  womenOnly?: boolean;
  // Stats summary for quick access
  stats: {
    helpsGiven: number;
    requestsCompleted: number;
    bloodHelps: number;
    rideHelps: number;
    educationHelps: number;
    returnsCompleted: number;
  };
}

export interface Post {
  // ... existing fields ...
  // Optional field indicating the intended gender of the recipient (for Women‑Only mode)
  targetGender?: 'male' | 'female' | 'other';
  id: string;
  type: PostType;
  category: PostCategory;
  urgency: UrgencyLevel;
  status: PostStatus;
  title: string;
  description: string;
  requesterId: string;
  requesterName: string;
  requesterVerified: boolean;
  requesterAvatar?: string;
  location: {
    locality: string;
    city: string;
    approxDistanceKm?: number;
    lat?: number;
    lng?: number;
  };
  fulfillmentTarget?: number;
  fulfillmentCurrent?: number;
  unitLabel?: string; // e.g. "units", "seats", "items"
  images?: string[];
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  editedBy?: {
    type: 'OWNER' | 'ADMINISTRATOR';
    userId: string;
    userName: string;
    timestamp: string;
    reason?: string;
  };
  flagged?: boolean;
  flagReason?: string;
}

export interface Interaction {
  id: string;
  postId: string;
  postTitle: string;
  category: PostCategory;
  requesterId: string;
  helperId: string;
  helperName: string;
  helperAvatar?: string;
  helperVerified: boolean;
  status: InteractionStatus;
  message: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  confirmedByRequester?: boolean;
  confirmedByHelper?: boolean;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or Lucide icon key
  category: PostCategory | 'general';
  metric: 'total_helps' | 'blood_helps' | 'ride_helps' | 'education_helps' | 'return_helps' | 'community_lifeline';
  requiredCount: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  isSpecialManual?: boolean;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
  awardedBy?: 'SYSTEM' | 'ADMIN';
  adminAwardNote?: string;
  currentCount?: number;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'POST' | 'USER' | 'INTERACTION';
  targetId: string;
  targetTitleOrName: string;
  reason: 'INAPPROPRIATE' | 'SPAM' | 'HARASSMENT' | 'FRAUD' | 'SAFETY_VIOLATION' | 'OTHER';
  details: string;
  status: ReportStatus;
  adminNotes?: string;
  resolvedByAdminId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Appeal {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  status: AppealStatus;
  adminNotes?: string;
  reviewedByAdminId?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: 
    | 'ACCOUNT_CREATED'
    | 'PROFILE_UPDATED'
    | 'REQUEST_CREATED'
    | 'OFFER_CREATED'
    | 'REQUEST_EDITED'
    | 'REQUEST_DELETED'
    | 'HELP_OFFERED'
    | 'INTEREST_SUBMITTED'
    | 'OFFER_ACCEPTED'
    | 'OFFER_REJECTED'
    | 'REQUEST_COMPLETED'
    | 'REQUEST_EXPIRED'
    | 'USER_BLOCKED'
    | 'REPORT_SUBMITTED'
    | 'APPEAL_SUBMITTED'
    | 'ACHIEVEMENT_EARNED'
    | 'VERIFICATION_GRANTED'
    | 'VERIFICATION_REVOKED'
    | 'MODERATION_ACTION';
  targetType: 'USER' | 'POST' | 'INTERACTION' | 'REPORT' | 'ACHIEVEMENT';
  targetId: string;
  targetLabel: string;
  category?: PostCategory;
  status?: string;
  isAdminAction: boolean;
  metadata?: Record<string, any>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  action: 
    | 'ADMIN_CREATED_USER'
    | 'ADMIN_BULK_CREATED_USERS'
    | 'ADMIN_EDITED_USER'
    | 'ADMIN_DEACTIVATED_USER'
    | 'ADMIN_SUSPENDED_USER'
    | 'ADMIN_UNSUSPENDED_USER'
    | 'ADMIN_BANNED_USER'
    | 'ADMIN_UNBANNED_USER'
    | 'ADMIN_EDITED_POST'
    | 'ADMIN_REMOVED_POST'
    | 'ADMIN_RESTORED_POST'
    | 'ADMIN_STATUS_CHANGED'
    | 'ADMIN_GRANTED_VERIFICATION'
    | 'ADMIN_REVOKED_VERIFICATION'
    | 'ADMIN_AWARDED_ACHIEVEMENT'
    | 'ADMIN_REVOKED_ACHIEVEMENT'
    | 'ADMIN_RESOLVED_REPORT'
    | 'ADMIN_REVIEWED_APPEAL'
    | 'ADMIN_CONFIG_CHANGED';
  targetType: 'USER' | 'POST' | 'ACHIEVEMENT' | 'REPORT' | 'APPEAL' | 'SYSTEM';
  targetId: string;
  targetDescription: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface BlockedRelationship {
  id: string;
  blockerId: string;
  blockerName: string;
  blockedId: string;
  blockedName: string;
  createdAt: string;
  reason?: string;
}

export interface FeatureFlags {
  PHONE_OTP_ENABLED: boolean;
  EMAIL_NOTIFICATIONS_ENABLED: boolean;
  MAPS_ENABLED: boolean;
  IMAGE_UPLOADS_ENABLED: boolean;
  ORGANIZATIONS_ENABLED: boolean;
  ACHIEVEMENTS_ENABLED: boolean;
}

export type AnalyticsDateRange = 
  | 'TODAY'
  | '7_DAYS'
  | '30_DAYS'
  | '3_MONTHS'
  | '6_MONTHS'
  | '1_YEAR'
  | 'ALL_TIME'
  | 'CUSTOM';
