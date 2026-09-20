import React from 'react';
import { 
  GraduationCap, 
  Search, 
  Users, 
  Sparkles, 
  MessageSquare, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (tab: 'login' | 'signup') => void;
  onDemoLogin: (email: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onDemoLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-white text-slate-800">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background ambient accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-violet-200/30 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Campus Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold tracking-wide uppercase shadow-xs mb-6 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Centralized Campus Networking & Belongs Hub</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Connect. Discover. Recover. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                Your Campus, Connected.
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
              CampusConnect bridges college life into one unified platform. Recover lost belongings with intelligent text-similarity matching, discover peers by branch, year, interests, and skills, and collaborate seamlessly through real-time chat.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
              <button
                id="hero-get-started-btn"
                onClick={() => onOpenAuth('signup')}
                className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-login-btn"
                onClick={() => onOpenAuth('login')}
                className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all"
              >
                Existing Student Sign In
              </button>
            </div>

            {/* 1-Click Demo Reviewer Banner */}
            <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-indigo-100/90 shadow-sm max-w-xl mx-auto text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Instant Two-Account Reviewer Testing:
                </span>
                <span className="text-[11px] font-semibold text-indigo-600">No Signup Needed</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  id="landing-demo-aravind-btn"
                  onClick={() => onDemoLogin('aravind@campus.edu')}
                  className="p-2.5 rounded-xl border border-indigo-200/80 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-400 transition-all text-left flex items-center gap-2.5"
                >
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80"
                    alt="Aravind"
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-tight">Student A: Aravind</p>
                    <p className="text-[11px] text-slate-500 truncate">3rd Yr CSE • Lost Wallet</p>
                  </div>
                </button>

                <button
                  id="landing-demo-priya-btn"
                  onClick={() => onDemoLogin('priya@campus.edu')}
                  className="p-2.5 rounded-xl border border-indigo-200/80 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-400 transition-all text-left flex items-center gap-2.5"
                >
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80"
                    alt="Priya"
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-tight">Student B: Priya</p>
                    <p className="text-[11px] text-slate-500 truncate">2nd Yr IT • Found Wallet</p>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed Specifically For Campus Life
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
              Everything college students need to recover lost belongings, discover ambitious teammates, and communicate safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Lost & Found */}
            <div id="feature-card-lostfound" className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Lost & Found Hub</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Report lost or found items with location tags, photos, and categories. Filter by campus spots like library, canteen, or lab rooms.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                <MapPin className="w-3.5 h-3.5" />
                <span>Campus Location Tagging</span>
              </div>
            </div>

            {/* Card 2: AI Similarity Matching */}
            <div id="feature-card-aimatching" className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Similarity Match</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Intelligent text-similarity algorithm compares Lost and Found listings in real time, calculating match percentages and exact shared keywords.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>90%+ Confidence Scoring</span>
              </div>
            </div>

            {/* Card 3: Campus Connector */}
            <div id="feature-card-connector" className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Campus Connector</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Find peers across CSE, IT, ECE, ME and other branches. Filter by academic year, hackathon skills, coding interests, and send connection requests.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-violet-700">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Multi-Filter Discovery</span>
              </div>
            </div>

            {/* Card 4: Connected Chat */}
            <div id="feature-card-chat" className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Safe Connected Chat</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Spam-free messaging restricted strictly to confirmed connections. Chat instantly with the student who recovered your belongings or team partners.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Peer Messaging</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Simple 3-Step Flow</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              How CampusConnect Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Register with Student Profile</h3>
              <p className="text-sm text-slate-600">
                Sign up with your campus email, branch, section, year, and select your top technical skills and personal interests.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Report or Discover</h3>
              <p className="text-sm text-slate-600">
                Post lost/found items to trigger instant text similarity matching, or discover classmates using branch and skill filters.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Connect & Coordinate</h3>
              <p className="text-sm text-slate-600">
                Accept incoming requests, verify matches, and coordinate handovers or project collaborations directly via chat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Campus Benefits</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2 mb-6">
                Why Students Rely on CampusConnect
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Rapid Item Recovery</h4>
                    <p className="text-sm text-slate-600 mt-0.5">
                      No more lost items lingering in WhatsApp groups or notice boards. Automatic text-similarity notifies you the moment a matching item is found.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-violet-50 text-violet-600 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Cross-Branch Networking</h4>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Connect with students outside your classroom. Find hackathon partners, competitive programmers, designers, and study groups easily.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Safe, Verified Connections</h4>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Mutual approval connection model protects students from spam or unsolicited harassment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphic card / Mock match preview */}
            <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl text-white shadow-xl">
              <div className="flex items-center justify-between border-b border-indigo-800/60 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs font-mono text-indigo-300">Similarity Engine v2.4</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center justify-between text-xs text-indigo-200 mb-1">
                    <span className="font-bold uppercase text-amber-400">Reported Lost (Student A)</span>
                    <span>Central Library</span>
                  </div>
                  <p className="text-sm font-semibold text-white">"Black Leather Wallet with Student ID Card"</p>
                </div>

                <div className="flex items-center justify-center">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    94% High Confidence Match Detected
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center justify-between text-xs text-indigo-200 mb-1">
                    <span className="font-bold uppercase text-emerald-400">Reported Found (Student B)</span>
                    <span>Library Reading Hall</span>
                  </div>
                  <p className="text-sm font-semibold text-white">"Found Black Leather Wallet near Central Library"</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-indigo-800/60 flex items-center justify-between text-xs text-indigo-300">
                <span>Matched Keywords: wallet, black, leather, library, id</span>
                <span className="text-emerald-400 font-semibold">Active & Persistent</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-white font-bold text-base">CampusConnect</span>
                <p className="text-xs text-slate-400">Connect. Discover. Recover. Your Campus, Connected.</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <button onClick={() => onOpenAuth('login')} className="hover:text-white transition-colors">
                Sign In
              </button>
              <button onClick={() => onOpenAuth('signup')} className="hover:text-white transition-colors">
                Register Student
              </button>
              <button onClick={() => onDemoLogin('aravind@campus.edu')} className="hover:text-white transition-colors">
                Demo Account A
              </button>
              <button onClick={() => onDemoLogin('priya@campus.edu')} className="hover:text-white transition-colors">
                Demo Account B
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center md:text-left text-xs text-slate-400">
            &copy; {new Date().getFullYear()} CampusConnect. All rights reserved. Full-stack College Networking & Lost/Found System.
          </div>
        </div>
      </footer>

    </div>
  );
};
