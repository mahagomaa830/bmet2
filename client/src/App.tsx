import { Switch, Route, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TechnicianDashboard from "@/pages/technician-dashboard";
import NursingReport from "@/pages/nursing-report";
import EquipmentDetails from "@/pages/equipment-details";
import DailyChecklist from "@/pages/daily-checklist";
import AdminDashboard from "@/pages/admin-dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";

function AuthenticatedRouter() {
  const [location] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-medical-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showRegister ? 
      <Register onBack={() => setShowRegister(false)} onSuccess={setUser} /> : 
      <Login onRegister={() => setShowRegister(true)} onSuccess={setUser} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => 
        user.role === 'admin' ? <AdminDashboard /> :
        user.role === 'technician' ? <TechnicianDashboard /> : 
        <NursingReport />
      } />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/technician" component={TechnicianDashboard} />
      <Route path="/nursing" component={NursingReport} />
      <Route path="/equipment/:id" component={EquipmentDetails} />
      <Route path="/checklist" component={DailyChecklist} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="font-arabic" dir="rtl">
          <Toaster />
          <AuthenticatedRouter />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
