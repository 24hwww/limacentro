import db from '../services/db';

async function main() {
  try {
    console.log('🚀 Checking database connection...');
    await db.$queryRaw`SELECT 1`;
    console.log('✅ Database connection verified. Run `npx prisma migrate deploy` to apply schema changes.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    process.exit(1);
  }
}

main();
