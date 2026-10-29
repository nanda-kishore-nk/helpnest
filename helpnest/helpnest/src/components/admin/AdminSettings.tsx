// src/components/admin/AdminSettings.tsx
import React, { useState } from 'react';
import { FeatureFlags, User } from '../../types';
import { getFeatureFlags, saveFeatureFlags } from '../../config/features';
import { db } from '../../services/db';
import { 
  Settings, ToggleLeft, ToggleRight, ShieldCheck, Database, 
  RotateCcw, AlertTriangle, CheckCircle2, Zap 
} from 'lucide-react';

interface AdminSettingsProps {
  adminActor: User;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ adminActor }) => {
  const [flags, setFlags] = useState<FeatureFlags>(getFeatureFlags());
  const [saveToast, setSaveToast] = useState(false);

  const toggleFlag = (key: keyof FeatureFlags) => {
    const updated = { ...flags, [key]: !flags[key] };
    setFlags(updated);
    saveFeatureFlags(updated);

    db.logAudit({
      adminId: adminActor.id,
      adminName: adminActor.name,
      action: 'ADMIN_CONFIG_CHANGED',
      targetType: 'SYSTEM',
      targetId: 'feature_flags',
      targetDescription: `Toggled ${key} to ${updated[key]}`,
      reason: 'Administrative system feature flag update'
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleResetData = () => {
    if (confirm('WARNING: Reset all local database tables to clean factory seed state? This action cannot be undone.')) {
      db.resetToFactoryDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900">Platform Settings & Zero-Budget Flags</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Central feature flags and operational safeguards for ₹0 / $0 development and deployment (Section AF)
        </p>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Feature flag updated and saved. Configuration is live.</span>
        </div>
      )}

      {/* Feature Flags Grid (Section AF) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600" />
            Central Feature Flags (Section AF)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Safely disable quota-restricted or unavailable external services without crashing HelpNest
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {/* PHONE_OTP_ENABLED */}
          <div className="py-4 flex items-center justify-between">
            <div className="max-w-md">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                PHONE_OTP_ENABLED
                {!flags.PHONE_OTP_ENABLED && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Zero-Cost Safe (Disabled)
                  </span>
                )}
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                SMS carrier OTP. Disabled by default to strictly avoid carrier billing charges. Fallbacks to verified email & Google OAuth.
              </p>
            </div>
            <button
              onClick={() => toggleFlag('PHONE_OTP_ENABLED')}
              className={`text-2xl transition-colors ${flags.PHONE_OTP_ENABLED ? 'text-indigo-600' : 'text-slate-300'}`}
            >
              {flags.PHONE_OTP_ENABLED ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>

          {/* EMAIL_NOTIFICATIONS_ENABLED */}
          <div className="py-4 flex items-center justify-between">
            <div className="max-w-md">
              <span className="text-xs font-bold text-slate-800 font-mono">EMAIL_NOTIFICATIONS_ENABLED</span>
              <p className="text-xs text-slate-500 mt-0.5">
                External email dispatch for onboarding & alerts. If quota exhausts, system seamlessly degrades to In-App notifications.
              </p>
            </div>
            <button
              onClick={() => toggleFlag('EMAIL_NOTIFICATIONS_ENABLED')}
              className={`text-2xl transition-colors ${flags.EMAIL_NOTIFICATIONS_ENABLED ? 'text-indigo-600' : 'text-slate-300'}`}
            >
              {flags.EMAIL_NOTIFICATIONS_ENABLED ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>

          {/* MAPS_ENABLED */}
          <div className="py-4 flex items-center justify-between">
            <div className="max-w-md">
              <span className="text-xs font-bold text-slate-800 font-mono">MAPS_ENABLED</span>
              <p className="text-xs text-slate-500 mt-0.5">
                OpenStreetMap & Leaflet interactive distance calculation. If disabled, defaults to text-based locality matching.
              </p>
            </div>
            <button
              onClick={() => toggleFlag('MAPS_ENABLED')}
              className={`text-2xl transition-colors ${flags.MAPS_ENABLED ? 'text-indigo-600' : 'text-slate-300'}`}
            >
              {flags.MAPS_ENABLED ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>

          {/* IMAGE_UPLOADS_ENABLED */}
          <div className="py-4 flex items-center justify-between">
            <div className="max-w-md">
              <span className="text-xs font-bold text-slate-800 font-mono">IMAGE_UPLOADS_ENABLED</span>
              <p className="text-xs text-slate-500 mt-0.5">
                Compresses images client-side before upload. If free bucket fills, notifies user while allowing post creation without image.
              </p>
            </div>
            <button
              onClick={() => toggleFlag('IMAGE_UPLOADS_ENABLED')}
              className={`text-2xl transition-colors ${flags.IMAGE_UPLOADS_ENABLED ? 'text-indigo-600' : 'text-slate-300'}`}
            >
              {flags.IMAGE_UPLOADS_ENABLED ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>

          {/* ORGANIZATIONS_ENABLED */}
          <div className="py-4 flex items-center justify-between">
            <div className="max-w-md">
              <span className="text-xs font-bold text-slate-800 font-mono">ORGANIZATIONS_ENABLED</span>
              <p className="text-xs text-slate-500 mt-0.5">
                Enables campus, NGO, and college volunteer organization labeling and bulk provisioning.
              </p>
            </div>
            <button
              onClick={() => toggleFlag('ORGANIZATIONS_ENABLED')}
              className={`text-2xl transition-colors ${flags.ORGANIZATIONS_ENABLED ? 'text-indigo-600' : 'text-slate-300'}`}
            >
              {flags.ORGANIZATIONS_ENABLED ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>

          {/* ACHIEVEMENTS_ENABLED */}
          <div className="py-4 flex items-center justify-between">
            <div className="max-w-md">
              <span className="text-xs font-bold text-slate-800 font-mono">ACHIEVEMENTS_ENABLED</span>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated mutual aid milestone engine. Evaluates confirmed interactions and awards community badges.
              </p>
            </div>
            <button
              onClick={() => toggleFlag('ACHIEVEMENTS_ENABLED')}
              className={`text-2xl transition-colors ${flags.ACHIEVEMENTS_ENABLED ? 'text-indigo-600' : 'text-slate-300'}`}
            >
              {flags.ACHIEVEMENTS_ENABLED ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Database & Architecture Safeguards (Section V & AA) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Database Engine & Persistence (Section AA)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Operating on PostgreSQL-compatible repository with autonomous LocalStorage persistence layer
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Healthy & Persisted
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
          <div><span className="font-semibold text-slate-800">Database Adapter:</span> Local Relational Repository (PostgreSQL Ready)</div>
          <div><span className="font-semibold text-slate-800">Cloud Postgres Provider:</span> Supabase / Neon Adapter (Configured for ₹0 Free Tier)</div>
          <div><span className="font-semibold text-slate-800">Automated Paid Overages:</span> Strictly Prevented (0 billing accounts linked)</div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleResetData}
            className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Database to Factory Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};
