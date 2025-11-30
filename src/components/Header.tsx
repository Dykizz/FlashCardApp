"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  BookOpen,
  Home,
  Menu,
  Calculator,
  Pencil,
  Newspaper,
  Users,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserRole } from "@/types/user.type";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: session, status } = useSession();
  const user = session?.user;

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const menu = [
    { name: "Thẻ học", href: "/flashcards", icon: Home },
    { name: "Tính toán", href: "/features", icon: Calculator },
    { name: "Blog ", href: "/posts", icon: Newspaper },
  ];

  if (status === "loading") {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 dark:bg-slate-950/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/flashcards"
            className="flex items-center space-x-2 font-bold text-xl"
          >
            <BookOpen className="h-6 w-6" />
            <span className="hidden sm:inline-block">Flash Card App</span>
          </Link>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </header>
    );
  }

  if (status === "authenticated" && user?.role === UserRole.ADMIN) {
    menu.push({ name: "Quản trị", href: "/admin", icon: Users });
    menu.push({ name: "Luyện viết", href: "/articles", icon: Pencil });
  }

  const displayName = user?.name;
  const userImage = user?.image;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-backdrop-filter:bg-slate-950/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center space-x-2 font-bold text-xl"
        >
          <BookOpen className="h-6 w-6" />
          <span className="hidden sm:inline-block">Flash Card App</span>
          <span className="sm:hidden">Flashcard</span>
        </Link>

        <div className="flex items-center space-x-6">
          {menu.map((item) => (
            <Link
              href={item.href}
              key={item.name}
              className="hidden md:inline-block text-sm md:text-lg font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {user ? (
            <>
              {/* Desktop User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden md:flex items-center space-x-2 cursor-pointer border py-2"
                  >
                    <Avatar className="size-6 md:size-8">
                      <AvatarImage
                        src={userImage || ""}
                        alt={displayName || "User"}
                      />
                      <AvatarFallback>
                        {displayName?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{displayName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem disabled>
                    <Avatar className="mr-2 h-4 w-4">
                      <AvatarImage
                        src={userImage || ""}
                        alt={displayName || "User"}
                      />
                      <AvatarFallback>
                        {displayName?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{displayName}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer hover:bg-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <DropdownMenu
                open={mobileMenuOpen}
                onOpenChange={setMobileMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden cursor-pointer"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem disabled className="cursor-pointer">
                    <Avatar className="mr-2 h-4 w-4">
                      <AvatarImage
                        src={userImage || ""}
                        alt={displayName || "User"}
                      />
                      <AvatarFallback>
                        {displayName?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{displayName}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {menu.map((item) => (
                    <DropdownMenuItem
                      key={item.name}
                      asChild
                      className="cursor-pointer"
                    >
                      <Link href={item.href} className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer hover:bg-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button className="cursor-pointer" variant="ghost" asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
