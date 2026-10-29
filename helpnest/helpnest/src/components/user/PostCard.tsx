// src/components/user/PostCard.tsx
import React from 'react';
import { Post } from '../../types';
import { CategoryBadge, UrgencyBadge } from '../common/Badge';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { MapPin, Clock, HeartHandshake, Eye, ArrowUpRight, Share2, Bookmark } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onOpenDetails: (post: Post) => void;
  onOfferHelp: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpenDetails,
  onOfferHelp,
}) => {
  const isUrgent = post.urgency === 'URGENT';
  const progressPercent = post.fulfillmentTarget && post.fulfillmentTarget > 0
    ? Math.min(100, Math.round(((post.fulfillmentCurrent || 0) / post.fulfillmentTarget) * 100))
    : 0;

  return (
    <div 
      onClick={() => onOpenDetails(post)}
      className={`group bg-white rounded-2xl border transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col justify-between overflow-hidden ${
        isUrgent 
          ? 'border-rose-300/80 ring-1 ring-rose-400/30 hover:border-rose-400' 
          : 'border-slate-200/80 hover:border-indigo-300'
      }`}
    >
      {/* Top Banner if Urgent */}
      {isUrgent && (
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white text-[11px] font-bold px-4 py-1.5 flex items-center justify-between uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            Emergency Mutual Aid Request
          </span>
          <span>Immediate Action</span>
        </div>
      )}

      {/* Card Header & Body */}
      <div className="p-5 flex-1 space-y-3.5">
        {/* Creator Info & Tags */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-700 text-xs flex-shrink-0">
              {post.requesterAvatar ? (
                <img src={post.requesterAvatar} alt={post.requesterName} className="w-full h-full object-cover" />
              ) : (
                post.requesterName.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-900 leading-tight">
                <span>{post.requesterName}</span>
                {post.requesterVerified && <VerifiedBadge />}
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              post.type === 'REQUEST' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {post.type}
            </span>
            <CategoryBadge category={post.category} />
          </div>
        </div>

        {/* Title & Preview */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 font-display">
            {post.title}
          </h3>
          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
            {post.description}
          </p>
        </div>

        {/* Fulfilment Progress Bar (if target present) */}
        {post.fulfillmentTarget && post.fulfillmentTarget > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Fulfilment Progress:</span>
              <span className="font-bold text-indigo-700">
                {post.fulfillmentCurrent || 0} of {post.fulfillmentTarget} {post.unitLabel || 'units'}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Location & Distance */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
          <span className="flex items-center gap-1 truncate max-w-[200px]" title={post.location.locality}>
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{post.location.locality}</span>
          </span>
          {post.location.approxDistanceKm !== undefined && (
            <span className="font-semibold text-slate-700 flex-shrink-0 bg-slate-50 px-2 py-0.5 rounded">
              ~ {post.location.approxDistanceKm} km away
            </span>
          )}
        </div>
      </div>

      {/* Card Footer Actions (Section T) */}
      <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOfferHelp(post);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-1.5 ${
            isUrgent 
              ? 'bg-rose-600 hover:bg-rose-700' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>{post.type === 'REQUEST' ? 'Offer Help' : 'Express Interest'}</span>
        </button>
      </div>
    </div>
  );
};
