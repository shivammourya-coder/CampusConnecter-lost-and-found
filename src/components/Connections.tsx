import React, { useState, useEffect, useCallback } from 'react';
import { Connection, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useToast } from './Toast';
import { 
  UserCheck, 
  UserPlus, 
  Clock, 
  Check, 
  X, 
  MessageSquare, 
  Trash2, 
  Search,
  Users
} from 'lucide-react';

interface ConnectionsProps {
  onNavigateToChatWithUser: (userId: string) => void;
}

interface IncomingItem {
  connectionId: string;
  createdAt: string;
  sender: User;
}

interface SentItem {
  connectionId: string;
  createdAt: string;
  receiver: User;
}

export const Connections: React.FC<ConnectionsProps> = ({ onNavigateToChatWithUser }) => {
  const { user, refreshNotifications } = useAuth();
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'received' | 'sent' | 'connected'>('received');
  const [loading, setLoading] = useState(true);

  const [receivedRequests, setReceivedRequests] = useState<IncomingItem[]>([]);
  const [sentRequests, setSentRequests] = useState<SentItem[]>([]);
  const [confirmedConnections, setConfirmedConnections] = useState<Connection[]>([]);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchConnectionsData = useCallback(async () => {
    setLoading(true);
    try {
      const [requestsRes, confirmedRes] = await Promise.all([
        api.connections.getRequests(),
        api.connections.getAll(),
      ]);

      setReceivedRequests(requestsRes.incoming || []);
      setSentRequests(requestsRes.sent || []);
      setConfirmedConnections(confirmedRes.connections || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch connections', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchConnectionsData();
  }, [fetchConnectionsData]);

  const handleAccept = async (connectionId: string, peerName: string) => {
    setActionLoadingId(connectionId);
    try {
      await api.connections.accept(connectionId);
      showToast(`Connected with ${peerName}! You can now message them.`, 'success');
      fetchConnectionsData();
      refreshNotifications();
    } catch (err: any) {
      showToast(err.message || 'Failed to accept connection', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (connectionId: string) => {
    setActionLoadingId(connectionId);
    try {
      await api.connections.reject(connectionId);
      showToast('Connection request declined.', 'info');
      fetchConnectionsData();
      refreshNotifications();
    } catch (err: any) {
      showToast(err.message || 'Failed to decline request', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveOrCancel = async (connectionId: string, isCancel: boolean) => {
    setActionLoadingId(connectionId);
    try {
      await api.connections.remove(connectionId);
      showToast(isCancel ? 'Connection request cancelled' : 'Connection removed', 'info');
      fetchConnectionsData();
      refreshNotifications();
    } catch (err: any) {
      showToast(err.message || 'Failed to perform action', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const q = searchFilter.toLowerCase().trim();

  const filteredReceived = receivedRequests.filter(
    item =>
      !q ||
      item.sender.name.toLowerCase().includes(q) ||
      item.sender.branch.toLowerCase().includes(q) ||
      item.sender.skills.some(s => s.toLowerCase().includes(q))
  );

  const filteredSent = sentRequests.filter(
    item =>
      !q ||
      item.receiver.name.toLowerCase().includes(q) ||
      item.receiver.branch.toLowerCase().includes(q) ||
      item.receiver.skills.some(s => s.toLowerCase().includes(q))
  );

  const filteredConfirmed = confirmedConnections.filter(
    item =>
      !q ||
      item.peer.name.toLowerCase().includes(q) ||
      item.peer.branch.toLowerCase().includes(q) ||
      item.peer.skills.some(s => s.toLowerCase().includes(q))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600" />
            Campus Connections
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage incoming peer requests, track sent invitations, and collaborate with connected students.
          </p>
        </div>

        {/* Sub-tabs pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveSubTab('received')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
              activeSubTab === 'received'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Received ({receivedRequests.length})
            {receivedRequests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px]">
                {receivedRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('sent')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'sent'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sent ({sentRequests.length})
          </button>

          <button
            onClick={() => setActiveSubTab('connected')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'connected'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Connections ({confirmedConnections.length})
          </button>
        </div>
      </div>

      {/* Search within connections */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Filter connections by student name, branch, or skill..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Main List Body */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Loading connection records...
        </div>
      ) : (
        <div>
          {/* TAB 1: RECEIVED REQUESTS */}
          {activeSubTab === 'received' && (
            <div>
              {filteredReceived.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-8">
                  <UserPlus className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No pending incoming requests</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    When other students send you a connection request, it will appear here for your review.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredReceived.map(req => {
                    const peer = req.sender;
                    const isActing = actionLoadingId === req.connectionId;

                    return (
                      <div
                        key={req.connectionId}
                        id={`request-card-${req.connectionId}`}
                        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all"
                      >
                        <div>
                          <div className="flex items-start gap-3 mb-3">
                            <img
                              src={peer?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&h=60&q=80'}
                              alt={peer?.name}
                              className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-bold text-slate-900 truncate">{peer?.name}</h4>
                              <p className="text-xs font-semibold text-indigo-600">
                                {peer?.branch} • Sec {peer?.section} • {peer?.year} Year
                              </p>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                Sent {new Date(req.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {peer?.skills && peer.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {peer.skills.slice(0, 3).map(skill => (
                                <span
                                  key={skill}
                                  className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                          <button
                            onClick={() => handleAccept(req.connectionId, peer?.name || 'Student')}
                            disabled={isActing}
                            className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleReject(req.connectionId)}
                            disabled={isActing}
                            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SENT REQUESTS */}
          {activeSubTab === 'sent' && (
            <div>
              {filteredSent.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-8">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No sent requests pending</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    You have no active pending requests sent to other students.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSent.map(req => {
                    const peer = req.receiver;
                    const isActing = actionLoadingId === req.connectionId;

                    return (
                      <div
                        key={req.connectionId}
                        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start gap-3 mb-3">
                            <img
                              src={peer?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&h=60&q=80'}
                              alt={peer?.name}
                              className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-bold text-slate-900 truncate">{peer?.name}</h4>
                              <p className="text-xs font-semibold text-slate-600">
                                {peer?.branch} • {peer?.year} Year
                              </p>
                              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase">
                                Awaiting Approval
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            Sent {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleRemoveOrCancel(req.connectionId, true)}
                            disabled={isActing}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
                          >
                            Cancel Request
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONFIRMED CONNECTIONS */}
          {activeSubTab === 'connected' && (
            <div>
              {filteredConfirmed.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-8">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No campus connections yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Go to Campus Connector to discover classmates, send connection requests, and build your campus network!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredConfirmed.map(conn => {
                    const peer = conn.peer;
                    const isActing = actionLoadingId === conn.connectionId;

                    return (
                      <div
                        key={conn.connectionId}
                        id={`connected-card-${conn.connectionId}`}
                        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all"
                      >
                        <div>
                          <div className="flex items-start gap-3 mb-3">
                            <img
                              src={peer?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&h=60&q=80'}
                              alt={peer?.name}
                              className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-100 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-bold text-slate-900 truncate">{peer?.name}</h4>
                              <p className="text-xs font-semibold text-emerald-700">
                                {peer?.branch} • Sec {peer?.section} • {peer?.year} Year
                              </p>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">{peer?.email}</p>
                            </div>
                          </div>

                          {peer?.skills && peer.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {peer.skills.slice(0, 3).map(skill => (
                                <span
                                  key={skill}
                                  className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (peer?.id) onNavigateToChatWithUser(peer.id);
                            }}
                            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Open Chat</span>
                          </button>
                          <button
                            onClick={() => handleRemoveOrCancel(conn.connectionId, false)}
                            disabled={isActing}
                            title="Remove connection"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
