import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { config } from '../config/env';
import { uploadLocalFileToCloudinary, getCloudinary } from '../infrastructure/storage/cloudinary';

// Import Mongoose Models
import { Cake } from '../modules/cakes/cake.schema';
import { Addon } from '../modules/addons/addon.schema';
import { Gift } from '../modules/gifts/gift.schema';
import { Occasion } from '../modules/occasions/occasion.schema';
import { Location } from '../modules/locations/location.schema';
import { Banner } from '../modules/banners/banner.schema';
import { Screen } from '../modules/screens/screen.schema';

interface ImageMappingItem {
  filename: string;
  folder: string;
  localRelativePath: string;
  localAbsolutePath: string;
  cloudinaryUrl: string;
  publicId: string;
  uploadedAt: string;
}

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads');
const MAPPING_FILE_PATH = path.join(process.cwd(), 'cloudinary_migration_mapping.json');

/**
 * Recursively find all image files under public/uploads
 */
function scanUploadsDirectory(dir: string, baseDir: string = dir): { absolutePath: string; relativePath: string; folder: string; filename: string }[] {
  const results: { absolutePath: string; relativePath: string; folder: string; filename: string }[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanUploadsDirectory(fullPath, baseDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        const folder = path.dirname(relPath) === '.' ? 'general' : path.dirname(relPath);
        results.push({
          absolutePath: fullPath,
          relativePath: `/uploads/${relPath}`,
          folder,
          filename: entry.name,
        });
      }
    }
  }

  return results;
}

async function runMigration() {
  console.log('=====================================================');
  console.log('  MiniFlicks: Cloudinary Image Migration Utility');
  console.log('=====================================================\n');

  // 1. Verify Cloudinary Credentials
  try {
    getCloudinary();
    console.log('✓ Cloudinary SDK configured successfully.');
  } catch (err: any) {
    console.error('\n❌ ERROR: Cloudinary credentials missing or invalid:');
    console.error(`   ${err.message}\n`);
    console.error('Please add the following to your backend/.env file:');
    console.error('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.error('   CLOUDINARY_API_KEY=your_api_key');
    console.error('   CLOUDINARY_API_SECRET=your_api_secret\n');
    process.exit(1);
  }

  // 2. Connect to Database
  console.log(`Connecting to MongoDB at: ${config.mongodb.uri}...`);
  await mongoose.connect(config.mongodb.uri);
  console.log('✓ Connected to MongoDB.\n');

  // 3. Scan local files
  console.log(`Scanning local files in: ${UPLOADS_ROOT}...`);
  const localFiles = scanUploadsDirectory(UPLOADS_ROOT);
  console.log(`Found ${localFiles.length} images across local upload directories.\n`);

  if (localFiles.length === 0) {
    console.log('No local upload files found. Checking database for existing local paths...');
  }

  // Load existing mapping if previous run exists to avoid duplicate re-uploading
  const mapping: Record<string, ImageMappingItem> = {};
  if (fs.existsSync(MAPPING_FILE_PATH)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(MAPPING_FILE_PATH, 'utf-8'));
      if (Array.isArray(existingData)) {
        for (const item of existingData) {
          mapping[item.localRelativePath] = item;
          mapping[item.filename] = item;
        }
        console.log(`Loaded ${existingData.length} existing mappings from ${MAPPING_FILE_PATH}.`);
      }
    } catch {
      console.warn('Could not parse existing mapping file; creating new mapping.');
    }
  }

  // 4. Upload each local file to Cloudinary
  console.log('\n--- Step 1: Uploading local files to Cloudinary ---');
  let uploadSuccessCount = 0;
  let uploadSkipCount = 0;
  let uploadFailCount = 0;

  for (let i = 0; i < localFiles.length; i++) {
    const file = localFiles[i];
    if (!file) continue;

    const progress = `[${i + 1}/${localFiles.length}]`;

    // Skip if already uploaded and URL exists
    if (mapping[file.relativePath]?.cloudinaryUrl) {
      console.log(`${progress} Already uploaded: ${file.relativePath}`);
      uploadSkipCount++;
      continue;
    }

    try {
      console.log(`${progress} Uploading: ${file.relativePath} -> miniflicks/${file.folder}...`);
      const uploadResult = await uploadLocalFileToCloudinary(file.absolutePath, file.folder);

      const mappingItem: ImageMappingItem = {
        filename: file.filename,
        folder: file.folder,
        localRelativePath: file.relativePath,
        localAbsolutePath: file.absolutePath,
        cloudinaryUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        uploadedAt: new Date().toISOString(),
      };

      mapping[file.relativePath] = mappingItem;
      mapping[file.filename] = mappingItem;
      uploadSuccessCount++;
      console.log(`         ↳ URL: ${uploadResult.secure_url}`);
    } catch (err: any) {
      uploadFailCount++;
      console.error(`❌ Failed to upload ${file.relativePath}:`, err.message);
    }
  }

  // Save mapping to JSON
  const mappingArray = Array.from(new Set(Object.values(mapping)));
  fs.writeFileSync(MAPPING_FILE_PATH, JSON.stringify(mappingArray, null, 2), 'utf-8');
  console.log(`\n✓ Mapping ledger saved to: ${MAPPING_FILE_PATH} (${mappingArray.length} items recorded).\n`);

  // Helper to find Cloudinary replacement URL for any stored string
  function resolveCloudinaryUrl(rawPath: string | null | undefined): string | null {
    if (!rawPath || typeof rawPath !== 'string') return null;
    const trimmed = rawPath.trim();
    if (trimmed.startsWith('https://res.cloudinary.com')) return trimmed; // already cloudinary

    // Try direct relative path match
    if (mapping[trimmed]?.cloudinaryUrl) {
      return mapping[trimmed].cloudinaryUrl;
    }

    // Try normalized relative path (with leading slash)
    const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    if (mapping[normalized]?.cloudinaryUrl) {
      return mapping[normalized].cloudinaryUrl;
    }

    // Try basename/filename match
    const filename = path.basename(trimmed);
    if (mapping[filename]?.cloudinaryUrl) {
      return mapping[filename].cloudinaryUrl;
    }

    return null;
  }

  // 5. Update Database Records
  console.log('--- Step 2: Updating MongoDB Collections ---');

  const stats = {
    cakes: 0,
    addons: 0,
    gifts: 0,
    occasions: 0,
    locations: 0,
    banners: 0,
    screens: 0,
  };

  // 5.1 Cakes
  const cakes = await Cake.find();
  for (const cake of cakes) {
    const newUrl = resolveCloudinaryUrl(cake.image);
    if (newUrl && newUrl !== cake.image) {
      cake.image = newUrl;
      await cake.save();
      stats.cakes++;
    }
  }
  console.log(`✓ Cakes updated: ${stats.cakes} / ${cakes.length}`);

  // 5.2 Addons
  const addons = await Addon.find();
  for (const addon of addons) {
    const newUrl = resolveCloudinaryUrl(addon.image);
    if (newUrl && newUrl !== addon.image) {
      addon.image = newUrl;
      await addon.save();
      stats.addons++;
    }
  }
  console.log(`✓ Addons updated: ${stats.addons} / ${addons.length}`);

  // 5.3 Gifts
  const gifts = await Gift.find();
  for (const gift of gifts) {
    const newUrl = resolveCloudinaryUrl(gift.image);
    if (newUrl && newUrl !== gift.image) {
      gift.image = newUrl;
      await gift.save();
      stats.gifts++;
    }
  }
  console.log(`✓ Gifts updated: ${stats.gifts} / ${gifts.length}`);

  // 5.4 Occasions
  const occasions = await Occasion.find();
  for (const occ of occasions) {
    const newUrl = resolveCloudinaryUrl(occ.image);
    if (newUrl && newUrl !== occ.image) {
      occ.image = newUrl;
      await occ.save();
      stats.occasions++;
    }
  }
  console.log(`✓ Occasions updated: ${stats.occasions} / ${occasions.length}`);

  // 5.5 Locations
  const locations = await Location.find();
  for (const loc of locations) {
    const newUrl = resolveCloudinaryUrl(loc.image);
    if (newUrl && newUrl !== loc.image) {
      loc.image = newUrl;
      await loc.save();
      stats.locations++;
    }
  }
  console.log(`✓ Locations updated: ${stats.locations} / ${locations.length}`);

  // 5.6 Banners
  const banners = await Banner.find();
  for (const banner of banners) {
    const newUrl = resolveCloudinaryUrl(banner.image);
    if (newUrl && newUrl !== banner.image) {
      banner.image = newUrl;
      await banner.save();
      stats.banners++;
    }
  }
  console.log(`✓ Banners updated: ${stats.banners} / ${banners.length}`);

  // 5.7 Screens (Images Array)
  const screens = await Screen.find();
  for (const screen of screens) {
    if (Array.isArray(screen.images) && screen.images.length > 0) {
      let modified = false;
      const updatedList: string[] = [];

      for (const img of screen.images) {
        const newUrl = resolveCloudinaryUrl(img);
        if (newUrl && newUrl !== img) {
          updatedList.push(newUrl);
          modified = true;
        } else {
          updatedList.push(img);
        }
      }

      if (modified) {
        screen.images = updatedList;
        await screen.save();
        stats.screens++;
      }
    }
  }
  console.log(`✓ Screens updated: ${stats.screens} / ${screens.length}`);

  console.log('\n=====================================================');
  console.log('  Migration Complete Summary');
  console.log('=====================================================');
  console.log(`• Local Files Uploaded: ${uploadSuccessCount}`);
  console.log(`• Local Files Skipped (Already Uploaded): ${uploadSkipCount}`);
  console.log(`• Upload Failures: ${uploadFailCount}`);
  console.log(`• Total Database Records Updated: ${stats.cakes + stats.addons + stats.gifts + stats.occasions + stats.locations + stats.banners + stats.screens}`);
  console.log(`• Mapping JSON: ${MAPPING_FILE_PATH}`);
  console.log('=====================================================\n');

  await mongoose.disconnect();
  console.log('✓ Disconnected from MongoDB. Done!');
}

runMigration().catch((err) => {
  console.error('\n❌ Unhandled migration error:', err);
  process.exit(1);
});
