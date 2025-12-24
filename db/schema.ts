import { pgTable, serial, text, boolean, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const apps = pgTable("apps", {
    id: serial("id").primaryKey(),
    packageName: text("package_name").notNull(),
    appName: text("app_name").notNull(),
    isKidSafe: boolean("is_kid_safe").notNull(),
    minAge: integer("min_age"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
}, (table) => [
    uniqueIndex("package_name_idx").on(table.packageName),
]);