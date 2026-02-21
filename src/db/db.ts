import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Attach error listener to prevent unhandled error events from crashing the process
pool.on('error', (err) => {
    console.error('Unexpected error on idle database client:', err);
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        code: (err as any).code,
        timestamp: new Date().toISOString(),
    });
    // Graceful error handling - log the error but keep the pool alive
    // The pool will automatically attempt to reconnect for future queries
});

export const db = drizzle(pool);
