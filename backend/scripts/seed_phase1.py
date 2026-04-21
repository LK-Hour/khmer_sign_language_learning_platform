import asyncio
import sys
from pathlib import Path

# Allow running from the repo root without PYTHONPATH tweaks.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.session import AsyncSessionLocal
from app.services.seeding import seed_phase1_data


async def main() -> None:
    async with AsyncSessionLocal() as session:
        await seed_phase1_data(session)


if __name__ == "__main__":
    asyncio.run(main())
