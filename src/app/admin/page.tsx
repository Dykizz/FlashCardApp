"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Activity,
  TrendingUp,
  BookOpen,
  Layers,
  PenTool,
  Plus,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { get } from "@/utils/apiClient";
import { formatDate } from "@/utils/date";

// --- Helper: Lấy màu cho từng loại hoạt động ---
const getActivityIcon = (type: string) => {
  if (type === "writing") return <PenTool className="h-4 w-4 text-blue-500" />;
  if (type === "flashcard")
    return <Layers className="h-4 w-4 text-orange-500" />;
  return <Activity className="h-4 w-4 text-slate-500" />;
};

export default function AdminDashboard() {
  // Fetch dữ liệu từ API Dashboard
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await get<any>("/api/admin/dashboard");
      if (!res.success) throw new Error("Lỗi tải dữ liệu");
      return res.data;
    },
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !dashboardData) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Không thể tải dữ liệu bảng điều khiển.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  const { stats, recentArticles, recentActivities } = dashboardData;

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Tổng quan về hệ thống, nội dung và người dùng.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/source-articles/create">
              <Plus className="mr-2 h-4 w-4" /> Thêm Bài Viết
            </Link>
          </Button>
          {/* Bạn có thể thêm nút Tạo Flashcard ở đây sau này */}
        </div>
      </div>

      {/* --- STATS CARDS (THỐNG KÊ TỔNG) --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng Người Dùng"
          value={stats.totalUsers}
          icon={Users}
          description="Học viên trên hệ thống"
        />
        <StatCard
          title="Kho Nội Dung"
          value={stats.totalContent}
          icon={BookOpen}
          description={`${stats.breakdown.articles} Bài viết, ${stats.breakdown.flashcards} Bộ thẻ`}
        />
        <StatCard
          title="Lượt Học Tập"
          value={stats.totalActivities}
          icon={Activity}
          description="Tổng số lần làm bài & học thẻ"
        />
        <StatCard
          title="Tỷ lệ Hoạt động"
          value={`${stats.breakdown.writingSessions}`}
          icon={TrendingUp}
          description="Lượt luyện viết (Writing)"
        />
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* 1. CỘT TRÁI (4 phần): BÀI VIẾT MỚI NHẤT */}
        <Card className="col-span-4 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Bài viết mới thêm</CardTitle>
            <CardDescription>
              Danh sách 5 bài luyện viết gần đây nhất.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Chủ đề</TableHead>
                  <TableHead>Cấp độ</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentArticles.map((article: any) => (
                  <TableRow key={article._id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {article.title_vn}
                    </TableCell>
                    <TableCell>{article.topic}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{article.level}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/admin/source-articles/${article._id}`}>
                            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                          </Link>
                          <Link
                            href={`/admin/source-articles/${article._id}/edit`}
                          >
                            <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                          </Link>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 2. CỘT PHẢI (3 phần): HOẠT ĐỘNG GẦN ĐÂY (TIMELINE) */}
        <Card className="col-span-3 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Nhật ký học tập của học viên (Real-time).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentActivities.map((activity: any, index: number) => (
                <div key={index} className="flex items-start">
                  {/* Avatar */}
                  <Avatar className="h-9 w-9 mt-0.5 border border-slate-200 dark:border-slate-700">
                    <AvatarImage src={activity.user?.image} alt="Avatar" />
                    <AvatarFallback className="text-xs">
                      {activity.user?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Nội dung hoạt động */}
                  <div className="ml-4 space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">
                      {activity.user?.name || "Người dùng ẩn"}
                    </p>

                    <div className="text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1 mr-1 align-text-bottom">
                        {getActivityIcon(activity.type)}
                      </span>
                      {activity.type === "writing" ? (
                        <>
                          đã làm bài{" "}
                          <span className="font-medium text-foreground">
                            {activity.target}
                          </span>
                        </>
                      ) : (
                        <>
                          đang học bộ thẻ{" "}
                          <span className="font-medium text-foreground">
                            {activity.target}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-slate-400">
                      {formatDate(activity.time)}
                    </p>
                  </div>

                  {/* Kết quả/Điểm số */}
                  <div className="ml-auto font-medium text-sm whitespace-nowrap">
                    {activity.type === "writing" ? (
                      <Badge
                        variant={
                          activity.status === "Hoàn thành"
                            ? "default"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {activity.detail}
                      </Badge>
                    ) : (
                      <span className="text-xs text-orange-500 font-bold">
                        {activity.detail}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {recentActivities.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Activity className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm">Chưa có hoạt động nào.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Sub-components ---
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description: string;
}
function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-border transition-all duration-200 hover:shadow-md hover:border-primary/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <div className="h-9 w-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="col-span-4 h-[400px] rounded-xl" />
        <Skeleton className="col-span-3 h-[400px] rounded-xl" />
      </div>
    </div>
  );
}
