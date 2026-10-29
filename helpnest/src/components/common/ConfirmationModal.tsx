// src/components/common/ConfirmationModal.tsx
import React, { useState } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  consequences?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  requireReason?: boolean;
  reasonPlaceholder?: string;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  consequences = [],
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = false,
  requireReason = false,
  reasonPlaceholder = 'Please explain the reason for this administrative action...',
  onConfirm,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('A valid administrative reason is required for audit logging.');
      return;
    }
    setError('');
    onConfirm(reason.trim());
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className={`p-5 flex items-start gap-4 ${isDestructive ? 'bg-rose-50 border-b border-rose-100' : 'bg-slate-50 border-b border-slate-100'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isDestructive ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
          }`}>
            {isDestructive ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 font-display">{title}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{description}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Consequences list */}
        <div className="p-6 space-y-4">
          {consequences.length > 0 && (
            <div className={`rounded-xl p-4 border text-xs space-y-2 ${
              isDestructive 
                ? 'bg-rose-50/70 border-rose-200/80 text-rose-900' 
                : 'bg-amber-50/70 border-amber-200/80 text-amber-900'
            }`}>
              <span className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                Consequences of this action:
              </span>
              <ul className="list-disc list-inside space-y-1 pl-1">
                {consequences.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Reason input */}
          {requireReason && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Administrative Reason & Audit Note <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                rows={3}
                placeholder={reasonPlaceholder}
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm ${
              isDestructive 
                ? 'bg-rose-600 hover:bg-rose-700' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
