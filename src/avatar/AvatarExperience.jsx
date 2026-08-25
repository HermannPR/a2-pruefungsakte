import { useEffect, useRef, useState } from 'react';
import { Check, Settings2, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../i18n.jsx';
import { animals, defaultAnimalIds } from './avatarCatalog.js';
import { avatarDisplayName, avatarItemName, avatarText } from './avatarCopy.js';
import AvatarRenderer from './AvatarRenderer.jsx';

export function AvatarSetup({ avatar, save }) {
  const { locale } = useLanguage();
  const [animalId, setAnimalId] = useState(avatar.selectedAnimalId ?? 'cat');
  const [nicknames, setNicknames] = useState(avatar.nicknames ?? {});
  const dialogRef = useRef(null);
  useEffect(() => { dialogRef.current?.querySelector('button')?.focus(); }, []);
  return <div className="avatar-modal-layer" role="presentation">
    <section ref={dialogRef} className="avatar-setup-dialog" role="dialog" aria-modal="true" aria-labelledby="avatar-setup-title">
      <div className="avatar-setup-copy"><span className="eyebrow"><Sparkles size={15} />{avatarText(locale, 'companion')}</span><h2 id="avatar-setup-title">{avatarText(locale, 'choose')}</h2><p>{avatarText(locale, 'chooseIntro')}</p></div>
      <div className="avatar-choice-grid">
        {animals.filter(item => defaultAnimalIds.includes(item.id)).map(animal => <button key={animal.id} className={animalId === animal.id ? 'selected' : ''} onClick={() => setAnimalId(animal.id)} aria-pressed={animalId === animal.id}><AvatarRenderer avatar={{ selectedAnimalId: animal.id, equipped: {} }} size="choice" /><strong>{avatarItemName(locale, animal)}</strong>{animalId === animal.id && <Check size={17} />}</button>)}
      </div>
      <label className="avatar-nickname"><span>{avatarText(locale, 'nickname')}</span><input value={animalId === 'cat' ? avatarItemName(locale, animals.find(item => item.id === 'cat')) : nicknames[animalId] ?? ''} disabled={animalId === 'cat'} maxLength="24" onChange={event => setNicknames(current => ({ ...current, [animalId]: event.target.value }))} /></label>
      <button className="primary-button" onClick={() => save({ ...avatar, setupComplete: true, selectedAnimalId: animalId, nickname: '', nicknames: Object.fromEntries(Object.entries(nicknames).map(([id, name]) => [id, name.trim()]).filter(([, name]) => name)) })}>{avatarText(locale, 'continue')} <Check size={18} /></button>
    </section>
  </div>;
}

export function AvatarUnlockPopup({ reward, avatar, close }) {
  const { locale } = useLanguage();
  const closeRef = useRef(null);
  useEffect(() => { closeRef.current?.focus(); }, [reward.id]);
  const preview = reward.category ? { ...avatar, equipped: { ...avatar.equipped, [reward.category]: reward.id } } : { ...avatar, selectedAnimalId: reward.id };
  return <aside className="avatar-unlock-popup" role="dialog" aria-modal="false" aria-labelledby="avatar-unlock-title"><button ref={closeRef} onClick={close} aria-label={avatarText(locale, 'close')}><X size={18} /></button><AvatarRenderer avatar={preview} size="unlock" /><div><span className="eyebrow"><Sparkles size={14} />{avatarText(locale, 'newReward')}</span><h2 id="avatar-unlock-title">{avatarItemName(locale, reward)}</h2><p>{avatarText(locale, 'rewardIntro')}</p><button className="primary-button" onClick={close}>{avatarText(locale, 'keepLearning')}</button></div></aside>;
}

export function AvatarCompanion({ avatar, skillName, onTrain, onCustomize }) {
  const { locale } = useLanguage();
  return <section className="avatar-companion-card paper-card" data-tour="avatar-companion"><div><span className="eyebrow">{avatarText(locale, 'recommendation')}</span><h2>{avatarDisplayName(locale, avatar)}</h2><p>{avatarText(locale, 'train', { skill: skillName })}</p><div className="avatar-companion-actions"><button className="primary-button" onClick={onTrain}>{avatarText(locale, 'train', { skill: skillName })}</button><button className="avatar-settings-button" onClick={onCustomize} aria-label={avatarText(locale, 'customize')}><Settings2 size={18} /></button></div></div><AvatarRenderer avatar={avatar} size="companion" /></section>;
}
