require('dotenv').config({ path: '.env' });
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection to:', connectionString ? connectionString.substring(0, 20) + '...' : 'Undefined');

const pool = new Pool({ connectionString });

async function test() {
    try {
        const client = await pool.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT NOW()');
        console.log('Time:', res.rows[0]);
        client.release();
        await pool.end();
    } catch (err) {
        console.error('Connection failed:', err);
    }
}

test();
