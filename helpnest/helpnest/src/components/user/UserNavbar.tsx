// src/components/user/UserNavbar.tsx
import React, { useState } from 'react';
import { User } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { 
  HeartHandshake, Plus, Bell, Shield, 
  MapPin, LogIn, UserPlus, LogOut, ChevronDown, User as UserIcon 
} from 'lucide-react';

interface UserNavbarProps {
  currentUser: User | null;
  activeNav: string;
  onNavigate: (nav: string) => void;
  onOpenCreate: () => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onUserLogout: () => void;
  onOpenAdminPortal: () => void;
  isSuperAdmin: boolean;
}

export const UserNavbar: React.FC<UserNavbarProps> = ({
  currentUser,
  activeNav,
  onNavigate,
  onOpenCreate,
  onOpenAuth,
  onUserLogout,
  onOpenAdminPortal,
  isSuperAdmin
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Locality */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-base font-bold font-display text-slate-900 group-hover:text-indigo-600 transition-colors">
                HelpNest
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block -mt-1">
                Mutual Aid Network
              </span>
            </div>
          </button>

          {/* Locality Pill */}
          {currentUser && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-xs text-slate-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span className="truncate max-w-[140px]">{currentUser.generalLocation}</span>
            </div>
          )}
        </div>

        {/* Desktop Main Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          {[
            { id: 'home', label: 'Home' },
            { id: 'explore', label: 'Explore Aid' },
            { id: 'notifications', label: 'Updates' },
            ...(currentUser ? [{ id: 'profile', label: 'My Impact' }] : []),
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3.5 py-2 rounded-xl transition-colors ${
                activeNav === item.id
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          {/* Create Post Action */}
          <button
            onClick={onOpenCreate}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Listing</span>
          </button>

          {/* Admin Command Center Link (Strictly visible ONLY to verified Super Admin!) */}
          {isSuperAdmin && (
            <button
              onClick={onOpenAdminPortal}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Open Administrative Command Center"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Admin Panel</span>
            </button>
          )}

          {/* Account Profile or Sign In / Sign Up */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center overflow-hidden border border-slate-300">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                    <span className="truncate max-w-[100px]">{currentUser.name}</span>
                    {currentUser.verificationStatus === 'VERIFIED' && <VerifiedBadge />}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-fadeIn">
                  <div className="p-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <span>{currentUser.name}</span>
                      {currentUser.verificationStatus === 'VERIFIED' && <VerifiedBadge />}
                    </div>
                    <span className="text-[11px] text-slate-400 block font-mono truncate">{currentUser.email}</span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile & Badges</span>
                    </button>
                  </div>

                  <div className="p-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onUserLogout();
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                Join HelpNest
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
