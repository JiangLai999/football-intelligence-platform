import { getArchitectureModules } from "@/lib/server/platform-data";

export default function ArchitecturePage() {
  const architectureModules = getArchitectureModules();

  return (
    <div className="container-page space-y-6">
      <div>
        <h1 className="text-3xl font-bold">系统架构</h1>
        <p className="mt-2 text-sm text-muted">
          面向生产环境的设计,涵盖摄取、仓库、赔率分析、建模、自动化和交付。
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {architectureModules.map((module) => (
          <article key={module.name} className="rounded-2xl p-5 panel">
            <h2 className="text-xl font-semibold">{module.name}</h2>
            <p className="mt-2 text-sm text-muted">{module.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-text">
              {module.items.map((item) => (
                <li key={item} className="rounded-lg border border-line px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
