// src/components/common/VerificationModal.tsx
import React from 'react';
import { ShieldCheck, AlertTriangle, X } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  verifiedAt?: string;
  verificationNote?: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  userName,
  verifiedAt,
  verificationNote
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7 text-emerald-300" />
          </div>
          <h3 className="text-xl font-bold font-display">HelpNest Community Verification</h3>
          <p className="text-xs text-indigo-100 mt-1">
            Official identity and community credential status
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {userName && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 text-sm">
              <span className="text-xs text-slate-500 block">Verified Community Member:</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                {userName}
                <span className="inline-flex items-center text-xs font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">✓ Verified</span>
              </span>
              {verifiedAt && (
                <span className="text-[11px] text-slate-400 block mt-1">
                  Verified on: {new Date(verifiedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </span>
              )}
              {verificationNote && (
                <div className="mt-2 text-xs text-slate-600 bg-white p-2 rounded border border-slate-200">
                  <span className="font-semibold text-slate-700">Verification note:</span> {verificationNote}
                </div>
              )}
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-slate-800">What does "Verified" mean?</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              HelpNest Verification signifies that the member has undergone administrative identity validation, institutional affiliation checks (e.g., hospital, college, or registered NGO), or verified historical mutual aid fulfillment.
            </p>
          </div>

          {/* Mandatory Safety Disclaimer as required by Section I */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-3 text-xs text-amber-900 leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Important Community Safety Disclaimer</span>
              Verification confirms basic credential authenticity. It <span className="font-semibold">does NOT guarantee</span> an individual’s safety, honesty, services, ticket validity, driving ability, or medical suitability. Always exercise standard personal vigilance and verify critical details in person or in medical facilities.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
