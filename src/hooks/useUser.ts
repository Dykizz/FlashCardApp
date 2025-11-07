import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface User {
  userId: string;
  username: string;
  displayName: string;
  role: string;
}

export function useUser() {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User | null>({
    queryKey: ["user"], // ⭐ Add queryKey
    queryFn: async () => {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken");

      if (!userStr || !token) {
        return null;
      }

      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // ⭐ Listen to storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [queryClient]);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    queryClient.setQueryData(["user"], null);
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  return { user, isLoading, error, logout };
}
