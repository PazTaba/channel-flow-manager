
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TopChannel {
  id: number;
  name: string;
  bandwidth: string;
  status: "active" | "standby" | "fault";
}

interface TopChannelsProps {
  channels: TopChannel[];
}

export function TopChannels({ channels }: TopChannelsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Channels by Traffic</CardTitle>
        <CardDescription>Highest bandwidth usage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {channels.map((channel) => (
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
  );
}
