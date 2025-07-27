import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, HardDrive, Package, FileText, Database, Settings, FileSpreadsheet, Loader2 } from "lucide-react";
import React from "react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import LogoutButton from "@/components/logout-button";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isConnectingSheets, setIsConnectingSheets] = useState(false);
  const [isUpdatingDatabase, setIsUpdatingDatabase] = useState(false);
  const [currentDbUrl, setCurrentDbUrl] = useState("");

  const handleExport = async (type: 'equipment' | 'maintenance' | 'faults' | 'project-zip') => {
    try {
      setIsExporting(true);
      
      const response = await fetch(`/api/export/${type}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      if (type === 'project-zip') {
        a.download = 'medical-equipment-system.zip';
      } else {
        const filename = type === 'equipment' ? 'الأجهزة_الطبية.xlsx' :
                        type === 'maintenance' ? 'سجلات_الصيانة.xlsx' :
                        'تقارير_الأعطال.xlsx';
        a.download = filename;
      }
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "نجح التصدير",
        description: type === 'project-zip' ? "تم تحميل ملف المشروع كاملاً" : "تم تحميل الملف بنجاح",
      });
    } catch (error) {
      toast({
        title: "فشل التصدير",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (type: 'equipment' | 'maintenance') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/import/${type}`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Import failed');
        const result = await response.json();

        toast({
          title: "نجح الاستيراد",
          description: `تم استيراد ${result.imported || 0} عنصر بنجاح`,
        });
      } catch (error) {
        toast({
          title: "فشل الاستيراد",
          description: "حدث خطأ أثناء استيراد البيانات",
          variant: "destructive",
        });
      }
    };
    input.click();
  };

  const handleDriveBackup = async () => {
    try {
      setIsBackingUp(true);
      await apiRequest('/api/drive/backup', { method: 'POST' });
      
      toast({
        title: "نجحت النسخة الاحتياطية",
        description: "تم رفع البيانات إلى Google Drive بنجاح",
      });
    } catch (error) {
      toast({
        title: "فشلت النسخة الاحتياطية",
        description: "تأكد من إعداد مفاتيح Google Drive API",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleSheetsConnection = async () => {
    try {
      setIsConnectingSheets(true);
      const input = document.getElementById('sheets-url') as HTMLInputElement;
      const sheetsUrl = input?.value;

      if (!sheetsUrl) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال رابط Google Sheets",
          variant: "destructive",
        });
        return;
      }

      await apiRequest('/api/admin/connect-sheets', {
        method: 'POST',
        body: JSON.stringify({
          sheetsUrl,
          userId: user?.id
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast({
        title: "تم الربط بنجاح",
        description: "تم ربط Google Sheets بقاعدة البيانات",
      });
      
      input.value = '';
    } catch (error) {
      toast({
        title: "فشل الربط",
        description: "تأكد من صحة رابط Google Sheets وصلاحياتك",
        variant: "destructive",
      });
    } finally {
      setIsConnectingSheets(false);
    }
  };

  const handleDatabaseUpdate = async () => {
    try {
      setIsUpdatingDatabase(true);
      const input = document.getElementById('database-url') as HTMLInputElement;
      const newDbUrl = input?.value;

      if (!newDbUrl) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال رابط قاعدة البيانات",
          variant: "destructive",
        });
        return;
      }

      await apiRequest('/api/admin/update-database', {
        method: 'POST',
        body: JSON.stringify({
          databaseUrl: newDbUrl,
          userId: user?.id
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث رابط قاعدة البيانات وملف البيئة. سيتم إعادة تشغيل النظام خلال 3 ثوانٍ",
      });
      
      input.value = '';
      
      // Show countdown and reload
      let countdown = 3;
      const countdownInterval = setInterval(() => {
        toast({
          title: `إعادة التشغيل خلال ${countdown} ثانية`,
          description: "يرجى الانتظار...",
        });
        countdown--;
        if (countdown <= 0) {
          clearInterval(countdownInterval);
          window.location.reload();
        }
      }, 1000);
      
    } catch (error) {
      toast({
        title: "فشل التحديث",
        description: "تأكد من صحة رابط قاعدة البيانات",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingDatabase(false);
    }
  };

  const fetchCurrentDbInfo = async () => {
    try {
      const response = await apiRequest('/api/admin/database-info');
      setCurrentDbUrl(response.databaseUrl || "غير محدد");
    } catch (error) {
      console.log("Could not fetch database info");
    }
  };

  // Fetch current database info on component mount
  React.useEffect(() => {
    if (user?.id === 999) {
      fetchCurrentDbInfo();
    }
  }, [user]);



  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl" dir="rtl">
      <div className="flex items-center justify-between mb-2">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
          <p className="text-muted-foreground">
            إدارة النظام والبيانات ونسخ احتياطية
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">مدير النظام</Badge>
          <LogoutButton />
        </div>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            تصدير البيانات
          </CardTitle>
          <CardDescription>
            تحميل البيانات بصيغة Excel أو تحميل المشروع كاملاً
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => handleExport('equipment')}
            disabled={isExporting}
            variant="outline"
            className="h-20 flex flex-col gap-2"
          >
            <Settings className="h-6 w-6" />
            الأجهزة الطبية
          </Button>
          
          <Button
            onClick={() => handleExport('maintenance')}
            disabled={isExporting}
            variant="outline"
            className="h-20 flex flex-col gap-2"
          >
            <FileText className="h-6 w-6" />
            سجلات الصيانة
          </Button>
          
          <Button
            onClick={() => handleExport('faults')}
            disabled={isExporting}
            variant="outline"
            className="h-20 flex flex-col gap-2"
          >
            <Database className="h-6 w-6" />
            تقارير الأعطال
          </Button>
          
          <Button
            onClick={() => handleExport('project-zip')}
            disabled={isExporting}
            variant="default"
            className="h-20 flex flex-col gap-2"
          >
            <Package className="h-6 w-6" />
            المشروع كاملاً
            <Badge variant="secondary" className="text-xs">
              ZIP
            </Badge>
          </Button>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            استيراد البيانات
          </CardTitle>
          <CardDescription>
            رفع ملفات Excel لإضافة بيانات جديدة إلى النظام
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => handleImport('equipment')}
            variant="outline"
            className="h-16 flex flex-col gap-2"
          >
            <Settings className="h-5 w-5" />
            استيراد الأجهزة
          </Button>
          
          <Button
            onClick={() => handleImport('maintenance')}
            variant="outline"
            className="h-16 flex flex-col gap-2"
          >
            <FileText className="h-5 w-5" />
            استيراد سجلات الصيانة
          </Button>
        </CardContent>
      </Card>

      {/* Google Drive Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Google Drive
          </CardTitle>
          <CardDescription>
            نسخ احتياطية تلقائية وإدارة التخزين السحابي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">النسخ الاحتياطي التلقائي</h3>
              <p className="text-sm text-muted-foreground">
                يتم إنشاء نسخة احتياطية كل ساعة تلقائياً
              </p>
            </div>
            <Badge variant="default">نشط</Badge>
          </div>
          
          <Button
            onClick={handleDriveBackup}
            disabled={isBackingUp}
            className="w-full md:w-auto"
          >
            <HardDrive className="h-4 w-4 mr-2" />
            {isBackingUp ? "جاري الرفع..." : "إنشاء نسخة احتياطية الآن"}
          </Button>

          {/* Google Sheets Connection - Admin Only */}
          {user?.id === 999 && (
            <div className="mt-6 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                ربط Google Sheets
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                ربط قاعدة البيانات مع جداول Google Sheets للمزامنة التلقائية
              </p>
              <div className="space-y-3">
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  id="sheets-url"
                />
                <Button
                  onClick={handleSheetsConnection}
                  disabled={isConnectingSheets}
                  variant="outline"
                  className="w-full"
                >
                  {isConnectingSheets ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الربط...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      ربط Google Sheets
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Database Configuration - Admin Only */}
          {user?.id === 999 && (
            <div className="mt-6 p-4 border rounded-lg bg-red-50 dark:bg-red-950">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Database className="h-4 w-4" />
                إعدادات قاعدة البيانات
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                تغيير مكان قاعدة البيانات PostgreSQL
              </p>
              
              <div className="space-y-3">
                <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  <strong>قاعدة البيانات الحالية:</strong>
                  <br />
                  <span className="font-mono text-xs break-all">
                    {currentDbUrl || "جاري التحميل..."}
                  </span>
                </div>
                
                <input
                  type="url"
                  placeholder="postgresql://user:password@host:port/database"
                  className="w-full px-3 py-2 border rounded-md text-sm font-mono"
                  id="database-url"
                />
                
                <Button
                  onClick={handleDatabaseUpdate}
                  disabled={isUpdatingDatabase}
                  variant="destructive"
                  className="w-full"
                >
                  {isUpdatingDatabase ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري التحديث...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      تحديث قاعدة البيانات
                    </>
                  )}
                </Button>
              </div>
              
              <div className="mt-3 text-xs text-red-600 dark:text-red-400">
                ⚠️ تحذير: تأكد من صحة البيانات قبل التحديث. سيتم إعادة تشغيل النظام وتحديث ملف البيئة.
              </div>
              
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                💡 نصيحة: احتفظ بنسخة احتياطية من رابط قاعدة البيانات الحالية قبل التحديث
                <br />
                📖 راجع ملف DATABASE_ADMIN_GUIDE.md للتفاصيل الكاملة
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات النظام</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>إصدار النظام:</span>
            <Badge variant="outline">1.0.0</Badge>
          </div>
          <div className="flex justify-between">
            <span>قاعدة البيانات:</span>
            <Badge variant="default">PostgreSQL</Badge>
          </div>
          <div className="flex justify-between">
            <span>التخزين السحابي:</span>
            <Badge variant="default">Google Drive</Badge>
          </div>
          <div className="flex justify-between">
            <span>النظام:</span>
            <Badge variant="secondary">مجاني ومفتوح المصدر</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}