import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Item, MatchResult } from '../types';
import { api } from '../api/client';
import { useToast } from './Toast';
import { 
  User, 
  Settings, 
  Package, 
  Trash2, 
  Sparkles, 
  Check, 
  Plus, 
  X, 
  Camera, 
  Calendar, 
  MapPin,
  Save
} from 'lucide-react';

interface ProfileProps {
  onInspectMatch: (item: Item) => void;
  onNavigateToLostFound: () => void;
}

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'BBA', 'BCA', 'MBA', 'AI/ML'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
const YEARS = ['1st', '2nd', '3rd', '4th'];

const SUGGESTED_INTERESTS = [
  'Coding', 'Web Development', 'AI/ML', 'Cyber Security',
  'Gaming', 'Sports', 'Music', 'Design', 'Entrepreneurship', 'Robotics', 'Photography'
];

const SUGGESTED_SKILLS = [
  'React', 'Node.js', 'Python', 'JavaScript', 'Java',
  'C/C++', 'HTML', 'CSS', 'UI/UX', 'Figma', 'SQL'
];

export const Profile: React.FC<ProfileProps> = ({ onInspectMatch, onNavigateToLostFound }) => {
  const { user, updateProfile, demoLogin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'myposts'>('profile');
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [branch, setBranch] = useState(user?.branch || 'CSE');
  const [section, setSection] = useState(user?.section || 'A');
  const [year, setYear] = useState(user?.year || '3rd');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [customSkill, setCustomSkill] = useState('');
  const [customInterest, setCustomInterest] = useState('');

  // My items state
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
      setBranch(user.branch);
      setSection(user.section);
      setYear(user.year);
      setProfilePhoto(user.profilePhoto);
      setInterests(user.interests || []);
      setSkills(user.skills || []);
    }
  }, [user]);

  const fetchMyItems = async () => {
    if (!user) return;
    setLoadingItems(true);
    try {
      const res = await api.items.getAll({ userId: user.id });
      setMyItems(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'myposts') {
      fetchMyItems();
    }
  }, [activeTab, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        branch,
        section,
        year,
        profilePhoto,
        interests,
        skills,
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleAddInterest = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
      setInterests([...interests, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const toggleInterest = (item: string) => {
    setInterests(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleSkill = (item: string) => {
    setSkills(prev =>
      prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item]
    );
  };

  const handleItemStatusChange = async (itemId: string, newStatus: 'Active' | 'Matched' | 'Resolved') => {
    try {
      await api.items.updateStatus(itemId, newStatus);
      showToast(`Item status updated to ${newStatus}`, 'success');
      fetchMyItems();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.items.delete(itemId);
      showToast('Item deleted successfully', 'info');
      fetchMyItems();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete item', 'error');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Navigation tabs: Profile Edit vs My Posts */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            My Profile & Details
          </button>
          <button
            onClick={() => setActiveTab('myposts')}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'myposts'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            My Reported Items ({myItems.length})
          </button>
        </div>

        {/* Quick Demo Switcher */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-slate-400">Review as:</span>
          <button
            onClick={() => demoLogin(user?.email === 'aravind@campus.edu' ? 'priya@campus.edu' : 'aravind@campus.edu')}
            className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Switch to Student {user?.email === 'aravind@campus.edu' ? 'B (Priya)' : 'A (Aravind)'}
          </button>
        </div>
      </div>

      {activeTab === 'profile' ? (
        /* =========================================================
            PROFILE EDIT FORM
           ========================================================= */
        <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
            <div className="relative group">
              <img
                src={profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'}
                alt={name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
              />
              <label className="absolute inset-0 bg-slate-900/40 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="w-6 h-6" />
                <span className="text-[10px] font-bold mt-1">Change</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <h2 className="text-xl font-bold text-slate-900">{name || 'Student Name'}</h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <p className="text-xs text-indigo-600 font-semibold mt-1">
                {branch} Engineering • Section {section} • {year} Year
              </p>
            </div>
          </div>

          {/* Core Info Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">College Email (Read-Only)</label>
              <input
                type="email"
                disabled
                value={user?.email}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Branch, Section, Year */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
              <select
                value={branch}
                onChange={e => setBranch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {BRANCHES.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
              <select
                value={section}
                onChange={e => setSection(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SECTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">About Me / Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell other students about your passions, what you're working on, or projects you want to build..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Skills Management */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Skills & Tech Stack</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customSkill}
                  onChange={e => setCustomSkill(e.target.value)}
                  placeholder="Add custom..."
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-28 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="p-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200 text-violet-800 text-xs font-semibold flex items-center gap-1.5"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Suggested quick chips */}
            <div className="flex flex-wrap gap-1">
              {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).slice(0, 6).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium hover:bg-slate-200 transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Interests Management */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Campus Interests & Hobbies</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customInterest}
                  onChange={e => setCustomInterest(e.target.value)}
                  placeholder="Add custom..."
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-28 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="p-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {interests.map(item => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold flex items-center gap-1.5"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Suggested quick chips */}
            <div className="flex flex-wrap gap-1">
              {SUGGESTED_INTERESTS.filter(i => !interests.includes(i)).slice(0, 6).map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleInterest(i)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium hover:bg-slate-200 transition-colors"
                >
                  + {i}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save Profile Settings'}
            </button>
          </div>

        </form>
      ) : (
        /* =========================================================
            MY POSTS MANAGEMENT TAB
           ========================================================= */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Your Lost & Found Posts</h3>
              <p className="text-xs text-slate-500">Update status to Matched or Resolved once an item is reclaimed.</p>
            </div>
            <button
              onClick={onNavigateToLostFound}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              Post New Item
            </button>
          </div>

          {loadingItems ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading your posts...</div>
          ) : myItems.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-8">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">You haven't reported any items yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                If you misplaced or recovered belongings on campus, report them to trigger automatic text-similarity matching.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <img
                      src={item.photo || 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=80&q=80'}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            item.type === 'Lost' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.type}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">{item.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.location} • {item.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Status dropdown */}
                    <select
                      value={item.status}
                      onChange={e => handleItemStatusChange(item.id, e.target.value as any)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                    >
                      <option value="Active">Active</option>
                      <option value="Matched">Matched</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    <button
                      onClick={() => onInspectMatch(item)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      Matches
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
