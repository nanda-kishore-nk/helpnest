// src/components/admin/AdminInteractions.tsx
import React, { useState } from 'react';
import { Interaction, User } from '../../types';
import { db } from '../../services/db';
import { CategoryBadge } from '../common/Badge';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { Search, HeartHandshake, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';

interface AdminInteractionsProps {
  adminActor: User;
}

export const AdminInteractions: React.FC<AdminInteractionsProps> = ({ adminActor }) => {
  const [interactions] = useState<Interaction[]>(db.getInteractions());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = interactions.filter(i => {
    const matchesSearch = 
      i.postTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.helperName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900">Mutual Aid Interactions</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Oversight of help offers, confirmations, and completed community assistance
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search interactions by volunteer name, request title, or message..."
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
          <option value="OFFERED">Offered</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Post / Target</th>
                <th className="py-3 px-3">Volunteer / Helper</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Volunteer Message</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No mutual aid interactions match the filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-semibold text-slate-900 block truncate" title={item.postTitle}>
                        {item.postTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {item.postId}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <span>{item.helperName}</span>
                        {item.helperVerified && <VerifiedBadge />}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{item.helperId}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <CategoryBadge category={item.category} />
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                        item.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'OFFERED' ? 'bg-sky-100 text-sky-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 max-w-xs text-slate-600 truncate italic" title={item.message}>
                      "{item.message}"
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString()}
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
