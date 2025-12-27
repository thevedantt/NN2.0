// import { drizzle } from 'drizzle-orm/neon-http';

// export const db = drizzle(process.env.DATABASE_URL);

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Configure Neon to use WebSocket
neonConfig.webSocketConstructor = WebSocket;

// Create a connection pool
const sql = neon(process.env.DATABASE_URL, {
    maxConnections: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

export const db = drizzle(sql);