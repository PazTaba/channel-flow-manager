
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveDataTable, Column } from "@/components/data/ResponsiveDataTable";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, MoreVertical, PlayCircle, PauseCircle, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Type definition for a destination
type Destination = {
  id: number;
  name: string;
  destinationIp: string;
  portNumber: number;
  status: "play" | "pause";
  protocol: string;
  timeToLive: number;
  maxPacketSize: number;
  encryption: string;
  primaryIp?: string;
  secondaryIp?: string;
};

// Initial mock data for destinations
const initialDestinations: Destination[] = [
  {
    id: 1,
    name: "Primary Output Channel",
    destinationIp: "10.10.10.1",
    portNumber: 11111,
    status: "play",
    protocol: "UDP TS",
    timeToLive: 64,
    maxPacketSize: 1316,
    encryption: "None",
    primaryIp: "10.15.20.1",
    secondaryIp: "10.15.20.2"
  },
  {
    id: 2,
    name: "Backup Output Channel",
    destinationIp: "10.10.10.2",
    portNumber: 11111,
    status: "play",
    protocol: "UDP TS",
    timeToLive: 32,
    maxPacketSize: 1316,
    encryption: "None",
    primaryIp: "10.16.20.1",
    secondaryIp: "10.16.20.2"
  },
  {
    id: 3,
    name: "External Output Channel",
    destinationIp: "10.10.10.3",
    portNumber: 11111,
    status: "pause",
    protocol: "UDP TS",
    timeToLive: 64,
    maxPacketSize: 1316,
    encryption: "None",
    primaryIp: "10.17.20.1",
    secondaryIp: "10.17.20.2"
  }
];

export default function Destinations() {
  const { toast } = useToast();
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formValues, setFormValues] = useState<Destination>({
    id: 0,
    name: "",
    destinationIp: "",
    portNumber: 11111,
    status: "play",
    protocol: "UDP TS",
    timeToLive: 64,
    maxPacketSize: 1316,
    encryption: "None",
    primaryIp: "",
    secondaryIp: ""
  });

  // Filter destinations based on search query
  const filteredDestinations = destinations.filter(destination =>
    destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.destinationIp.includes(searchQuery) ||
    String(destination.portNumber).includes(searchQuery)
  );

  // Handle opening the dialog for adding a new destination
  const handleAddDestination = () => {
    setIsEditMode(false);
    setFormValues({
      id: destinations.length > 0 ? Math.max(...destinations.map(d => d.id)) + 1 : 1,
      name: "",
      destinationIp: "",
      portNumber: 11111,
      status: "play",
      protocol: "UDP TS",
      timeToLive: 64,
      maxPacketSize: 1316,
      encryption: "None",
      primaryIp: "",
      secondaryIp: ""
    });
    setIsDialogOpen(true);
  };

  // Handle opening the dialog for editing an existing destination
  const handleEditDestination = (destination: Destination) => {
    setIsEditMode(true);
    setFormValues({ ...destination });
    setIsDialogOpen(true);
  };

  // Handle deleting a destination
  const handleDeleteDestination = (id: number) => {
    setDestinations(destinations.filter(destination => destination.id !== id));
    toast({
      title: "Destination deleted",
      description: "The destination has been successfully removed",
    });
  };

  // Handle toggling the status of a destination
  const handleToggleStatus = (id: number) => {
    setDestinations(destinations.map(destination =>
      destination.id === id
        ? { ...destination, status: destination.status === "play" ? "pause" : "play" }
        : destination
    ));
    
    const updatedDestination = destinations.find(destination => destination.id === id);
    const newStatus = updatedDestination?.status === "play" ? "pause" : "play";
    
    toast({
      title: `Destination ${newStatus === "play" ? "started" : "paused"}`,
      description: `The destination has been ${newStatus === "play" ? "activated" : "paused"} successfully`,
    });
  };

  // Handle form input changes
  const handleFormChange = (field: keyof Destination, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle saving the destination
  const handleSaveDestination = () => {
    if (isEditMode) {
      // Update existing destination
      setDestinations(destinations.map(destination =>
        destination.id === formValues.id ? formValues : destination
      ));
      
      toast({
        title: "Destination updated",
        description: "The destination has been updated successfully",
      });
    } else {
      // Add new destination
      setDestinations([...destinations, formValues]);
      
      toast({
        title: "Destination added",
        description: "New destination has been added successfully",
      });
    }
    setIsDialogOpen(false);
  };

  // Define table columns
  const columns: Column<Destination>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (destination) => <span className="font-medium">{destination.name}</span>,
      sortable: true
    },
    {
      header: "Destination IP",
      accessorKey: "destinationIp",
      cell: (destination) => (
        <code className="rounded bg-muted px-2 py-1">{destination.destinationIp}</code>
      ),
      sortable: true
    },
    {
      header: "Port",
      accessorKey: "portNumber",
      cell: (destination) => <span className="font-mono">{destination.portNumber}</span>,
      hideOnMobile: true,
      sortable: true
    },
    {
      header: "Protocol",
      accessorKey: "protocol",
      cell: (destination) => <span>{destination.protocol}</span>,
      hideOnMobile: true,
      sortable: true
    },
    {
      header: "TTL",
      accessorKey: "timeToLive",
      cell: (destination) => <span className="font-mono">{destination.timeToLive}</span>,
      hideOnMobile: true,
      sortable: true
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (destination) => (
        <Badge
          variant="outline"
          className={
            destination.status === 'play'
              ? 'border-green-500 text-green-600 bg-green-50/50 dark:bg-green-900/10'
              : 'border-amber-500 text-amber-600 bg-amber-50/50 dark:bg-amber-900/10'
          }
        >
          {destination.status === 'play' ? 'Play' : 'Pause'}
        </Badge>
      ),
      sortable: true
    },
    {
      header: "",
      accessorKey: "id",
      cell: (destination) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEditDestination(destination)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Destination
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleToggleStatus(destination.id)}
            >
              {destination.status === "play"
                ? <PauseCircle className="h-4 w-4 mr-2" />
                : <PlayCircle className="h-4 w-4 mr-2" />
              }
              {destination.status === "play" ? "Pause Destination" : "Play Destination"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => handleDeleteDestination(destination.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Destination
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-[50px]"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Destinations</h1>
        <Button onClick={handleAddDestination}>
          <Plus className="h-4 w-4 mr-2" />
          Add Destination
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Output Destinations</CardTitle>
          <CardDescription>Configure where your data is sent</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveDataTable
            data={filteredDestinations}
            columns={columns}
            keyField="id"
            searchable={true}
            searchPlaceholder="Search destinations..."
            pagination={true}
            pageSize={8}
            emptyMessage="No destinations configured yet"
          />
        </CardContent>
      </Card>

      {/* Destination Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Destination" : "Add New Destination"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modify the destination configuration"
                : "Define a new output destination for the arterial channels"}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Destination Name</Label>
                  <Input
                    id="name"
                    value={formValues.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    placeholder="Enter destination name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination-ip">Destination IP Address</Label>
                  <Input
                    id="destination-ip"
                    value={formValues.destinationIp}
                    onChange={(e) => handleFormChange("destinationIp", e.target.value)}
                    placeholder="e.g., 10.10.10.1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="port">Port Number</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formValues.portNumber}
                    onChange={(e) => handleFormChange("portNumber", parseInt(e.target.value))}
                    placeholder="Default: 11111"
                  />
                  <p className="text-xs text-muted-foreground">Default port is 11111</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formValues.status}
                    onValueChange={(value) => handleFormChange("status", value as "play" | "pause")}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="play">Play</SelectItem>
                      <SelectItem value="pause">Pause</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="protocol">Protocol</Label>
                  <Select
                    value={formValues.protocol}
                    onValueChange={(value) => handleFormChange("protocol", value)}
                  >
                    <SelectTrigger id="protocol">
                      <SelectValue placeholder="Select protocol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UDP TS">UDP TS</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="primary-ip">Primary IP</Label>
                  <Input
                    id="primary-ip"
                    value={formValues.primaryIp || ""}
                    onChange={(e) => handleFormChange("primaryIp", e.target.value)}
                    placeholder="Primary IP address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary-ip">Secondary IP</Label>
                  <Input
                    id="secondary-ip"
                    value={formValues.secondaryIp || ""}
                    onChange={(e) => handleFormChange("secondaryIp", e.target.value)}
                    placeholder="Secondary IP address (optional)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time-to-live">Time To Live (TTL)</Label>
                  <Input
                    id="time-to-live"
                    type="number"
                    value={formValues.timeToLive}
                    onChange={(e) => handleFormChange("timeToLive", parseInt(e.target.value))}
                    placeholder="Default: 64"
                  />
                  <p className="text-xs text-muted-foreground">Default TTL is 64</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-packet-size">Max Packet Size</Label>
                  <Input
                    id="max-packet-size"
                    type="number"
                    value={formValues.maxPacketSize}
                    onChange={(e) => handleFormChange("maxPacketSize", parseInt(e.target.value))}
                    placeholder="Default: 1316"
                  />
                  <p className="text-xs text-muted-foreground">Default size is 1316 bytes</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="encryption">AES Encryption</Label>
                  <Select
                    value={formValues.encryption}
                    onValueChange={(value) => handleFormChange("encryption", value)}
                  >
                    <SelectTrigger id="encryption">
                      <SelectValue placeholder="Select encryption" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="AES-128">AES-128</SelectItem>
                      <SelectItem value="AES-256">AES-256</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDestination}>
              {isEditMode ? "Save Changes" : "Add Destination"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
