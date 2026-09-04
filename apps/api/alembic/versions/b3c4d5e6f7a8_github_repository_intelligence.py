"""github_repository_intelligence

Revision ID: b3c4d5e6f7a8
Revises: a2b3c4d5e6f7
Create Date: 2026-09-04 09:12:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b3c4d5e6f7a8'
down_revision: Union[str, Sequence[str], None] = 'a2b3c4d5e6f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create GitHub Repository Intelligence tables."""

    # 1. github_repositories
    op.create_table(
        'github_repositories',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('provider', sa.String(length=50), server_default='GITHUB', nullable=False),
        sa.Column('external_repo_id', sa.String(length=50), nullable=True),
        sa.Column('owner', sa.String(length=150), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('full_name', sa.String(length=300), nullable=False),
        sa.Column('canonical_url', sa.String(length=500), nullable=False),
        sa.Column('default_branch', sa.String(length=100), server_default='main', nullable=False),
        sa.Column('is_fork', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('parent_full_name', sa.String(length=300), nullable=True),
        sa.Column('parent_url', sa.String(length=500), nullable=True),
        sa.Column('stars_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('forks_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('open_issues_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('license_spdx', sa.String(length=100), nullable=True),
        sa.Column('topics', sa.JSON(), nullable=True),
        sa.Column('repo_created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('repo_updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('repo_pushed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_github_repositories_external_repo_id'), 'github_repositories', ['external_repo_id'], unique=False)
    op.create_index(op.f('ix_github_repositories_full_name'), 'github_repositories', ['full_name'], unique=False)
    op.create_unique_constraint('uq_github_repositories_canonical_url', 'github_repositories', ['canonical_url'])

    # 2. github_repository_snapshots
    op.create_table(
        'github_repository_snapshots',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('repository_id', sa.String(length=36), sa.ForeignKey('github_repositories.id', ondelete='CASCADE'), nullable=False),
        sa.Column('evidence_id', sa.String(length=36), sa.ForeignKey('evidence.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_id', sa.String(length=36), sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False),
        sa.Column('commit_sha', sa.String(length=40), nullable=True),
        sa.Column('snapshot_status', sa.String(length=50), server_default='COMPLETED', nullable=False),
        sa.Column('analysis_limits_reached', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('summary_metrics', sa.JSON(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('fetched_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_github_repository_snapshots_repository_id'), 'github_repository_snapshots', ['repository_id'], unique=False)
    op.create_index(op.f('ix_github_repository_snapshots_evidence_id'), 'github_repository_snapshots', ['evidence_id'], unique=False)
    op.create_index(op.f('ix_github_repository_snapshots_student_id'), 'github_repository_snapshots', ['student_id'], unique=False)

    # 3. github_languages
    op.create_table(
        'github_languages',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('snapshot_id', sa.String(length=36), sa.ForeignKey('github_repository_snapshots.id', ondelete='CASCADE'), nullable=False),
        sa.Column('language', sa.String(length=100), nullable=False),
        sa.Column('byte_count', sa.BigInteger(), server_default='0', nullable=False),
        sa.Column('percentage', sa.Float(), server_default='0.0', nullable=False)
    )
    op.create_index(op.f('ix_github_languages_snapshot_id'), 'github_languages', ['snapshot_id'], unique=False)

    # 4. github_dependencies
    op.create_table(
        'github_dependencies',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('snapshot_id', sa.String(length=36), sa.ForeignKey('github_repository_snapshots.id', ondelete='CASCADE'), nullable=False),
        sa.Column('ecosystem', sa.String(length=50), nullable=False),
        sa.Column('package_name', sa.String(length=200), nullable=False),
        sa.Column('declared_version', sa.String(length=100), nullable=True),
        sa.Column('manifest_path', sa.String(length=255), nullable=False)
    )
    op.create_index(op.f('ix_github_dependencies_snapshot_id'), 'github_dependencies', ['snapshot_id'], unique=False)
    op.create_index(op.f('ix_github_dependencies_package_name'), 'github_dependencies', ['package_name'], unique=False)

    # 5. github_contributors
    op.create_table(
        'github_contributors',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('snapshot_id', sa.String(length=36), sa.ForeignKey('github_repository_snapshots.id', ondelete='CASCADE'), nullable=False),
        sa.Column('username', sa.String(length=150), nullable=True),
        sa.Column('external_user_id', sa.BigInteger(), nullable=True),
        sa.Column('commit_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('additions', sa.Integer(), server_default='0', nullable=False),
        sa.Column('deletions', sa.Integer(), server_default='0', nullable=False),
        sa.Column('contribution_ratio', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('is_student_linked', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('identity_confidence', sa.String(length=20), server_default='UNKNOWN', nullable=False)
    )
    op.create_index(op.f('ix_github_contributors_snapshot_id'), 'github_contributors', ['snapshot_id'], unique=False)
    op.create_index(op.f('ix_github_contributors_username'), 'github_contributors', ['username'], unique=False)

    # 6. github_commits
    op.create_table(
        'github_commits',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('snapshot_id', sa.String(length=36), sa.ForeignKey('github_repository_snapshots.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sha', sa.String(length=40), nullable=False),
        sa.Column('author_name', sa.String(length=200), nullable=False),
        sa.Column('author_email', sa.String(length=255), nullable=False),
        sa.Column('commit_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('additions', sa.Integer(), server_default='0', nullable=False),
        sa.Column('deletions', sa.Integer(), server_default='0', nullable=False),
        sa.Column('is_student_attributed', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('identity_confidence', sa.String(length=20), server_default='UNKNOWN', nullable=False)
    )
    op.create_index(op.f('ix_github_commits_snapshot_id'), 'github_commits', ['snapshot_id'], unique=False)
    op.create_index(op.f('ix_github_commits_sha'), 'github_commits', ['sha'], unique=False)

    # 7. github_pull_requests
    op.create_table(
        'github_pull_requests',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('snapshot_id', sa.String(length=36), sa.ForeignKey('github_repository_snapshots.id', ondelete='CASCADE'), nullable=False),
        sa.Column('pr_number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=300), nullable=False),
        sa.Column('state', sa.String(length=50), server_default='open', nullable=False),
        sa.Column('author_username', sa.String(length=150), nullable=False),
        sa.Column('is_merged', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('merged_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('additions', sa.Integer(), server_default='0', nullable=False),
        sa.Column('deletions', sa.Integer(), server_default='0', nullable=False),
        sa.Column('changed_files', sa.Integer(), server_default='0', nullable=False)
    )
    op.create_index(op.f('ix_github_pull_requests_snapshot_id'), 'github_pull_requests', ['snapshot_id'], unique=False)

    # 8. github_code_areas
    op.create_table(
        'github_code_areas',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('snapshot_id', sa.String(length=36), sa.ForeignKey('github_repository_snapshots.id', ondelete='CASCADE'), nullable=False),
        sa.Column('area_name', sa.String(length=100), nullable=False),
        sa.Column('files_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('commits_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('student_commits_count', sa.Integer(), server_default='0', nullable=False)
    )
    op.create_index(op.f('ix_github_code_areas_snapshot_id'), 'github_code_areas', ['snapshot_id'], unique=False)

    # 9. github_similarity_indicators
    op.create_table(
        'github_similarity_indicators',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('snapshot_id', sa.String(length=36), sa.ForeignKey('github_repository_snapshots.id', ondelete='CASCADE'), nullable=False),
        sa.Column('is_fork', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('upstream_repo', sa.String(length=300), nullable=True),
        sa.Column('fork_divergence_level', sa.String(length=50), server_default='NONE', nullable=False),
        sa.Column('file_path_overlap_ratio', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('readme_similarity_level', sa.String(length=50), server_default='UNKNOWN', nullable=False),
        sa.Column('indicator_summary', sa.Text(), nullable=True),
        sa.Column('confidence', sa.String(length=20), server_default='MEDIUM', nullable=False)
    )
    op.create_index(op.f('ix_github_similarity_indicators_snapshot_id'), 'github_similarity_indicators', ['snapshot_id'], unique=False)


def downgrade() -> None:
    """Drop GitHub Repository Intelligence tables in reverse order."""
    op.drop_table('github_similarity_indicators')
    op.drop_table('github_code_areas')
    op.drop_table('github_pull_requests')
    op.drop_table('github_commits')
    op.drop_table('github_contributors')
    op.drop_table('github_dependencies')
    op.drop_table('github_languages')
    op.drop_table('github_repository_snapshots')
    op.drop_table('github_repositories')
