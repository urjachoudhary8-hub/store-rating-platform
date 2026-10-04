import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import {
  validateEmail,
  validateName,
  validateAddress,
  validatePassword,
} from '../validators.js';
import { authenticate, generateToken, AuthRequest } from '../auth.js';

const router = Router();

// Normal user signup
router.post('/register', (req, res: Response) => {
  const { name, email, password, address } = req.body;

  const errors: Record<string, string> = {};

  const nameErr = validateName(name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const addressErr = validateAddress(address);
  if (addressErr) errors.address = addressErr;

  const passErr = validatePassword(password);
  if (passErr) errors.password = passErr;

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ message: 'Validation failed', errors });
    return;
  }

  // Check uniqueness
  const existing = db.findUserByEmail(email);
  if (existing) {
    res.status(409).json({
      message: 'An account with this email address already exists.',
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
    role: 'user',
  });

  const token = generateToken(newUser);

  res.status(201).json({
    message: 'User registered successfully',
    token,
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

// Single login system for all users (Admin, Normal User, Store Owner)
router.post('/login', (req, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const token = generateToken(user);

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

// Get current profile
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
    createdAt: user.createdAt,
  });
});

// Update password (available to all logged in users: Normal user & Store Owner)
router.put('/password', authenticate, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ message: 'Current password and new password are required' });
    return;
  }

  const isCurrentMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!isCurrentMatch) {
    res.status(400).json({
      message: 'Current password does not match our records',
      errors: { currentPassword: 'Incorrect current password' },
    });
    return;
  }

  const passErr = validatePassword(newPassword);
  if (passErr) {
    res.status(400).json({
      message: 'New password does not meet requirements',
      errors: { newPassword: passErr },
    });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(newPassword, salt);
  db.updateUserPassword(user.id, newHash);

  res.json({ message: 'Password updated successfully' });
});

export default router;
