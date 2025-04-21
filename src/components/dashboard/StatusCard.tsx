
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  title: string;
  value: number | string;
  status?: "active" | "standby" | "fault" | "neutral";
  className?: string;
}

export function StatusCard({ title, value, status = "neutral", className }: StatusCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-3 px-4">
        <div 
          className={cn(
            "text-2xl font-bold",
            status === "active" && "text-status-active",
            status === "standby" && "text-status-standby",
            status === "fault" && "text-status-fault"
          )}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
