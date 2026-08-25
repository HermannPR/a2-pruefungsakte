import { useMemo, useState } from 'react';
import { ArrowRight, Check, Volume2 } from 'lucide-react';
import { articleBank, articleOptions } from './data/articleBank.js';
import { useLanguage } from './i18n.jsx';
import { speakGerman } from './lib/germanSpeech.js';

export default function ArticleTrainer({ vocabularyProgress, onResult }) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const [result, setResult] = useState(null);
  const mastered = vocabularyProgress?.mastered ?? [];
  const items = useMemo(() => [...articleBank].sort((left, right) => Number(mastered.includes(left.vocabularyId)) - Number(mastered.includes(right.vocabularyId))), []);
  const item = items[index % items.length];
  const masteredArticles = articleBank.filter(entry => mastered.includes(entry.vocabularyId)).length;

  function answer(article) {
    if (result !== null) return;
    const correct = article === item.article;
    setChoice(article);
    setResult(correct);
    onResult(item.vocabularyId, correct);
  }

  function next() {
    setIndex(current => (current + 1) % items.length);
    setChoice(null);
    setResult(null);
  }

  return <section className="article-trainer paper-card reveal delay-1">
    <header className="article-trainer-head"><div><span className="eyebrow">DER · DIE · DAS</span><h2>{t('vocabulary.articleTitle')}</h2><p>{t('vocabulary.articleIntro')}</p></div><div className="article-progress"><strong>{masteredArticles}</strong><span>{t('vocabulary.articleSecure', { total: articleBank.length })}</span></div></header>
    <div className="article-question-meta"><span>{t('vocabulary.articleQuestion', { current: index + 1, total: items.length })}</span>{item.sourcePage && <span>{t('vocabulary.page', { page: item.sourcePage })}</span>}</div>
    <div className="article-word"><button className="pronounce-button" onClick={() => speakGerman(item.noun, { rate: 0.82 })} aria-label={t('vocabulary.pronounce')}><Volume2 size={20} /></button><span>{t('vocabulary.chooseArticle')}</span><h3>___ {item.noun}</h3>{item.detail && <small>{item.detail}</small>}</div>
    <div className="article-options">{articleOptions.map(article => <button key={article} disabled={result !== null} onClick={() => answer(article)} className={`${choice === article ? 'selected' : ''} ${result !== null && article === item.article ? 'correct' : ''} ${result === false && choice === article ? 'wrong' : ''}`}><span>{article}</span>{result !== null && article === item.article && <Check size={19} />}</button>)}</div>
    {result !== null && <div className={`article-feedback ${result ? 'pass' : 'retry'}`} aria-live="polite"><strong>{result ? t('vocabulary.correct') : t('vocabulary.articleCorrection', { word: item.word })}</strong><p>{item.hint}</p>{item.example && <blockquote>{item.example}</blockquote>}</div>}
    {result !== null && <button className="primary-button article-next" onClick={next}>{t('vocabulary.next')} <ArrowRight size={18} /></button>}
  </section>;
}
