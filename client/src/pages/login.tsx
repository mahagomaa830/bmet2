import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { UserCheck, Lock, Stethoscope, UserPlus } from "lucide-react";

interface LoginProps {
  onRegister: () => void;
  onSuccess: (user: any) => void;
}

export default function Login({ onRegister, onSuccess }: LoginProps) {
  const [credentials, setCredentials] = useState({
    name: "",
    password: "",
  });
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: typeof credentials) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${data.user.name}`,
      });

      onSuccess(data.user);
    },
    onError: () => {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "المستخدم غير موجود، يرجى التحقق من البيانات",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.name || !credentials.password) {
      toast({
        title: "بيانات مطلوبة",
        description: "يرجى إدخال الاسم وكلمة المرور",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(credentials);
  };

  const handleDemoLogin = (role: 'technician' | 'nurse' | 'admin') => {
    const demoCredentials = {
      technician: { name: "فني الأجهزة", password: "123456" },
      nurse: { name: "ممرضة القسم", password: "123456" },
      admin: { name: "admin", password: "admin" }
    };
    
    setCredentials(demoCredentials[role]);
    loginMutation.mutate(demoCredentials[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-medical-blue rounded-full flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">نظام إدارة الأجهزة الطبية</h1>
          <p className="text-gray-600 mt-2">تسجيل الدخول للوصول إلى النظام</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">تسجيل الدخول</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">اسم المستخدم</Label>
                <Input
                  id="name"
                  type="text"
                  value={credentials.name}
                  onChange={(e) => setCredentials(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="أدخل اسم المستخدم"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="أدخل كلمة المرور"
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full btn-medical"
              >
                {loginMutation.isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={onRegister}
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  <UserPlus className="w-4 h-4 ml-2" />
                  إنشاء حساب جديد
                </Button>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 text-center mb-3">تسجيل دخول تجريبي:</p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDemoLogin('technician')}
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    <UserCheck className="w-4 h-4 ml-2" />
                    فني أجهزة طبية
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDemoLogin('nurse')}
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    <Lock className="w-4 h-4 ml-2" />
                    ممرض/ممرضة
                  </Button>
                  
                  <Button
                    variant="default"
                    onClick={() => handleDemoLogin('admin')}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loginMutation.isPending}
                  >
                    <UserCheck className="w-4 h-4 ml-2" />
                    مدير رئيسي
                  </Button>
                </div>
                
                <div className="mt-3 text-xs text-gray-500 text-center">
                  المدير الرئيسي له صلاحيات خاصة لربط Google Sheets
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-500 text-center">
          جميع البيانات محمية ومشفرة وفقاً لمعايير الأمان الطبي
        </p>
      </div>
    </div>
  );
}