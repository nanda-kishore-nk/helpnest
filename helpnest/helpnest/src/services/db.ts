// src/services/db.ts
// PostgreSQL-Compatible Maintainable Data Layer with Zero-Budget LocalStorage Engine
import { 
  User, 
  Post, 
  Interaction, 
  AchievementDefinition, 
  UserAchievement, 
  Report, 
  Appeal, 
  ActivityEvent, 
  AuditLogEntry, 
  BlockedRelationship,
  VerificationStatus,
  AccountStatus,
  PostCategory,
  UrgencyLevel,
  PostStatus
} from '../types';
import { 
  SEED_USERS, 
  SEED_POSTS, 
  SEED_INTERACTIONS, 
  SEED_ACHIEVEMENT_DEFINITIONS, 
  SEED_USER_ACHIEVEMENTS, 
  SEED_REPORTS, 
  SEED_APPEALS, 
  SEED_BLOCKED, 
  SEED_ACTIVITY_EVENTS, 
  SEED_AUDIT_LOGS 
} from '../data/seedData';
import { evaluateAchievementsOnInteractionComplete } from './achievementEngine';

const STORAGE_KEYS = {
  USERS: 'helpnest_db_users',
  POSTS: 'helpnest_db_posts',
  INTERACTIONS: 'helpnest_db_interactions',
  ACHIEVEMENTS: 'helpnest_db_achievements',
  USER_ACHIEVEMENTS: 'helpnest_db_user_achievements',
  REPORTS: 'helpnest_db_reports',
  APPEALS: 'helpnest_db_appeals',
  BLOCKED: 'helpnest_db_blocked',
  ACTIVITY: 'helpnest_db_activity',
  AUDIT: 'helpnest_db_audit'
};

class HelpNestDatabase {
  private users: User[] = [];
  private posts: Post[] = [];
  private interactions: Interaction[] = [];
  private achievements: AchievementDefinition[] = [];
  private userAchievements: UserAchievement[] = [];
  private reports: Report[] = [];
  private appeals: Appeal[] = [];
  private blocked: BlockedRelationship[] = [];
  private activityLogs: ActivityEvent[] = [];
  private auditLogs: AuditLogEntry[] = [];

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.users = this.loadOrSeed(STORAGE_KEYS.USERS, SEED_USERS);
    this.posts = this.loadOrSeed(STORAGE_KEYS.POSTS, SEED_POSTS);
    this.interactions = this.loadOrSeed(STORAGE_KEYS.INTERACTIONS, SEED_INTERACTIONS);
    this.achievements = this.loadOrSeed(STORAGE_KEYS.ACHIEVEMENTS, SEED_ACHIEVEMENT_DEFINITIONS);
    this.userAchievements = this.loadOrSeed(STORAGE_KEYS.USER_ACHIEVEMENTS, SEED_USER_ACHIEVEMENTS);
    this.reports = this.loadOrSeed(STORAGE_KEYS.REPORTS, SEED_REPORTS);
    this.appeals = this.loadOrSeed(STORAGE_KEYS.APPEALS, SEED_APPEALS);
    this.blocked = this.loadOrSeed(STORAGE_KEYS.BLOCKED, SEED_BLOCKED);
    this.activityLogs = this.loadOrSeed(STORAGE_KEYS.ACTIVITY, SEED_ACTIVITY_EVENTS);
    this.auditLogs = this.loadOrSeed(STORAGE_KEYS.AUDIT, SEED_AUDIT_LOGS);
  }

  private loadOrSeed<T>(key: string, seed: T[]): T[] {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn(`Failed to read ${key} from storage, falling back to seed data.`, e);
    }
    // Save initial seed to storage
    this.persist(key, seed);
    return [...seed];
  }

  private persist<T>(key: string, data: T[]) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to persist ${key} to storage`, e);
    }
  }

  public resetToFactoryDefaults() {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.POSTS);
    localStorage.removeItem(STORAGE_KEYS.INTERACTIONS);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.USER_ACHIEVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.APPEALS);
    localStorage.removeItem(STORAGE_KEYS.BLOCKED);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    this.initialize();
  }

  // ==================== USERS (Section B, E, F, H, I) ====================
  /**
   * Update editable user profile fields.
   * Called by the user (self‑service) or by an admin.
   */
  public updateUserProfile(userId: string, updates: Partial<User>, actor?: User) {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const allowed: (keyof User)[] = [
      'name',
      'phone',
      'bio',
      'avatar',
      'gender',
      'womenOnly',
      'generalLocation',
      'organizationLabel',
    ];
    allowed.forEach((key) => {
      if (key in updates && updates[key] !== undefined) {
        (user as any)[key] = updates[key];
      }
    });

    // Persist changes
    this.persist(STORAGE_KEYS.USERS, this.users);

    // Audit log
    const isAdmin = actor && (actor.role === 'super_admin' || actor.role === 'admin');
    this.logAudit({
      adminId: isAdmin ? actor!.id : undefined,
      adminName: isAdmin ? actor!.name : undefined,
      action: isAdmin ? 'ADMIN_UPDATED_USER' : 'USER_PROFILE_UPDATED',
      targetType: 'USER',
      targetId: user.id,
      targetDescription: `${user.name} profile edit`,
      reason: isAdmin ? 'Admin profile management' : 'User self‑service edit',
      metadata: updates,
    });
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  public getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  /**
   * Section E & F: Create user with secure onboarding.
   * Super Admin creates individual user.
   * Passwords are NEVER shown or stored in plaintext.
   * Returns temporary setup token / invite link metadata.
   */
  public createUser(
    userData: {
      name: string;
      email: string;
      phone?: string;
      role: 'user' | 'moderator' | 'admin';
      organizationLabel?: string;
      verificationStatus?: VerificationStatus;
      verificationNote?: string;
    },
    adminActor: User
  ): { user: User; inviteToken: string; temporaryPassword?: string } {
    const existing = this.getUserByEmail(userData.email);
    if (existing) {
      throw new Error(`An account with email ${userData.email} already exists.`);
    }

    const newId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    // Secure onboarding token
    const inviteToken = `inv_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    // One-time temporary password (never retrievable later)
    const temporaryPassword = `HN-${Math.random().toString(36).substring(2, 8).toUpperCase()}!9`;

    const newUser: User = {
      id: newId,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone?.trim(),
      role: userData.role,
      status: 'ACTIVE',
      verificationStatus: userData.verificationStatus || 'UNVERIFIED',
      verificationNote: userData.verificationNote,
      verifiedAt: userData.verificationStatus === 'VERIFIED' ? new Date().toISOString() : undefined,
      organizationLabel: userData.organizationLabel?.trim(),
      generalLocation: 'Unspecified Locality',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      mustChangePassword: true, // Forces immediate password setup on first login (Section F)
      stats: {
        helpsGiven: 0,
        requestsCompleted: 0,
        bloodHelps: 0,
        rideHelps: 0,
        educationHelps: 0,
        returnsCompleted: 0,
      }
    };

    this.users.unshift(newUser);
    this.persist(STORAGE_KEYS.USERS, this.users);

    // Audit Log (Section S)
    this.logAudit({
      adminId: adminActor.id,
      adminName: adminActor.name,
      action: 'ADMIN_CREATED_USER',
      targetType: 'USER',
      targetId: newUser.id,
      targetDescription: `${newUser.name} (${newUser.email})`,
      reason: 'Administrative user creation',
      metadata: { role: newUser.role, verificationStatus: newUser.verificationStatus }
    });

    // Activity Log (Section D)
    this.logActivity({
      actorId: adminActor.id,
      actorName: adminActor.name,
      actorRole: adminActor.role,
      action: 'ACCOUNT_CREATED',
      targetType: 'USER',
      targetId: newUser.id,
      targetLabel: `Account provisioned for ${newUser.name}`,
      isAdminAction: true,
      metadata: { createdByAdmin: true }
    });

    return { user: newUser, inviteToken, temporaryPassword };
  }

  /**
   * Section G: Bulk account creation
   */
  public bulkCreateUsers(
    rows: Array<{ name: string; email: string; role?: string; organization?: string }>,
    adminActor: User
  ): { createdCount: number; errors: string[] } {
    let createdCount = 0;
    const errors: string[] = [];

    rows.forEach((row, index) => {
      try {
        if (!row.name || !row.email) {
          errors.push(`Row ${index + 1}: Missing name or email`);
          return;
        }
        if (this.getUserByEmail(row.email)) {
          errors.push(`Row ${index + 1}: Email ${row.email} already exists`);
          return;
        }

        const role = (row.role === 'moderator' || row.role === 'admin') ? row.role : 'user';
        this.createUser({
          name: row.name,
          email: row.email,
          role,
          organizationLabel: row.organization,
        }, adminActor);

        createdCount++;
      } catch (err: any) {
        errors.push(`Row ${index + 1}: ${err.message || 'Unknown error'}`);
      }
    });

    if (createdCount > 0) {
      this.logAudit({
        adminId: adminActor.id,
        adminName: adminActor.name,
        action: 'ADMIN_BULK_CREATED_USERS',
        targetType: 'USER',
        targetId: 'bulk',
        targetDescription: `${createdCount} accounts provisioned via CSV bulk upload`,
        reason: 'Organization/Bulk account provisioning',
        metadata: { createdCount, errorsCount: errors.length }
      });
    }

    return { createdCount, errors };
  }

  public updateUser(
    id: string, 
    updates: Partial<Omit<User, 'id' | 'createdAt' | 'stats'>>,
    adminActor?: User,
    reason?: string
  ): User {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    const prev = this.users[index];
    const updated: User = { ...prev, ...updates };
    this.users[index] = updated;
    this.persist(STORAGE_KEYS.USERS, this.users);

    if (adminActor) {
      this.logAudit({
        adminId: adminActor.id,
        adminName: adminActor.name,
        action: 'ADMIN_EDITED_USER',
        targetType: 'USER',
        targetId: updated.id,
        targetDescription: `${updated.name} (${updated.email})`,
        reason: reason || 'Administrative user profile update',
        metadata: { updatedFields: Object.keys(updates) }
      });
    }

    return updated;
  }

  public suspendUser(id: string, reason: string, adminActor: User): User {
    const user = this.getUserById(id);
    if (!user) throw new Error('User not found');
    if (user.role === 'super_admin') throw new Error('Cannot suspend Super Admin');

    user.status = 'SUSPENDED';
    this.persist(STORAGE_KEYS.USERS, this.users);

    this.logAudit({
      adminId: adminActor.id,
      adminName: adminActor.name,
      action: 'ADMIN_SUSPENDED_USER',
      targetType: 'USER',
      targetId: user.id,
      targetDescription: `${user.name} (${user.email})`,
      reason,
      metadata: { previousStatus: 'ACTIVE', newStatus: 'SUSPENDED' }
    });

    this.logActivity({
      actorId: adminActor.id,
      actorName: adminActor.name,
      actorRole: adminActor.role,
      action: 'MODERATION_ACTION',
      targetType: 'USER',
      targetId: user.id,
      targetLabel: `Account suspended for ${user.name}: ${reason}`,
      isAdminAction: true
    });

    return user;
  }

  public unsuspendUser(id: string, reason: string, adminActor: User): User {
    const user = this.getUserById(id);
    if (!user) throw new Error('User not found');

    user.status = 'ACTIVE';
    this.persist(STORAGE_KEYS.USERS, this.users);

    this.logAudit({
      adminId: adminActor.id,
      adminName: adminActor.name,
      action: 'ADMIN_UNSUSPENDED_USER',
      targetType: 'USER',
      targetId: user.id,
      targetDescription: `${user.name} (${user.email})`,
      reason,
      metadata: { previousStatus: 'SUSPENDED', newStatus: 'ACTIVE' }
    });

    return user;
  }

  public banUser(id: string, reason: string, adminActor: User): User {
    const user = this.getUserById(id);
    if (!user) throw new Error('User not found');
    if (user.role === 'super_admin') throw new Error('Cannot ban Super Admin');

    user.status = 'BANNED';
    user.verificationStatus = 'REVOKED';
    this.persist(STORAGE_KEYS.USERS, this.users);

    this.logAudit({
      adminId: adminActor.id,
      adminName: adminActor.name,
      action: 'ADMIN_BANNED_USER',
      targetType: 'USER',
      targetId: user.id,
      targetDescription: `${user.name} (${user.email})`,
      reason,
      metadata: { previousStatus: user.status, newStatus: 'BANNED' }
    });

    this.logActivity({
      actorId: adminActor.id,
      actorName: adminActor.name,
      actorRole: adminActor.role,
      action: 'MODERATION_ACTION',
      targetType: 'USER',
      targetId: user.id,
      targetLabel: `Account permanently banned for ${user.name}: ${reason}`,
      isAdminAction: true
    });

    return user;
  }

  public unbanUser(id: string, reason: string, adminActor: User): User {
    const user = this.getUserById(id);
    if (!user) throw new Error('User not found');

    user.status = 'ACTIVE';
    this.persist(STORAGE_KEYS.USERS, this.users);

    this.logAudit({
      adminId: adminActor.id,
      adminName: adminActor.name,
      action: 'ADMIN_UNBANNED_USER',
      targetType: 'USER',
      targetId: user.id,
      targetDescription: `${user.name} (${user.email})`,
      reason,
      metadata: { previousStatus: 'BANNED', newStatus: 'ACTIVE' }
    });

    return user;
  }

  /**
   * Section H: Soft-delete / Anonymize account.
   * DO NOT blindly cascade-delete associated database records.
   * Preserves moderation history, audit logs, and interaction integrity.
   */
  public deleteUser(id: string, reason: string, adminActor: User): User {
    const user = this.getUserById(id);
    if (!user) throw new Error('User not found');
    if (user.role === 'super_admin') throw new Error('Cannot delete Super Admin');

    // Anonymize personal details while retaining audit integrity
    user.status = 'DELETED';
    user.isAnonymized = true;
    user.name = `[Anonymized User #${user.id.slice(-4)}]`;
    user.email = `anonymized-${user.id.slice(-4)}@deleted.helpnest.internal`;
    user.phone = undefined;
    user.avatar = undefined;
    user.bio = 'This account has been deleted and anonymized. Historical community aid contributions remain preserved.';
    user.verificationStatus = 'UNVERIFIED';

    this.persist(STORAGE_KEYS.USERS, this.users);

    this.logAudit({
      adminId: adminActor.id,
      adminName: adminActor.name,
      action: 'ADMIN_DEACTIVATED_USER',
      targetType: 'USER',
      targetId: user.id,
      targetDescription: user.name,
      reason,
      metadata: { anonymized: true, previousId: id }
    });

    return user;
  }

  /**
   * Section I: Verification system (UNVERIFIED, VERIFIED, REVOKED)
   */
  public updateVerification(
    userId: string, 
    status: VerificationStatus, 
    note: string, 
    adminActor: User
  ): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const previousStatus = user.verificationStatus;
    user.verificationStatus = status;
    user.verificationNote = note;
    user.verifiedAt = status === 'VERIFIED' ? new Date().toISOString() : undefined;

    this.persist(STORAGE_KEYS.USERS, this.users);

    const action = status === 'VERIFIED' ? 'ADMIN_GRANTED_VERIFICATION' : 'ADMIN_REVOKED_VERIFICATION';

    this.logAudit({
      adminId: adminActor.id,
      adminName: adminActor.name,
      action,
      targetType: 'USER',
      targetId: user.id,
      targetDescription: `${user.name} (${user.email})`,
      reason: note,
      metadata: { previousStatus, newStatus: status }
    });

    this.logActivity({
      actorId: adminActor.id,
      actorName: adminActor.name,
      actorRole: adminActor.role,
      action: status === 'VERIFIED' ? 'VERIFICATION_GRANTED' : 'VERIFICATION_REVOKED',
      targetType: 'USER',
      targetId: user.id,
      targetLabel: `${status === 'VERIFIED' ? 'Verification granted to' : 'Verification revoked for'} ${user.name}`,
      isAdminAction: true
    });

    return user;
  }

  // ==================== POSTS & CONTENT (Section C, T) ====================

  public getPosts(): Post[] {
    return [...this.posts];
  }

  public getPostById(id: string): Post | undefined {
    return this.posts.find(p => p.id === id);
  }

  public createPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>, author: User): Post {
    const newPost: Post = {
      ...postData,
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requesterId: author.id,
      requesterName: author.name,
      requesterVerified: author.verificationStatus === 'VERIFIED',
      requesterAvatar: author.avatar
    };

    this.posts.unshift(newPost);
    this.persist(STORAGE_KEYS.POSTS, this.posts);

    this.logActivity({
      actorId: author.id,
      actorName: author.name,
      actorRole: author.role,
      action: newPost.type === 'REQUEST' ? 'REQUEST_CREATED' : 'OFFER_CREATED',
      targetType: 'POST',
      targetId: newPost.id,
      targetLabel: newPost.title,
      category: newPost.category,
      status: newPost.status,
      isAdminAction: false,
    });

    return newPost;
  }

  /**
   * Section C: Admin acting on user content.
   * Explicitly records "Edited by administrator" with admin ID, reason, and timestamp.
   * Never falsifies audit history.
   */
  public adminUpdatePost(
    postId: string, 
    updates: Partial<Post>, 
    adminActor: User, 
    reason: string
  ): Post {
    const index = this.posts.findIndex(p => p.id === postId);
    if (index === -1) throw new Error('Post not found');

    const prev = this.posts[index];
    const updated: Post = {
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
      editedBy: {
        type: 'ADMINISTRATOR',
        userId: adminActor.id,
        userName: adminActor.name,
        timestamp: new Date().toISOString(),
        reason
      }
    };

    this.posts[index] = updated;
    this.persist(STORAGE_KEYS.POSTS, this.posts);

    this.logAudit({
      adminId: adminActor.id,
      adminName: adminActor.name,
      action: 'ADMIN_EDITED_POST',
      targetType: 'POST',
      targetId: updated.id,
      targetDescription: updated.title,
      reason,
      metadata: { updatedFields: Object.keys(updates) }
    });

    return updated;
  }

  public adminRemovePost(postId: string, reason: string, adminActor: User): Post {
    return this.adminUpdatePost(postId, { status: 'REMOVED' }, adminActor, reason);
  }

  public adminRestorePost(postId: string, reason: string, adminActor: User): Post {
    return this.adminUpdatePost(postId, { status: 'ACTIVE' }, adminActor, reason);
  }

  // ==================== INTERACTIONS & MUTUAL AID ====================

  public getInteractions(): Interaction[] {
    return [...this.interactions];
  }

  public offerHelp(
    postId: string, 
    helper: User, 
    message: string
  ): Interaction {
    const post = this.getPostById(postId);
    if (!post) throw new Error('Post not found');

    const interaction: Interaction = {
      id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      postId: post.id,
      postTitle: post.title,
      category: post.category,
      requesterId: post.requesterId,
      helperId: helper.id,
      helperName: helper.name,
      helperAvatar: helper.avatar,
      helperVerified: helper.verificationStatus === 'VERIFIED',
      status: 'OFFERED',
      message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      confirmedByHelper: true
    };

    this.interactions.unshift(interaction);
    this.persist(STORAGE_KEYS.INTERACTIONS, this.interactions);

    this.logActivity({
      actorId: helper.id,
      actorName: helper.name,
      actorRole: helper.role,
      action: 'HELP_OFFERED',
      targetType: 'INTERACTION',
      targetId: interaction.id,
      targetLabel: `${helper.name} offered help on "${post.title}"`,
      category: post.category,
      status: 'OFFERED',
      isAdminAction: false,
    });

    return interaction;
  }

  public acceptInteraction(interactionId: string, requester: User): Interaction {
    const index = this.interactions.findIndex(i => i.id === interactionId);
    if (index === -1) throw new Error('Interaction not found');

    const item = this.interactions[index];
    item.status = 'ACCEPTED';
    item.confirmedByRequester = true;
    item.updatedAt = new Date().toISOString();

    this.interactions[index] = item;
    this.persist(STORAGE_KEYS.INTERACTIONS, this.interactions);

    this.logActivity({
      actorId: requester.id,
      actorName: requester.name,
      actorRole: requester.role,
      action: 'OFFER_ACCEPTED',
      targetType: 'INTERACTION',
      targetId: item.id,
      targetLabel: `Help accepted from ${item.helperName} for "${item.postTitle}"`,
      category: item.category,
      status: 'ACCEPTED',
      isAdminAction: false,
    });

    return item;
  }

  /**
   * Completes a mutual aid interaction and automatically triggers the Achievement Engine (Section J & K).
   * Prevents fake self-closing abuse: helperId must NOT equal requesterId!
   */
  public completeInteraction(interactionId: string, actor: User): Interaction {
    const index = this.interactions.findIndex(i => i.id === interactionId);
    if (index === -1) throw new Error('Interaction not found');

    const item = this.interactions[index];
    item.status = 'COMPLETED';
    item.completedAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();

    this.interactions[index] = item;
    this.persist(STORAGE_KEYS.INTERACTIONS, this.interactions);

    // Update post fulfillment if linked
    const post = this.getPostById(item.postId);
    if (post) {
      post.fulfillmentCurrent = (post.fulfillmentCurrent || 0) + 1;
      if (post.fulfillmentTarget && post.fulfillmentCurrent >= post.fulfillmentTarget) {
        post.status = 'COMPLETED';
        post.completedAt = new Date().toISOString();
      }
      this.persist(STORAGE_KEYS.POSTS, this.posts);
    }

    // Update user stats
    const helper = this.getUserById(item.helperId);
    if (helper) {
      helper.stats.helpsGiven += 1;
      if (item.category === 'blood') helper.stats.bloodHelps += 1;
      if (item.category === 'rides') helper.stats.rideHelps += 1;
      if (item.category === 'education') helper.stats.educationHelps += 1;
      if (item.category === 'lostfound') helper.stats.returnsCompleted += 1;
      this.persist(STORAGE_KEYS.USERS, this.users);

      // Section K: Automatically evaluate achievements
      evaluateAchievementsOnInteractionComplete(
        helper, 
        item, 
        this.achievements, 
        this.userAchievements, 
        (newAchievement) => {
          this.userAchievements.push(newAchievement);
          this.persist(STORAGE_KEYS.USER_ACHIEVEMENTS, this.userAchievements);
          this.logActivity({
            actorId: helper.id,
            actorName: helper.name,
            actorRole: helper.role,
            action: 'ACHIEVEMENT_EARNED',
            targetType: 'ACHIEVEMENT',
            targetId: newAchievement.achievementId,
            targetLabel: `Earned milestone badge on completing community aid`,
            category: item.category,
            isAdminAction: false
          });
        }
      );
    }

    const requester = this.getUserById(item.requesterId);
    if (requester) {
      requester.stats.requestsCompleted += 1;
      this.persist(STORAGE_KEYS.USERS, this.users);
    }

    this.logActivity({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'REQUEST_COMPLETED',
      targetType: 'INTERACTION',
      targetId: item.id,
      targetLabel: `Mutual aid successfully completed: "${item.postTitle}"`,
      category: item.category,
      status: 'COMPLETED',
      isAdminAction: false
    });

    return item;
  }

  // ==================== ACHIEVEMENTS (Section J, K, L) ====================

  public getAchievements(): AchievementDefinition[] {
    return [...this.achievements];
  }

  public getUserAchievements(userId: string): UserAchievement[] {
    return this.userAchievements.filter(ua => ua.userId === userId);
  }

  public getAllUserAchievements(): UserAchievement[] {
    return [...this.userAchievements];
  }

  public createAchievement(def: Omit<AchievementDefinition, 'id' | 'createdAt'>, adminActor: User): AchievementDefinition {
    const newDef: AchievementDefinition = {
      ...def,
      id: `ach_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };

    this.achievements.push(newDef);
    this.persist(STORAGE_KEYS.ACHIEVEMENTS, this.achievements);

    this.logAudit({
      adminId: adminActor.id,
      adminName: adminActor.name,
      action: 'ADMIN_CONFIG_CHANGED',
      targetType: 'ACHIEVEMENT',
      targetId: newDef.id,
      targetDescription: `Created achievement: ${newDef.name} (${newDef.category}, count: ${newDef.requiredCount})`,
      reason: 'Community achievement system configuration',
    });

    return newDef;
  }

  public updateAchievement(
    id: string, 
    updates: Partial<AchievementDefinition>, 
    adminActor: User
  ): AchievementDefinition {
    const index = this.achievements.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Achievement not found');

    const updated = { ...this.achievements[index], ...updates };
    this.achievements[index] = updated;
    this.persist(STORAGE_KEYS.ACHIEVEMENTS, this.achievements);

    this.logAudit({
      adminId: adminActor.id,
      adminName: adminActor.name,
      action: 'ADMIN_CONFIG_CHANGED',
      targetType: 'ACHIEVEMENT',
      targetId: updated.id,
      targetDescription: `Updated achievement: ${updated.name}`,
      reason: 'Administrative achievement threshold / detail change',
    });

    return updated;
  }

  public awardAchievementManually(
    userId: string, 
    achievementId: string, 
    note: string, 
    adminActor: User
  ): UserAchievement {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const ach = this.achievements.find(a => a.id === achievementId);
    if (!ach) throw new Error('Achievement definition not found');

    // Check if already awarded
    const existing = this.userAchievements.find(ua => ua.userId === userId && ua.achievementId === achievementId);
    if (existing) throw new Error('User already has this achievement');

    const awarded: UserAchievement = {
      id: `uach_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      achievementId,
      earnedAt: new Date().toISOString(),
      awardedBy: 'ADMIN',
      adminAwardNote: note
    };

    this.userAchievements.push(awarded);
    this.persist(STORAGE_KEYS.USER_ACHIEVEMENTS, this.userAchievements);

    this.logAudit({
      adminId: adminActor.id,
      adminName: adminActor.name,
      action: 'ADMIN_AWARDED_ACHIEVEMENT',
      targetType: 'ACHIEVEMENT',
      targetId: ach.id,
      targetDescription: `Manually awarded "${ach.name}" to ${user.name}`,
      reason: note,
    });

    return awarded;
  }

  public revokeAchievement(userAchievementId: string, reason: string, adminActor: User): void {
    const index = this.userAchievements.findIndex(ua => ua.id === userAchievementId);
    if (index === -1) throw new Error('User achievement record not found');

    const item = this.userAchievements[index];
    const user = this.getUserById(item.userId);
    const ach = this.achievements.find(a => a.id === item.achievementId);

    this.userAchievements.splice(index, 1);
    this.persist(STORAGE_KEYS.USER_ACHIEVEMENTS, this.userAchievements);

    this.logAudit({
      adminId: adminActor.id,
      adminName: adminActor.name,
      action: 'ADMIN_REVOKED_ACHIEVEMENT',
      targetType: 'ACHIEVEMENT',
      targetId: item.achievementId,
      targetDescription: `Revoked "${ach?.name || item.achievementId}" from ${user?.name || item.userId}`,
      reason,
    });
  }

  // ==================== REPORTS & APPEALS (Section B, Safety) ====================

  public getReports(): Report[] {
    return [...this.reports];
  }

  public createReport(
    reportData: Omit<Report, 'id' | 'createdAt' | 'status' | 'reporterId' | 'reporterName'>, 
    reporter: User
  ): Report {
    const newReport: Report = {
      ...reportData,
      id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      reporterId: reporter.id,
      reporterName: reporter.name,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    this.reports.unshift(newReport);
    this.persist(STORAGE_KEYS.REPORTS, this.reports);

    this.logActivity({
      actorId: reporter.id,
      actorName: reporter.name,
      actorRole: reporter.role,
      action: 'REPORT_SUBMITTED',
      targetType: 'REPORT',
      targetId: newReport.id,
      targetLabel: `Safety report submitted regarding ${newReport.targetTitleOrName}`,
      isAdminAction: false,
    });

    return newReport;
  }

  public resolveReport(
    reportId: string, 
    status: 'RESOLVED' | 'DISMISSED', 
    adminNotes: string, 
    adminActor: User
  ): Report {
    const index = this.reports.findIndex(r => r.id === reportId);
    if (index === -1) throw new Error('Report not found');

    const rep = this.reports[index];
    rep.status = status;
    rep.adminNotes = adminNotes;
    rep.resolvedByAdminId = adminActor.id;
    rep.resolvedAt = new Date().toISOString();

    this.reports[index] = rep;
    this.persist(STORAGE_KEYS.REPORTS, this.reports);

    this.logAudit({
      adminId: adminActor.id,
      adminName: adminActor.name,
      action: 'ADMIN_RESOLVED_REPORT',
      targetType: 'REPORT',
      targetId: rep.id,
      targetDescription: `Report on ${rep.targetTitleOrName} marked as ${status}`,
      reason: adminNotes
    });

    return rep;
  }

  public getAppeals(): Appeal[] {
    return [...this.appeals];
  }

  public createAppeal(userId: string, reason: string): Appeal {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const newAppeal: Appeal = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      reason,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    this.appeals.unshift(newAppeal);
    this.persist(STORAGE_KEYS.APPEALS, this.appeals);

    this.logActivity({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: 'APPEAL_SUBMITTED',
      targetType: 'USER',
      targetId: user.id,
      targetLabel: `Account moderation appeal submitted by ${user.name}`,
      isAdminAction: false
    });

    return newAppeal;
  }

  public reviewAppeal(
    appealId: string, 
    decision: 'APPROVED' | 'REJECTED', 
    notes: string, 
    adminActor: User
  ): Appeal {
    const index = this.appeals.findIndex(a => a.id === appealId);
    if (index === -1) throw new Error('Appeal not found');

    const appeal = this.appeals[index];
    appeal.status = decision;
    appeal.adminNotes = notes;
    appeal.reviewedByAdminId = adminActor.id;
    appeal.reviewedAt = new Date().toISOString();

    this.appeals[index] = appeal;
    this.persist(STORAGE_KEYS.APPEALS, this.appeals);

    // If approved, unsuspend or unban
    if (decision === 'APPROVED') {
      const user = this.getUserById(appeal.userId);
      if (user) {
        user.status = 'ACTIVE';
        this.persist(STORAGE_KEYS.USERS, this.users);
      }
    }

    this.logAudit({
      adminId: adminActor.id,
      adminName: adminActor.name,
      action: 'ADMIN_REVIEWED_APPEAL',
      targetType: 'APPEAL',
      targetId: appeal.id,
      targetDescription: `Appeal by ${appeal.userName} (${appeal.userEmail}) set to ${decision}`,
      reason: notes
    });

    return appeal;
  }

  // ==================== BLOCKED RELATIONSHIPS (Section B) ====================

  public getBlockedRelationships(): BlockedRelationship[] {
    return [...this.blocked];
  }

  // ==================== ACTIVITY & AUDIT LOGS (Section D, S) ====================

  public getActivityLogs(): ActivityEvent[] {
    return [...this.activityLogs];
  }

  public logActivity(event: Omit<ActivityEvent, 'id' | 'timestamp'>): void {
    const newEvent: ActivityEvent = {
      ...event,
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    this.activityLogs.unshift(newEvent);
    // Keep max 500 events
    if (this.activityLogs.length > 500) this.activityLogs.pop();
    this.persist(STORAGE_KEYS.ACTIVITY, this.activityLogs);
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  public logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newEntry);
    this.persist(STORAGE_KEYS.AUDIT, this.auditLogs);
  }
}

// Global Singleton Instance
export const db = new HelpNestDatabase();
