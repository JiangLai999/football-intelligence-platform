from dataclasses import dataclass
from typing import Protocol


@dataclass
class SourceConfig:
    source_id: str
    label: str
    category: str
    cadence: str


class Connector(Protocol):
    config: SourceConfig

    def pull(self) -> str:
        ...


class StubConnector:
    def __init__(self, config: SourceConfig) -> None:
        self.config = config

    def pull(self) -> str:
        return f"connector={self.config.source_id} category={self.config.category} cadence={self.config.cadence}"


def build_default_connectors() -> list[Connector]:
    return [
        StubConnector(SourceConfig("fixtures-primary", "Primary fixtures feed", "fixtures", "15m pre-match / 30s in-play")),
        StubConnector(SourceConfig("odds-aggregator", "Odds aggregator", "odds", "5m pre-match / 15s in-play")),
        StubConnector(SourceConfig("lineups-scraper", "Lineup monitor", "lineups", "60m to kickoff / 5m final hour")),
        StubConnector(SourceConfig("ratings-provider", "Ratings provider", "rankings", "daily")),
    ]
