import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ViewTab, DashboardStats, MatchResult } from '../types';
import { api } from '../api/client';
import { 
  Search, 
  Users, 
  MessageSquare, 
  UserCheck, 
  Sparkles, 
  PlusCircle, 
  ArrowRight, 
  Clock, 
  MapPin, 
  AlertCircle,
  Tag
} from 'lucide-react';

interface DashboardProps {
  onSelectTab: (tab: ViewTab) => void;
  onOpenReportModal: (type: 'Lost' | 'Found') => void;
  onInspectMatch: (item: any, matches: MatchResult[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onSelectTab, 
  onOpenReportModal,
  onInspectMatch 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalLost: 0,
    totalFound: 0,
    possibleMatchesCount: 0,
    connectionsCount: 0,
    unreadMessagesCount: 0,
    pendingRequestsCount: 0,
    myItemsCount: 0,
  });
  const [userMatchSummaries, setUserMatchSummaries] = useState<Array<{ myItem: any; matchesCount: number; topMatch: MatchResult }>>([]);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [recentConnections, setRecentConnections] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const data = await api.stats.getDashboard();
        setStats(data.stats);
        setUserMatchSummaries(data.userMatchSummaries);
        setRecentItems(data.recentActivity.recentItems || []);
        setRecentConnections(data.recentActivity.recentConnections || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Abstract circle backdrop */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={user?.profilePhoto}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Welcome back, {user?.name}!
                </h1>
              </div>
              <p className="text-indigo-100 text-sm max-w-xl">
                {user?.branch} Engineering • Section {user?.section} • {user?.year} Year
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-xs bg-white/15 px-2.5 py-1 rounded-lg font-medium text-white">
                  Skills: {user?.skills.slice(0, 3).join(', ')}
                </span>
                <span className="text-xs bg-white/15 px-2.5 py-1 rounded-lg font-medium text-white">
                  Interests: {user?.interests.slice(0, 3).join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="dash-report-lost-btn"
              onClick={() => onOpenReportModal('Lost')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Report Lost Item
            </button>
            <button
              id="dash-report-found-btn"
              onClick={() => onOpenReportModal('Found')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Report Found Item
            </button>
            <button
              id="dash-find-students-btn"
              onClick={() => onSelectTab('connector')}
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-sm transition-all flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              Find Students
            </button>
          </div>
        </div>
      </div>

      {/* Possible Matches Alert Banner (if user has any matches!) */}
      {userMatchSummaries.length > 0 && (
        <div id="possible-matches-alert" className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-indigo-50/50 to-white border border-amber-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  High-Probability Belonging Matches Detected!
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                  {stats.possibleMatchesCount} Match{stats.possibleMatchesCount !== 1 ? 'es' : ''}
                </span>
              </div>
              <p className="text-slate-600 text-sm mt-0.5">
                Our AI text-similarity algorithm identified possible matches for your reported item: <strong className="text-slate-900">"{userMatchSummaries[0]?.myItem.title}"</strong> ({userMatchSummaries[0]?.topMatch.matchPercentage}).
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('lost-found')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>Review Possible Matches</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dashboard Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Lost */}
        <button
          onClick={() => onSelectTab('lost-found')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lost Items</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.totalLost}</p>
          <p className="text-[11px] text-slate-400 mt-1">Active on campus</p>
        </button>

        {/* Card 2: Total Found */}
        <button
          onClick={() => onSelectTab('lost-found')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Found Items</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.totalFound}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting claim</p>
        </button>

        {/* Card 3: Possible Matches */}
        <button
          onClick={() => onSelectTab('lost-found')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Matches</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-indigo-600">{stats.possibleMatchesCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">For your posts</p>
        </button>

        {/* Card 4: Connections */}
        <button
          onClick={() => onSelectTab('connections')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-violet-300 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Connections</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.connectionsCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats.pendingRequestsCount > 0 ? `${stats.pendingRequestsCount} incoming pending` : 'Campus peers'}
          </p>
        </button>

        {/* Card 5: Unread Messages */}
        <button
          onClick={() => onSelectTab('chat')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all text-left group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unread Chat</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-3xl font-extrabold ${stats.unreadMessagesCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {stats.unreadMessagesCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Direct peer chat</p>
        </button>

      </div>

      {/* Quick Action Navigation Bar */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Quick Access Hub
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => onOpenReportModal('Lost')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800">Report Lost</p>
              <p className="text-[10px] text-slate-500">Register misplaced</p>
            </div>
          </button>

          <button
            onClick={() => onOpenReportModal('Found')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800">Report Found</p>
              <p className="text-[10px] text-slate-500">Found student item</p>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('connector')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800">Find Students</p>
              <p className="text-[10px] text-slate-500">Discover by branch</p>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('connections')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800">Connections</p>
              <p className="text-[10px] text-slate-500">Manage requests</p>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('chat')}
            className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all flex items-center gap-2.5 col-span-2 sm:col-span-1"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800">Direct Chat</p>
              <p className="text-[10px] text-slate-500">Peer messaging</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Recent Lost & Found Posts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Recent Lost & Found Posts
            </h3>
            <button
              onClick={() => onSelectTab('lost-found')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentItems.map(item => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`px-2 py-1 rounded-md text-[10px] font-extrabold uppercase shrink-0 ${
                      item.type === 'Lost'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.type}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {item.location} • by {item.userName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectTab('lost-found')}
                  className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors shrink-0"
                >
                  Inspect
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Connections & Social Activity */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-600" />
              Recent Connection Activity
            </h3>
            <button
              onClick={() => onSelectTab('connections')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View Connections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentConnections.length > 0 ? (
            <div className="space-y-3">
              {recentConnections.map(conn => (
                <div
                  key={conn.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={conn.peerPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&h=60&q=80'}
                      alt={conn.peerName}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{conn.peerName}</p>
                      <p className="text-[11px] text-slate-500">
                        {conn.status === 'Accepted'
                          ? 'Connected student'
                          : conn.isIncoming
                          ? 'Wants to connect with you'
                          : 'Pending invitation sent'}
                      </p>
                    </div>
                  </div>

                  {conn.status === 'Accepted' ? (
                    <button
                      onClick={() => onSelectTab('chat')}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      Chat
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectTab('connections')}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      Review
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p>No connections yet. Discover classmates in Campus Connector!</p>
              <button
                onClick={() => onSelectTab('connector')}
                className="mt-3 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                Find Peers Now
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
