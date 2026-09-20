import { Router, Response } from 'express';
import { getDatabase, saveDatabase, ItemRecord } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../authMiddleware.js';
import { findMatchesForItem } from '../similarity.js';

const router = Router();

// GET /api/items - Retrieve items with filtering
router.get('/', (req, res: Response) => {
  const db = getDatabase();
  const { type, category, location, keyword, date, status, userId } = req.query;

  let results = [...db.items];

  // Filter by type: 'Lost' | 'Found'
  if (type && (type === 'Lost' || type === 'Found')) {
    results = results.filter(i => i.type === type);
  }

  // Filter by category
  if (category && category !== 'All') {
    results = results.filter(i => i.category.toLowerCase() === (category as string).toLowerCase());
  }

  // Filter by location
  if (location && typeof location === 'string' && location.trim()) {
    const locQuery = location.toLowerCase().trim();
    results = results.filter(i => i.location.toLowerCase().includes(locQuery));
  }

  // Filter by date
  if (date && typeof date === 'string' && date.trim()) {
    results = results.filter(i => i.date === date);
  }

  // Filter by status
  if (status && status !== 'All') {
    results = results.filter(i => i.status === status);
  }

  // Filter by owner
  if (userId && typeof userId === 'string') {
    results = results.filter(i => i.userId === userId);
  }

  // Filter by search keyword
  if (keyword && typeof keyword === 'string' && keyword.trim()) {
    const kw = keyword.toLowerCase().trim();
    results = results.filter(i => 
      i.title.toLowerCase().includes(kw) ||
      i.description.toLowerCase().includes(kw) ||
      i.location.toLowerCase().includes(kw) ||
      i.category.toLowerCase().includes(kw)
    );
  }

  // Sort newest first
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ items: results });
});

// GET /api/items/matches/:id - Get possible AI/text-similarity matches for an item
router.get('/matches/:id', (req, res: Response) => {
  const db = getDatabase();
  const targetItem = db.items.find(i => i.id === req.params.id);

  if (!targetItem) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const matches = findMatchesForItem(targetItem, db.items);
  res.json({
    item: targetItem,
    matchCount: matches.length,
    matches,
  });
});

// GET /api/items/:id - Get single item detail
router.get('/:id', (req, res: Response) => {
  const db = getDatabase();
  const item = db.items.find(i => i.id === req.params.id);

  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  // Attach possible match count
  const matches = findMatchesForItem(item, db.items);

  res.json({
    item,
    matchCount: matches.length,
    topMatch: matches.length > 0 ? matches[0] : null,
  });
});

// POST /api/items - Report a Lost or Found item
router.post('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, title, description, category, location, date, photo } = req.body;
    const userId = req.user?.id;
    const userName = req.user?.name;
    const userEmail = req.user?.email;

    if (!type || !title || !description || !category || !location) {
      res.status(400).json({ error: 'Please fill all required item fields.' });
      return;
    }

    if (type !== 'Lost' && type !== 'Found') {
      res.status(400).json({ error: 'Type must be either Lost or Found.' });
      return;
    }

    const db = getDatabase();
    const user = db.users.find(u => u.id === userId);

    const newItem: ItemRecord = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: userId!,
      userName: userName || 'Student',
      userEmail: userEmail || '',
      userPhoto: user?.profilePhoto,
      type,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      location: location.trim(),
      date: date || new Date().toISOString().split('T')[0],
      photo: photo || (type === 'Lost' ? 
        'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=600&q=80' : 
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'),
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    db.items.unshift(newItem);
    saveDatabase();

    // Check for immediate matches against opposite items
    const matches = findMatchesForItem(newItem, db.items);

    res.status(201).json({
      message: `${type} item reported successfully!`,
      item: newItem,
      possibleMatchesCount: matches.length,
      topMatch: matches.length > 0 ? matches[0] : null,
    });
  } catch (err: any) {
    console.error('Error reporting item:', err);
    res.status(500).json({ error: 'Failed to report item. Please try again.' });
  }
});

// PUT /api/items/:id - Update item
router.put('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const itemIndex = db.items.findIndex(i => i.id === req.params.id);

  if (itemIndex === -1) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  // Verify ownership
  if (db.items[itemIndex].userId !== req.user?.id) {
    res.status(403).json({ error: 'You are not authorized to edit this item.' });
    return;
  }

  const { title, description, category, location, date, photo, status } = req.body;

  if (title) db.items[itemIndex].title = title.trim();
  if (description) db.items[itemIndex].description = description.trim();
  if (category) db.items[itemIndex].category = category.trim();
  if (location) db.items[itemIndex].location = location.trim();
  if (date) db.items[itemIndex].date = date;
  if (photo) db.items[itemIndex].photo = photo;
  if (status && ['Active', 'Matched', 'Resolved'].includes(status)) {
    db.items[itemIndex].status = status;
  }

  saveDatabase();

  res.json({
    message: 'Item updated successfully!',
    item: db.items[itemIndex],
  });
});

// PUT /api/items/:id/status - Update item status (Active, Matched, Resolved)
router.put('/:id/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const item = db.items.find(i => i.id === req.params.id);

  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  if (item.userId !== req.user?.id) {
    res.status(403).json({ error: 'You are not authorized to update this item status.' });
    return;
  }

  const { status } = req.body;
  if (!status || !['Active', 'Matched', 'Resolved'].includes(status)) {
    res.status(400).json({ error: 'Status must be Active, Matched, or Resolved.' });
    return;
  }

  item.status = status;
  saveDatabase();

  res.json({
    message: `Item marked as ${status}!`,
    item,
  });
});

// DELETE /api/items/:id - Delete item
router.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const itemIndex = db.items.findIndex(i => i.id === req.params.id);

  if (itemIndex === -1) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  if (db.items[itemIndex].userId !== req.user?.id) {
    res.status(403).json({ error: 'You are not authorized to delete this item.' });
    return;
  }

  db.items.splice(itemIndex, 1);
  saveDatabase();

  res.json({ message: 'Item deleted successfully.' });
});

export default router;
