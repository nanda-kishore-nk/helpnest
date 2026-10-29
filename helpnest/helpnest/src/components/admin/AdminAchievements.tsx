// src/components/admin/AdminAchievements.tsx
import React, { useState } from 'react';
import { AchievementDefinition, User, UserAchievement } from '../../types';
import { db } from '../../services/db';
import { Award, Plus, Edit3, Power, Users, Clock, Check, X, ShieldAlert } from 'lucide-react';

interface AdminAchievementsProps {
  adminActor: User;
}

export const AdminAchievements: React.FC<AdminAchievementsProps> = ({ adminActor }) => {
  const [achievements, setAchievements] = useState<AchievementDefinition[]>(db.getAchievements());
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(db.getAllUserAchievements());
  const [users] = useState<User[]>(db.getUsers());

  // Filter
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Earners modal
  const [earnersModal, setEarnersModal] = useState<{
    isOpen: boolean;
    achievement?: AchievementDefinition;
  }>({
    isOpen: false
  });

  // Create / Edit modal
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    id?: string;
    name: string;
    description: string;
    icon: string;
    category: any;
    metric: any;
    requiredCount: number;
    isActive: boolean;
  }>({
    isOpen: false,
    isEditing: false,
    name: '',
    description: '',
    icon: '🏆',
    category: 'general',
    metric: 'total_helps',
    requiredCount: 1,
    isActive: true
  });

  // Manual Award Modal
  const [manualAwardModal, setManualAwardModal] = useState<{
    isOpen: boolean;
    userId: string;
    achievementId: string;
    note: string;
  }>({
    isOpen: false,
    userId: '',
    achievementId: '',
    note: ''
  });

  const refreshData = () => {
    setAchievements(db.getAchievements());
    setUserAchievements(db.getAllUserAchievements());
  };

  const filtered = achievements.filter(a => categoryFilter === 'ALL' || a.category === categoryFilter);

  const handleSaveAchievement = () => {
    if (!editModal.name.trim() || !editModal.description.trim()) {
      alert('Name and description are required.');
      return;
    }

    if (editModal.isEditing && editModal.id) {
      db.updateAchievement(
        editModal.id,
        {
          name: editModal.name.trim(),
          description: editModal.description.trim(),
          icon: editModal.icon.trim(),
          category: editModal.category,
          metric: editModal.metric,
          requiredCount: Number(editModal.requiredCount),
          isActive: editModal.isActive
        },
        adminActor
      );
    } else {
      db.createAchievement({
        name: editModal.name.trim(),
        description: editModal.description.trim(),
        icon: editModal.icon.trim() || '🏆',
        category: editModal.category,
        metric: editModal.metric,
        requiredCount: Number(editModal.requiredCount),
        isActive: true,
        displayOrder: achievements.length + 1
      }, adminActor);
    }

    setEditModal(prev => ({ ...prev, isOpen: false }));
    refreshData();
  };

  const handleToggleActive = (ach: AchievementDefinition) => {
    db.updateAchievement(ach.id, { isActive: !ach.isActive }, adminActor);
    refreshData();
  };

  const handleExecuteManualAward = () => {
    if (!manualAwardModal.userId || !manualAwardModal.achievementId) {
      alert('Please select both a user and an achievement.');
      return;
    }
    try {
      db.awardAchievementManually(
        manualAwardModal.userId,
        manualAwardModal.achievementId,
        manualAwardModal.note || 'Special administrative recognition',
        adminActor
      );
      setManualAwardModal({ isOpen: false, userId: '', achievementId: '', note: '' });
      refreshData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">Achievement System Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure milestones, thresholds, and view genuine community mutual aid recognition (Sections J, K, L)
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setManualAwardModal({ 
              isOpen: true, 
              userId: users[0]?.id || '', 
              achievementId: achievements[0]?.id || '', 
              note: '' 
            })}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-2 shadow-sm"
          >
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Manually Award Badge</span>
          </button>
          <button
            onClick={() => setEditModal({
              isOpen: true,
              isEditing: false,
              name: '',
              description: '',
              icon: '🏆',
              category: 'general',
              metric: 'total_helps',
              requiredCount: 5,
              isActive: true
            })}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Milestone</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['ALL', 'blood', 'general', 'rides', 'education', 'lostfound'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              categoryFilter === cat
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL' ? 'All Categories' :
             cat === 'blood' ? '🩸 Blood Donation' :
             cat === 'general' ? '🤝 General Help' :
             cat === 'rides' ? '🚗 Rides' :
             cat === 'education' ? '📚 Education' : '🔎 Lost & Found'}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ach) => {
          const earners = userAchievements.filter(ua => ua.achievementId === ach.id);

          return (
            <div 
              key={ach.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
                ach.isActive ? 'border-slate-200/80 hover:shadow-md' : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shadow-inner">
                    {ach.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-display">
                      {ach.name}
                      {!ach.isActive && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">
                          Disabled
                        </span>
                      )}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                      {ach.category} • {ach.requiredCount} {ach.requiredCount === 1 ? 'help' : 'helps'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditModal({
                        isOpen: true,
                        isEditing: true,
                        id: ach.id,
                        name: ach.name,
                        description: ach.description,
                        icon: ach.icon,
                        category: ach.category,
                        metric: ach.metric,
                        requiredCount: ach.requiredCount,
                        isActive: ach.isActive
                      });
                    }}
                    title="Edit Milestone"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(ach)}
                    title={ach.isActive ? 'Disable Achievement' : 'Enable Achievement'}
                    className={`p-1.5 rounded-lg ${ach.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-200'}`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {ach.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setEarnersModal({ isOpen: true, achievement: ach })}
                  className="font-semibold text-indigo-600 hover:underline flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{earners.length} {earners.length === 1 ? 'earner' : 'earners'}</span>
                </button>
                <span className="text-[10px] text-slate-400 font-mono">ID: {ach.id}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== EARNERS MODAL (Section L) ==================== */}
      {earnersModal.isOpen && earnersModal.achievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{earnersModal.achievement.icon}</span>
                <div>
                  <h3 className="text-sm font-bold font-display">{earnersModal.achievement.name}</h3>
                  <p className="text-xs text-indigo-200">Community members who unlocked this badge</p>
                </div>
              </div>
              <button onClick={() => setEarnersModal({ isOpen: false })} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-80 overflow-y-auto space-y-2">
              {userAchievements.filter(ua => ua.achievementId === earnersModal.achievement?.id).length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No community members have earned this badge yet.</p>
              ) : (
                userAchievements
                  .filter(ua => ua.achievementId === earnersModal.achievement?.id)
                  .map(ua => {
                    const earner = users.find(u => u.id === ua.userId);
                    return (
                      <div key={ua.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-900 block">{earner?.name || ua.userId}</span>
                          <span className="text-[10px] text-slate-400">
                            Earned: {new Date(ua.earnedAt).toLocaleDateString()} • {ua.awardedBy === 'ADMIN' ? 'Manual Award' : 'System Awarded'}
                          </span>
                          {ua.adminAwardNote && (
                            <p className="text-[10px] text-indigo-600 mt-0.5">Note: {ua.adminAwardNote}</p>
                          )}
                        </div>

                        {ua.awardedBy === 'ADMIN' && (
                          <button
                            onClick={() => {
                              if (confirm(`Revoke this manual award from ${earner?.name}?`)) {
                                db.revokeAchievement(ua.id, 'Revoked by administrator', adminActor);
                                refreshData();
                              }
                            }}
                            className="text-[10px] text-rose-600 hover:underline"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    );
                  })
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setEarnersModal({ isOpen: false })}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CREATE / EDIT MODAL (Section L) ==================== */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-display">
                  {editModal.isEditing ? 'Edit Milestone Definition' : 'Create New Milestone'}
                </h3>
                <p className="text-xs text-indigo-200">Database-driven achievement engine</p>
              </div>
              <button onClick={() => setEditModal(prev => ({ ...prev, isOpen: false }))} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Icon</label>
                  <input
                    type="text"
                    value={editModal.icon}
                    onChange={(e) => setEditModal(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full text-center text-xl p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Community Hero"
                    value={editModal.name}
                    onChange={(e) => setEditModal(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={editModal.description}
                  onChange={(e) => setEditModal(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  placeholder="e.g. Complete 25 confirmed mutual aids..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editModal.category}
                    onChange={(e) => setEditModal(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="general">General Help</option>
                    <option value="blood">Blood Donation</option>
                    <option value="rides">Rides</option>
                    <option value="education">Education</option>
                    <option value="lostfound">Lost & Found</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Required Threshold</label>
                  <input
                    type="number"
                    min={1}
                    value={editModal.requiredCount}
                    onChange={(e) => setEditModal(prev => ({ ...prev, requiredCount: Number(e.target.value) }))}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Evaluation Metric</label>
                <select
                  value={editModal.metric}
                  onChange={(e) => setEditModal(prev => ({ ...prev, metric: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-mono"
                >
                  <option value="total_helps">total_helps (All categories)</option>
                  <option value="blood_helps">blood_helps (Blood donations)</option>
                  <option value="ride_helps">ride_helps (Carpool/transit aids)</option>
                  <option value="education_helps">education_helps (Tutoring/books)</option>
                  <option value="return_helps">return_helps (Lost items returned)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAchievement}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Save Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MANUAL AWARD MODAL ==================== */}
      {manualAwardModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-display">Manually Award Badge</h3>
                <p className="text-xs text-indigo-200">Recognize extraordinary community contributions</p>
              </div>
              <button onClick={() => setManualAwardModal(prev => ({ ...prev, isOpen: false }))} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select User</label>
                <select
                  value={manualAwardModal.userId}
                  onChange={(e) => setManualAwardModal(prev => ({ ...prev, userId: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Achievement</label>
                <select
                  value={manualAwardModal.achievementId}
                  onChange={(e) => setManualAwardModal(prev => ({ ...prev, achievementId: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  {achievements.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.icon} {a.name} ({a.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Note / Citation</label>
                <textarea
                  value={manualAwardModal.note}
                  onChange={(e) => setManualAwardModal(prev => ({ ...prev, note: e.target.value }))}
                  rows={3}
                  placeholder="e.g. Recognized for emergency flood relief coordination..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 resize-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setManualAwardModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteManualAward}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Grant Badge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
