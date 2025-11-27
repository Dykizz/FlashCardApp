"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "grid min-h-screen w-full transition-all duration-300 ease-in-out",
        isCollapsed
          ? "grid-cols-[80px_1fr]"
          : "grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
      )}
    >
      <div className="hidden border-r bg-muted/40 md:block sticky top-0 h-screen overflow-hidden">
        <AdminSidebar />
      </div>

      <div className="flex flex-col h-screen overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0B0D14] ">
          {children}
        </main>
      </div>
    </div>
  );
}
