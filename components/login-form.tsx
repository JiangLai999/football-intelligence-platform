"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ nextPath, error }: { nextPath: string; error?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(error === "invalid" ? "用户名或密码错误" : null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");

    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        setMessage("用户名或密码错误");
        return;
      }

      window.location.href = nextPath;
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-md rounded-2xl p-6 panel">
      <p className="text-xs uppercase tracking-[0.24em] text-accent">运维入口</p>
      <h1 className="mt-3 text-3xl font-bold">登录</h1>
      <p className="mt-2 text-sm text-muted">请使用环境变量配置的内部运维账号登录。</p>

      <form
        className="mt-6 space-y-4"
        action={(formData) => {
          onSubmit(formData);
        }}
      >
        <input type="hidden" name="next" value={nextPath} />
        <div>
          <label className="text-sm text-muted" htmlFor="username">
            用户名
          </label>
          <input
            id="username"
            name="username"
            className="mt-2 w-full rounded-xl border border-line bg-panelAlt px-4 py-3 text-sm text-text outline-none"
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted" htmlFor="password">
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="mt-2 w-full rounded-xl border border-line bg-panelAlt px-4 py-3 text-sm text-text outline-none"
            autoComplete="current-password"
            required
          />
        </div>
        {message ? <p className="text-sm text-danger">{message}</p> : null}
        <button
          type="submit"
          className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? "登录中..." : "登录"}
        </button>
      </form>
    </div>
  );
}
