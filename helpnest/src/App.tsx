// src/App.tsx
import React, { useState } from 'react';
import { User, Post } from './types';
import { auth } from './services/auth';
import { db } from './services/db';
import { AdminLayout } from './components/admin/AdminLayout';
import { UserNavbar } from './components/user/UserNavbar';
import { UserBottomNav } from './components/user/UserBottomNav';
import { UserHome } from './components/user/UserHome';
import { ExploreFeed } from './components/user/ExploreFeed';
import { NotificationsCenter } from './components/user/NotificationsCenter';
import { UserProfile } from './components/user/UserProfile';
import { CreatePostModal } from './components/user/CreatePostModal';
import { PostDetailModal } from './components/user/PostDetailModal';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(auth.getCurrentUser());
  const [viewMode, setViewMode] = useState<'admin' | 'user'>('user');
  const [userNavTab, setUserNavTab] = useState<string>('home');

  // Modal states
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleSwitchUser = (userId: string) => {
    const switched = auth.switchUser(userId);
    setCurrentUser(switched);
    // If switched to normal user while on admin view, switch back to user view
    if (switched.role === 'user' && viewMode === 'admin') {
      setViewMode('user');
    }
  };

  const handleSwitchToAdmin = () => {
    if (currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'moderator') {
      setViewMode('admin');
    } else {
      alert('Access restricted to verified administrators and moderators.');
    }
  };

  const handleOpenPostDetails = (post: Post) => {
    setSelectedPost(post);
  };

  const handleOfferHelp = (post: Post) => {
    setSelectedPost(post);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {viewMode === 'admin' && (currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'moderator') ? (
        // ==================== ADMIN EXPERIENCE (Section N) ====================
        <AdminLayout
          currentUser={currentUser}
          onSwitchToUserView={() => setViewMode('user')}
          onSwitchUser={handleSwitchUser}
        />
      ) : (
        // ==================== USER EXPERIENCE (Section T & U) ====================
        <div className="flex flex-col min-h-screen">
          <UserNavbar
            currentUser={currentUser}
            activeNav={userNavTab}
            onNavigate={(nav) => setUserNavTab(nav)}
            onOpenCreate={() => setCreatePostOpen(true)}
            onSwitchToAdmin={handleSwitchToAdmin}
            onSwitchUser={handleSwitchUser}
          />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
            {userNavTab === 'home' && (
              <UserHome
                currentUser={currentUser}
                onOpenPost={handleOpenPostDetails}
                onOfferHelp={handleOfferHelp}
                onOpenCreate={() => setCreatePostOpen(true)}
                onNavigateExplore={() => setUserNavTab('explore')}
              />
            )}

            {userNavTab === 'explore' && (
              <ExploreFeed
                currentUser={currentUser}
                onOpenPost={handleOpenPostDetails}
                onOfferHelp={handleOfferHelp}
              />
            )}

            {userNavTab === 'notifications' && (
              <NotificationsCenter currentUser={currentUser} />
            )}

            {userNavTab === 'profile' && (
              <UserProfile
                currentUser={currentUser}
                onOpenPost={handleOpenPostDetails}
              />
            )}
          </main>

          {/* Mobile Bottom Navigation */}
          <UserBottomNav
            activeNav={userNavTab}
            onNavigate={(nav) => setUserNavTab(nav)}
            onOpenCreate={() => setCreatePostOpen(true)}
          />

          {/* Modals */}
          <CreatePostModal
            currentUser={currentUser}
            isOpen={createPostOpen}
            onClose={() => setCreatePostOpen(false)}
            onPostCreated={(newPost) => {
              setSelectedPost(newPost);
            }}
          />

          <PostDetailModal
            post={selectedPost}
            currentUser={currentUser}
            isOpen={selectedPost !== null}
            onClose={() => setSelectedPost(null)}
            onPostUpdated={() => {
              if (selectedPost) {
                const refreshed = db.getPostById(selectedPost.id);
                setSelectedPost(refreshed || null);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
export default App;
