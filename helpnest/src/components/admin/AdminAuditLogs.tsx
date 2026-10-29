// src/components/admin/AdminAuditLogs.tsx
import React, { useState } from 'react';
import { AuditLogEntry, User } from '../../types';
import { db } from '../../services/db';
import { exportToCsv } from '../../utils/csv';
import { Shield, Search, Filter, Download, Lock, FileText, CheckCircle2 } from 'lucide-react';

interface AdminAuditLogsProps {
  adminActor: User;
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = ({ adminActor }) => {
  const [logs] = useState<AuditLogEntry[]>(db.getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('ALL');

  const filtered = logs.filter(log => {
    const matchesSearch = 
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesTarget = targetTypeFilter === 'ALL' || log.targetType === targetTypeFilter;

    return matchesSearch && matchesAction && matchesTarget;
  });

  const handleExportAuditLogs = () => {
    const headers = ['Timestamp', 'Admin ID', 'Admin Name', 'Action', 'Target Type', 'Target ID', 'Target Description', 'Reason'];
    const rows = filtered.map(l => [
      l.timestamp,
      l.adminId,
      l.adminName,
      l.action,
      l.targetType,
      l.targetId,
      l.targetDescription,
      l.reason || ''
    ]);

    exportToCsv(`HelpNest_AuditLog_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-display text-slate-900">Administrator Audit Trail</h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <Lock className="w-3 h-3" /> Immutable Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict Section S administrative action logs with complete accountability and non-deletable records
          </p>
        </div>

        <button
          onClick={handleExportAuditLogs}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-indigo-600" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by administrator, target user, action, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-mono"
          >
            <option value="ALL">All Administrative Actions</option>
            <option value="ADMIN_CREATED_USER">ADMIN_CREATED_USER</option>
            <option value="ADMIN_BULK_CREATED_USERS">ADMIN_BULK_CREATED_USERS</option>
            <option value="ADMIN_EDITED_USER">ADMIN_EDITED_USER</option>
            <option value="ADMIN_SUSPENDED_USER">ADMIN_SUSPENDED_USER</option>
            <option value="ADMIN_UNSUSPENDED_USER">ADMIN_UNSUSPENDED_USER</option>
            <option value="ADMIN_BANNED_USER">ADMIN_BANNED_USER</option>
            <option value="ADMIN_DEACTIVATED_USER">ADMIN_DEACTIVATED_USER</option>
            <option value="ADMIN_GRANTED_VERIFICATION">ADMIN_GRANTED_VERIFICATION</option>
            <option value="ADMIN_REVOKED_VERIFICATION">ADMIN_REVOKED_VERIFICATION</option>
            <option value="ADMIN_AWARDED_ACHIEVEMENT">ADMIN_AWARDED_ACHIEVEMENT</option>
            <option value="ADMIN_EDITED_POST">ADMIN_EDITED_POST</option>
            <option value="ADMIN_REMOVED_POST">ADMIN_REMOVED_POST</option>
            <option value="ADMIN_RESOLVED_REPORT">ADMIN_RESOLVED_REPORT</option>
          </select>

          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="ALL">All Targets</option>
            <option value="USER">User</option>
            <option value="POST">Post</option>
            <option value="ACHIEVEMENT">Achievement</option>
            <option value="REPORT">Report</option>
            <option value="APPEAL">Appeal</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Administrator</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Target Details</th>
                <th className="py-3 px-3">Reason / Audit Justification</th>
                <th className="py-3 px-4">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-sans">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>

                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-slate-900">{log.adminName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.adminId}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] tracking-tight bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-sans max-w-xs">
                      <span className="font-semibold text-slate-800 block truncate" title={log.targetDescription}>
                        {log.targetDescription}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{log.targetType} • {log.targetId}</span>
                    </td>

                    <td className="py-3 px-3 font-sans text-slate-600 max-w-xs">
                      {log.reason ? (
                        <span className="italic">"{log.reason}"</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[10px] text-slate-500 max-w-xs truncate" title={JSON.stringify(log.metadata)}>
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
