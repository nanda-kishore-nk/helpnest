// src/components/admin/AdminUsers.tsx
import React, { useState } from 'react';
import { User, AccountStatus, VerificationStatus, UserRole } from '../../types';
import { db } from '../../services/db';
import { AccountStatusBadge } from '../common/Badge';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { AdminCreateUserModal } from './AdminCreateUserModal';
import { AdminBulkCreateModal } from './AdminBulkCreateModal';
import { 
  Search, Filter, ArrowUpDown, UserPlus, UploadCloud, Shield, 
  Ban, UserX, AlertTriangle, Edit3, Award, Clock, FileText, Check, X, Eye, Users
} from 'lucide-react';

interface AdminUsersProps {
  adminActor: User;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ adminActor }) => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'helpsGiven' | 'lastActiveAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Drawer / Detail modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    consequences: string[];
    isDestructive: boolean;
    requireReason: boolean;
    actionType: 'SUSPEND' | 'UNSUSPEND' | 'BAN' | 'UNBAN' | 'DELETE' | 'REVOKE_VERIFY';
    targetUser?: User;
  }>({
    isOpen: false,
    title: '',
    description: '',
    consequences: [],
    isDestructive: false,
    requireReason: true,
    actionType: 'SUSPEND'
  });

  // Verification modal state
  const [verificationModalState, setVerificationModalState] = useState<{
    isOpen: boolean;
    targetUser?: User;
    status: VerificationStatus;
    note: string;
  }>({
    isOpen: false,
    status: 'VERIFIED',
    note: ''
  });

  // Manual Award Achievement modal state
  const [awardModalState, setAwardModalState] = useState<{
    isOpen: boolean;
    targetUser?: User;
    achievementId: string;
    note: string;
  }>({
    isOpen: false,
    achievementId: '',
    note: ''
  });

  // Edit user profile state
  const [editModalState, setEditModalState] = useState<{
    isOpen: boolean;
    targetUser?: User;
    name: string;
    phone: string;
    generalLocation: string;
    bio: string;
    organizationLabel: string;
  }>({
    isOpen: false,
    name: '',
    phone: '',
    generalLocation: '',
    bio: '',
    organizationLabel: ''
  });

  const refreshData = () => {
    const updatedUsers = db.getUsers();
    setUsers(updatedUsers);
    if (selectedUser) {
      const refreshed = updatedUsers.find(u => u.id === selectedUser.id);
      setSelectedUser(refreshed || null);
    }
  };

  // Filter & Sort
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.organizationLabel && u.organizationLabel.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesVerification = verificationFilter === 'ALL' || u.verificationStatus === verificationFilter;

    return matchesSearch && matchesStatus && matchesRole && matchesVerification;
  }).sort((a, b) => {
    let comp = 0;
    if (sortBy === 'createdAt') comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    else if (sortBy === 'lastActiveAt') comp = new Date(a.lastActiveAt).getTime() - new Date(b.lastActiveAt).getTime();
    else if (sortBy === 'name') comp = a.name.localeCompare(b.name);
    else if (sortBy === 'helpsGiven') comp = a.stats.helpsGiven - b.stats.helpsGiven;
    return sortOrder === 'desc' ? -comp : comp;
  });

  // Action Triggers
  const triggerSuspend = (user: User) => {
    setConfirmationState({
      isOpen: true,
      title: `Suspend Account: ${user.name}`,
      description: 'Suspending an account temporarily halts their ability to create posts or interact with community members.',
      consequences: [
        'User cannot post new requests or offers.',
        'User cannot send new help offers or messages.',
        'Pending interaction threads will be temporarily frozen.',
        'Account is marked as Suspended across public profile views.',
        'Action is logged in the permanent immutable audit trail.'
      ],
      isDestructive: true,
      requireReason: true,
      actionType: 'SUSPEND',
      targetUser: user
    });
  };

  const triggerBan = (user: User) => {
    setConfirmationState({
      isOpen: true,
      title: `Permanently Ban Account: ${user.name}`,
      description: 'Banning is a severe moderation action reserved for malicious behavior, fraud, or harassment.',
      consequences: [
        'User is permanently barred from accessing HelpNest services.',
        'All active posts are immediately removed from community visibility.',
        'Official HelpNest verification is revoked.',
        'Historical moderation, report, and audit records remain permanently stored for safety auditing.',
        'Action is logged in the permanent immutable audit trail.'
      ],
      isDestructive: true,
      requireReason: true,
      actionType: 'BAN',
      targetUser: user
    });
  };

  const triggerDelete = (user: User) => {
    setConfirmationState({
      isOpen: true,
      title: `Deactivate & Anonymize Account: ${user.name}`,
      description: 'Per Section H, HelpNest does NOT blindly cascade-delete records. Personal identity is anonymized while preserving safety, moderation, and aggregate audit integrity.',
      consequences: [
        'User name will be replaced with [Anonymized User #id].',
        'Email, phone, and avatar are permanently wiped from the active profile.',
        'Community mutual aid statistics are preserved in platform totals.',
        'Past moderation records, reports, and audit logs are retained for abuse prevention.',
        'Action is permanent and logged in the immutable audit trail.'
      ],
      isDestructive: true,
      requireReason: true,
      actionType: 'DELETE',
      targetUser: user
    });
  };

  const handleConfirmAction = (reason?: string) => {
    const { actionType, targetUser } = confirmationState;
    if (!targetUser) return;

    if (actionType === 'SUSPEND') {
      db.suspendUser(targetUser.id, reason || 'Administrative suspension', adminActor);
    } else if (actionType === 'UNSUSPEND') {
      db.unsuspendUser(targetUser.id, reason || 'Reinstated by administrator', adminActor);
    } else if (actionType === 'BAN') {
      db.banUser(targetUser.id, reason || 'Violated community guidelines', adminActor);
    } else if (actionType === 'UNBAN') {
      db.unbanUser(targetUser.id, reason || 'Account unbanned following appeal review', adminActor);
    } else if (actionType === 'DELETE') {
      db.deleteUser(targetUser.id, reason || 'User deactivation and anonymization request', adminActor);
    }

    setConfirmationState(prev => ({ ...prev, isOpen: false }));
    refreshData();
  };

  const handleSaveVerification = () => {
    if (!verificationModalState.targetUser) return;
    db.updateVerification(
      verificationModalState.targetUser.id,
      verificationModalState.status,
      verificationModalState.note || 'Verification updated by administrator',
      adminActor
    );
    setVerificationModalState({ isOpen: false, status: 'VERIFIED', note: '' });
    refreshData();
  };

  const handleSaveManualAward = () => {
    if (!awardModalState.targetUser || !awardModalState.achievementId) return;
    try {
      db.awardAchievementManually(
        awardModalState.targetUser.id,
        awardModalState.achievementId,
        awardModalState.note || 'Manually recognized for exceptional community aid',
        adminActor
      );
      setAwardModalState({ isOpen: false, achievementId: '', note: '' });
      refreshData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSaveEditUser = () => {
    if (!editModalState.targetUser) return;
    db.updateUser(
      editModalState.targetUser.id,
      {
        name: editModalState.name,
        phone: editModalState.phone || undefined,
        generalLocation: editModalState.generalLocation,
        bio: editModalState.bio,
        organizationLabel: editModalState.organizationLabel || undefined,
      },
      adminActor,
      'Administrative profile corrections'
    );
    setEditModalState(prev => ({ ...prev, isOpen: false }));
    refreshData();
  };

  // Inspect related user records for drawer
  const userInteractions = selectedUser ? db.getInteractions().filter(i => i.helperId === selectedUser.id || i.requesterId === selectedUser.id) : [];
  const userReportsReceived = selectedUser ? db.getReports().filter(r => r.targetType === 'USER' && r.targetId === selectedUser.id) : [];
  const userReportsSubmitted = selectedUser ? db.getReports().filter(r => r.reporterId === selectedUser.id) : [];
  const userAchievements = selectedUser ? db.getUserAchievements(selectedUser.id) : [];
  const allAchievements = db.getAchievements();
  const userBlockedRelations = selectedUser ? db.getBlockedRelationships().filter(b => b.blockerId === selectedUser.id || b.blockedId === selectedUser.id) : [];
  const userActivity = selectedUser ? db.getActivityLogs().filter(a => a.actorId === selectedUser.id) : [];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">User Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer accounts, verification badges, moderation states, and organizational callsets
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-indigo-600" />
            <span>Bulk CSV Import</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by user name, email, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BANNED">Banned</option>
              <option value="DELETED">Deleted/Anonymized</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>

            {/* Verification Filter */}
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Verification</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="UNVERIFIED">Unverified Only</option>
              <option value="REVOKED">Revoked Only</option>
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              title={`Sorted ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Verification</th>
                <th className="py-3.5 px-3">Helps Given</th>
                <th className="py-3.5 px-3">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No users match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-slate-600 text-xs">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {user.verificationStatus === 'VERIFIED' && (
                              <VerifiedBadge 
                                userName={user.name} 
                                verifiedAt={user.verifiedAt} 
                                verificationNote={user.verificationNote} 
                              />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                          {user.organizationLabel && (
                            <div className="text-[10px] text-indigo-600 font-medium">{user.organizationLabel}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' :
                        user.role === 'moderator' ? 'bg-sky-100 text-sky-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <AccountStatusBadge status={user.status} />
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        user.verificationStatus === 'VERIFIED' ? 'text-indigo-700 font-bold' :
                        user.verificationStatus === 'REVOKED' ? 'text-rose-600' :
                        'text-slate-400'
                      }`}>
                        {user.verificationStatus === 'VERIFIED' && '✓ Verified'}
                        {user.verificationStatus === 'UNVERIFIED' && 'Unverified'}
                        {user.verificationStatus === 'REVOKED' && 'Revoked'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      {user.stats.helpsGiven} helps
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUser(user)}
                          title="Inspect User Details & Timeline"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditModalState({
                              isOpen: true,
                              targetUser: user,
                              name: user.name,
                              phone: user.phone || '',
                              generalLocation: user.generalLocation,
                              bio: user.bio || '',
                              organizationLabel: user.organizationLabel || '',
                            });
                          }}
                          title="Edit User Fields"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Verification quick button */}
                        <button
                          onClick={() => {
                            setVerificationModalState({
                              isOpen: true,
                              targetUser: user,
                              status: user.verificationStatus === 'VERIFIED' ? 'REVOKED' : 'VERIFIED',
                              note: user.verificationNote || ''
                            });
                          }}
                          title={user.verificationStatus === 'VERIFIED' ? 'Revoke Verification' : 'Grant Verification'}
                          className={`p-1.5 rounded-lg ${user.verificationStatus === 'VERIFIED' ? 'text-amber-600 hover:bg-amber-50' : 'text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          <Shield className="w-4 h-4" />
                        </button>

                        {/* Suspend / Unsuspend */}
                        {user.role !== 'super_admin' && (
                          user.status === 'SUSPENDED' ? (
                            <button
                              onClick={() => {
                                setConfirmationState({
                                  isOpen: true,
                                  title: `Unsuspend Account: ${user.name}`,
                                  description: 'Restore normal account privileges and allow user to interact on HelpNest.',
                                  consequences: ['User can resume posting requests and offering mutual aid.'],
                                  isDestructive: false,
                                  requireReason: true,
                                  actionType: 'UNSUSPEND',
                                  targetUser: user
                                });
                              }}
                              title="Unsuspend User"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => triggerSuspend(user)}
                              title="Suspend User"
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          )
                        )}

                        {/* Ban / Delete */}
                        {user.role !== 'super_admin' && user.status !== 'DELETED' && (
                          <button
                            onClick={() => triggerBan(user)}
                            title="Ban User"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== USER PROFILE DRAWER (Section B) ==================== */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center font-bold text-base">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedUser.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold font-display flex items-center gap-2">
                    {selectedUser.name}
                    {selectedUser.verificationStatus === 'VERIFIED' && <VerifiedBadge />}
                  </h3>
                  <p className="text-xs text-indigo-200 font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Tabs & Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Account Overview Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Account Status</span>
                  <div className="mt-1"><AccountStatusBadge status={selectedUser.status} /></div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Verification Status</span>
                  <div className="mt-1 font-bold text-xs text-indigo-700">{selectedUser.verificationStatus}</div>
                  {selectedUser.verificationNote && (
                    <p className="text-[10px] text-slate-500 mt-0.5">{selectedUser.verificationNote}</p>
                  )}
                </div>
              </div>

              {/* General Metadata */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">General Locality:</span>
                  <span className="font-semibold text-slate-800">{selectedUser.generalLocation}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Organization / Campus:</span>
                  <span className="font-semibold text-indigo-600">{selectedUser.organizationLabel || 'None'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Member Since:</span>
                  <span className="text-slate-700">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Last Activity:</span>
                  <span className="text-slate-700">{new Date(selectedUser.lastActiveAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Community Aid Impact Stats (Section B) */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Mutual Aid Summary</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-center">
                    <span className="text-base font-bold text-indigo-700 font-display">{selectedUser.stats.helpsGiven}</span>
                    <span className="text-[10px] text-slate-500 block">Helps Given</span>
                  </div>
                  <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100 text-center">
                    <span className="text-base font-bold text-rose-700 font-display">{selectedUser.stats.bloodHelps}</span>
                    <span className="text-[10px] text-slate-500 block">Blood Helps</span>
                  </div>
                  <div className="p-2.5 bg-sky-50/60 rounded-xl border border-sky-100 text-center">
                    <span className="text-base font-bold text-sky-700 font-display">{selectedUser.stats.rideHelps}</span>
                    <span className="text-[10px] text-slate-500 block">Ride Helps</span>
                  </div>
                </div>
              </div>

              {/* Achievements Showcase (Section B & L) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Achievements ({userAchievements.length})</h4>
                  <button
                    onClick={() => setAwardModalState({ isOpen: true, targetUser: selectedUser, achievementId: allAchievements[0]?.id || '', note: '' })}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Manually Award
                  </button>
                </div>
                {userAchievements.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl text-center">No achievements unlocked yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userAchievements.map(ua => {
                      const def = allAchievements.find(a => a.id === ua.achievementId);
                      return (
                        <div key={ua.id} className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-xs">
                          <span className="text-base">{def?.icon || '🏆'}</span>
                          <div>
                            <span className="font-bold text-slate-800 block text-[11px]">{def?.name || ua.achievementId}</span>
                            <span className="text-[9px] text-slate-400">{new Date(ua.earnedAt).toLocaleDateString()}</span>
                          </div>
                          {ua.awardedBy === 'ADMIN' && (
                            <button
                              onClick={() => {
                                if (confirm(`Revoke achievement "${def?.name}" from ${selectedUser.name}?`)) {
                                  db.revokeAchievement(ua.id, 'Revoked by administrator', adminActor);
                                  refreshData();
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 ml-1 p-0.5"
                              title="Revoke Manually Awarded Achievement"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Blocked Relations for Moderation (Section B) */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Blocked Relationships ({userBlockedRelations.length})</h4>
                {userBlockedRelations.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl text-center">No active user blocks</p>
                ) : (
                  <div className="space-y-1.5">
                    {userBlockedRelations.map(b => (
                      <div key={b.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-slate-800">
                            {b.blockerId === selectedUser.id ? `Blocked ${b.blockedName}` : `Blocked by ${b.blockerName}`}
                          </span>
                          {b.reason && <p className="text-[10px] text-slate-500 mt-0.5">{b.reason}</p>}
                        </div>
                        <span className="text-[10px] text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Moderation History & Reports (Section B) */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Safety & Reports History</h4>
                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs flex justify-between">
                    <span className="text-slate-600">Reports Received against User:</span>
                    <span className={`font-bold ${userReportsReceived.length > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {userReportsReceived.length}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs flex justify-between">
                    <span className="text-slate-600">Reports Submitted by User:</span>
                    <span className="font-bold text-slate-800">{userReportsSubmitted.length}</span>
                  </div>
                </div>
              </div>

              {/* Timeline (Section B) */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Account Activity Timeline
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {userActivity.length === 0 ? (
                    <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl text-center">No recent logged activity</p>
                  ) : (
                    userActivity.map(act => (
                      <div key={act.id} className="p-2.5 bg-slate-50/70 border border-slate-200/70 rounded-xl text-xs">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-700">{act.action}</span>
                          <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5 text-[11px]">{act.targetLabel}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2 justify-end">
              {selectedUser.role !== 'super_admin' && (
                <>
                  {selectedUser.status === 'SUSPENDED' ? (
                    <button
                      onClick={() => {
                        db.unsuspendUser(selectedUser.id, 'Administrative reinstatement', adminActor);
                        refreshData();
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Unsuspend
                    </button>
                  ) : (
                    <button
                      onClick={() => triggerSuspend(selectedUser)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Suspend
                    </button>
                  )}

                  {selectedUser.status !== 'BANNED' && (
                    <button
                      onClick={() => triggerBan(selectedUser)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Ban
                    </button>
                  )}

                  {selectedUser.status !== 'DELETED' && (
                    <button
                      onClick={() => triggerDelete(selectedUser)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                    >
                      Deactivate / Anonymize
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== CREATE & BULK CREATE MODALS ==================== */}
      <AdminCreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        adminActor={adminActor}
        onUserCreated={() => refreshData()}
      />

      <AdminBulkCreateModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        adminActor={adminActor}
        onBulkComplete={() => refreshData()}
      />

      {/* ==================== CONFIRMATION MODAL ==================== */}
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        title={confirmationState.title}
        description={confirmationState.description}
        consequences={confirmationState.consequences}
        isDestructive={confirmationState.isDestructive}
        requireReason={confirmationState.requireReason}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmationState(prev => ({ ...prev, isOpen: false }))}
      />

      {/* ==================== VERIFICATION MODAL ==================== */}
      {verificationModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Manage Verification Status: {verificationModalState.targetUser?.name}
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={verificationModalState.status}
                onChange={(e) => setVerificationModalState(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              >
                <option value="VERIFIED">VERIFIED (Official Badge)</option>
                <option value="UNVERIFIED">UNVERIFIED</option>
                <option value="REVOKED">REVOKED (Sanctioned / Withdrawn)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Reason / Note</label>
              <textarea
                value={verificationModalState.note}
                onChange={(e) => setVerificationModalState(prev => ({ ...prev, note: e.target.value }))}
                rows={3}
                placeholder="Hospital accreditation checked, ID verified, etc."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setVerificationModalState(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVerification}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MANUAL AWARD MODAL ==================== */}
      {awardModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Manually Award Achievement to {awardModalState.targetUser?.name}
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Achievement</label>
              <select
                value={awardModalState.achievementId}
                onChange={(e) => setAwardModalState(prev => ({ ...prev, achievementId: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              >
                {allAchievements.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {a.name} ({a.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Award Note</label>
              <textarea
                value={awardModalState.note}
                onChange={(e) => setAwardModalState(prev => ({ ...prev, note: e.target.value }))}
                rows={3}
                placeholder="Reason for special manual achievement..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAwardModalState(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveManualAward}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Award Achievement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EDIT USER MODAL ==================== */}
      {editModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Edit User: {editModalState.targetUser?.name}
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={editModalState.name}
                onChange={(e) => setEditModalState(prev => ({ ...prev, name: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={editModalState.phone}
                onChange={(e) => setEditModalState(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">General Locality</label>
              <input
                type="text"
                value={editModalState.generalLocation}
                onChange={(e) => setEditModalState(prev => ({ ...prev, generalLocation: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Label</label>
              <input
                type="text"
                value={editModalState.organizationLabel}
                onChange={(e) => setEditModalState(prev => ({ ...prev, organizationLabel: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditModalState(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditUser}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
