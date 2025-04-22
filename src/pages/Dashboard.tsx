import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertsComponent } from "@/components/alerts/AlertsComponent";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { ChannelCircle } from "@/components/dashboard/ChannelCircle";
import { ChannelDetailsDialog } from "@/components/dashboard/ChannelDetailsDialog";
import { ResponsiveDataTable, Column } from "@/components/data/ResponsiveDataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { useState } from "react";

// Mock data for dashboard
const channelStats = {
  total: 24,
  active: 18,
  standby: 4,
  fault: 2
};

const topChannels = [
  { id: 1, name: "Main Feed", bandwidth: "1.2 Gbps", status: "active" },
  { id: 2, name: "Backup Link", bandwidth: "850 Mbps", status: "active" },
  { id: 3, name: "Remote Site A", bandwidth: "620 Mbps", status: "active" },
  { id: 4, name: "Cloud Storage", bandwidth: "480 Mbps", status: "standby" },
  { id: 5, name: "Archive System", bandwidth: "350 Mbps", status: "active" }
];

// Update the mock data with additional channel information
const arteryChannels = [
  {
    name: "Artery 1",
    channelLink1Status: "online" as "online" | "offline",
    channelLink2Status: "online" as "online" | "offline",
    cpu: 47,
    ram: 61,
    bitrateIn: 125,
    bitrateOut: 112,
    broadcastIP: "239.255.1.1",
    mode: "active" as "active" | "passive",
    sources: [
      {
        name: "Primary Source",
        ip: "192.168.1.10",
        status: "enabled" as "enabled" | "fallback"
      },
      {
        name: "Backup Source",
        ip: "192.168.1.11",
        status: "fallback" as "enabled" | "fallback"
      }
    ],
    destinations: [
      {
        name: "Main Output",
        ip: "192.168.2.10",
        type: "primary" as "primary" | "secondary"
      },
      {
        name: "Backup Output",
        ip: "192.168.2.11",
        type: "secondary" as "primary" | "secondary"
      }
    ]
  },
  // ... Add similar detailed data for other channels
];

// Add channel type definition and mock data from Channels.tsx
type Channel = {
  id: number;
  name: string;
  source: string;
  destination: string;
  bandwidth: string;
  status: "active" | "standby" | "fault";
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

// Mock data for channels with extended properties
const channelsData: Channel[] = [
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
  { id: 7, name: "Media Channel", source: "Media Server", destination: "CDN Node", bandwidth: "920 Mbps", status: "active",
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

export default function Dashboard() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "standby" | "fault">("all");
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  
  // Define table columns for the channels table
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
      header: "Broadcast IP",
      accessorKey: "broadcastIp",
      hideOnMobile: true,
      sortable: true
    },
    {
      header: "Mode",
      accessorKey: "mode",
      cell: (channel) => (
        <Badge
          variant="outline"
          className={
            channel.mode === 'active' ? 'border-green-500 text-green-600 bg-green-50/50 dark:bg-green-900/10' :
            'border-amber-500 text-amber-600 bg-amber-50/50 dark:bg-amber-900/10'
          }
        >
          {channel.mode === 'active' ? 'Active' : 'Passive'}
        </Badge>
      ),
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
      cell: (channel) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewChannel(channel)}>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Channel</DropdownMenuItem>
            <DropdownMenuItem>Manage Bandwidth</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-[50px]"
    }
  ];

  const handleViewChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  // Filter data based on status filter
  const filteredData = statusFilter === "all" 
    ? channelsData 
    : channelsData.filter(channel => channel.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Last updated: Just now
        </Badge>
      </div>
      
      {/* Channel Status Overview */}
      <div className="grid gap-4 md:grid-cols-4 grid-cols-2">
        <StatusCard title="Total Channels" value={channelStats.total} status="neutral" />
        <StatusCard title="Active" value={channelStats.active} status="active" />
        <StatusCard title="Standby" value={channelStats.standby} status="standby" />
        <StatusCard title="Fault" value={channelStats.fault} status="fault" />
      </div>

      {/* Update the Live Channel Status section */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold mb-2">Live Channel Status</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {arteryChannels.map((ch) => (
            <ChannelDetailsDialog key={ch.name} channel={ch} />
          ))}
        </div>
      </div>
      
      {/* Channels Management Table */}
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
      
      {/* Bandwidth Usage Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Bandwidth Usage</CardTitle>
          <CardDescription>Network traffic across all channels</CardDescription>
          <Tabs defaultValue="daily" className="mt-2">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full flex items-center justify-center bg-muted/30 rounded-md">
            <p className="text-muted-foreground">Bandwidth graph visualization would appear here</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 grid-cols-1">
        {/* Top 5 Channels */}
        <Card>
          <CardHeader>
            <CardTitle>Top Channels by Traffic</CardTitle>
            <CardDescription>Highest bandwidth usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topChannels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      channel.status === 'active' ? 'bg-status-active' : 
                      channel.status === 'standby' ? 'bg-status-standby' : 'bg-status-fault'
                    }`} />
                    <span className="font-medium">{channel.name}</span>
                  </div>
                  <span className="text-sm">{channel.bandwidth}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* System Alerts */}
        <AlertsComponent title="System Alerts" />
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <button className="py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Add Channel
          </button>
          <button className="py-2 px-4 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors">
            Run Diagnostics
          </button>
          <button className="py-2 px-4 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors">
            System Health Report
          </button>
          <button className="py-2 px-4 rounded-md border hover:bg-secondary transition-colors">
            Configure Alerts
          </button>
        </CardContent>
      </Card>

      {selectedChannel && (
        <ChannelDetailsDialog channel={selectedChannel} />
      )}
    </div>
  );
}
