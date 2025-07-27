import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowRight, UserPlus, Stethoscope } from "lucide-react";

interface RegisterProps {
  onBack: () => void;
  onSuccess: (user: any) => void;
}

export default function Register({ onBack, onSuccess }: RegisterProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    department: "",
  });
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast({
        title: "تم التسجيل بنجاح",
        description: `مرحباً ${data.user.name}، تم إنشاء حسابك بنجاح`,
      });

      onSuccess(data.user);
    },
    onError: () => {
      toast({
        title: "خطأ في التسجيل",
        description: "حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.password || !formData.role || !formData.department) {
      toast({
        title: "بيانات مطلوبة",
        description: "يرجى إدخال الاسم وكلمة المرور والدور والقسم",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(formData);
  };

  const departments = [
    "العناية المركزة",
    "الطوارئ", 
    "الجراحة",
    "الأطفال",
    "النساء والولادة",
    "القلب",
    "الأشعة",
    "المختبر",
    "الصيدلية",
    "الصيانة"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-medical-blue rounded-full flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">نظام إدارة الأجهزة الطبية</h1>
          <p className="text-gray-600 mt-2">إنشاء حساب جديد</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5" />
              تسجيل مستخدم جديد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">الاسم الكامل *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="أدخل الاسم الكامل"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="أدخل البريد الإلكتروني (اختياري)"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="أدخل رقم الهاتف (اختياري)"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">كلمة المرور *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="أدخل كلمة المرور"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="role">الدور الوظيفي *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر الدور الوظيفي" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technician">فني أجهزة طبية</SelectItem>
                    <SelectItem value="nurse">ممرض/ممرضة</SelectItem>
                    <SelectItem value="admin">مدير النظام</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">القسم *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full btn-medical"
              >
                {registerMutation.isPending ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-sm"
                disabled={registerMutation.isPending}
              >
                <ArrowRight className="w-4 h-4 ml-1" />
                العودة لتسجيل الدخول
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-500 text-center">
          * البيانات المطلوبة
        </p>
      </div>
    </div>
  );
}