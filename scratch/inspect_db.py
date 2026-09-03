import asyncio
import asyncpg
import json

async def main():
    conn = await asyncpg.connect('postgresql://skillsetu_user:skillsetu_password@127.0.0.1:5432/skillsetu_db')
    tax_tables = [
        'domains', 'categories', 'competencies', 'skills',
        'skill_competencies', 'roles_catalog', 'role_competency_requirements',
        'competency_relationships', 'skill_aliases'
    ]
    report = {}
    for t in tax_tables:
        cols = await conn.fetch("""
            SELECT column_name, data_type, character_maximum_length, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = $1
            ORDER BY ordinal_position
        """, t)
        
        fks = await conn.fetch("""
            SELECT
                tc.constraint_name, kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name,
                rc.delete_rule
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
                JOIN information_schema.referential_constraints AS rc
                  ON tc.constraint_name = rc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1
        """, t)
        
        uqs = await conn.fetch("""
            SELECT tc.constraint_name, kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.constraint_type = 'UNIQUE' AND tc.table_name = $1
        """, t)
        
        chks = await conn.fetch("""
            SELECT tc.constraint_name, cc.check_clause
            FROM information_schema.table_constraints tc
            JOIN information_schema.check_constraints cc
              ON tc.constraint_name = cc.constraint_name
            WHERE tc.constraint_type = 'CHECK' AND tc.table_name = $1
        """, t)
        
        idxs = await conn.fetch("""
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE schemaname = 'public' AND tablename = $1
        """, t)
        
        cnt = await conn.fetchval(f"SELECT count(*) FROM {t}")
        
        report[t] = {
            'row_count': cnt,
            'columns': [dict(c) for c in cols],
            'foreign_keys': [dict(f) for f in fks],
            'uniques': [dict(u) for u in uqs],
            'checks': [dict(k) for k in chks],
            'indexes': [dict(i) for i in idxs]
        }
    
    with open("c:/Users/kukpo/OneDrive/Desktop/SIH26/scratch/db_schema_audit.json", "w") as f:
        json.dump(report, f, indent=2, default=str)
    print("PostgreSQL 16 schema forensic inspection complete. Saved to scratch/db_schema_audit.json")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
