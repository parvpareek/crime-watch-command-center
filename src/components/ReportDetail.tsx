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
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

interface ReportDetailProps {
  report: CrimeReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportUpdate?: (updatedReport: CrimeReport) => void;
}

const ReportDetail: React.FC<ReportDetailProps> = ({ 
  report, 
  open, 
  onOpenChange,
  onReportUpdate 
}) => {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [localReport, setLocalReport] = useState<CrimeReport | null>(null);

  // Update local report when prop changes
  React.useEffect(() => {
    setLocalReport(report);
  }, [report]);

  if (!localReport) return null;

  const category = getCrimeCategory(localReport.incident_type);

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

  // Reset selected status when dialog opens
  const handleDialogOpen = () => {
    setSelectedStatus(localReport.status);
    setIsStatusDialogOpen(true);
  };

  // Update the report status in the database
  const updateReportStatus = async () => {
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }

    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('crime_report')
        .update({ status: selectedStatus })
        .eq('id', localReport.id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      const updatedReport = { ...localReport, status: selectedStatus };
      setLocalReport(updatedReport);
      
      // Notify parent component
      if (onReportUpdate) {
        onReportUpdate(updatedReport);
      }

      toast.success(`Status updated to ${selectedStatus}`);
      setIsStatusDialogOpen(false);
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-3xl">
            <DrawerHeader className="flex justify-between items-center">
              <div>
                <DrawerTitle className="text-xl font-bold flex items-center gap-2">
                  Incident #{localReport.id}
                  <Badge
                    className={`ml-2 ${
                      category === 'violent' ? 'bg-crime-violent' :
                      category === 'property' ? 'bg-crime-property' :
                      category === 'drugs' ? 'bg-crime-drugs' :
                      category === 'public' ? 'bg-crime-public' :
                      'bg-crime-other'
                    }`}
                  >
                    {localReport.incident_type}
                  </Badge>
                </DrawerTitle>
                <DrawerDescription>
                  Reported on {formatDate(localReport.created_at)}
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
                  <p>{formatDate(localReport.date)} at {localReport.time.substring(0, 5)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <Badge variant={
                    localReport.status === "Resolved" ? "outline" :
                    localReport.status === "Under Investigation" ? "secondary" :
                    localReport.status === "False Report" ? "destructive" :
                    "default"
                  }>
                    {localReport.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Severity</h4>
                  <Badge variant={getSeverityVariant(localReport.severity)}>
                    {localReport.severity}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Report Type</h4>
                  <p>{localReport.report_type}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                <p>Coordinates: {localReport.latitude.toFixed(6)}, {localReport.longitude.toFixed(6)}</p>
                <p>Surat, Gujarat - 395007</p>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Perpetrator</h4>
                <p>{localReport.perpetrator}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Details</h4>
                <p className="whitespace-pre-line">{localReport.details}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Reporter Information</h4>
                <p>User ID: {localReport.user_id}</p>
                <p>Report Type: {localReport.report_type}</p>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>
                <ul className="space-y-2 mt-2">
                  <li className="flex gap-2 items-center">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-xs text-muted-foreground">{formatDate(localReport.created_at)}</span>
                    <span className="text-sm">Report submitted</span>
                  </li>
                  {/* In a real app, we'd add more timeline entries here */}
                </ul>
              </div>
            </div>

            <DrawerFooter className="flex flex-row gap-2 justify-end">
              <Button variant="outline">Export Report</Button>
              <Button onClick={handleDialogOpen}>Update Status</Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Report Status</DialogTitle>
            <DialogDescription>
              Change the status of this incident report. This will be logged in the system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label htmlFor="status-select" className="text-sm font-medium block mb-2">
              Status
            </label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status-select" className="w-full">
                <SelectValue placeholder="Select a status" />
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
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateReportStatus} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportDetail;
