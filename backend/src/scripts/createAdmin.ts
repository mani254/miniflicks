import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { registerSuperAdminService } from '../modules/auth/auth.service';

async function main() {
  const args = process.argv.slice(2);
  const email = args[0] || 'admin@miniflicks.in';
  const password = args[1] || 'Admin@123456';
  const name = args[2] || 'Super Admin';

  console.log(`[Seed] Connecting to database...`);
  await connectDatabase();

  try {
    console.log(`[Seed] Creating admin: ${email}...`);
    const admin = await registerSuperAdminService(name, email, password);
    console.log(`[Seed] Successfully created admin!`);
    console.log(`  ID: ${admin.id}`);
    console.log(`  Name: ${admin.name}`);
    console.log(`  Email: ${admin.email}`);
  } catch (err: any) {
    console.error(`[Seed] Error creating admin:`, err.message || err);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
