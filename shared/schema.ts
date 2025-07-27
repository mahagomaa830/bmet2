import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'technician' | 'nurse' | 'admin'
  department: text("department").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  model: text("model").notNull(),
  manufacturer: text("manufacturer").notNull(),
  serialNumber: text("serial_number").notNull().unique(),
  barcode: text("barcode").notNull().unique(),
  department: text("department").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull(), // 'operational' | 'maintenance' | 'out_of_service'
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  purchaseDate: timestamp("purchase_date"),
  warrantyExpiry: timestamp("warranty_expiry"),
  specifications: jsonb("specifications"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull().references(() => equipment.id),
  technicianId: integer("technician_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'preventive' | 'corrective' | 'emergency'
  description: text("description").notNull(),
  partsReplaced: jsonb("parts_replaced"),
  cost: integer("cost"), // in cents
  startDate: timestamp("start_date").notNull(),
  completionDate: timestamp("completion_date"),
  status: text("status").notNull(), // 'pending' | 'in_progress' | 'completed'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const faultReports = pgTable("fault_reports", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull().references(() => equipment.id),
  reportedBy: integer("reported_by").notNull().references(() => users.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(), // 'low' | 'medium' | 'high' | 'critical'
  status: text("status").notNull(), // 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
  reportedAt: timestamp("reported_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyChecks = pgTable("daily_checks", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull().references(() => equipment.id),
  technicianId: integer("technician_id").notNull().references(() => users.id),
  checkDate: timestamp("check_date").notNull(),
  status: text("status").notNull(), // 'pass' | 'fail' | 'needs_attention'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const equipmentNotes = pgTable("equipment_notes", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull().references(() => equipment.id),
  createdBy: integer("created_by").notNull().references(() => users.id),
  note: text("note").notNull(),
  type: text("type").notNull(), // 'general' | 'issue' | 'maintenance' | 'warning'
  priority: text("priority").notNull(), // 'low' | 'medium' | 'high'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const driveSync = pgTable("drive_sync", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  driveFileId: text("drive_file_id").notNull(),
  lastSyncTime: timestamp("last_sync_time").defaultNow(),
  syncType: text("sync_type").notNull(), // 'export' | 'import' | 'backup'
  status: text("status").notNull(), // 'pending' | 'completed' | 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
});

export const insertMaintenanceRecordSchema = createInsertSchema(maintenanceRecords).omit({
  id: true,
  createdAt: true,
});

export const insertFaultReportSchema = createInsertSchema(faultReports).omit({
  id: true,
  createdAt: true,
  reportedAt: true,
});

export const insertDailyCheckSchema = createInsertSchema(dailyChecks).omit({
  id: true,
  createdAt: true,
});

export const insertEquipmentNoteSchema = createInsertSchema(equipmentNotes).omit({
  id: true,
  createdAt: true,
});

export const insertDriveSyncSchema = createInsertSchema(driveSync).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;

export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type InsertMaintenanceRecord = z.infer<typeof insertMaintenanceRecordSchema>;

export type FaultReport = typeof faultReports.$inferSelect;
export type InsertFaultReport = z.infer<typeof insertFaultReportSchema>;

export type DailyCheck = typeof dailyChecks.$inferSelect;
export type InsertDailyCheck = z.infer<typeof insertDailyCheckSchema>;

export type EquipmentNote = typeof equipmentNotes.$inferSelect;
export type InsertEquipmentNote = z.infer<typeof insertEquipmentNoteSchema>;

export type DriveSync = typeof driveSync.$inferSelect;
export type InsertDriveSync = z.infer<typeof insertDriveSyncSchema>;


