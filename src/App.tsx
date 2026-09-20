import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { LostFound } from './components/LostFound';
import { CampusConnector } from './components/CampusConnector';
import { Connections } from './components/Connections';
import { Chat } from './components/Chat';
import { Profile } from './components/Profile';
import { AuthModal } from './components/AuthModal';
import { ViewTab, Item, MatchResult } from './types';
import { Sparkles, ArrowRightLeft, Users, Search, CheckCircle2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { user, demoLogin } = useAuth();
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  // Triggering Lost & Found report modal from outside
  const [initialReportType, setInitialReportType] = useState<'Lost' | 'Found' | null>(null);

  // Chat pre-selected peer when navigating from matches or connector
  const [chatPeerId, setChatPeerId] = useState<string | null>(null);

  const handleOpenAuth = (tab: 'login' | 'signup' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleDemoLogin = async (email: string) => {
    try {
      await demoLogin(email);
      showToast('Logged in successfully for demo testing!', 'success');
      setCurrentTab('dashboard');
    } catch (err: any) {
      showToast(err.message || 'Demo login failed', 'error');
    }
  };

  const handleOpenReportModal = (type: 'Lost' | 'Found') => {
    setInitialReportType(type);
    setCurrentTab('lost-found');
  };

  const handleNavigateToChatWithUser = (peerId: string) => {
    setChatPeerId(peerId);
    setCurrentTab('chat');
  };

  const handleInspectMatch = (item: Item) => {
    setCurrentTab('lost-found');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Reviewer Two-Account Testing Helper Banner */}
      {user && (
        <aside aria-label="Reviewer Account Switcher" className="bg-indigo-950 text-white px-4 py-2 text-xs border-b border-indigo-900/50">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold tracking-wide text-indigo-200 uppercase text-[10px]">Two-Account Multi-User Testing Mode:</span>
              <span className="text-slate-200">
                Active: <strong className="text-white font-bold">{user.name}</strong> ({user.branch} • {user.year})
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-indigo-300 hidden sm:inline">1-Click Switch:</span>
              <button
                id="bar-switch-aravind"
                onClick={() => handleDemoLogin('aravind@campus.edu')}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  user.email === 'aravind@campus.edu'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-900/70 text-indigo-200 hover:bg-indigo-800'
                }`}
              >
                Student A (Aravind)
              </button>
              <button
                id="bar-switch-priya"
                onClick={() => handleDemoLogin('priya@campus.edu')}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  user.email === 'priya@campus.edu'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-900/70 text-indigo-200 hover:bg-indigo-800'
                }`}
              >
                Student B (Priya)
              </button>
              <button
                id="bar-switch-rohit"
                onClick={() => handleDemoLogin('rohit@campus.edu')}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  user.email === 'rohit@campus.edu'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-900/70 text-indigo-200 hover:bg-indigo-800'
                }`}
              >
                Student C (Rohit)
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAuth={handleOpenAuth}
      />

      {/* Body Content Router */}
      <main className="flex-1">
        {!user ? (
          /* Public Landing Page when logged out */
          <LandingPage
            onOpenAuth={handleOpenAuth}
            onDemoLogin={handleDemoLogin}
          />
        ) : (
          /* Authenticated Pages */
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                onSelectTab={setCurrentTab}
                onOpenReportModal={handleOpenReportModal}
                onInspectMatch={handleInspectMatch}
              />
            )}

            {currentTab === 'lost-found' && (
              <LostFound
                initialReportType={initialReportType}
                onClearInitialReportType={() => setInitialReportType(null)}
                onNavigateToChatWithUser={handleNavigateToChatWithUser}
              />
            )}

            {currentTab === 'connector' && (
              <CampusConnector
                onNavigateToChatWithUser={handleNavigateToChatWithUser}
              />
            )}

            {currentTab === 'connections' && (
              <Connections
                onNavigateToChatWithUser={handleNavigateToChatWithUser}
              />
            )}

            {currentTab === 'chat' && (
              <Chat
                initialPeerId={chatPeerId}
                onClearInitialPeerId={() => setChatPeerId(null)}
                onNavigateToConnector={() => setCurrentTab('connector')}
              />
            )}

            {currentTab === 'profile' && (
              <Profile
                onInspectMatch={handleInspectMatch}
                onNavigateToLostFound={() => setCurrentTab('lost-found')}
              />
            )}
          </>
        )}
      </main>

      {/* Auth Modal (Login/Signup) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />

    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ToastProvider>
  );
}
