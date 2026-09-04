"""evidence_competency_mapping

Revision ID: c4d5e6f7a8b9
Revises: b3c4d5e6f7a8
Create Date: 2026-09-04 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4d5e6f7a8b9'
down_revision: Union[str, Sequence[str], None] = 'b3c4d5e6f7a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add rich mapping, confidence explanation, and verification columns to evidence_competencies."""
    op.add_column(
        'evidence_competencies',
        sa.Column('mapping_status', sa.String(length=50), server_default='PROPOSED', nullable=False)
    )
    op.add_column(
        'evidence_competencies',
        sa.Column('mapping_method', sa.String(length=50), server_default='DIRECT_SKILL_MATCH', nullable=False)
    )
    op.add_column(
        'evidence_competencies',
        sa.Column('confidence_reason', sa.Text(), nullable=True)
    )
    op.add_column(
        'evidence_competencies',
        sa.Column('evidence_strength', sa.String(length=50), server_default='MODERATE', nullable=False)
    )
    op.add_column(
        'evidence_competencies',
        sa.Column('skill_id', sa.String(length=36), nullable=True)
    )
    op.add_column(
        'evidence_competencies',
        sa.Column('source_location', sa.String(length=255), nullable=True)
    )
    op.add_column(
        'evidence_competencies',
        sa.Column('algorithm_version', sa.String(length=50), server_default='v1.0.0', nullable=False)
    )
    op.add_column(
        'evidence_competencies',
        sa.Column('reviewed_by', sa.String(length=36), nullable=True)
    )
    op.add_column(
        'evidence_competencies',
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.add_column(
        'evidence_competencies',
        sa.Column('review_reason', sa.Text(), nullable=True)
    )
    op.add_column(
        'evidence_competencies',
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )

    # Foreign keys
    op.create_foreign_key(
        'fk_evidence_competencies_skill_id',
        'evidence_competencies', 'skills',
        ['skill_id'], ['id'],
        ondelete='SET NULL'
    )
    op.create_foreign_key(
        'fk_evidence_competencies_reviewed_by',
        'evidence_competencies', 'users',
        ['reviewed_by'], ['id'],
        ondelete='SET NULL'
    )

    # Indexes
    op.create_index('ix_evidence_competencies_mapping_status', 'evidence_competencies', ['mapping_status'])
    op.create_index('ix_evidence_competencies_skill_id', 'evidence_competencies', ['skill_id'])
    op.create_index('ix_evidence_competencies_reviewed_by', 'evidence_competencies', ['reviewed_by'])


def downgrade() -> None:
    """Drop rich mapping columns from evidence_competencies."""
    op.drop_index('ix_evidence_competencies_reviewed_by', table_name='evidence_competencies')
    op.drop_index('ix_evidence_competencies_skill_id', table_name='evidence_competencies')
    op.drop_index('ix_evidence_competencies_mapping_status', table_name='evidence_competencies')

    op.drop_constraint('fk_evidence_competencies_reviewed_by', 'evidence_competencies', type_='foreignkey')
    op.drop_constraint('fk_evidence_competencies_skill_id', 'evidence_competencies', type_='foreignkey')

    op.drop_column('evidence_competencies', 'updated_at')
    op.drop_column('evidence_competencies', 'review_reason')
    op.drop_column('evidence_competencies', 'reviewed_at')
    op.drop_column('evidence_competencies', 'reviewed_by')
    op.drop_column('evidence_competencies', 'algorithm_version')
    op.drop_column('evidence_competencies', 'source_location')
    op.drop_column('evidence_competencies', 'skill_id')
    op.drop_column('evidence_competencies', 'evidence_strength')
    op.drop_column('evidence_competencies', 'confidence_reason')
    op.drop_column('evidence_competencies', 'mapping_method')
    op.drop_column('evidence_competencies', 'mapping_status')
