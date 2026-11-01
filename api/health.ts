import type { VercelRequest, VercelResponse } from '@vercel/node';

const json = (res: VercelResponse, status: number, body: unknown) => res.status(status).json(body);

const requiredTables = ['users', 'auth_sessions', 'login_attempts', 'devices', 'pairing_invitations', 'remote_sessions', 'device_permissions', 'security_audit_events', 'file_transfer_records'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    return json(res, 503, { ok: false, check: 'configuration', message: 'Turso environment variables are missing for this deployment.' });
  }
  try {
    const { db } = await import('../lib/db.js');
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
    const present = new Set(result.rows.map(row => String(row.name)));
    const missingTables = requiredTables.filter(table => !present.has(table));
    if (missingTables.length) return json(res, 503, { ok: false, check: 'schema', missingTables, message: 'Apply drizzle/0000_initial.sql to the Turso database configured in this deployment.' });
    return json(res, 200, { ok: true, database: 'connected', schema: 'ready' });
  } catch (error) {
    console.error('Health check failed', error);
    return json(res, 503, { ok: false, check: 'database', message: 'Could not connect to the configured Turso database. Check the Vercel function logs and database URL/token.' });
  }
}
