import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function LogoutButton({ 
  variant = "outline", 
  size = "sm", 
  className = "" 
}: LogoutButtonProps) {
  const { toast } = useToast();

  const handleLogout = () => {
    // Clear all stored session data
    localStorage.clear();
    sessionStorage.clear();
    
    // Show logout message
    toast({
      title: "تم تسجيل الخروج",
      description: "شكراً لاستخدام النظام",
    });
    
    // Force reload to get back to login state after a brief delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={`flex items-center gap-2 ${className}`}
    >
      <LogOut className="h-4 w-4" />
      تسجيل الخروج
    </Button>
  );
}