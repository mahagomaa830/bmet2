import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppHeader from "@/components/app-header";
import BottomNavigation from "@/components/bottom-navigation";
import EquipmentCard from "@/components/equipment-card";
import ReportCard from "@/components/report-card";
import BarcodeScanner from "@/components/barcode-scanner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/use-websocket";
import { Badge } from "@/components/ui/badge";
import { Search, QrCodeIcon, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import LogoutButton from "@/components/logout-button";

export default function TechnicianDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  // WebSocket for real-time updates
  useWebSocket('/ws', (message) => {
    if (message.type === 'new_fault_report') {
      // Invalidate queries to refresh data
      // The useQuery will automatically refetch
    }
  });

  const { data: equipment = [], isLoading: equipmentLoading } = useQuery({
    queryKey: ['/api/equipment'],
  });

  const { data: faultReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['/api/fault-reports'],
  });

  const { data: statistics = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/statistics'],
  });

  const filteredEquipment = equipment.filter((eq: any) =>
    eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.barcode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentReports = faultReports.slice(0, 5);

  return (
    <div className="medical-container">
      <AppHeader currentMode="technician" />

      <main className="p-4 pb-20">
        {/* Quick Actions Bar */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => setShowScanner(true)}
            className="bg-white text-gray-700 border border-gray-100 h-20 flex flex-col items-center space-y-2 hover:bg-gray-50 ripple"
            variant="outline"
          >
            <QrCodeIcon className="text-[var(--medical-blue)] w-8 h-8" />
            <span className="text-sm font-medium">مسح الباركود</span>
          </Button>
          
          <Link href="/checklist">
            <Button className="bg-white text-gray-700 border border-gray-100 h-20 flex flex-col items-center space-y-2 hover:bg-gray-50 ripple w-full">
              <CheckCircle className="text-[var(--success-green)] w-8 h-8" />
              <span className="text-sm font-medium">المرور اليومي</span>
            </Button>
          </Link>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="text-2xl font-bold number text-[var(--success-green)]">
                {statsLoading ? "..." : statistics.operational || 0}
              </div>
              <div className="text-xs text-gray-600">جاهز للعمل</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="text-2xl font-bold number text-[var(--warning-orange)]">
                {statsLoading ? "..." : statistics.maintenance || 0}
              </div>
              <div className="text-xs text-gray-600">تحت الصيانة</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="text-2xl font-bold number text-[var(--urgent-red)]">
                {statsLoading ? "..." : statistics.criticalReports || 0}
              </div>
              <div className="text-xs text-gray-600">عاجل</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="material-icons ml-2 no-flip">report_problem</span>
              البلاغات الحديثة
            </h2>
            {recentReports.length > 0 && (
              <Badge variant="destructive" className="number">
                {recentReports.length}
              </Badge>
            )}
          </div>

          {reportsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : recentReports.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <span className="material-icons text-gray-400 text-4xl mb-2 block no-flip">
                  check_circle
                </span>
                <p className="text-gray-600">لا توجد بلاغات جديدة</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report: any) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </div>

        {/* Equipment List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="material-icons ml-2 no-flip">inventory_2</span>
              قائمة الأجهزة
            </h2>
            <span className="text-[var(--medical-blue)] text-sm font-medium number">
              {equipment.length}
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="البحث عن جهاز..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10"
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          </div>

          {/* Equipment Cards */}
          {equipmentLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredEquipment.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <span className="material-icons text-gray-400 text-4xl mb-2 block no-flip">
                  search_off
                </span>
                <p className="text-gray-600">
                  {searchQuery ? "لم يتم العثور على أجهزة" : "لا توجد أجهزة"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredEquipment.map((eq: any) => (
                <EquipmentCard key={eq.id} equipment={eq} />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowScanner(true)}
        className="fixed bottom-20 left-6 bg-[var(--medical-blue)] text-white w-14 h-14 rounded-full shadow-lg hover:opacity-90 ripple"
        size="icon"
      >
        <QrCodeIcon className="w-6 h-6" />
      </Button>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={(barcode) => {
            console.log("Scanned:", barcode);
            setShowScanner(false);
          }}
        />
      )}
    </div>
  );
}
