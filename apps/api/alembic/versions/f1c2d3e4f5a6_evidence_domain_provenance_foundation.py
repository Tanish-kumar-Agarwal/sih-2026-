"""evidence_domain_provenance_foundation

Revision ID: f1c2d3e4f5a6
Revises: e904c4bed880
Create Date: 2026-09-04 01:09:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1c2d3e4f5a6'
down_revision: Union[str, Sequence[str], None] = 'e904c4bed880'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to establish canonical Evidence Domain + Provenance Foundation."""
    # 1. Expand evidence table
    op.add_column('evidence', sa.Column('evidence_type', sa.String(length=50), server_default='PROJECT', nullable=False))
    op.add_column('evidence', sa.Column('source_type', sa.String(length=50), server_default='REPOSITORY', nullable=False))
    op.add_column('evidence', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('evidence', sa.Column('source_reference', sa.String(length=255), nullable=True))
    op.add_column('evidence', sa.Column('confidence_score', sa.Float(), server_default='1.0', nullable=True))
    op.add_column('evidence', sa.Column('evidence_strength', sa.String(length=50), server_default='STRONG', nullable=True))
    op.add_column('evidence', sa.Column('processing_status', sa.String(length=50), server_default='COMPLETED', nullable=True))
    op.add_column('evidence', sa.Column('domain_code', sa.String(length=50), server_default='GENERAL', nullable=True))
    op.add_column('evidence', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('evidence', sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True))

    op.alter_column('evidence', 'entity_type', existing_type=sa.String(length=50), nullable=True)
    op.alter_column('evidence', 'entity_id', existing_type=sa.String(length=36), nullable=True)

    op.create_index(op.f('ix_evidence_evidence_type'), 'evidence', ['evidence_type'], unique=False)
    op.create_index(op.f('ix_evidence_source_type'), 'evidence', ['source_type'], unique=False)
    op.create_index(op.f('ix_evidence_processing_status'), 'evidence', ['processing_status'], unique=False)

    # 2. Create evidence_provenance table
    op.create_table(
        'evidence_provenance',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('evidence_id', sa.String(length=36), sa.ForeignKey('evidence.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('source_type', sa.String(length=50), nullable=False),
        sa.Column('source_url', sa.Text(), nullable=True),
        sa.Column('source_reference', sa.String(length=255), nullable=True),
        sa.Column('collection_method', sa.String(length=50), server_default='SYSTEM_SYNC', nullable=False),
        sa.Column('extraction_method', sa.String(length=50), nullable=True),
        sa.Column('analysis_method', sa.String(length=50), nullable=True),
        sa.Column('algorithm_version', sa.String(length=50), server_default='v1.0.0', nullable=False),
        sa.Column('observed_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_evidence_provenance_evidence_id'), 'evidence_provenance', ['evidence_id'], unique=True)

    # 3. Create evidence_claims table
    op.create_table(
        'evidence_claims',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('evidence_id', sa.String(length=36), sa.ForeignKey('evidence.id', ondelete='CASCADE'), nullable=False),
        sa.Column('claim_type', sa.String(length=50), nullable=False),
        sa.Column('observed_fact', sa.Text(), nullable=False),
        sa.Column('claim_statement', sa.Text(), nullable=False),
        sa.Column('confidence', sa.Float(), server_default='1.0', nullable=False),
        sa.Column('status', sa.String(length=20), server_default='ACTIVE', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_evidence_claims_evidence_id'), 'evidence_claims', ['evidence_id'], unique=False)

    # 4. Create evidence_competencies table
    op.create_table(
        'evidence_competencies',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('evidence_id', sa.String(length=36), sa.ForeignKey('evidence.id', ondelete='CASCADE'), nullable=False),
        sa.Column('competency_id', sa.String(length=36), sa.ForeignKey('competencies.id', ondelete='CASCADE'), nullable=False),
        sa.Column('claim_id', sa.String(length=36), sa.ForeignKey('evidence_claims.id', ondelete='SET NULL'), nullable=True),
        sa.Column('mapping_source', sa.String(length=50), server_default='DIRECT_ASSERTION', nullable=False),
        sa.Column('confidence', sa.Float(), server_default='1.0', nullable=False),
        sa.Column('weight', sa.Float(), server_default='1.0', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('evidence_id', 'competency_id', name='uq_evidence_competency')
    )
    op.create_index(op.f('ix_evidence_competencies_evidence_id'), 'evidence_competencies', ['evidence_id'], unique=False)
    op.create_index(op.f('ix_evidence_competencies_competency_id'), 'evidence_competencies', ['competency_id'], unique=False)

    # 5. Create evidence_skills table
    op.create_table(
        'evidence_skills',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('evidence_id', sa.String(length=36), sa.ForeignKey('evidence.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', sa.String(length=36), sa.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False),
        sa.Column('claim_id', sa.String(length=36), sa.ForeignKey('evidence_claims.id', ondelete='SET NULL'), nullable=True),
        sa.Column('relevance_score', sa.Float(), server_default='1.0', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('evidence_id', 'skill_id', name='uq_evidence_skill')
    )
    op.create_index(op.f('ix_evidence_skills_evidence_id'), 'evidence_skills', ['evidence_id'], unique=False)
    op.create_index(op.f('ix_evidence_skills_skill_id'), 'evidence_skills', ['skill_id'], unique=False)

    # 6. Data backfill for existing evi-001
    op.execute("""
        UPDATE evidence 
        SET evidence_type = 'PROJECT',
            source_type = 'REPOSITORY',
            description = 'SkillSetu Backend API Gateway Code Attestation and Architectural Ledger',
            source_reference = 'github.com/Tanish-kumar-Agarwal/sih-2026-',
            confidence_score = 1.0,
            evidence_strength = 'STRONG',
            processing_status = 'COMPLETED',
            domain_code = 'GENERAL',
            verified_at = created_at
        WHERE id = 'evi-001';
    """)

    op.execute("""
        INSERT INTO evidence_provenance (
            id, evidence_id, source_type, source_url, source_reference,
            collection_method, extraction_method, analysis_method,
            algorithm_version, observed_at, created_at
        )
        SELECT 
            'prov-001', 'evi-001', 'REPOSITORY', uri, 'github.com/Tanish-kumar-Agarwal/sih-2026-',
            'SYSTEM_SYNC', 'GIT_METADATA', 'STATIC_ANALYSIS',
            'v1.0.0', created_at, created_at
        FROM evidence 
        WHERE id = 'evi-001'
        ON CONFLICT (evidence_id) DO NOTHING;
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('evidence_skills')
    op.drop_table('evidence_competencies')
    op.drop_table('evidence_claims')
    op.drop_table('evidence_provenance')

    op.drop_index(op.f('ix_evidence_processing_status'), table_name='evidence')
    op.drop_index(op.f('ix_evidence_source_type'), table_name='evidence')
    op.drop_index(op.f('ix_evidence_evidence_type'), table_name='evidence')

    op.drop_column('evidence', 'verified_at')
    op.drop_column('evidence', 'updated_at')
    op.drop_column('evidence', 'domain_code')
    op.drop_column('evidence', 'processing_status')
    op.drop_column('evidence', 'evidence_strength')
    op.drop_column('evidence', 'confidence_score')
    op.drop_column('evidence', 'source_reference')
    op.drop_column('evidence', 'description')
    op.drop_column('evidence', 'source_type')
    op.drop_column('evidence', 'evidence_type')
