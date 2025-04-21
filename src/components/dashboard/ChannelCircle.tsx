
import { Cpu, Memory, Activity, ArrowDown, ArrowUp, CircleCheck, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChannelCircleProps {
  name: string;
  channelLink1Status: "online" | "offline";
  channelLink2Status: "online" | "offline";
  cpu: number; // percent
  ram: number; // percent
  bitrateIn: number; // Mbps
  bitrateOut: number; // Mbps
}

export function ChannelCircle({
  name,
  channelLink1Status,
  channelLink2Status,
  cpu,
  ram,
  bitrateIn,
  bitrateOut,
}: ChannelCircleProps) {
  // Color mapping for statuses
  const statusColor = (status: "online" | "offline") =>
    status === "online" ? "text-green-500" : "text-red-500";
  const statusIcon = (status: "online" | "offline") =>
    status === "online" ? <CircleCheck className={cn("w-4 h-4", statusColor(status))} /> : <CircleX className={cn("w-4 h-4", statusColor(status))} />;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Main Channel Circle */}
      <div className="relative animate-fade-in rounded-full bg-card shadow-lg border border-muted flex items-center justify-center w-32 h-32 md:w-36 md:h-36 transition-all">
        <span className="text-lg md:text-xl font-bold text-primary">{name}</span>
        {/* ChannelLink statuses */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className="text-xs font-medium">L1</span>
          {statusIcon(channelLink1Status)}
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span className="text-xs font-medium">L2</span>
          {statusIcon(channelLink2Status)}
        </div>
        {/* CPU + RAM usage as circle footers */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
          <div className="flex flex-col items-center">
            <Cpu className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{cpu}%</span>
          </div>
          <div className="flex flex-col items-center">
            <Memory className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{ram}%</span>
          </div>
        </div>
      </div>
      {/* Bitrate info below */}
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1">
          <ArrowDown className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-mono">{bitrateIn} Mbps</span>
        </div>
        <div className="flex items-center gap-1">
          <ArrowUp className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-mono">{bitrateOut} Mbps</span>
        </div>
      </div>
    </div>
  );
}
