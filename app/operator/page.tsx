import { OperatorBoard } from "@/components/operator-board";
import { requireOperatorSession } from "@/lib/server/auth";
import { getOperatorOverview } from "@/lib/server/operator-data";

export default async function OperatorPage({
  searchParams
}: {
  searchParams: Promise<{
    actor?: string;
    action?: string;
    entityType?: string;
    taskCategory?: string;
    taskStatus?: string;
    alertSeverity?: string;
    alertState?: string;
    runStatus?: string;
    runStage?: string;
    runName?: string;
  }>;
}) {
  await requireOperatorSession();
  const params = await searchParams;
  const data = await getOperatorOverview({
    actor: params.actor,
    action: params.action,
    entityType: params.entityType,
    taskCategory: params.taskCategory,
    taskStatus: params.taskStatus,
    alertSeverity: params.alertSeverity,
    alertState: params.alertState,
    runStatus: params.runStatus,
    runStage: params.runStage,
    runName: params.runName
  });

  return (
    <div className="container-page space-y-6">
      <div>
        <h1 className="text-3xl font-bold">运维控制台</h1>
        <p className="mt-2 text-sm text-muted">
          内部运维概览,涵盖数据源、任务、告警及系统就绪状态。
        </p>
      </div>
      <OperatorBoard data={data} />
    </div>
  );
}
