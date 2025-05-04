
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
import { CircleCheck, CircleX, Activity, Cpu, Network, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChannelCircle } from "./ChannelCircle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSwitchChannel } from "@/hooks/useArteries";
import { toast } from "sonner";

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

interface ArteryDetailsDialogProps {
  artery: {
    id: number;
    name: string;
    primaryChannelStatus: "online" | "offline";
    backupChannelStatus: "online" | "offline";
    cpu: number;
    ram: number;
    bitrateIn: number;
    bitrateOut: number;
    broadcastIp?: string;
    mode?: "active" | "passive" | string;
    sources?: Array<{
      name: string;
      ip: string;
      status: "enabled" | "fallback";
    }>;
    destinations?: Array<{
      name: string;
      ip: string;
      type: "primary" | "backup";
    }>;
    primaryChannelActive?: boolean;
  };
}

export function ArteryDetailsDialog({ artery }: ArteryDetailsDialogProps) {
  const [selectedChannel, setSelectedChannel] = useState<"primary" | "backup" | null>(null);
  const switchChannelMutation = useSwitchChannel();

  const statusColor = (status: "online" | "offline") =>
    status === "online" ? "text-green-500" : "text-red-500";

  const statusIcon = (status: "online" | "offline") =>
    status === "online" ? (
      <CircleCheck className={cn("w-4 h-4", statusColor(status))} />
    ) : (
      <CircleX className={cn("w-4 h-4", statusColor(status))} />
    );

  const handleSwitchChannel = () => {
    const switchToBackup = artery.primaryChannelActive === true;
    
    switchChannelMutation.mutate(
      { id: artery.id, useBackup: switchToBackup },
      {
        onSuccess: () => {
          toast.success(`Switched to ${switchToBackup ? 'backup' : 'primary'} channel`);
        },
        onError: (error) => {
          toast.error(`Failed to switch channels: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <ChannelCircle
            name={artery.name}
            channelLink1Status={artery.primaryChannelStatus}
            channelLink2Status={artery.backupChannelStatus}
            cpu={artery.cpu}
            ram={artery.ram}
            bitrateIn={artery.bitrateIn}
            bitrateOut={artery.bitrateOut}
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Activity className="w-5 h-5 mr-1" />
            Artery: {artery.name}
            <Badge mode={artery.mode} />
          </DialogTitle>
        </DialogHeader>

        {/* Overview Card with improved styling */}
        <div className="mt-4">
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Artery Overview</CardTitle>
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
                            artery.cpu > 80 ? "bg-red-500" : artery.cpu > 50 ? "bg-yellow-400" : "bg-green-500"
                          )}
                          style={{ width: `${artery.cpu}%` }}
                        ></div>
                      </div>
                      <span className="font-medium ml-2 text-sm">{artery.cpu}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">RAM:</span>
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full",
                            artery.ram > 80 ? "bg-red-500" : artery.ram > 50 ? "bg-yellow-400" : "bg-green-500"
                          )}
                          style={{ width: `${artery.ram}%` }}
                        ></div>
                      </div>
                      <span className="font-medium ml-2 text-sm">{artery.ram}%</span>
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
                      <span className="font-medium text-sm">{artery.bitrateIn} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Out:</span>
                      <span className="font-medium text-sm">{artery.bitrateOut} Mbps</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {artery.broadcastIp && (
                <div className="mt-4 p-3 rounded-lg bg-white dark:bg-gray-800 border shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-medium">Broadcast IP</h3>
                  </div>
                  <span className="font-mono text-sm">{artery.broadcastIp}</span>
                </div>
              )}
              
              {/* Channel Switch Control */}
              <div className="mt-4 p-3 rounded-lg bg-white dark:bg-gray-800 border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Active Channel</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {artery.primaryChannelActive ? 'Primary Channel' : 'Backup Channel'}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={handleSwitchChannel}
                    disabled={switchChannelMutation.isPending}
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Switch Channel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step 1: Channel Selection */}
        {selectedChannel === null ? (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Card
              onClick={() => setSelectedChannel("primary")}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                artery.primaryChannelStatus === "online"
                  ? "hover:border-green-400"
                  : "hover:border-red-400",
                artery.primaryChannelActive && "border-blue-400 dark:border-blue-500"
              )}
            >
              <CardContent className="flex flex-col items-center justify-center gap-2 py-6">
                <span className="text-sm font-medium">Primary Channel</span>
                <div className="flex items-center gap-2">
                  {statusIcon(artery.primaryChannelStatus)}
                  <span className={cn("capitalize text-sm", statusColor(artery.primaryChannelStatus))}>
                    {artery.primaryChannelStatus}
                  </span>
                </div>
                {artery.primaryChannelActive && (
                  <DefaultBadge variant="secondary" className="mt-2">Active</DefaultBadge>
                )}
              </CardContent>
            </Card>
            <Card
              onClick={() => setSelectedChannel("backup")}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                artery.backupChannelStatus === "online"
                  ? "hover:border-green-400"
                  : "hover:border-red-400",
                !artery.primaryChannelActive && "border-blue-400 dark:border-blue-500"
              )}
            >
              <CardContent className="flex flex-col items-center justify-center gap-2 py-6">
                <span className="text-sm font-medium">Backup Channel</span>
                <div className="flex items-center gap-2">
                  {statusIcon(artery.backupChannelStatus)}
                  <span className={cn("capitalize text-sm", statusColor(artery.backupChannelStatus))}>
                    {artery.backupChannelStatus}
                  </span>
                </div>
                {!artery.primaryChannelActive && (
                  <DefaultBadge variant="secondary" className="mt-2">Active</DefaultBadge>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <Tabs defaultValue="links" className="mt-4">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="links">Channel Status</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
                <TabsTrigger value="destinations">Destinations</TabsTrigger>
              </TabsList>

              <TabsContent value="links" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className={cn(
                    "border-l-4",
                    artery.primaryChannelStatus === "online" ? "border-l-green-500" : "border-l-red-500",
                    artery.primaryChannelActive && "ring-2 ring-blue-400"
                  )}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium">Primary Channel</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="flex items-center gap-2">
                        {statusIcon(artery.primaryChannelStatus)}
                        <span className={cn("capitalize", statusColor(artery.primaryChannelStatus))}>
                          {artery.primaryChannelStatus}
                        </span>
                        {artery.primaryChannelActive && (
                          <DefaultBadge variant="outline" className="ml-2">Active</DefaultBadge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className={cn(
                    "border-l-4",
                    artery.backupChannelStatus === "online" ? "border-l-green-500" : "border-l-red-500",
                    !artery.primaryChannelActive && "ring-2 ring-blue-400"
                  )}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium">Backup Channel</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="flex items-center gap-2">
                        {statusIcon(artery.backupChannelStatus)}
                        <span className={cn("capitalize", statusColor(artery.backupChannelStatus))}>
                          {artery.backupChannelStatus}
                        </span>
                        {!artery.primaryChannelActive && (
                          <DefaultBadge variant="outline" className="ml-2">Active</DefaultBadge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sources" className="mt-4">
                <div className="space-y-3">
                  {artery.sources?.map((source, index) => (
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
                  {artery.destinations?.map((dest, index) => (
                    <Card key={index} className={cn(
                      "border-l-4",
                      dest.type === "primary" ? "border-l-purple-500" : "border-l-yellow-500"
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
              onClick={() => setSelectedChannel(null)}
            >
              ← Back to channel selection
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
