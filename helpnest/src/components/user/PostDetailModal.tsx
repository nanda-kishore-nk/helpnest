// src/components/user/PostDetailModal.tsx
import React, { useState } from 'react';
import { Post, User, Interaction } from '../../types';
import { db } from '../../services/db';
import { CategoryBadge, UrgencyBadge, PostStatusBadge } from '../common/Badge';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { 
  HeartHandshake, MapPin, Clock, ShieldCheck, Flag, 
  CheckCircle2, AlertTriangle, Send, X, Share2, Shield 
} from 'lucide-react';

interface PostDetailModalProps {
  post: Post | null;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  currentUser,
  isOpen,
  onClose,
  onPostUpdated
}) => {
  const [offerMessage, setOfferMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<any>('SAFETY_VIOLATION');
  const [reportDetails, setReportDetails] = useState('');
  const [feedbackToast, setFeedbackToast] = useState('');

  if (!isOpen || !post) return null;

  const interactions = db.getInteractions().filter(i => i.postId === post.id);
  const isCreator = currentUser.id === post.requesterId;

  const handleSendHelp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerMessage.trim()) return;

    setIsSubmitting(true);
    try {
      db.offerHelp(post.id, currentUser, offerMessage.trim());
      setOfferMessage('');
      setFeedbackToast('Your help offer has been delivered to the organizer!');
      setTimeout(() => setFeedbackToast(''), 3000);
      onPostUpdated();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptHelp = (interactionId: string) => {
    db.acceptInteraction(interactionId, currentUser);
    onPostUpdated();
  };

  const handleCompleteHelp = (interactionId: string) => {
    // This triggers the Achievement Engine automatically!
    db.completeInteraction(interactionId, currentUser);
    setFeedbackToast('Help confirmed completed! Community milestone badges evaluated.');
    setTimeout(() => setFeedbackToast(''), 3500);
    onPostUpdated();
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDetails.trim()) return;

    db.createReport({
      targetType: 'POST',
      targetId: post.id,
      targetTitleOrName: post.title,
      reason: reportReason,
      details: reportDetails.trim(),
    }, currentUser);

    setReportModalOpen(false);
    setReportDetails('');
    setFeedbackToast('Safety report submitted to platform moderation.');
    setTimeout(() => setFeedbackToast(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-start justify-between flex-shrink-0">
          <div className="space-y-1 max-w-lg">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                post.type === 'REQUEST' ? 'bg-indigo-500/30 text-indigo-200' : 'bg-emerald-500/30 text-emerald-200'
              }`}>
                {post.type}
              </span>
              <CategoryBadge category={post.category} />
              <UrgencyBadge urgency={post.urgency} />
            </div>
            <h2 className="text-lg font-bold font-display mt-1 leading-snug">{post.title}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {feedbackToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedbackToast}</span>
            </div>
          )}

          {/* Organizer Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-700 text-sm">
                {post.requesterAvatar ? (
                  <img src={post.requesterAvatar} alt={post.requesterName} className="w-full h-full object-cover" />
                ) : (
                  post.requesterName.charAt(0)
                )}
              </div>
              <div>
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                  <span>{post.requesterName}</span>
                  {post.requesterVerified && <VerifiedBadge />}
                </div>
                <span className="text-[11px] text-slate-500">
                  Posted {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => setReportModalOpen(true)}
              className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">Description</h4>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-2xl border border-slate-200">
              {post.description}
            </p>
          </div>

          {/* Fulfilment Progress */}
          {post.fulfillmentTarget && post.fulfillmentTarget > 0 && (
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Mutual Aid Fulfilment</span>
                <span className="text-slate-500 text-[11px]">
                  Community members who offered assistance
                </span>
              </div>
              <span className="text-base font-bold text-indigo-700 font-display">
                {post.fulfillmentCurrent || 0} / {post.fulfillmentTarget} {post.unitLabel || 'units'}
              </span>
            </div>
          )}

          {/* Approximate Locality (Privacy Preserving) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Approximate Locality: <span className="font-semibold">{post.location.locality}</span></span>
            </span>
            {post.location.approxDistanceKm !== undefined && (
              <span className="font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                ~ {post.location.approxDistanceKm} km
              </span>
            )}
          </div>

          {/* Community Help Thread */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Volunteers & Help Offers ({interactions.length})
            </h4>

            {interactions.length === 0 ? (
              <p className="text-slate-400 bg-slate-50 p-4 rounded-2xl text-center">
                No volunteers have offered assistance yet. Be the first to help!
              </p>
            ) : (
              <div className="space-y-2.5">
                {interactions.map(item => (
                  <div key={item.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{item.helperName}</span>
                        {item.helperVerified && <VerifiedBadge />}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                        item.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-sky-100 text-sky-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <p className="text-slate-700 italic">"{item.message}"</p>

                    {/* Actions if creator */}
                    {isCreator && (
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-end gap-2">
                        {item.status === 'OFFERED' && (
                          <button
                            onClick={() => handleAcceptHelp(item.id)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-[11px]"
                          >
                            Accept Offer
                          </button>
                        )}
                        {item.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleCompleteHelp(item.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[11px] flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm Completed</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Offer Help Input (if not creator) */}
          {!isCreator && post.status === 'ACTIVE' && (
            <form onSubmit={handleSendHelp} className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
              <span className="font-bold text-indigo-900 block">
                {post.type === 'REQUEST' ? 'Step forward to assist' : 'Express your interest in this offer'}
              </span>
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="Write a message to coordinate (e.g. 'I am available to donate blood tomorrow at 8 AM', 'I would love to join the carpool')..."
                rows={2}
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !offerMessage.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Offer</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Safety Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 font-display">Report this Content</h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason for Report</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="SAFETY_VIOLATION">Safety Violation / Unverified Medical Request</option>
                <option value="SPAM">Commercial Spam / External Paid Links</option>
                <option value="FRAUD">Fraud / Monetary Solicitation</option>
                <option value="HARASSMENT">Harassment or Inappropriate Language</option>
                <option value="OTHER">Other Community Policy Issue</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Explain the Issue</label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
                required
                placeholder="Provide specific details for community moderators..."
                className="w-full p-2.5 rounded-lg border border-slate-300 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendReport}
                className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
