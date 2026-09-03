import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://skillsetu_user:skillsetu_password@127.0.0.1:5432/skillsetu_db')
    rows = await conn.fetch("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
    print(f"Total public tables in PostgreSQL: {len(rows)}")
    for r in rows:
        print(f" - {r['table_name']}")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
