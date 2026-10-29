// src/components/admin/AdminLoginGate.tsx
import React, { useState } from 'react';
import { auth } from '../../services/auth';
import { User } from '../../types';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

interface AdminLoginGateProps {
  onSuccess: (adminUser: User) => void;
  onCancel: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('admin@helpnest.org');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both administrator email and master password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const adminUser = await auth.adminSignIn(email.trim(), password);
      onSuccess(adminUser);
    } catch (err: any) {
      setError(err.message || 'Administrative access denied. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background ambient gradient */}
      <div className="absolute inset-0 bg-radial-gradient from-indigo-900/20 via-transparent to-slate-950 pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Back link */}
        <button
          onClick={onCancel}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Community Network</span>
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold font-display text-white tracking-tight">
              Administrative Command Center
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Restricted platform management gateway. Authorized Platform Owner & Super Administrators only.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Administrator Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@helpnest.org"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Master Security Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Authenticating Credentials...' : 'Authenticate & Enter Admin Panel'}</span>
              </button>
            </div>
          </form>

          {/* Initial credentials guidance for the platform owner */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Platform Owner Access Gate</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Default Platform Owner account: <span className="text-indigo-300 font-mono">admin@helpnest.org</span>. 
              Initial bootstrap password: <span className="text-indigo-300 font-mono">HelpNest@Admin2026!</span>. You can change this anytime inside Admin Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
