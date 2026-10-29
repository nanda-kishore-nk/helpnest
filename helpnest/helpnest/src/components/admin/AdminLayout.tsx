// src/components/admin/AdminLayout.tsx
import React, { useState } from 'react';
import { User } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminContent } from './AdminContent';
import { AdminInteractions } from './AdminInteractions';
import { AdminReports } from './AdminReports';
import { AdminAppeals } from './AdminAppeals';
import { AdminVerification } from './AdminVerification';
import { AdminAchievements } from './AdminAchievements';
import { AdminActivityExplorer } from './AdminActivityExplorer';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminSettings } from './AdminSettings';
import { 
  LayoutDashboard, Users, FileQuestion, Gift, HeartHandshake, 
  ShieldAlert, Scale, ShieldCheck, Award, Tag, Activity, 
  BarChart3, Bell, Lock, Settings, Search, Menu, X, ArrowLeftRight, LogOut, Shield 
} from 'lucide-react';

interface AdminLayoutProps {
  currentUser: User;
  onSwitchToUserView: () => void;
  onAdminLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  onSwitchToUserView,
  onAdminLogout
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const openReportsCount = db.getReports().filter(r => r.status === 'PENDING').length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'requests', label: 'Requests', icon: FileQuestion },
    { id: 'offers', label: 'Offers', icon: Gift },
    { id: 'interactions', label: 'Interactions', icon: HeartHandshake },
    { id: 'reports', label: 'Reports', icon: ShieldAlert, badge: openReportsCount > 0 ? openReportsCount : undefined },
    { id: 'appeals', label: 'Appeals', icon: Scale },
    { id: 'verification', label: 'Verification', icon: ShieldCheck },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'audit', label: 'Audit Logs', icon: Lock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      {/* ==================== DESKTOP LEFT SIDEBAR (Section N) ==================== */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex-shrink-0 min-h-screen">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white font-display">HelpNest</h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-400 block -mt-0.5">
                Admin Command
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-rose-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={onSwitchToUserView}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>View Public Platform</span>
          </button>

          <button
            onClick={onAdminLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-semibold border border-rose-900/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock & Log Out Admin</span>
          </button>
        </div>
      </aside>

      {/* ==================== MOBILE TOP BAR ==================== */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white font-display">HelpNest Admin</span>
            <span className="text-[10px] text-indigo-400 block -mt-1">{currentUser.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToUserView}
            className="px-2.5 py-1 text-[11px] font-semibold text-indigo-300 bg-slate-800 rounded-lg"
          >
            Public Site
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm pt-16 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-1 max-h-[80vh] overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={onAdminLogout}
                className="w-full text-left px-3 py-2 text-rose-400 text-xs font-semibold flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MAIN CONTENT WRAPPER ==================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          {/* Global Search Input */}
          <div className="relative w-72 hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across all admin sections..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Right Topbar Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Zero-Budget Badge */}
            <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>₹0 / $0 Zero-Budget Active</span>
            </span>

            {/* Notifications icon */}
            <button
              onClick={() => setActiveTab('reports')}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-colors"
              title="Open Reports"
            >
              <Bell className="w-4 h-4" />
              {openReportsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-slate-900 block leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-indigo-600 font-semibold uppercase">{currentUser.role.replace('_', ' ')}</span>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                  <div className="p-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900">{currentUser.name}</div>
                    <span className="text-[10px] text-slate-400 font-mono block">{currentUser.email}</span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Platform Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        onSwitchToUserView();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                      <span>View Public Site</span>
                    </button>
                  </div>

                  <div className="p-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onAdminLogout();
                      }}
                      className="w-full p-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out of Admin</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Pane */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <AdminOverview adminActor={currentUser} onNavigateTab={(t) => setActiveTab(t)} />
          )}
          {activeTab === 'users' && (
            <AdminUsers adminActor={currentUser} />
          )}
          {activeTab === 'requests' && (
            <AdminContent adminActor={currentUser} typeFilterInitial="REQUEST" />
          )}
          {activeTab === 'offers' && (
            <AdminContent adminActor={currentUser} typeFilterInitial="OFFER" />
          )}
          {activeTab === 'interactions' && (
            <AdminInteractions adminActor={currentUser} />
          )}
          {activeTab === 'reports' && (
            <AdminReports adminActor={currentUser} />
          )}
          {activeTab === 'appeals' && (
            <AdminAppeals adminActor={currentUser} />
          )}
          {activeTab === 'verification' && (
            <AdminVerification adminActor={currentUser} />
          )}
          {activeTab === 'achievements' && (
            <AdminAchievements adminActor={currentUser} />
          )}
          {activeTab === 'categories' && (
            <AdminContent adminActor={currentUser} />
          )}
          {activeTab === 'activity' && (
            <AdminActivityExplorer adminActor={currentUser} />
          )}
          {activeTab === 'analytics' && (
            <AdminAnalytics adminActor={currentUser} />
          )}
          {activeTab === 'audit' && (
            <AdminAuditLogs adminActor={currentUser} />
          )}
          {activeTab === 'settings' && (
            <AdminSettings adminActor={currentUser} />
          )}
        </main>
      </div>
    </div>
  );
};
