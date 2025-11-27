"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-background transition-[width] duration-300 ease-in-out z-20",
          isCollapsed ? "w-20" : "w-[260px]"
        )}
      >
        <AdminSidebar />
      </aside>

      <div className="flex flex-1 flex-col min-w-0 transition-all duration-300">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
