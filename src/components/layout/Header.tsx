// src/components/layout/Header.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, BellDot, User, Settings, LogOut, Shield, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeModeToggle } from "@/components/ThemeModeToggle";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/AuthProvider";
import { useSystemAlerts, useMarkAllAlertsAsRead, useMarkAlertAsRead } from "@/hooks/useDashboard";
import { useWebSocket } from "@/context/WebSocketProvider";
import { SystemAlert } from "@/types";

interface HeaderProps {
  className?: string;
  collapsed: boolean;
}

export function Header({ className, collapsed }: HeaderProps) {
  const { user, logout, isAdmin } = useAuthContext();
  const { isConnected } = useWebSocket();
  const { data: alerts } = useSystemAlerts({ read: false });
  const markAllRead = useMarkAllAlertsAsRead();
  const markAsRead = useMarkAlertAsRead();
  const [hasNotifications, setHasNotifications] = useState(false);

  // Update notification indicator when unread alerts change
  useEffect(() => {
    setHasNotifications(alerts && alerts.length > 0);
  }, [alerts]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!user) return "U";

    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }

    return user.username.substring(0, 2).toUpperCase();
  };

  // Handle marking all alerts as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead.mutateAsync();
    } catch (error) {
      console.error("Error marking all alerts as read:", error);
    }
  };

  // Handle marking a single alert as read
  const handleMarkAsRead = async (alertId: number) => {
    try {
      await markAsRead.mutateAsync(alertId);
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  return (
    <header className={cn(
      "h-16 border-b bg-background flex items-center px-4",
      collapsed ? "ml-16" : "ml-64",
      "transition-all duration-300 ease-in-out",
      "sticky top-0 z-30",
      className
    )}>
      <div className="flex-1 flex items-center">
        <h1 className="text-xl font-semibold md:block hidden">Channel Link Manager</h1>

        {/* WebSocket connection indicator */}
        <div className="ml-4 flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500"
          )} />
          <span className="text-xs text-muted-foreground hidden md:inline-block">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <ThemeModeToggle />

        {/* Notifications */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              {hasNotifications ? (
                <BellDot className="h-5 w-5" />
              ) : (
                <Bell className="h-5 w-5" />
              )}
              {hasNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader className="pb-4">
              <SheetTitle className="flex justify-between items-center">
                <span>Notifications</span>
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                  Mark all as read
                </Button>
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-4 overflow-y-auto max-h-[80vh]">
              {alerts && alerts.length > 0 ? (
                alerts.map((alert: SystemAlert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      alert.isRead ? "bg-background" : "bg-accent",
                      alert.type === "critical" && "border-l-4 border-l-destructive",
                      alert.type === "warning" && "border-l-4 border-l-[#f59e0b]",
                      alert.type === "info" && "border-l-4 border-l-primary",
                      alert.type === "success" && "border-l-4 border-l-green-500"
                    )}
                    onClick={() => handleMarkAsRead(alert.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{alert.title}</h4>
                      <span className="text-xs text-muted-foreground">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>

                    {alert.relatedEntityType && alert.relatedEntityId && (
                      <div className="mt-2">
                        <Link
                          to={`/${alert.relatedEntityType}s/${alert.relatedEntityId}`}
                          className="text-xs text-primary underline"
                        >
                          View details
                        </Link>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p>No unread notifications</p>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImage} alt={user?.username} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span>{user?.firstName} {user?.lastName}</span>
              <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="text-xs">
                  {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                </Badge>
                {isAdmin && (
                  <Badge variant="outline" className="text-xs ml-1 text-primary border-primary">
                    <Shield className="h-3 w-3 mr-1" /> Admin
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}