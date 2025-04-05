
import React from 'react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import {
  AlertTriangle,
  BarChart2,
  ChevronRight,
  Home,
  Map,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardSidebarProps {
  className?: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ className }) => {
  return (
    <Sidebar className={cn(className)}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <Shield size={24} className="text-primary" />
          <span className="font-semibold text-xl">Crime Watch</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col gap-1 px-2 py-2">
          <Button variant="ghost" className="justify-start">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Button>
          <Button variant="ghost" className="justify-start">
            <Map className="mr-2 h-4 w-4" />
            <span>Map View</span>
          </Button>
          <Button variant="ghost" className="justify-start">
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>Incidents</span>
          </Button>
          <Button variant="ghost" className="justify-start">
            <BarChart2 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </Button>
          <Button variant="ghost" className="justify-start">
            <Users className="mr-2 h-4 w-4" />
            <span>Users</span>
          </Button>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-2">
          <Button variant="ghost" className="justify-start">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
