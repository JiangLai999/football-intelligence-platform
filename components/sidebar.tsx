import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  ["仪表盘", "/"],
  ["赛事中心", "/matches"],
  ["预测分析", "/predictions"],
  ["赔率监控", "/odds"],
  ["球队情报", "/teams"],
  ["数据源", "/data-sources"],
  ["运维监控", "/operations"],
  ["运维控制台", "/operator"],
  ["回测实验", "/backtests"],
  ["系统架构", "/architecture"]
] as const;

export function Sidebar() {
  return (
    <aside className="border-b border-line bg-panel/95 lg:min-h-screen lg:border-b-0 lg:border-r">
      <div className="sticky top-0 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">FIP</p>
          <h2 className="mt-2 text-2xl font-bold">足球智能平台</h2>
          <p className="mt-2 text-sm text-muted">专业足球数据分析、赔率监控与预测建模。</p>
        </div>
        <nav className="mt-8 space-y-2">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="block rounded-xl border border-transparent px-4 py-3 text-sm text-muted transition hover:border-line hover:bg-panelAlt hover:text-text">
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-6">
          <a href="/login" className="block rounded-xl border border-transparent px-4 py-3 text-sm text-muted transition hover:border-line hover:bg-panelAlt hover:text-text">
            运维登录
          </a>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
