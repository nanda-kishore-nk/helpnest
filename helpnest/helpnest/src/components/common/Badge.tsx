// src/components/common/Badge.tsx
import React from 'react';
import { AccountStatus, PostCategory, UrgencyLevel, PostStatus } from '../../types';

export const CategoryBadge: React.FC<{ category: PostCategory; className?: string }> = ({ category, className = '' }) => {
  const configs: Record<PostCategory, { label: string; icon: string; bg: string; text: string; border: string }> = {
    blood: { label: 'Blood Donation', icon: '🩸', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    rides: { label: 'Ride Share', icon: '🚗', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    education: { label: 'Education', icon: '📚', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    items: { label: 'Items & Aid', icon: '📦', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    lostfound: { label: 'Lost & Found', icon: '🔎', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    events: { label: 'Community Event', icon: '🤝', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    other: { label: 'Neighborhood Aid', icon: '🌱', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  };

  const c = configs[category] || configs.other;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border} ${className}`}>
      <span>{c.icon}</span>
      <span>{c.label}</span>
    </span>
  );
};

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel }> = ({ urgency }) => {
  const configs = {
    URGENT: { label: 'Emergency Urgency', bg: 'bg-red-500 text-white animate-pulse shadow-sm' },
    HIGH: { label: 'High Priority', bg: 'bg-amber-100 text-amber-800 border border-amber-300' },
    MEDIUM: { label: 'Moderate', bg: 'bg-blue-50 text-blue-700 border border-blue-200' },
    LOW: { label: 'Flexible', bg: 'bg-slate-100 text-slate-600 border border-slate-200' },
  };

  const c = configs[urgency];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide ${c.bg}`}>
      {c.label}
    </span>
  );
};

export const AccountStatusBadge: React.FC<{ status: AccountStatus }> = ({ status }) => {
  const configs: Record<AccountStatus, { label: string; bg: string; text: string; dot: string }> = {
    ACTIVE: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    SUSPENDED: { label: 'Suspended', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    BANNED: { label: 'Banned', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
    DEACTIVATED: { label: 'Deactivated', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
    DELETED: { label: 'Deleted / Anonymized', bg: 'bg-zinc-100', text: 'text-zinc-600', dot: 'bg-zinc-400' },
  };

  const c = configs[status] || configs.ACTIVE;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span>{c.label}</span>
    </span>
  );
};

export const PostStatusBadge: React.FC<{ status: PostStatus }> = ({ status }) => {
  const configs: Record<PostStatus, { label: string; cls: string }> = {
    ACTIVE: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    COMPLETED: { label: 'Completed', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
    CANCELLED: { label: 'Cancelled', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    EXPIRED: { label: 'Expired', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    REMOVED: { label: 'Removed by Admin', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  const c = configs[status] || configs.ACTIVE;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${c.cls}`}>
      {c.label}
    </span>
  );
};
