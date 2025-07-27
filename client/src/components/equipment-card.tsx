import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

interface EquipmentCardProps {
  equipment: {
    id: number;
    name: string;
    model: string;
    barcode: string;
    department: string;
    location: string;
    status: string;
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
  };
}

export default function EquipmentCard({ equipment }: EquipmentCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="status-operational">تعمل بشكل طبيعي</Badge>;
      case 'maintenance':
        return <Badge className="status-maintenance">تحت الصيانة</Badge>;
      case 'out_of_service':
        return <Badge className="status-out-of-service">خارج الخدمة</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  return (
    <Card className="border border-gray-100 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-medium text-gray-800">{equipment.name}</h3>
            <p className="text-sm text-gray-600">{equipment.model}</p>
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3 ml-1" />
              <span>{equipment.department} - {equipment.location}</span>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            {getStatusBadge(equipment.status)}
            <span className="text-xs text-gray-500 number">{equipment.barcode}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 ml-1" />
            <span>آخر صيانة: <span className="number">{formatDate(equipment.lastMaintenanceDate)}</span></span>
          </div>
          <span className="number">
            القادمة: {formatDate(equipment.nextMaintenanceDate)}
          </span>
        </div>

        <div className="flex space-x-2 space-x-reverse">
          <Link href={`/equipment/${equipment.id}`} className="flex-1">
            <Button variant="outline" className="w-full text-sm">
              عرض التفاصيل
            </Button>
          </Link>
          
          {equipment.status === 'operational' ? (
            <Button className="flex-1 btn-medical text-sm">
              إضافة صيانة
            </Button>
          ) : equipment.status === 'maintenance' ? (
            <Button className="flex-1 btn-success text-sm">
              إنهاء الصيانة
            </Button>
          ) : (
            <Button className="flex-1 btn-warning text-sm">
              بدء إصلاح
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
