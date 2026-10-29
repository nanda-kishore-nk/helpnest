// src/components/admin/AdminVerification.tsx
import React, { useState } from 'react';
import { User, VerificationStatus } from '../../types';
import { db } from '../../services/db';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { VerificationModal } from '../common/VerificationModal';
import { ShieldCheck, ShieldAlert, Shield, Search, Check, X, AlertTriangle } from 'lucide-react';

interface AdminVerificationProps {
  adminActor: User;
}

export const AdminVerification: React.FC<AdminVerificationProps> = ({ adminActor }) => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal state
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    user?: User;
    status: VerificationStatus;
    note: string;
  }>({
    isOpen: false,
    status: 'VERIFIED',
    note: ''
  });

  const refreshData = () => {
    setUsers(db.getUsers());
  };

  const filtered = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.verificationNote && u.verificationNote.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || u.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveVerification = () => {
    if (!actionModal.user || !actionModal.note.trim()) {
      alert('An internal audit reason/note is required when modifying verification.');
      return;
    }

    db.updateVerification(
      actionModal.user.id,
      actionModal.status,
      actionModal.note.trim(),
      adminActor
    );

    setActionModal(prev => ({ ...prev, isOpen: false }));
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold font-display text-slate-900">Official Verification Center</h2>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            Section I Protocol
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Authenticate community identities, hospital accreditations, and NGO volunteer credentials (Never automated purely by Google OAuth)
        </p>
      </div>

      {/* Safety Notice Box (Section I) */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Section I Policy Reminder:</span>
          Verification confirms basic credential authenticity by human administrators. The UI explicitly clarifies that verification does <span className="font-semibold">not guarantee</span> personal safety, honesty, services, ticket legitimacy, driving skills, or medical suitability. Every grant/revocation is logged permanently in the immutable audit trail.
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user name, email, or verification note..."
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
          <option value="ALL">All Verification States</option>
          <option value="VERIFIED">Verified Members Only</option>
          <option value="UNVERIFIED">Unverified Only</option>
          <option value="REVOKED">Revoked Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Member Name & Identity</th>
                <th className="py-3 px-3">Verification Status</th>
                <th className="py-3 px-3">Organization Label</th>
                <th className="py-3 px-3">Internal Audit Note</th>
                <th className="py-3 px-3">Verified Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{user.name}</span>
                      {user.verificationStatus === 'VERIFIED' && (
                        <VerifiedBadge 
                          userName={user.name} 
                          verifiedAt={user.verifiedAt} 
                          verificationNote={user.verificationNote} 
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{user.email}</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      user.verificationStatus === 'VERIFIED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      user.verificationStatus === 'REVOKED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {user.verificationStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-medium text-slate-700">
                    {user.organizationLabel || <span className="text-slate-400">—</span>}
                  </td>

                  <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate" title={user.verificationNote}>
                    {user.verificationNote ? `"${user.verificationNote}"` : <span className="text-slate-400">—</span>}
                  </td>

                  <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                    {user.verifiedAt ? new Date(user.verifiedAt).toLocaleDateString() : '—'}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {user.verificationStatus === 'VERIFIED' ? (
                      <button
                        onClick={() => setActionModal({
                          isOpen: true,
                          user,
                          status: 'REVOKED',
                          note: ''
                        })}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold"
                      >
                        Revoke Badge
                      </button>
                    ) : (
                      <button
                        onClick={() => setActionModal({
                          isOpen: true,
                          user,
                          status: 'VERIFIED',
                          note: user.verificationNote || ''
                        })}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                      >
                        Grant Verification
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal.isOpen && actionModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-display">
                  {actionModal.status === 'VERIFIED' ? 'Grant Verification' : 'Revoke Verification'}
                </h3>
                <p className="text-xs text-indigo-200">{actionModal.user.name} ({actionModal.user.email})</p>
              </div>
              <button onClick={() => setActionModal(prev => ({ ...prev, isOpen: false }))} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Verification Status</label>
                <select
                  value={actionModal.status}
                  onChange={(e) => setActionModal(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="VERIFIED">VERIFIED (Official Shield Badge)</option>
                  <option value="UNVERIFIED">UNVERIFIED (Reset to Standard)</option>
                  <option value="REVOKED">REVOKED (Sanctioned / Withdrawn)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Verification Audit Note <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={actionModal.note}
                  onChange={(e) => setActionModal(prev => ({ ...prev, note: e.target.value }))}
                  rows={3}
                  required
                  placeholder="e.g. Identity documents and hospital doctor accreditation verified..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 resize-none"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                This action will be permanently recorded in the immutable administrator audit trail with your admin ID.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setActionModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVerification}
                className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm ${
                  actionModal.status === 'REVOKED' 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                Save Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
