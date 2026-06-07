"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="mt-6 w-full rounded-xl border border-line px-4 py-3 text-sm text-muted transition hover:bg-panelAlt hover:text-text disabled:opacity-50"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/login";
          router.refresh();
        });
      }}
    >
      {isPending ? "退出中..." : "退出登录"}
    </button>
  );
}
