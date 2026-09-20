export interface User {
  id: string;
  name: string;
  email: string;
  branch: string;
  section: string;
  year: string;
  interests: string[];
  skills: string[];
  profilePhoto: string;
  bio?: string;
  createdAt: string;
  connectionStatus?: 'Connected' | 'Pending_Sent' | 'Pending_Received' | 'None';
  connectionId?: string | null;
}

export interface Item {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  type: 'Lost' | 'Found';
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  photo?: string;
  status: 'Active' | 'Matched' | 'Resolved';
  createdAt: string;
}

export interface MatchResult {
  item: Item;
  matchScore: number;
  matchPercentage: string;
  reasons: string[];
  overlapKeywords: string[];
}

export interface Connection {
  connectionId: string;
  connectedAt: string;
  peer: User;
  lastMessage?: {
    message: string;
    createdAt: string;
    isFromMe: boolean;
  } | null;
}

export interface ConnectionRequests {
  incoming: Array<{
    connectionId: string;
    createdAt: string;
    sender: User;
  }>;
  sent: Array<{
    connectionId: string;
    createdAt: string;
    receiver: User;
  }>;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  peer: User;
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

export interface DashboardStats {
  totalLost: number;
  totalFound: number;
  possibleMatchesCount: number;
  connectionsCount: number;
  unreadMessagesCount: number;
  pendingRequestsCount: number;
  myItemsCount: number;
}

export interface NotificationCounts {
  totalNotifications: number;
  pendingRequestsCount: number;
  unreadMessagesCount: number;
  possibleMatchCount: number;
}

export type ViewTab = 'dashboard' | 'lost-found' | 'connector' | 'connections' | 'chat' | 'profile';
