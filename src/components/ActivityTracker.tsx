"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function ActivityTracker() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    const pingActivity = async () => {
      try {
        await fetch("/api/ping", {
          method: "POST",
          keepalive: true,
        });
      } catch (error) {
        console.error("Activity ping failed", error);
      }
    };

    pingActivity();

    const INTERVAL_MS = 5 * 60 * 1000;
    const intervalId = setInterval(pingActivity, INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [status]);

  return null;
}
