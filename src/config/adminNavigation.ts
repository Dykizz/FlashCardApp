import {
  LayoutDashboard,
  Users,
  Newspaper,
  HelpCircle,
  Layers,
  FileText,
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
    icon: Newspaper,
  },
  {
    title: "Quản lý câu hỏi",
    href: "/admin/questions",
    icon: HelpCircle,
  },
  {
    title: "Quản lý bài đăng",
    href: "/admin/posts",
    icon: FileText,
  },
  {
    title: "Quản lý người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Quản lý Flashcards",
    href: "/admin/flashcards",
    icon: Layers,
  },
];
