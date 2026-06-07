import { OperationsBoard } from "@/components/operations-board";

export default function OperationsPage() {
  return (
    <div className="container-page space-y-6">
      <div>
        <h1 className="text-3xl font-bold">运维监控</h1>
        <p className="mt-2 text-sm text-muted">
          足球智能平台的管道、刷新、告警和发布状态。
        </p>
      </div>
      <OperationsBoard />
    </div>
  );
}
