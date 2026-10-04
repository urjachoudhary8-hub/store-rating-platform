import { Router, Response } from 'express';
import { db } from '../db.js';
import { validateRating } from '../validators.js';
import { optionalAuthenticate, authenticate, AuthRequest } from '../auth.js';

const router = Router();

// List stores for normal users and visitors
// Supports search by name, search by address, sorting by name/address/rating
router.get('/', optionalAuthenticate, (req: AuthRequest, res: Response) => {
  const { search, name, address, sortBy = 'name', sortOrder = 'asc' } = req.query;
  const currentUserId = req.user?.id;

  let stores = db.getStores().map((s) => {
    const stats = db.getStoreRatingStats(s.id);
    let userRating: number | null = null;
    let userRatingSubmittedAt: string | null = null;

    if (currentUserId) {
      const r = db.getRatingByUserAndStore(currentUserId, s.id);
      if (r) {
        userRating = r.rating;
        userRatingSubmittedAt = r.updatedAt || r.createdAt;
      }
    }

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      overallRating: stats.averageRating,
      totalRatings: stats.totalRatings,
      userRating,
      userRatingSubmittedAt,
      createdAt: s.createdAt,
    };
  });

  // Search by single general search term (matching name OR address)
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    stores = stores.filter(
      (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
    );
  }

  // Specific field filters
  if (name && typeof name === 'string' && name.trim()) {
    const q = name.trim().toLowerCase();
    stores = stores.filter((s) => s.name.toLowerCase().includes(q));
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
    } else if (sortKey === 'address') {
      valA = a.address.toLowerCase();
      valB = b.address.toLowerCase();
    } else if (sortKey === 'rating' || sortKey === 'overallRating') {
      valA = a.overallRating;
      valB = b.overallRating;
    } else if (sortKey === 'userRating') {
      valA = a.userRating ?? 0;
      valB = b.userRating ?? 0;
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

// Get user's rating for a specific store
router.get('/:storeId/my-rating', authenticate, (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  const userId = req.user!.id;

  const store = db.findStoreById(storeId);
  if (!store) {
    res.status(404).json({ message: 'Store not found' });
    return;
  }

  const rating = db.getRatingByUserAndStore(userId, storeId);
  const stats = db.getStoreRatingStats(storeId);

  res.json({
    rating: rating ? rating.rating : null,
    submittedAt: rating ? rating.updatedAt : null,
    overallRating: stats.averageRating,
    totalRatings: stats.totalRatings,
  });
});

// Submit or modify rating for a store (1 to 5)
// Any authenticated user can submit/modify ratings
router.post('/:storeId/ratings', authenticate, (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  const userId = req.user!.id;
  const { rating } = req.body;

  const store = db.findStoreById(storeId);
  if (!store) {
    res.status(404).json({ message: 'Store not found' });
    return;
  }

  // Validate rating integer between 1 and 5
  const ratingErr = validateRating(rating);
  if (ratingErr) {
    res.status(400).json({ message: ratingErr });
    return;
  }

  const ratingVal = Number(rating);
  const existingRating = db.getRatingByUserAndStore(userId, storeId);
  const isModify = Boolean(existingRating);

  const savedRating = db.setRating(userId, storeId, ratingVal);
  const stats = db.getStoreRatingStats(storeId);

  res.json({
    message: isModify ? 'Rating updated successfully' : 'Rating submitted successfully',
    rating: savedRating.rating,
    isModified: isModify,
    overallRating: stats.averageRating,
    totalRatings: stats.totalRatings,
  });
});

export default router;
