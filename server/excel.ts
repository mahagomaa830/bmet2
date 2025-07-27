import * as XLSX from 'xlsx';
import { storage } from './storage';
import type { Equipment, MaintenanceRecord, FaultReport, User } from '@shared/schema';

// Export functions
export async function exportEquipmentToExcel() {
  const equipment = await storage.getAllEquipment();
  
  const worksheetData = equipment.map(item => ({
    'رقم الجهاز': item.id,
    'اسم الجهاز': item.name,
    'الموديل': item.model,
    'الشركة المصنعة': item.manufacturer,
    'الرقم التسلسلي': item.serialNumber,
    'الباركود': item.barcode,
    'القسم': item.department,
    'الموقع': item.location,
    'الحالة': getStatusInArabic(item.status),
    'تاريخ آخر صيانة': item.lastMaintenanceDate ? new Date(item.lastMaintenanceDate).toLocaleDateString('ar-SA') : '',
    'تاريخ الصيانة القادمة': item.nextMaintenanceDate ? new Date(item.nextMaintenanceDate).toLocaleDateString('ar-SA') : '',
    'تاريخ الشراء': item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('ar-SA') : '',
    'انتهاء الضمان': item.warrantyExpiry ? new Date(item.warrantyExpiry).toLocaleDateString('ar-SA') : '',
    'المواصفات': item.specifications ? JSON.stringify(item.specifications) : '',
    'تاريخ الإدخال': new Date(item.createdAt!).toLocaleDateString('ar-SA')
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
    { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'الأجهزة الطبية');
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export async function exportMaintenanceToExcel() {
  const records = await storage.getMaintenanceRecords();
  
  const worksheetData = records.map(record => ({
    'رقم السجل': record.id,
    'رقم الجهاز': record.equipmentId,
    'رقم الفني': record.technicianId,
    'نوع الصيانة': getMaintenanceTypeInArabic(record.type),
    'الوصف': record.description,
    'القطع المستبدلة': record.partsReplaced ? JSON.stringify(record.partsReplaced) : '',
    'التكلفة': record.cost ? (record.cost / 100).toFixed(2) : '',
    'تاريخ البداية': new Date(record.startDate).toLocaleDateString('ar-SA'),
    'تاريخ الانتهاء': record.completionDate ? new Date(record.completionDate).toLocaleDateString('ar-SA') : '',
    'الحالة': getMaintenanceStatusInArabic(record.status),
    'ملاحظات': record.notes || '',
    'تاريخ الإدخال': new Date(record.createdAt!).toLocaleDateString('ar-SA')
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  
  worksheet['!cols'] = [
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 30 },
    { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 30 }, { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'سجلات الصيانة');
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export async function exportFaultReportsToExcel() {
  const reports = await storage.getAllFaultReports();
  
  const worksheetData = reports.map(report => ({
    'رقم التقرير': report.id,
    'رقم الجهاز': report.equipmentId,
    'العنوان': report.title,
    'الوصف': report.description,
    'الأولوية': getPriorityInArabic(report.priority),
    'الحالة': getFaultStatusInArabic(report.status),
    'تم الإبلاغ بواسطة': report.reportedBy,
    'تاريخ الإبلاغ': report.reportedAt ? new Date(report.reportedAt).toLocaleDateString('ar-SA') : '',
    'تاريخ الحل': report.resolvedAt ? new Date(report.resolvedAt).toLocaleDateString('ar-SA') : '',
    'ملاحظات الحل': report.resolutionNotes || '',
    'تاريخ الإدخال': new Date(report.createdAt!).toLocaleDateString('ar-SA')
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  
  worksheet['!cols'] = [
    { wch: 12 }, { wch: 12 }, { wch: 25 }, { wch: 40 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'تقارير الأعطال');
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

// Import functions
export async function importEquipmentFromExcel(buffer: Buffer) {
  const workbook = XLSX.read(buffer);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  const results = {
    success: 0,
    errors: [] as string[],
    total: data.length
  };

  for (let i = 0; i < data.length; i++) {
    const row = data[i] as any;
    
    try {
      // Map Arabic headers to English fields
      const equipmentData = {
        name: row['اسم الجهاز'] || row['name'],
        model: row['الموديل'] || row['model'],
        manufacturer: row['الشركة المصنعة'] || row['manufacturer'],
        serialNumber: row['الرقم التسلسلي'] || row['serialNumber'],
        barcode: row['الباركود'] || row['barcode'],
        department: row['القسم'] || row['department'],
        location: row['الموقع'] || row['location'],
        status: parseStatusFromArabic(row['الحالة']) || row['status'] || 'operational',
        lastMaintenanceDate: parseDate(row['تاريخ آخر صيانة']) || parseDate(row['lastMaintenanceDate']),
        nextMaintenanceDate: parseDate(row['تاريخ الصيانة القادمة']) || parseDate(row['nextMaintenanceDate']),
        purchaseDate: parseDate(row['تاريخ الشراء']) || parseDate(row['purchaseDate']),
        warrantyExpiry: parseDate(row['انتهاء الضمان']) || parseDate(row['warrantyExpiry']),
        specifications: parseJSON(row['المواصفات']) || parseJSON(row['specifications'])
      };

      // Validate required fields
      if (!equipmentData.name || !equipmentData.model || !equipmentData.barcode) {
        results.errors.push(`الصف ${i + 2}: بيانات مطلوبة مفقودة (اسم الجهاز، الموديل، الباركود)`);
        continue;
      }

      await storage.createEquipment(equipmentData as any);
      results.success++;
    } catch (error: any) {
      results.errors.push(`الصف ${i + 2}: ${error.message}`);
    }
  }

  return results;
}

export async function importMaintenanceFromExcel(buffer: Buffer) {
  const workbook = XLSX.read(buffer);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  const results = {
    success: 0,
    errors: [] as string[],
    total: data.length
  };

  for (let i = 0; i < data.length; i++) {
    const row = data[i] as any;
    
    try {
      const maintenanceData = {
        equipmentId: parseInt(row['رقم الجهاز'] || row['equipmentId']),
        technicianId: parseInt(row['رقم الفني'] || row['technicianId']),
        type: parseMaintenanceTypeFromArabic(row['نوع الصيانة']) || row['type'] || 'preventive',
        description: row['الوصف'] || row['description'],
        partsReplaced: parseJSON(row['القطع المستبدلة']) || parseJSON(row['partsReplaced']),
        cost: row['التكلفة'] ? Math.round(parseFloat(row['التكلفة']) * 100) : undefined,
        startDate: parseDate(row['تاريخ البداية']) || parseDate(row['startDate']) || new Date(),
        completionDate: parseDate(row['تاريخ الانتهاء']) || parseDate(row['completionDate']),
        status: parseMaintenanceStatusFromArabic(row['الحالة']) || row['status'] || 'pending',
        notes: row['ملاحظات'] || row['notes']
      };

      if (!maintenanceData.equipmentId || !maintenanceData.technicianId || !maintenanceData.description) {
        results.errors.push(`الصف ${i + 2}: بيانات مطلوبة مفقودة`);
        continue;
      }

      await storage.createMaintenanceRecord(maintenanceData as any);
      results.success++;
    } catch (error: any) {
      results.errors.push(`الصف ${i + 2}: ${error.message}`);
    }
  }

  return results;
}

// Helper functions
function getStatusInArabic(status: string): string {
  switch (status) {
    case 'operational': return 'يعمل';
    case 'maintenance': return 'تحت الصيانة';
    case 'out_of_service': return 'خارج الخدمة';
    default: return status;
  }
}

function parseStatusFromArabic(status: string): string {
  switch (status) {
    case 'يعمل': return 'operational';
    case 'تحت الصيانة': return 'maintenance';
    case 'خارج الخدمة': return 'out_of_service';
    default: return status;
  }
}

function getMaintenanceTypeInArabic(type: string): string {
  switch (type) {
    case 'preventive': return 'وقائية';
    case 'corrective': return 'إصلاحية';
    case 'emergency': return 'طارئة';
    default: return type;
  }
}

function parseMaintenanceTypeFromArabic(type: string): string {
  switch (type) {
    case 'وقائية': return 'preventive';
    case 'إصلاحية': return 'corrective';
    case 'طارئة': return 'emergency';
    default: return type;
  }
}

function getMaintenanceStatusInArabic(status: string): string {
  switch (status) {
    case 'pending': return 'في الانتظار';
    case 'in_progress': return 'قيد التنفيذ';
    case 'completed': return 'مكتمل';
    default: return status;
  }
}

function parseMaintenanceStatusFromArabic(status: string): string {
  switch (status) {
    case 'في الانتظار': return 'pending';
    case 'قيد التنفيذ': return 'in_progress';
    case 'مكتمل': return 'completed';
    default: return status;
  }
}

function getPriorityInArabic(priority: string): string {
  switch (priority) {
    case 'low': return 'منخفض';
    case 'medium': return 'متوسط';
    case 'high': return 'عالي';
    case 'critical': return 'حرج';
    default: return priority;
  }
}

function getFaultStatusInArabic(status: string): string {
  switch (status) {
    case 'open': return 'مفتوح';
    case 'in_progress': return 'قيد المعالجة';
    case 'resolved': return 'تم الحل';
    case 'closed': return 'مغلق';
    default: return status;
  }
}

function parseDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? undefined : date;
}

function parseJSON(jsonStr: string): any {
  if (!jsonStr) return undefined;
  try {
    return JSON.parse(jsonStr);
  } catch {
    return undefined;
  }
}