import { ApiResponse } from "@/lib/response";
import { signOut } from "next-auth/react";
export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    const data: ApiResponse<T> = await res.json();

    if (res.status === 401) {
      window.location.href = "/login";
      return {
        success: false,
        data: null,
        error: { message: "Vui lòng đăng nhập", statusCode: 401 },
      };
    }

    if (res.status === 403) {
      signOut({ callbackUrl: "/login?error=banned" });
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

export async function get<T>(url: string): Promise<ApiResponse<T>> {
  return fetchWithAuth<T>(url, { method: "GET" });
}

export async function post<T>(url: string, body: any): Promise<ApiResponse<T>> {
  return fetchWithAuth<T>(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function patch<T>(
  url: string,
  body: any
): Promise<ApiResponse<T>> {
  return fetchWithAuth<T>(url, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function del<T>(url: string): Promise<ApiResponse<T>> {
  return fetchWithAuth<T>(url, { method: "DELETE" });
}
