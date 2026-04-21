import asyncio
import os
import sys
from pathlib import Path

# Allow running from the repo root without PYTHONPATH tweaks.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.session import AsyncSessionLocal
from app.services.seeding import seed_test_accounts

DEFAULT_LEARNER_EMAIL = "learner@test.ksl"
DEFAULT_ADMIN_EMAIL = "admin@test.ksl"
DEFAULT_TEST_PASSWORD = "Test@123456"


async def main() -> None:
    learner_email = os.getenv("TEST_LEARNER_EMAIL", DEFAULT_LEARNER_EMAIL)
    admin_email = os.getenv("TEST_ADMIN_EMAIL", DEFAULT_ADMIN_EMAIL)
    test_password = os.getenv("TEST_ACCOUNT_PASSWORD", DEFAULT_TEST_PASSWORD)

    async with AsyncSessionLocal() as session:
        await seed_test_accounts(
            session,
            learner_email=learner_email,
            admin_email=admin_email,
            password=test_password,
        )

    print("Test accounts are ready:")
    print(f"  Learner: {learner_email}")
    print(f"  Admin:   {admin_email}")
    print(f"  Password: {test_password}")


if __name__ == "__main__":
    asyncio.run(main())
