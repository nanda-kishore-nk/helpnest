// src/components/user/UserHome.tsx
import React, { useState } from 'react';
import { Post, User, PostCategory } from '../../types';
import { db } from '../../services/db';
import { PostCard } from './PostCard';
import { 
  HeartHandshake, AlertCircle, MapPin, Sparkles, 
  ArrowRight, Users, Award, ShieldCheck, Search 
} from 'lucide-react';

interface UserHomeProps {
  currentUser: User;
  onOpenPost: (post: Post) => void;
  onOfferHelp: (post: Post) => void;
  onOpenCreate: () => void;
  onNavigateExplore: () => void;
}

export const UserHome: React.FC<UserHomeProps> = ({
  currentUser,
  onOpenPost,
  onOfferHelp,
  onOpenCreate,
  onNavigateExplore
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const allPosts = db.getPosts().filter(p => p.status === 'ACTIVE');
  const completedHelpsCount = db.getInteractions().filter(i => i.status === 'COMPLETED').length;
  const verifiedVolunteersCount = db.getUsers().filter(u => u.verificationStatus === 'VERIFIED').length;

  // Section T: Prioritize URGENT, NEAR YOU, LATEST
  const urgentPosts = allPosts.filter(p => p.urgency === 'URGENT');
  const nearYouPosts = allPosts
    .filter(p => p.location.approxDistanceKm !== undefined && p.location.approxDistanceKm <= 5)
    .sort((a, b) => (a.location.approxDistanceKm || 99) - (b.location.approxDistanceKm || 99));

  const filteredPosts = allPosts.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.locality.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = [
    { id: 'ALL', label: 'All Aids', icon: '🌟' },
    { id: 'blood', label: 'Blood Donation', icon: '🩸' },
    { id: 'rides', label: 'Ride Share', icon: '🚗' },
    { id: 'education', label: 'Education Guidance', icon: '📚' },
    { id: 'items', label: 'Items & Aid', icon: '📦' },
    { id: 'lostfound', label: 'Lost & Found', icon: '🔎' },
    { id: 'events', label: 'Community Events', icon: '🤝' },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/10 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Neighborhood Mutual Aid & Emergency Support</span>
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight leading-tight">
            Connecting Communities When Help is Needed Most.
          </h1>
          <p className="text-xs md:text-sm text-indigo-200 leading-relaxed">
            From urgent blood donors and daily carpooling to student guidance and lost items. Free, verified, and community-powered mutual aid.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onOpenCreate}
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl text-xs shadow-md transition-colors flex items-center gap-2"
            >
              <span>Ask for Help or Offer Aid</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateExplore}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              Explore Near You
            </button>
          </div>
        </div>

        {/* Floating Background Glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-600/20 to-transparent pointer-events-none" />
      </div>

      {/* Community Impact Counters (Section T) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold font-display text-slate-900 block leading-tight">{completedHelpsCount}</span>
            <span className="text-xs text-slate-500 font-medium">Mutual Aids Completed</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold font-display text-slate-900 block leading-tight">{verifiedVolunteersCount}</span>
            <span className="text-xs text-slate-500 font-medium">Verified Helpers</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <span className="text-2xl">🩸</span>
          </div>
          <div>
            <span className="text-2xl font-bold font-display text-slate-900 block leading-tight">
              {allPosts.filter(p => p.category === 'blood').length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Blood Lifelines</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold font-display text-slate-900 block leading-tight">100% Free</span>
            <span className="text-xs text-slate-500 font-medium">Zero-Cost Community</span>
          </div>
        </div>
      </div>

      {/* ==================== 1. URGENT ASSISTANCE (Section T Priority) ==================== */}
      {urgentPosts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h2 className="text-lg font-bold font-display text-slate-900">
                Emergency & Urgent Assistance Needed
              </h2>
            </div>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              {urgentPosts.length} Emergency Alerts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {urgentPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onOpenDetails={onOpenPost}
                onOfferHelp={onOfferHelp}
              />
            ))}
          </div>
        </section>
      )}

      {/* Category Pills Bar (Section T) */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Explore by Category
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all shadow-xs ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-indigo-200'
                  : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ==================== 2. NEAR YOU (Section T Priority) ==================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <h2 className="text-lg font-bold font-display text-slate-900">
              Assistance Near You (~5 km)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Based on {currentUser.generalLocation}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {nearYouPosts.slice(0, 3).map(post => (
            <PostCard
              key={post.id}
              post={post}
              onOpenDetails={onOpenPost}
              onOfferHelp={onOfferHelp}
            />
          ))}
        </div>
      </section>

      {/* ==================== 3. LATEST COMMUNITY LISTINGS (Section T Priority) ==================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display text-slate-900">
              Latest Community Listings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse neighbor requests and active volunteer offers
            </p>
          </div>
          <button
            onClick={onNavigateExplore}
            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onOpenDetails={onOpenPost}
              onOfferHelp={onOfferHelp}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
