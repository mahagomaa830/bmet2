import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import LogoutButton from "@/components/logout-button";

interface AppHeaderProps {
  currentMode: "technician" | "nursing";
}

export default function AppHeader({ currentMode }: AppHeaderProps) {
  const [, setLocation] = useLocation();
  const [notificationCount] = useState(3); // Mock notification count

  const switchMode = (mode: "technician" | "nursing") => {
    setLocation(mode === "technician" ? "/technician" : "/nursing");
  };

  return (
    <header className="medical-header">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <span className="material-icons text-2xl no-flip">medical_services</span>
          <h1 className="text-lg font-semibold">إدارة الأجهزة الطبية</h1>
        </div>
        
        {/* Notification and Logout */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-white hover:bg-blue-600">
              <Bell className="w-6 h-6" />
          </Button>
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-[var(--urgent-red)] text-white text-xs w-5 h-5 flex items-center justify-center number">
              {notificationCount}
            </Badge>
          )}
        </div>
        
          <LogoutButton 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-blue-600 border-white/20"
          />
        </div>
      </div>
      
      {/* App Mode Selector */}
      <div className="flex bg-blue-800 rounded-lg p-1">
        <Button
          onClick={() => switchMode("technician")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
            currentMode === "technician"
              ? "bg-white text-[var(--medical-blue)]"
              : "text-white hover:bg-blue-700"
          }`}
          variant="ghost"
        >
          تطبيق الفنيين
        </Button>
        <Button
          onClick={() => switchMode("nursing")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
            currentMode === "nursing"
              ? "bg-white text-[var(--medical-blue)]"
              : "text-white hover:bg-blue-700"
          }`}
          variant="ghost"
        >
          تطبيق التمريض
        </Button>
      </div>
    </header>
  );
}
