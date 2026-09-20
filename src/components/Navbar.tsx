import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ViewTab } from '../types';
import { 
  GraduationCap, 
  Search, 
  Users, 
  MessageSquare, 
  UserCheck, 
  LayoutDashboard, 
  User, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenAuth: (tab: 'login' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenAuth }) => {
  const { user, logout, notifications, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [switchMenuOpen, setSwitchMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const handleTabClick = (tab: ViewTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  };

  const handleSwitchAccount = async (email: string) => {
    setSwitchMenuOpen(false);
    await demoLogin(email);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <button
              id="navbar-logo-btn"
              onClick={() => handleTabClick(user ? 'dashboard' : 'dashboard')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  CampusConnect
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Campus Network
                  </span>
                </span>
                <span className="hidden md:block text-[11px] font-medium text-slate-400">
                  Connect. Discover. Recover.
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links (when logged in) */}
          {user ? (
            <nav className="hidden lg:flex items-center gap-1">
              <button
                id="nav-dashboard-btn"
                onClick={() => handleTabClick('dashboard')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  currentTab === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>

              <button
                id="nav-lostfound-btn"
                onClick={() => handleTabClick('lost-found')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all relative ${
                  currentTab === 'lost-found'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Search className="w-4 h-4" />
                Lost & Found
                {notifications.possibleMatchCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Matches found!" />
                )}
              </button>

              <button
                id="nav-connector-btn"
                onClick={() => handleTabClick('connector')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  currentTab === 'connector'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4" />
                Campus Connector
              </button>

              <button
                id="nav-connections-btn"
                onClick={() => handleTabClick('connections')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all relative ${
                  currentTab === 'connections'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Connections
                {notifications.pendingRequestsCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white leading-none">
                    {notifications.pendingRequestsCount}
                  </span>
                )}
              </button>

              <button
                id="nav-chat-btn"
                onClick={() => handleTabClick('chat')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all relative ${
                  currentTab === 'chat'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Chat
                {notifications.unreadMessagesCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white leading-none">
                    {notifications.unreadMessagesCount}
                  </span>
                )}
              </button>
            </nav>
          ) : (
            /* Public preview navigation */
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl"
              >
                Explore Lost & Found
              </button>
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl"
              >
                Discover Peers
              </button>
            </nav>
          )}

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                {/* Reviewer Multi-Account Switcher Button */}
                <div className="relative">
                  <button
                    id="switch-account-btn"
                    onClick={() => setSwitchMenuOpen(!switchMenuOpen)}
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-800 text-xs font-semibold transition-all"
                    title="Switch user account for multi-account testing"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Test Account</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>

                  {switchMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                      <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                        Two-Account Testing
                      </div>
                      <button
                        onClick={() => handleSwitchAccount('aravind@campus.edu')}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                          user.email === 'aravind@campus.edu' ? 'bg-indigo-50 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <img
                          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80"
                          alt="Aravind"
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-semibold">Aravind Sharma</p>
                          <p className="text-[10px] text-slate-500">Student A (CSE • Lost Wallet)</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleSwitchAccount('priya@campus.edu')}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                          user.email === 'priya@campus.edu' ? 'bg-indigo-50 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80"
                          alt="Priya"
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-semibold">Priya Patel</p>
                          <p className="text-[10px] text-slate-500">Student B (IT • Found Wallet)</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleSwitchAccount('rohit@campus.edu')}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                          user.email === 'rohit@campus.edu' ? 'bg-indigo-50 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <img
                          src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&h=80&q=80"
                          alt="Rohit"
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-semibold">Rohit Verma</p>
                          <p className="text-[10px] text-slate-500">Student C (ECE • Pending Conn)</p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    id="navbar-notifications-btn"
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.totalNotifications > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800">Notifications</span>
                        <span className="text-[11px] text-indigo-600 font-semibold">
                          {notifications.totalNotifications} New
                        </span>
                      </div>
                      <div className="space-y-2 pt-2">
                        {notifications.pendingRequestsCount > 0 && (
                          <button
                            onClick={() => handleTabClick('connections')}
                            className="w-full text-left p-2 rounded-xl bg-indigo-50/60 hover:bg-indigo-50 text-xs flex items-center justify-between transition-colors"
                          >
                            <span className="font-semibold text-indigo-900">
                              {notifications.pendingRequestsCount} Pending Connection Request(s)
                            </span>
                            <span className="text-[10px] text-indigo-600 font-bold underline">Review</span>
                          </button>
                        )}
                        {notifications.unreadMessagesCount > 0 && (
                          <button
                            onClick={() => handleTabClick('chat')}
                            className="w-full text-left p-2 rounded-xl bg-emerald-50/60 hover:bg-emerald-50 text-xs flex items-center justify-between transition-colors"
                          >
                            <span className="font-semibold text-emerald-900">
                              {notifications.unreadMessagesCount} Unread Message(s)
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold underline">Open Chat</span>
                          </button>
                        )}
                        {notifications.possibleMatchCount > 0 && (
                          <button
                            onClick={() => handleTabClick('lost-found')}
                            className="w-full text-left p-2 rounded-xl bg-amber-50/60 hover:bg-amber-50 text-xs flex items-center justify-between transition-colors"
                          >
                            <span className="font-semibold text-amber-900">
                              AI Match Found for your items!
                            </span>
                            <span className="text-[10px] text-amber-600 font-bold underline">View Match</span>
                          </button>
                        )}
                        {notifications.totalNotifications === 0 && (
                          <div className="py-4 text-center text-xs text-slate-400">
                            No unread notifications right now.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar & Dropdown */}
                <div className="relative">
                  <button
                    id="user-profile-menu-btn"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                    <div className="hidden sm:block text-left text-xs pr-1">
                      <p className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">{user.name}</p>
                      <p className="text-[10px] text-slate-400">{user.branch} • {user.year}</p>
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-50">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="font-bold text-xs text-slate-800">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>
                      <button
                        id="user-menu-profile-btn"
                        onClick={() => handleTabClick('profile')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile & Settings
                      </button>
                      <button
                        id="user-menu-lostfound-btn"
                        onClick={() => handleTabClick('lost-found')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Search className="w-4 h-4 text-slate-400" />
                        Report Item / View Matches
                      </button>
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        id="user-menu-logout-btn"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Logged out state */
              <div className="flex items-center gap-2">
                <button
                  id="header-signin-btn"
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Log In
                </button>
                <button
                  id="header-getstarted-btn"
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile hamburger menu toggle */}
            {user && (
              <button
                id="mobile-menu-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && user && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 shadow-lg">
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 ${
              currentTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => handleTabClick('lost-found')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 ${
              currentTab === 'lost-found' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
            }`}
          >
            <Search className="w-4 h-4" />
            Lost & Found
          </button>
          <button
            onClick={() => handleTabClick('connector')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 ${
              currentTab === 'connector' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Campus Connector
          </button>
          <button
            onClick={() => handleTabClick('connections')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 ${
              currentTab === 'connections' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Connections ({notifications.pendingRequestsCount} Pending)
          </button>
          <button
            onClick={() => handleTabClick('chat')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 ${
              currentTab === 'chat' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat ({notifications.unreadMessagesCount} Unread)
          </button>
          <button
            onClick={() => handleTabClick('profile')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 ${
              currentTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
            }`}
          >
            <User className="w-4 h-4" />
            Profile & Settings
          </button>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 p-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <button
              onClick={() => handleSwitchAccount(user.email === 'aravind@campus.edu' ? 'priya@campus.edu' : 'aravind@campus.edu')}
              className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5 p-2 bg-indigo-50 rounded-lg"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Switch to Student {user.email === 'aravind@campus.edu' ? 'B' : 'A'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
