
import React, { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CrimeReport, formatDate, getCrimeCategory } from "@/utils/data";
import { CheckCircle, Download, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ReportDetailProps {
  report: CrimeReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate?: (report: CrimeReport, newStatus: string) => void;
}

const ReportDetail: React.FC<ReportDetailProps> = ({ 
  report, 
  open, 
  onOpenChange,
  onStatusUpdate 
}) => {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!report) return null;

  const category = getCrimeCategory(report.incident_type);

  // Get badge variant based on severity
  const getSeverityVariant = (severity: string): "default" | "destructive" | "outline" | "secondary" => {
    switch(severity) {
      case "Critical": return "destructive";
      case "High": return "default";
      case "Medium": return "secondary";
      case "Low": 
      default: return "outline";
    }
  };

  const handleStatusUpdate = async () => {
    if (!report || !newStatus) return;

    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('crime_report')
        .update({ status: newStatus })
        .eq('id', report.id);
        
      if (error) throw error;
      
      toast.success(`Report status updated to ${newStatus}`, {
        description: `Report #${report.id} status has been successfully updated.`,
        action: {
          label: "Dismiss",
          onClick: () => {},
        },
      });

      // Update the report in the parent component
      if (onStatusUpdate) {
        onStatusUpdate(report, newStatus);
      }
      
      setIsUpdateDialogOpen(false);
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Failed to update report status', {
        description: 'Please try again or contact support if the issue persists.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-3xl">
          <DrawerHeader className="flex justify-between items-center">
            <div>
              <DrawerTitle className="text-xl font-bold flex items-center gap-2">
                Incident #{report.id}
                <Badge
                  className={`ml-2 ${
                    category === 'violent' ? 'bg-crime-violent' :
                    category === 'property' ? 'bg-crime-property' :
                    category === 'drugs' ? 'bg-crime-drugs' :
                    category === 'public' ? 'bg-crime-public' :
                    'bg-crime-other'
                  }`}
                >
                  {report.incident_type}
                </Badge>
              </DrawerTitle>
              <DrawerDescription>
                Reported on {formatDate(report.created_at)}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Date & Time</h4>
                <p>{formatDate(report.date)} at {report.time.substring(0, 5)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                <Badge variant={
                  report.status === "Resolved" ? "outline" :
                  report.status === "Under Investigation" ? "secondary" :
                  report.status === "False Report" ? "destructive" :
                  "default"
                }>
                  {report.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Severity</h4>
                <Badge variant={getSeverityVariant(report.incident_severity)}>
                  {report.incident_severity}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Report Type</h4>
                <p>{report.report_type}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
              <p>Coordinates: {report.location.coordinates[1].toFixed(6)}, {report.location.coordinates[0].toFixed(6)}</p>
              <p>Surat, Gujarat - 395007</p>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Perpetrator</h4>
              <p>{report.perpetrator}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Details</h4>
              <p className="whitespace-pre-line">{report.details}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Reporter Information</h4>
              <p>User ID: {report.user_id}</p>
              <p>Report Type: {report.report_type}</p>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>
              <ul className="space-y-2 mt-2">
                <li className="flex gap-2 items-center">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span className="text-xs text-muted-foreground">{formatDate(report.created_at)}</span>
                  <span className="text-sm">Report submitted</span>
                </li>
                {/* In a real app, we'd add more timeline entries here */}
              </ul>
            </div>
          </div>

          <DrawerFooter className="flex flex-row gap-2 justify-end">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Report Status</DialogTitle>
                  <DialogDescription>
                    Change the status of incident report #{report.id}.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="False Report">False Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleStatusUpdate}
                    disabled={isUpdating || !newStatus}
                  >
                    {isUpdating ? "Updating..." : "Update Status"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ReportDetail;
