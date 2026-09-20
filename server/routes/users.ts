import { Router, Response } from 'express';
import { getDatabase, saveDatabase, UserRecord } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../authMiddleware.js';

const router = Router();

function sanitizeUser(user: UserRecord) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// GET /api/users/profile - Get current user profile with activity stats
router.get('/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user?.id;
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Calculate statistics
  const userItems = db.items.filter(i => i.userId === userId);
  const lostCount = userItems.filter(i => i.type === 'Lost').length;
  const foundCount = userItems.filter(i => i.type === 'Found').length;
  
  const connectionCount = db.connections.filter(c => 
    c.status === 'Accepted' && (c.senderId === userId || c.receiverId === userId)
  ).length;

  res.json({
    user: sanitizeUser(user),
    stats: {
      lostCount,
      foundCount,
      connectionCount,
      totalItems: userItems.length,
    }
  });
});

// PUT /api/users/profile - Update user profile
router.put('/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user?.id;
  const userIndex = db.users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { name, branch, section, year, interests, skills, bio, profilePhoto } = req.body;

  if (name) db.users[userIndex].name = name.trim();
  if (branch) db.users[userIndex].branch = branch.trim();
  if (section) db.users[userIndex].section = section.trim();
  if (year) db.users[userIndex].year = year.trim();
  if (bio !== undefined) db.users[userIndex].bio = bio;
  if (profilePhoto) db.users[userIndex].profilePhoto = profilePhoto;

  if (interests) {
    db.users[userIndex].interests = Array.isArray(interests) 
      ? interests 
      : typeof interests === 'string' 
      ? interests.split(',').map(s => s.trim()).filter(Boolean) 
      : db.users[userIndex].interests;
  }

  if (skills) {
    db.users[userIndex].skills = Array.isArray(skills) 
      ? skills 
      : typeof skills === 'string' 
      ? skills.split(',').map(s => s.trim()).filter(Boolean) 
      : db.users[userIndex].skills;
  }

  // Also update user's name and photo in any items they created
  for (const item of db.items) {
    if (item.userId === userId) {
      if (name) item.userName = name.trim();
      if (profilePhoto) item.userPhoto = profilePhoto;
    }
  }

  saveDatabase();

  res.json({
    message: 'Profile updated successfully!',
    user: sanitizeUser(db.users[userIndex]),
  });
});

// GET /api/users/search - Search and discover students with multi-filters
router.get('/search', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const currentUserId = req.user?.id;

  const { branch, section, year, interest, skill, query } = req.query;

  let results = db.users.filter(u => u.id !== currentUserId);

  // Apply filters
  if (branch && branch !== 'All' && branch !== 'Other') {
    results = results.filter(u => u.branch.toLowerCase() === (branch as string).toLowerCase());
  }

  if (section && section !== 'All' && section !== 'Other') {
    results = results.filter(u => u.section.toLowerCase() === (section as string).toLowerCase());
  }

  if (year && year !== 'All') {
    results = results.filter(u => u.year.toLowerCase().startsWith((year as string).toLowerCase().replace('st', '').replace('nd', '').replace('rd', '').replace('th', '')));
  }

  if (interest && interest !== 'All') {
    const targetInterest = (interest as string).toLowerCase();
    results = results.filter(u => 
      u.interests.some(i => i.toLowerCase().includes(targetInterest))
    );
  }

  if (skill && skill !== 'All') {
    const targetSkill = (skill as string).toLowerCase();
    results = results.filter(u => 
      u.skills.some(s => s.toLowerCase().includes(targetSkill))
    );
  }

  if (query && typeof query === 'string' && query.trim()) {
    const q = query.toLowerCase().trim();
    results = results.filter(u => 
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.branch.toLowerCase().includes(q) ||
      u.skills.some(s => s.toLowerCase().includes(q)) ||
      u.interests.some(i => i.toLowerCase().includes(q))
    );
  }

  // Annotate each user with connection status relative to current user
  const userConnections = db.connections.filter(c => 
    c.senderId === currentUserId || c.receiverId === currentUserId
  );

  const enrichedUsers = results.map(u => {
    let connectionStatus: 'Connected' | 'Pending_Sent' | 'Pending_Received' | 'None' = 'None';
    let connectionId: string | null = null;

    const connection = userConnections.find(c => 
      (c.senderId === currentUserId && c.receiverId === u.id) ||
      (c.receiverId === currentUserId && c.senderId === u.id)
    );

    if (connection) {
      connectionId = connection.id;
      if (connection.status === 'Accepted') {
        connectionStatus = 'Connected';
      } else if (connection.status === 'Pending') {
        connectionStatus = connection.senderId === currentUserId ? 'Pending_Sent' : 'Pending_Received';
      }
    }

    return {
      ...sanitizeUser(u),
      connectionStatus,
      connectionId,
    };
  });

  res.json({ users: enrichedUsers });
});

// GET /api/users/:id - Public profile of a student
router.get('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const currentUserId = req.user?.id;
  const targetId = req.params.id;

  const targetUser = db.users.find(u => u.id === targetId);
  if (!targetUser) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  const userItems = db.items.filter(i => i.userId === targetId && i.status !== 'Resolved');
  const connectionCount = db.connections.filter(c => 
    c.status === 'Accepted' && (c.senderId === targetId || c.receiverId === targetId)
  ).length;

  const existingConn = db.connections.find(c => 
    (c.senderId === currentUserId && c.receiverId === targetId) ||
    (c.receiverId === currentUserId && c.senderId === targetId)
  );

  let connectionStatus: 'Connected' | 'Pending_Sent' | 'Pending_Received' | 'None' = 'None';
  if (existingConn) {
    if (existingConn.status === 'Accepted') connectionStatus = 'Connected';
    else if (existingConn.status === 'Pending') {
      connectionStatus = existingConn.senderId === currentUserId ? 'Pending_Sent' : 'Pending_Received';
    }
  }

  res.json({
    user: sanitizeUser(targetUser),
    stats: {
      activeItemsCount: userItems.length,
      connectionCount,
    },
    connectionStatus,
    connectionId: existingConn ? existingConn.id : null,
    items: userItems,
  });
});

export default router;
