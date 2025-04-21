
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
  X
} from "lucide-react";

type SidebarNavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
};

const navItems: SidebarNavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Channels",
    href: "/channels",
    icon: Radio,
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
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "User Management",
    href: "/users",
    icon: Users,
    adminOnly: true,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  
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
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center px-3 py-3 text-sidebar-foreground rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                        isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                        collapsed ? "justify-center" : "justify-start"
                      )}
                    >
                      <Icon className={cn("flex-shrink-0", collapsed ? "w-6 h-6" : "w-5 h-5 mr-3")} />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
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
