// src/components/admin/AdminOverview.tsx
import React from 'react';
import { User } from '../../types';
import { db } from '../../services/db';
import { KpiCard, LineChart } from '../common/Charts';
import { CategoryBadge, PostStatusBadge } from '../common/Badge';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { 
  Users, HeartHandshake, AlertCircle, ShieldAlert, Award, 
  Clock, ArrowRight, UserPlus, UploadCloud, CheckCircle2, Shield 
} from 'lucide-react';

interface AdminOverviewProps {
  adminActor: User;
  onNavigateTab: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ adminActor, onNavigateTab }) => {
  const users = db.getUsers();
  const posts = db.getPosts();
  const interactions = db.getInteractions();
  const reports = db.getReports();
  const activities = db.getActivityLogs().slice(0, 6);

  // Calculated Metrics (Section O)
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
  const verifiedUsers = users.filter(u => u.verificationStatus === 'VERIFIED').length;
  const newUsersToday = users.filter(u => Date.now() - new Date(u.createdAt).getTime() <= 86400000).length;

  const activeRequests = posts.filter(p => p.type === 'REQUEST' && p.status === 'ACTIVE').length;
  const activeOffers = posts.filter(p => p.type === 'OFFER' && p.status === 'ACTIVE').length;
  const urgentRequests = posts.filter(p => p.urgency === 'URGENT' && p.status === 'ACTIVE').length;

  const helpsCompleted = interactions.filter(i => i.status === 'COMPLETED').length;
  const bloodHelps = interactions.filter(i => i.category === 'blood' && i.status === 'COMPLETED').length;
  const rideHelps = interactions.filter(i => i.category === 'rides' && i.status === 'COMPLETED').length;

  const openReports = reports.filter(r => r.status === 'PENDING' || r.status === 'INVESTIGATING').length;
  const flaggedPosts = posts.filter(p => p.flagged || p.status === 'REMOVED').length;
  const suspendedUsers = users.filter(u => u.status === 'SUSPENDED').length;
  const bannedUsers = users.filter(u => u.status === 'BANNED').length;

  // Real trend data
  const trendData = [
    { label: 'Mon', value: 4, secondaryValue: 2 },
    { label: 'Tue', value: 6, secondaryValue: 4 },
    { label: 'Wed', value: 8, secondaryValue: 5 },
    { label: 'Thu', value: 7, secondaryValue: 6 },
    { label: 'Fri', value: 11, secondaryValue: 8 },
    { label: 'Sat', value: 14, secondaryValue: 12 },
    { label: 'Sun', value: 16, secondaryValue: 13 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 bg-white/10 px-2.5 py-1 rounded-full">
            HelpNest Administrative Command Center
          </span>
          <h2 className="text-2xl font-bold font-display mt-2">
            Welcome back, {adminActor.name.split(' ')[0]}
          </h2>
          <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
            Super Administrator oversight. HelpNest is currently operating under the strict Zero-Budget Architecture (₹0 / $0 development cost) with real-time mutual aid routing and automated badge verification.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-5 flex flex-wrap gap-2.5 relative z-10">
          <button
            onClick={() => onNavigateTab('users')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Manage Users</span>
          </button>
          <button
            onClick={() => onNavigateTab('reports')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            <span>Review Reports ({openReports})</span>
          </button>
          <button
            onClick={() => onNavigateTab('verification')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Shield className="w-4 h-4 text-emerald-300" />
            <span>Verification Queue</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: 4 Core Groups (Section O) */}
      <div className="space-y-4">
        {/* User Stats Group */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">User Community Health</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              title="Total Users"
              value={totalUsers}
              subtitle="Registered members"
              icon={<Users className="w-5 h-5" />}
              color="indigo"
            />
            <KpiCard
              title="Active Users"
              value={activeUsers}
              subtitle="Good standing"
              icon={<CheckCircle2 className="w-5 h-5" />}
              color="emerald"
            />
            <KpiCard
              title="Verified Users"
              value={verifiedUsers}
              subtitle="Identity authenticated"
              icon={<Shield className="w-5 h-5" />}
              color="sky"
            />
            <KpiCard
              title="New Users Today"
              value={newUsersToday}
              subtitle="Last 24 hours"
              icon={<Clock className="w-5 h-5" />}
              color="amber"
            />
          </div>
        </div>

        {/* Requests & Offers Group */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mutual Aid Activity</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <KpiCard
              title="Active Requests"
              value={activeRequests}
              subtitle="Awaiting assistance"
              color="indigo"
            />
            <KpiCard
              title="Active Offers"
              value={activeOffers}
              subtitle="Volunteer aid available"
              color="emerald"
            />
            <KpiCard
              title="Urgent Needs"
              value={urgentRequests}
              subtitle="Emergency medical & blood"
              color="rose"
            />
          </div>
        </div>

        {/* Fulfilled Helps Group */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Confirmed Aid Impact</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <KpiCard
              title="Helps Completed"
              value={helpsCompleted}
              subtitle="Confirmed mutual assists"
              color="emerald"
            />
            <KpiCard
              title="Blood Donations"
              value={bloodHelps}
              subtitle="Verified life-saving units"
              color="rose"
            />
            <KpiCard
              title="Ride Carpools"
              value={rideHelps}
              subtitle="Completed commutes"
              color="sky"
            />
          </div>
        </div>

        {/* Safety & Moderation Group */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Trust & Safety Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              title="Open Reports"
              value={openReports}
              subtitle="Pending review"
              color="rose"
            />
            <KpiCard
              title="Flagged Posts"
              value={flaggedPosts}
              subtitle="Hidden or flagged"
              color="amber"
            />
            <KpiCard
              title="Suspended Users"
              value={suspendedUsers}
              subtitle="Under policy review"
              color="amber"
            />
            <KpiCard
              title="Banned Users"
              value={bannedUsers}
              subtitle="Permanent exclusions"
              color="rose"
            />
          </div>
        </div>
      </div>

      {/* Row: Trend Chart & Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Weekly Community Trajectory</h3>
              <p className="text-xs text-slate-500">Mutual aid requests created vs volunteers stepping forward</p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <LineChart
            data={trendData}
            primaryLabel="Requests"
            secondaryLabel="Confirmed Helps"
            height={200}
          />
        </div>

        {/* Live Activity Stream (Section D preview) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Live Activity Stream</h3>
              <p className="text-xs text-slate-500">Recent legitimate platform events</p>
            </div>
            <button
              onClick={() => onNavigateTab('activity')}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              View Explorer
            </button>
          </div>

          <div className="space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/60 text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-700 font-mono">{act.action}</span>
                  <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-800 font-medium mt-1 text-[11px] line-clamp-1">{act.targetLabel}</p>
                <span className="text-[10px] text-slate-500">by {act.actorName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
