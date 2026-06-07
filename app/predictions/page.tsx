import { PredictionCard } from "@/components/prediction-card";
import { getTopPredictions } from "@/lib/server/platform-data";

export default async function PredictionsPage() {
  const topPredictions = await getTopPredictions();

  return (
    <div className="container-page space-y-6">
      <div>
        <h1 className="text-3xl font-bold">预测中心</h1>
        <p className="mt-2 text-sm text-muted">
          按模型置信度、市场偏离、风险和比分分布对赛事进行排名。
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {topPredictions.map((prediction) => (
          <PredictionCard key={prediction.matchId} prediction={prediction} />
        ))}
      </div>
    </div>
  );
}
