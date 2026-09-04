"""evidence_artifacts_and_extractions

Revision ID: a2b3c4d5e6f7
Revises: f1c2d3e4f5a6
Create Date: 2026-09-04 08:36:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a2b3c4d5e6f7'
down_revision: Union[str, Sequence[str], None] = 'f1c2d3e4f5a6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create evidence_artifacts and evidence_extractions tables."""
    # 1. Create evidence_artifacts table
    op.create_table(
        'evidence_artifacts',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('evidence_id', sa.String(length=36), sa.ForeignKey('evidence.id', ondelete='CASCADE'), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('normalized_filename', sa.String(length=255), nullable=False),
        sa.Column('mime_type', sa.String(length=100), nullable=False),
        sa.Column('detected_content_type', sa.String(length=100), nullable=True),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('sha256_checksum', sa.String(length=64), nullable=False),
        sa.Column('storage_provider', sa.String(length=50), server_default='LOCAL', nullable=False),
        sa.Column('storage_key', sa.String(length=500), nullable=False),
        sa.Column('retention_state', sa.String(length=50), server_default='ACTIVE', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_evidence_artifacts_evidence_id'), 'evidence_artifacts', ['evidence_id'], unique=False)
    op.create_index(op.f('ix_evidence_artifacts_sha256_checksum'), 'evidence_artifacts', ['sha256_checksum'], unique=False)

    # 2. Create evidence_extractions table
    op.create_table(
        'evidence_extractions',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('artifact_id', sa.String(length=36), sa.ForeignKey('evidence_artifacts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('extractor_name', sa.String(length=100), nullable=False),
        sa.Column('extractor_version', sa.String(length=50), nullable=False),
        sa.Column('extraction_status', sa.String(length=50), server_default='COMPLETED', nullable=False),
        sa.Column('raw_text', sa.Text(), nullable=True),
        sa.Column('page_count', sa.Integer(), server_default='1', nullable=False),
        sa.Column('extracted_metadata', sa.JSON(), nullable=True),
        sa.Column('observed_facts', sa.JSON(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('extracted_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_evidence_extractions_artifact_id'), 'evidence_extractions', ['artifact_id'], unique=False)


def downgrade() -> None:
    """Drop tables in reverse order."""
    op.drop_table('evidence_extractions')
    op.drop_table('evidence_artifacts')
