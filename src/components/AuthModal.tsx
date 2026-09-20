import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { LogIn, UserPlus, X, Sparkles, ArrowRight, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'BBA', 'BCA', 'MBA', 'AI/ML'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
const YEARS = ['1st', '2nd', '3rd', '4th'];

const POPULAR_INTERESTS = [
  'Coding', 'Web Development', 'AI/ML', 'Cyber Security',
  'Gaming', 'Sports', 'Music', 'Design', 'Entrepreneurship'
];

const POPULAR_SKILLS = [
  'React', 'Node.js', 'Python', 'JavaScript', 'Java',
  'C/C++', 'HTML', 'CSS', 'UI/UX'
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const { login, signup, demoLogin } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [section, setSection] = useState('A');
  const [year, setYear] = useState('3rd');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Coding', 'Web Development']);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React', 'JavaScript']);

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginEmail || !loginPassword) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      showToast('Welcome back to CampusConnect!', 'success');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !signupEmail.trim() || !signupPassword || !confirmPassword) {
      setError('Please fill all required fields.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name,
        email: signupEmail,
        password: signupPassword,
        confirmPassword,
        branch,
        section,
        year,
        interests: selectedInterests,
        skills: selectedSkills,
      });
      showToast('Account created successfully! Welcome to CampusConnect.', 'success');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoQuickSelect = async (email: string) => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(email);
      showToast(`Logged in successfully for testing!`, 'success');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        id="auth-modal-card"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8"
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center font-bold text-white text-base">CC</span>
              <h2 className="text-xl font-bold tracking-tight">CampusConnect</h2>
            </div>
            <p className="text-xs text-indigo-100 mt-1">Your Centralized College Social & Lost/Found Hub</p>
          </div>
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            id="tab-login-btn"
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              tab === 'login'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            id="tab-signup-btn"
            type="button"
            onClick={() => { setTab('signup'); setError(null); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              tab === 'signup'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Create Student Account
          </button>
        </div>

        <div className="p-6">
          {/* Error notice */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
              <span className="font-semibold text-rose-800">Error:</span> {error}
            </div>
          )}

          {/* Instant Demo Account Testing Pill */}
          <div className="mb-5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Multi-Account Reviewer Switch:
              </span>
              <span className="text-[11px] text-indigo-600 font-medium">1-Click Test</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="demo-login-aravind-btn"
                type="button"
                onClick={() => handleDemoQuickSelect('aravind@campus.edu')}
                disabled={loading}
                className="text-left px-3 py-2 bg-white rounded-lg border border-indigo-200 hover:border-indigo-400 hover:shadow-xs text-xs transition-all flex flex-col"
              >
                <span className="font-bold text-slate-800">Student A: Aravind</span>
                <span className="text-[10px] text-slate-500">3rd Year CSE • Lost Wallet</span>
              </button>
              <button
                id="demo-login-priya-btn"
                type="button"
                onClick={() => handleDemoQuickSelect('priya@campus.edu')}
                disabled={loading}
                className="text-left px-3 py-2 bg-white rounded-lg border border-indigo-200 hover:border-indigo-400 hover:shadow-xs text-xs transition-all flex flex-col"
              >
                <span className="font-bold text-slate-800">Student B: Priya</span>
                <span className="text-[10px] text-slate-500">2nd Year IT • Found Wallet</span>
              </button>
            </div>
          </div>

          {tab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Email</label>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="e.g. yourname@campus.edu"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  id="login-password-input"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to CampusConnect'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Signup Form */
            <form onSubmit={handleSignup} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  id="signup-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sanya Gupta"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College Email Address</label>
                <input
                  id="signup-email-input"
                  type="email"
                  required
                  value={signupEmail}
                  onChange={e => setSignupEmail(e.target.value)}
                  placeholder="e.g. sanya@campus.edu"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    id="signup-password-input"
                    type="password"
                    required
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                  <input
                    id="signup-confirm-password-input"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Match password"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Branch, Section, Year */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                  <select
                    id="signup-branch-select"
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {BRANCHES.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    id="signup-section-select"
                    value={section}
                    onChange={e => setSection(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {SECTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                  <select
                    id="signup-year-select"
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interests chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Interests <span className="text-slate-400 font-normal">(select what you love)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_INTERESTS.map(item => {
                    const isSelected = selectedInterests.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleInterest(item)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skills chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Skills <span className="text-slate-400 font-normal">(select your toolkit)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILLS.map(skill => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-violet-50 border-violet-300 text-violet-700 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                id="signup-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Creating Student Account...' : 'Complete Registration'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
