"""readiness_domain_foundation

Revision ID: d5e6f7a8b9c0
Revises: c4d5e6f7a8b9
Create Date: 2026-09-04 11:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd5e6f7a8b9c0'
down_revision: Union[str, Sequence[str], None] = 'c4d5e6f7a8b9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enhance student_competencies table with state, signals, versions, provenance & constraints
    op.add_column(
        'student_competencies',
        sa.Column('state', sa.String(length=30), server_default='NOT_ASSESSED', nullable=False)
    )
    op.add_column(
        'student_competencies',
        sa.Column('evidence_count', sa.Integer(), server_default='0', nullable=False)
    )
    op.add_column(
        'student_competencies',
        sa.Column('verified_evidence_count', sa.Integer(), server_default='0', nullable=False)
    )
    op.add_column(
        'student_competencies',
        sa.Column('evidence_strength', sa.String(length=30), nullable=True)
    )
    op.add_column(
        'student_competencies',
        sa.Column('assessment_score', sa.Float(), nullable=True)
    )
    op.add_column(
        'student_competencies',
        sa.Column('experience_score', sa.Float(), nullable=True)
    )
    op.add_column(
        'student_competencies',
        sa.Column('algorithm_version', sa.String(length=50), server_default='v1.0.0', nullable=False)
    )
    op.add_column(
        'student_competencies',
        sa.Column('taxonomy_version', sa.String(length=50), server_default='v1.0.0', nullable=False)
    )
    op.add_column(
        'student_competencies',
        sa.Column('provenance', sa.JSON(), server_default='{}', nullable=False)
    )
    op.add_column(
        'student_competencies',
        sa.Column('last_evaluated_at', sa.DateTime(timezone=True), nullable=True)
    )

    # Add CHECK constraints to student_competencies
    op.create_check_constraint(
        'ck_student_competency_score_range',
        'student_competencies',
        'score >= 0.0 AND score <= 100.0'
    )
    op.create_check_constraint(
        'ck_student_competency_confidence_range',
        'student_competencies',
        'confidence_score >= 0.0 AND confidence_score <= 1.0'
    )
    op.create_check_constraint(
        'ck_student_competency_assessment_score_range',
        'student_competencies',
        'assessment_score IS NULL OR (assessment_score >= 0.0 AND assessment_score <= 100.0)'
    )
    op.create_check_constraint(
        'ck_student_competency_experience_score_range',
        'student_competencies',
        'experience_score IS NULL OR (experience_score >= 0.0 AND experience_score <= 100.0)'
    )
    op.create_index('ix_student_competencies_state', 'student_competencies', ['state'])

    # 2. Create student_competency_state_history table
    op.create_table(
        'student_competency_state_history',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('student_id', sa.String(length=36), sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('competency_id', sa.String(length=36), sa.ForeignKey('competencies.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('proficiency_level', sa.String(length=30), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('state', sa.String(length=30), nullable=False),
        sa.Column('evidence_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('verified_evidence_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('evidence_strength', sa.String(length=30), nullable=True),
        sa.Column('assessment_score', sa.Float(), nullable=True),
        sa.Column('experience_score', sa.Float(), nullable=True),
        sa.Column('algorithm_version', sa.String(length=50), nullable=False),
        sa.Column('taxonomy_version', sa.String(length=50), nullable=False),
        sa.Column('provenance', sa.JSON(), server_default='{}', nullable=False),
        sa.Column('recorded_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index(
        'ix_student_comp_history_lookup',
        'student_competency_state_history',
        ['student_id', 'competency_id', 'recorded_at']
    )

    # 3. Create student_role_readiness table
    op.create_table(
        'student_role_readiness',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('student_id', sa.String(length=36), sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('target_type', sa.String(length=50), server_default='ROLE', nullable=False),
        sa.Column('target_id', sa.String(length=36), nullable=False, index=True),
        sa.Column('readiness_state', sa.String(length=30), server_default='NOT_ASSESSED', nullable=False),
        sa.Column('readiness_score', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('confidence', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('missing_competencies_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('satisfied_competencies_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('total_required_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('algorithm_version', sa.String(length=50), server_default='v1.0.0', nullable=False),
        sa.Column('provenance', sa.JSON(), server_default='{}', nullable=False),
        sa.Column('calculated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.UniqueConstraint('student_id', 'target_type', 'target_id', name='uq_student_target_readiness'),
        sa.CheckConstraint('readiness_score >= 0.0 AND readiness_score <= 100.0', name='ck_student_readiness_score_range'),
        sa.CheckConstraint('confidence >= 0.0 AND confidence <= 1.0', name='ck_student_readiness_confidence_range'),
    )
    op.create_index(
        'ix_student_target_readiness_lookup',
        'student_role_readiness',
        ['student_id', 'target_type', 'target_id']
    )


def downgrade() -> None:
    # 3. Drop student_role_readiness table
    op.drop_index('ix_student_target_readiness_lookup', table_name='student_role_readiness')
    op.drop_table('student_role_readiness')

    # 2. Drop student_competency_state_history table
    op.drop_index('ix_student_comp_history_lookup', table_name='student_competency_state_history')
    op.drop_table('student_competency_state_history')

    # 1. Revert student_competencies additions
    op.drop_index('ix_student_competencies_state', table_name='student_competencies')
    op.drop_constraint('ck_student_competency_experience_score_range', 'student_competencies', type_='check')
    op.drop_constraint('ck_student_competency_assessment_score_range', 'student_competencies', type_='check')
    op.drop_constraint('ck_student_competency_confidence_range', 'student_competencies', type_='check')
    op.drop_constraint('ck_student_competency_score_range', 'student_competencies', type_='check')

    op.drop_column('student_competencies', 'last_evaluated_at')
    op.drop_column('student_competencies', 'provenance')
    op.drop_column('student_competencies', 'taxonomy_version')
    op.drop_column('student_competencies', 'algorithm_version')
    op.drop_column('student_competencies', 'experience_score')
    op.drop_column('student_competencies', 'assessment_score')
    op.drop_column('student_competencies', 'evidence_strength')
    op.drop_column('student_competencies', 'verified_evidence_count')
    op.drop_column('student_competencies', 'evidence_count')
    op.drop_column('student_competencies', 'state')
