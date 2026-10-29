// src/components/user/UserBottomNav.tsx
import React from 'react';
import { Home, Compass, PlusCircle, Bell, User } from 'lucide-react';

interface UserBottomNavProps {
  activeNav: string;
  onNavigate: (nav: string) => void;
  onOpenCreate: () => void;
}

export const UserBottomNav: React.FC<UserBottomNavProps> = ({
  activeNav,
  onNavigate,
  onOpenCreate
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-1.5 flex items-center justify-around shadow-lg">
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
          activeNav === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => onNavigate('explore')}
        className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
          activeNav === 'explore' ? 'text-indigo-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Compass className="w-5 h-5 mb-0.5" />
        <span>Explore</span>
      </button>

      {/* Floating Create Button */}
      <button
        onClick={onOpenCreate}
        className="flex flex-col items-center -mt-5 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white p-3 rounded-full shadow-lg ring-4 ring-white"
        title="Create Mutual Aid Request or Offer"
      >
        <PlusCircle className="w-6 h-6 stroke-[2.2]" />
      </button>

      <button
        onClick={() => onNavigate('notifications')}
        className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
          activeNav === 'notifications' ? 'text-indigo-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Bell className="w-5 h-5 mb-0.5" />
        <span>Updates</span>
      </button>

      <button
        onClick={() => onNavigate('profile')}
        className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
          activeNav === 'profile' ? 'text-indigo-600 font-bold' : 'text-slate-500'
        }`}
      >
        <User className="w-5 h-5 mb-0.5" />
        <span>Profile</span>
      </button>
    </div>
  );
};
