import { notFound } from "next/navigation";
import { MatchDetailPanel } from "@/components/match-detail-panel";
import { getMatchDetail } from "@/lib/server/platform-data";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getMatchDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="container-page">
      <MatchDetailPanel detail={detail} />
    </div>
  );
}
