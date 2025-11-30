"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Post } from "@/types/post";
import { formatDate } from "@/utils/date";

export const columns: ColumnDef<Post>[] = [
  {
    accessorKey: "thumbnail",
    header: "Ảnh bìa",
    cell: ({ row }) => {
      const thumb = row.original.thumbnail;
      return (
        <div className="relative w-16 h-10 rounded overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100">
          {thumb ? (
            <img src={thumb} alt="Thumbnail" className="object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-xs text-slate-400">
              No IMG
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 hover:bg-transparent"
        >
          Tiêu đề
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <Link
          href={`/blog/${row.original.slug}`}
          className="font-medium text-slate-900 dark:text-slate-100 hover:underline truncate block"
          target="_blank"
        >
          {row.getValue("title")}
        </Link>
        <div className="text-xs text-muted-foreground truncate">
          {row.original.description || "Chưa có mô tả"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      const statusMap: Record<string, { label: string; color: string }> = {
        published: {
          label: "Đã đăng",
          color:
            "bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25",
        },
        draft: {
          label: "Nháp",
          color:
            "bg-slate-500/15 text-slate-700 dark:text-slate-400 hover:bg-slate-500/25",
        },
        archived: {
          label: "Lưu trữ",
          color:
            "bg-orange-500/15 text-orange-700 dark:text-orange-400 hover:bg-orange-500/25",
        },
      };

      const config = statusMap[status] || statusMap.draft;

      return (
        <Badge variant="secondary" className={`${config.color} border-0`}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "author",
    header: "Tác giả",
    cell: ({ row }) => {
      const author = row.original.author;
      return <div className="text-sm">{author?.name || "Unknown"}</div>;
    },
  },
  {
    accessorKey: "views",
    header: () => <div className="text-center">Lượt xem</div>,
    cell: ({ row }) => (
      <div className="text-center font-mono text-xs">
        {row.getValue("views")}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.getValue("createdAt"))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Thao tác</div>,
    cell: ({ row, table }) => {
      const post = row.original;

      const { handleOpenDeleteDialog, isDeleting, deletingId } = table.options
        .meta as any;
      const isPostDeleting = isDeleting && deletingId === post._id;
      return (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            title="Xem bài viết (Live)"
            className="size-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            asChild
          >
            <Link href={`/admin/posts/${post.slug}`} target="_blank">
              <Eye className="size-4" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Chỉnh sửa"
            className="size-8 text-muted-foreground hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            asChild
          >
            <Link href={`/admin/posts/${post._id}/edit`}>
              <Pencil className="size-4" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title={isPostDeleting ? "Đang xóa..." : "Xóa"}
            className="size-8 text-muted-foreground cursor-pointer hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            disabled={isPostDeleting}
            onClick={() => handleOpenDeleteDialog(post)}
          >
            {isPostDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash className="size-4" />
            )}
          </Button>
        </div>
      );
    },
  },
];
