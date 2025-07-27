import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar
} from "lucide-react";
import LogoutButton from "@/components/logout-button";

export default function DailyChecklist() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [checkStatus, setCheckStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDate] = useState(new Date());

  const { data: equipment = [], isLoading: equipmentLoading } = useQuery({
    queryKey: ['/api/equipment'],
  });

  const { data: todayChecks = [] } = useQuery({
    queryKey: ['/api/daily-checks', selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/daily-checks?date=${dateStr}`);
      return response.json();
    },
  });

  const createCheckMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/daily-checks", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-checks'] });
      toast({
        title: "تم حفظ الفحص",
        description: "تم إضافة نتيجة الفحص اليومي",
      });
      setSelectedEquipment(null);
      setCheckStatus("");
      setNotes("");
    },
    onError: () => {
      toast({
        title: "خطأ في حفظ الفحص",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const handleSubmitCheck = () => {
    if (!selectedEquipment || !checkStatus) {
      toast({
        title: "يرجى إكمال البيانات",
        description: "اختر الجهاز وحالة الفحص",
        variant: "destructive",
      });
      return;
    }

    createCheckMutation.mutate({
      equipmentId: selectedEquipment.id,
      technicianId: 3, // Mock technician ID
      checkDate: selectedDate.toISOString(),
      status: checkStatus,
      notes: notes.trim() || null,
    });
  };

  // Group equipment by department
  const equipmentByDepartment = equipment.reduce((acc: any, eq: any) => {
    if (!acc[eq.department]) {
      acc[eq.department] = [];
    }
    acc[eq.department].push(eq);
    return acc;
  }, {});

  // Get checked equipment IDs for today
  const checkedEquipmentIds = new Set(todayChecks.map((check: any) => check.equipmentId));

  const getCheckStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="status-operational">سليم</Badge>;
      case 'fail':
        return <Badge className="status-out-of-service">معطل</Badge>;
      case 'needs_attention':
        return <Badge className="status-maintenance">يحتاج انتباه</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-[var(--success-green)]" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-[var(--urgent-red)]" />;
      case 'needs_attention':
        return <AlertTriangle className="w-5 h-5 text-[var(--warning-orange)]" />;
      default:
        return null;
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
          <h1 className="text-lg font-semibold">المرور اليومي</h1>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 ml-2" />
          <span className="number">{selectedDate.toLocaleDateString('ar-SA')}</span>
        </div>
      </div>

      <div className="p-4">
        {/* Progress Summary */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-[var(--success-green)] number">
                  {todayChecks.filter((c: any) => c.status === 'pass').length}
                </div>
                <div className="text-xs text-gray-600">سليم</div>
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--warning-orange)] number">
                  {todayChecks.filter((c: any) => c.status === 'needs_attention').length}
                </div>
                <div className="text-xs text-gray-600">يحتاج انتباه</div>
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--urgent-red)] number">
                  {todayChecks.filter((c: any) => c.status === 'fail').length}
                </div>
                <div className="text-xs text-gray-600">معطل</div>
              </div>
            </div>
            
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div
                className="bg-[var(--medical-blue)] h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${equipment.length > 0 ? (todayChecks.length / equipment.length) * 100 : 0}%`
                }}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-600 mt-2 number">
              {todayChecks.length} من {equipment.length} تم فحصه
            </div>
          </CardContent>
        </Card>

        {/* Equipment by Department */}
        {equipmentLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(equipmentByDepartment).map(([department, deptEquipment]: [string, any]) => (
              <Card key={department}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{department}</CardTitle>
                  <div className="text-sm text-gray-600 number">
                    {(deptEquipment as any[]).filter(eq => checkedEquipmentIds.has(eq.id)).length} / {(deptEquipment as any[]).length} تم فحصه
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(deptEquipment as any[]).map((eq) => {
                      const todayCheck = todayChecks.find((check: any) => check.equipmentId === eq.id);
                      const isChecked = !!todayCheck;
                      
                      return (
                        <div
                          key={eq.id}
                          className={`p-3 border rounded-lg transition-all duration-200 ${
                            isChecked 
                              ? 'bg-gray-50 border-gray-200' 
                              : 'bg-white border-gray-200 hover:border-[var(--medical-blue)] cursor-pointer'
                          }`}
                          onClick={() => !isChecked && setSelectedEquipment(eq)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{eq.name}</h4>
                              <p className="text-sm text-gray-600">{eq.location}</p>
                              <p className="text-xs text-gray-500 number">{eq.barcode}</p>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              {isChecked ? (
                                <>
                                  {getStatusIcon(todayCheck.status)}
                                  {getCheckStatusBadge(todayCheck.status)}
                                </>
                              ) : (
                                <Badge variant="outline" className="text-gray-500">
                                  لم يتم الفحص
                                </Badge>
                              )}
                            </div>
                          </div>
                          {todayCheck?.notes && (
                            <p className="text-xs text-gray-600 mt-2 bg-white p-2 rounded">
                              {todayCheck.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Check Form Modal */}
        {selectedEquipment && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50">
            <div className="bg-white w-full max-h-[80vh] rounded-t-xl p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">فحص الجهاز</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedEquipment(null)}
                >
                  <span className="material-icons">close</span>
                </Button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{selectedEquipment.name}</h4>
                <p className="text-sm text-gray-600">{selectedEquipment.location}</p>
                <p className="text-xs text-gray-500 number">{selectedEquipment.barcode}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    نتيجة الفحص
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setCheckStatus("pass")}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        checkStatus === "pass"
                          ? "border-[var(--success-green)] bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <CheckCircle className="text-[var(--success-green)] mx-auto w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">سليم</span>
                    </button>
                    
                    <button
                      onClick={() => setCheckStatus("needs_attention")}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        checkStatus === "needs_attention"
                          ? "border-[var(--warning-orange)] bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <AlertTriangle className="text-[var(--warning-orange)] mx-auto w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">يحتاج انتباه</span>
                    </button>
                    
                    <button
                      onClick={() => setCheckStatus("fail")}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        checkStatus === "fail"
                          ? "border-[var(--urgent-red)] bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <XCircle className="text-[var(--urgent-red)] mx-auto w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">معطل</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات (اختياري)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أضف أي ملاحظات حول حالة الجهاز..."
                    className="h-20"
                  />
                </div>

                <div className="flex space-x-3 space-x-reverse pt-4">
                  <Button
                    onClick={handleSubmitCheck}
                    disabled={createCheckMutation.isPending || !checkStatus}
                    className="flex-1 btn-medical"
                  >
                    {createCheckMutation.isPending ? "جاري الحفظ..." : "حفظ الفحص"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedEquipment(null)}
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
