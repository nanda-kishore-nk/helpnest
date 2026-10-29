// src/components/user/EditProfileModal.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { User } from '../../types';
import { db } from '../../services/db';
import { X, CheckCircle2, Upload, Camera } from 'lucide-react';

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  // actor is the user performing the edit (self or admin)
  actor?: User;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, isOpen, onClose, actor }) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [bio, setBio] = useState(user.bio ?? '');
  const [avatar, setAvatar] = useState<string>(user.avatar ?? '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(user.gender ?? 'other');
  const [womenOnly, setWomenOnly] = useState<boolean>(!!user.womenOnly);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base = await toBase64(e.target.files[0]);
      setAvatar(base);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const updates: Partial<User> = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
        avatar: avatar || undefined,
        gender,
        womenOnly,
        generalLocation: user.generalLocation, // keep existing location unless you add UI for it
        organizationLabel: user.organizationLabel,
      };
      db.updateUserProfile(user.id, updates, actor);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white flex items-center justify-between">
          <h3 className="text-base font-bold">Edit Profile</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form className="p-6 space-y-4 text-xs" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
              {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-slate-400" />}
            </div>
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Change Avatar</span>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="mt-1 block w-full text-xs" />
            </label>
          </div>

          {/* Basic fields */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Phone (optional)</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Bio</label>
            <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} className="w-full p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <span className="block font-medium text-slate-700">Gender</span>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="gender" value="male" checked={gender === 'male'} onChange={() => setGender('male')} />
              Male
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="gender" value="female" checked={gender === 'female'} onChange={() => setGender('female')} />
              Female
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="gender" value="other" checked={gender === 'other'} onChange={() => setGender('other')} />
              Other / Prefer not to say
            </label>
          </div>

          {/* Women‑Only toggle */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-slate-700">Women‑Only Mode</span>
            <button type="button" onClick={() => setWomenOnly(!womenOnly)} className={`px-3 py-1 rounded ${womenOnly ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {womenOnly ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
