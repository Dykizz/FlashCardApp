import {
  LayoutDashboard,
  Users,
  Settings,
  BookOpen,
  BarChart3,
} from "lucide-react";

export const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý Bài viết",
    href: "/admin/source-articles",
    icon: BookOpen,
  },
  {
    title: "Người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Thống kê",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Cài đặt",
    href: "/admin/settings",
    icon: Settings,
  },
];
