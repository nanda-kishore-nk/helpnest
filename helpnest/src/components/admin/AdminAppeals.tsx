// src/components/admin/AdminAppeals.tsx
import React, { useState } from 'react';
import { Appeal, User } from '../../types';
import { db } from '../../services/db';
import { ShieldCheck, CheckCircle2, XCircle, Search, Clock, FileText } from 'lucide-react';

interface AdminAppealsProps {
  adminActor: User;
}

export const AdminAppeals: React.FC<AdminAppealsProps> = ({ adminActor }) => {
  const [appeals, setAppeals] = useState<Appeal[]>(db.getAppeals());
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    appeal?: Appeal;
    decision: 'APPROVED' | 'REJECTED';
    notes: string;
  }>({
    isOpen: false,
    decision: 'APPROVED',
    notes: ''
  });

  const refreshData = () => {
    setAppeals(db.getAppeals());
  };

  const handleExecuteDecision = () => {
    if (!reviewModal.appeal || !reviewModal.notes.trim()) {
      alert('Please provide an administrative note explaining the appeal decision.');
      return;
    }

    db.reviewAppeal(
      reviewModal.appeal.id,
      reviewModal.decision,
      reviewModal.notes.trim(),
      adminActor
    );

    setReviewModal(prev => ({ ...prev, isOpen: false }));
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900">User Moderation Appeals</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review appeals submitted by suspended or sanctioned community members
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-3">Appeal Reason</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date Submitted</th>
                <th className="py-3 px-3">Admin Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appeals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No active user moderation appeals.
                  </td>
                </tr>
              ) : (
                appeals.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.userName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{item.userEmail}</span>
                    </td>

                    <td className="py-3.5 px-3 max-w-sm text-slate-700 italic">
                      "{item.reason}"
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                        item.status === 'REJECTED' ? 'bg-rose-50 text-rose-700' :
                        'bg-amber-50 text-amber-700 animate-pulse'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 text-[11px]">
                      {item.adminNotes || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {item.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setReviewModal({
                              isOpen: true,
                              appeal: item,
                              decision: 'APPROVED',
                              notes: ''
                            })}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setReviewModal({
                              isOpen: true,
                              appeal: item,
                              decision: 'REJECTED',
                              notes: ''
                            })}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Decided</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appeal Review Modal */}
      {reviewModal.isOpen && reviewModal.appeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-display">Review Moderation Appeal</h3>
                <p className="text-xs text-indigo-200">{reviewModal.appeal.userName} ({reviewModal.appeal.userEmail})</p>
              </div>
              <button onClick={() => setReviewModal(prev => ({ ...prev, isOpen: false }))} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">User's Appeal Statement:</span>
                <p className="text-slate-600 italic">"{reviewModal.appeal.reason}"</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Appeal Decision</label>
                <select
                  value={reviewModal.decision}
                  onChange={(e) => setReviewModal(prev => ({ ...prev, decision: e.target.value as any }))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="APPROVED">APPROVE — Reinstates account to Active</option>
                  <option value="REJECTED">REJECT — Maintains suspension / ban</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Audit Justification</label>
                <textarea
                  value={reviewModal.notes}
                  onChange={(e) => setReviewModal(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Explain justification for approving or upholding sanction..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 resize-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setReviewModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDecision}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Submit Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
