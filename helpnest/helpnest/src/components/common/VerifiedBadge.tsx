// src/components/common/VerifiedBadge.tsx
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { VerificationModal } from './VerificationModal';

interface VerifiedBadgeProps {
  userName?: string;
  verifiedAt?: string;
  verificationNote?: string;
  showText?: boolean;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  userName,
  verifiedAt,
  verificationNote,
  showText = false,
  className = ''
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setModalOpen(true);
        }}
        title="HelpNest Verified Member (Click to learn what this means)"
        className={`inline-flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 ${className}`}
      >
        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </span>
        {showText && (
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
            Verified
          </span>
        )}
      </button>

      <VerificationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        userName={userName}
        verifiedAt={verifiedAt}
        verificationNote={verificationNote}
      />
    </>
  );
};
