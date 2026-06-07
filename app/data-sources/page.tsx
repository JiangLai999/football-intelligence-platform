import { DataSourceList } from "@/components/data-source-list";
import { getPersistedOrFallbackSources } from "@/lib/server/data-sources";

export default async function DataSourcesPage() {
  const sources = await getPersistedOrFallbackSources();

  return (
    <div className="container-page space-y-6">
      <div>
        <h1 className="text-3xl font-bold">数据源注册表</h1>
        <p className="mt-2 text-sm text-muted">
          已管理的赛事、赔率、阵容、排名及上下文新闻的数据源清单。
        </p>
      </div>
      <DataSourceList sources={sources} />
    </div>
  );
}
