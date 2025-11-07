"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { fetchWithAuth } from "@/utils/apiClient";
import { showToast } from "@/utils/toast";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const USERNAME_REGEX = /^[a-z0-9_-]+$/;

interface RegisterFormData {
  username: string;
  password: string;
  displayName: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    mode: "onBlur",
  });

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);

    try {
      const res = await fetchWithAuth<{
        id: string;
        displayName: string;
        username: string;
      }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!res.success) {
        showToast({
          description: res.error?.message || "Đã xảy ra lỗi",
          type: "error",
          title: "Lỗi",
        });
        setLoading(false);
        return;
      }

      showToast({
        description: "Đăng ký thành công! Vui lòng đăng nhập.",
        type: "success",
        title: "Thành công",
      });
      router.push("/login");
    } catch (err: any) {
      showToast({
        description: err.message || "Đã xảy ra lỗi",
        type: "error",
        title: "Lỗi",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Đăng ký
          </CardTitle>
          <CardDescription className="text-center">
            Tạo tài khoản mới để bắt đầu
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="vd: user_01"
                autoComplete="username"
                {...register("username", {
                  required: "Vui lòng nhập username",
                  minLength: {
                    value: 4,
                    message: "Username phải từ 4 đến 20 ký tự",
                  },
                  maxLength: {
                    value: 20,
                    message: "Username phải từ 4 đến 20 ký tự",
                  },
                  pattern: {
                    value: USERNAME_REGEX,
                    message: "Username chỉ chứa chữ thường, số, _ hoặc -",
                  },
                })}
              />
              {errors.username && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="pr-10"
                  {...register("password", {
                    required: "Vui lòng nhập mật khẩu",
                    minLength: {
                      value: 5,
                      message: "Mật khẩu phải từ 5 đến 20 ký tự",
                    },
                    maxLength: {
                      value: 20,
                      message: "Mật khẩu phải từ 5 đến 20 ký tự",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Tên hiển thị</Label>
              <Input
                id="displayName"
                placeholder="Nhập tên hiển thị"
                autoComplete="displayName"
                {...register("displayName", {
                  required: "Vui lòng nhập tên hiển thị",
                  minLength: {
                    value: 2,
                    message: "Tên hiển thị phải từ 2 ký tự trở lên",
                  },
                  maxLength: {
                    value: 50,
                    message: "Tên hiển thị không quá 50 ký tự",
                  },
                })}
              />
              {errors.displayName && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.displayName.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đăng ký"
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Đăng nhập
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
