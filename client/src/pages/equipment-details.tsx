import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Settings, 
  Wrench,
  ClipboardList,
  Plus,
  X
} from "lucide-react";

export default function EquipmentDetails() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState({
    type: "corrective",
    description: "",
    notes: "",
  });
  const [noteData, setNoteData] = useState({
    note: "",
    type: "general",
    priority: "low",
  });

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['/api/equipment', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/equipment/${params.id}`);
      if (!response.ok) throw new Error('Equipment not found');
      return response.json();
    },
  });

  const { data: maintenanceRecords = [] } = useQuery({
    queryKey: ['/api/maintenance-records', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/maintenance-records?equipmentId=${params.id}`);
      return response.json();
    },
  });

  const { data: equipmentNotes = [] } = useQuery({
    queryKey: ['/api/equipment', params.id, 'notes'],
    queryFn: async () => {
      const response = await fetch(`/api/equipment/${params.id}/notes`);
      return response.json();
    },
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/maintenance-records", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance-records'] });
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
      toast({
        title: "تم إضافة سجل الصيانة",
        description: "تم حفظ معلومات الصيانة بنجاح",
      });
      setShowMaintenanceForm(false);
      setMaintenanceData({ type: "corrective", description: "", notes: "" });
    },
    onError: () => {
      toast({
        title: "خطأ في إضافة الصيانة",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PATCH", `/api/equipment/${params.id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
      toast({
        title: "تم تحديث حالة الجهاز",
        description: "تم تغيير حالة الجهاز بنجاح",
      });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/equipment/${params.id}/notes`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipment', params.id, 'notes'] });
      toast({
        title: "تم إضافة الملاحظة",
        description: "تم حفظ الملاحظة بنجاح",
      });
      setShowNotesForm(false);
      setNoteData({ note: "", type: "general", priority: "low" });
    },
    onError: () => {
      toast({
        title: "خطأ في إضافة الملاحظة",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const handleMaintenanceSubmit = () => {
    if (!maintenanceData.description.trim()) {
      toast({
        title: "يرجى ملء الوصف",
        description: "وصف الصيانة مطلوب",
        variant: "destructive",
      });
      return;
    }

    createMaintenanceMutation.mutate({
      equipmentId: parseInt(params.id!),
      technicianId: 3, // Mock technician ID
      type: maintenanceData.type,
      description: maintenanceData.description,
      notes: maintenanceData.notes,
      startDate: new Date().toISOString(),
      status: "completed",
      completionDate: new Date().toISOString(),
    });
  };

  const handleNoteSubmit = () => {
    if (!noteData.note.trim()) {
      toast({
        title: "يرجى كتابة الملاحظة",
        description: "نص الملاحظة مطلوب",
        variant: "destructive",
      });
      return;
    }

    createNoteMutation.mutate({
      note: noteData.note.trim(),
      type: noteData.type,
      priority: noteData.priority,
      createdBy: 3, // Mock user ID
    });
  };

  if (isLoading) {
    return (
      <div className="medical-container">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="medical-container">
        <div className="p-4 text-center">
          <p className="text-gray-600">لم يتم العثور على الجهاز</p>
          <Button onClick={() => setLocation("/")} className="mt-4">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="status-operational">تعمل بشكل طبيعي</Badge>;
      case 'maintenance':
        return <Badge className="status-maintenance">تحت الصيانة</Badge>;
      case 'out_of_service':
        return <Badge className="status-out-of-service">خارج الخدمة</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="medical-container">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="ml-2"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">تفاصيل الجهاز</h1>
        </div>
      </div>

      <div className="p-4">
        {/* Equipment Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{equipment.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{equipment.model}</p>
                <p className="text-xs text-gray-500 mt-1">الشركة المصنعة: {equipment.manufacturer}</p>
              </div>
              {getStatusBadge(equipment.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <span className="material-icons text-gray-400 ml-2 text-lg no-flip">qr_code</span>
                <div>
                  <p className="text-gray-600">كود الجهاز</p>
                  <p className="font-medium number">{equipment.barcode}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="text-gray-400 ml-2 w-4 h-4" />
                <div>
                  <p className="text-gray-600">الموقع</p>
                  <p className="font-medium">{equipment.location}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <span className="material-icons text-gray-400 ml-2 text-lg no-flip">business</span>
                <div>
                  <p className="text-gray-600">القسم</p>
                  <p className="font-medium">{equipment.department}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="text-gray-400 ml-2 w-4 h-4" />
                <div>
                  <p className="text-gray-600">آخر صيانة</p>
                  <p className="font-medium number">
                    {equipment.lastMaintenanceDate 
                      ? new Date(equipment.lastMaintenanceDate).toLocaleDateString('ar-SA')
                      : "غير محدد"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-6">
              <Button
                onClick={() => setShowMaintenanceForm(true)}
                className="btn-medical text-sm"
              >
                <Plus className="w-4 h-4 ml-1" />
                إضافة صيانة
              </Button>
              
              <Button
                onClick={() => setShowNotesForm(true)}
                variant="outline"
                className="text-sm"
              >
                <Plus className="w-4 h-4 ml-1" />
                إضافة ملاحظة
              </Button>
              
              <Button
                onClick={() => updateStatusMutation.mutate(
                  equipment.status === 'operational' ? 'maintenance' : 'operational'
                )}
                variant="outline"
                disabled={updateStatusMutation.isPending}
                className="text-sm"
              >
                <Settings className="w-4 h-4 ml-1" />
                {equipment.status === 'operational' ? 'بدء صيانة' : 'إنهاء صيانة'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for detailed information */}
        <Tabs defaultValue="maintenance" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="maintenance">سجل الصيانة</TabsTrigger>
            <TabsTrigger value="notes">الملاحظات</TabsTrigger>
            <TabsTrigger value="specifications">المواصفات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="maintenance" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Wrench className="w-5 h-5 ml-2" />
                  سجل الصيانة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {maintenanceRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">لا توجد سجلات صيانة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {maintenanceRecords.map((record: any) => (
                      <div key={record.id} className="border-r-4 border-blue-500 pr-4 py-2">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{record.description}</h4>
                          <Badge variant="outline" className="text-xs">
                            {record.type === 'preventive' ? 'وقائية' : 
                             record.type === 'corrective' ? 'إصلاحية' : 'طارئة'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{record.notes}</p>
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                          <span>{record.technician?.name}</span>
                          <span className="number">
                            {new Date(record.startDate).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <ClipboardList className="w-5 h-5 ml-2" />
                  الملاحظات والتنبيهات
                </CardTitle>
              </CardHeader>
              <CardContent>
                {equipmentNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">لا توجد ملاحظات</p>
                    <Button
                      onClick={() => setShowNotesForm(true)}
                      className="mt-3 btn-medical"
                      size="sm"
                    >
                      إضافة أول ملاحظة
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {equipmentNotes.map((note: any) => {
                      const getNotePriorityColor = (priority: string) => {
                        switch (priority) {
                          case 'high':
                            return 'border-r-[var(--urgent-red)]';
                          case 'medium':
                            return 'border-r-[var(--warning-orange)]';
                          case 'low':
                            return 'border-r-[var(--success-green)]';
                          default:
                            return 'border-r-gray-300';
                        }
                      };

                      const getNoteTypeIcon = (type: string) => {
                        switch (type) {
                          case 'issue':
                            return '⚠️';
                          case 'maintenance':
                            return '🔧';
                          case 'warning':
                            return '⚡';
                          default:
                            return '📝';
                        }
                      };

                      return (
                        <div key={note.id} className={`border-r-4 ${getNotePriorityColor(note.priority)} bg-gray-50 p-4 rounded-lg`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <span className="text-lg">{getNoteTypeIcon(note.type)}</span>
                              <Badge variant="outline" className="text-xs">
                                {note.type === 'general' ? 'عام' :
                                 note.type === 'issue' ? 'مشكلة' :
                                 note.type === 'maintenance' ? 'صيانة' : 'تحذير'}
                              </Badge>
                              <Badge variant={note.priority === 'high' ? 'destructive' : 
                                             note.priority === 'medium' ? 'default' : 'secondary'} 
                                     className="text-xs">
                                {note.priority === 'high' ? 'عالي' :
                                 note.priority === 'medium' ? 'متوسط' : 'منخفض'}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-500 number">
                              {new Date(note.createdAt).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                          <p className="text-gray-800 mb-2">{note.note}</p>
                          <div className="text-xs text-gray-600">
                            بواسطة: {note.createdByUser?.name || 'غير محدد'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Settings className="w-5 h-5 ml-2" />
                  المواصفات التقنية
                </CardTitle>
              </CardHeader>
              <CardContent>
                {equipment.specifications ? (
                  <div className="space-y-3">
                    {Object.entries(equipment.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium number">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">لا توجد مواصفات متاحة</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Maintenance Form Modal */}
        {showMaintenanceForm && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50">
            <div className="bg-white w-full max-h-[80vh] rounded-t-xl p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">إضافة سجل صيانة</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMaintenanceForm(false)}
                >
                  <span className="material-icons">close</span>
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="maintenance-type">نوع الصيانة</Label>
                  <select
                    id="maintenance-type"
                    value={maintenanceData.type}
                    onChange={(e) => setMaintenanceData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-2 border border-gray-200 rounded-lg mt-1"
                  >
                    <option value="corrective">إصلاحية</option>
                    <option value="preventive">وقائية</option>
                    <option value="emergency">طارئة</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="maintenance-description">وصف الصيانة *</Label>
                  <Textarea
                    id="maintenance-description"
                    value={maintenanceData.description}
                    onChange={(e) => setMaintenanceData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="اكتب تفاصيل الصيانة..."
                    className="mt-1 h-24"
                  />
                </div>

                <div>
                  <Label htmlFor="maintenance-notes">ملاحظات إضافية</Label>
                  <Textarea
                    id="maintenance-notes"
                    value={maintenanceData.notes}
                    onChange={(e) => setMaintenanceData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="ملاحظات اختيارية..."
                    className="mt-1 h-20"
                  />
                </div>

                <div className="flex space-x-3 space-x-reverse pt-4">
                  <Button
                    onClick={handleMaintenanceSubmit}
                    disabled={createMaintenanceMutation.isPending}
                    className="flex-1 btn-medical"
                  >
                    {createMaintenanceMutation.isPending ? "جاري الحفظ..." : "حفظ الصيانة"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowMaintenanceForm(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes Form Modal */}
        {showNotesForm && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50">
            <div className="bg-white w-full max-h-[80vh] rounded-t-xl p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">إضافة ملاحظة</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotesForm(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="note-type">نوع الملاحظة</Label>
                  <select
                    id="note-type"
                    value={noteData.type}
                    onChange={(e) => setNoteData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-2 border border-gray-200 rounded-lg mt-1"
                  >
                    <option value="general">عام</option>
                    <option value="issue">مشكلة</option>
                    <option value="maintenance">صيانة</option>
                    <option value="warning">تحذير</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="note-priority">الأولوية</Label>
                  <select
                    id="note-priority"
                    value={noteData.priority}
                    onChange={(e) => setNoteData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full p-2 border border-gray-200 rounded-lg mt-1"
                  >
                    <option value="low">منخفض</option>
                    <option value="medium">متوسط</option>
                    <option value="high">عالي</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="note-text">نص الملاحظة *</Label>
                  <Textarea
                    id="note-text"
                    value={noteData.note}
                    onChange={(e) => setNoteData(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="اكتب الملاحظة هنا..."
                    className="mt-1 h-32"
                  />
                </div>

                <div className="flex space-x-3 space-x-reverse pt-4">
                  <Button
                    onClick={handleNoteSubmit}
                    disabled={createNoteMutation.isPending}
                    className="flex-1 btn-medical"
                  >
                    {createNoteMutation.isPending ? "جاري الحفظ..." : "حفظ الملاحظة"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNotesForm(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
