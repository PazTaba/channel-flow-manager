
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertsComponent } from "@/components/alerts/AlertsComponent";
import { StatusCard } from "@/components/dashboard/StatusCard";

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

export default function Dashboard() {
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
    </div>
  );
}
