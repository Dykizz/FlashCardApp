"use client";

import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 ">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <BookOpen className="h-16 w-16 text-blue-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">
              Bạn đã đăng nhập rồi!
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Bạn đã đăng nhập thành công. Quay lại trang chủ để tiếp tục học
              nhé!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/flashcards">
              <Button className="w-full h-11 sm:h-12 text-base">
                Quay lại trang chủ
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/flashcards" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4 px-4 sm:px-6">
          <div className="flex justify-center">
            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600" />
          </div>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl">
            Chào mừng trở lại
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Đăng nhập để tiếp tục học với Flash Card App
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6 pb-6">
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full h-11 sm:h-12 text-sm sm:text-base cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              ></path>
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              ></path>
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
            </svg>
            <span className="text-sm sm:text-base">Đăng nhập bằng Google</span>
          </Button>

          <p className="text-xs sm:text-sm text-center text-muted-foreground px-2">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <a href="#" className="underline hover:text-primary">
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="#" className="underline hover:text-primary">
              Chính sách bảo mật
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
