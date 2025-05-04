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
import { MoreVertical} from "lucide-react";
import { useForm } from "react-hook-form";

// Extended artery type with more configuration options
type Artery  = {
  id: number;
  name: string;
  source: string;
  destination: string;
  bandwidth: string;
  status: "active" | "standby" | "fault";
  // New fields for extended configuration
  broadcastIp: string;
  mode: "active" | "passive";
  online: boolean;
  primaryDestinationIp?: string;
  secondaryDestinationIp?: string;
  encryptionEnabled?: boolean;
  protocol?: string;
  bitrateIn?: number;
  bitrateOut?: number;
};

// Mock data for arteries with extended properties
const arteriesData: Artery [] = [
  { 
    id: 1, 
    name: "Main Feed", 
    source: "Network Switch A", 
    destination: "Distribution Node", 
    bandwidth: "1.2 Gbps", 
    status: "active",
    broadcastIp: "239.255.0.1",
    mode: "active",
    online: true,
    primaryDestinationIp: "239.255.1.1",
    secondaryDestinationIp: "239.255.1.2",
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 125,
    bitrateOut: 118
  },
  { 
    id: 2, 
    name: "Backup Link", 
    source: "Backup Server", 
    destination: "Failover System", 
    bandwidth: "850 Mbps", 
    status: "active",
    broadcastIp: "239.255.0.2",
    mode: "active",
    online: true,
    primaryDestinationIp: "239.255.2.1",
    secondaryDestinationIp: null,
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 87,
    bitrateOut: 80
  },
  { 
    id: 3, 
    name: "Remote Site A", 
    source: "Remote Location", 
    destination: "HQ System", 
    bandwidth: "620 Mbps", 
    status: "active",
    broadcastIp: "239.255.0.3",
    mode: "active",
    online: true,
    primaryDestinationIp: "239.255.3.1",
    secondaryDestinationIp: "239.255.3.2",
    encryptionEnabled: true,
    protocol: "UDP TS",
    bitrateIn: 32,
    bitrateOut: 29
  },
  { 
    id: 4, 
    name: "Cloud Storage", 
    source: "On-Prem Server", 
    destination: "Cloud Provider", 
    bandwidth: "480 Mbps", 
    status: "standby",
    broadcastIp: "239.255.0.4",
    mode: "passive",
    online: false,
    primaryDestinationIp: "239.255.4.1",
    secondaryDestinationIp: null,
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 0,
    bitrateOut: 0
  },
  { 
    id: 5, 
    name: "Archive System", 
    source: "Content Server", 
    destination: "Archive Storage", 
    bandwidth: "350 Mbps", 
    status: "active",
    broadcastIp: "239.255.0.5",
    mode: "active",
    online: true,
    primaryDestinationIp: "239.255.5.1",
    secondaryDestinationIp: "239.255.5.2",
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 143,
    bitrateOut: 137
  },
  { 
    id: 6, 
    name: "External Feed", 
    source: "Partner Network", 
    destination: "Processing Server", 
    bandwidth: "720 Mbps", 
    status: "fault",
    broadcastIp: "239.255.0.6",
    mode: "active",
    online: false,
    primaryDestinationIp: "239.255.6.1",
    secondaryDestinationIp: null,
    encryptionEnabled: true,
    protocol: "UDP TS",
    bitrateIn: 0,
    bitrateOut: 0
  },
  { id: 7, name: "Media Artery ", source: "Media Server", destination: "CDN Node", bandwidth: "920 Mbps", status: "active",
    broadcastIp: "239.255.0.7",
    mode: "active",
    online: true,
    primaryDestinationIp: "239.255.7.1",
    secondaryDestinationIp: "239.255.7.2",
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 92,
    bitrateOut: 85 },
  { id: 8, name: "Secure Link", source: "Secure Server", destination: "Encrypted Storage", bandwidth: "290 Mbps", status: "active",
    broadcastIp: "239.255.0.8",
    mode: "active",
    online: true,
    primaryDestinationIp: "239.255.8.1",
    secondaryDestinationIp: null,
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 29,
    bitrateOut: 22 },
  { id: 9, name: "Analytics Feed", source: "User Systems", destination: "Analytics Server", bandwidth: "180 Mbps", status: "standby",
    broadcastIp: "239.255.0.9",
    mode: "passive",
    online: false,
    primaryDestinationIp: "239.255.9.1",
    secondaryDestinationIp: "239.255.9.2",
    encryptionEnabled: true,
    protocol: "UDP TS",
    bitrateIn: 18,
    bitrateOut: 11 },
  { id: 10, name: "Disaster Recovery", source: "Primary DC", destination: "Secondary DC", bandwidth: "650 Mbps", status: "active",
    broadcastIp: "239.255.0.10",
    mode: "active",
    online: true,
    primaryDestinationIp: "239.255.10.1",
    secondaryDestinationIp: null,
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 65,
    bitrateOut: 58 },
];

export default function Arteries() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "standby" | "fault">("all");
  const [selectedArtery, setSelectedArtery] = useState<Artery  | null>(null);
  const [openArteryDialog, setOpenArteryDialog] = useState(false);
  
  // Form for editing a arteries
  const form = useForm<Artery >({
    defaultValues: selectedArtery || {
      id: 0,
      name: "",
      source: "",
      destination: "",
      bandwidth: "",
      status: "active",
      broadcastIp: "",
      mode: "active",
      online: true,
      primaryDestinationIp: "",
      secondaryDestinationIp: "",
      encryptionEnabled: false,
      protocol: "UDP TS"
    }
  });
  
  // Define table columns
  const columns: Column<Artery >[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (artery) => <span className="font-medium">{artery.name}</span>,
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
      header: "Broadcast IP",
      accessorKey: "broadcastIp",
      hideOnMobile: true,
      sortable: true
    },
    {
      header: "Mode",
      accessorKey: "mode",
      cell: (artery) => (
        <Badge
          variant="outline"
          className={
            artery.mode === 'active' ? 'border-green-500 text-green-600 bg-green-50/50 dark:bg-green-900/10' :
            'border-amber-500 text-amber-600 bg-amber-50/50 dark:bg-amber-900/10'
          }
        >
          {artery.mode === 'active' ? 'Active' : 'Passive'}
        </Badge>
      ),
      sortable: true
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (artery) => (
        <Badge
          variant="outline"
          className={
            artery.status === 'active' ? 'border-status-active text-status-active bg-green-50/50 dark:bg-green-900/10' :
            artery.status === 'standby' ? 'border-status-standby text-status-standby bg-amber-50/50 dark:bg-amber-900/10' :
            'border-status-fault text-status-fault bg-red-50/50 dark:bg-red-900/10'
          }
        >
          {artery.status === 'active' ? 'Active' :
           artery.status === 'standby' ? 'Standby' : 'Fault'}
        </Badge>
      ),
      sortable: true
    },
    {
      header: "Online",
      accessorKey: "online",
      cell: (artery) => (
        <Badge
          variant="outline"
          className={
            artery.online ? 'border-green-500 text-green-600 bg-green-50/50 dark:bg-green-900/10' :
            'border-red-500 text-red-600 bg-red-50/50 dark:bg-red-900/10'
          }
        >
          {artery.online ? 'Online' : 'Offline'}
        </Badge>
      ),
      sortable: true
    },
    {
      header: "",
      accessorKey: "id",
      cell: (artery) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewArtery(artery)}>View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditArtery(artery)}>Edit Artery </DropdownMenuItem>
            <DropdownMenuItem>Manage Bandwidth</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-[50px]"
    }
  ];
  
  const handleViewArtery = (artery: Artery ) => {
    setSelectedArtery(artery);
    setOpenArteryDialog(true);
  };
  
  const handleEditArtery = (artery: Artery ) => {
    setSelectedArtery(artery);
    form.reset(artery);
    setOpenArteryDialog(true);
  };
  
  
  
  // Filter data based on status filter
  const filteredData = statusFilter === "all" 
    ? arteriesData 
    : arteriesData.filter(artery => artery.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
    
      <Card>
        <CardHeader>
          <CardTitle>Artery  Management</CardTitle>
          <CardDescription>View and manage all artery  connections</CardDescription>
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
            searchPlaceholder="Search arteries..."
            pagination={true}
            pageSize={8}
            highlightCondition={(artery ) => artery.status === "fault"}
            highlightClass="bg-red-50/50 dark:bg-red-900/10"
            emptyMessage="No Arteries found matching your filters"
          />
        </CardContent>
      </Card>
    </div>
  );
}

