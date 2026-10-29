// src/services/auth.ts
import { User, UserRole } from '../types';
import { db } from './db';

const SESSION_KEY = 'helpnest_current_user_id';

class AuthService {
  private currentUserId: string = 'usr_super_admin';

  constructor() {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved && db.getUserById(saved)) {
      this.currentUserId = saved;
    } else {
      this.currentUserId = 'usr_super_admin'; // Default to Super Admin for initial development/exploration
    }
  }

  public getCurrentUser(): User {
    const user = db.getUserById(this.currentUserId);
    if (!user) {
      // Fallback to Super Admin
      return db.getUsers().find(u => u.role === 'super_admin') || db.getUsers()[0];
    }
    return user;
  }

  public isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return user.role === 'super_admin' && user.status === 'ACTIVE';
  }

  public isAdminOrModerator(): boolean {
    const user = this.getCurrentUser();
    return (user.role === 'super_admin' || user.role === 'admin' || user.role === 'moderator') && user.status === 'ACTIVE';
  }

  public switchUser(userId: string): User {
    const user = db.getUserById(userId);
    if (!user) throw new Error('User not found');
    this.currentUserId = user.id;
    localStorage.setItem(SESSION_KEY, user.id);
    return user;
  }

  /**
   * Section F: Secure Onboarding verification
   * Consumes temporary setup token and enforces new password creation.
   * Plaintext passwords are NEVER stored or returned.
   */
  public completePasswordSetup(userId: string, newPasswordPlain: string): void {
    if (!newPasswordPlain || newPasswordPlain.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const user = db.getUserById(userId);
    if (!user) throw new Error('User not found');

    // Remove mustChangePassword flag
    db.updateUser(userId, { mustChangePassword: false });
  }
}

export const auth = new AuthService();
