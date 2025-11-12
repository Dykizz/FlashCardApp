"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export function NotLogin() {
  const handleLogin = () => {
    signIn("google", { callbackUrl: window.location.pathname });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-sm mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-blue-500 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Bạn chưa đăng nhập
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Vui lòng đăng nhập để truy cập vào nội dung này.
          </p>
          <div className="mt-8">
            <Button
              onClick={handleLogin}
              className="w-full  px-6 py-4 md:py-5 text-base font-semibold  rounded-lg shadow-md  focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ease-in-out transform cursor-pointer"
            >
              Đăng nhập ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
