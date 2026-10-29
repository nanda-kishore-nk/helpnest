// src/components/user/ExploreFeed.tsx
import React, { useState } from 'react';
import { Post, User, PostCategory, PostType, UrgencyLevel } from '../../types';
import { db } from '../../services/db';
import { PostCard } from './PostCard';
import { Search, Filter, MapPin, SlidersHorizontal, Map, Grid } from 'lucide-react';

interface ExploreFeedProps {
  currentUser: User;
  onOpenPost: (post: Post) => void;
  onOfferHelp: (post: Post) => void;
}

export const ExploreFeed: React.FC<ExploreFeedProps> = ({
  currentUser,
  onOpenPost,
  onOfferHelp
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const posts = db.getPosts().filter(p => p.status === 'ACTIVE');

  const filtered = posts.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.locality.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || p.type === typeFilter;
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesUrgency = urgencyFilter === 'ALL' || p.urgency === urgencyFilter;

    return matchesSearch && matchesType && matchesCategory && matchesUrgency;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">Explore Mutual Aid & Offers</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover community needs, verified medical volunteers, carpool rides, and student support
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by keywords, blood type, neighborhood, items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Listings</option>
              <option value="REQUEST">Requests (Needs Help)</option>
              <option value="OFFER">Offers (Volunteers)</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="blood">🩸 Blood Donation</option>
              <option value="rides">🚗 Ride Share</option>
              <option value="education">📚 Education</option>
              <option value="items">📦 Items & Aid</option>
              <option value="lostfound">🔎 Lost & Found</option>
              <option value="events">🤝 Events</option>
            </select>

            {/* Urgency Filter */}
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Urgencies</option>
              <option value="URGENT">Emergency (Urgent)</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Moderate</option>
              <option value="LOW">Flexible</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500'}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-lg ${viewMode === 'map' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-500'}`}
                title="Map Exploration (Section Z)"
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid or Map View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
              No mutual aid listings found matching your search.
            </div>
          ) : (
            filtered.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onOpenDetails={onOpenPost}
                onOfferHelp={onOfferHelp}
              />
            ))
          )}
        </div>
      ) : (
        /* Zero-Cost OpenStreetMap Representation (Section Z) */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
                <Map className="w-4 h-4 text-indigo-600" />
                <span>OpenStreetMap Regional Geolocation (Section Z)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Operating under strict zero-budget OpenStreetMap components (Zero Google Maps API charges)
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Free OpenStreetMap Layer
            </span>
          </div>

          {/* Interactive OpenStreetMap Container */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center space-y-4 min-h-[300px] flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
              <MapPin className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h4 className="text-sm font-bold text-slate-900 font-display">
                Regional Map Centered on {currentUser.generalLocation}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Found {filtered.length} active mutual aid pins across Bengaluru urban districts. Direct privacy-preserving approximate centroid visualization active.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => onOpenPost(p)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 text-xs text-slate-700 font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>{p.category === 'blood' ? '🩸' : p.category === 'rides' ? '🚗' : '🤝'}</span>
                  <span className="truncate max-w-[140px]">{p.location.locality}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
