import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), email: text('email').notNull(), passwordHash: text('password_hash').notNull(), createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
}, t => [uniqueIndex('users_email_uq').on(t.email)]);
export const devices = sqliteTable('devices', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }), name: text('name').notNull(), manufacturer: text('manufacturer'), model: text('model'), androidVersion: text('android_version'), apiLevel: integer('api_level'), batteryPercent: integer('battery_percent'), charging: integer('charging', { mode: 'boolean' }), appVersion: text('app_version'), networkStatus: text('network_status'), lastSeenAt: integer('last_seen_at'), createdAt: integer('created_at').notNull().default(sql`(unixepoch())`), revokedAt: integer('revoked_at'),
}, t => [index('devices_owner_idx').on(t.ownerId)]);
export const pairingInvitations = sqliteTable('pairing_invitations', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }), tokenHash: text('token_hash').notNull(), expiresAt: integer('expires_at').notNull(), usedAt: integer('used_at'), createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
}, t => [uniqueIndex('pairing_token_hash_uq').on(t.tokenHash), index('pairing_owner_idx').on(t.ownerId)]);
export const remoteSessions = sqliteTable('remote_sessions', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }), deviceId: text('device_id').notNull().references(() => devices.id, { onDelete: 'cascade' }), roomName: text('room_name').notNull(), status: text('status').notNull().default('active'), expiresAt: integer('expires_at').notNull(), revokedAt: integer('revoked_at'), createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
}, t => [index('sessions_owner_idx').on(t.ownerId), index('sessions_device_idx').on(t.deviceId)]);
export const devicePermissions = sqliteTable('device_permissions', {
  id: text('id').primaryKey(), deviceId: text('device_id').notNull().references(() => devices.id, { onDelete: 'cascade' }), capability: text('capability').notNull(), granted: integer('granted', { mode: 'boolean' }).notNull().default(false), updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, t => [uniqueIndex('device_permission_uq').on(t.deviceId, t.capability)]);
export const securityAuditEvents = sqliteTable('security_audit_events', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }), deviceId: text('device_id').references(() => devices.id, { onDelete: 'set null' }), eventType: text('event_type').notNull(), details: text('details').notNull().default('{}'), createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
}, t => [index('audit_owner_created_idx').on(t.ownerId, t.createdAt)]);
export const fileTransferRecords = sqliteTable('file_transfer_records', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }), deviceId: text('device_id').notNull().references(() => devices.id, { onDelete: 'cascade' }), direction: text('direction').notNull(), fileName: text('file_name').notNull(), status: text('status').notNull(), createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
}, t => [index('transfers_owner_created_idx').on(t.ownerId, t.createdAt)]);
export const authSessions = sqliteTable('auth_sessions', {
  id: text('id').primaryKey(), userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), csrfHash: text('csrf_hash').notNull(), expiresAt: integer('expires_at').notNull(), revokedAt: integer('revoked_at'), createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
}, t => [index('auth_sessions_user_idx').on(t.userId)]);
export const loginAttempts = sqliteTable('login_attempts', {
  id: text('id').primaryKey(), lookupHash: text('lookup_hash').notNull(), attemptedAt: integer('attempted_at').notNull().default(sql`(unixepoch())`),
}, t => [index('login_attempts_lookup_time_idx').on(t.lookupHash, t.attemptedAt)]);
