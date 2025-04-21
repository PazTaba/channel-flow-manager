
import { useState } from "react";
import { Bell, BellDot, User } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
  collapsed: boolean;
}

export function Header({ className, collapsed }: HeaderProps) {
  const [hasNotifications, setHasNotifications] = useState(true);
  
  // Simulated notification data
  const notifications = [
    { id: 1, title: "Critical Alert", message: "Channel 3 is down", type: "critical", read: false },
    { id: 2, title: "Warning", message: "High bandwidth usage on Channel 5", type: "warning", read: false },
    { id: 3, title: "Information", message: "System update completed", type: "info", read: true },
  ];

  // Handle mark all as read
  const markAllAsRead = () => {
    setHasNotifications(false);
  };

  return (
    <header className={cn(
      "h-16 border-b bg-background flex items-center px-4",
      collapsed ? "ml-16" : "ml-64",
      "transition-all duration-300 ease-in-out",
      "sticky top-0 z-30",
      className
    )}>
      <div className="flex-1">
        <h1 className="text-xl font-semibold md:block hidden">Channel Link Manager</h1>
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
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-4 overflow-y-auto max-h-[80vh]">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-3 rounded-lg border",
                    notification.read ? "bg-background" : "bg-accent",
                    notification.type === "critical" && "border-l-4 border-l-destructive",
                    notification.type === "warning" && "border-l-4 border-l-[#f59e0b]",
                    notification.type === "info" && "border-l-4 border-l-primary"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{notification.title}</h4>
                    <span className="text-xs text-muted-foreground">Just now</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
