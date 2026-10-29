// src/components/user/CreatePostModal.tsx
import React, { useState } from 'react';
import { Post, User, PostType, PostCategory, UrgencyLevel } from '../../types';
import { db } from '../../services/db';
import { PlusCircle, Image, MapPin, X, AlertCircle } from 'lucide-react';

interface CreatePostModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onPostCreated
}) => {
  const [type, setType] = useState<PostType>('REQUEST');
  const [category, setCategory] = useState<PostCategory>('blood');
  const [urgency, setUrgency] = useState<UrgencyLevel>('HIGH');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locality, setLocality] = useState(currentUser.generalLocation || 'Bengaluru');
  const [fulfillmentTarget, setFulfillmentTarget] = useState<number | undefined>(1);
  const [unitLabel, setUnitLabel] = useState('units');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    try {
      const newPost = db.createPost({
        type,
        category,
        urgency,
        status: 'ACTIVE',
        title: title.trim(),
        description: description.trim(),
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        requesterVerified: currentUser.verificationStatus === 'VERIFIED',
        requesterAvatar: currentUser.avatar,
        location: {
          locality: locality.trim() || 'Bengaluru Central',
          city: 'Bengaluru',
          approxDistanceKm: Math.round((Math.random() * 5 + 1) * 10) / 10
        },
        fulfillmentTarget: fulfillmentTarget ? Number(fulfillmentTarget) : undefined,
        fulfillmentCurrent: 0,
        unitLabel: unitLabel.trim() || 'units',
        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString()
      }, currentUser);

      onPostCreated(newPost);
      resetAndClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    }
  };

  const resetAndClose = () => {
    setTitle('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-display">Create Mutual Aid Listing</h3>
            <p className="text-xs text-indigo-200">Connect with neighbors and community volunteers</p>
          </div>
          <button onClick={resetAndClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Request vs Offer Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('REQUEST')}
              className={`py-2 text-center rounded-lg font-bold transition-all ${
                type === 'REQUEST' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Request Help
            </button>
            <button
              type="button"
              onClick={() => setType('OFFER')}
              className={`py-2 text-center rounded-lg font-bold transition-all ${
                type === 'OFFER' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Offer Volunteer Aid
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={type === 'REQUEST' ? 'e.g. Urgent O+ Blood Needed for Surgery at Fortis' : 'e.g. Free Carpool from HSR to Tech Park (2 Seats)'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category & Urgency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="blood">🩸 Blood Donation</option>
                <option value="rides">🚗 Ride Share</option>
                <option value="education">📚 Education Guidance</option>
                <option value="items">📦 Items & Equipment</option>
                <option value="lostfound">🔎 Lost & Found</option>
                <option value="events">🤝 Community Events</option>
                <option value="other">🌱 General Aid</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Urgency Level</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="URGENT">Emergency (Urgent)</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Moderate</option>
                <option value="LOW">Flexible / Low</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide clear details, timings, requirements, or safety recommendations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Locality */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              General Neighborhood / Hospital / Landmark
            </label>
            <input
              type="text"
              placeholder="e.g. Indiranagar 100ft Road, Apollo Hospital Bannerghatta"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Only general locality is shown to protect privacy. Never post exact private door numbers.
            </p>
          </div>

          {/* Target & Units */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Count</label>
              <input
                type="number"
                min={1}
                value={fulfillmentTarget || 1}
                onChange={(e) => setFulfillmentTarget(Number(e.target.value))}
                className="w-full p-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Label</label>
              <input
                type="text"
                placeholder="e.g. units, seats, items"
                value={unitLabel}
                onChange={(e) => setUnitLabel(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={resetAndClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
            >
              Publish Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
