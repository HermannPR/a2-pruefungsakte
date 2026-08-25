import { useState } from 'react';
import { Check, CircleDashed, Search, Volume2 } from 'lucide-react';
import { workbookVocabulary, workbookVocabularyTopics } from './data/workbookVocabulary.js';
import { useLanguage } from './i18n.jsx';
import { speakGerman } from './lib/germanSpeech.js';
import { useMobileDetailReveal } from './lib/useMobileDetailReveal.js';

export default function WorkbookVocabularyLibrary({ vocabularyProgress, onResult }) {
  const { t } = useLanguage();
  const [selectedChapter, setSelectedChapter] = useState(workbookVocabularyTopics[0].id);
  const [query, setQuery] = useState('');
  const detailRef = useMobileDetailReveal(selectedChapter);
  const mastered = vocabularyProgress?.mastered ?? [];
  const normalizedQuery = query.trim().toLocaleLowerCase('de');
  const chapterItems = workbookVocabulary.filter(item => item.chapter === selectedChapter);
  const items = chapterItems.filter(item => !normalizedQuery || `${item.word} ${item.detail}`.toLocaleLowerCase('de').includes(normalizedQuery));
  const chapter = workbookVocabularyTopics.find(item => item.id === selectedChapter);
  const knownCount = chapterItems.filter(item => mastered.includes(item.id)).length;

  return (
    <section className="workbook-vocabulary-layout reveal delay-1">
      <aside className="vocabulary-topics workbook-chapters" aria-label={t('vocabulary.chapters')}>
        {workbookVocabularyTopics.map(entry => {
          const topicItems = workbookVocabulary.filter(item => item.chapter === entry.id);
          const known = topicItems.filter(item => mastered.includes(item.id)).length;
          return <button key={entry.id} className={selectedChapter === entry.id ? 'active' : ''} onClick={() => { setSelectedChapter(entry.id); setQuery(''); }}>
            <span>{String(entry.number).padStart(2, '0')}</span><div><strong>{entry.title}</strong><small>{t('vocabulary.sourcePages', { pages: entry.pages.join(', ') })}</small></div><b>{known}/{topicItems.length}</b>
          </button>;
        })}
      </aside>
      <div ref={detailRef} tabIndex="-1" className="workbook-vocabulary-main mobile-detail-target">
        <div className="workbook-vocabulary-toolbar paper-card">
          <label><Search size={18} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={t('vocabulary.search')} aria-label={t('vocabulary.search')} type="search" /></label>
          <div><h2>{chapter.title}</h2><span>{t('vocabulary.chapterProgress', { known: knownCount, total: chapterItems.length })}</span></div>
        </div>
        <div className="workbook-vocabulary-grid">
          {items.map(item => {
            const known = mastered.includes(item.id);
            return <article className={`workbook-word-card paper-card ${known ? 'known' : ''}`} key={item.id}>
              <div><span>{t('vocabulary.chapter')} {chapter.number}</span><small>{t('vocabulary.page', { page: item.sourcePage })}</small></div>
              <h3>{item.word}</h3>
              <p>{item.detail || chapter.title}</p>
              {item.example && <blockquote>{item.example}</blockquote>}
              <footer>
                <button onClick={() => speakGerman(item.word, { rate: 0.82 })} aria-label={t('vocabulary.pronounce')}><Volume2 size={17} /></button>
                <button className={known ? 'known' : ''} onClick={() => onResult(item.id, !known)}>{known ? <Check size={16} /> : <CircleDashed size={16} />}{known ? t('vocabulary.known') : t('vocabulary.markKnown')}</button>
              </footer>
            </article>;
          })}
        </div>
        {!items.length && <div className="paper-card workbook-empty">{t('vocabulary.noResults')}</div>}
      </div>
    </section>
  );
}
