// src/components/user/UserProfile.tsx
import React, { useState } from 'react';
import { User, Post, Interaction } from '../../types';
import { db } from '../../services/db';
import { calculateCategoryMilestone } from '../../services/achievementEngine';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { CategoryBadge, PostStatusBadge, UrgencyBadge } from '../common/Badge';
import { 
  HeartHandshake, Award, Clock, MapPin, Calendar, 
  CheckCircle2, FileQuestion, Gift, History, Bookmark, Edit2 
} from 'lucide-react';

interface UserProfileProps {
  currentUser: User;
  onOpenPost: (post: Post) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ currentUser, onOpenPost }) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'offers' | 'helps' | 'history' | 'achievements'>('achievements');

  const allPosts = db.getPosts();
  const allInteractions = db.getInteractions();
  const allAchievements = db.getAchievements();
  const userAchievements = db.getUserAchievements(currentUser.id);

  // Tab data
  const myRequests = allPosts.filter(p => p.requesterId === currentUser.id && p.type === 'REQUEST');
  const myOffers = allPosts.filter(p => p.requesterId === currentUser.id && p.type === 'OFFER');
  const myHelps = allInteractions.filter(i => i.helperId === currentUser.id);
  const myHistory = allInteractions.filter(i => (i.helperId === currentUser.id || i.requesterId === currentUser.id) && i.status === 'COMPLETED');

  // Milestone Progress calculations (Section M)
  const generalMilestone = calculateCategoryMilestone(currentUser, 'general', allAchievements, userAchievements);
  const bloodMilestone = calculateCategoryMilestone(currentUser, 'blood', allAchievements, userAchievements);
  const rideMilestone = calculateCategoryMilestone(currentUser, 'rides', allAchievements, userAchievements);
  const eduMilestone = calculateCategoryMilestone(currentUser, 'education', allAchievements, userAchievements);
  const lostMilestone = calculateCategoryMilestone(currentUser, 'lostfound', allAchievements, userAchievements);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Profile Header Card (Section U) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-2xl flex items-center justify-center overflow-hidden shadow-md flex-shrink-0">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-display text-slate-900">{currentUser.name}</h1>
                {currentUser.verificationStatus === 'VERIFIED' && (
                  <VerifiedBadge 
                    userName={currentUser.name} 
                    verifiedAt={currentUser.verifiedAt} 
                    verificationNote={currentUser.verificationNote} 
                    showText={true}
                  />
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.generalLocation}</span>
                {currentUser.organizationLabel && (
                  <span className="text-indigo-600 font-semibold">• {currentUser.organizationLabel}</span>
                )}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Member since {new Date(currentUser.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
              </p>
            </div>
          </div>
        </div>

        {currentUser.bio && (
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {currentUser.bio}
          </p>
        )}

        {/* Community Impact Counters (Section U) */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Community Impact</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100/80 text-center">
              <span className="text-2xl font-bold text-indigo-700 font-display block">
                {currentUser.stats.helpsGiven}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 mt-0.5 block">Helps Given</span>
            </div>
            <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100/80 text-center">
              <span className="text-2xl font-bold text-rose-700 font-display block">
                {currentUser.stats.bloodHelps}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 mt-0.5 block">Blood Helps</span>
            </div>
            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100/80 text-center">
              <span className="text-2xl font-bold text-sky-700 font-display block">
                {currentUser.stats.rideHelps}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 mt-0.5 block">Ride Shares</span>
            </div>
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 text-center">
              <span className="text-2xl font-bold text-emerald-700 font-display block">
                {currentUser.stats.requestsCompleted}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 mt-0.5 block">Requests Met</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Section Tabs (Section U) */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'achievements', label: 'Achievements & Milestones', count: userAchievements.length },
          { id: 'requests', label: 'My Requests', count: myRequests.length },
          { id: 'offers', label: 'My Offers', count: myOffers.length },
          { id: 'helps', label: 'Helps Given', count: myHelps.length },
          { id: 'history', label: 'History', count: myHistory.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-t-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content Panes */}
      <div className="min-h-[300px]">
        {/* ==================== ACHIEVEMENTS TAB (Section M) ==================== */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Milestone Progress Cards (Section M Real Progress Bar) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Milestone Progression (Section M)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Clear progress towards your next community recognition badge
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* General Help Milestone */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {generalMilestone.currentAchievement?.name || '🤝 Mutual Aid Contributor'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {generalMilestone.currentCount} / {generalMilestone.requiredCount} confirmed helps
                      </span>
                    </div>
                    <span className="font-bold text-indigo-600 font-display">
                      {generalMilestone.percentage}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full transition-all duration-500"
                      style={{ width: `${generalMilestone.percentage}%` }}
                    />
                  </div>

                  {!generalMilestone.unlockedAll && generalMilestone.nextAchievement ? (
                    <p className="text-[11px] text-indigo-700 font-medium">
                      {generalMilestone.remainingCount} more helps to unlock <span className="font-bold">{generalMilestone.nextAchievement.name}</span>.
                    </p>
                  ) : (
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      All general mutual aid milestones unlocked!
                    </p>
                  )}
                </div>

                {/* Blood Donation Milestone */}
                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-rose-900 block">
                        {bloodMilestone.currentAchievement?.name || '🩸 First Blood Donor'}
                      </span>
                      <span className="text-[11px] text-rose-700">
                        {bloodMilestone.currentCount} / {bloodMilestone.requiredCount} blood donations
                      </span>
                    </div>
                    <span className="font-bold text-rose-700 font-display">
                      {bloodMilestone.percentage}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-rose-200/80 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-rose-500 to-rose-700 rounded-full transition-all duration-500"
                      style={{ width: `${bloodMilestone.percentage}%` }}
                    />
                  </div>

                  {!bloodMilestone.unlockedAll && bloodMilestone.nextAchievement ? (
                    <p className="text-[11px] text-rose-800 font-medium">
                      {bloodMilestone.remainingCount} more donations to unlock <span className="font-bold">{bloodMilestone.nextAchievement.name}</span>.
                    </p>
                  ) : (
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      All blood donation badges unlocked!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Badges Grid (Section M) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold font-display text-slate-900">
                Community Badges ({userAchievements.length} Unlocked)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {allAchievements.map(ach => {
                  const earned = userAchievements.find(ua => ua.achievementId === ach.id);

                  return (
                    <div 
                      key={ach.id}
                      className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                        earned 
                          ? 'bg-white border-slate-200/90 shadow-xs' 
                          : 'bg-slate-50/50 border-slate-200/60 opacity-50 grayscale'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                        {ach.icon}
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <span className="font-bold text-slate-900 block font-display">{ach.name}</span>
                        <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{ach.description}</p>
                        {earned ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded inline-block mt-1">
                            Earned {new Date(earned.earnedAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400 block mt-1">
                            Requires {ach.requiredCount} {ach.requiredCount === 1 ? 'help' : 'helps'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== MY REQUESTS TAB ==================== */}
        {activeTab === 'requests' && (
          <div className="space-y-3">
            {myRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center text-slate-400 border border-slate-200">
                You haven't posted any help requests yet.
              </div>
            ) : (
              myRequests.map(post => (
                <div 
                  key={post.id} 
                  onClick={() => onOpenPost(post)}
                  className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={post.category} />
                      <UrgencyBadge urgency={post.urgency} />
                      <PostStatusBadge status={post.status} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 font-display">{post.title}</h4>
                    <span className="text-[11px] text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 hover:underline">View</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* ==================== MY OFFERS TAB ==================== */}
        {activeTab === 'offers' && (
          <div className="space-y-3">
            {myOffers.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center text-slate-400 border border-slate-200">
                You haven't posted any volunteer offers yet.
              </div>
            ) : (
              myOffers.map(post => (
                <div 
                  key={post.id} 
                  onClick={() => onOpenPost(post)}
                  className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={post.category} />
                      <PostStatusBadge status={post.status} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 font-display">{post.title}</h4>
                    <span className="text-[11px] text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 hover:underline">View</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* ==================== HELPS GIVEN TAB ==================== */}
        {activeTab === 'helps' && (
          <div className="space-y-3">
            {myHelps.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center text-slate-400 border border-slate-200">
                No help offers recorded yet.
              </div>
            ) : (
              myHelps.map(item => (
                <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900">{item.postTitle}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                      item.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-sky-100 text-sky-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-600 italic">"{item.message}"</p>
                  <span className="text-[10px] text-slate-400 block">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* ==================== HISTORY TAB ==================== */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {myHistory.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center text-slate-400 border border-slate-200">
                No completed mutual aid records yet.
              </div>
            ) : (
              myHistory.map(item => (
                <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{item.postTitle}</span>
                    <span className="text-[11px] text-slate-500">
                      Completed on {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'Confirmed'}
                    </span>
                  </div>
                  <CategoryBadge category={item.category} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
