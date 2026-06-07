from dataclasses import dataclass
from typing import Callable


@dataclass
class PipelineJob:
    name: str
    stage: str
    description: str
    run: Callable[[], str]


def build_jobs(connectors) -> list[PipelineJob]:
    return [
        PipelineJob("sync_fixtures", "ingestion", "Pull canonical fixtures and match states.", connectors[0].pull),
        PipelineJob("sync_odds", "ingestion", "Capture odds snapshots and market movement.", connectors[1].pull),
        PipelineJob("sync_lineups", "ingestion", "Track expected and confirmed lineups.", connectors[2].pull),
        PipelineJob("sync_team_ratings", "ingestion", "Refresh external ranking baselines.", connectors[3].pull),
        PipelineJob("generate_features", "processing", "Build match-level model features.", lambda: "feature generation executed"),
        PipelineJob("refresh_predictions", "modeling", "Recompute probabilities and scorelines.", lambda: "prediction engine executed"),
        PipelineJob("generate_alerts", "delivery", "Raise market and model divergence alerts.", lambda: "alert engine executed"),
        PipelineJob("publish_reports", "delivery", "Publish operator and public summaries.", lambda: "report publisher executed"),
    ]
