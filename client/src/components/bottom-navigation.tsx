import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  ClipboardList, 
  CheckCircle, 
  BarChart3 
} from "lucide-react";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    {
      id: "home",
      label: "الرئيسية",
      icon: Home,
      path: "/",
      active: location === "/" || location === "/technician"
    },
    {
      id: "reports",
      label: "البلاغات",
      icon: ClipboardList,
      path: "/reports",
      active: location === "/reports"
    },
    {
      id: "checklist",
      label: "المرور اليومي",
      icon: CheckCircle,
      path: "/checklist",
      active: location === "/checklist"
    },
    {
      id: "analytics",
      label: "التقارير",
      icon: BarChart3,
      path: "/analytics",
      active: location === "/analytics"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 p-2">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center p-2 h-auto ${
                item.active 
                  ? "text-[var(--medical-blue)]" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
