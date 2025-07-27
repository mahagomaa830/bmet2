import { db } from "./db";
import { users, equipment, maintenanceRecords, faultReports, dailyChecks, equipmentNotes } from "@shared/schema";

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Clear existing data
    await db.delete(equipmentNotes);
    await db.delete(dailyChecks);
    await db.delete(faultReports);
    await db.delete(maintenanceRecords);
    await db.delete(equipment);
    await db.delete(users);

    // Create users without username/password
    const [technician, nurse, admin] = await db.insert(users).values([
      {
        name: "فني الأجهزة",
        email: "technician@hospital.com",
        phone: "0551234567",
        role: "technician",
        department: "الصيانة",
        isActive: true,
      },
      {
        name: "ممرضة القسم",
        email: "nurse@hospital.com", 
        phone: "0559876543",
        role: "nurse",
        department: "العناية المركزة",
        isActive: true,
      },
      {
        name: "مدير النظام",
        email: "admin@hospital.com",
        phone: "0551111111", 
        role: "admin",
        department: "تقنية المعلومات",
        isActive: true,
      }
    ]).returning();

    // Create equipment
    const equipmentData = [
      {
        name: "جهاز التنفس الصناعي",
        model: "PB840",
        manufacturer: "Medtronic",
        serialNumber: "VM001234",
        barcode: "8901234567890",
        department: "العناية المركزة",
        location: "غرفة 101",
        status: "operational",
        lastMaintenanceDate: new Date("2024-01-15"),
        nextMaintenanceDate: new Date("2024-04-15"),
        purchaseDate: new Date("2023-06-01"),
        warrantyExpiry: new Date("2025-06-01"),
        specifications: {
          "نوع التهوية": "إيجابي وسلبي",
          "نطاق التنفس": "1-80 نفس/دقيقة",
          "الطاقة": "220V"
        }
      },
      {
        name: "جهاز مراقبة المريض",
        model: "IntelliVue MX450",
        manufacturer: "Philips",
        serialNumber: "PM002345",
        barcode: "8901234567891", 
        department: "العناية المركزة",
        location: "غرفة 102",
        status: "operational",
        lastMaintenanceDate: new Date("2024-02-01"),
        nextMaintenanceDate: new Date("2024-05-01"),
        purchaseDate: new Date("2023-08-15"),
        warrantyExpiry: new Date("2025-08-15"),
        specifications: {
          "عدد القنوات": "12 قناة",
          "دقة الضغط": "±1 mmHg",
          "الشاشة": "15 بوصة LCD"
        }
      },
      {
        name: "جهاز الأشعة السينية المحمول",
        model: "MobileArt Evolution",
        manufacturer: "Shimadzu",
        serialNumber: "XR003456",
        barcode: "8901234567892",
        department: "الأشعة",
        location: "قسم الأشعة",
        status: "maintenance",
        lastMaintenanceDate: new Date("2024-01-20"),
        nextMaintenanceDate: new Date("2024-03-20"),
        purchaseDate: new Date("2023-04-10"),
        warrantyExpiry: new Date("2025-04-10"),
        specifications: {
          "قوة الأنبوب": "32 kW",
          "نطاق الجهد": "40-125 kVp",
          "نوع الكاشف": "رقمي"
        }
      }
    ];

    const equipmentRecords = await db.insert(equipment).values(equipmentData).returning();

    // Create maintenance records
    await db.insert(maintenanceRecords).values([
      {
        equipmentId: equipmentRecords[0].id,
        technicianId: technician.id,
        type: "preventive",
        description: "صيانة دورية شاملة لجهاز التنفس الصناعي",
        partsReplaced: ["فلتر الهواء", "خرطوم التنفس"],
        cost: 85000, // 850 SAR in cents
        startDate: new Date("2024-01-15"),
        completionDate: new Date("2024-01-15"),
        status: "completed",
        notes: "تم استبدال جميع الفلاتر وفحص نظام التنفس"
      },
      {
        equipmentId: equipmentRecords[2].id,
        technicianId: technician.id,
        type: "corrective",
        description: "إصلاح عطل في منطقة التحكم",
        partsReplaced: ["لوحة التحكم الرئيسية"],
        cost: 325000, // 3250 SAR in cents
        startDate: new Date("2024-03-01"),
        completionDate: null,
        status: "in_progress",
        notes: "في انتظار وصول قطع الغيار من الشركة"
      }
    ]);

    // Create fault reports
    await db.insert(faultReports).values([
      {
        equipmentId: equipmentRecords[1].id,
        reportedBy: nurse.id,
        assignedTo: technician.id,
        title: "صوت غريب من الجهاز",
        description: "يصدر الجهاز صوتاً غير طبيعي عند بدء التشغيل",
        priority: "medium",
        status: "assigned",
        reportedAt: new Date("2024-03-05"),
        resolvedAt: null,
        resolutionNotes: null
      },
      {
        equipmentId: equipmentRecords[0].id,
        reportedBy: nurse.id,
        assignedTo: technician.id,
        title: "انقطاع في التيار",
        description: "الجهاز يتوقف بشكل مفاجئ لعدة ثوان",
        priority: "high",
        status: "in_progress", 
        reportedAt: new Date("2024-03-03"),
        resolvedAt: null,
        resolutionNotes: "تم فحص التوصيلات الكهربائية"
      }
    ]);

    // Create daily checks
    await db.insert(dailyChecks).values([
      {
        equipmentId: equipmentRecords[0].id,
        technicianId: technician.id,
        checkDate: new Date("2024-03-06"),
        status: "pass",
        notes: "جميع الفحوصات طبيعية"
      },
      {
        equipmentId: equipmentRecords[1].id,
        technicianId: technician.id,
        checkDate: new Date("2024-03-06"),
        status: "needs_attention",
        notes: "يحتاج إلى تنظيف الشاشة"
      }
    ]);

    // Create equipment notes
    await db.insert(equipmentNotes).values([
      {
        equipmentId: equipmentRecords[0].id,
        createdBy: technician.id,
        note: "تم تحديث البرمجيات إلى الإصدار الأحدث",
        type: "maintenance",
        priority: "low",
        isActive: true
      },
      {
        equipmentId: equipmentRecords[1].id,
        createdBy: nurse.id,
        note: "الجهاز يعمل بكفاءة عالية، لا توجد مشاكل",
        type: "general",
        priority: "low",
        isActive: true
      }
    ]);

    console.log("Database seeding completed successfully!");
    console.log("Demo users created:");
    console.log("- Technician: ID 1, Name: فني الأجهزة");
    console.log("- Nurse: ID 2, Name: ممرضة القسم");
    console.log("- Admin: ID 3, Name: مدير النظام");

  } catch (error) {
    console.error("Database seeding failed:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seeding process completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding process failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };