"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, BookOpen, Home, Menu, Calculator } from "lucide-react";
import { useState } from "react";
import { showToast } from "@/utils/toast";
import { useUser } from "@/hooks/useUser";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, isLoading, logout } = useUser();

  const handleLogout = () => {
    logout();

    showToast({
      title: "Đăng xuất",
      description: "Đã đăng xuất thành công",
      type: "success",
    });

    router.push("/login");
  };

  if (isLoading) {
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

  const displayName = user?.displayName;
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

        <div>
          <Link
            href="/flashcards"
            className="hidden md:inline-block text-sm md:text-lg font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
          >
            Thẻ học
          </Link>
          <Link
            href="/features"
            className="hidden md:inline-block ml-6 text-sm md:text-lg font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
          >
            Tính toán
          </Link>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {displayName ? (
            <>
              {/* Desktop User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden md:flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>{displayName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem disabled>
                    <User className="mr-2 h-4 w-4" />
                    <span>{displayName}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
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
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem disabled>
                    <User className="mr-2 h-4 w-4" />
                    <span>{displayName}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/flashcards" className="flex items-center">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Thẻ học của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/features">
                      <Calculator className="mr-2 h-4 w-4" />
                      <span>Tính toán</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Đăng ký</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
