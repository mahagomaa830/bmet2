import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AppHeader from "@/components/app-header";
import BarcodeScanner from "@/components/barcode-scanner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { QrCodeIcon, CheckCircle, Clock, AlertTriangle, AlertCircle } from "lucide-react";
import LogoutButton from "@/components/logout-button";

interface ScannedEquipment {
  id: number;
  name: string;
  barcode: string;
  department: string;
  location: string;
}

export default function NursingReport() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showScanner, setShowScanner] = useState(false);
  const [scannedEquipment, setScannedEquipment] = useState<ScannedEquipment | null>(null);
  const [description, setDescription] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");

  const createReportMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/fault-reports", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fault-reports'] });
      toast({
        title: "تم إرسال البلاغ بنجاح",
        description: "سيصل البلاغ إلى فريق الصيانة فوراً",
      });
      // Reset form
      setScannedEquipment(null);
      setDescription("");
      setSelectedPriority("");
    },
    onError: () => {
      toast({
        title: "خطأ في إرسال البلاغ",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const handleScan = async (barcode: string) => {
    try {
      const response = await fetch(`/api/equipment/barcode/${barcode}`);
      if (response.ok) {
        const equipment = await response.json();
        setScannedEquipment(equipment);
        setShowScanner(false);
      } else {
        toast({
          title: "لم يتم العثور على الجهاز",
          description: "تأكد من صحة الباركود",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في قراءة الباركود",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = () => {
    if (!scannedEquipment || !selectedPriority || !description.trim()) {
      toast({
        title: "يرجى إكمال جميع الخطوات",
        description: "تأكد من مسح الجهاز وملء الوصف واختيار الأولوية",
        variant: "destructive",
      });
      return;
    }

    createReportMutation.mutate({
      equipmentId: scannedEquipment.id,
      reportedBy: 1, // Mock user ID - in real app, get from auth context
      title: `عطل في ${scannedEquipment.name}`,
      description: description.trim(),
      priority: selectedPriority,
      status: "open",
    });
  };

  const priorities = [
    {
      id: "low",
      label: "غير عاجل",
      icon: Clock,
      color: "text-[var(--success-green)]",
      bgColor: "bg-green-50 border-green-200 hover:border-green-300",
    },
    {
      id: "medium",
      label: "متوسط",
      icon: AlertTriangle,
      color: "text-[var(--warning-orange)]",
      bgColor: "bg-orange-50 border-orange-200 hover:border-orange-300",
    },
    {
      id: "high",
      label: "عاجل",
      icon: AlertCircle,
      color: "text-[var(--urgent-red)]",
      bgColor: "bg-red-50 border-red-200 hover:border-red-300",
    },
  ];

  return (
    <div className="medical-container">
      <AppHeader currentMode="nursing" />

      <main className="p-4">
        <div className="text-center mb-8">
          <span className="material-icons text-6xl text-[var(--medical-blue)] mb-4 block no-flip">
            report_problem
          </span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">الإبلاغ عن عطل</h2>
          <p className="text-gray-600">اتبع الخطوات أدناه للإبلاغ عن مشكلة في أحد الأجهزة</p>
        </div>

        {/* Step 1: Scan Equipment */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-[var(--medical-blue)] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold number ml-3">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-800">مسح باركود الجهاز</h3>
            </div>

            {!scannedEquipment ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-4">ضع كاميرا الهاتف على باركود الجهاز</p>
                <Button
                  onClick={() => setShowScanner(true)}
                  className="btn-medical"
                >
                  بدء المسح
                </Button>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="text-[var(--success-green)] ml-2 w-5 h-5" />
                  <span className="text-[var(--success-green)] font-medium">تم مسح الجهاز بنجاح</span>
                </div>
                <h4 className="font-medium text-gray-800">{scannedEquipment.name}</h4>
                <p className="text-sm text-gray-600">{scannedEquipment.department} - {scannedEquipment.location}</p>
                <p className="text-xs text-gray-500 number">كود الجهاز: {scannedEquipment.barcode}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Describe Problem */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-[var(--medical-blue)] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold number ml-3">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-800">وصف المشكلة</h3>
            </div>

            <Textarea
              placeholder="اكتب وصفاً مختصراً للمشكلة..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none h-24 mb-4"
            />

            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">درجة الأهمية</label>
              <div className="grid grid-cols-3 gap-2">
                {priorities.map((priority) => {
                  const Icon = priority.icon;
                  const isSelected = selectedPriority === priority.id;
                  
                  return (
                    <button
                      key={priority.id}
                      onClick={() => setSelectedPriority(priority.id)}
                      className={`p-3 border-2 rounded-lg text-center transition-all duration-200 ${
                        isSelected
                          ? priority.bgColor
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Icon className={`${priority.color} mx-auto w-6 h-6 mb-1`} />
                      <span className="text-xs font-medium">{priority.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Submit Report */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-[var(--medical-blue)] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold number ml-3">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-800">إرسال البلاغ</h3>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">معلومات المبلغ:</p>
              <div className="flex justify-between items-center">
                <span className="font-medium">فاطمة أحمد</span>
                <span className="text-sm text-gray-500">قسم العناية المركزة</span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createReportMutation.isPending}
              className="w-full btn-medical py-4 text-lg font-semibold ripple"
            >
              {createReportMutation.isPending ? "جاري الإرسال..." : "إرسال البلاغ إلى الفنيين"}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => setLocation("/technician")}
            className="text-[var(--medical-blue)]"
          >
            العودة إلى تطبيق الفنيين
          </Button>
        </div>
      </main>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={handleScan}
        />
      )}
    </div>
  );
}
