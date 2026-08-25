export default function AchievementBadge({ achievement, locked = false, size = 'regular' }) {
  const color = locked ? '#918b80' : achievement.color;
  return <svg className={`achievement-badge ${size}`} viewBox="0 0 120 140" role="img" aria-hidden="true">
    <path className="badge-ribbon" d="M31 93 24 135l36-19 36 19-7-42Z" fill={locked ? '#c9c3b7' : color} />
    <path d="m60 7 12 8 14-1 7 12 13 6v15l7 11-7 12v15l-13 6-7 12-14-1-12 8-12-8-14 1-7-12-13-6V70L7 58l7-11V32l13-6 7-12 14 1Z" fill="#f7f1e4" stroke={color} strokeWidth="5" />
    <circle cx="60" cy="58" r="36" fill={locked ? '#e4ded3' : color} opacity={locked ? '.75' : '1'} />
    <circle cx="60" cy="58" r="29" fill="none" stroke="#f7f1e4" strokeWidth="1.5" strokeDasharray="2 4" />
    <text x="60" y="64" textAnchor="middle" fill="#fff" fontSize={achievement.mark.length > 1 ? '20' : '30'} fontFamily="Georgia, serif" fontWeight="700">{locked ? '—' : achievement.mark}</text>
    <text x="60" y="84" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="monospace" fontWeight="700" letterSpacing="1">{achievement.threshold}%</text>
  </svg>;
}
