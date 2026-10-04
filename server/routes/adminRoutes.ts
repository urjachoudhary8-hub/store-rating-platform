import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, UserRole } from '../db.js';
import {
  validateEmail,
  validateName,
  validateAddress,
  validatePassword,
  validateStoreName,
} from '../validators.js';
import { authenticate, requireRole, AuthRequest } from '../auth.js';

const router = Router();

// Protect all admin routes with authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

// Admin Dashboard stats
router.get('/dashboard', (_req: AuthRequest, res: Response) => {
  const users = db.getUsers();
  const stores = db.getStores();
  const ratings = db.getRatings();

  // Role breakdowns
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const normalUserCount = users.filter((u) => u.role === 'user').length;
  const storeOwnerCount = users.filter((u) => u.role === 'owner').length;

  res.json({
    totalUsers: users.length,
    totalStores: stores.length,
    totalRatings: ratings.length,
    breakdown: {
      adminCount,
      normalUserCount,
      storeOwnerCount,
    },
  });
});

// Admin: Get users with filtering & sorting
// Query params: name, email, address, role, sortBy, sortOrder
router.get('/users', (req: AuthRequest, res: Response) => {
  const { name, email, address, role, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  let users = db.getUsers().map((u) => {
    // If user is a store owner, calculate their rating details
    let ownerRating: { averageRating: number; totalRatings: number; storesCount: number } | null = null;
    if (u.role === 'owner') {
      ownerRating = db.getOwnerRatingStats(u.id);
    }

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      address: u.address,
      role: u.role,
      createdAt: u.createdAt,
      ownerRating,
    };
  });

  // Filtering
  if (name && typeof name === 'string' && name.trim()) {
    const q = name.trim().toLowerCase();
    users = users.filter((u) => u.name.toLowerCase().includes(q));
  }
  if (email && typeof email === 'string' && email.trim()) {
    const q = email.trim().toLowerCase();
    users = users.filter((u) => u.email.toLowerCase().includes(q));
  }
  if (address && typeof address === 'string' && address.trim()) {
    const q = address.trim().toLowerCase();
    users = users.filter((u) => u.address.toLowerCase().includes(q));
  }
  if (role && typeof role === 'string' && role.trim()) {
    const q = role.trim().toLowerCase();
    users = users.filter((u) => u.role.toLowerCase() === q);
  }

  // Sorting
  const sortKey = String(sortBy);
  const isAsc = String(sortOrder).toLowerCase() === 'asc';

  users.sort((a, b) => {
    let valA: string | number = '';
    let valB: string | number = '';

    if (sortKey === 'name') {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    } else if (sortKey === 'email') {
      valA = a.email.toLowerCase();
      valB = b.email.toLowerCase();
    } else if (sortKey === 'address') {
      valA = a.address.toLowerCase();
      valB = b.address.toLowerCase();
    } else if (sortKey === 'role') {
      valA = a.role.toLowerCase();
      valB = b.role.toLowerCase();
    } else if (sortKey === 'rating') {
      valA = a.ownerRating?.averageRating ?? -1;
      valB = b.ownerRating?.averageRating ?? -1;
    } else {
      valA = new Date(a.createdAt).getTime();
      valB = new Date(b.createdAt).getTime();
    }

    if (valA < valB) return isAsc ? -1 : 1;
    if (valA > valB) return isAsc ? 1 : -1;
    return 0;
  });

  res.json({ users });
});

// Admin: Get single user detail (including store owner rating stats)
router.get('/users/:id', (req: AuthRequest, res: Response) => {
  const user = db.findUserById(req.params.id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  let ownerStats: {
    averageRating: number;
    totalRatings: number;
    stores: Array<{ id: string; name: string; averageRating: number; totalRatings: number }>;
  } | null = null;

  if (user.role === 'owner') {
    const ownerStores = db.findStoresByOwnerId(user.id);
    const storeDetails = ownerStores.map((s) => {
      const stats = db.getStoreRatingStats(s.id);
      return {
        id: s.id,
        name: s.name,
        averageRating: stats.averageRating,
        totalRatings: stats.totalRatings,
      };
    });

    const overall = db.getOwnerRatingStats(user.id);
    ownerStats = {
      averageRating: overall.averageRating,
      totalRatings: overall.totalRatings,
      stores: storeDetails,
    };
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
    createdAt: user.createdAt,
    ownerStats,
  });
});

// Admin: Add new user (admin, user, or owner)
router.post('/users', (req: AuthRequest, res: Response) => {
  const { name, email, password, address, role } = req.body;

  const errors: Record<string, string> = {};

  const nameErr = validateName(name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const addressErr = validateAddress(address);
  if (addressErr) errors.address = addressErr;

  const passErr = validatePassword(password);
  if (passErr) errors.password = passErr;

  const validRoles: UserRole[] = ['admin', 'user', 'owner'];
  if (!role || !validRoles.includes(role)) {
    errors.role = 'Role must be one of: admin, user, owner';
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ message: 'Validation failed', errors });
    return;
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    res.status(409).json({
      message: 'Email already exists',
      errors: { email: 'Email is already registered' },
    });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = db.createUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    address: address.trim(),
    role: role as UserRole,
  });

  res.status(201).json({
    message: 'User created successfully',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      address: newUser.address,
      role: newUser.role,
      createdAt: newUser.createdAt,
    },
  });
});

// Admin: View stores list with Name, Email, Address, Overall Rating
// Query params: name, email, address, sortBy, sortOrder
router.get('/stores', (req: AuthRequest, res: Response) => {
  const { name, email, address, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  let stores = db.getStores().map((s) => {
    const stats = db.getStoreRatingStats(s.id);
    const owner = s.ownerId ? db.findUserById(s.ownerId) : null;

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      rating: stats.averageRating,
      totalRatings: stats.totalRatings,
      owner: owner ? { id: owner.id, name: owner.name, email: owner.email } : null,
      createdAt: s.createdAt,
    };
  });

  // Filtering
  if (name && typeof name === 'string' && name.trim()) {
    const q = name.trim().toLowerCase();
    stores = stores.filter((s) => s.name.toLowerCase().includes(q));
  }
  if (email && typeof email === 'string' && email.trim()) {
    const q = email.trim().toLowerCase();
    stores = stores.filter((s) => s.email.toLowerCase().includes(q));
  }
  if (address && typeof address === 'string' && address.trim()) {
    const q = address.trim().toLowerCase();
    stores = stores.filter((s) => s.address.toLowerCase().includes(q));
  }

  // Sorting
  const sortKey = String(sortBy);
  const isAsc = String(sortOrder).toLowerCase() === 'asc';

  stores.sort((a, b) => {
    let valA: string | number = '';
    let valB: string | number = '';

    if (sortKey === 'name') {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    } else if (sortKey === 'email') {
      valA = a.email.toLowerCase();
      valB = b.email.toLowerCase();
    } else if (sortKey === 'address') {
      valA = a.address.toLowerCase();
      valB = b.address.toLowerCase();
    } else if (sortKey === 'rating') {
      valA = a.rating;
      valB = b.rating;
    } else {
      valA = new Date(a.createdAt).getTime();
      valB = new Date(b.createdAt).getTime();
    }

    if (valA < valB) return isAsc ? -1 : 1;
    if (valA > valB) return isAsc ? 1 : -1;
    return 0;
  });

  res.json({ stores });
});

// Admin: Add new store
router.post('/stores', (req: AuthRequest, res: Response) => {
  const { name, email, address, ownerId } = req.body;

  const errors: Record<string, string> = {};

  const nameErr = validateStoreName(name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const addressErr = validateAddress(address);
  if (addressErr) errors.address = addressErr;

  if (ownerId) {
    const owner = db.findUserById(ownerId);
    if (!owner || owner.role !== 'owner') {
      errors.ownerId = 'Selected owner must be a registered Store Owner user';
    }
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ message: 'Validation failed', errors });
    return;
  }

  const existingStore = db.findStoreByEmail(email);
  if (existingStore) {
    res.status(409).json({
      message: 'A store with this email already exists',
      errors: { email: 'Store email already in use' },
    });
    return;
  }

  const newStore = db.createStore({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    address: address.trim(),
    ownerId: ownerId || null,
  });

  res.status(201).json({
    message: 'Store created successfully',
    store: newStore,
  });
});

export default router;
