import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, ChatMessage, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useToast } from './Toast';
import { 
  MessageSquare, 
  Send, 
  Search, 
  UserCheck, 
  Users, 
  ArrowLeft,
  CheckCheck,
  Check
} from 'lucide-react';

interface ChatProps {
  initialPeerId?: string | null;
  onClearInitialPeerId?: () => void;
  onNavigateToConnector?: () => void;
}

export const Chat: React.FC<ChatProps> = ({ 
  initialPeerId, 
  onClearInitialPeerId,
  onNavigateToConnector 
}) => {
  const { user, refreshNotifications } = useAuth();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activePeer, setActivePeer] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile view state: 'list' | 'conversation'
  const [mobileView, setMobileView] = useState<'list' | 'conversation'>('list');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch conversations list
  const loadConversations = useCallback(async () => {
    try {
      const res = await api.chat.getConversations();
      setConversations(res.conversations);
      return res.conversations;
    } catch (err) {
      console.error('Failed to load conversations:', err);
      return [];
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // 2. Fetch messages for active peer
  const loadMessages = useCallback(async (peerId: string, isPolling = false) => {
    if (!isPolling) setLoadingMessages(true);
    try {
      const res = await api.chat.getMessages(peerId);
      setMessages(res.messages);
      if (!isPolling) {
        setTimeout(scrollToBottom, 100);
      }
    } catch (err: any) {
      if (!isPolling) {
        showToast(err.message || 'Could not load messages', 'error');
      }
    } finally {
      if (!isPolling) setLoadingMessages(false);
    }
  }, [showToast]);

  // Initial load
  useEffect(() => {
    loadConversations().then(convs => {
      if (initialPeerId) {
        // If an initial peer ID was passed, select them
        const found = convs.find(c => c.peer.id === initialPeerId);
        if (found) {
          setActivePeer(found.peer);
          setMobileView('conversation');
        } else {
          // If not in conversations yet, fetch their profile
          api.users.getById(initialPeerId).then(res => {
            if (res.connectionStatus === 'Connected') {
              setActivePeer(res.user);
              setMobileView('conversation');
            } else {
              showToast('You can only chat with confirmed connections.', 'info');
            }
          }).catch(() => {});
        }
        if (onClearInitialPeerId) onClearInitialPeerId();
      } else if (convs.length > 0 && window.innerWidth >= 1024) {
        // Desktop auto-select first conversation
        setActivePeer(convs[0].peer);
      }
    });
  }, [loadConversations, initialPeerId, onClearInitialPeerId, showToast]);

  // Load messages when active peer changes
  useEffect(() => {
    if (activePeer) {
      loadMessages(activePeer.id);
      refreshNotifications();
    }
  }, [activePeer, loadMessages, refreshNotifications]);

  // Polling for real-time chat updates (every 3 seconds)
  useEffect(() => {
    if (!activePeer) return;

    const interval = setInterval(() => {
      loadMessages(activePeer.id, true);
      loadConversations();
    }, 3000);

    return () => clearInterval(interval);
  }, [activePeer, loadMessages, loadConversations]);

  // Scroll to bottom on messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activePeer || !inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await api.chat.sendMessage(activePeer.id, text);
      setMessages(prev => [...prev, res.data]);
      loadConversations();
      setTimeout(scrollToBottom, 50);
    } catch (err: any) {
      showToast(err.message || 'Failed to send message.', 'error');
      setInputText(text); // restore
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.peer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.peer.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden flex h-[calc(100vh-140px)] min-h-[550px]">
        
        {/* =========================================================
            LEFT SIDEBAR: CONVERSATIONS LIST
           ========================================================= */}
        <div
          className={`w-full lg:w-80 border-r border-slate-200/80 flex flex-col bg-slate-50/50 ${
            mobileView === 'conversation' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-200/80 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                Messages
              </h2>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {conversations.length} Active
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search connected chats..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingConversations ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Loading chats...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No connected chats yet</p>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                  Only confirmed campus connections can message each other.
                </p>
                {onNavigateToConnector && (
                  <button
                    onClick={onNavigateToConnector}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Find peers to connect
                  </button>
                )}
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = activePeer?.id === conv.peer.id;

                return (
                  <button
                    key={conv.peer.id}
                    id={`chat-conv-${conv.peer.id}`}
                    onClick={() => {
                      setActivePeer(conv.peer);
                      setMobileView('conversation');
                    }}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/70 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-100/60 bg-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.peer.profilePhoto}
                        alt={conv.peer.name}
                        className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold shadow-xs animate-pulse">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {conv.peer.name}
                        </h4>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-indigo-600 font-medium truncate">
                        {conv.peer.branch} • {conv.peer.year} Year
                      </p>

                      {conv.lastMessage && (
                        <p className={`text-[11px] truncate mt-0.5 ${
                          conv.unreadCount > 0 ? 'font-bold text-slate-900' : 'text-slate-500'
                        }`}>
                          {conv.lastMessage.senderId === user?.id ? 'You: ' : ''}
                          {conv.lastMessage.message}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* =========================================================
            RIGHT MAIN WINDOW: CHAT CONVERSATION
           ========================================================= */}
        <div
          className={`flex-1 flex flex-col bg-slate-50/30 ${
            mobileView === 'list' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {activePeer ? (
            <>
              {/* Conversation Top Header */}
              <div className="p-4 border-b border-slate-200/80 bg-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileView('list')}
                    className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <img
                    src={activePeer.profilePhoto}
                    alt={activePeer.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                  />

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {activePeer.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span>{activePeer.branch} (Sec {activePeer.section})</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        Connected Peer
                      </span>
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                    Safe Messaging
                  </span>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {loadingMessages ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Loading conversation history...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 space-y-2">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">Start the conversation!</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Say hello to {activePeer.name}. You can coordinate item handovers, exchange study notes, or collaborate on campus projects.
                    </p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isSender = msg.senderId === user?.id;

                    return (
                      <div
                        key={msg.id}
                        id={`chat-msg-${msg.id}`}
                        className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                            isSender
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                          }`}
                        >
                          <p className="break-words whitespace-pre-wrap">{msg.message}</p>
                        </div>

                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isSender && (
                            <span className="text-indigo-400">
                              {msg.read ? (
                                <CheckCheck className="w-3.5 h-3.5 text-indigo-500" title="Read" />
                              ) : (
                                <Check className="w-3.5 h-3.5" title="Sent" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input & Send Form */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    id="chat-message-input"
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`Message ${activePeer.name}...`}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                  <button
                    id="chat-send-btn"
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl shadow-xs transition-all disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* No Conversation Selected Placeholder */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Select a Conversation</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Choose a connected peer from the left sidebar to read message history and exchange messages.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
