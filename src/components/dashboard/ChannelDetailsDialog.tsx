import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CircleCheck, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChannelCircle } from "./ChannelCircle";

interface ChannelDetailsDialogProps {
  channel: {
    name: string;
    channelLink1Status: "online" | "offline";
    channelLink2Status: "online" | "offline";
    cpu: number;
    ram: number;
    bitrateIn: number;
    bitrateOut: number;
    // Additional channel configuration data
    broadcastIP?: string;
    mode?: "active" | "passive";
    sources?: Array<{
      name: string;
      ip: string;
      status: "enabled" | "fallback";
    }>;
    destinations?: Array<{
      name: string;
      ip: string;
      type: "primary" | "secondary";
    }>;
  };
}

export function ChannelDetailsDialog({ channel }: ChannelDetailsDialogProps) {
  const statusColor = (status: "online" | "offline") =>
    status === "online" ? "text-green-500" : "text-red-500";
  
  const statusIcon = (status: "online" | "offline") =>
    status === "online" ? (
      <CircleCheck className={cn("w-4 h-4", statusColor(status))} />
    ) : (
      <CircleX className={cn("w-4 h-4", statusColor(status))} />
    );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          {/* Render the existing ChannelCircle component */}
          {/* We're keeping the existing circle as the trigger */}
          <ChannelCircle
            name={channel.name}
            channelLink1Status={channel.channelLink1Status}
            channelLink2Status={channel.channelLink2Status}
            cpu={channel.cpu}
            ram={channel.ram}
            bitrateIn={channel.bitrateIn}
            bitrateOut={channel.bitrateOut}
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Channel: {channel.name}
            <Badge variant={channel.mode === "active" ? "default" : "secondary"}>
              {channel.mode || "active"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="links">Links Status</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="destinations">Destinations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <h3 className="text-sm font-medium mb-2">System Usage</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">CPU:</span>
                    <span className="font-medium">{channel.cpu}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">RAM:</span>
                    <span className="font-medium">{channel.ram}%</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border">
                <h3 className="text-sm font-medium mb-2">Network Traffic</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">In:</span>
                    <span className="font-medium">{channel.bitrateIn} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Out:</span>
                    <span className="font-medium">{channel.bitrateOut} Mbps</span>
                  </div>
                </div>
              </div>
            </div>
            {channel.broadcastIP && (
              <div className="p-4 rounded-lg border">
                <h3 className="text-sm font-medium mb-2">Broadcast Address</h3>
                <span className="font-mono">{channel.broadcastIP}</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="links" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <h3 className="text-sm font-medium mb-2">Link 1</h3>
                <div className="flex items-center gap-2">
                  {statusIcon(channel.channelLink1Status)}
                  <span className="capitalize">{channel.channelLink1Status}</span>
                </div>
              </div>
              <div className="p-4 rounded-lg border">
                <h3 className="text-sm font-medium mb-2">Link 2</h3>
                <div className="flex items-center gap-2">
                  {statusIcon(channel.channelLink2Status)}
                  <span className="capitalize">{channel.channelLink2Status}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sources">
            <div className="space-y-4">
              {channel.sources?.map((source, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium">{source.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">
                        {source.ip}
                      </p>
                    </div>
                    <Badge variant={source.status === "enabled" ? "default" : "secondary"}>
                      {source.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="destinations">
            <div className="space-y-4">
              {channel.destinations?.map((dest, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium">{dest.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">
                        {dest.ip}
                      </p>
                    </div>
                    <Badge variant={dest.type === "primary" ? "default" : "secondary"}>
                      {dest.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
