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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { MoreVertical, Settings, Database, Share2, Activity, ArrowUp, ArrowDown } from "lucide-react";
import { ChannelCircle } from "@/components/dashboard/ChannelCircle";
import { useForm } from "react-hook-form";

// Extended Channel type with more configuration options
type Channel = {
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

export default function Channels() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "standby" | "fault">("all");
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [openChannelDialog, setOpenChannelDialog] = useState(false);
  
  // Form for editing a channel
  const form = useForm<Channel>({
    defaultValues: selectedChannel || {
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
      header: "Online",
      accessorKey: "online",
      cell: (channel) => (
        <Badge
          variant="outline"
          className={
            channel.online ? 'border-green-500 text-green-600 bg-green-50/50 dark:bg-green-900/10' :
            'border-red-500 text-red-600 bg-red-50/50 dark:bg-red-900/10'
          }
        >
          {channel.online ? 'Online' : 'Offline'}
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
            <DropdownMenuItem onClick={() => handleEditChannel(channel)}>Edit Channel</DropdownMenuItem>
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
    setOpenChannelDialog(true);
  };
  
  const handleEditChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    form.reset(channel);
    setOpenChannelDialog(true);
  };
  
  const handleCreateChannel = () => {
    setSelectedChannel(null);
    form.reset({
      id: channelsData.length + 1,
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
      protocol: "UDP TS",
      bitrateIn: 0,
      bitrateOut: 0
    });
    setOpenChannelDialog(true);
  };
  
  // Filter data based on status filter
  const filteredData = statusFilter === "all" 
    ? channelsData 
    : channelsData.filter(channel => channel.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <Button onClick={handleCreateChannel}>Add Channel</Button>
      </div>
      
      {/* Channel Health Overview */}
      {/* <div className="grid gap-4 lg:grid-cols-5 md:grid-cols-3 grid-cols-2">
        {channelsData.slice(0, 5).map(channel => (
          <ChannelCircle
            key={channel.id}
            name={channel.name}
            channelLink1Status={channel.primaryDestinationIp ? "online" : "offline"}
            channelLink2Status={channel.secondaryDestinationIp ? "online" : "offline"}
            cpu={Math.floor(Math.random() * 80) + 10} // Mockup CPU load
            ram={Math.floor(Math.random() * 70) + 20} // Mockup RAM usage
            bitrateIn={channel.bitrateIn || 0}
            bitrateOut={channel.bitrateOut || 0}
          />
        ))}
      </div> */}
      
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
      
      {/* Channel Details/Edit Dialog */}
      <Dialog open={openChannelDialog} onOpenChange={setOpenChannelDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedChannel ? `Channel: ${selectedChannel.name}` : 'Create New Channel'}</DialogTitle>
            <DialogDescription>
              {selectedChannel ? 'View or edit channel configuration' : 'Configure a new channel'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general">
                <Settings className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="sources">
                <Database className="h-4 w-4 mr-2" />
                Sources
              </TabsTrigger>
              <TabsTrigger value="destinations">
                <Share2 className="h-4 w-4 mr-2" />
                Destinations
              </TabsTrigger>
              <TabsTrigger value="monitoring">
                <Activity className="h-4 w-4 mr-2" />
                Monitoring
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="channel-name">Channel Name</Label>
                  <Input 
                    id="channel-name" 
                    defaultValue={selectedChannel?.name} 
                    placeholder="Enter channel name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="broadcast-ip">Broadcast IP Address</Label>
                  <Input 
                    id="broadcast-ip" 
                    defaultValue={selectedChannel?.broadcastIp} 
                    placeholder="e.g., 239.255.0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="channel-mode">Channel Mode</Label>
                  <Select defaultValue={selectedChannel?.mode || "active"}>
                    <SelectTrigger id="channel-mode">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="passive">Passive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="channel-status">Channel Status</Label>
                  <Select defaultValue={selectedChannel?.online ? "online" : "offline"}>
                    <SelectTrigger id="channel-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="channel-protocol">Protocol</Label>
                  <Select defaultValue={selectedChannel?.protocol || "UDP TS"}>
                    <SelectTrigger id="channel-protocol">
                      <SelectValue placeholder="Select protocol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UDP TS">UDP TS</SelectItem>
                      <SelectItem value="RTP">RTP</SelectItem>
                      <SelectItem value="RIST">RIST</SelectItem>
                      <SelectItem value="SRT">SRT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="encryption">Encryption</Label>
                  <Select defaultValue={selectedChannel?.encryptionEnabled ? "enabled" : "disabled"}>
                    <SelectTrigger id="encryption">
                      <SelectValue placeholder="Select encryption" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sources" className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Source Configuration</h3>
                  <Button variant="outline" size="sm">Add Source</Button>
                </div>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid gap-4 grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="source-name">Source Name</Label>
                        <Input id="source-name" defaultValue={selectedChannel?.source} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="source-ip">Source IP</Label>
                        <Input id="source-ip" placeholder="Enter source IP" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="source-status">Default Status</Label>
                        <Select defaultValue="enabled">
                          <SelectTrigger id="source-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="enabled">Always Enabled</SelectItem>
                            <SelectItem value="fallback">Fallback Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="source-protocol">Protocol</Label>
                        <Select defaultValue="UDP TS">
                          <SelectTrigger id="source-protocol">
                            <SelectValue placeholder="Select protocol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UDP TS">UDP TS</SelectItem>
                            <SelectItem value="RTP">RTP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="destinations" className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Destination Configuration</h3>
                  <Button variant="outline" size="sm">Add Destination</Button>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Primary Destination</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="destination-name">Destination Name</Label>
                        <Input id="destination-name" defaultValue={selectedChannel?.destination} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="destination-ip">Destination IP</Label>
                        <Input id="destination-ip" defaultValue={selectedChannel?.primaryDestinationIp} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ttl">Time to Live (TTL)</Label>
                        <Input id="ttl" type="number" defaultValue="64" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-packet">Max Packet Size</Label>
                        <Input id="max-packet" type="number" defaultValue="1500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {selectedChannel?.secondaryDestinationIp && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Secondary Destination</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="sec-destination-name">Destination Name</Label>
                          <Input id="sec-destination-name" defaultValue={`${selectedChannel?.destination} (Backup)`} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sec-destination-ip">Destination IP</Label>
                          <Input id="sec-destination-ip" defaultValue={selectedChannel?.secondaryDestinationIp} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="monitoring" className="space-y-4">
              {selectedChannel && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Bandwidth</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <ArrowDown className="h-5 w-5 mr-2 text-blue-500" />
                            <span>Input</span>
                          </div>
                          <span className="font-mono">{selectedChannel.bitrateIn || 0} Mbps</span>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center">
                            <ArrowUp className="h-5 w-5 mr-2 text-emerald-500" />
                            <span>Output</span>
                          </div>
                          <span className="font-mono">{selectedChannel.bitrateOut || 0} Mbps</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Link Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Primary Link</span>
                          <Badge variant="outline" className={selectedChannel.primaryDestinationIp ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}>
                            {selectedChannel.primaryDestinationIp ? "Connected" : "Disconnected"}
                          </Badge>
                        </div>
                        {selectedChannel.secondaryDestinationIp && (
                          <div className="flex justify-between items-center">
                            <span>Secondary Link</span>
                            <Badge variant="outline" className="border-green-500 text-green-600">
                              Connected
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] w-full flex items-center justify-center bg-muted/30 rounded-md">
                        <p className="text-muted-foreground">Performance graph would appear here</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenChannelDialog(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
