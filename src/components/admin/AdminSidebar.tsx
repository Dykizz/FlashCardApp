"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Command, ChevronLeft, ChevronRight } from "lucide-react";
import { adminNavItems } from "@/config/adminNavigation";
import { useSidebar } from "@/hooks/use-sidebar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className="flex h-full flex-col gap-2 relative">
      <div
        className={cn(
          "flex h-14 items-center border-b px-4 lg:h-[60px] transition-all duration-300",
          isCollapsed ? "justify-center" : "justify-start"
        )}
      >
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Command className="size-5" />
          </div>
          {!isCollapsed && (
            <span className="animate-in fade-in duration-300 whitespace-nowrap">
              FlashCard Admin
            </span>
          )}
        </Link>
      </div>

      <TooltipProvider delayDuration={0}>
        <div className="flex-1 overflow-auto py-2">
          <nav
            className={cn(
              "grid items-start gap-1 px-2 text-sm font-medium",
              isCollapsed ? "justify-center" : ""
            )}
          >
            {adminNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              const LinkContent = (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg py-2.5 transition-all hover:text-primary",
                    isCollapsed ? "justify-center px-2" : "px-3",
                    isActive
                      ? "bg-muted text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && (
                    <span className="animate-in fade-in duration-300 whitespace-nowrap">
                      {item.title}
                    </span>
                  )}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>{LinkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-bold">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return LinkContent;
            })}
          </nav>
        </div>
      </TooltipProvider>

      <div className="mt-auto p-4 border-t">
        <Button
          variant="outline"
          size="icon"
          className="w-full flex items-center justify-center"
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
