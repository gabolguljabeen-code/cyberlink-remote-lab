import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, count, eq, gt } from 'drizzle-orm';
import { db } from '../../lib/db.js';
import { authSessions, loginAttempts, users } from '../../lib/schema.js';
import { hash, id, json, setSession } from '../../lib/http.js';

const GUEST_SESSION_SECONDS = 24 * 60 * 60;
const GUEST_CREATION_LIMIT = 10;
const GUEST_RATE_WINDOW_SECONDS = 60 * 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  try {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwarded)
      ? forwarded[0]
      : String(forwarded || 'unknown').split(',')[0].trim();
    const lookupHash = hash(`guest-session|${ip}`);
    const now = Math.floor(Date.now() / 1000);
    const [{ attempts }] = await db
      .select({ attempts: count() })
      .from(loginAttempts)
      .where(and(eq(loginAttempts.lookupHash, lookupHash), gt(loginAttempts.attemptedAt, now - GUEST_RATE_WINDOW_SECONDS)));

    if (attempts >= GUEST_CREATION_LIMIT) {
      return json(res, 429, { error: 'Too many guest sessions from this network. Try again in an hour.' });
    }

    await db.insert(loginAttempts).values({ id: id(), lookupHash, attemptedAt: now });

    const userId = id();
    const sessionId = id();
    const csrf = id();
    await db.insert(users).values({
      id: userId,
      email: `guest-${userId}@anonymous.invalid`,
      // This marker is not a valid password hash, so this guest cannot use password login.
      passwordHash: 'guest-session-only',
    });
    await db.insert(authSessions).values({
      id: sessionId,
      userId,
      csrfHash: hash(csrf),
      expiresAt: now + GUEST_SESSION_SECONDS,
    });

    res.setHeader('Set-Cookie', [
      `cl_session=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${GUEST_SESSION_SECONDS}`,
      `cl_csrf=${csrf}; Secure; SameSite=Lax; Path=/; Max-Age=${GUEST_SESSION_SECONDS}`,
    ]);
    return json(res, 201, { user: { id: userId, guest: true }, csrfToken: csrf, guest: true });
  } catch (error) {
    console.error('Guest session creation failed', error);
    return json(res, 500, { error: 'A guest session could not be created. Check the database configuration and Vercel function logs.' });
  }
}
