import { Badge } from "@/components/ui/badge";
import { AlertsComponent } from "@/components/alerts/AlertsComponent";
import { ChannelDetailsDialog } from "@/components/dashboard/ChannelDetailsDialog";
import { DashboardStatusCards } from "@/components/dashboard/DashboardStatusCards";
import { DashboardChannelsTable } from "@/components/dashboard/DashboardChannelsTable";
import { BandwidthUsageGraph } from "@/components/dashboard/BandwidthUsageGraph";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TopChannels } from "@/components/dashboard/TopChannels";
import { useState } from "react";
import type { Channel } from "@/components/dashboard/DashboardChannelsTable";

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
  // ... Add similar detailed data for other channels
];

// Remove the local Channel type definition since we're now importing it

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
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

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

  const handleViewChannel = (channel: Channel) => {
    setSelectedChannel(channel);
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

      <div>
        <h2 className="text-lg md:text-xl font-semibold mb-2">Live Channel Status</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {arteryChannels.map((ch) => (
            <ChannelDetailsDialog key={ch.name} channel={ch} />
          ))}
        </div>
      </div>
      
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
