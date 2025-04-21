
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveDataTable, Column } from "@/components/data/ResponsiveDataTable";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreVertical } from "lucide-react";

// Channel type definition
type Channel = {
  id: number;
  name: string;
  source: string;
  destination: string;
  bandwidth: string;
  status: "active" | "standby" | "fault";
};

// Mock data for channels
const channelsData: Channel[] = [
  { id: 1, name: "Main Feed", source: "Network Switch A", destination: "Distribution Node", bandwidth: "1.2 Gbps", status: "active" },
  { id: 2, name: "Backup Link", source: "Backup Server", destination: "Failover System", bandwidth: "850 Mbps", status: "active" },
  { id: 3, name: "Remote Site A", source: "Remote Location", destination: "HQ System", bandwidth: "620 Mbps", status: "active" },
  { id: 4, name: "Cloud Storage", source: "On-Prem Server", destination: "Cloud Provider", bandwidth: "480 Mbps", status: "standby" },
  { id: 5, name: "Archive System", source: "Content Server", destination: "Archive Storage", bandwidth: "350 Mbps", status: "active" },
  { id: 6, name: "External Feed", source: "Partner Network", destination: "Processing Server", bandwidth: "720 Mbps", status: "fault" },
  { id: 7, name: "Media Channel", source: "Media Server", destination: "CDN Node", bandwidth: "920 Mbps", status: "active" },
  { id: 8, name: "Secure Link", source: "Secure Server", destination: "Encrypted Storage", bandwidth: "290 Mbps", status: "active" },
  { id: 9, name: "Analytics Feed", source: "User Systems", destination: "Analytics Server", bandwidth: "180 Mbps", status: "standby" },
  { id: 10, name: "Disaster Recovery", source: "Primary DC", destination: "Secondary DC", bandwidth: "650 Mbps", status: "active" },
];

export default function Channels() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "standby" | "fault">("all");
  
  // Define table columns
  const columns: Column<Channel>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (channel) => <span className="font-medium">{channel.name}</span>,
      sortable: true
    },
    {
      header: "Source",
      accessorKey: "source",
      hideOnMobile: true,
      sortable: true
    },
    {
      header: "Destination",
      accessorKey: "destination",
      hideOnMobile: true,
      sortable: true
    },
    {
      header: "Bandwidth",
      accessorKey: "bandwidth",
      hideOnMobile: true,
      sortable: true
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (channel) => (
        <Badge
          variant="outline"
          className={
            channel.status === 'active' ? 'border-status-active text-status-active bg-green-50/50 dark:bg-green-900/10' :
            channel.status === 'standby' ? 'border-status-standby text-status-standby bg-amber-50/50 dark:bg-amber-900/10' :
            'border-status-fault text-status-fault bg-red-50/50 dark:bg-red-900/10'
          }
        >
          {channel.status === 'active' ? 'Active' :
           channel.status === 'standby' ? 'Standby' : 'Fault'}
        </Badge>
      ),
      sortable: true
    },
    {
      header: "",
      accessorKey: "id",
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Channel</DropdownMenuItem>
            <DropdownMenuItem>Manage Bandwidth</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-[50px]"
    }
  ];
  
  // Filter data based on status filter
  const filteredData = statusFilter === "all" 
    ? channelsData 
    : channelsData.filter(channel => channel.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Channels</h1>
        <Button>Add Channel</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Channel Management</CardTitle>
          <CardDescription>View and manage all channel connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as any)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="standby">Standby</SelectItem>
                <SelectItem value="fault">Fault</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <ResponsiveDataTable
            data={filteredData}
            columns={columns}
            keyField="id"
            searchable={true}
            searchPlaceholder="Search channels..."
            pagination={true}
            pageSize={8}
            highlightCondition={(channel) => channel.status === "fault"}
            highlightClass="bg-red-50/50 dark:bg-red-900/10"
            emptyMessage="No channels found matching your filters"
          />
        </CardContent>
      </Card>
    </div>
  );
}
