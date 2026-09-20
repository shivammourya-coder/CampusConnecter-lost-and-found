import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  branch: string;
  section: string;
  year: string;
  interests: string[];
  skills: string[];
  profilePhoto: string;
  bio?: string;
  createdAt: string;
}

export interface ItemRecord {
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

export interface ConnectionRecord {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  items: ItemRecord[];
  connections: ConnectionRecord[];
  messages: MessageRecord[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'campusconnect_db.json');

// In-memory cache for ultra-fast response and fallback
let dbCache: DatabaseSchema = {
  users: [],
  items: [],
  connections: [],
  messages: [],
};

let isMongoConnected = false;

// Seed data with realistic two-account testing pairs
async function generateInitialSeed(): Promise<DatabaseSchema> {
  const defaultPasswordHash = await bcrypt.hash('Campus123!', 10);

  const users: UserRecord[] = [
    {
      id: 'usr_aravind_01',
      name: 'Aravind Sharma',
      email: 'aravind@campus.edu',
      passwordHash: defaultPasswordHash,
      branch: 'CSE',
      section: 'A',
      year: '3rd',
      interests: ['Coding', 'AI/ML', 'Web Development', 'Gaming'],
      skills: ['React', 'Node.js', 'Python', 'TypeScript', 'UI/UX'],
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
      bio: '3rd Year Computer Science student passionate about full-stack web dev and machine learning projects.',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: 'usr_priya_02',
      name: 'Priya Patel',
      email: 'priya@campus.edu',
      passwordHash: defaultPasswordHash,
      branch: 'IT',
      section: 'B',
      year: '2nd',
      interests: ['Web Development', 'Design', 'Music', 'Coding'],
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'UI/UX'],
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
      bio: '2nd Year IT student exploring modern frontend architectures, UX design systems, and campus tech clubs.',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      id: 'usr_rohit_03',
      name: 'Rohit Verma',
      email: 'rohit@campus.edu',
      passwordHash: defaultPasswordHash,
      branch: 'ECE',
      section: 'A',
      year: '3rd',
      interests: ['AI/ML', 'Robotics', 'Cyber Security', 'Gaming'],
      skills: ['Python', 'C/C++', 'Java'],
      profilePhoto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Electronics & Communication enthusiast building IoT devices and robotics controllers.',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'usr_ananya_04',
      name: 'Ananya Rao',
      email: 'ananya@campus.edu',
      passwordHash: defaultPasswordHash,
      branch: 'CSE',
      section: 'C',
      year: '4th',
      interests: ['Cyber Security', 'Entrepreneurship', 'Coding'],
      skills: ['Python', 'Java', 'Linux', 'Network Security'],
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Final year CSE student heading the campus cybersecurity society and working on fintech security.',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'usr_karan_05',
      name: 'Karan Malhotra',
      email: 'karan@campus.edu',
      passwordHash: defaultPasswordHash,
      branch: 'ME',
      section: 'B',
      year: '2nd',
      interests: ['Sports', 'Design', 'Gaming', 'Entrepreneurship'],
      skills: ['AutoCAD', 'SolidWorks', 'Python'],
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Mechanical engineering sophomore, badminton team captain, and 3D prototyping hobbyist.',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];

  // Items crafted with intentional realistic matches for two-account testing:
  // Item 1: Aravind lost black leather wallet in Central Library
  // Item 2: Priya found black leather wallet near Central Library reading hall -> HIGH MATCH!
  // Item 3: Rohit lost Dell 65W USB-C laptop charger in CSE Lab 3
  // Item 4: Aravind found black laptop charger in Computer Lab -> HIGH MATCH!
  // Item 5: Ananya found Casio fx-991EX scientific calculator in Canteen
  const items: ItemRecord[] = [
    {
      id: 'item_001',
      userId: 'usr_aravind_01',
      userName: 'Aravind Sharma',
      userEmail: 'aravind@campus.edu',
      userPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
      type: 'Lost',
      title: 'Black Leather Wallet with Student ID Card',
      description: 'Lost my brown-black bi-fold leather wallet. Contains college ID card (CSE-2023-042), metro card, and driver license. Last seen near the 2nd floor library reading tables.',
      category: 'Bags & Wallets',
      location: 'Central Library 2nd Floor',
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      photo: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
      status: 'Active',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'item_002',
      userId: 'usr_priya_02',
      userName: 'Priya Patel',
      userEmail: 'priya@campus.edu',
      userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
      type: 'Found',
      title: 'Found Black Leather Wallet near Central Library',
      description: 'Picked up a black leather wallet from table 14 near the Central Library newspaper section. Has a college ID card and travel passes inside. Handed over details safely.',
      category: 'Bags & Wallets',
      location: 'Central Library Ground Floor',
      date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      photo: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
      status: 'Active',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'item_003',
      userId: 'usr_rohit_03',
      userName: 'Rohit Verma',
      userEmail: 'rohit@campus.edu',
      userPhoto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&h=200&q=80',
      type: 'Lost',
      title: 'Dell 65W USB-C Laptop Charger Adapter',
      description: 'Misplaced my black Dell laptop charger with an oval USB-C connector. It has a small blue sticker on the brick. Forgotten during afternoon lab session.',
      category: 'Electronics',
      location: 'CSE Lab Block B Room 304',
      date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      photo: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
      status: 'Active',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'item_004',
      userId: 'usr_aravind_01',
      userName: 'Aravind Sharma',
      userEmail: 'aravind@campus.edu',
      userPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
      type: 'Found',
      title: 'Found Black USB-C Laptop Charger in Computer Lab',
      description: 'Found a 65W Type-C laptop charger plugged into the corner socket in CSE Lab B. Looks like Dell brand with a colored sticker.',
      category: 'Electronics',
      location: 'CSE Computer Lab Block B',
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      photo: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
      status: 'Active',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'item_005',
      userId: 'usr_ananya_04',
      userName: 'Ananya Rao',
      userEmail: 'ananya@campus.edu',
      userPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      type: 'Found',
      title: 'Casio Scientific Calculator fx-991EX',
      description: 'Found a black and white Casio ClassWiz calculator left on the cafeteria table outside the juice counter.',
      category: 'Books & Stationery',
      location: 'Central Campus Canteen',
      date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
      photo: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
      status: 'Active',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
  ];

  // Connections between sample users:
  // Aravind <-> Priya: Connected
  // Aravind <- Rohit: Pending incoming request from Rohit to Aravind
  // Aravind -> Ananya: Sent request pending
  const connections: ConnectionRecord[] = [
    {
      id: 'conn_001',
      senderId: 'usr_aravind_01',
      receiverId: 'usr_priya_02',
      status: 'Accepted',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'conn_002',
      senderId: 'usr_rohit_03',
      receiverId: 'usr_aravind_01',
      status: 'Pending',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'conn_003',
      senderId: 'usr_aravind_01',
      receiverId: 'usr_ananya_04',
      status: 'Pending',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];

  // Sample chat messages between Aravind and Priya (connected)
  const messages: MessageRecord[] = [
    {
      id: 'msg_001',
      senderId: 'usr_priya_02',
      receiverId: 'usr_aravind_01',
      message: 'Hey Aravind! I saw your post about the lost wallet in the library.',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'msg_002',
      senderId: 'usr_aravind_01',
      receiverId: 'usr_priya_02',
      message: 'Hi Priya! Really? Did you happen to find it around table 14?',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    },
    {
      id: 'msg_003',
      senderId: 'usr_priya_02',
      receiverId: 'usr_aravind_01',
      message: 'Yes exactly! The AI matching matched our posts with 94% confidence. I have it safely with me.',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'msg_004',
      senderId: 'usr_aravind_01',
      receiverId: 'usr_priya_02',
      message: 'That is incredible, thank you so much! Are you free around the cafeteria at 2 PM?',
      read: false,
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
  ];

  return { users, items, connections, messages };
}

export async function initDatabase(): Promise<void> {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Check if file exists, if not seed it
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(data);
      console.log(`[Database] Loaded local persistent database with ${dbCache.users.length} users, ${dbCache.items.length} items.`);
    } catch (err) {
      console.warn('[Database] Corrupted local DB file, re-seeding...', err);
      dbCache = await generateInitialSeed();
      saveDatabase();
    }
  } else {
    console.log('[Database] Initializing fresh database with seed data...');
    dbCache = await generateInitialSeed();
    saveDatabase();
  }

  // Attempt optional MongoDB connection if MONGODB_URI is provided
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && mongoUri.startsWith('mongodb')) {
    try {
      console.log('[Database] Connecting to MongoDB Atlas...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      isMongoConnected = true;
      console.log('[Database] Successfully connected to MongoDB Atlas!');
    } catch (err: any) {
      console.warn('[Database] MongoDB Atlas connection error or timeout. Falling back to local persistent store:', err?.message || err);
      isMongoConnected = false;
    }
  } else {
    console.log('[Database] Using local persistent JSON store (MONGODB_URI not configured or using fallback).');
  }
}

export function saveDatabase(): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Database] Failed to write database file:', err);
  }
}

export function getDatabase(): DatabaseSchema {
  return dbCache;
}

export function isMongoAtlasActive(): boolean {
  return isMongoConnected;
}
