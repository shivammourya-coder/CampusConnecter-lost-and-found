import { Router, Response } from 'express';
import { getDatabase, saveDatabase, MessageRecord } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../authMiddleware.js';

const router = Router();

// Helper: Verify if two users are actively connected
function areUsersConnected(userIdA: string, userIdB: string): boolean {
  const db = getDatabase();
  return db.connections.some(c => 
    c.status === 'Accepted' && 
    ((c.senderId === userIdA && c.receiverId === userIdB) || (c.senderId === userIdB && c.receiverId === userIdA))
  );
}

// POST /api/chat/send - Send a message to a connected peer
router.post('/send', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const senderId = req.user?.id;
  const { receiverId, message } = req.body;

  if (!receiverId || !message || !message.trim()) {
    res.status(400).json({ error: 'Receiver ID and non-empty message are required.' });
    return;
  }

  if (senderId === receiverId) {
    res.status(400).json({ error: 'You cannot send messages to yourself.' });
    return;
  }

  const db = getDatabase();

  // Validate receiver exists
  const receiver = db.users.find(u => u.id === receiverId);
  if (!receiver) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  // Strict Connection Rule Check: Only connected users may chat!
  if (!areUsersConnected(senderId!, receiverId)) {
    res.status(403).json({ error: 'You can chat only after becoming connected.' });
    return;
  }

  const newMessage: MessageRecord = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    senderId: senderId!,
    receiverId,
    message: message.trim(),
    read: false,
    createdAt: new Date().toISOString(),
  };

  db.messages.push(newMessage);
  saveDatabase();

  res.status(201).json({
    message: 'Message sent successfully',
    data: newMessage,
  });
});

// GET /api/chat/conversations - List of all connected peers with last message & unread badge count
router.get('/conversations', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const db = getDatabase();

  // Find all accepted connections
  const acceptedConns = db.connections.filter(c => 
    c.status === 'Accepted' && (c.senderId === currentUserId || c.receiverId === currentUserId)
  );

  const conversations = acceptedConns.map(conn => {
    const peerId = conn.senderId === currentUserId ? conn.receiverId : conn.senderId;
    const peer = db.users.find(u => u.id === peerId);

    // Filter all messages between these two
    const thread = db.messages.filter(m => 
      (m.senderId === currentUserId && m.receiverId === peerId) ||
      (m.senderId === peerId && m.receiverId === currentUserId)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const lastMessage = thread[0] || null;
    const unreadCount = thread.filter(m => m.senderId === peerId && !m.read).length;

    return {
      peer: peer ? {
        id: peer.id,
        name: peer.name,
        email: peer.email,
        branch: peer.branch,
        section: peer.section,
        year: peer.year,
        profilePhoto: peer.profilePhoto,
      } : null,
      lastMessage,
      unreadCount,
    };
  }).filter(c => c.peer !== null);

  // Sort conversations with recent messages at the top
  conversations.sort((a, b) => {
    const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  res.json({ conversations });
});

// GET /api/chat/:userId - Get conversation messages with a specific connected user
router.get('/:userId', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const peerId = req.params.userId;
  const db = getDatabase();

  const peer = db.users.find(u => u.id === peerId);
  if (!peer) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  // Check connection status
  const isConnected = areUsersConnected(currentUserId!, peerId);

  // Retrieve messages
  const messages = db.messages
    .filter(m => 
      (m.senderId === currentUserId && m.receiverId === peerId) ||
      (m.senderId === peerId && m.receiverId === currentUserId)
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Mark all unread messages from this peer to current user as read
  let markedAny = false;
  for (const m of messages) {
    if (m.senderId === peerId && !m.read) {
      m.read = true;
      markedAny = true;
    }
  }

  if (markedAny) {
    saveDatabase();
  }

  res.json({
    isConnected,
    peer: {
      id: peer.id,
      name: peer.name,
      email: peer.email,
      branch: peer.branch,
      section: peer.section,
      year: peer.year,
      profilePhoto: peer.profilePhoto,
    },
    messages,
  });
});

// PUT /api/chat/:id/read - Mark a message as read
router.put('/:id/read', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const db = getDatabase();

  const msg = db.messages.find(m => m.id === req.params.id && m.receiverId === currentUserId);
  if (msg) {
    msg.read = true;
    saveDatabase();
  }

  res.json({ success: true });
});

export default router;
