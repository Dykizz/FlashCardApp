// src/app/admin/posts/[id]/page.tsx
import Link from "next/link";
import {
  ChevronLeft,
  Pencil,
  User,
  Calendar,
  Eye,
  Tag,
  Clock,
} from "lucide-react";
import { headers } from "next/headers";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { convertTiptapJsonToHtml } from "@/lib/tiptap-utils";
import { formatDate } from "@/utils/date";
import { PostDetail } from "@/types/post";
import SyntaxHighlighter from "@/components/syntax-highlighter";

const getSafeHost = async () => {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");

  if (host) {
    const protocol =
      process.env.NODE_ENV === "production" || process.env.VERCEL_URL
        ? "https"
        : "http";
    return `${protocol}://${host}`;
  }
  return "http://localhost:3000";
};

async function getPostDetail(id: string): Promise<PostDetail> {
  const BASE_URL = await getSafeHost();
  const API_URL = `${BASE_URL}/api/posts/${id}`;

  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      host: new URL(BASE_URL).host,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error?.message || `Lỗi tải bài viết (${response.status})`
    );
  }

  const result = await response.json();
  return result.data;
}

// --- HÀM GET BADGE CLASS ---
function getStatusBadgeClass(status: string) {
  switch (status) {
    case "published":
      return "bg-green-600 hover:bg-green-700";
    case "draft":
      return "bg-gray-500 hover:bg-gray-600";
    case "archived":
      return "bg-red-600 hover:bg-red-700";
    default:
      return "bg-gray-500";
  }
}

// --- MAIN COMPONENT ---
export default async function AdminPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let post: PostDetail;
  let htmlContent: string;
  const { id: postId } = await params;

  try {
    post = await getPostDetail(postId);
    htmlContent = convertTiptapJsonToHtml(post.content);
  } catch (error: any) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-red-600">Lỗi tải dữ liệu</h1>
          <p className="text-muted-foreground">{error.message}</p>
          <Link href="/admin/posts">
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <Link href="/admin/posts">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
          </Link>

          <Link href={`/admin/posts/edit/${post._id}`}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
            </Button>
          </Link>
        </div>

        {/* MAIN CARD */}
        <Card className="shadow-lg border-gray-200 dark:border-gray-800">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* STATUS & TITLE */}
            <div className="space-y-4">
              <Badge
                className={`text-white font-semibold text-xs uppercase ${getStatusBadgeClass(post.status)}`}
              >
                {post.status}
              </Badge>

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50">
                {post.title}
              </h1>

              {post.description && (
                <p className="text-lg text-gray-600 dark:text-gray-400 border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-r">
                  {post.description}
                </p>
              )}
            </div>

            {/* META INFO GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <User className="h-3.5 w-3.5" />
                  Tác giả
                </div>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {post.author?.name || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  Ngày tạo
                </div>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(post.createdAt)}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  Xuất bản
                </div>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {post.publishedAt
                    ? formatDate(post.publishedAt)
                    : "Chưa xuất bản"}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Eye className="h-3.5 w-3.5" />
                  Lượt xem
                </div>
                <p className="font-bold text-sm text-blue-600 dark:text-blue-400">
                  {post.views?.toLocaleString() || 0}
                </p>
              </div>
            </div>

            {/* TAGS */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                {post.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* THUMBNAIL */}
            {post.thumbnail && (
              <div className="group -mx-6 sm:-mx-8">
                <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* DIVIDER */}
            <div className="border-t border-gray-200 dark:border-gray-800 my-8" />

            {/* CONTENT */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-600 rounded-full" />
                Nội dung bài viết
              </h2>

              <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
                <div className="preview-content ProseMirror prose prose-lg prose-slate dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
              </div>
              <SyntaxHighlighter />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
