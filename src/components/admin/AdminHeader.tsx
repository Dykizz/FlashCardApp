"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "../ThemeToggle";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminSidebar } from "./AdminSidebar";

export function AdminHeader() {
  const { data: session } = useSession();
  const user = session?.user;
  const userInitials = user?.name?.[0]?.toUpperCase() || "A";

  return (
    <header className="flex h-14 lg:h-[60px] justify-between items-center px-4 border-b bg-white dark:bg-[#0B0D14] sticky top-0 z-30">
      <div className="flex items-center">
        <div className="md:hidden">
          <Sheet>
            <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-20">
              <AdminSidebar />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 border border-slate-200 dark:border-slate-700"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.image || ""}
                  alt={user?.name || "Admin"}
                />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Cài đặt</DropdownMenuItem>
            <DropdownMenuItem>Hỗ trợ</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
