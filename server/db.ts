import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'user' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  address: string;
  role: UserRole;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId?: string | null;
  createdAt: string;
}

export interface Rating {
  id: string;
  storeId: string;
  userId: string;
  rating: number; // 1 - 5
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users: User[];
  stores: Store[];
  ratings: Rating[];
}

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export class Database {
  private data: DatabaseSchema = {
    users: [],
    stores: [],
    ratings: [],
  };

  constructor() {
    this.init();
  }

  private init(): void {
    ensureDataDir();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.users || !this.data.stores || !this.data.ratings) {
          this.seedInitialData();
        }
      } catch (err) {
        console.error('Error reading db.json, seeding initial data:', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  private save(): void {
    ensureDataDir();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public resetToDefault(): void {
    this.seedInitialData();
  }

  private seedInitialData(): void {
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('Admin@1234', salt);
    const ownerHash = bcrypt.hashSync('Owner@1234', salt);
    const userHash = bcrypt.hashSync('User@1234', salt);

    const now = new Date().toISOString();

    const users: User[] = [
      {
        id: 'u-admin-1',
        name: 'Alexander Bartholomew Admin',
        email: 'admin@storerating.com',
        passwordHash: adminHash,
        address: '100 Government Plaza, Suite 400, Capital District, NY 10001',
        role: 'admin',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 'u-owner-1',
        name: 'Jonathan Montgomery Davis',
        email: 'owner@techhaven.com',
        passwordHash: ownerHash,
        address: '450 Silicon Boulevard, Innovation District, San Francisco, CA 94107',
        role: 'owner',
        createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
      },
      {
        id: 'u-owner-2',
        name: 'Victoria Charlotte Sterling',
        email: 'owner@artisanbakery.com',
        passwordHash: ownerHash,
        address: '742 Evergreen Terrace, Suite 12B, Springfield, IL 62704',
        role: 'owner',
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        id: 'u-owner-3',
        name: 'Sebastian Maximilian Stone',
        email: 'owner@apexfitness.com',
        passwordHash: ownerHash,
        address: '880 Olympic Way, Health Center, Seattle, WA 98101',
        role: 'owner',
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: 'u-user-1',
        name: 'Eleanor Catherine Vance',
        email: 'user@example.com',
        passwordHash: userHash,
        address: '123 Maple Wood Lane, North End, Boston, MA 02108',
        role: 'user',
        createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
      },
      {
        id: 'u-user-2',
        name: 'Benjamin Harrison Clarke',
        email: 'benjamin.clarke@mail.com',
        passwordHash: userHash,
        address: '904 Oak Ridge Avenue, Apartment 4C, Austin, TX 78701',
        role: 'user',
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        id: 'u-user-3',
        name: 'Guinevere Arabella Jenkins',
        email: 'guinevere.j@mail.com',
        passwordHash: userHash,
        address: '314 Bluebird Way, Sunnyvale, CA 94086',
        role: 'user',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
    ];

    const stores: Store[] = [
      {
        id: 's-techhaven',
        name: 'TechHaven Electronics & Gadgets',
        email: 'contact@techhaven.com',
        address: '450 Silicon Boulevard, Innovation District, San Francisco, CA 94107',
        ownerId: 'u-owner-1',
        createdAt: new Date(Date.now() - 26 * 86400000).toISOString(),
      },
      {
        id: 's-artisanbakery',
        name: 'Grand Artisan Organic Bakery',
        email: 'hello@artisanbakery.com',
        address: '742 Evergreen Terrace, Suite 12B, Springfield, IL 62704',
        ownerId: 'u-owner-2',
        createdAt: new Date(Date.now() - 24 * 86400000).toISOString(),
      },
      {
        id: 's-apexfitness',
        name: 'Apex Horizon Fitness Center',
        email: 'frontdesk@apexfitness.com',
        address: '880 Olympic Way, Health Center, Seattle, WA 98101',
        ownerId: 'u-owner-3',
        createdAt: new Date(Date.now() - 19 * 86400000).toISOString(),
      },
      {
        id: 's-greenleaf',
        name: 'Greenleaf Flora & Garden Supplies',
        email: 'info@greenleafflora.com',
        address: '215 Meadowbrook Parkway, Portland, OR 97201',
        ownerId: 'u-owner-1',
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
      {
        id: 's-blueharbor',
        name: 'Blue Harbor Seafood & Grill',
        email: 'reservations@blueharbor.com',
        address: '55 Pier View Esplanade, Monterey, CA 93940',
        ownerId: null,
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
    ];

    const ratings: Rating[] = [
      {
        id: 'r-1',
        storeId: 's-techhaven',
        userId: 'u-user-1',
        rating: 5,
        createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      },
      {
        id: 'r-2',
        storeId: 's-techhaven',
        userId: 'u-user-2',
        rating: 4,
        createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
      },
      {
        id: 'r-3',
        storeId: 's-artisanbakery',
        userId: 'u-user-1',
        rating: 5,
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        id: 'r-4',
        storeId: 's-artisanbakery',
        userId: 'u-user-3',
        rating: 5,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 'r-5',
        storeId: 's-apexfitness',
        userId: 'u-user-2',
        rating: 4,
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: 'r-6',
        storeId: 's-apexfitness',
        userId: 'u-user-3',
        rating: 3,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'r-7',
        storeId: 's-greenleaf',
        userId: 'u-user-1',
        rating: 4,
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ];

    this.data = { users, stores, ratings };
    this.save();
  }

  // --- Users Queries ---
  public getUsers(): User[] {
    return [...this.data.users];
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    return this.data.users.find((u) => u.email.toLowerCase() === normalized);
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...userData,
      id: `u-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUserPassword(userId: string, newPasswordHash: string): boolean {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    this.save();
    return true;
  }

  // --- Stores Queries ---
  public getStores(): Store[] {
    return [...this.data.stores];
  }

  public findStoreById(id: string): Store | undefined {
    return this.data.stores.find((s) => s.id === id);
  }

  public findStoreByEmail(email: string): Store | undefined {
    const normalized = email.trim().toLowerCase();
    return this.data.stores.find((s) => s.email.toLowerCase() === normalized);
  }

  public findStoresByOwnerId(ownerId: string): Store[] {
    return this.data.stores.filter((s) => s.ownerId === ownerId);
  }

  public createStore(storeData: Omit<Store, 'id' | 'createdAt'>): Store {
    const newStore: Store = {
      ...storeData,
      id: `s-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.stores.push(newStore);
    this.save();
    return newStore;
  }

  // --- Ratings Queries ---
  public getRatings(): Rating[] {
    return [...this.data.ratings];
  }

  public getRatingsByStoreId(storeId: string): Rating[] {
    return this.data.ratings.filter((r) => r.storeId === storeId);
  }

  public getRatingByUserAndStore(userId: string, storeId: string): Rating | undefined {
    return this.data.ratings.find((r) => r.userId === userId && r.storeId === storeId);
  }

  public setRating(userId: string, storeId: string, ratingValue: number): Rating {
    const existing = this.getRatingByUserAndStore(userId, storeId);
    const now = new Date().toISOString();

    if (existing) {
      existing.rating = ratingValue;
      existing.updatedAt = now;
      this.save();
      return existing;
    } else {
      const newRating: Rating = {
        id: `r-${crypto.randomUUID()}`,
        userId,
        storeId,
        rating: ratingValue,
        createdAt: now,
        updatedAt: now,
      };
      this.data.ratings.push(newRating);
      this.save();
      return newRating;
    }
  }

  // Helper: compute average rating for a store
  public getStoreRatingStats(storeId: string): { averageRating: number; totalRatings: number } {
    const storeRatings = this.getRatingsByStoreId(storeId);
    if (storeRatings.length === 0) {
      return { averageRating: 0, totalRatings: 0 };
    }
    const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((sum / storeRatings.length).toFixed(1));
    return {
      averageRating: avg,
      totalRatings: storeRatings.length,
    };
  }

  // Helper: compute rating stats for an owner across all their stores
  public getOwnerRatingStats(ownerId: string): {
    averageRating: number;
    totalRatings: number;
    storesCount: number;
  } {
    const stores = this.findStoresByOwnerId(ownerId);
    if (stores.length === 0) {
      return { averageRating: 0, totalRatings: 0, storesCount: 0 };
    }

    let totalRatings = 0;
    let sum = 0;
    for (const store of stores) {
      const stats = this.getStoreRatingStats(store.id);
      sum += stats.averageRating * stats.totalRatings;
      totalRatings += stats.totalRatings;
    }

    const avg = totalRatings > 0 ? Number((sum / totalRatings).toFixed(1)) : 0;
    return {
      averageRating: avg,
      totalRatings,
      storesCount: stores.length,
    };
  }
}

export const db = new Database();
