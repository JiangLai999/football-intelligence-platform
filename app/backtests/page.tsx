import { getBacktests } from "@/lib/server/platform-data";

export default async function BacktestsPage() {
  const backtests = await getBacktests();

  return (
    <div className="container-page space-y-6">
      <div>
        <h1 className="text-3xl font-bold">回测实验室</h1>
        <p className="mt-2 text-sm text-muted">
          按联赛和模型版本审计预测准确度、校准、ROI模拟及市场优势。
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl panel">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-panelAlt text-muted">
            <tr>
              <th className="px-4 py-3">模型</th>
              <th className="px-4 py-3">赛事</th>
              <th className="px-4 py-3">准确度</th>
              <th className="px-4 py-3">对数损失</th>
              <th className="px-4 py-3">ROI模拟</th>
            </tr>
          </thead>
          <tbody>
            {backtests.map((item) => (
              <tr key={`${item.model}-${item.competition}`} className="border-t border-line">
                <td className="px-4 py-3 font-medium">{item.model}</td>
                <td className="px-4 py-3">{item.competition}</td>
                <td className="px-4 py-3">{item.accuracy}</td>
                <td className="px-4 py-3">{item.logLoss}</td>
                <td className="px-4 py-3">{item.roi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
