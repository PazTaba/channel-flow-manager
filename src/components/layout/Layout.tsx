
// components/layout/Layout.tsx
import { ReactNode, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface LayoutProps {
  className?: string;
}

export const Layout = ({ className }: LayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <div className={cn("min-h-screen flex flex-col bg-background", className)}>
      <Sidebar 
        className="md:block hidden"
      />
      <Header 
        className="md:pl-0" 
      />
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out p-4 md:p-6",
        collapsed ? "md:ml-16" : "md:ml-64",
      )}>
        <div className="mx-auto max-w-7xl animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
