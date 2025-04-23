import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlayCircle, PauseCircle, MoreVertical, Plus, Trash2, Pencil } from "lucide-react";

// Type definition for a source
type Source = {
  id: number;
  name: string;
  encryptedMulticastAddress: string;
  unencryptedMulticastAddress: string;
  portNumber: number;
  status: "play" | "pause";
  arterySendTo: string;
};

// Mock data for arterial channels
const arteries = [
  { id: "artery1", name: "Artery 1" },
  { id: "artery2", name: "Artery 2" },
  { id: "artery3", name: "Artery 3" },
  { id: "all", name: "All Arteries" }
];

// Initial mock data for sources
const initialSources: Source[] = [
  {
    id: 1,
    name: "Main Channel Source",
    encryptedMulticastAddress: "239.255.1.1",
    unencryptedMulticastAddress: "239.255.2.1",
    portNumber: 11111,
    status: "play",
    arterySendTo: "all"
  },
  {
    id: 2,
    name: "Backup Channel Source",
    encryptedMulticastAddress: "239.255.1.2",
    unencryptedMulticastAddress: "239.255.2.2",
    portNumber: 11111,
    status: "play",
    arterySendTo: "artery1"
  },
  {
    id: 3,
    name: "External Feed Source",
    encryptedMulticastAddress: "239.255.1.3",
    unencryptedMulticastAddress: "239.255.2.3",
    portNumber: 11111,
    status: "pause",
    arterySendTo: "artery2"
  }
];

export default function Sources() {
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state for the new/edited source
  const [formValues, setFormValues] = useState<Source>({
    id: 0,
    name: "",
    encryptedMulticastAddress: "",
    unencryptedMulticastAddress: "",
    portNumber: 11111,
    status: "play",
    arterySendTo: "all"
  });

  // Handle opening the dialog for adding a new source
  const handleAddSource = () => {
    setIsEditMode(false);
    setFormValues({
      id: sources.length > 0 ? Math.max(...sources.map(s => s.id)) + 1 : 1,
      name: "",
      encryptedMulticastAddress: "",
      unencryptedMulticastAddress: "",
      portNumber: 11111,
      status: "play",
      arterySendTo: "all"
    });
    setIsDialogOpen(true);
  };

  // Handle opening the dialog for editing an existing source
  const handleEditSource = (source: Source) => {
    setIsEditMode(true);
    setFormValues({ ...source });
    setIsDialogOpen(true);
  };

  // Handle deleting a source
  const handleDeleteSource = (id: number) => {
    setSources(sources.filter(source => source.id !== id));
  };

  // Handle toggling the status of a source
  const handleToggleStatus = (id: number) => {
    setSources(sources.map(source =>
      source.id === id
        ? { ...source, status: source.status === "play" ? "pause" : "play" }
        : source
    ));
  };

  // Handle form input changes
  const handleFormChange = (field: keyof Source, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle saving the source
  const handleSaveSource = () => {
    if (isEditMode) {
      // Update existing source
      setSources(sources.map(source =>
        source.id === formValues.id ? formValues : source
      ));
    } else {
      // Add new source
      setSources([...sources, formValues]);
    }
    setIsDialogOpen(false);
  };

  // Filter sources based on search query
  const filteredSources = sources.filter(source =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.encryptedMulticastAddress.includes(searchQuery) ||
    source.unencryptedMulticastAddress.includes(searchQuery) ||
    String(source.portNumber).includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Sources</h1>
        <Button onClick={handleAddSource}>
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
          <CardDescription>Manage input connections for all arterial channels</CardDescription>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center border rounded-md">
              <p className="text-muted-foreground mb-4">No sources configured yet</p>
              <Button onClick={handleAddSource}>Add Your First Source</Button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Input
                  placeholder="Search sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <div className="border rounded-md overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-7 p-3 bg-gray-800 text-gray-300 font-medium">
                  <div>Source Name <span className="text-xs opacity-60">↑</span></div>
                  <div>Encrypted Multicast <span className="text-xs opacity-60">↓</span></div>
                  <div>Unencrypted Multicast <span className="text-xs opacity-60">↓</span></div>
                  <div>Port <span className="text-xs opacity-60">↓</span></div>
                  <div>Artery Assignment <span className="text-xs opacity-60">↓</span></div>
                  <div>Status <span className="text-xs opacity-60">↓</span></div>
                  <div></div>
                </div>

                {/* Table Rows */}
                {filteredSources.length > 0 ? (
                  filteredSources.map((source, index) => (
                    <div
                      key={source.id}
                      className={`grid grid-cols-7 p-3 hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}`}
                    >
                      <div className="font-medium text-white">{source.name}</div>
                      <div className="font-mono text-sm text-gray-300">{source.encryptedMulticastAddress}</div>
                      <div className="font-mono text-sm text-gray-300">{source.unencryptedMulticastAddress}</div>
                      <div className="text-gray-300">{source.portNumber}</div>
                      <div>
                        <Badge
                          variant="default"
                          className="bg-blue-600 hover:bg-blue-600 text-white border-none"
                        >
                          {arteries.find(a => a.id === source.arterySendTo)?.name || source.arterySendTo}
                        </Badge>
                      </div>
                      <div>
                        <Badge
                          variant="default"
                          className={
                            source.status === 'play'
                              ? 'bg-green-600 hover:bg-green-600 text-white border-none'
                              : 'bg-amber-600 hover:bg-amber-600 text-white border-none'
                          }
                        >
                          {source.status === 'play' ? 'Play' : 'Pause'}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditSource(source)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Source
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(source.id)}>
                              {source.status === "play"
                                ? <PauseCircle className="h-4 w-4 mr-2" />
                                : <PlayCircle className="h-4 w-4 mr-2" />
                              }
                              {source.status === "play" ? "Pause Source" : "Play Source"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteSource(source.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Source
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-300 bg-gray-900">
                    No sources found matching your search
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Source Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Source" : "Add New Source"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modify the source configuration"
                : "Define a new input source for the arterial channels"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Source Name</Label>
              <Input
                id="name"
                value={formValues.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="Enter source name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="encrypted-multicast">Encrypted Multicast Address</Label>
              <Input
                id="encrypted-multicast"
                value={formValues.encryptedMulticastAddress}
                onChange={(e) => handleFormChange("encryptedMulticastAddress", e.target.value)}
                placeholder="e.g., 239.255.1.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unencrypted-multicast">Unencrypted Multicast Address</Label>
              <Input
                id="unencrypted-multicast"
                value={formValues.unencryptedMulticastAddress}
                onChange={(e) => handleFormChange("unencryptedMulticastAddress", e.target.value)}
                placeholder="e.g., 239.255.2.1"
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
              <Label htmlFor="artery">Send to Artery</Label>
              <Select
                value={formValues.arterySendTo}
                onValueChange={(value) => handleFormChange("arterySendTo", value)}
              >
                <SelectTrigger id="artery">
                  <SelectValue placeholder="Select artery destination" />
                </SelectTrigger>
                <SelectContent>
                  {arteries.map((artery) => (
                    <SelectItem key={artery.id} value={artery.id}>
                      {artery.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Default is to send to all arteries</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formValues.status}
                onValueChange={(value) => handleFormChange("status", value)}
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

            <div className="rounded-md bg-blue-50 p-4 mt-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Automatic settings</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc space-y-1 pl-5">
                      <li>Protocol: UDP TS</li>
                      <li>Advanced settings: Enabled</li>
                      <li>AES Encryption: None</li>
                      <li>IGMP Source Filtering: Enabled</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSource}>
              {isEditMode ? "Save Changes" : "Add Source"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}