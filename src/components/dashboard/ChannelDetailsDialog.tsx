import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge as DefaultBadge } from "@/components/ui/badge";
import { CircleCheck, CircleX, Activity, Cpu, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChannelCircle } from "./ChannelCircle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Badge({ mode }: { mode: string | undefined }) {
  const colorClass =
    mode === "active"
      ? "bg-green-500 text-white"
      : mode === "passive"
        ? "bg-yellow-400 text-black"
        : "bg-red-500 text-white";

  return (
    <div className={cn("px-2 py-0.5 text-xs rounded-full font-semibold", colorClass)}>
      {mode || "unknown"}
    </div>
  );
}

interface ChannelDetailsDialogProps {
  channel: {
    name: string;
    channelLink1Status: "online" | "offline";
    channelLink2Status: "online" | "offline";
    cpu: number;
    ram: number;
    bitrateIn: number;
    bitrateOut: number;
    broadcastIP?: string;
    mode?: "active" | "passive" | string;
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
  const [selectedLink, setSelectedLink] = useState<"link1" | "link2" | null>(null);

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
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Activity className="w-5 h-5 mr-1" />
            Artery : {channel.name}
            <Badge mode={channel.mode} />
          </DialogTitle>
        </DialogHeader>

        {/* Overview Card with improved styling */}
        <div className="mt-4">
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Channel Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">System Usage</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">CPU:</span>
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full",
                            channel.cpu > 80 ? "bg-red-500" : channel.cpu > 50 ? "bg-yellow-400" : "bg-green-500"
                          )}
                          style={{ width: `${channel.cpu}%` }}
                        ></div>
                      </div>
                      <span className="font-medium ml-2 text-sm">{channel.cpu}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">RAM:</span>
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full",
                            channel.ram > 80 ? "bg-red-500" : channel.ram > 50 ? "bg-yellow-400" : "bg-green-500"
                          )}
                          style={{ width: `${channel.ram}%` }}
                        ></div>
                      </div>
                      <span className="font-medium ml-2 text-sm">{channel.ram}%</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Network className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Network Traffic</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">In:</span>
                      <span className="font-medium text-sm">{channel.bitrateIn} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Out:</span>
                      <span className="font-medium text-sm">{channel.bitrateOut} Mbps</span>
                    </div>
                  </div>
                </div>
              </div>
              {channel.broadcastIP && (
                <div className="mt-4 p-3 rounded-lg bg-white dark:bg-gray-800 border shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-medium">IP Address</h3>
                  </div>
                  <span className="font-mono text-sm">{channel.broadcastIP}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Step 1: Link Selection */}
        {selectedLink === null ? (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Card
              onClick={() => setSelectedLink("link1")}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                channel.channelLink1Status === "online"
                  ? "hover:border-green-400"
                  : "hover:border-red-400"
              )}
            >
              <CardContent className="flex flex-col items-center justify-center gap-2 py-6">
                <span className="text-sm font-medium">Channel Link 1</span>
                <div className="flex items-center gap-2">
                  {statusIcon(channel.channelLink1Status)}
                  <span className={cn("capitalize text-sm", statusColor(channel.channelLink1Status))}>
                    {channel.channelLink1Status}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card
              onClick={() => setSelectedLink("link2")}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                channel.channelLink2Status === "online"
                  ? "hover:border-green-400"
                  : "hover:border-red-400"
              )}
            >
              <CardContent className="flex flex-col items-center justify-center gap-2 py-6">
                <span className="text-sm font-medium">Channel Link 2</span>
                <div className="flex items-center gap-2">
                  {statusIcon(channel.channelLink2Status)}
                  <span className={cn("capitalize text-sm", statusColor(channel.channelLink2Status))}>
                    {channel.channelLink2Status}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <Tabs defaultValue="links" className="mt-4">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="links">Links Status</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
                <TabsTrigger value="destinations">Destinations</TabsTrigger>
              </TabsList>

              <TabsContent value="links" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className={cn(
                    "border-l-4",
                    channel.channelLink1Status === "online" ? "border-l-green-500" : "border-l-red-500"
                  )}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium">Link 1</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="flex items-center gap-2">
                        {statusIcon(channel.channelLink1Status)}
                        <span className={cn("capitalize", statusColor(channel.channelLink1Status))}>
                          {channel.channelLink1Status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className={cn(
                    "border-l-4",
                    channel.channelLink2Status === "online" ? "border-l-green-500" : "border-l-red-500"
                  )}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium">Link 2</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="flex items-center gap-2">
                        {statusIcon(channel.channelLink2Status)}
                        <span className={cn("capitalize", statusColor(channel.channelLink2Status))}>
                          {channel.channelLink2Status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sources" className="mt-4">
                <div className="space-y-3">
                  {channel.sources?.map((source, index) => (
                    <Card key={index} className={cn(
                      "border-l-4",
                      source.status === "enabled" ? "border-l-blue-500" : "border-l-gray-400"
                    )}>
                      <CardContent className="py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-sm font-medium">{source.name}</h3>
                            <p className="text-xs text-muted-foreground font-mono mt-1">
                              {source.ip}
                            </p>
                          </div>
                          <DefaultBadge variant={source.status === "enabled" ? "default" : "secondary"}>
                            {source.status}
                          </DefaultBadge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="destinations" className="mt-4">
                <div className="space-y-3">
                  {channel.destinations?.map((dest, index) => (
                    <Card key={index} className={cn(
                      "border-l-4",
                      dest.type === "primary" ? "border-l-purple-500" : "border-l-gray-400"
                    )}>
                      <CardContent className="py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-sm font-medium">{dest.name}</h3>
                            <p className="text-xs text-muted-foreground font-mono mt-1">
                              {dest.ip}
                            </p>
                          </div>
                          <DefaultBadge variant={dest.type === "primary" ? "default" : "secondary"}>
                            {dest.type}
                          </DefaultBadge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            <Button
              size="sm"
              variant="outline"
              className="mt-4"
              onClick={() => setSelectedLink(null)}
            >
              ← Back to link selection
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}