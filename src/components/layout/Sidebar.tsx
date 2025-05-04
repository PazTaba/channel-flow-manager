// src/components/layout/Sidebar.tsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Radio,
  Database,
  Share2,
  Settings,
  Users,
  Menu,
  X,
  AlertCircle,
  Shield,
  ActivitySquare,
  Network,
  CircleOff,
  FileBarChart,
  Gauge
} from "lucide-react";
import { useAuthContext } from "@/context/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDashboardStatus } from "@/hooks/useDashboard";

type SidebarNavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  adminOnly?: boolean;
  roles?: string[];
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, hasRole } = useAuthContext();
  const { data: stats } = useDashboardStatus();

  // Build navigation items with dynamic badges for stats
  const navItems: SidebarNavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Arteries",
      href: "/arteries",
      icon: Radio,
      badge: stats?.fault ?? 0,
    },
    {
      title: "Sources",
      href: "/sources",
      icon: Database,
    },
    {
      title: "Destinations",
      href: "/destinations",
      icon: Share2,
    },
    {
      title: "Monitoring",
      href: "/monitoring",
      icon: ActivitySquare,
      roles: ['admin', 'operator'],
    },
    {
      title: "Network",
      href: "/network",
      icon: Network,
      roles: ['admin', 'operator'],
    },
    {
      title: "Reports",
      href: "/reports",
      icon: FileBarChart,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ['admin', 'operator'],
    },
    {
      title: "User Management",
      href: "/users",
      icon: Users,
      adminOnly: true,
    },
  ];

  // Filter navigation items based on user roles
  const filteredNavItems = navItems.filter(item => {
    // If adminOnly is true, only show to admins
    if (item.adminOnly && !hasRole('admin')) {
      return false;
    }

    // If roles are specified, check if user has one of the roles
    if (item.roles && item.roles.length > 0) {
      return item.roles.some(role => hasRole(role as 'admin' | 'operator' | 'viewer'));
    }

    // Otherwise, show to everyone
    return true;
  });

  // Handle responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-sidebar border-r border-sidebar-border shadow-sm",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn(
            "flex h-16 items-center border-b border-sidebar-border px-4",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && (
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  CLM
                </div>
                <span className="font-bold text-lg">Channel Link</span>
              </Link>
            )}
            {collapsed && (
              <Link to="/" className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  CLM
                </div>
              </Link>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex"
                onClick={() => setCollapsed(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                // Show fault badges if present
                const showBadge = item.badge && item.badge > 0;

                return (
                  <li key={item.href}>
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to={item.href}
                            className={cn(
                              "flex items-center px-3 py-3 text-sidebar-foreground rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors relative",
                              isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                              collapsed ? "justify-center" : "justify-start"
                            )}
                          >
                            <Icon className={cn("flex-shrink-0", collapsed ? "w-6 h-6" : "w-5 h-5 mr-3")} />
                            {!collapsed && <span>{item.title}</span>}

                            {/* Badge for alerts/faults */}
                            {showBadge && (
                              <Badge
                                variant="destructive"
                                className={cn(
                                  "ml-auto",
                                  collapsed && "absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0"
                                )}
                              >
                                {item.badge}
                              </Badge>
                            )}

                            {/* Admin indicator */}
                            {item.adminOnly && !collapsed && (
                              <Shield className="ml-auto h-4 w-4 text-primary opacity-60" />
                            )}
                          </Link>
                        </TooltipTrigger>
                        {collapsed && (
                          <TooltipContent side="right">
                            <div className="flex flex-col">
                              <span>{item.title}</span>
                              {item.adminOnly && (
                                <span className="text-xs text-muted-foreground">Admin only</span>
                              )}
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* System Status */}
          <div className="border-t border-sidebar-border p-3">
            {!collapsed ? (
              <div className="flex flex-col gap-1">
                <div className="text-xs text-muted-foreground">System Status</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={cn(
                      "w-2 h-2 rounded-full mr-2",
                      (stats?.fault ?? 0) > 0 ? "bg-destructive" : "bg-green-500"
                    )} />
                    <span className="text-xs">
                      {(stats?.fault ?? 0) > 0 ? `${stats?.fault} Issues` : "Healthy"}
                    </span>
                  </div>
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-center">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        (stats?.fault ?? 0) > 0 ? "bg-destructive" : "bg-green-500"
                      )} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <span>
                      {(stats?.fault ?? 0) > 0 ? `${stats?.fault} Active Issues` : "System Healthy"}
                    </span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Collapse toggle */}
          <div className="border-t border-sidebar-border p-4 hidden md:block">
            {collapsed ? (
              <Button
                variant="ghost"
                size="icon"
                className="mx-auto flex"
                onClick={() => setCollapsed(false)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}