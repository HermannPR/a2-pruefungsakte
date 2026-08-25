import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import AchievementBadge from './AchievementBadge.jsx';
import { useLanguage } from './i18n.jsx';

export function achievementCopy(achievement, t) {
  if (achievement.kind === 'section') return {
    title: t('achievement.sectionTitle', { skill: t(`skill.${achievement.skillId}`) }),
    description: t('achievement.sectionDescription', { skill: t(`skill.${achievement.skillId}`), score: achievement.threshold })
  };
  if (achievement.kind === 'ready') return { title: t('achievement.readyTitle'), description: t('achievement.readyDescription') };
  return { title: t('achievement.trackTitle'), description: t('achievement.trackDescription') };
}

export default function AchievementPopup({ achievement, remaining, close }) {
  const { t } = useLanguage();
  const closeRef = useRef(null);
  const copy = achievementCopy(achievement, t);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, [achievement.id]);

  return <aside className="achievement-popup" role="dialog" aria-modal="false" aria-labelledby="achievement-popup-title" aria-describedby="achievement-popup-description">
    <div className="achievement-rays" aria-hidden="true" />
    <button ref={closeRef} className="achievement-close" onClick={close} aria-label={t('achievement.close')}><X size={18} /></button>
    <AchievementBadge achievement={achievement} size="large" />
    <div className="achievement-popup-copy">
      <span>{t('achievement.unlocked')}</span>
      <h2 id="achievement-popup-title">{copy.title}</h2>
      <p id="achievement-popup-description">{copy.description}</p>
      {remaining > 0 && <small>{t('achievement.remaining', { count: remaining })}</small>}
      <button className="primary-button" onClick={close}>{t('achievement.continue')}</button>
    </div>
  </aside>;
}
