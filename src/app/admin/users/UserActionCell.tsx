"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/utils/toast";

interface UserActionCellProps {
  userId: string;
  isBanned: boolean;
}

export const UserActionCell = ({ userId, isBanned }: UserActionCellProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const toggleBan = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          isBanned: !isBanned,
        }),
      });

      if (!res.ok) throw new Error("Lỗi khi cập nhật");

      showToast({
        type: "success",
        title: "Cập nhật trạng thái thành công",
        description: isBanned
          ? "Mở khóa người dùng thành công"
          : "Khóa người dùng thành công",
      });

      queryClient.invalidateQueries({ queryKey: ["admin-users"] });

      router.refresh();
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isBanned ? "default" : "destructive"}
      size="icon"
      onClick={toggleBan}
      disabled={loading}
      className="h-8 w-8"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isBanned ? (
        <Unlock className="h-4 w-4" />
      ) : (
        <Lock className="h-4 w-4" />
      )}
    </Button>
  );
};
