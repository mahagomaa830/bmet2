import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Clock, User, MapPin } from "lucide-react";

interface ReportCardProps {
  report: {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    reportedAt: string;
    equipment?: {
      name: string;
      barcode: string;
      department: string;
      location: string;
    };
    reportedByUser?: {
      name: string;
      department: string;
    };
  };
}

export default function ReportCard({ report }: ReportCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const acceptReportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/fault-reports/${report.id}`, {
        status: "assigned",
        assignedTo: 3, // Mock technician ID
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fault-reports'] });
      toast({
        title: "تم قبول البلاغ",
        description: "تم تعيين البلاغ لك بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في قبول البلاغ",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return <Badge className="bg-[var(--urgent-red)] text-white">عاجل</Badge>;
      case 'medium':
        return <Badge className="bg-[var(--warning-orange)] text-white">متوسط</Badge>;
      case 'low':
        return <Badge className="bg-[var(--success-green)] text-white">غير عاجل</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getBorderColor = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'border-r-[var(--urgent-red)]';
      case 'medium':
        return 'border-r-[var(--warning-orange)]';
      case 'low':
        return 'border-r-[var(--success-green)]';
      default:
        return 'border-r-gray-300';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className={`border-r-4 ${getBorderColor(report.priority)} mb-3`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-medium text-gray-800">
              {report.equipment?.name || report.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {report.description}
            </p>
          </div>
          {getPriorityBadge(report.priority)}
        </div>
        
        <div className="space-y-2 text-xs text-gray-500 mb-3">
          {report.equipment && (
            <div className="flex items-center">
              <MapPin className="w-3 h-3 ml-1" />
              <span>{report.equipment.department} - {report.equipment.location}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <User className="w-3 h-3 ml-1" />
              <span>
                {report.reportedByUser?.name || "غير محدد"} - {report.reportedByUser?.department}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 ml-1" />
              <span className="number">{formatTime(report.reportedAt)}</span>
            </div>
          </div>
        </div>

        {report.status === 'open' && (
          <Button
            onClick={() => acceptReportMutation.mutate()}
            disabled={acceptReportMutation.isPending}
            className="w-full btn-medical text-sm ripple"
          >
            {acceptReportMutation.isPending ? "جاري القبول..." : "قبول البلاغ والبدء بالصيانة"}
          </Button>
        )}
        
        {report.status === 'assigned' && (
          <div className="w-full bg-[var(--success-green)] text-white text-center py-2 rounded-lg text-sm font-medium">
            تم قبول البلاغ
          </div>
        )}
      </CardContent>
    </Card>
  );
}
