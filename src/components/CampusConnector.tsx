import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useToast } from './Toast';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Check, 
  MessageSquare, 
  GraduationCap, 
  Sparkles, 
  X,
  Code,
  Heart,
  ChevronRight
} from 'lucide-react';

interface CampusConnectorProps {
  onNavigateToChatWithUser: (userId: string) => void;
}

const BRANCHES = ['All', 'CSE', 'IT', 'ECE', 'EEE', 'BBA', 'BCA', 'MBA', 'AI/ML'];
const SECTIONS = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
const YEARS = ['All', '1st', '2nd', '3rd', '4th'];

const INTERESTS = [
  'All',
  'Coding',
  'Web Development',
  'AI/ML',
  'Cyber Security',
  'Gaming',
  'Sports',
  'Music',
  'Design',
  'Entrepreneurship'
];

const SKILLS = [
  'All',
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'C/C++',
  'UI/UX'
];

export const CampusConnector: React.FC<CampusConnectorProps> = ({ onNavigateToChatWithUser }) => {
  const { user, refreshNotifications } = useAuth();
  const { showToast } = useToast();

  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [branchFilter, setBranchFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [interestFilter, setInterestFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected student profile modal
  const [profileModalStudent, setProfileModalStudent] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Action loading states by user id
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.users.search({
        branch: branchFilter,
        section: sectionFilter,
        year: yearFilter,
        interest: interestFilter,
        skill: skillFilter,
        query: searchQuery,
      });
      setStudents(res.users);
    } catch (err: any) {
      showToast(err.message || 'Failed to search students', 'error');
    } finally {
      setLoading(false);
    }
  }, [branchFilter, sectionFilter, yearFilter, interestFilter, skillFilter, searchQuery, showToast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSendConnection = async (targetStudent: User) => {
    setProcessingId(targetStudent.id);
    try {
      await api.connections.sendRequest(targetStudent.id);
      showToast(`Connection request sent to ${targetStudent.name}!`, 'success');
      // Update local student status
      setStudents(prev =>
        prev.map(s => (s.id === targetStudent.id ? { ...s, connectionStatus: 'Pending_Sent' } : s))
      );
      refreshNotifications();
    } catch (err: any) {
      showToast(err.message || 'Could not send connection request', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAcceptConnection = async (targetStudent: User) => {
    if (!targetStudent.connectionId) return;
    setProcessingId(targetStudent.id);
    try {
      await api.connections.accept(targetStudent.connectionId);
      showToast(`Connected with ${targetStudent.name}! You can now chat.`, 'success');
      setStudents(prev =>
        prev.map(s => (s.id === targetStudent.id ? { ...s, connectionStatus: 'Connected' } : s))
      );
      refreshNotifications();
    } catch (err: any) {
      showToast(err.message || 'Could not accept connection', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenStudentProfile = async (studentId: string) => {
    setLoadingProfile(true);
    try {
      const res = await api.users.getById(studentId);
      setProfileModalStudent(res);
    } catch (err) {
      showToast('Could not load student profile', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const clearAllFilters = () => {
    setBranchFilter('All');
    setSectionFilter('All');
    setYearFilter('All');
    setInterestFilter('All');
    setSkillFilter('All');
    setSearchQuery('');
  };

  const hasActiveFilters = 
    branchFilter !== 'All' || 
    sectionFilter !== 'All' || 
    yearFilter !== 'All' || 
    interestFilter !== 'All' || 
    skillFilter !== 'All' || 
    searchQuery.trim().length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-600" />
            Campus Connector
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Discover and network with classmates across branches, academic years, shared skills, and passions.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        )}
      </div>

      {/* Multi-Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Student Search & Discovery Filters
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, skills, or branch..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white"
          />
        </div>

        {/* Filters Dropdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Branch</label>
            <select
              value={branchFilter}
              onChange={e => setBranchFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {BRANCHES.map(b => (
                <option key={b} value={b}>{b === 'All' ? 'All Branches' : b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Section</label>
            <select
              value={sectionFilter}
              onChange={e => setSectionFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {SECTIONS.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Sections' : `Sec ${s}`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Year</label>
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {YEARS.map(y => (
                <option key={y} value={y}>{y === 'All' ? 'All Years' : `${y} Year`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Interest</label>
            <select
              value={interestFilter}
              onChange={e => setInterestFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {INTERESTS.map(i => (
                <option key={i} value={i}>{i === 'All' ? 'All Interests' : i}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Skill</label>
            <select
              value={skillFilter}
              onChange={e => setSkillFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {SKILLS.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Skills' : s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Discovering campus peers...
        </div>
      ) : students.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-8">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No students matched these filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try broadening your search criteria or resetting filters to see more students.
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map(student => {
            const isProcessing = processingId === student.id;
            const status = student.connectionStatus || 'None';

            return (
              <div
                key={student.id}
                id={`student-card-${student.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-violet-300 hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top info: Avatar + Name + Academic Pill */}
                  <div className="flex items-start gap-3.5 mb-4">
                    <img
                      src={student.profilePhoto}
                      alt={student.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-violet-100 shadow-xs shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
                          {student.name}
                        </h3>
                      </div>
                      <p className="text-xs font-semibold text-violet-700 mt-0.5">
                        {student.branch} • Sec {student.section} • {student.year} Year
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{student.email}</p>
                    </div>
                  </div>

                  {/* Bio snippet */}
                  {student.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                      {student.bio}
                    </p>
                  )}

                  {/* Skills tags */}
                  <div className="mb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {student.skills.slice(0, 4).map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[10px] font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Interests tags */}
                  <div className="mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Interests
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {student.interests.slice(0, 4).map(interest => (
                        <span
                          key={interest}
                          className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-semibold"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenStudentProfile(student.id)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors shrink-0"
                  >
                    View Profile
                  </button>

                  {status === 'Connected' ? (
                    <button
                      onClick={() => onNavigateToChatWithUser(student.id)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>
                  ) : status === 'Pending_Sent' ? (
                    <button
                      disabled
                      className="flex-1 py-2 px-3 bg-slate-100 text-slate-500 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-default"
                    >
                      <Check className="w-3.5 h-3.5 text-slate-400" />
                      <span>Request Sent</span>
                    </button>
                  ) : status === 'Pending_Received' ? (
                    <button
                      onClick={() => handleAcceptConnection(student)}
                      disabled={isProcessing}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Accept Request</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendConnection(student)}
                      disabled={isProcessing}
                      className="flex-1 py-2 px-3 bg-violet-600 hover:bg-violet-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isProcessing ? 'Connecting...' : 'Connect'}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================
          FULL STUDENT PROFILE MODAL
         ========================================================= */}
      {profileModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 space-y-6">
            
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={profileModalStudent.user.profilePhoto}
                  alt={profileModalStudent.user.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-violet-200"
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {profileModalStudent.user.name}
                  </h3>
                  <p className="text-xs font-semibold text-violet-700 mt-0.5">
                    {profileModalStudent.user.branch} • Section {profileModalStudent.user.section} • {profileModalStudent.user.year} Year
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{profileModalStudent.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Bio */}
            {profileModalStudent.user.bio && (
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">About</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {profileModalStudent.user.bio}
                </p>
              </div>
            )}

            {/* Stats count */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-violet-50/60 rounded-xl text-center border border-violet-100">
                <span className="text-xl font-extrabold text-violet-700">
                  {profileModalStudent.stats.connectionCount}
                </span>
                <p className="text-[10px] text-violet-900 font-semibold mt-0.5">Campus Connections</p>
              </div>
              <div className="p-3 bg-indigo-50/60 rounded-xl text-center border border-indigo-100">
                <span className="text-xl font-extrabold text-indigo-700">
                  {profileModalStudent.stats.activeItemsCount}
                </span>
                <p className="text-[10px] text-indigo-900 font-semibold mt-0.5">Active Lost/Found Posts</p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                Technical & Creative Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {profileModalStudent.user.skills.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-800 text-xs font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                Interests & Activities
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {profileModalStudent.user.interests.map((i: string) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-semibold">
                    {i}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setProfileModalStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>

              {profileModalStudent.connectionStatus === 'Connected' ? (
                <button
                  onClick={() => {
                    const id = profileModalStudent.user.id;
                    setProfileModalStudent(null);
                    onNavigateToChatWithUser(id);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open Chat</span>
                </button>
              ) : profileModalStudent.connectionStatus === 'Pending_Sent' ? (
                <button
                  disabled
                  className="px-4 py-2 bg-slate-100 text-slate-500 text-xs font-semibold rounded-xl"
                >
                  Request Sent
                </button>
              ) : profileModalStudent.connectionStatus === 'Pending_Received' ? (
                <button
                  onClick={() => {
                    handleAcceptConnection(profileModalStudent.user);
                    setProfileModalStudent(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Accept Connection</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleSendConnection(profileModalStudent.user);
                    setProfileModalStudent(null);
                  }}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Send Connection Request</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
