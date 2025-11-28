"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/models/User";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserActionCell } from "./UserActionCell";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

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

const SortableHeader = ({ column, title }: { column: any; title: string }) => {
  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      onClick={() => {
        if (sorted === "desc") {
          column.clearSorting();
        } else {
          column.toggleSorting(sorted === "asc");
        }
      }}
      className={`-ml-4 h-8 ${sorted ? "text-primary font-bold" : ""}`}
    >
      {title}

      {sorted === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4 text-primary" />
      ) : sorted === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4 text-primary" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
      )}
    </Button>
  );
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column} title="Người dùng" />
    ),
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
    header: ({ column }) => (
      <SortableHeader column={column} title="Truy cập cuối" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.getValue("lastLogin"))}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Hành động",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <UserActionCell userId={user._id} isBanned={user.isBanned ?? false} />
      );
    },
  },
];
