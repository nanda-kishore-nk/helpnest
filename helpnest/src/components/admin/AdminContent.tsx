// src/components/admin/AdminContent.tsx
import React, { useState } from 'react';
import { Post, User, PostCategory, UrgencyLevel, PostStatus, PostType } from '../../types';
import { db } from '../../services/db';
import { CategoryBadge, UrgencyBadge, PostStatusBadge } from '../common/Badge';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { 
  Search, Filter, Edit3, Trash2, RotateCcw, AlertTriangle, 
  CheckCircle2, XCircle, Clock, MapPin, ShieldAlert, Eye, X 
} from 'lucide-react';

interface AdminContentProps {
  adminActor: User;
  typeFilterInitial?: PostType | 'ALL';
}

export const AdminContent: React.FC<AdminContentProps> = ({ 
  adminActor, 
  typeFilterInitial = 'ALL' 
}) => {
  const [posts, setPosts] = useState<Post[]>(db.getPosts());
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>(typeFilterInitial);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected post for inspection
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Edit post modal state
  const [editPostModal, setEditPostModal] = useState<{
    isOpen: boolean;
    post?: Post;
    title: string;
    description: string;
    category: PostCategory;
    urgency: UrgencyLevel;
    status: PostStatus;
    reason: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    category: 'blood',
    urgency: 'MEDIUM',
    status: 'ACTIVE',
    reason: ''
  });

  // Remove / Restore confirmation
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    isDestructive: boolean;
    action: 'REMOVE' | 'RESTORE' | 'CLOSE';
    targetPost?: Post;
  }>({
    isOpen: false,
    title: '',
    description: '',
    isDestructive: true,
    action: 'REMOVE'
  });

  const refreshData = () => {
    const fresh = db.getPosts();
    setPosts(fresh);
    if (selectedPost) {
      const refreshed = fresh.find(p => p.id === selectedPost.id);
      setSelectedPost(refreshed || null);
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.locality.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || p.type === typeFilter;
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  const handleSaveEdit = () => {
    if (!editPostModal.post || !editPostModal.reason.trim()) {
      alert('An administrative reason is required to maintain audit integrity.');
      return;
    }

    db.adminUpdatePost(
      editPostModal.post.id,
      {
        title: editPostModal.title.trim(),
        description: editPostModal.description.trim(),
        category: editPostModal.category,
        urgency: editPostModal.urgency,
        status: editPostModal.status,
      },
      adminActor,
      editPostModal.reason.trim()
    );

    setEditPostModal(prev => ({ ...prev, isOpen: false }));
    refreshData();
  };

  const handleConfirmAction = (reason?: string) => {
    const { action, targetPost } = confirmModal;
    if (!targetPost) return;

    if (action === 'REMOVE') {
      db.adminRemovePost(targetPost.id, reason || 'Removed for policy violation', adminActor);
    } else if (action === 'RESTORE') {
      db.adminRestorePost(targetPost.id, reason || 'Restored by administrator', adminActor);
    } else if (action === 'CLOSE') {
      db.adminUpdatePost(targetPost.id, { status: 'COMPLETED' }, adminActor, reason || 'Manually closed by administrator');
    }

    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    refreshData();
  };

  // Associated interactions and reports for drawer
  const postInteractions = selectedPost ? db.getInteractions().filter(i => i.postId === selectedPost.id) : [];
  const postReports = selectedPost ? db.getReports().filter(r => r.targetType === 'POST' && r.targetId === selectedPost.id) : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900">
          {typeFilterInitial === 'REQUEST' ? 'Requests Management' : 
           typeFilterInitial === 'OFFER' ? 'Offers Management' : 'Content & Post Management'}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Moderate, edit, re-categorize, and inspect community mutual aid posts with auditable administrator attribution
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search posts by title, description, creator, or locality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="ALL">All Types</option>
            <option value="REQUEST">Requests Only</option>
            <option value="OFFER">Offers Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="blood">Blood Donation</option>
            <option value="rides">Ride Share</option>
            <option value="education">Education</option>
            <option value="items">Items & Aid</option>
            <option value="lostfound">Lost & Found</option>
            <option value="events">Events</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="REMOVED">Removed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Post Title & Creator</th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Urgency</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Locality</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No posts found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate" title={post.title}>
                        {post.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span>by {post.requesterName}</span>
                        {post.requesterVerified && <VerifiedBadge />}
                      </div>
                      {/* Section C: Administrator edit indicator */}
                      {post.editedBy && (
                        <div className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded inline-block mt-1">
                          Edited by administrator ({post.editedBy.userName})
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        post.type === 'REQUEST' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {post.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <CategoryBadge category={post.category} />
                    </td>

                    <td className="py-3.5 px-3">
                      <UrgencyBadge urgency={post.urgency} />
                    </td>

                    <td className="py-3.5 px-3">
                      <PostStatusBadge status={post.status} />
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 truncate max-w-[140px]" title={post.location.locality}>
                      <span className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{post.location.locality}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPost(post)}
                          title="View Details & Interactions"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditPostModal({
                              isOpen: true,
                              post,
                              title: post.title,
                              description: post.description,
                              category: post.category,
                              urgency: post.urgency,
                              status: post.status,
                              reason: ''
                            });
                          }}
                          title="Edit Post (as Administrator)"
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {post.status !== 'REMOVED' ? (
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: `Remove Post: "${post.title}"`,
                                description: 'Removing this post will hide it from public search and neighborhood discovery feeds.',
                                isDestructive: true,
                                action: 'REMOVE',
                                targetPost: post
                              });
                            }}
                            title="Remove Post"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: `Restore Post: "${post.title}"`,
                                description: 'Restoring this post returns it to the active community mutual aid feed.',
                                isDestructive: false,
                                action: 'RESTORE',
                                targetPost: post
                              });
                            }}
                            title="Restore Post"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== POST DETAIL DRAWER (Section C) ==================== */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  {selectedPost.type} Lifecycle Inspection
                </span>
                <h3 className="text-base font-bold font-display mt-0.5 line-clamp-1">{selectedPost.title}</h3>
              </div>
              <button onClick={() => setSelectedPost(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={selectedPost.category} />
                <UrgencyBadge urgency={selectedPost.urgency} />
                <PostStatusBadge status={selectedPost.status} />
              </div>

              {/* Description */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Description</span>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{selectedPost.description}</p>
              </div>

              {/* Administrative Edit History (Section C) */}
              {selectedPost.editedBy && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Edited by Administrator (Section C Audit Record)
                  </span>
                  <div className="text-[11px] text-amber-800">
                    <div><span className="font-semibold">Administrator:</span> {selectedPost.editedBy.userName}</div>
                    <div><span className="font-semibold">Timestamp:</span> {new Date(selectedPost.editedBy.timestamp).toLocaleString()}</div>
                    {selectedPost.editedBy.reason && (
                      <div><span className="font-semibold">Reason:</span> {selectedPost.editedBy.reason}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Fulfilment Progress */}
              {selectedPost.fulfillmentTarget && (
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Fulfilment Progress:</span>
                  <span className="font-bold text-indigo-700 font-display">
                    {selectedPost.fulfillmentCurrent || 0} / {selectedPost.fulfillmentTarget} {selectedPost.unitLabel || 'units'}
                  </span>
                </div>
              )}

              {/* Associated Interactions */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Interactions & Helps Offered ({postInteractions.length})
                </h4>
                {postInteractions.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl text-center">No community interactions yet</p>
                ) : (
                  <div className="space-y-2">
                    {postInteractions.map(i => (
                      <div key={i.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span className="flex items-center gap-1">
                            {i.helperName} {i.helperVerified && <VerifiedBadge />}
                          </span>
                          <span className="text-[10px] text-indigo-600 uppercase font-bold">{i.status}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] italic">"{i.message}"</p>
                        <span className="text-[10px] text-slate-400 block">{new Date(i.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reports against this post */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Safety Reports ({postReports.length})
                </h4>
                {postReports.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl text-center">No reports filed against this content</p>
                ) : (
                  <div className="space-y-2">
                    {postReports.map(r => (
                      <div key={r.id} className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between font-bold text-rose-900">
                          <span>Reported for: {r.reason}</span>
                          <span className="text-[10px] uppercase">{r.status}</span>
                        </div>
                        <p className="text-rose-800 text-[11px]">{r.details}</p>
                        <span className="text-[10px] text-rose-500 block">Reported by {r.reporterName} on {new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setEditPostModal({
                    isOpen: true,
                    post: selectedPost,
                    title: selectedPost.title,
                    description: selectedPost.description,
                    category: selectedPost.category,
                    urgency: selectedPost.urgency,
                    status: selectedPost.status,
                    reason: ''
                  });
                }}
                className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100"
              >
                Edit Content
              </button>
              {selectedPost.status !== 'REMOVED' && (
                <button
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: `Remove Post: "${selectedPost.title}"`,
                      description: 'Are you sure you want to remove this post from public listing?',
                      isDestructive: true,
                      action: 'REMOVE',
                      targetPost: selectedPost
                    });
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                >
                  Remove Post
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== EDIT POST MODAL (Section C) ==================== */}
      {editPostModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-display">Admin Edit Post Content</h3>
                <p className="text-xs text-indigo-200">Will be visibly attributed as "Edited by administrator"</p>
              </div>
              <button onClick={() => setEditPostModal(prev => ({ ...prev, isOpen: false }))} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editPostModal.title}
                  onChange={(e) => setEditPostModal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Content Correction</label>
                <textarea
                  value={editPostModal.description}
                  onChange={(e) => setEditPostModal(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editPostModal.category}
                    onChange={(e) => setEditPostModal(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="blood">Blood</option>
                    <option value="rides">Rides</option>
                    <option value="education">Education</option>
                    <option value="items">Items</option>
                    <option value="lostfound">Lost & Found</option>
                    <option value="events">Events</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency</label>
                  <select
                    value={editPostModal.urgency}
                    onChange={(e) => setEditPostModal(prev => ({ ...prev, urgency: e.target.value as any }))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editPostModal.status}
                    onChange={(e) => setEditPostModal(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REMOVED">Removed</option>
                  </select>
                </div>
              </div>

              {/* Administrative Reason (Required by Section C) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Admin Edit <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Corrected hospital address formatting, removed private phone number..."
                  value={editPostModal.reason}
                  onChange={(e) => setEditPostModal(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setEditPostModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        isDestructive={confirmModal.isDestructive}
        requireReason={true}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
