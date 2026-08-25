import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LockKeyhole, X } from 'lucide-react';
import { useLanguage } from '../i18n.jsx';
import { accessories, animals, defaultAnimalIds } from './avatarCatalog.js';
import { avatarMetrics, rewardProgress } from './avatarUnlocks.js';
import { avatarCategoryName, avatarDisplayName, avatarItemName, avatarRequirement, avatarText } from './avatarCopy.js';
import AvatarRenderer from './AvatarRenderer.jsx';

const accessoryCategories = ['head', 'face', 'neck', 'held', 'background'];

export default function AvatarCustomizer({ avatar, progress, scores, updateAvatar }) {
  const { locale } = useLanguage();
  const [lockedItem, setLockedItem] = useState(null);
  const closeRef = useRef(null);
  const metrics = avatarMetrics(progress, scores);
  const unlockedAnimals = new Set([...defaultAnimalIds, ...(avatar.unlockedAnimals ?? [])]);
  const unlockedAccessories = new Set(avatar.unlockedAccessories ?? []);
  const selectAnimal = animal => unlockedAnimals.has(animal.id) ? updateAvatar({ ...avatar, selectedAnimalId: animal.id }) : setLockedItem(animal);
  const toggleAccessory = item => unlockedAccessories.has(item.id) ? updateAvatar({ ...avatar, equipped: { ...avatar.equipped, [item.category]: avatar.equipped?.[item.category] === item.id ? null : item.id } }) : setLockedItem(item);
  const lockedReward = lockedItem ? rewardProgress(lockedItem.unlock, metrics) : null;
  const lockedPreview = lockedItem?.category ? { ...avatar, equipped: { ...avatar.equipped, [lockedItem.category]: lockedItem.id } } : { ...avatar, selectedAnimalId: lockedItem?.id };

  useEffect(() => {
    if (!lockedItem) return undefined;
    closeRef.current?.focus();
    function closeOnEscape(event) { if (event.key === 'Escape') setLockedItem(null); }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [lockedItem]);

  return <><section className="avatar-collection paper-card reveal delay-2">
    <div className="section-heading"><div><span className="eyebrow">{avatarText(locale, 'companion')}</span><h2>{avatarText(locale, 'collection')}</h2></div><strong>{unlockedAnimals.size + unlockedAccessories.size}/{animals.length + accessories.length}</strong></div>
    <p>{avatarText(locale, 'collectionIntro')}</p>
    <div className="avatar-customizer-layout">
      <div className="avatar-stage" data-tour="avatar-progress"><AvatarRenderer avatar={avatar} size="stage" label={avatarDisplayName(locale, avatar)} /><strong>{avatarDisplayName(locale, avatar)}</strong><span>{avatarText(locale, 'customize')}</span><label className="avatar-name-editor"><span>{avatarText(locale, 'nickname')}</span><input disabled={avatar.selectedAnimalId === 'cat'} maxLength="24" value={avatar.selectedAnimalId === 'cat' ? avatarDisplayName(locale, avatar) : avatar.nicknames?.[avatar.selectedAnimalId] ?? ''} placeholder={avatarItemName(locale, animals.find(item => item.id === avatar.selectedAnimalId))} onChange={event => updateAvatar({ ...avatar, nickname: '', nicknames: { ...(avatar.nicknames ?? {}), [avatar.selectedAnimalId]: event.target.value } })} /></label></div>
      <div className="avatar-inventory">
        <h3>{avatarText(locale, 'animals')}</h3>
        <div className="animal-inventory-grid">{animals.map(animal => {
          const unlocked = unlockedAnimals.has(animal.id); const reward = rewardProgress(animal.unlock, metrics);
          return <button key={animal.id} data-avatar-item={animal.id} aria-haspopup={unlocked ? undefined : 'dialog'} className={`${avatar.selectedAnimalId === animal.id ? 'selected' : ''} ${unlocked ? 'unlocked' : 'locked'}`} onClick={() => selectAnimal(animal)}><AvatarRenderer avatar={{ selectedAnimalId: animal.id, equipped: {} }} size="inventory" /><strong>{avatarItemName(locale, animal)}</strong><small>{unlocked ? avatarText(locale, avatar.selectedAnimalId === animal.id ? 'equipped' : 'unlocked') : avatarRequirement(locale, animal, reward.current)}</small>{!unlocked && <LockKeyhole size={15} />}</button>;
        })}</div>
        <h3>{avatarText(locale, 'accessories')}</h3>
        <div className="accessory-categories">{accessoryCategories.map(category => <section className="accessory-category" key={category} aria-label={avatarCategoryName(locale, category)}>
          <div className="accessory-category-heading"><h4>{avatarCategoryName(locale, category)}</h4><span>{avatar.equipped?.[category] ? '1/1' : '0/1'}</span></div>
          <div className="accessory-inventory-grid">{accessories.filter(item => item.category === category).map(item => {
            const unlocked = unlockedAccessories.has(item.id); const equipped = avatar.equipped?.[item.category] === item.id; const reward = rewardProgress(item.unlock, metrics);
            return <button key={item.id} data-avatar-item={item.id} aria-haspopup={unlocked ? undefined : 'dialog'} className={`${equipped ? 'selected' : ''} ${unlocked ? 'unlocked' : 'locked'}`} onClick={() => toggleAccessory(item)}><span className="accessory-preview"><AvatarRenderer avatar={{ selectedAnimalId: avatar.selectedAnimalId, equipped: { [item.category]: item.id } }} size="accessory" /></span><strong>{avatarItemName(locale, item)}</strong><small>{unlocked ? avatarText(locale, equipped ? 'remove' : 'equip') : avatarRequirement(locale, item, reward.current)}</small>{!unlocked && <LockKeyhole size={15} />}</button>;
          })}</div>
        </section>)}</div>
      </div>
    </div>
  </section>{lockedItem && createPortal(<div className="avatar-modal-layer" role="presentation" onMouseDown={event => event.target === event.currentTarget && setLockedItem(null)}><section className="avatar-locked-dialog" role="dialog" aria-modal="true" aria-labelledby="avatar-locked-title"><button ref={closeRef} className="dialog-close" onClick={() => setLockedItem(null)} aria-label={avatarText(locale, 'close')}><X size={19} /></button><AvatarRenderer avatar={lockedPreview} size="unlock" /><div><span className="eyebrow"><LockKeyhole size={14} />{avatarText(locale, 'nextReward')}</span><h2 id="avatar-locked-title">{avatarItemName(locale, lockedItem)}</h2><p>{avatarRequirement(locale, lockedItem, lockedReward.current)}</p><progress max={lockedReward.target} value={Math.min(lockedReward.current, lockedReward.target)} aria-label={avatarRequirement(locale, lockedItem, lockedReward.current)} /><button className="primary-button" onClick={() => setLockedItem(null)}>{avatarText(locale, 'close')}</button></div></section></div>, document.body)}</>;
}
