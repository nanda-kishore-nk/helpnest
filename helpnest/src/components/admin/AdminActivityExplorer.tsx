// src/components/admin/AdminActivityExplorer.tsx
import React, { useState } from 'react';
import { ActivityEvent, User, PostCategory } from '../../types';
import { db } from '../../services/db';
import { CategoryBadge } from '../common/Badge';
import { 
  Activity, Search, Filter, ShieldCheck, Clock, UserCheck, 
  Eye, Calendar, CheckCircle2, AlertTriangle, Shield 
} from 'lucide-react';

interface AdminActivityExplorerProps {
  adminActor: User;
}

export const AdminActivityExplorer: React.FC<AdminActivityExplorerProps> = ({ adminActor }) => {
  const [activities] = useState<ActivityEvent[]>(db.getActivityLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [adminOnlyFilter, setAdminOnlyFilter] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<'TODAY' | '7_DAYS' | '30_DAYS' | 'ALL'>('ALL');

  // Selected event for inspection drawer
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);

  const filtered = activities.filter(ev => {
    const matchesSearch = 
      ev.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.targetLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || ev.action === actionFilter;
    const matchesCategory = categoryFilter === 'ALL' || ev.category === categoryFilter;
    const matchesAdmin = !adminOnlyFilter || ev.isAdminAction;

    let matchesDate = true;
    const evTime = new Date(ev.timestamp).getTime();
    const now = Date.now();
    if (dateRange === 'TODAY') {
      matchesDate = now - evTime <= 86400000;
    } else if (dateRange === '7_DAYS') {
      matchesDate = now - evTime <= 86400000 * 7;
    } else if (dateRange === '30_DAYS') {
      matchesDate = now - evTime <= 86400000 * 30;
    }

    return matchesSearch && matchesAction && matchesCategory && matchesAdmin && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900">Admin Activity Explorer</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Auditable, privacy-preserving event stream for operational oversight, abuse prevention, and mutual aid tracking (Section D)
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by actor name, event description, or target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Date range filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today (24h)</option>
            <option value="7_DAYS">Past 7 Days</option>
            <option value="30_DAYS">Past 30 Days</option>
          </select>

          {/* Action filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="ALL">All Activity Types</option>
            <option value="REQUEST_CREATED">Request Created</option>
            <option value="OFFER_CREATED">Offer Created</option>
            <option value="HELP_OFFERED">Help Offered</option>
            <option value="OFFER_ACCEPTED">Offer Accepted</option>
            <option value="REQUEST_COMPLETED">Request Completed</option>
            <option value="ACHIEVEMENT_EARNED">Achievement Earned</option>
            <option value="MODERATION_ACTION">Moderation Action</option>
            <option value="REPORT_SUBMITTED">Report Submitted</option>
            <option value="ACCOUNT_CREATED">Account Created</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="blood">Blood Donation</option>
            <option value="rides">Rides</option>
            <option value="education">Education</option>
            <option value="items">Items</option>
            <option value="lostfound">Lost & Found</option>
          </select>

          {/* Admin action only checkbox */}
          <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={adminOnlyFilter}
              onChange={(e) => setAdminOnlyFilter(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Admin Actions Only</span>
          </label>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-3">Actor</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3">Target Details</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No activity events found.
                  </td>
                </tr>
              ) : (
                filtered.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(ev.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800">{ev.actorName}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">{ev.actorRole}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {ev.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 max-w-xs truncate font-medium text-slate-800" title={ev.targetLabel}>
                      {ev.targetLabel}
                    </td>

                    <td className="py-3.5 px-3">
                      {ev.category ? <CategoryBadge category={ev.category} /> : <span className="text-slate-400">—</span>}
                    </td>

                    <td className="py-3.5 px-3">
                      {ev.isAdminAction ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Shield className="w-3 h-3" /> Admin Action
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Community</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedEvent(ev)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Event Details</span>
                <h3 className="text-base font-bold font-display text-slate-900">{selectedEvent.action}</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs border-y border-slate-100 py-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-mono text-slate-800">{new Date(selectedEvent.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Actor:</span>
                <span className="font-semibold text-slate-800">{selectedEvent.actorName} ({selectedEvent.actorRole})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Type:</span>
                <span className="font-mono text-slate-800">{selectedEvent.targetType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target ID:</span>
                <span className="font-mono text-slate-800">{selectedEvent.targetId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Description:</span>
                <span className="font-semibold text-slate-800">{selectedEvent.targetLabel}</span>
              </div>
            </div>

            {selectedEvent.metadata && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Metadata</span>
                <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap">
                  {JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
