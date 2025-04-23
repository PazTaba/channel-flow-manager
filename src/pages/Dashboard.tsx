
import { AlertsComponent } from "@/components/alerts/AlertsComponent";
import { ChannelDetailsDialog } from "@/components/dashboard/ChannelDetailsDialog";
import { DashboardStatusCards } from "@/components/dashboard/DashboardStatusCards";
import { DashboardChannelsTable } from "@/components/dashboard/DashboardChannelsTable";
import { BandwidthUsageGraph } from "@/components/dashboard/BandwidthUsageGraph";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TopChannels } from "@/components/dashboard/TopChannels";

import type { Channel } from "@/components/dashboard/DashboardChannelsTable";

import { useForm } from "react-hook-form";

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
import { Settings, Database, Share2, Activity, ArrowUp, ArrowDown } from "lucide-react";


// Mock data for dashboard
const channelStats = {
  total: 24,
  active: 18,
  standby: 4,
  fault: 2
};

// Fix the TopChannel status type to match the expected union type
const topChannels = [
  { id: 1, name: "Main Feed", bandwidth: "1.2 Gbps", status: "active" as const },
  { id: 2, name: "Backup Link", bandwidth: "850 Mbps", status: "active" as const },
  { id: 3, name: "Remote Site A", bandwidth: "620 Mbps", status: "active" as const },
  { id: 4, name: "Cloud Storage", bandwidth: "480 Mbps", status: "standby" as const },
  { id: 5, name: "Archive System", bandwidth: "350 Mbps", status: "active" as const }
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
  }
  // ... Add similar detailed data for other channels
];


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
  {
    id: 7, name: "Media Channel", source: "Media Server", destination: "CDN Node", bandwidth: "920 Mbps", status: "active",
    broadcastIp: "239.255.0.7",
    mode: "active",
    online: true,
    primaryDestinationIp: "239.255.7.1",
    secondaryDestinationIp: "239.255.7.2",
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 92,
    bitrateOut: 85
  },
  {
    id: 8, name: "Secure Link", source: "Secure Server", destination: "Encrypted Storage", bandwidth: "290 Mbps", status: "active",
    broadcastIp: "239.255.0.8",
    mode: "active",
    online: true,
    primaryDestinationIp: "239.255.8.1",
    secondaryDestinationIp: null,
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 29,
    bitrateOut: 22
  },
  {
    id: 9, name: "Analytics Feed", source: "User Systems", destination: "Analytics Server", bandwidth: "180 Mbps", status: "standby",
    broadcastIp: "239.255.0.9",
    mode: "passive",
    online: false,
    primaryDestinationIp: "239.255.9.1",
    secondaryDestinationIp: "239.255.9.2",
    encryptionEnabled: true,
    protocol: "UDP TS",
    bitrateIn: 18,
    bitrateOut: 11
  },
  {
    id: 10, name: "Disaster Recovery", source: "Primary DC", destination: "Secondary DC", bandwidth: "650 Mbps", status: "active",
    broadcastIp: "239.255.0.10",
    mode: "active",
    online: true,
    primaryDestinationIp: "239.255.10.1",
    secondaryDestinationIp: null,
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 65,
    bitrateOut: 58
  },
];

export default function Dashboard() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [openChannelDialog, setOpenChannelDialog] = useState(false);
  const [isCreatingNewChannel, setIsCreatingNewChannel] = useState(false);

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

  const handleViewChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  const handleSaveChannel = () => {
    const formValues = form.getValues();

    if (isCreatingNewChannel) {
      channelsData.push(formValues);
      channelStats.total += 1;
      if (formValues.status === 'active') channelStats.active += 1;
      if (formValues.status === 'standby') channelStats.standby += 1;
      if (formValues.status === 'fault') channelStats.fault += 1;
    } else if (selectedChannel) {
      const index = channelsData.findIndex(ch => ch.id === selectedChannel.id);
      if (index !== -1) {
        channelsData[index] = formValues;
      }
    }
    setOpenChannelDialog(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        <Badge variant="outline" className="text-sm">
          Last updated: Just now
        </Badge>
      </div>

      <DashboardStatusCards stats={channelStats} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg md:text-xl font-semibold">Live Channel Status</CardTitle>
          <Button onClick={handleCreateChannel}>Add Channel</Button>
        </CardHeader>
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
