"use client";

import { useAuthStore } from "@/store/auth.store";
import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export function CrispChat() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
    if (!websiteId) return;

    Crisp.configure(websiteId);
  }, []);

  // Pre-fill user context when authenticated
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID) return;
    if (!user) return;

    try {
      Crisp.user.setEmail(user.email);
      Crisp.user.setNickname(user.name);
      if (user.avatarUrl) {
        Crisp.user.setAvatar(user.avatarUrl);
      }
    } catch {
      // Crisp not ready yet — safe to ignore
    }
  }, [user]);

  return null;
}
