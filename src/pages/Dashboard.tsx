import { AlertsComponent } from "@/components/alerts/AlertsComponent";
import { ChannelDetailsDialog } from "@/components/dashboard/ChannelDetailsDialog";
import { DashboardStatusCards } from "@/components/dashboard/DashboardStatusCards";
import { DashboardChannelsTable } from "@/components/dashboard/DashboardChannelsTable";
import { BandwidthUsageGraph } from "@/components/dashboard/BandwidthUsageGraph";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TopChannels } from "@/components/dashboard/TopChannels";

import type { Channel } from "@/components/dashboard/DashboardChannelsTable";

import { useForm } from "react-hook-form";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast"; // אם יש לך קומפוננט של toast

import { Badge } from "@/components/ui/badge";

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
import { Settings, Database, Share2, Activity, ArrowUp, ArrowDown } from "lucide-react";

// קבוע המגדיר את כתובת ה-API
const API_URL = 'http://localhost:3000/api';

// פונקציה עזר לקבלת/יצירת token
const getAuthToken = async () => {
  // בדיקה אם יש token קיים ב-localStorage
  let token = localStorage.getItem('auth_token');

  // אם אין token, יצירת אחד חדש
  if (!token) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'password'
        }),
      });

      const data = await response.json();

      if (data.success && data.data.access_token) {
        token = data.data.access_token;
        localStorage.setItem('auth_token', token);
      } else {
        throw new Error('Failed to login');
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw error;
    }
  }

  return token;
};

// פונקציה עזר לביצוע קריאות API עם אימות
const fetchWithAuth = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    // אם קיבלנו שגיאת 401 (לא מורשה), ננסה לקבל token חדש
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      const newToken = await getAuthToken();

      // נסיון נוסף עם ה-token החדש
      const newResponse = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });

      if (!newResponse.ok) {
        throw new Error(`API request failed: ${newResponse.statusText}`);
      }

      return newResponse.json();
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
};

export default function Dashboard() {
  // State for data
  const [channelStats, setChannelStats] = useState({
    total: 0,
    active: 0,
    standby: 0,
    fault: 0
  });

  const [topChannels, setTopChannels] = useState([]);
  const [arteryChannels, setArteryChannels] = useState([]);
  const [channelsData, setChannelsData] = useState<Channel[]>([]);
  const [sources, setSources] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog and form state
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [openChannelDialog, setOpenChannelDialog] = useState(false);
  const [isCreatingNewChannel, setIsCreatingNewChannel] = useState(false);

  const form = useForm<Channel>({
    defaultValues: {
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
      protocol: "UDP TS",
      bitrateIn: 0,
      bitrateOut: 0
    }
  });

  // Fetch data from server
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch dashboard status for overall stats
        const statusData = await fetchWithAuth('/dashboard/status');
        if (statusData.success) {
          setChannelStats(statusData.data);
        }

        // Fetch channels
        const channelsResponse = await fetchWithAuth('/arteries');
        if (!channelsResponse.success) {
          throw new Error('Failed to fetch channels');
        }

        // Fetch sources
        const sourcesResponse = await fetchWithAuth('/sources');
        if (!sourcesResponse.success) {
          throw new Error('Failed to fetch sources');
        }

        // Fetch destinations
        const destinationsResponse = await fetchWithAuth('/destinations');
        if (!destinationsResponse.success) {
          throw new Error('Failed to fetch destinations');
        }

        // Fetch alerts
        const alertsResponse = await fetchWithAuth('/dashboard/alerts');
        if (!alertsResponse.success) {
          throw new Error('Failed to fetch alerts');
        }

        // Get top channels
        const topChannelsResponse = await fetchWithAuth('/dashboard/arteries/top');
        if (topChannelsResponse.success) {
          setTopChannels(topChannelsResponse.data);
        }

        // Set raw data
        setSources(sourcesResponse.data.data);
        setDestinations(destinationsResponse.data.data);
        setAlerts(alertsResponse.data);

        // Process the channels data
        processData(
          channelsResponse.data.data,
          sourcesResponse.data.data,
          destinationsResponse.data.data,
          alertsResponse.data
        );

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setIsLoading(false);

        if (err.message.includes('Failed to fetch')) {
          toast({
            title: "שרת לא זמין",
            description: "נא לוודא שהשרת פועל ועל פורט 3000",
            variant: "destructive"
          });
        }
      }
    };

    fetchData();
  }, []);

  // Process the fetched data
  const processData = (channels, sources, destinations, alerts) => {
    // Map channels to the format expected by the components
    const mappedChannels = channels.map(channel => {
      // Find the source and destination names
      const source = sources.find(s => s.id === channel.sourceId);
      const destination = destinations.find(d => d.id === channel.destinationId);

      return {
        id: channel.id,
        name: channel.name,
        source: source ? source.name : 'Unknown Source',
        destination: destination ? destination.name : 'Unknown Destination',
        bandwidth: channel.bandwidth,
        status: channel.status,
        broadcastIp: channel.broadcastIp,
        mode: channel.mode,
        online: channel.online,
        primaryDestinationIp: channel.primaryDestinationIp,
        secondaryDestinationIp: channel.secondaryDestinationIp,
        encryptionEnabled: channel.encryptionEnabled,
        protocol: channel.protocol,
        bitrateIn: channel.bitrateIn,
        bitrateOut: channel.bitrateOut
      };
    });

    // Set the channels data
    setChannelsData(mappedChannels);

    // Create artery channels for the scrollable component
    const arteryChannelsData = channels.map(channel => {
      const source = sources.find(s => s.id === channel.sourceId);
      const destination = destinations.find(d => d.id === channel.destinationId);

      return {
        name: channel.name,
        channelLink1Status: channel.online ? "online" : "offline",
        channelLink2Status: channel.secondaryDestinationIp ? "online" : "offline",
        cpu: Math.floor(Math.random() * 80) + 10, // Simulate CPU usage since server doesn't provide this
        ram: Math.floor(Math.random() * 70) + 20, // Simulate RAM usage since server doesn't provide this
        bitrateIn: channel.bitrateIn,
        bitrateOut: channel.bitrateOut,
        broadcastIP: channel.broadcastIp,
        mode: channel.mode,
        sources: [
          {
            name: source ? source.name : "Primary Source",
            ip: source ? source.ipAddress : "Unknown IP",
            status: "enabled"
          },
          ...(source ? [{
            name: "Backup Source",
            ip: source.ipAddress.replace(/\.\d+$/, '.11'), // Create a backup IP based on primary
            status: "fallback"
          }] : [])
        ],
        destinations: [
          {
            name: destination ? destination.name : "Main Output",
            ip: channel.primaryDestinationIp,
            type: "primary"
          },
          ...(channel.secondaryDestinationIp ? [{
            name: "Backup Output",
            ip: channel.secondaryDestinationIp,
            type: "secondary"
          }] : [])
        ]
      };
    });

    setArteryChannels(arteryChannelsData);

    // Set top channels based on API response if not already set
    if (topChannels.length === 0) {
      // Calculate top channels if not received from API
      const sortedChannels = [...channels]
        .sort((a, b) => {
          // Extract numeric part from bandwidth string and convert to number
          const getBandwidthValue = (bw) => {
            if (typeof bw === 'string') {
              const match = bw.match(/(\d+\.?\d*)/);
              return match ? parseFloat(match[1]) : 0;
            }
            return typeof bw === 'number' ? bw : 0;
          };

          const bandwidthA = getBandwidthValue(a.bandwidth);
          const bandwidthB = getBandwidthValue(b.bandwidth);
          return bandwidthB - bandwidthA;
        })
        .slice(0, 5)
        .map(channel => ({
          id: channel.id,
          name: channel.name,
          bandwidth: channel.bandwidth,
          status: channel.status
        }));

      setTopChannels(sortedChannels);
    }
  };

  // Map Channel type to the format expected by ChannelDetailsDialog
  const mapChannelToDialogFormat = (channel: Channel) => {
    return {
      name: channel.name,
      channelLink1Status: channel.online ? "online" : "offline" as "online" | "offline",
      channelLink2Status: channel.secondaryDestinationIp ? "online" : "offline" as "online" | "offline",
      cpu: Math.floor(Math.random() * 80) + 10,
      ram: Math.floor(Math.random() * 70) + 20,
      bitrateIn: channel.bitrateIn || 0,
      bitrateOut: channel.bitrateOut || 0,
      broadcastIP: channel.broadcastIp,
      mode: channel.mode,
      sources: [
        {
          name: "Primary Source",
          ip: channel.source,
          status: "enabled" as "enabled" | "fallback"
        }
      ],
      destinations: [
        {
          name: "Main Output",
          ip: channel.primaryDestinationIp || "",
          type: "primary" as "primary" | "secondary"
        },
        ...(channel.secondaryDestinationIp ? [{
          name: "Backup Output",
          ip: channel.secondaryDestinationIp,
          type: "secondary" as "primary" | "secondary"
        }] : [])
      ]
    };
  };

  const handleCreateChannel = () => {
    setIsCreatingNewChannel(true);
    setSelectedChannel(null);
    form.reset({
      id: channelsData.length > 0 ? Math.max(...channelsData.map(ch => ch.id)) + 1 : 1,
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

  const handleViewChannel = (channel: Channel) => {
    setIsCreatingNewChannel(false);
    setSelectedChannel(channel);
    form.reset(channel);
    setOpenChannelDialog(true);
  };

  const handleSaveChannel = async () => {
    const formValues = form.getValues();

    try {
      if (isCreatingNewChannel) {
        // Prepare data for API
        const newChannelData = {
          id: formValues.id,
          name: formValues.name,
          sourceId: sources.find(s => s.name === formValues.source)?.id || 1,
          destinationId: destinations.find(d => d.name === formValues.destination)?.id || 1,
          status: formValues.status,
          mode: formValues.mode,
          bandwidth: formValues.bandwidth,
          broadcastIp: formValues.broadcastIp,
          online: formValues.online,
          primaryDestinationIp: formValues.primaryDestinationIp,
          secondaryDestinationIp: formValues.secondaryDestinationIp,
          encryptionEnabled: formValues.encryptionEnabled,
          protocol: formValues.protocol,
          bitrateIn: formValues.bitrateIn,
          bitrateOut: formValues.bitrateOut
        };

        // Create new channel
        const response = await fetchWithAuth('/arteries', {
          method: 'POST',
          body: JSON.stringify(newChannelData),
        });

        if (!response.success) {
          throw new Error('Failed to create channel');
        }

        toast({
          title: "ערוץ נוצר בהצלחה",
          description: `הערוץ ${newChannelData.name} נוצר בהצלחה`,
        });
      } else if (selectedChannel) {
        // Prepare data for API
        const updatedChannelData = {
          id: formValues.id,
          name: formValues.name,
          sourceId: sources.find(s => s.name === formValues.source)?.id ||
            sources.find(s => s.id === selectedChannel.sourceId)?.id || 1,
          destinationId: destinations.find(d => d.name === formValues.destination)?.id ||
            destinations.find(d => d.id === selectedChannel.destinationId)?.id || 1,
          status: formValues.status,
          mode: formValues.mode,
          bandwidth: formValues.bandwidth,
          broadcastIp: formValues.broadcastIp,
          online: formValues.online,
          primaryDestinationIp: formValues.primaryDestinationIp,
          secondaryDestinationIp: formValues.secondaryDestinationIp,
          encryptionEnabled: formValues.encryptionEnabled,
          protocol: formValues.protocol,
          bitrateIn: formValues.bitrateIn,
          bitrateOut: formValues.bitrateOut
        };

        // Update existing channel
        const response = await fetchWithAuth(`/arteries/${selectedChannel.id}`, {
          method: 'PUT',
          body: JSON.stringify(updatedChannelData),
        });

        if (!response.success) {
          throw new Error('Failed to update channel');
        }

        toast({
          title: "ערוץ עודכן בהצלחה",
          description: `הערוץ ${updatedChannelData.name} עודכן בהצלחה`,
        });
      }

      // Refresh data after successful operation
      setOpenChannelDialog(false);
      setIsLoading(true);

      // Reload all data
      const channelsResponse = await fetchWithAuth('/arteries');
      const sourcesResponse = await fetchWithAuth('/sources');
      const destinationsResponse = await fetchWithAuth('/destinations');
      const alertsResponse = await fetchWithAuth('/dashboard/alerts');

      setSources(sourcesResponse.data.data);
      setDestinations(destinationsResponse.data.data);
      setAlerts(alertsResponse.data);

      processData(
        channelsResponse.data.data,
        sourcesResponse.data.data,
        destinationsResponse.data.data,
        alertsResponse.data
      );

      setIsLoading(false);

    } catch (err) {
      console.error('Error saving channel:', err);
      toast({
        title: "שגיאה בשמירת הערוץ",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state if data fetching failed
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      <DashboardStatusCards stats={channelStats} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg md:text-xl font-semibold">Live Artery Status</CardTitle>
          <Button onClick={handleCreateChannel}>Add Artery</Button>
        </CardHeader>
        <Dialog open={openChannelDialog} onOpenChange={setOpenChannelDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{isCreatingNewChannel ? 'Create New Artery' : `Artery: ${selectedChannel?.name}`}</DialogTitle>
              <DialogDescription>
                {isCreatingNewChannel ? 'Configure a new Artery' : 'View or edit artery configuration'}
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
                      {...form.register('name')}
                      placeholder="Enter channel name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="broadcast-ip">Broadcast IP Address</Label>
                    <Input
                      id="broadcast-ip"
                      {...form.register('broadcastIp')}
                      placeholder="e.g., 239.255.0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="channel-mode">Channel Mode</Label>
                    <Select
                      defaultValue={form.getValues().mode}
                      onValueChange={(value) => form.setValue('mode', value as "active" | "passive")}
                    >
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
                    <Select
                      defaultValue={form.getValues().online ? "online" : "offline"}
                      onValueChange={(value) => form.setValue('online', value === "online")}
                    >
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
                    <Select
                      defaultValue={form.getValues().protocol}
                      onValueChange={(value) => form.setValue('protocol', value)}
                    >
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
                    <Select
                      defaultValue={form.getValues().encryptionEnabled ? "enabled" : "disabled"}
                      onValueChange={(value) => form.setValue('encryptionEnabled', value === "enabled")}
                    >
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
                          <Select
                            defaultValue={form.getValues().source}
                            onValueChange={(value) => form.setValue('source', value)}
                          >
                            <SelectTrigger id="source-name">
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                              {sources.map(source => (
                                <SelectItem key={source.id} value={source.name}>{source.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="source-ip">Source IP</Label>
                          <Input
                            id="source-ip"
                            placeholder="Source IP is determined by selected source"
                            disabled
                            value={sources.find(s => s.name === form.getValues().source)?.ipAddress || ''}
                          />
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
                          <Input
                            id="source-protocol"
                            placeholder="Protocol is determined by selected source"
                            disabled
                            value={sources.find(s => s.name === form.getValues().source)?.protocol || ''}
                          />
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
                          <Select
                            defaultValue={form.getValues().destination}
                            onValueChange={(value) => form.setValue('destination', value)}
                          >
                            <SelectTrigger id="destination-name">
                              <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                            <SelectContent>
                              {destinations.map(destination => (
                                <SelectItem key={destination.id} value={destination.name}>{destination.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="destination-ip">Destination IP</Label>
                          <Input
                            id="destination-ip"
                            {...form.register('primaryDestinationIp')} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ttl">Time to Live (TTL)</Label>
                          <Input
                            id="ttl"
                            type="number"
                            defaultValue={destinations.find(d => d.name === form.getValues().destination)?.timeToLive || 64}
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max-packet">Max Packet Size</Label>
                          <Input
                            id="max-packet"
                            type="number"
                            defaultValue={destinations.find(d => d.name === form.getValues().destination)?.maxPacketSize || 1500}
                            disabled
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-base">Secondary Destination</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="enable-secondary" className="cursor-pointer">Enable Secondary</Label>
                        <input
                          type="checkbox"
                          id="enable-secondary"
                          checked={!!form.getValues().secondaryDestinationIp}
                          onChange={(e) => {
                            if (!e.target.checked) {
                              form.setValue('secondaryDestinationIp', null);
                            } else if (!form.getValues().secondaryDestinationIp) {
                              form.setValue('secondaryDestinationIp', '');
                            }
                          }}
                          className="h-4 w-4"
                        />
                      </div>
                    </CardHeader>
                    {form.getValues().secondaryDestinationIp !== null && (
                      <CardContent>
                        <div className="grid gap-4 grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="sec-destination-name">Destination Name</Label>
                            <Input
                              id="sec-destination-name"
                              defaultValue={`${form.getValues().destination || ''} (Backup)`}
                              disabled
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sec-destination-ip">Destination IP</Label>
                            <Input
                              id="sec-destination-ip"
                              {...form.register('secondaryDestinationIp')}
                            />
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
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
              <Button type="button" onClick={handleSaveChannel}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <CardContent>
          <div className="relative">
            {/* Scrollable container */}
            <div
              className="flex space-x-4 overflow-x-auto px-2 
              scrollbar-none [-ms-overflow-style:none] 
              [scrollbar-width:none] 
              [&::-webkit-scrollbar]:hidden"
              id="channel-scroll-container"
            >
              {arteryChannels.map((ch, index) => (
                <ChannelDetailsDialog key={index} channel={ch} />
              ))}
            </div>

            {/* Scroll right button */}
            <button
              onClick={() => {
                const container = document.getElementById("channel-scroll-container");
                const cards = container?.querySelectorAll("div > [role='dialog'], div > div");
                if (container && cards?.length) {
                  // Find width of 5 cards + spacing
                  const cardWidth = (cards[0] as HTMLElement).offsetWidth;
                  const cardSpacing = 16; // This matches your space-x-4 (4 × 4px = 16px)
                  const scrollAmount = (cardWidth + cardSpacing) * 5;
                  container.scrollBy({ left: scrollAmount, behavior: "smooth" });
                }
              }}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 shadow-md rounded-full p-2 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Scroll left button */}
            <button
              onClick={() => {
                const container = document.getElementById("channel-scroll-container");
                const cards = container?.querySelectorAll("div > [role='dialog'], div > div");
                if (container && cards?.length) {
                  // Find width of 5 cards + spacing
                  const cardWidth = (cards[0] as HTMLElement).offsetWidth;
                  const cardSpacing = 16; // This matches your space-x-4 (4 × 4px = 16px)
                  const scrollAmount = (cardWidth + cardSpacing) * 5;
                  container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
                }
              }}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 shadow-md rounded-full p-2 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </CardContent>
      </Card>

      <DashboardChannelsTable
        data={channelsData}
        onViewChannel={handleViewChannel}
      />

      <BandwidthUsageGraph />

      <div className="grid gap-4 md:grid-cols-2 grid-cols-1">
        <TopChannels channels={topChannels} />
        <AlertsComponent title="System Alerts" />
      </div>

      <QuickActions />

      {selectedChannel && (
        <ChannelDetailsDialog channel={mapChannelToDialogFormat(selectedChannel)} />
      )}
    </div>
  );
}