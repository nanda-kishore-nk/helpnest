// src/components/admin/AdminCreateUserModal.tsx
import React, { useState } from 'react';
import { User, VerificationStatus } from '../../types';
import { db } from '../../services/db';
import { UserPlus, Copy, Check, Shield, AlertCircle, X } from 'lucide-react';

interface AdminCreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminActor: User;
  onUserCreated: (user: User) => void;
}

export const AdminCreateUserModal: React.FC<AdminCreateUserModalProps> = ({
  isOpen,
  onClose,
  adminActor,
  onUserCreated
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'user' | 'moderator' | 'admin'>('user');
  const [organization, setOrganization] = useState('');
  const [verifyAccount, setVerifyAccount] = useState(false);
  const [verificationNote, setVerificationNote] = useState('');
  const [error, setError] = useState('');

  // Result state after creation (showing invitation link/temporary setup details)
  const [createdResult, setCreatedResult] = useState<{
    user: User;
    inviteToken: string;
    temporaryPassword?: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Full name and email are required.');
      return;
    }

    try {
      setError('');
      const result = db.createUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role,
        organizationLabel: organization.trim() || undefined,
        verificationStatus: verifyAccount ? 'VERIFIED' : 'UNVERIFIED',
        verificationNote: verifyAccount ? (verificationNote || 'Administratively verified upon account creation') : undefined,
      }, adminActor);

      setCreatedResult(result);
      onUserCreated(result.user);
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  const resetAndClose = () => {
    setName('');
    setEmail('');
    setPhone('');
    setRole('user');
    setOrganization('');
    setVerifyAccount(false);
    setVerificationNote('');
    setError('');
    setCreatedResult(null);
    setCopiedLink(false);
    onClose();
  };

  const inviteLink = createdResult 
    ? `${window.location.origin}/setup-password?token=${createdResult.inviteToken}&email=${encodeURIComponent(createdResult.user.email)}`
    : '';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display">Create User Account</h3>
              <p className="text-xs text-indigo-200">Provision individual community or administrative member</p>
            </div>
          </div>
          <button 
            onClick={resetAndClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!createdResult ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meera Nair"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="meera@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="user">Regular User</option>
                  <option value="moderator">Community Moderator</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organization / College Label (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. St. Joseph's College Volunteer Cell"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Verification Checkbox */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifyAccount}
                  onChange={(e) => setVerifyAccount(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  Grant official HelpNest Verification immediately
                </span>
              </label>
              {verifyAccount && (
                <input
                  type="text"
                  placeholder="Internal reason for pre-granting verification..."
                  value={verificationNote}
                  onChange={(e) => setVerificationNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              )}
            </div>

            {/* Section F: Security reminder */}
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 leading-relaxed">
              <span className="font-bold">Credential Security Notice (Section F):</span> Admins never specify or view user passwords. A secure invitation setup link will be generated. If a temporary pass is used, it expires and requires immediate change on first login.
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                Create Account
              </button>
            </div>
          </form>
        ) : (
          /* Post-creation results modal (Section F) */
          <div className="p-6 space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h4 className="text-sm font-bold text-emerald-900">Account Created Successfully</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                {createdResult.user.name} ({createdResult.user.email})
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Secure Password Setup Link (Recommended)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="flex-1 text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 font-mono text-slate-700"
                  />
                  <button
                    onClick={() => copyToClipboard(inviteLink)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Send this link to the user via WhatsApp, email, or institutional portal.
                </p>
              </div>

              {createdResult.temporaryPassword && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-amber-900 block">
                    2. One-Time Temporary Password (Alternate)
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-amber-300">
                      {createdResult.temporaryPassword}
                    </span>
                    <button
                      onClick={() => copyToClipboard(createdResult.temporaryPassword!)}
                      className="text-xs font-semibold text-amber-900 hover:underline"
                    >
                      Copy Passcode
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-800 leading-tight pt-1">
                    This password is shown <span className="font-bold">once only</span> and will never be retrievable again. The user must change it immediately upon initial login.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={resetAndClose}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
