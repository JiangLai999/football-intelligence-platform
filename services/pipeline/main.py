from datetime import UTC, datetime
from connectors import build_default_connectors
from jobs import build_jobs


def run_jobs() -> None:
    connectors = build_default_connectors()
    jobs = build_jobs(connectors)
    print(f"[{datetime.now(UTC).isoformat()}] pipeline boot")
    for job in jobs:
        print(f"- scheduled job registered: {job.name} ({job.stage})")
        print(f"  description: {job.description}")
        print(f"  probe: {job.run()}")

    print("- output contract: fixtures -> warehouse -> features -> predictions -> alerts -> reports")


if __name__ == "__main__":
    run_jobs()
