import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { readFile } from 'node:fs/promises';
import * as schema from './schema.js';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required');
const client = createClient({ url, authToken });
const initialSchema = await readFile(new URL('../drizzle/0000_initial.sql', import.meta.url), 'utf8');
await client.executeMultiple(initialSchema);
export const db = drizzle(client, { schema });
