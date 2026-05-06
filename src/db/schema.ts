import { sql } from "drizzle-orm"
import { pgTable, foreignKey, serial, text, timestamp, integer, unique, boolean, index, uniqueIndex } from "drizzle-orm/pg-core"


export const item = pgTable("Item", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	userId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "Item_userId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const menuItem = pgTable("MenuItem", {
	id: serial().primaryKey().notNull(),
	menuId: integer().notNull(),
	name: text().notNull(),
	itemId: integer(),
}, (table) => [
	foreignKey({
		columns: [table.itemId],
		foreignColumns: [item.id],
		name: "MenuItem_itemId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.menuId],
		foreignColumns: [menu.id],
		name: "MenuItem_menuId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean().default(false).notNull(),
	image: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	maxItems: integer().default(20),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const menuItemQuantity = pgTable("MenuItemQuantity", {
	id: serial().primaryKey().notNull(),
	menuItemId: integer().notNull(),
	quantity: integer().notNull(),
	dipTemperature: integer().notNull(),
	dipTime: integer().notNull(),
	doubleDip: boolean().default(false).notNull(),
	doubleDipHoldTime: integer(),
	doubleDipTemperature: integer(),
	doubleDipTime: integer(),
}, (table) => [
	foreignKey({
		columns: [table.menuItemId],
		foreignColumns: [menuItem.id],
		name: "MenuItemQuantity_menuItemId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const menu = pgTable("Menu", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	userId: text().notNull(),
	holdTemperature: integer().notNull(),
	sleepTemperature: integer().notNull(),
	sleepTime: integer().notNull(),
	deepSleepTemperature: integer().notNull(),
	deepSleepTime: integer().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "Menu_userId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull(),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "session_userId_user_id_fk"
	}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ mode: 'string' }),
	refreshTokenExpiresAt: timestamp({ mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "account_userId_user_id_fk"
	}).onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const device = pgTable("Device", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	macid: text().notNull(),
	userId: text().notNull(),
	activeMenuId: integer(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	displayName: text(),
}, (table) => [
	uniqueIndex("Device_macid_key").using("btree", table.macid.asc().nullsLast().op("text_ops")),
	uniqueIndex("Device_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.activeMenuId],
		foreignColumns: [menu.id],
		name: "Device_activeMenuId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "Device_userId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const analyticsEvent = pgTable("AnalyticsEvent", {
	id: serial().primaryKey().notNull(),
	deviceId: integer(),
	userId: text().notNull(),
	menuItemId: integer(),
	quantity: integer().notNull(),
	timestamp: timestamp({ precision: 3, mode: 'string' }).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	itemId: integer(),
}, (table) => [
	foreignKey({
		columns: [table.deviceId],
		foreignColumns: [device.id],
		name: "AnalyticsEvent_deviceId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.itemId],
		foreignColumns: [item.id],
		name: "AnalyticsEvent_itemId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.menuItemId],
		foreignColumns: [menuItem.id],
		name: "AnalyticsEvent_menuItemId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "AnalyticsEvent_userId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);
