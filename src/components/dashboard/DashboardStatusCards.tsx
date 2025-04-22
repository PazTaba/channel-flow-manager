
import { StatusCard } from "./StatusCard";

interface DashboardStatusCardsProps {
  stats: {
    total: number;
    active: number;
    standby: number;
    fault: number;
  };
}

export function DashboardStatusCards({ stats }: DashboardStatusCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4 grid-cols-2">
      <StatusCard title="Total Channels" value={stats.total} status="neutral" />
      <StatusCard title="Active" value={stats.active} status="active" />
      <StatusCard title="Standby" value={stats.standby} status="standby" />
      <StatusCard title="Fault" value={stats.fault} status="fault" />
    </div>
  );
}
