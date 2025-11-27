import { initializeDatabase } from '../services/db';

async function main() {
  try {
    console.log('🚀 Initializing database schema...');
    await initializeDatabase();
    console.log('✅ Database schema initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

main();
