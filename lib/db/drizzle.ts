/**
 * Drizzle ORM Database Connection
 * 
 * Centralized database connection for the application
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as aiAuditSchema from './schema/ai-audit';

// Combine all schemas
const allSchemas = {
  ...schema,
  ...aiAuditSchema
};

// Create the connection
const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString, { prepare: false });

// Create the drizzle instance with all schemas
export const db = drizzle(client, { schema: allSchemas });

// Export the client for raw queries if needed
export { client };

// Type for the database
export type Database = typeof db;
