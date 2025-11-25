import { Pool } from '@neondatabase/serverless';

// Initialize Neon connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = pool;

/**
 * Execute a query on the database
 */
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get a single row from the database
 */
export async function queryOne(text: string, params?: any[]) {
  const result = await query(text, params);
  return result.rows[0];
}

/**
 * Get multiple rows from the database
 */
export async function queryMany(text: string, params?: any[]) {
  const result = await query(text, params);
  return result.rows;
}

/**
 * Initialize database schema
 */
export async function initializeDatabase() {
  try {
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create businesses table
    await query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        address VARCHAR(255) NOT NULL,
        description TEXT,
        phone VARCHAR(20),
        website VARCHAR(255),
        rating DECIMAL(3, 2) DEFAULT 5.0,
        lat DECIMAL(10, 8) NOT NULL,
        lng DECIMAL(11, 8) NOT NULL,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for faster queries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
      CREATE INDEX IF NOT EXISTS idx_businesses_district ON businesses(district);
      CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export default pool;
