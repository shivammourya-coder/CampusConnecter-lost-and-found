import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDatabase, saveDatabase, UserRecord } from '../db.js';
import { generateToken, authMiddleware, AuthenticatedRequest } from '../authMiddleware.js';

const router = Router();

// Sanitize user object to never leak password hash
function sanitizeUser(user: UserRecord) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword, branch, section, year, interests, skills } = req.body;

    if (!name || !email || !password || !branch || !section || !year) {
      res.status(400).json({ error: 'Please fill all required fields.' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const emailNormalized = email.toLowerCase().trim();
    const db = getDatabase();

    const existingUser = db.users.find(u => u.email.toLowerCase() === emailNormalized);
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered. Please log in instead.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // Format interests and skills into arrays
    const formattedInterests = Array.isArray(interests)
      ? interests
      : typeof interests === 'string' && interests.trim()
      ? interests.split(',').map(s => s.trim()).filter(Boolean)
      : ['Coding'];

    const formattedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string' && skills.trim()
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : ['JavaScript'];

    // Realistic avatars based on random seed
    const avatarSeeds = ['Felix', 'Aneka', 'Jack', 'Oliver', 'Sofia', 'Aiden', 'Mia'];
    const randomSeed = avatarSeeds[Math.floor(Math.random() * avatarSeeds.length)];
    const profilePhoto = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || randomSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

    const newUser: UserRecord = {
      id: userId,
      name: name.trim(),
      email: emailNormalized,
      passwordHash,
      branch: branch.trim(),
      section: section.trim(),
      year: year.trim(),
      interests: formattedInterests,
      skills: formattedSkills,
      profilePhoto,
      bio: `Student at CampusConnect, studying ${branch} (${year} Year).`,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDatabase();

    const token = generateToken({ id: newUser.id, email: newUser.email, name: newUser.name });

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Please enter both email and password.' });
      return;
    }

    const emailNormalized = email.toLowerCase().trim();
    const db = getDatabase();

    const user = db.users.find(u => u.email.toLowerCase() === emailNormalized);
    if (!user) {
      res.status(400).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    res.json({
      message: 'Login successful!',
      token,
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login. Please try again.' });
  }
});

// POST /api/auth/demo-login (Facilitates instant two-account testing for reviewers)
router.post('/demo-login', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const db = getDatabase();

    const targetEmail = email ? email.toLowerCase().trim() : 'aravind@campus.edu';
    const user = db.users.find(u => u.email.toLowerCase() === targetEmail) || db.users[0];

    if (!user) {
      res.status(404).json({ error: 'Demo user not found.' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    res.json({
      message: `Logged in as ${user.name} for testing!`,
      token,
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Demo login failed.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const user = db.users.find(u => u.id === req.user?.id);

  if (!user) {
    res.status(404).json({ error: 'User profile not found.' });
    return;
  }

  res.json({ user: sanitizeUser(user) });
});

export default router;
