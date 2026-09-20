import { Router, Response } from 'express';
import { getDatabase, saveDatabase, ConnectionRecord } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../authMiddleware.js';

const router = Router();

// POST /api/connections - Send a connection request
router.post('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const { receiverId } = req.body;

  if (!receiverId) {
    res.status(400).json({ error: 'Receiver ID is required.' });
    return;
  }

  if (currentUserId === receiverId) {
    res.status(400).json({ error: 'You cannot connect with yourself.' });
    return;
  }

  const db = getDatabase();
  const receiver = db.users.find(u => u.id === receiverId);
  if (!receiver) {
    res.status(404).json({ error: 'Target student not found.' });
    return;
  }

  // Check existing connection in either direction
  const existingIndex = db.connections.findIndex(c => 
    (c.senderId === currentUserId && c.receiverId === receiverId) ||
    (c.senderId === receiverId && c.receiverId === currentUserId)
  );

  if (existingIndex !== -1) {
    const existing = db.connections[existingIndex];
    if (existing.status === 'Accepted') {
      res.status(400).json({ error: 'You are already connected with this student.' });
      return;
    }
    if (existing.status === 'Pending') {
      res.status(400).json({ error: 'Connection request already exists.' });
      return;
    }
    // If previously rejected or cancelled, reactivate
    existing.senderId = currentUserId!;
    existing.receiverId = receiverId;
    existing.status = 'Pending';
    existing.updatedAt = new Date().toISOString();
    saveDatabase();

    res.json({
      message: 'Connection request sent successfully!',
      connection: existing,
    });
    return;
  }

  const newConnection: ConnectionRecord = {
    id: 'conn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    senderId: currentUserId!,
    receiverId,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.connections.push(newConnection);
  saveDatabase();

  res.status(201).json({
    message: 'Connection request sent successfully!',
    connection: newConnection,
  });
});

// GET /api/connections - Get accepted connections with peer student profile
router.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const db = getDatabase();

  const acceptedConns = db.connections.filter(c => 
    c.status === 'Accepted' && (c.senderId === currentUserId || c.receiverId === currentUserId)
  );

  const connections = acceptedConns.map(c => {
    const peerId = c.senderId === currentUserId ? c.receiverId : c.senderId;
    const peer = db.users.find(u => u.id === peerId);

    // Get last chat message if any
    const lastMsg = db.messages
      .filter(m => (m.senderId === currentUserId && m.receiverId === peerId) || (m.senderId === peerId && m.receiverId === currentUserId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    return {
      connectionId: c.id,
      connectedAt: c.updatedAt || c.createdAt,
      peer: peer ? {
        id: peer.id,
        name: peer.name,
        email: peer.email,
        branch: peer.branch,
        section: peer.section,
        year: peer.year,
        skills: peer.skills,
        interests: peer.interests,
        profilePhoto: peer.profilePhoto,
        bio: peer.bio,
      } : null,
      lastMessage: lastMsg ? {
        message: lastMsg.message,
        createdAt: lastMsg.createdAt,
        isFromMe: lastMsg.senderId === currentUserId,
      } : null,
    };
  }).filter(c => c.peer !== null);

  res.json({ connections });
});

// GET /api/connections/requests - Get incoming & sent pending requests
router.get('/requests', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const db = getDatabase();

  // Incoming: receiver is current user
  const incomingRecords = db.connections.filter(c => 
    c.receiverId === currentUserId && c.status === 'Pending'
  );

  const incoming = incomingRecords.map(c => {
    const sender = db.users.find(u => u.id === c.senderId);
    return {
      connectionId: c.id,
      createdAt: c.createdAt,
      sender: sender ? {
        id: sender.id,
        name: sender.name,
        email: sender.email,
        branch: sender.branch,
        section: sender.section,
        year: sender.year,
        skills: sender.skills,
        interests: sender.interests,
        profilePhoto: sender.profilePhoto,
      } : null,
    };
  }).filter(r => r.sender !== null);

  // Sent: sender is current user
  const sentRecords = db.connections.filter(c => 
    c.senderId === currentUserId && c.status === 'Pending'
  );

  const sent = sentRecords.map(c => {
    const receiver = db.users.find(u => u.id === c.receiverId);
    return {
      connectionId: c.id,
      createdAt: c.createdAt,
      receiver: receiver ? {
        id: receiver.id,
        name: receiver.name,
        email: receiver.email,
        branch: receiver.branch,
        section: receiver.section,
        year: receiver.year,
        skills: receiver.skills,
        interests: receiver.interests,
        profilePhoto: receiver.profilePhoto,
      } : null,
    };
  }).filter(r => r.receiver !== null);

  res.json({ incoming, sent });
});

// PUT /api/connections/:id/accept - Accept incoming request
router.put('/:id/accept', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const db = getDatabase();

  const conn = db.connections.find(c => c.id === req.params.id);

  if (!conn) {
    res.status(404).json({ error: 'Connection request not found.' });
    return;
  }

  // Only the receiver can accept
  if (conn.receiverId !== currentUserId) {
    res.status(403).json({ error: 'You are not authorized to accept this request.' });
    return;
  }

  conn.status = 'Accepted';
  conn.updatedAt = new Date().toISOString();
  saveDatabase();

  const sender = db.users.find(u => u.id === conn.senderId);

  res.json({
    message: `Connected with ${sender?.name || 'student'}! You can now chat.`,
    connection: conn,
  });
});

// PUT /api/connections/:id/reject - Reject incoming request
router.put('/:id/reject', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const db = getDatabase();

  const conn = db.connections.find(c => c.id === req.params.id);

  if (!conn) {
    res.status(404).json({ error: 'Connection request not found.' });
    return;
  }

  if (conn.receiverId !== currentUserId) {
    res.status(403).json({ error: 'You are not authorized to reject this request.' });
    return;
  }

  conn.status = 'Rejected';
  conn.updatedAt = new Date().toISOString();
  saveDatabase();

  res.json({
    message: 'Connection request declined.',
    connection: conn,
  });
});

// DELETE /api/connections/:id - Cancel pending request or remove connection
router.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user?.id;
  const db = getDatabase();

  const connIndex = db.connections.findIndex(c => 
    c.id === req.params.id && (c.senderId === currentUserId || c.receiverId === currentUserId)
  );

  if (connIndex === -1) {
    res.status(404).json({ error: 'Connection not found or already removed.' });
    return;
  }

  db.connections.splice(connIndex, 1);
  saveDatabase();

  res.json({ message: 'Connection removed successfully.' });
});

export default router;
