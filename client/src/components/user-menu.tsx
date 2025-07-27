import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, User, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserMenuProps {
  user: {
    name: string;
    role: string;
    department: string;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [, setLocation] = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    toast({
      title: "تم تسجيل الخروج",
      description: "نراك قريباً",
    });
    
    setLocation('/login');
    window.location.reload();
  };

  const getRoleText = (role: string) => {
    return role === 'technician' ? 'فني أجهزة طبية' : 'ممرض/ممرضة';
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 space-x-reverse"
      >
        <User className="w-4 h-4" />
        <span className="text-sm">{user.name}</span>
      </Button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          <Card className="absolute right-0 top-full mt-2 w-64 z-50 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="border-b pb-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{getRoleText(user.role)}</p>
                  <p className="text-xs text-gray-500">{user.department}</p>
                </div>
                
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}