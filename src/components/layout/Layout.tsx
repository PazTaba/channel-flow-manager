
import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar className="md:block hidden" />
      <Header collapsed={collapsed} className="md:pl-0" />
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out p-4 md:p-6",
        collapsed ? "md:ml-16" : "md:ml-64",
      )}>
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
