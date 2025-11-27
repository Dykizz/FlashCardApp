"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/models/User";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formatDate = (date?: string | Date) => {
  if (!date) return "Chưa đăng nhập";
  const d = new Date(date);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Người dùng",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Vai trò",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge
          variant={role === "admin" ? "default" : "secondary"}
          className="uppercase text-[10px]"
        >
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "provider",
    header: "Đăng nhập",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.getValue("provider")}
      </Badge>
    ),
  },
  {
    accessorKey: "lastLogin",
    header: "Truy cập cuối",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.getValue("lastLogin"))}
      </span>
    ),
  },
];
