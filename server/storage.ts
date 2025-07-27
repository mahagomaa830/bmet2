import { 
  User, 
  Equipment, 
  MaintenanceRecord, 
  FaultReport, 
  DailyCheck, 
  EquipmentNote,
  InsertUser,
  InsertEquipment,
  InsertMaintenanceRecord,
  InsertFaultReport,
  InsertDailyCheck,
  InsertEquipmentNote,
  users,
  equipment,
  maintenanceRecords,
  faultReports,
  dailyChecks,
  equipmentNotes
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Equipment
  getAllEquipment(): Promise<Equipment[]>;
  getEquipment(id: number): Promise<Equipment | undefined>;
  getEquipmentByBarcode(barcode: string): Promise<Equipment | undefined>;
  getEquipmentByDepartment(department: string): Promise<Equipment[]>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipment: Partial<Equipment>): Promise<Equipment | undefined>;
  deleteEquipment(id: number): Promise<boolean>;

  // Maintenance Records
  getMaintenanceRecords(equipmentId?: number): Promise<MaintenanceRecord[]>;
  getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined>;
  createMaintenanceRecord(record: InsertMaintenanceRecord): Promise<MaintenanceRecord>;
  updateMaintenanceRecord(id: number, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord | undefined>;

  // Fault Reports
  getAllFaultReports(): Promise<FaultReport[]>;
  getFaultReport(id: number): Promise<FaultReport | undefined>;
  getFaultReportsByStatus(status: string): Promise<FaultReport[]>;
  getFaultReportsByPriority(priority: string): Promise<FaultReport[]>;
  createFaultReport(report: InsertFaultReport): Promise<FaultReport>;
  updateFaultReport(id: number, report: Partial<FaultReport>): Promise<FaultReport | undefined>;

  // Daily Checks
  getDailyChecks(date?: Date): Promise<DailyCheck[]>;
  getDailyCheck(id: number): Promise<DailyCheck | undefined>;
  createDailyCheck(check: InsertDailyCheck): Promise<DailyCheck>;
  updateDailyCheck(id: number, check: Partial<DailyCheck>): Promise<DailyCheck | undefined>;

  // Equipment Notes
  getEquipmentNotes(equipmentId: number): Promise<EquipmentNote[]>;
  getEquipmentNote(id: number): Promise<EquipmentNote | undefined>;
  createEquipmentNote(note: InsertEquipmentNote): Promise<EquipmentNote>;
  updateEquipmentNote(id: number, note: Partial<EquipmentNote>): Promise<EquipmentNote | undefined>;
  deleteEquipmentNote(id: number): Promise<boolean>;
}

import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }



  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllEquipment(): Promise<Equipment[]> {
    return await db.select().from(equipment);
  }

  async getEquipment(id: number): Promise<Equipment | undefined> {
    const [equipmentItem] = await db.select().from(equipment).where(eq(equipment.id, id));
    return equipmentItem || undefined;
  }

  async getEquipmentByBarcode(barcode: string): Promise<Equipment | undefined> {
    const [equipmentItem] = await db.select().from(equipment).where(eq(equipment.barcode, barcode));
    return equipmentItem || undefined;
  }

  async getEquipmentByDepartment(department: string): Promise<Equipment[]> {
    return await db.select().from(equipment).where(eq(equipment.department, department));
  }

  async createEquipment(insertEquipment: InsertEquipment): Promise<Equipment> {
    const [eq] = await db
      .insert(equipment)
      .values(insertEquipment)
      .returning();
    return eq;
  }

  async updateEquipment(id: number, updates: Partial<Equipment>): Promise<Equipment | undefined> {
    const [updated] = await db
      .update(equipment)
      .set(updates)
      .where(eq(equipment.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEquipment(id: number): Promise<boolean> {
    const result = await db.delete(equipment).where(eq(equipment.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getMaintenanceRecords(equipmentId?: number): Promise<MaintenanceRecord[]> {
    if (equipmentId) {
      return await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.equipmentId, equipmentId));
    }
    return await db.select().from(maintenanceRecords);
  }

  async getMaintenanceRecord(id: number): Promise<MaintenanceRecord | undefined> {
    const [record] = await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.id, id));
    return record || undefined;
  }

  async createMaintenanceRecord(insertRecord: InsertMaintenanceRecord): Promise<MaintenanceRecord> {
    const [record] = await db
      .insert(maintenanceRecords)
      .values(insertRecord)
      .returning();
    return record;
  }

  async updateMaintenanceRecord(id: number, updates: Partial<MaintenanceRecord>): Promise<MaintenanceRecord | undefined> {
    const [updated] = await db
      .update(maintenanceRecords)
      .set(updates)
      .where(eq(maintenanceRecords.id, id))
      .returning();
    return updated || undefined;
  }

  async getAllFaultReports(): Promise<FaultReport[]> {
    return await db.select().from(faultReports);
  }

  async getFaultReport(id: number): Promise<FaultReport | undefined> {
    const [report] = await db.select().from(faultReports).where(eq(faultReports.id, id));
    return report || undefined;
  }

  async getFaultReportsByStatus(status: string): Promise<FaultReport[]> {
    return await db.select().from(faultReports).where(eq(faultReports.status, status));
  }

  async getFaultReportsByPriority(priority: string): Promise<FaultReport[]> {
    return await db.select().from(faultReports).where(eq(faultReports.priority, priority));
  }

  async createFaultReport(insertReport: InsertFaultReport): Promise<FaultReport> {
    const [report] = await db
      .insert(faultReports)
      .values(insertReport)
      .returning();
    return report;
  }

  async updateFaultReport(id: number, updates: Partial<FaultReport>): Promise<FaultReport | undefined> {
    const [updated] = await db
      .update(faultReports)
      .set(updates)
      .where(eq(faultReports.id, id))
      .returning();
    return updated || undefined;
  }

  async getDailyChecks(date?: Date): Promise<DailyCheck[]> {
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      return await db.select().from(dailyChecks).where(
        and(
          gte(dailyChecks.createdAt, startOfDay),
          lte(dailyChecks.createdAt, endOfDay)
        )
      );
    }
    return await db.select().from(dailyChecks);
  }

  async getDailyCheck(id: number): Promise<DailyCheck | undefined> {
    const [check] = await db.select().from(dailyChecks).where(eq(dailyChecks.id, id));
    return check || undefined;
  }

  async createDailyCheck(insertCheck: InsertDailyCheck): Promise<DailyCheck> {
    const [check] = await db
      .insert(dailyChecks)
      .values(insertCheck)
      .returning();
    return check;
  }

  async updateDailyCheck(id: number, updates: Partial<DailyCheck>): Promise<DailyCheck | undefined> {
    const [updated] = await db
      .update(dailyChecks)
      .set(updates)
      .where(eq(dailyChecks.id, id))
      .returning();
    return updated || undefined;
  }

  async getEquipmentNotes(equipmentId: number): Promise<EquipmentNote[]> {
    return await db.select().from(equipmentNotes).where(eq(equipmentNotes.equipmentId, equipmentId));
  }

  async getEquipmentNote(id: number): Promise<EquipmentNote | undefined> {
    const [note] = await db.select().from(equipmentNotes).where(eq(equipmentNotes.id, id));
    return note || undefined;
  }

  async createEquipmentNote(insertNote: InsertEquipmentNote): Promise<EquipmentNote> {
    const [note] = await db
      .insert(equipmentNotes)
      .values(insertNote)
      .returning();
    return note;
  }

  async updateEquipmentNote(id: number, updates: Partial<EquipmentNote>): Promise<EquipmentNote | undefined> {
    const [updated] = await db
      .update(equipmentNotes)
      .set(updates)
      .where(eq(equipmentNotes.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEquipmentNote(id: number): Promise<boolean> {
    const result = await db.delete(equipmentNotes).where(eq(equipmentNotes.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();