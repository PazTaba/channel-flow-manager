
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveDataTable, Column } from "@/components/data/ResponsiveDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

export interface Channel {
  id: number;
  name: string;
  source: string;
  destination: string;
  bandwidth: string;
  status: "active" | "standby" | "fault";
  broadcastIp: string;
  mode: "active" | "passive";
  online: boolean;
  primaryDestinationIp?: string;
  secondaryDestinationIp?: string;
  encryptionEnabled?: boolean;
  protocol?: string;
  bitrateIn?: number;
  bitrateOut?: number;
}

interface DashboardChannelsTableProps {
  data: Channel[];
  onViewChannel: (channel: Channel) => void;
}

export function DashboardChannelsTable({ data, onViewChannel }: DashboardChannelsTableProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "standby" | "fault">("all");

  const columns: Column<Channel>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (channel) => <span className="font-medium">{channel.name}</span>,
      sortable: true
    },
    {
      header: "Source",
      accessorKey: "source",
      hideOnMobile: true,
      sortable: true
    },
    {
      header: "Destination",
      accessorKey: "destination",
      hideOnMobile: true,
      sortable: true
    },
    {
      header: "Broadcast IP",
      accessorKey: "broadcastIp",
      hideOnMobile: true,
      sortable: true
    },
    {
      header: "Mode",
      accessorKey: "mode",
      cell: (channel) => (
        <Badge
          variant="outline"
          className={
            channel.mode === 'active' ? 'border-green-500 text-green-600 bg-green-50/50 dark:bg-green-900/10' :
            'border-amber-500 text-amber-600 bg-amber-50/50 dark:bg-amber-900/10'
          }
        >
          {channel.mode === 'active' ? 'Active' : 'Passive'}
        </Badge>
      ),
      sortable: true
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (channel) => (
        <Badge
          variant="outline"
          className={
            channel.status === 'active' ? 'border-status-active text-status-active bg-green-50/50 dark:bg-green-900/10' :
            channel.status === 'standby' ? 'border-status-standby text-status-standby bg-amber-50/50 dark:bg-amber-900/10' :
            'border-status-fault text-status-fault bg-red-50/50 dark:bg-red-900/10'
          }
        >
          {channel.status === 'active' ? 'Active' :
           channel.status === 'standby' ? 'Standby' : 'Fault'}
        </Badge>
      ),
      sortable: true
    },
    {
      header: "",
      accessorKey: "id",
      cell: (channel) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewChannel(channel)}>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Channel</DropdownMenuItem>
            <DropdownMenuItem>Manage Bandwidth</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-[50px]"
    }
  ];

  const filteredData = statusFilter === "all" 
    ? data 
    : data.filter(channel => channel.status === statusFilter);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Management</CardTitle>
        <CardDescription>View and manage all channel connections</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="standby">Standby</SelectItem>
              <SelectItem value="fault">Fault</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <ResponsiveDataTable
          data={filteredData}
          columns={columns}
          keyField="id"
          searchable={true}
          searchPlaceholder="Search channels..."
          pagination={true}
          pageSize={8}
          highlightCondition={(channel) => channel.status === "fault"}
          highlightClass="bg-red-50/50 dark:bg-red-900/10"
          emptyMessage="No channels found matching your filters"
        />
      </CardContent>
    </Card>
  );
}
