// import Link from "next/link";
// import { Calendar, Eye, ArrowLeft } from "lucide-react";
// import { headers } from "next/headers";
// import { Metadata } from "next";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { convertTiptapJsonToHtml } from "@/lib/tiptap-utils";
// import { formatDate } from "@/utils/date";
// import { PostDetail } from "@/types/post";
// import SyntaxHighlighter from "@/components/syntax-highlighter";

// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }): Promise<Metadata> {
//   try {
//     const { slug } = await params;
//     const post = await getPostDetail(slug);

//     return {
//       title: post.title,
//       description: post.description || post.title,
//       openGraph: {
//         title: post.title,
//         description: post.description || post.title,
//         images: post.thumbnail ? [post.thumbnail] : [],
//       },
//     };
//   } catch (error) {
//     return {
//       title: "Bài viết không tồn tại",
//     };
//   }
// }

// const getSafeHost = async () => {
//   const headersList = await headers();
//   const host = headersList.get("x-forwarded-host") || headersList.get("host");

//   if (host) {
//     const protocol =
//       process.env.NODE_ENV === "production" || process.env.VERCEL_URL
//         ? "https"
//         : "http";
//     return `${protocol}://${host}`;
//   }
//   return "http://localhost:3000";
// };

// async function getPostDetail(slug: string): Promise<PostDetail> {
//   const BASE_URL = await getSafeHost();
//   const API_URL = `${BASE_URL}/api/posts/${slug}`;
//   console.log("Fetching post detail from:", API_URL);

//   const response = await fetch(API_URL, {
//     method: "GET",
//     headers: {
//       host: new URL(BASE_URL).host,
//     },
//     next: { revalidate: 60 },
//   });

//   if (!response.ok) {
//     throw new Error("Không tìm thấy bài viết");
//   }

//   const result = await response.json();
//   return result.data;
// }

// // --- MAIN COMPONENT ---
// export default async function PostDetailPage({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   let post: PostDetail;
//   let htmlContent: string;
//   const { slug } = await params;

//   try {
//     post = await getPostDetail(slug);
//     htmlContent = convertTiptapJsonToHtml(post.content);
//   } catch (error: any) {
//     return (
//       <div className="min-h-screen flex items-center justify-center  ">
//         <div className="text-center space-y-4 p-8 ">
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
//             Không tìm thấy bài viết
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400">
//             Bài viết bạn đang tìm không tồn tại hoặc đã bị xóa.
//           </p>
//           <Link href="/">
//             <Button className="mt-6">
//               <ArrowLeft className="mr-2 h-4 w-4" /> Về trang chủ
//             </Button>
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   // Chỉ hiển thị bài viết đã publish
//   if (post.status !== "published") {
//     return (
//       <div className="min-h-screen flex items-center justify-center  ">
//         <div className="text-center space-y-4 p-8 max-w-md">
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
//             Bài viết chưa được xuất bản
//           </h1>
//           <Link href="/">
//             <Button className="mt-4">
//               <ArrowLeft className="mr-2 h-4 w-4" /> Về trang chủ
//             </Button>
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <article className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
//       <header className="max-w-7xl mx-auto pt-5 border-gray-200 dark:border-gray-800  ">
//         <Link href="/posts">
//           <Button size="sm">
//             <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
//           </Button>
//         </Link>
//       </header>

//       {/* MAIN CONTENT - FULL WIDTH */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
//         {/* ARTICLE HEADER */}
//         <div className="mb-12 space-y-6">
//           {/* Tags */}
//           {post.tags && post.tags.length > 0 && (
//             <div className="flex flex-wrap gap-2">
//               {post.tags.map((tag, index) => (
//                 <Badge
//                   key={index}
//                   variant="secondary"
//                   className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
//                 >
//                   {tag}
//                 </Badge>
//               ))}
//             </div>
//           )}

//           {/* Title */}
//           <h1 className="text-md sm:lg lg:text-xl font-bold text-center text-gray-900 dark:text-white leading-tight tracking-tight">
//             {post.title}
//           </h1>

//           {/* Description */}
//           {post.description && (
//             <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
//               {post.description}
//             </p>
//           )}

//           {/* Meta Info */}
//           <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
//             <span className="font-medium text-gray-900 dark:text-white">
//               {post.author?.name || "Anonymous"}
//             </span>
//             <span className="text-gray-500 dark:text-gray-500">•</span>
//             <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
//               <Calendar className="h-3.5 w-3.5" />
//               {formatDate(post.publishedAt || post.createdAt)}
//             </span>
//             <span className="text-gray-500 dark:text-gray-500">•</span>
//             <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
//               <Eye className="h-3.5 w-3.5" />
//               {post.views?.toLocaleString() || 0} lượt xem
//             </span>
//           </div>
//         </div>

//         {/* ARTICLE CONTENT - Typography Focus */}
//         <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
//           <div className="preview-content ProseMirror prose prose-lg prose-slate dark:prose-invert max-w-none">
//             <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
//           </div>
//         </div>
//         <SyntaxHighlighter />

//         {/* FOOTER - Simple */}
//         <div className="mt-10 pt-8 border-t flex justify-end border-gray-200 dark:border-gray-700">
//           <Link href="/posts">
//             <Button className="hover:bg-gray-100 ml-auto dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
//               Xem thêm bài viết
//             </Button>
//           </Link>
//         </div>
//       </main>
//     </article>
//   );
// }
"use client";

import Link from "next/link";
import { Calendar, Eye, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react"; // Thêm hook
import { useParams } from "next/navigation"; // Thêm hook lấy params

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { convertTiptapJsonToHtml } from "@/lib/tiptap-utils";
import { formatDate } from "@/utils/date";
import { PostDetail } from "@/types/post";
import SyntaxHighlighter from "@/components/syntax-highlighter";

// LƯU Ý: Không thể dùng generateMetadata trong Client Component.
// Nếu cần SEO, hãy dùng cấu trúc: Server Page (fetch metadata) -> Client Component (hiển thị).

export default function PostDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        // Ở Client, không cần absolute URL (http://...), chỉ cần relative path
        const response = await fetch(`/api/posts/${slug}`);

        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const result = await response.json();
        const postData = result.data;

        setPost(postData);
        // Chuyển đổi nội dung ngay khi có dữ liệu
        if (postData?.content) {
          setHtmlContent(convertTiptapJsonToHtml(postData.content));
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // --- TRẠNG THÁI LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Đang tải bài viết...</div>
      </div>
    );
  }

  // --- TRẠNG THÁI LỖI HOẶC KHÔNG TÌM THẤY ---
  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            Không tìm thấy bài viết
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bài viết bạn đang tìm không tồn tại hoặc đã bị xóa.
          </p>
          <Link href="/">
            <Button className="mt-6">
              <ArrowLeft className="mr-2 h-4 w-4" /> Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // --- TRẠNG THÁI CHƯA PUBLISH ---
  if (post.status !== "published") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Bài viết chưa được xuất bản
          </h1>
          <Link href="/">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // --- RENDER GIAO DIỆN CHÍNH ---
  return (
    <article className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="max-w-7xl mx-auto pt-5 border-gray-200 dark:border-gray-800">
        <Link href="/posts">
          <Button size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ARTICLE HEADER */}
        <div className="mb-12 space-y-6">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-md sm:lg lg:text-xl font-bold text-center text-gray-900 dark:text-white leading-tight tracking-tight">
            {post.title}
          </h1>

          {/* Description */}
          {post.description && (
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {post.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-900 dark:text-white">
              {post.author?.name || "Anonymous"}
            </span>
            <span className="text-gray-500 dark:text-gray-500">•</span>
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
            <span className="text-gray-500 dark:text-gray-500">•</span>
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <Eye className="h-3.5 w-3.5" />
              {post.views?.toLocaleString() || 0} lượt xem
            </span>
          </div>
        </div>

        {/* ARTICLE CONTENT */}
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
          <div className="preview-content ProseMirror prose prose-lg prose-slate dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        </div>

        {/* Component Highlighting vẫn hoạt động tốt ở Client */}
        <SyntaxHighlighter />

        {/* FOOTER */}
        <div className="mt-10 pt-8 border-t flex justify-end border-gray-200 dark:border-gray-700">
          <Link href="/posts">
            <Button className="hover:bg-gray-100 ml-auto dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Xem thêm bài viết
            </Button>
          </Link>
        </div>
      </main>
    </article>
  );
}
