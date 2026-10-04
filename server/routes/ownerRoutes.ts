import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requireRole, AuthRequest } from '../auth.js';

const router = Router();

// Store Owner only
router.use(authenticate);
router.use(requireRole('owner'));

// Get Store Owner Dashboard
router.get('/dashboard', (req: AuthRequest, res: Response) => {
  const ownerId = req.user!.id;
  const ownerStores = db.findStoresByOwnerId(ownerId);

  if (ownerStores.length === 0) {
    res.json({
      hasStore: false,
      message: 'No store currently assigned to your account. Please contact an Administrator.',
      stores: [],
      overallAverageRating: 0,
      totalRatingsCount: 0,
      ratingsBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      raters: [],
    });
    return;
  }

  const allRatings = db.getRatings();
  const allUsers = db.getUsers();

  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  // Aggregate ratings across owner's stores (or specific store if selected)
  const storeSummaries = ownerStores.map((store) => {
    const storeRatings = allRatings.filter((r) => r.storeId === store.id);
    const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);
    const average = storeRatings.length > 0 ? Number((sum / storeRatings.length).toFixed(1)) : 0;

    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of storeRatings) {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    }

    const ratingsWithUsers = storeRatings.map((r) => {
      const rater = userMap.get(r.userId);
      return {
        id: r.id,
        rating: r.rating,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: rater
          ? {
              id: rater.id,
              name: rater.name,
              email: rater.email,
              address: rater.address,
            }
          : {
              id: r.userId,
              name: 'Registered User',
              email: 'unknown',
              address: '',
            },
      };
    });

    return {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      averageRating: average,
      totalRatings: storeRatings.length,
      breakdown,
      raters: ratingsWithUsers,
    };
  });

  // Combined overall stats
  let totalRatingSum = 0;
  let totalRatingsCount = 0;
  const overallBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const allRatersList: Array<{
    id: string;
    storeId: string;
    storeName: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      address: string;
    };
  }> = [];

  for (const s of storeSummaries) {
    totalRatingSum += s.averageRating * s.totalRatings;
    totalRatingsCount += s.totalRatings;

    for (let star = 1; star <= 5; star++) {
      overallBreakdown[star] += s.breakdown[star];
    }

    for (const r of s.raters) {
      allRatersList.push({
        id: r.id,
        storeId: s.store.id,
        storeName: s.store.name,
        rating: r.rating,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: r.user,
      });
    }
  }

  const overallAverageRating =
    totalRatingsCount > 0 ? Number((totalRatingSum / totalRatingsCount).toFixed(1)) : 0;

  res.json({
    hasStore: true,
    stores: storeSummaries,
    overallAverageRating,
    totalRatingsCount,
    ratingsBreakdown: overallBreakdown,
    raters: allRatersList,
  });
});

export default router;
