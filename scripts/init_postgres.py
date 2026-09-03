import asyncio
import asyncpg

async def main():
    print("Connecting to postgres...")
    conn = await asyncpg.connect("postgresql://postgres@127.0.0.1:5432/postgres")
    try:
        await conn.execute("CREATE USER skillsetu_user WITH SUPERUSER PASSWORD 'skillsetu_password';")
        print("Created user skillsetu_user")
    except Exception as e:
        print("User note:", e)
        
    try:
        await conn.execute("CREATE DATABASE skillsetu_db OWNER skillsetu_user;")
        print("Created database skillsetu_db")
    except Exception as e:
        print("Database note:", e)
        
    await conn.close()
    
    print("Connecting to skillsetu_db as skillsetu_user...")
    conn2 = await asyncpg.connect("postgresql://skillsetu_user:skillsetu_password@127.0.0.1:5432/skillsetu_db")
    await conn2.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    await conn2.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')
    version = await conn2.fetchval("SELECT version()")
    print("SUCCESS! Connected to:", version)
    await conn2.close()

if __name__ == "__main__":
    asyncio.run(main())
