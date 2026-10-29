// src/App.tsx
import React, { useState, useEffect } from 'react';
import { User, Post } from './types';
import { auth } from './services/auth';
import { db } from './services/db';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginGate } from './components/admin/AdminLoginGate';
import { UserNavbar } from './components/user/UserNavbar';
import { UserBottomNav } from './components/user/UserBottomNav';
import { UserHome } from './components/user/UserHome';
import { ExploreFeed } from './components/user/ExploreFeed';
import { NotificationsCenter } from './components/user/NotificationsCenter';
import { UserProfile } from './components/user/UserProfile';
import { CreatePostModal } from './components/user/CreatePostModal';
import { PostDetailModal } from './components/user/PostDetailModal';
import { AuthModal } from './components/auth/AuthModal';
import { Lock, HeartHandshake, Shield } from 'lucide-react';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.getCurrentUser());
  const [viewMode, setViewMode] = useState<'community' | 'admin'>('community');
  const [userNavTab, setUserNavTab] = useState<string>('home');

  // Admin security gate state
  const [adminGateOpen, setAdminGateOpen] = useState(false);

  // User Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Content modals
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Sync hash routing for admin (#admin)
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        if (auth.isAdminAuthenticated()) {
          setViewMode('admin');
        } else {
          setAdminGateOpen(true);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleUserLogout = () => {
    auth.signOut();
    setCurrentUser(null);
    if (userNavTab === 'profile') {
      setUserNavTab('home');
    }
  };

  const handleOpenAdminPortal = () => {
    if (auth.isAdminAuthenticated()) {
      setViewMode('admin');
    } else {
      setAdminGateOpen(true);
    }
  };

  const handleAdminAuthSuccess = (adminUser: User) => {
    setCurrentUser(adminUser);
    setAdminGateOpen(false);
    setViewMode('admin');
    window.location.hash = '#admin';
  };

  const handleAdminLogout = () => {
    auth.adminSignOut();
    setViewMode('community');
    window.location.hash = '';
  };

  const handleOpenCreate = () => {
    if (!currentUser) {
      handleOpenAuth('signin');
      return;
    }
    setCreatePostOpen(true);
  };

  const handleOfferHelp = (post: Post) => {
    if (!currentUser) {
      handleOpenAuth('signin');
      return;
    }
    setSelectedPost(post);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* ==================== 1. ADMIN SECURITY GATEWAY ==================== */}
      {adminGateOpen ? (
        <AdminLoginGate
          onSuccess={handleAdminAuthSuccess}
          onCancel={() => {
            setAdminGateOpen(false);
            window.location.hash = '';
          }}
        />
      ) : viewMode === 'admin' && auth.isAdminAuthenticated() && currentUser ? (
        // ==================== 2. ADMIN DASHBOARD (Strictly Protected) ====================
        <AdminLayout
          currentUser={currentUser}
          onSwitchToUserView={() => {
            setViewMode('community');
            window.location.hash = '';
          }}
          onAdminLogout={handleAdminLogout}
        />
      ) : (
        // ==================== 3. COMMUNITY PUBLIC EXPERIENCE ====================
        <div className="flex flex-col min-h-screen">
          <UserNavbar
            currentUser={currentUser}
            activeNav={userNavTab}
            onNavigate={(nav) => setUserNavTab(nav)}
            onOpenCreate={handleOpenCreate}
            onOpenAuth={handleOpenAuth}
            onUserLogout={handleUserLogout}
            onOpenAdminPortal={handleOpenAdminPortal}
            isSuperAdmin={auth.isSuperAdmin()}
          />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
            {userNavTab === 'home' && (
              <UserHome
                currentUser={currentUser || {
                  id: 'guest',
                  name: 'Community Visitor',
                  email: 'visitor@helpnest.org',
                  role: 'user',
                  status: 'ACTIVE',
                  verificationStatus: 'UNVERIFIED',
                  generalLocation: 'Bengaluru Urban',
                  createdAt: new Date().toISOString(),
                  lastActiveAt: new Date().toISOString(),
                  stats: { helpsGiven: 0, requestsCompleted: 0, bloodHelps: 0, rideHelps: 0, educationHelps: 0, returnsCompleted: 0 }
                }}
                onOpenPost={(post) => setSelectedPost(post)}
                onOfferHelp={handleOfferHelp}
                onOpenCreate={handleOpenCreate}
                onNavigateExplore={() => setUserNavTab('explore')}
              />
            )}

            {userNavTab === 'explore' && (
              <ExploreFeed
                currentUser={currentUser || {
                  id: 'guest',
                  name: 'Community Visitor',
                  email: 'visitor@helpnest.org',
                  role: 'user',
                  status: 'ACTIVE',
                  verificationStatus: 'UNVERIFIED',
                  generalLocation: 'Bengaluru Urban',
                  createdAt: new Date().toISOString(),
                  lastActiveAt: new Date().toISOString(),
                  stats: { helpsGiven: 0, requestsCompleted: 0, bloodHelps: 0, rideHelps: 0, educationHelps: 0, returnsCompleted: 0 }
                }}
                onOpenPost={(post) => setSelectedPost(post)}
                onOfferHelp={handleOfferHelp}
              />
            )}

            {userNavTab === 'notifications' && (
              <NotificationsCenter
                currentUser={currentUser || {
                  id: 'guest',
                  name: 'Community Visitor',
                  email: 'visitor@helpnest.org',
                  role: 'user',
                  status: 'ACTIVE',
                  verificationStatus: 'UNVERIFIED',
                  generalLocation: 'Bengaluru Urban',
                  createdAt: new Date().toISOString(),
                  lastActiveAt: new Date().toISOString(),
                  stats: { helpsGiven: 0, requestsCompleted: 0, bloodHelps: 0, rideHelps: 0, educationHelps: 0, returnsCompleted: 0 }
                }}
              />
            )}

            {userNavTab === 'profile' && (
              currentUser ? (
                <UserProfile
                  currentUser={currentUser}
                  onOpenPost={(post) => setSelectedPost(post)}
                />
              ) : (
                <div className="max-w-md mx-auto text-center py-16 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold font-display text-slate-900">Sign In to View Your Impact</h3>
                  <p className="text-xs text-slate-500">
                    Track your confirmed mutual aid contributions, unlock community badges, and manage your listings.
                  </p>
                  <button
                    onClick={() => handleOpenAuth('signin')}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    Sign In to HelpNest
                  </button>
                </div>
              )
            )}
          </main>

          {/* Public Footer with Discrete Platform Administration Link */}
          <footer className="bg-white border-t border-slate-200/80 py-8 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <HeartHandshake className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-slate-800 font-display">HelpNest Mutual Aid</span>
                <span>— Free, Neighborhood-Powered Community Support</span>
              </div>

              <div className="flex items-center gap-6">
                <span>Zero-Budget Community Infrastructure</span>
                {/* Discrete Admin Security Link */}
                <button
                  onClick={handleOpenAdminPortal}
                  className="text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
                  title="Platform Owner & Administrator Login"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Platform Administration</span>
                </button>
              </div>
            </div>
          </footer>

          {/* Mobile Bottom Navigation */}
          <UserBottomNav
            activeNav={userNavTab}
            onNavigate={(nav) => {
              if (nav === 'profile' && !currentUser) {
                handleOpenAuth('signin');
              } else {
                setUserNavTab(nav);
              }
            }}
            onOpenCreate={handleOpenCreate}
          />

          {/* Create Post Modal */}
          {currentUser && (
            <CreatePostModal
              currentUser={currentUser}
              isOpen={createPostOpen}
              onClose={() => setCreatePostOpen(false)}
              onPostCreated={(newPost) => {
                setSelectedPost(newPost);
              }}
            />
          )}

          {/* Post Detail Modal */}
          <PostDetailModal
            post={selectedPost}
            currentUser={currentUser || {
              id: 'guest',
              name: 'Community Visitor',
              email: 'visitor@helpnest.org',
              role: 'user',
              status: 'ACTIVE',
              verificationStatus: 'UNVERIFIED',
              generalLocation: 'Bengaluru Urban',
              createdAt: new Date().toISOString(),
              lastActiveAt: new Date().toISOString(),
              stats: { helpsGiven: 0, requestsCompleted: 0, bloodHelps: 0, rideHelps: 0, educationHelps: 0, returnsCompleted: 0 }
            }}
            isOpen={selectedPost !== null}
            onClose={() => setSelectedPost(null)}
            onPostUpdated={() => {
              if (selectedPost) {
                const refreshed = db.getPostById(selectedPost.id);
                setSelectedPost(refreshed || null);
              }
            }}
          />

          {/* User Sign In / Sign Up Modal */}
          <AuthModal
            isOpen={authModalOpen}
            initialMode={authModalMode}
            onClose={() => setAuthModalOpen(false)}
            onSuccess={handleAuthSuccess}
          />
        </div>
      )}
    </div>
  );
};

export default App;
