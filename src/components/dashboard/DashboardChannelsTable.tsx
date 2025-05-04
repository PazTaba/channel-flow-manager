
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveDataTable, Column } from "@/components/data/ResponsiveDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, ArrowRightLeft } from "lucide-react";
import { ArteryDetailsDialog } from "./ArteryDetailsDialog";

export interface Artery {
  id: number;
  name: string;
  source: string;
  sourceId: number;
  status: "active" | "standby" | "fault";
  broadcastIp: string;
  mode: "active" | "passive";
  online: boolean;
  encryptionEnabled?: boolean;
  protocol?: string;
  bitrateIn?: number;
  bitrateOut?: number;
  primaryChannel: {
    id: number;
    destinationId: number;
    destination: string;
    status: "online" | "offline";
    isActive: boolean;
  };
  backupChannel: {
    id: number;
    destinationId: number;
    destination: string;
    status: "online" | "offline";
    isActive: boolean;
  };
}

interface DashboardArteriesTableProps {
  data: Artery[];
  onViewArtery: (artery: Artery) => void;
  onSwitchChannel?: (arteryId: number, useBackup: boolean) => void;
}

export function DashboardChannelsTable({ 
  data, 
  onViewArtery, 
  onSwitchChannel 
}: DashboardArteriesTableProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "standby" | "fault">("all");
  const [selectedArtery, setSelectedArtery] = useState<Artery | null>(null);

  const handleSwitchChannel = (artery: Artery) => {
    if (onSwitchChannel) {
      onSwitchChannel(artery.id, artery.primaryChannel.isActive);
    }
  };

  const columns: Column<Artery>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (artery) => <span className="font-medium">{artery.name}</span>,
      sortable: true
    },
    {
      header: "Source",
      accessorKey: "source",
      hideOnMobile: true,
      sortable: true
    },
    {
      header: "Primary Destination",
      accessorKey: "primaryChannel",
      cell: (artery) => (
        <div className="flex flex-col">
          <span>{artery.primaryChannel.destination}</span>
          {artery.primaryChannel.isActive && (
            <Badge variant="outline" className="mt-1 w-fit border-blue-500 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10">
              Active
            </Badge>
          )}
        </div>
      ),
      hideOnMobile: true,
      sortable: true
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (artery) => (
        <Badge
          variant="outline"
          className={
            artery.status === 'active' ? 'border-status-active text-status-active bg-green-50/50 dark:bg-green-900/10' :
            artery.status === 'standby' ? 'border-status-standby text-status-standby bg-amber-50/50 dark:bg-amber-900/10' :
            'border-status-fault text-status-fault bg-red-50/50 dark:bg-red-900/10'
          }
        >
          {artery.status === 'active' ? 'Active' :
           artery.status === 'standby' ? 'Standby' : 'Fault'}
        </Badge>
      ),
      sortable: true
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (artery) => (
        <div className="flex items-center">
          <Button
            size="sm"
            variant="outline"
            className="h-8 mr-2"
            onClick={() => handleSwitchChannel(artery)}
          >
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
            Switch
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setSelectedArtery(artery);
                onViewArtery(artery);
              }}>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Artery</DropdownMenuItem>
              <DropdownMenuItem>Manage Bandwidth</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "w-[120px]"
    }
  ];

  const filteredData = statusFilter === "all" 
    ? data 
    : data.filter(artery => artery.status === statusFilter);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Artery Management</CardTitle>
        <CardDescription>View and manage all Artery connections with primary and backup channels</CardDescription>
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
          searchPlaceholder="Search arteries..."
          pagination={true}
          pageSize={8}
          highlightCondition={(artery) => artery.status === "fault"}
          highlightClass="bg-red-50/50 dark:bg-red-900/10"
          emptyMessage="No arteries found matching your filters"
        />
        
        {selectedArtery && (
          <ArteryDetailsDialog
            artery={{
              id: selectedArtery.id,
              name: selectedArtery.name,
              primaryChannelStatus: selectedArtery.primaryChannel.status,
              backupChannelStatus: selectedArtery.backupChannel.status,
              cpu: selectedArtery.bitrateIn ? Math.floor(Math.random() * 30) + 20 : 0,
              ram: selectedArtery.bitrateIn ? Math.floor(Math.random() * 40) + 30 : 0,
              bitrateIn: selectedArtery.bitrateIn || 0,
              bitrateOut: selectedArtery.bitrateOut || 0,
              broadcastIp: selectedArtery.broadcastIp,
              mode: selectedArtery.mode,
              primaryChannelActive: selectedArtery.primaryChannel.isActive,
              sources: [
                {
                  name: selectedArtery.source,
                  ip: selectedArtery.broadcastIp,
                  status: "enabled"
                }
              ],
              destinations: [
                {
                  name: selectedArtery.primaryChannel.destination,
                  ip: selectedArtery.primaryChannel.destination + " IP",
                  type: "primary"
                },
                {
                  name: selectedArtery.backupChannel.destination,
                  ip: selectedArtery.backupChannel.destination + " IP",
                  type: "backup"
                }
              ]
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

// Also export the type for Channel to be used in Dashboard.tsx
export type { Artery as Channel };
