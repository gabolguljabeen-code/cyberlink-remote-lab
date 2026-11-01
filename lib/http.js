import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from './db.js';
import { authSessions } from './schema.js';

export const hash = value => createHash('sha256').update(value).digest('hex');
export const id = () => randomBytes(16).toString('hex');
export const json = (res, status, body) => res.status(status).json(body);
export function cookie(req, name) { const raw = req.headers.cookie || ''; return raw.split(';').map(x => x.trim()).find(x => x.startsWith(name + '='))?.slice(name.length + 1); }
export async function user(req) { const sid = cookie(req, 'cl_session'); if (!sid) return null; const rows = await db.select({ userId: authSessions.userId, csrfHash: authSessions.csrfHash }).from(authSessions).where(and(eq(authSessions.id, sid), isNull(authSessions.revokedAt), gt(authSessions.expiresAt, Math.floor(Date.now() / 1000)))).limit(1); return rows[0] || null; }
export function setSession(res, sid, csrf) { res.setHeader('Set-Cookie', [`cl_session=${sid}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`, `cl_csrf=${csrf}; Secure; SameSite=Lax; Path=/; Max-Age=604800`]); }
export function csrfOk(req) { const c = cookie(req, 'cl_csrf'); return !!c && req.headers['x-csrf-token'] === c; }
export async function requireUser(req, res, write = false) { const u = await user(req); if (!u) { json(res, 401, { error: 'Authentication required' }); return null; } if (write) { const csrf = cookie(req, 'cl_csrf'); if (!csrf || req.headers['x-csrf-token'] !== csrf || hash(csrf) !== u.csrfHash) { json(res, 403, { error: 'CSRF check failed' }); return null; } } return u; }
