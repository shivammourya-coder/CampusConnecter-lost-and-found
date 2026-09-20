import { Router, Response } from 'express';
import { getDatabase } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../authMiddleware.js';
import { findMatchesForItem } from '../similarity.js';

const router = Router();

// GET /api/stats/dashboard - Dashboard counts and recent activity feed
router.get('/dashboard', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const db = getDatabase();

  const totalLost = db.items.filter(i => i.type === 'Lost' && i.status !== 'Resolved').length;
  const totalFound = db.items.filter(i => i.type === 'Found' && i.status !== 'Resolved').length;

  const myItems = db.items.filter(i => i.userId === currentUserId && i.status !== 'Resolved');

  // Compute how many matches exist for user's active posts
  let possibleMatchesCount = 0;
  const userMatchSummaries: Array<{ myItem: any; matchesCount: number; topMatch: any }> = [];

  for (const myItem of myItems) {
    const matches = findMatchesForItem(myItem, db.items);
    if (matches.length > 0) {
      possibleMatchesCount += matches.length;
      userMatchSummaries.push({
        myItem: {
          id: myItem.id,
          title: myItem.title,
          type: myItem.type,
          category: myItem.category,
        },
        matchesCount: matches.length,
        topMatch: matches[0],
      });
    }
  }

  // Active connections count
  const myConnectionsCount = db.connections.filter(c => 
    c.status === 'Accepted' && (c.senderId === currentUserId || c.receiverId === currentUserId)
  ).length;

  // Unread messages count
  const unreadMessagesCount = db.messages.filter(m => 
    m.receiverId === currentUserId && !m.read
  ).length;

  // Pending incoming requests count
  const pendingRequestsCount = db.connections.filter(c => 
    c.receiverId === currentUserId && c.status === 'Pending'
  ).length;

  // Recent activity aggregated: items, connections, messages
  const recentItems = db.items.slice(0, 4).map(item => ({
    id: item.id,
    kind: 'item' as const,
    type: item.type,
    title: item.title,
    location: item.location,
    userName: item.userName,
    userPhoto: item.userPhoto,
    date: item.createdAt,
  }));

  const recentConns = db.connections
    .filter(c => c.senderId === currentUserId || c.receiverId === currentUserId)
    .slice(0, 3)
    .map(c => {
      const peerId = c.senderId === currentUserId ? c.receiverId : c.senderId;
      const peer = db.users.find(u => u.id === peerId);
      return {
        id: c.id,
        kind: 'connection' as const,
        status: c.status,
        peerName: peer?.name || 'Student',
        peerPhoto: peer?.profilePhoto,
        isIncoming: c.receiverId === currentUserId && c.status === 'Pending',
        date: c.updatedAt || c.createdAt,
      };
    });

  res.json({
    stats: {
      totalLost,
      totalFound,
      possibleMatchesCount,
      connectionsCount: myConnectionsCount,
      unreadMessagesCount,
      pendingRequestsCount,
      myItemsCount: myItems.length,
    },
    userMatchSummaries,
    recentActivity: {
      recentItems,
      recentConnections: recentConns,
    },
  });
});

// GET /api/notifications - Quick badge summary
router.get('/notifications', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const db = getDatabase();

  const pendingRequests = db.connections.filter(c => 
    c.receiverId === currentUserId && c.status === 'Pending'
  );

  const unreadMessages = db.messages.filter(m => 
    m.receiverId === currentUserId && !m.read
  );

  const myItems = db.items.filter(i => i.userId === currentUserId && i.status !== 'Resolved');
  let possibleMatchCount = 0;
  for (const item of myItems) {
    const matches = findMatchesForItem(item, db.items);
    possibleMatchCount += matches.length;
  }

  res.json({
    totalNotifications: pendingRequests.length + unreadMessages.length + (possibleMatchCount > 0 ? 1 : 0),
    pendingRequestsCount: pendingRequests.length,
    unreadMessagesCount: unreadMessages.length,
    possibleMatchCount,
  });
});

export default router;
