// src/components/admin/AdminReports.tsx
import React, { useState } from 'react';
import { Report, User } from '../../types';
import { db } from '../../services/db';
import { ShieldAlert, CheckCircle2, XCircle, Search, Filter, AlertTriangle, Eye, Shield } from 'lucide-react';

interface AdminReportsProps {
  adminActor: User;
}

export const AdminReports: React.FC<AdminReportsProps> = ({ adminActor }) => {
  const [reports, setReports] = useState<Report[]>(db.getReports());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Resolution modal state
  const [resolveModal, setResolveModal] = useState<{
    isOpen: boolean;
    report?: Report;
    decision: 'RESOLVED' | 'DISMISSED';
    notes: string;
  }>({
    isOpen: false,
    decision: 'RESOLVED',
    notes: ''
  });

  const refreshData = () => {
    setReports(db.getReports());
  };

  const filtered = reports.filter(r => {
    const matchesSearch = 
      r.targetTitleOrName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExecuteResolution = () => {
    if (!resolveModal.report || !resolveModal.notes.trim()) {
      alert('Please provide an administrative note explaining the resolution decision.');
      return;
    }

    db.resolveReport(
      resolveModal.report.id,
      resolveModal.decision,
      resolveModal.notes.trim(),
      adminActor
    );

    setResolveModal(prev => ({ ...prev, isOpen: false }));
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">Safety & Abuse Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Investigate community safety violations, spam campaigns, and harassment flags
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reports by target name, reporter, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending Review</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="RESOLVED">Resolved (Sanctioned)</option>
          <option value="DISMISSED">Dismissed (No Violation)</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Target (Subject)</th>
                <th className="py-3 px-3">Violation Reason</th>
                <th className="py-3 px-3">Reporter</th>
                <th className="py-3 px-3">Details</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No safety reports currently pending.
                  </td>
                </tr>
              ) : (
                filtered.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate" title={rep.targetTitleOrName}>
                        {rep.targetTitleOrName}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {rep.targetType} • {rep.targetId}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                        {rep.reason}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      {rep.reporterName}
                    </td>

                    <td className="py-3.5 px-3 max-w-xs text-slate-600 truncate" title={rep.details}>
                      {rep.details}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        rep.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' :
                        rep.status === 'PENDING' ? 'bg-amber-50 text-amber-700 animate-pulse' :
                        rep.status === 'DISMISSED' ? 'bg-slate-100 text-slate-600' :
                        'bg-sky-50 text-sky-700'
                      }`}>
                        {rep.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {rep.status === 'PENDING' || rep.status === 'INVESTIGATING' ? (
                        <button
                          onClick={() => setResolveModal({
                            isOpen: true,
                            report: rep,
                            decision: 'RESOLVED',
                            notes: ''
                          })}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Closed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      {resolveModal.isOpen && resolveModal.report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-display">Resolve Safety Report</h3>
                <p className="text-xs text-indigo-200">Regarding: {resolveModal.report.targetTitleOrName}</p>
              </div>
              <button onClick={() => setResolveModal(prev => ({ ...prev, isOpen: false }))} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">Reported Details:</span>
                <p className="text-slate-600 italic">"{resolveModal.report.details}"</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Moderation Decision</label>
                <select
                  value={resolveModal.decision}
                  onChange={(e) => setResolveModal(prev => ({ ...prev, decision: e.target.value as any }))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="RESOLVED">RESOLVE — Violation Confirmed & Action Taken</option>
                  <option value="DISMISSED">DISMISS — No Policy Violation Detected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Notes (Audit Log)</label>
                <textarea
                  value={resolveModal.notes}
                  onChange={(e) => setResolveModal(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Explain actions taken (e.g. content removed, user warned/banned)..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 resize-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setResolveModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteResolution}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Save Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
