export const THEME_COLORS = {
  primary: '#3B82F6', // Vibrant Indigo/Blue
  primaryGradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
  secondary: '#10B981', // Emerald Success
  accent: '#F59E0B', // Amber
  danger: '#EF4444', // Rose
  graphNodes: {
    student: '#6366F1',
    competency: '#10B981',
    project: '#F59E0B',
    opportunity: '#EC4899',
    institution: '#8B5CF6'
  },
  darkBg: '#090D16',
  cardBg: 'rgba(23, 27, 38, 0.75)',
  cardBorder: 'rgba(255, 255, 255, 0.08)'
};

export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function getScoreBadgeColor(score: number): string {
  if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
}
