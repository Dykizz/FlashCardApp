// utils/apiClient.ts
import { ApiResponse } from "@/lib/response";

// Hàm fetch chung
export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem("accessToken");
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(url, { ...options, headers });
    const data: ApiResponse<T> = await res.json();

    if (res.status === 401 && retry) {
      // token hết hạn, thử refresh token
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return fetchWithAuth(url, options, false); // retry 1 lần
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return {
          success: false,
          data: null,
          error: { message: "Unauthorized", statusCode: 401 },
        };
      }
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      data: null,
      error: { message: err.message, statusCode: 500 },
    };
  }
}

// Hàm thử refresh token (nếu bạn có refreshToken)
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refreshToken }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.data?.accessToken) {
      localStorage.setItem("accessToken", data.data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
