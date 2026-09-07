import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toObjectId(val: any): mongoose.Types.ObjectId {
  if (!val) throw new Error('Cannot convert falsy value to ObjectId');
  if (val instanceof mongoose.Types.ObjectId) return val;
  if (typeof val === 'object' && val.$oid) return new mongoose.Types.ObjectId(val.$oid);
  if (typeof val === 'object' && val._id) return toObjectId(val._id);
  if (typeof val === 'string' && mongoose.Types.ObjectId.isValid(val)) {
    return new mongoose.Types.ObjectId(val);
  }
  throw new Error(`Invalid ObjectId representation: ${JSON.stringify(val)}`);
}

function toNullableObjectId(val: any): mongoose.Types.ObjectId | null {
  if (!val) return null;
  try {
    return toObjectId(val);
  } catch {
    return null;
  }
}

function toDate(val: any, fallback = new Date()): Date {
  if (!val) return fallback;
  if (val instanceof Date) return val;
  if (typeof val === 'object' && val.$date) return new Date(val.$date);
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
  }
  return fallback;
}

/**
 * Strips full domain prefixes (e.g. https://miniflicks.in/uploads/... -> /uploads/...)
 */
function stripImageDomain(url: any): string {
  if (typeof url !== 'string' || !url.trim()) return '';
  return url.trim().replace(/^https?:\/\/[^/]+/i, '');
}

interface MigrationOptions {
  dryRun: boolean;
  cleanExisting: boolean;
  backupDir: string;
}

async function runMigration(options: MigrationOptions) {
  const { dryRun, cleanExisting, backupDir } = options;

  console.log(`\n======================================================`);
  console.log(`  MINIFLICKS BACKUP DATA MIGRATION`);
  console.log(`  Dry Run: ${dryRun ? 'YES (No DB writes)' : 'NO (Live DB writes)'}`);
  console.log(`  Clean Existing: ${cleanExisting ? 'YES' : 'NO'}`);
  console.log(`  Backup Directory: ${backupDir}`);
  console.log(`======================================================\n`);

  const startTime = Date.now();

  console.log('[1/14] Connecting to MongoDB...');
  await connectDatabase();
  const db = mongoose.connection.db;
  if (!db) throw new Error('Failed to get database handle');

  const readBackupFile = (filename: string): any[] => {
    const filePath = path.join(backupDir, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Backup file not found: ${filePath}`);
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  };

  // ─── 1. CITIES ─────────────────────────────────────────────────────────────
  console.log('\n[2/14] Processing Cities...');
  const rawCities = readBackupFile('miniflicks.cities.json');
  const cityOps = rawCities.map((c) => {
    const cityId = toObjectId(c._id);
    const locations = (c.locations || []).map((l: any) => toObjectId(l));
    const doc = {
      _id: cityId,
      name: String(c.name).trim(),
      status: Boolean(c.status ?? true),
      locations,
      createdAt: toDate(c.createdAt, new Date('2024-11-28T05:00:00.000Z')),
      updatedAt: toDate(c.updatedAt, new Date()),
    };
    return {
      updateOne: {
        filter: { _id: cityId },
        update: { $set: doc },
        upsert: true,
      },
    };
  });

  console.log(`  Cities prepared: ${cityOps.length}`);
  if (!dryRun && cityOps.length > 0) {
    const res = await db.collection('cities').bulkWrite(cityOps);
    console.log(`  Cities upserted: ${res.upsertedCount + res.modifiedCount + res.matchedCount}`);
  }

  // ─── 2. ADMINS & LOCATION ADMIN DECOUPLING ────────────────────────────────
  console.log('\n[3/14] Processing Admins (SuperAdmin + Location Admin)...');
  const rawAdmins = readBackupFile('miniflicks.admins.json');
  const rawLocations = readBackupFile('miniflicks.locations.json');

  // Standardized admin password requested: Miniflicks@123
  const ADMIN_PASSWORD_PLAIN = 'Miniflicks@123';
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD_PLAIN, 12);
  console.log(`  Generated bcrypt hash for "${ADMIN_PASSWORD_PLAIN}"`);

  // SuperAdmin doc
  const superAdminRaw = rawAdmins[0];
  const superAdminId = toObjectId(superAdminRaw._id);
  const superAdminDoc = {
    _id: superAdminId,
    name: superAdminRaw.name || 'Miniflicks SuperAdmin',
    email: superAdminRaw.email.toLowerCase().trim(),
    password: hashedPassword,
    phone: '8688014415',
    superAdmin: true,
    location: null,
    createdAt: toDate(superAdminRaw.createdAt),
    updatedAt: toDate(superAdminRaw.updatedAt),
  };

  const adminOps: any[] = [
    {
      updateOne: {
        filter: { _id: superAdminId },
        update: { $set: superAdminDoc },
        upsert: true,
      },
    },
  ];

  // Location admin mapping: Marathahalli
  // Deterministic ObjectId for Marathahalli Location Admin
  const MARATHAHALLI_ADMIN_ID = new mongoose.Types.ObjectId('67480a1433bd0d9ca789ab99');
  const marathahalliLocationId = toObjectId(rawLocations[0]._id);
  const locAdminRaw = rawLocations[0].admin || {};

  // Assign distinct email to avoid unique index violation with SuperAdmin
  const locationAdminDoc = {
    _id: MARATHAHALLI_ADMIN_ID,
    name: locAdminRaw.name || 'Marathahalli Admin',
    email: 'marathahalli@miniflicks.in',
    password: hashedPassword,
    phone: String(locAdminRaw.number || '8688014415').trim(),
    superAdmin: false,
    location: marathahalliLocationId,
    createdAt: new Date('2024-11-28T05:47:22.000Z'),
    updatedAt: new Date(),
  };

  adminOps.push({
    updateOne: {
      filter: { _id: MARATHAHALLI_ADMIN_ID },
      update: { $set: locationAdminDoc },
      upsert: true,
    },
  });

  console.log(`  Admins prepared: ${adminOps.length} (SuperAdmin + Marathahalli Location Admin)`);
  if (!dryRun) {
    // Remove any legacy placeholder seed admins that might collide on email
    await db.collection('admins').deleteMany({
      email: superAdminDoc.email,
      _id: { $ne: superAdminId },
    });
    const res = await db.collection('admins').bulkWrite(adminOps);
    console.log(`  Admins upserted: ${res.upsertedCount + res.modifiedCount + res.matchedCount}`);
  }

  // ─── 3. CATALOG ITEMS: ADDONS, GIFTS, OCCASIONS, CAKES ────────────────────
  console.log('\n[4/14] Processing Addons...');
  const rawAddons = readBackupFile('miniflicks.addons.json');
  const addonOps = rawAddons.map((a) => {
    const id = toObjectId(a._id);
    const doc = {
      _id: id,
      name: String(a.name).trim(),
      description: a.description || '',
      position: Number(a.position ?? 0),
      image: stripImageDomain(a.image),
      price: Number(a.price ?? 0),
      status: Boolean(a.status ?? true),
      createdAt: toDate(a.createdAt),
      updatedAt: toDate(a.updatedAt),
    };
    return {
      updateOne: { filter: { _id: id }, update: { $set: doc }, upsert: true },
    };
  });
  console.log(`  Addons prepared: ${addonOps.length}`);
  if (!dryRun && addonOps.length > 0) {
    await db.collection('addons').bulkWrite(addonOps);
  }

  console.log('\n[5/14] Processing Gifts...');
  const rawGifts = readBackupFile('miniflicks.gifts.json');
  const giftOps = rawGifts.map((g) => {
    const id = toObjectId(g._id);
    const doc = {
      _id: id,
      name: String(g.name).trim(),
      description: g.description || '',
      position: Number(g.position ?? 0),
      image: stripImageDomain(g.image),
      price: Number(g.price ?? 0),
      status: Boolean(g.status ?? true),
      createdAt: toDate(g.createdAt),
      updatedAt: toDate(g.updatedAt),
    };
    return {
      updateOne: { filter: { _id: id }, update: { $set: doc }, upsert: true },
    };
  });
  console.log(`  Gifts prepared: ${giftOps.length}`);
  if (!dryRun && giftOps.length > 0) {
    await db.collection('gifts').bulkWrite(giftOps);
  }

  console.log('\n[6/14] Processing Occasions...');
  const rawOccasions = readBackupFile('miniflicks.occasions.json');
  const occasionOps = rawOccasions.map((o) => {
    const id = toObjectId(o._id);
    const doc = {
      _id: id,
      name: String(o.name).trim(),
      description: o.description || '',
      position: Number(o.position ?? 0),
      image: stripImageDomain(o.image),
      price: Number(o.price ?? 0),
      status: Boolean(o.status ?? true),
      createdAt: toDate(o.createdAt),
      updatedAt: toDate(o.updatedAt),
    };
    return {
      updateOne: { filter: { _id: id }, update: { $set: doc }, upsert: true },
    };
  });
  console.log(`  Occasions prepared: ${occasionOps.length}`);
  if (!dryRun && occasionOps.length > 0) {
    await db.collection('occasions').bulkWrite(occasionOps);
  }

  console.log('\n[7/14] Processing Cakes...');
  const rawCakes = readBackupFile('miniflicks.cakes.json');
  const cakeOps = rawCakes.map((c) => {
    const id = toObjectId(c._id);
    const doc = {
      _id: id,
      name: String(c.name).trim(),
      position: Number(c.position ?? 0),
      image: stripImageDomain(c.image),
      price: Number(c.price ?? 0),
      special: Boolean(c.special ?? false),
      specialPrice: Number(c.specialPrice ?? 0),
      status: Boolean(c.status ?? true),
      createdAt: toDate(c.createdAt),
      updatedAt: toDate(c.updatedAt),
    };
    return {
      updateOne: { filter: { _id: id }, update: { $set: doc }, upsert: true },
    };
  });
  console.log(`  Cakes prepared: ${cakeOps.length}`);
  if (!dryRun && cakeOps.length > 0) {
    await db.collection('cakes').bulkWrite(cakeOps);
  }

  // ─── 4. SCREENS ────────────────────────────────────────────────────────────
  console.log('\n[8/14] Processing Screens...');
  const rawScreens = readBackupFile('miniflicks.screens.json');
  const screenOps = rawScreens.map((s) => {
    const id = toObjectId(s._id);
    const doc = {
      _id: id,
      name: String(s.name).trim(),
      capacity: Number(s.capacity),
      minPeople: Number(s.minPeople),
      extraPersonPrice: Number(s.extraPersonPrice ?? 0),
      specifications: s.specifications || [],
      description: s.description || '',
      status: Boolean(s.status ?? true),
      location: toObjectId(s.location),
      images: (s.images || []).map(stripImageDomain),
      slots: (s.slots || []).map((slot: any) => ({
        from: String(slot.from).trim(),
        to: String(slot.to).trim(),
      })),
      packages: (s.packages || []).map((pkg: any) => ({
        name: String(pkg.name).trim(),
        price: Number(pkg.price ?? 0),
        addons: pkg.addons || [],
        customPrice: (pkg.customPrice || []).map((cp: any) => ({
          date: toDate(cp.date),
          price: Number(cp.price ?? 0),
        })),
      })),
      createdAt: toDate(s.createdAt),
      updatedAt: toDate(s.updatedAt),
    };
    return {
      updateOne: { filter: { _id: id }, update: { $set: doc }, upsert: true },
    };
  });
  console.log(`  Screens prepared: ${screenOps.length}`);
  if (!dryRun && screenOps.length > 0) {
    await db.collection('screens').bulkWrite(screenOps);
  }

  // ─── 5. LOCATIONS ──────────────────────────────────────────────────────────
  console.log('\n[9/14] Processing Locations...');
  const allScreenIdsForLocation = rawScreens
    .filter((s) => toObjectId(s.location).toString() === marathahalliLocationId.toString())
    .map((s) => toObjectId(s._id));

  const allAddonIds = rawAddons.map((a) => toObjectId(a._id));
  const allGiftIds = rawGifts.map((g) => toObjectId(g._id));
  const allOccasionIds = rawOccasions.map((o) => toObjectId(o._id));
  const allCakeIds = rawCakes.map((c) => toObjectId(c._id));

  const locationOps = rawLocations.map((l) => {
    const id = toObjectId(l._id);
    const doc = {
      _id: id,
      name: String(l.name).trim(),
      address: String(l.address).trim(),
      addressLink: l.addressLink || '',
      image: stripImageDomain(l.image),
      status: Boolean(l.status ?? true),
      city: toObjectId(l.city),
      admin: MARATHAHALLI_ADMIN_ID, // Decoupled admin reference!
      screens: allScreenIdsForLocation, // Ensure all 3 screens (Friends, Family, Couple) are referenced
      addons: allAddonIds,
      gifts: allGiftIds,
      occasions: allOccasionIds,
      cakes: allCakeIds,
      createdAt: toDate(l.createdAt, new Date('2024-11-28T05:00:00.000Z')),
      updatedAt: toDate(l.updatedAt, new Date()),
    };
    return {
      updateOne: { filter: { _id: id }, update: { $set: doc }, upsert: true },
    };
  });
  console.log(`  Locations prepared: ${locationOps.length}`);
  if (!dryRun && locationOps.length > 0) {
    await db.collection('locations').bulkWrite(locationOps);
  }

  // ─── 6. BANNERS ────────────────────────────────────────────────────────────
  console.log('\n[10/14] Processing Banners...');
  const rawBanners = readBackupFile('miniflicks.banners.json');
  const bannerOps = rawBanners.map((b) => {
    const id = toObjectId(b._id);
    const doc = {
      _id: id,
      title: String(b.title).trim(),
      description: String(b.description).trim(),
      link: String(b.link).trim(),
      image: stripImageDomain(b.image),
      position: Number(b.position ?? 0),
      status: Boolean(b.status ?? true),
      createdAt: toDate(b.createdAt),
      updatedAt: toDate(b.updatedAt),
    };
    return {
      updateOne: { filter: { _id: id }, update: { $set: doc }, upsert: true },
    };
  });
  console.log(`  Banners prepared: ${bannerOps.length}`);
  if (!dryRun && bannerOps.length > 0) {
    await db.collection('banners').bulkWrite(bannerOps);
  }

  // ─── 7. COUPONS ────────────────────────────────────────────────────────────
  console.log('\n[11/14] Processing Coupons...');
  const rawCoupons = readBackupFile('miniflicks.coupons.json');
  const couponOps = rawCoupons.map((c) => {
    const id = toObjectId(c._id);
    const doc = {
      _id: id,
      code: String(c.code).trim().toUpperCase(),
      discount: Number(c.discount),
      type: c.type,
      expireDate: toDate(c.expireDate),
      status: Boolean(c.status ?? true),
      scrollCoupon: Boolean(c.scrollCoupon ?? false),
      scrollingText: c.scrollingText || '',
      createdAt: toDate(c.createdAt),
      updatedAt: toDate(c.updatedAt),
    };
    return {
      updateOne: { filter: { _id: id }, update: { $set: doc }, upsert: true },
    };
  });
  console.log(`  Coupons prepared: ${couponOps.length}`);
  if (!dryRun && couponOps.length > 0) {
    await db.collection('coupons').bulkWrite(couponOps);
  }

  // ─── 8. CUSTOMERS (1,500 records in batches) ──────────────────────────────
  console.log('\n[12/14] Processing Customers...');
  const rawCustomers = readBackupFile('miniflicks.customers.json');
  console.log(`  Total Customers to process: ${rawCustomers.length}`);

  const customerOps = rawCustomers.map((c) => {
    const id = toObjectId(c._id);
    const doc = {
      _id: id,
      number: String(c.number).trim(),
      name: String(c.name).trim(),
      email: String(c.email).trim().toLowerCase(),
      createdAt: toDate(c.createdAt),
      updatedAt: toDate(c.updatedAt),
    };
    return {
      updateOne: { filter: { _id: id }, update: { $set: doc }, upsert: true },
    };
  });

  const BATCH_SIZE = 500;
  if (!dryRun) {
    for (let i = 0; i < customerOps.length; i += BATCH_SIZE) {
      const batch = customerOps.slice(i, i + BATCH_SIZE);
      await db.collection('customers').bulkWrite(batch);
      console.log(`  Customers batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(customerOps.length / BATCH_SIZE)} completed (${batch.length} docs)`);
    }
  } else {
    console.log(`  [DRY RUN] Would execute ${Math.ceil(customerOps.length / BATCH_SIZE)} customer batches.`);
  }

  // ─── 9. BOOKINGS (1,511 records in batches) ───────────────────────────────
  console.log('\n[13/14] Processing Bookings...');
  const rawBookings = readBackupFile('miniflicks.bookings.json');
  console.log(`  Total Bookings to process: ${rawBookings.length}`);

  const bookingOps = rawBookings.map((b) => {
    const id = toObjectId(b._id);

    // Transform sub-documents safely
    const occasionSnapshot = {
      _id: toObjectId(b.occasion._id),
      name: String(b.occasion.name).trim(),
      price: Number(b.occasion.price ?? 0),
      celebrantName: b.occasion.celebrantName || '',
    };

    const addonsSnapshot = (b.addons || []).map((a: any) => ({
      _id: toObjectId(a._id),
      name: String(a.name).trim(),
      price: Number(a.price ?? 0),
      count: Number(a.count ?? 1),
    }));

    const giftsSnapshot = (b.gifts || []).map((g: any) => ({
      _id: toObjectId(g._id),
      name: String(g.name).trim(),
      price: Number(g.price ?? 0),
      count: Number(g.count ?? 1),
    }));

    const cakesSnapshot = (b.cakes || []).map((c: any) => ({
      _id: toObjectId(c._id),
      name: String(c.name).trim(),
      price: Number(c.price ?? 0),
      free: Boolean(c.free ?? false),
    }));

    const doc = {
      _id: id,
      city: toObjectId(b.city),
      location: toObjectId(b.location),
      screen: toObjectId(b.screen),
      customer: toObjectId(b.customer),
      date: toDate(b.date),
      slot: {
        from: String(b.slot.from).trim(),
        to: String(b.slot.to).trim(),
      },
      package: {
        name: String(b.package.name).trim(),
        price: Number(b.package.price ?? 0),
        addons: b.package.addons || [],
      },
      occasion: occasionSnapshot,
      addons: addonsSnapshot,
      gifts: giftsSnapshot,
      cakes: cakesSnapshot,
      numberOfPeople: Number(b.numberOfPeople),
      nameOnCake: b.nameOnCake || '',
      ledName: b.ledName || '',
      ledNumber: b.ledNumber || '',
      note: b.note || '',
      status: b.status || 'pending',
      couponCode: b.couponCode ? String(b.couponCode).trim() : null,
      couponPrice: Number(b.couponPrice ?? 0),
      advancePrice: Number(b.advancePrice ?? 0),
      totalPrice: Number(b.totalPrice ?? 0),
      remainingAmount: Number(b.remainingAmount ?? 0),
      razorpayOrderId: b.razorpayOrderId || undefined,
      razorpayPaymentId: b.razorpayPaymentId || undefined,
      cancellationReason: b.cancellationReason || undefined,
      createdAt: toDate(b.createdAt),
      updatedAt: toDate(b.updatedAt),
    };

    return {
      updateOne: { filter: { _id: id }, update: { $set: doc }, upsert: true },
    };
  });

  if (!dryRun) {
    for (let i = 0; i < bookingOps.length; i += BATCH_SIZE) {
      const batch = bookingOps.slice(i, i + BATCH_SIZE);
      await db.collection('bookings').bulkWrite(batch);
      console.log(`  Bookings batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(bookingOps.length / BATCH_SIZE)} completed (${batch.length} docs)`);
    }
  } else {
    console.log(`  [DRY RUN] Would execute ${Math.ceil(bookingOps.length / BATCH_SIZE)} booking batches.`);
  }

  // ─── 10. VERIFICATION & SUMMARY ────────────────────────────────────────────
  console.log('\n[14/14] Verifying Target Database Collections...');
  const collections = [
    'cities',
    'admins',
    'locations',
    'screens',
    'banners',
    'addons',
    'gifts',
    'occasions',
    'cakes',
    'coupons',
    'customers',
    'bookings',
  ];

  const counts: Record<string, number> = {};
  for (const coll of collections) {
    counts[coll] = await db.collection(coll).countDocuments();
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n======================================================');
  console.log(`  MIGRATION FINISHED IN ${elapsed}s`);
  console.log('======================================================');
  console.table(counts);

  await disconnectDatabase();
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const cleanExisting = args.includes('--clean');
  const backupDir =
    args.find((a) => !a.startsWith('--')) ||
    path.resolve(__dirname, '../../../backup');

  try {
    await runMigration({ dryRun, cleanExisting, backupDir });
    process.exit(0);
  } catch (err: any) {
    console.error('\n[FATAL] Migration failed with error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
