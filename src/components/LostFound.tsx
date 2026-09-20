import React, { useState, useEffect, useCallback } from 'react';
import { Item, MatchResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useToast } from './Toast';
import { 
  Search, 
  PlusCircle, 
  Sparkles, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Filter, 
  X, 
  MessageSquare, 
  ArrowRight,
  Upload,
  Check,
  AlertTriangle
} from 'lucide-react';

interface LostFoundProps {
  initialReportType?: 'Lost' | 'Found' | null;
  onClearInitialReportType?: () => void;
  onNavigateToChatWithUser?: (userId: string) => void;
}

const CATEGORIES = [
  'All',
  'Bags & Wallets',
  'Electronics',
  'Books & Stationery',
  'ID & Cards',
  'Keys',
  'Clothing',
  'Accessories',
  'Other'
];

const PRESET_PHOTOS = {
  Lost: [
    'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80', // wallet
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80', // charger
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', // books
    'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=600&q=80', // keys
  ],
  Found: [
    'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80', // calculator
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  ]
};

export const LostFound: React.FC<LostFoundProps> = ({ 
  initialReportType, 
  onClearInitialReportType,
  onNavigateToChatWithUser 
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [activeTab, setActiveTab] = useState<'All' | 'Lost' | 'Found' | 'Mine'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'Lost' | 'Found'>('Lost');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Bags & Wallets');
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPhoto, setFormPhoto] = useState('');

  // Match inspector modal state
  const [selectedItemForMatches, setSelectedItemForMatches] = useState<Item | null>(null);
  const [matchesList, setMatchesList] = useState<MatchResult[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Open initial report modal if triggered from outside
  useEffect(() => {
    if (initialReportType) {
      setReportType(initialReportType);
      setReportModalOpen(true);
      if (onClearInitialReportType) onClearInitialReportType();
    }
  }, [initialReportType, onClearInitialReportType]);

  // Fetch items
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (activeTab === 'Lost' || activeTab === 'Found') {
        params.type = activeTab;
      }
      if (activeTab === 'Mine' && user) {
        params.userId = user.id;
      }
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchKeyword.trim()) {
        params.keyword = searchKeyword.trim();
      }
      if (locationFilter.trim()) {
        params.location = locationFilter.trim();
      }
      if (statusFilter !== 'All') {
        params.status = statusFilter;
      }

      const res = await api.items.getAll(params);
      setItems(res.items);
    } catch (err: any) {
      showToast(err.message || 'Failed to load items', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCategory, searchKeyword, locationFilter, statusFilter, user, showToast]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleOpenReport = (type: 'Lost' | 'Found') => {
    setReportType(type);
    setFormTitle('');
    setFormDesc('');
    setFormLocation('');
    setFormCategory('Bags & Wallets');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPhoto(PRESET_PHOTOS[type][0]);
    setReportModalOpen(true);
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim() || !formLocation.trim()) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.items.create({
        type: reportType,
        title: formTitle.trim(),
        description: formDesc.trim(),
        category: formCategory,
        location: formLocation.trim(),
        date: formDate,
        photo: formPhoto || PRESET_PHOTOS[reportType][0],
      });

      setReportModalOpen(false);
      showToast(
        `${reportType} item posted successfully! ${
          res.possibleMatchesCount > 0 ? `🎯 ${res.possibleMatchesCount} possible match detected!` : ''
        }`,
        'success'
      );
      loadItems();

      // If matches detected right away, open inspection
      if (res.possibleMatchesCount > 0 && res.topMatch) {
        handleInspectMatches(res.item);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to report item.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInspectMatches = async (item: Item) => {
    setSelectedItemForMatches(item);
    setLoadingMatches(true);
    try {
      const res = await api.items.getMatches(item.id);
      setMatchesList(res.matches);
    } catch (err) {
      showToast('Could not calculate matches.', 'error');
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: 'Active' | 'Matched' | 'Resolved') => {
    try {
      await api.items.updateStatus(itemId, newStatus);
      showToast(`Item status updated to ${newStatus}`, 'success');
      loadItems();
      if (selectedItemForMatches && selectedItemForMatches.id === itemId) {
        setSelectedItemForMatches({ ...selectedItemForMatches, status: newStatus });
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Search className="w-6 h-6 text-indigo-600" />
            Campus Lost & Found
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Report misplaced or recovered belongings with automated text-similarity matching.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="lostfound-report-lost-btn"
            onClick={() => handleOpenReport('Lost')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Report Lost Item
          </button>
          <button
            id="lostfound-report-found-btn"
            onClick={() => handleOpenReport('Found')}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Report Found Item
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Tab row: All, Lost, Found, Mine */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'All' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('Lost')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'Lost' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lost Only
            </button>
            <button
              onClick={() => setActiveTab('Found')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'Found' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Found Only
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('Mine')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'Mine' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Reported Posts
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Matched">Matched</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Inputs row: Category, Keyword, Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              placeholder="Search by keywords (e.g. wallet, ID card, dell charger)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>Category: {cat}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              placeholder="Filter by location (e.g. Library, Lab B, Canteen)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Items Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Loading Campus Lost & Found posts...
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-8">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No items found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, category, or location filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => {
            const isOwner = user?.id === item.userId;
            const isResolved = item.status === 'Resolved';

            return (
              <div
                key={item.id}
                id={`item-card-${item.id}`}
                className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                  isResolved
                    ? 'border-slate-200 opacity-75 bg-slate-50/50'
                    : 'border-slate-200/80 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Photo Banner with Badges */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.photo || PRESET_PHOTOS[item.type][0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Top Left: Type Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase shadow-sm tracking-wide ${
                          item.type === 'Lost'
                            ? 'bg-rose-500 text-white'
                            : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
                        {item.category}
                      </span>
                    </div>

                    {/* Top Right: Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-xs ${
                          item.status === 'Resolved'
                            ? 'bg-slate-800 text-white'
                            : item.status === 'Matched'
                            ? 'bg-amber-400 text-amber-950'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Date: {item.date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={item.userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                        alt={item.userName}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                      <span className="text-xs font-semibold text-slate-700 truncate">
                        {item.userName} {isOwner && '(You)'}
                      </span>
                    </div>

                    {/* AI Matches button */}
                    <button
                      onClick={() => handleInspectMatches(item)}
                      className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Possible Matches</span>
                    </button>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center gap-2 pt-1">
                    {isOwner ? (
                      /* Owner status toggle */
                      <div className="w-full flex items-center gap-1.5">
                        <select
                          value={item.status}
                          onChange={e => handleStatusChange(item.id, e.target.value as any)}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700"
                        >
                          <option value="Active">Status: Active</option>
                          <option value="Matched">Status: Matched</option>
                          <option value="Resolved">Status: Resolved</option>
                        </select>
                      </div>
                    ) : (
                      /* Contact/Message finder button */
                      <button
                        onClick={() => {
                          if (onNavigateToChatWithUser) {
                            onNavigateToChatWithUser(item.userId);
                          }
                        }}
                        className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Message {item.type === 'Lost' ? 'Owner' : 'Finder'}</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================
          REPORT LOST/FOUND ITEM MODAL
         ========================================================= */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    reportType === 'Lost' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
                <h3 className="text-lg font-bold text-slate-900">
                  Report {reportType} Item
                </h3>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Switch between Lost and Found */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => {
                  setReportType('Lost');
                  setFormPhoto(PRESET_PHOTOS.Lost[0]);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  reportType === 'Lost'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                I Lost Something
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportType('Found');
                  setFormPhoto(PRESET_PHOTOS.Found[0]);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  reportType === 'Found'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                I Found Something
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Black Leather Wallet with Student ID Card"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location on Campus *
                </label>
                <input
                  type="text"
                  required
                  value={formLocation}
                  onChange={e => setFormLocation(e.target.value)}
                  placeholder="e.g. Central Library 2nd Floor, Table 14"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Provide identifying details like color, brand, stickers, scratches, contents..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Our algorithm uses your description to automatically detect matching posts.
                </p>
              </div>

              {/* Photo Upload or Preset */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Photo (Optional Upload or Choose Preset)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3 py-2 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <div className="flex items-center gap-1.5">
                    {PRESET_PHOTOS[reportType].map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormPhoto(imgUrl)}
                        className={`w-9 h-9 rounded-lg overflow-hidden border-2 transition-all ${
                          formPhoto === imgUrl ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? 'Submitting & Matching...' : `Publish ${reportType} Report`}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          AI TEXT-SIMILARITY MATCH INSPECTOR MODAL
         ========================================================= */}
      {selectedItemForMatches && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8 space-y-6">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Text-Similarity Matching Engine
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Possible Matches for "{selectedItemForMatches.title}"
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparing against opposite-type reports using category, location proximity, and description tokens.
                </p>
              </div>
              <button
                onClick={() => setSelectedItemForMatches(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Item Summary Strip */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
              <img
                src={selectedItemForMatches.photo || PRESET_PHOTOS[selectedItemForMatches.type][0]}
                alt={selectedItemForMatches.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  selectedItemForMatches.type === 'Lost' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Your Post: {selectedItemForMatches.type}
                </span>
                <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{selectedItemForMatches.title}</p>
                <p className="text-[11px] text-slate-500 truncate">{selectedItemForMatches.location}</p>
              </div>
            </div>

            {/* Matches List */}
            {loadingMatches ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Running similarity algorithms across campus database...
              </div>
            ) : matchesList.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
                <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No high-probability matches yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  When another student reports a matching {selectedItemForMatches.type === 'Lost' ? 'Found' : 'Lost'} item with similar keywords or location, it will appear here immediately.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {matchesList.map((match, idx) => (
                  <div
                    key={match.item.id}
                    className="p-4 rounded-xl border border-indigo-100 bg-white hover:border-indigo-300 shadow-xs transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <img
                          src={match.item.photo || PRESET_PHOTOS[match.item.type][0]}
                          alt={match.item.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                              {match.item.type}
                            </span>
                            <span className="text-xs text-slate-500">
                              by {match.item.userName}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {match.item.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {match.item.description}
                          </p>
                        </div>
                      </div>

                      {/* Confidence Score Pill */}
                      <div className="text-right shrink-0">
                        <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-xs shadow-xs">
                          {match.matchPercentage}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Algorithm Score</p>
                      </div>
                    </div>

                    {/* Matching Reasons Breakdown */}
                    <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-indigo-900 tracking-wider">
                        Why this is a potential match:
                      </span>
                      <ul className="text-xs text-indigo-950 space-y-0.5">
                        {match.reasons.map((r, rIdx) => (
                          <li key={rIdx} className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {match.item.location}
                      </span>

                      <button
                        onClick={() => {
                          setSelectedItemForMatches(null);
                          if (onNavigateToChatWithUser) {
                            onNavigateToChatWithUser(match.item.userId);
                          }
                        }}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Contact {match.item.userName}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end border-t border-slate-100">
              <button
                onClick={() => setSelectedItemForMatches(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Close Match Viewer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
