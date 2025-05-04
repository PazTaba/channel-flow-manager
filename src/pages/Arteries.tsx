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
import { MoreVertical, ArrowRightLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { 
  useArteries, 
  useActivateArtery, 
  useSetArteryToStandby,
  useSwitchChannel 
} from "@/hooks/useArteries";
import { toast } from "sonner";
import { ArteryDetailsDialog } from "@/components/dashboard/ArteryDetailsDialog";

// Extended artery type with more configuration options
type Artery  = {
  id: number;
  name: string;
  source: string;
  sourceId: number;
  status: "active" | "standby" | "fault";
  broadcastIp: string;
  mode: "active" | "passive";
  online: boolean;
  encryptionEnabled?: boolean;
  protocol?: string;
  bitrateIn?: number;
  bitrateOut?: number;
  primaryChannel: {
    id: number;
    destinationId: number;
    destination: string;
    status: "online" | "offline";
    isActive: boolean;
  };
  backupChannel: {
    id: number;
    destinationId: number;
    destination: string;
    status: "online" | "offline";
    isActive: boolean;
  };
};

// Mock data for arteries with extended properties
const arteriesData: Artery [] = [
  { 
    id: 1, 
    name: "Main Feed", 
    source: "Network Switch A",
    sourceId: 1,
    status: "active",
    broadcastIp: "239.255.0.1",
    mode: "active",
    online: true,
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 125,
    bitrateOut: 118,
    primaryChannel: {
      id: 1,
      destinationId: 1,
      destination: "Distribution Node",
      status: "online",
      isActive: true
    },
    backupChannel: {
      id: 2,
      destinationId: 2,
      destination: "Backup Distribution",
      status: "online",
      isActive: false
    }
  },
  { 
    id: 2, 
    name: "Backup Link", 
    source: "Backup Server", 
    sourceId: 2,
    status: "active",
    broadcastIp: "239.255.0.2",
    mode: "active",
    online: true,
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 87,
    bitrateOut: 80,
    primaryChannel: {
      id: 3,
      destinationId: 3,
      destination: "Failover System",
      status: "online",
      isActive: true
    },
    backupChannel: {
      id: 4,
      destinationId: 4,
      destination: "Secondary Failover",
      status: "offline",
      isActive: false
    }
  },
  { 
    id: 3, 
    name: "Remote Site A", 
    source: "Remote Location", 
    sourceId: 3,
    status: "active",
    broadcastIp: "239.255.0.3",
    mode: "active",
    online: true,
    encryptionEnabled: true,
    protocol: "UDP TS",
    bitrateIn: 32,
    bitrateOut: 29,
    primaryChannel: {
      id: 5,
      destinationId: 5,
      destination: "HQ System",
      status: "online",
      isActive: true
    },
    backupChannel: {
      id: 6,
      destinationId: 6,
      destination: "HQ Backup System",
      status: "online",
      isActive: false
    }
  },
  { 
    id: 4, 
    name: "Cloud Storage", 
    source: "On-Prem Server", 
    sourceId: 4,
    status: "standby",
    broadcastIp: "239.255.0.4",
    mode: "passive",
    online: false,
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 0,
    bitrateOut: 0,
    primaryChannel: {
      id: 7,
      destinationId: 7,
      destination: "Cloud Provider",
      status: "offline",
      isActive: false
    },
    backupChannel: {
      id: 8,
      destinationId: 8,
      destination: "Alternative Cloud",
      status: "offline",
      isActive: false
    }
  },
  { 
    id: 5, 
    name: "Archive System", 
    source: "Content Server", 
    sourceId: 5,
    status: "active",
    broadcastIp: "239.255.0.5",
    mode: "active",
    online: true,
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 143,
    bitrateOut: 137,
    primaryChannel: {
      id: 9,
      destinationId: 9,
      destination: "Archive Storage",
      status: "online",
      isActive: true
    },
    backupChannel: {
      id: 10,
      destinationId: 10,
      destination: "Backup Archive",
      status: "online",
      isActive: false
    }
  },
  { 
    id: 6, 
    name: "External Feed", 
    source: "Partner Network", 
    sourceId: 6,
    status: "fault",
    broadcastIp: "239.255.0.6",
    mode: "active",
    online: false,
    encryptionEnabled: true,
    protocol: "UDP TS",
    bitrateIn: 0,
    bitrateOut: 0,
    primaryChannel: {
      id: 11,
      destinationId: 11,
      destination: "Processing Server",
      status: "offline",
      isActive: false
    },
    backupChannel: {
      id: 12,
      destinationId: 12,
      destination: "Backup Processing",
      status: "offline",
      isActive: true
    }
  },
  { id: 7, name: "Media Artery ", source: "Media Server", sourceId: 7, status: "active",
    broadcastIp: "239.255.0.7",
    mode: "active",
    online: true,
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 92,
    bitrateOut: 85,
    primaryChannel: {
      id: 13,
      destinationId: 13,
      destination: "CDN Node",
      status: "online",
      isActive: true
    },
    backupChannel: {
      id: 14,
      destinationId: 14,
      destination: "Backup CDN",
      status: "online",
      isActive: false
    } },
  { id: 8, name: "Secure Link", source: "Secure Server", sourceId: 8, status: "active",
    broadcastIp: "239.255.0.8",
    mode: "active",
    online: true,
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 29,
    bitrateOut: 22,
    primaryChannel: {
      id: 15,
      destinationId: 15,
      destination: "Encrypted Storage",
      status: "online",
      isActive: true
    },
    backupChannel: {
      id: 16,
      destinationId: 16,
      destination: "Backup Encrypted",
      status: "online",
      isActive: false
    } },
  { id: 9, name: "Analytics Feed", source: "User Systems", sourceId: 9, status: "standby",
    broadcastIp: "239.255.0.9",
    mode: "passive",
    online: false,
    encryptionEnabled: true,
    protocol: "UDP TS",
    bitrateIn: 18,
    bitrateOut: 11,
    primaryChannel: {
      id: 17,
      destinationId: 17,
      destination: "Analytics Server",
      status: "offline",
      isActive: false
    },
    backupChannel: {
      id: 18,
      destinationId: 18,
      destination: "Backup Analytics",
      status: "offline",
      isActive: false
    } },
  { id: 10, name: "Disaster Recovery", source: "Primary DC", sourceId: 10, status: "active",
    broadcastIp: "239.255.0.10",
    mode: "active",
    online: true,
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 65,
    bitrateOut: 58,
    primaryChannel: {
      id: 19,
      destinationId: 19,
      destination: "Secondary DC",
      status: "online",
      isActive: true
    },
    backupChannel: {
      id: 20,
      destinationId: 20,
      destination: "Tertiary DC",
      status: "online",
      isActive: false
    } },
];

export default function Arteries() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "standby" | "fault">("all");
  const [selectedArtery, setSelectedArtery] = useState<Artery | null>(null);
  const [openArteryDialog, setOpenArteryDialog] = useState(false);
  
  // Mutations
  const switchChannelMutation = useSwitchChannel();
  const activateArteryMutation = useActivateArtery();
  const standbyArteryMutation = useSetArteryToStandby();
  
  // Form for editing arteries
  const form = useForm<Artery>({
    defaultValues: selectedArtery || {
      id: 0,
      name: "",
      source: "",
      sourceId: 0,
      status: "active",
      broadcastIp: "",
      mode: "active",
      online: true,
      encryptionEnabled: false,
      protocol: "UDP TS",
      bitrateIn: 0,
      bitrateOut: 0,
      primaryChannel: {
        id: 0,
        destinationId: 0,
        destination: "",
        status: "offline",
        isActive: true
      },
      backupChannel: {
        id: 0, 
        destinationId: 0,
        destination: "",
        status: "offline",
        isActive: false
      }
    }
  });
  
  const handleSwitchChannel = (artery: Artery) => {
    const useBackup = artery.primaryChannel.isActive;
    
    switchChannelMutation.mutate(
      { id: artery.id, useBackup },
      {
        onSuccess: () => {
          toast.success(`Switched to ${useBackup ? 'backup' : 'primary'} channel for ${artery.name}`);
        },
        onError: (error) => {
          toast.error(`Failed to switch channels: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    );
  };
  
  const handleViewArtery = (artery: Artery) => {
    setSelectedArtery(artery);
    setOpenArteryDialog(true);
  };
  
  const handleEditArtery = (artery: Artery) => {
    setSelectedArtery(artery);
    form.reset(artery);
    setOpenArteryDialog(true);
  };
  
  // Define table columns
  const columns: Column<Artery>[] = [
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
      header: "Primary Destination",
      accessorKey: "primaryChannel.destination",
      cell: (artery) => (
        <div className="flex flex-col">
          <span>{artery.primaryChannel.destination}</span>
          {artery.primaryChannel.isActive && (
            <Badge variant="outline" className="mt-1 w-fit border-blue-500 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10">
              Active
            </Badge>
          )}
        </div>
      ),
      hideOnMobile: true,
      sortable: true
    },
    {
      header: "Backup Destination",
      accessorKey: "backupChannel.destination",
      cell: (artery) => (
        <div className="flex flex-col">
          <span>{artery.backupChannel.destination}</span>
          {artery.backupChannel.isActive && (
            <Badge variant="outline" className="mt-1 w-fit border-blue-500 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10">
              Active
            </Badge>
          )}
        </div>
      ),
      hideOnMobile: true,
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
            artery.status === 'fault' ? 'border-status-fault text-status-fault bg-red-50/50 dark:bg-red-900/10' :
            ''
          }
        >
          {artery.status === 'active' ? 'Active' :
           artery.status === 'standby' ? 'Standby' : 'Fault'}
        </Badge>
      ),
      sortable: true
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (artery) => (
        <div className="flex items-center">
          <Button
            size="sm"
            variant="outline"
            className="h-8 mr-2"
            onClick={() => handleSwitchChannel(artery)}
            disabled={switchChannelMutation.isPending}
          >
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
            Switch
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewArtery(artery)}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditArtery(artery)}>Edit Artery</DropdownMenuItem>
              <DropdownMenuItem>Manage Bandwidth</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "w-[120px]"
    }
  ];
  
  // Filter data based on status filter
  const filteredData = statusFilter === "all" 
    ? arteriesData 
    : arteriesData.filter(artery => artery.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Artery Management</CardTitle>
          <CardDescription>View and manage all artery connections with primary and backup channels</CardDescription>
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
            highlightCondition={(artery) => artery.status === "fault"}
            highlightClass="bg-red-50/50 dark:bg-red-900/10"
            emptyMessage="No Arteries found matching your filters"
          />
        </CardContent>
      </Card>
      
      {selectedArtery && (
        <ArteryDetailsDialog
          artery={{
            id: selectedArtery.id,
            name: selectedArtery.name,
            primaryChannelStatus: selectedArtery.primaryChannel.status,
            backupChannelStatus: selectedArtery.backupChannel.status,
            cpu: selectedArtery.bitrateIn > 0 ? Math.floor(Math.random() * 30) + 20 : 0,
            ram: selectedArtery.bitrateIn > 0 ? Math.floor(Math.random() * 40) + 30 : 0,
            bitrateIn: selectedArtery.bitrateIn,
            bitrateOut: selectedArtery.bitrateOut,
            broadcastIp: selectedArtery.broadcastIp,
            mode: selectedArtery.mode,
            primaryChannelActive: selectedArtery.primaryChannel.isActive,
            sources: [
              {
                name: selectedArtery.source,
                ip: selectedArtery.broadcastIp,
                status: "enabled"
              }
            ],
            destinations: [
              {
                name: selectedArtery.primaryChannel.destination,
                ip: selectedArtery.primaryChannel.destination + " IP",
                type: "primary"
              },
              {
                name: selectedArtery.backupChannel.destination,
                ip: selectedArtery.backupChannel.destination + " IP",
                type: "backup"
              }
            ]
          }}
        />
      )}
    </div>
  );
}
