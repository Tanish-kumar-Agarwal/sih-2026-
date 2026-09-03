import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://skillsetu_user:skillsetu_password@127.0.0.1:5432/skillsetu_db')
    tables = [
        "domains", "categories", "competencies", "skills",
        "skill_competencies", "roles_catalog", "role_competency_requirements",
        "competency_relationships"
    ]
    print("PostgreSQL 16 Canonical Taxonomy Table Counts:")
    for t in tables:
        count = await conn.fetchval(f"SELECT count(*) FROM {t};")
        print(f" - {t}: {count} rows")
    
    # Check domains
    domains = await conn.fetch("SELECT code, name FROM domains ORDER BY code;")
    print("\nDomains in database:")
    for d in domains:
        print(f" * [{d['code']}] {d['name']}")

    # Check categories
    cats = await conn.fetch("SELECT c.code, c.name, d.code as domain_code FROM categories c JOIN domains d ON c.domain_id = d.id ORDER BY d.code, c.code;")
    print("\nCategories in database:")
    for c in cats:
        print(f" * [{c['domain_code']}] {c['code']} - {c['name']}")

    await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
