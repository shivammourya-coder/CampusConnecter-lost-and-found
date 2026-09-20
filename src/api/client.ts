import { 
  User, 
  Item, 
  MatchResult, 
  Connection, 
  ConnectionRequests, 
  ChatMessage, 
  Conversation, 
  DashboardStats, 
  NotificationCounts 
} from '../types';

const TOKEN_KEY = 'campusconnect_jwt_token';

class ApiClient {
  private getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  public setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn('Could not save token to localStorage', e);
    }
  }

  public clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Could not clear token from localStorage', e);
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    // If session expired or invalid, clear token
    if (response.status === 401) {
      this.clearToken();
      window.dispatchEvent(new CustomEvent('campusconnect:unauthorized'));
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // --- Auth APIs ---
  public auth = {
    signup: (payload: {
      name: string;
      email: string;
      password: string;
      confirmPassword?: string;
      branch: string;
      section: string;
      year: string;
      interests: string[];
      skills: string[];
    }) => this.request<{ message: string; token: string; user: User }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

    login: (payload: { email: string; password: string }) =>
      this.request<{ message: string; token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    demoLogin: (email: string) =>
      this.request<{ message: string; token: string; user: User }>('/api/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    me: () => this.request<{ user: User }>('/api/auth/me'),
  };

  // --- Users APIs ---
  public users = {
    getProfile: () =>
      this.request<{ user: User; stats: { lostCount: number; foundCount: number; connectionCount: number; totalItems: number } }>(
        '/api/users/profile'
      ),

    updateProfile: (data: Partial<User>) =>
      this.request<{ message: string; user: User }>('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    search: (params: {
      branch?: string;
      section?: string;
      year?: string;
      interest?: string;
      skill?: string;
      query?: string;
    }) => {
      const query = new URLSearchParams();
      if (params.branch) query.set('branch', params.branch);
      if (params.section) query.set('section', params.section);
      if (params.year) query.set('year', params.year);
      if (params.interest) query.set('interest', params.interest);
      if (params.skill) query.set('skill', params.skill);
      if (params.query) query.set('query', params.query);

      return this.request<{ users: User[] }>(`/api/users/search?${query.toString()}`);
    },

    getById: (id: string) =>
      this.request<{
        user: User;
        stats: { activeItemsCount: number; connectionCount: number };
        connectionStatus: 'Connected' | 'Pending_Sent' | 'Pending_Received' | 'None';
        connectionId: string | null;
        items: Item[];
      }>(`/api/users/${id}`),
  };

  // --- Items APIs ---
  public items = {
    getAll: (params: {
      type?: 'Lost' | 'Found' | 'All';
      category?: string;
      location?: string;
      keyword?: string;
      date?: string;
      status?: string;
      userId?: string;
    } = {}) => {
      const query = new URLSearchParams();
      if (params.type && params.type !== 'All') query.set('type', params.type);
      if (params.category && params.category !== 'All') query.set('category', params.category);
      if (params.location) query.set('location', params.location);
      if (params.keyword) query.set('keyword', params.keyword);
      if (params.date) query.set('date', params.date);
      if (params.status && params.status !== 'All') query.set('status', params.status);
      if (params.userId) query.set('userId', params.userId);

      return this.request<{ items: Item[] }>(`/api/items?${query.toString()}`);
    },

    getById: (id: string) =>
      this.request<{ item: Item; matchCount: number; topMatch: MatchResult | null }>(`/api/items/${id}`),

    create: (data: {
      type: 'Lost' | 'Found';
      title: string;
      description: string;
      category: string;
      location: string;
      date: string;
      photo?: string;
    }) =>
      this.request<{
        message: string;
        item: Item;
        possibleMatchesCount: number;
        topMatch: MatchResult | null;
      }>('/api/items', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Item>) =>
      this.request<{ message: string; item: Item }>(`/api/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    updateStatus: (id: string, status: 'Active' | 'Matched' | 'Resolved') =>
      this.request<{ message: string; item: Item }>(`/api/items/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),

    delete: (id: string) =>
      this.request<{ message: string }>(`/api/items/${id}`, {
        method: 'DELETE',
      }),

    getMatches: (id: string) =>
      this.request<{ item: Item; matchCount: number; matches: MatchResult[] }>(`/api/items/matches/${id}`),
  };

  // --- Connections APIs ---
  public connections = {
    getAll: () => this.request<{ connections: Connection[] }>('/api/connections'),

    getRequests: () => this.request<ConnectionRequests>('/api/connections/requests'),

    sendRequest: (receiverId: string) =>
      this.request<{ message: string; connection: any }>('/api/connections', {
        method: 'POST',
        body: JSON.stringify({ receiverId }),
      }),

    accept: (connectionId: string) =>
      this.request<{ message: string; connection: any }>(`/api/connections/${connectionId}/accept`, {
        method: 'PUT',
      }),

    reject: (connectionId: string) =>
      this.request<{ message: string; connection: any }>(`/api/connections/${connectionId}/reject`, {
        method: 'PUT',
      }),

    remove: (connectionId: string) =>
      this.request<{ message: string }>(`/api/connections/${connectionId}`, {
        method: 'DELETE',
      }),
  };

  // --- Chat APIs ---
  public chat = {
    getConversations: () => this.request<{ conversations: Conversation[] }>('/api/chat/conversations'),

    getMessages: (userId: string) =>
      this.request<{ isConnected: boolean; peer: User; messages: ChatMessage[] }>(`/api/chat/${userId}`),

    sendMessage: (receiverId: string, message: string) =>
      this.request<{ message: string; data: ChatMessage }>('/api/chat/send', {
        method: 'POST',
        body: JSON.stringify({ receiverId, message }),
      }),

    markRead: (messageId: string) =>
      this.request<{ success: boolean }>(`/api/chat/${messageId}/read`, {
        method: 'PUT',
      }),
  };

  // --- Stats & Notifications APIs ---
  public stats = {
    getDashboard: () =>
      this.request<{
        stats: DashboardStats;
        userMatchSummaries: Array<{ myItem: any; matchesCount: number; topMatch: MatchResult }>;
        recentActivity: {
          recentItems: any[];
          recentConnections: any[];
        };
      }>('/api/stats/dashboard'),

    getNotifications: () => this.request<NotificationCounts>('/api/stats/notifications'),
  };
}

export const api = new ApiClient();
