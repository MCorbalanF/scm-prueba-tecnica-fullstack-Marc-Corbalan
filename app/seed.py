import asyncio
import random
from datetime import datetime, timedelta

from faker import Faker
from sqlalchemy import select, func

from app.database import SessionLocal
from app.models import Item

fake = Faker()

STATUSES = ["pending", "done", "cancelled", "in_progress"]
TARGET_ITEMS = 200


def random_date():
    return datetime(2024, 1, 1) + timedelta(days=random.randint(0, 600))


async def seed_items(target: int = TARGET_ITEMS):
    async with SessionLocal() as session:

        # 1. contar existentes
        count = await session.scalar(
            select(func.count()).select_from(Item)
        )

        if count is None:
            count = 0

        print(f"📊 Items actuales en DB: {count}")

        # 2. si ya hay suficientes, salir
        if count >= target:
            print("✅ Ya existen suficientes datos. No se hace seed.")
            return

        to_create = target - count

        print(f"🌱 Generando {to_create} items nuevos...")

        items = []

        for _ in range(to_create):
            items.append(
                Item(
                    sku=fake.unique.bothify(text="SKU-#####"),
                    status=random.choice(STATUSES),
                    warehouse_id=random.randint(1, 10),
                    created_at=random_date(),
                )
            )

        session.add_all(items)
        await session.commit()

        print(f"✅ Insertados {to_create} items.")
        
if __name__ == "__main__":
    asyncio.run(seed_items(200))