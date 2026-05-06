import { relations } from "drizzle-orm/relations";
import { user, item, menuItem, menu, menuItemQuantity, session, account, device, analyticsEvent } from "./schema";

export const itemRelations = relations(item, ({ one, many }) => ({
	user: one(user, {
		fields: [item.userId],
		references: [user.id]
	}),
	menuItems: many(menuItem),
	analyticsEvents: many(analyticsEvent),
}));

export const userRelations = relations(user, ({ many }) => ({
	items: many(item),
	menus: many(menu),
	sessions: many(session),
	accounts: many(account),
	devices: many(device),
	analyticsEvents: many(analyticsEvent),
}));

export const menuItemRelations = relations(menuItem, ({ one, many }) => ({
	item: one(item, {
		fields: [menuItem.itemId],
		references: [item.id]
	}),
	menu: one(menu, {
		fields: [menuItem.menuId],
		references: [menu.id]
	}),
	menuItemQuantities: many(menuItemQuantity),
	analyticsEvents: many(analyticsEvent),
}));

export const menuRelations = relations(menu, ({ one, many }) => ({
	menuItems: many(menuItem),
	user: one(user, {
		fields: [menu.userId],
		references: [user.id]
	}),
	devices: many(device),
}));

export const menuItemQuantityRelations = relations(menuItemQuantity, ({ one }) => ({
	menuItem: one(menuItem, {
		fields: [menuItemQuantity.menuItemId],
		references: [menuItem.id]
	}),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const deviceRelations = relations(device, ({ one, many }) => ({
	menu: one(menu, {
		fields: [device.activeMenuId],
		references: [menu.id]
	}),
	user: one(user, {
		fields: [device.userId],
		references: [user.id]
	}),
	analyticsEvents: many(analyticsEvent),
}));

export const analyticsEventRelations = relations(analyticsEvent, ({ one }) => ({
	device: one(device, {
		fields: [analyticsEvent.deviceId],
		references: [device.id]
	}),
	item: one(item, {
		fields: [analyticsEvent.itemId],
		references: [item.id]
	}),
	menuItem: one(menuItem, {
		fields: [analyticsEvent.menuItemId],
		references: [menuItem.id]
	}),
	user: one(user, {
		fields: [analyticsEvent.userId],
		references: [user.id]
	}),
}));