import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, BrainCircuit, Check, Target } from 'lucide-react';
import { grammarBank, grammarTopics } from './data/grammarBank.js';
import { grammarLessons, grammarTeaching } from './data/grammarTeaching.js';
import { useLanguage } from './i18n.jsx';
import { calculateGrammarProgress, rankGrammarItems, scheduleGrammarQueue } from './lib/grammarAdaptive.js';
import { useMobileDetailReveal } from './lib/useMobileDetailReveal.js';

export default function GrammarView({ grammarProgress, onResult }) {
  const { t } = useLanguage();
  const [selectedTopic, setSelectedTopic] = useState('adaptive');
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [showLesson, setShowLesson] = useState(false);
  const detailRef = useMobileDetailReveal(selectedTopic);
  const topicProgress = topicId => calculateGrammarProgress(grammarBank.filter(item => item.topic === topicId), grammarProgress?.byQuestion);
  const [adaptiveQueue, setAdaptiveQueue] = useState(() => rankGrammarItems(grammarBank, grammarProgress?.byQuestion).map(item => item.id));
  const sessionItems = useMemo(() => {
    if (selectedTopic !== 'adaptive') return grammarBank.filter(item => item.topic === selectedTopic);
    return adaptiveQueue.map(itemId => grammarBank.find(item => item.id === itemId)).filter(Boolean);
  }, [selectedTopic, adaptiveQueue]);
  const item = sessionItems[selectedTopic === 'adaptive' ? 0 : index % sessionItems.length];
  const topic = grammarTopics.find(entry => entry.id === item.topic);
  const teaching = grammarTeaching[item.id];
  const lesson = grammarLessons[item.topic];
  const overallProgress = calculateGrammarProgress(grammarBank, grammarProgress?.byQuestion);

  function selectTopic(topicId) {
    setSelectedTopic(topicId);
    setIndex(0); setChoice(null); setResult(null); setShowLesson(false);
  }

  function evaluate() {
    const correct = choice === item.answer;
    setResult(correct);
    onResult(item.topic, correct, `${topic.title}: ${item.prompt}`, item.id);
  }

  function next() {
    if (selectedTopic === 'adaptive') setAdaptiveQueue(current => scheduleGrammarQueue(current, item.id, result));
    setIndex(current => (current + 1) % sessionItems.length);
    setChoice(null); setResult(null); setShowLesson(false);
  }

  function practiceSimilar() {
    const topicItems = grammarBank.filter(entry => entry.topic === item.topic);
    const topicIndex = topicItems.findIndex(entry => entry.id === item.id);
    setSelectedTopic(item.topic);
    setIndex((topicIndex + 1) % topicItems.length);
    setChoice(null); setResult(null); setShowLesson(false);
  }

  return (
    <div className="page grammar-page">
      <section className="page-intro reveal">
        <div><span className="eyebrow"><BrainCircuit size={15} />{t('grammar.eyebrow')}</span><h1>{t('grammar.title')}</h1><p>{t('grammar.intro')}</p></div>
        <div className="score-ticket"><span>{t('grammar.mastery')}</span><strong>{overallProgress.percentage}%</strong><small>{t('grammar.coverage', { mastered: overallProgress.mastered, attempted: overallProgress.attempted, total: overallProgress.total })}</small></div>
      </section>
      <section className="grammar-topic-grid reveal delay-1">
        <button data-tour="grammar-workshop" className={selectedTopic === 'adaptive' ? 'active adaptive' : 'adaptive'} onClick={() => selectTopic('adaptive')}>
          <span><BrainCircuit size={18} />AUTO</span><strong>{t('grammar.adaptive')}</strong><small>{t('grammar.adaptiveHelp')}</small>
        </button>
        {grammarTopics.map(entry => {
          const progress = topicProgress(entry.id);
          return <button key={entry.id} className={selectedTopic === entry.id ? 'active' : ''} onClick={() => selectTopic(entry.id)}><span>{entry.short}<b>{progress.percentage}%</b></span><strong>{entry.title}</strong><small>{entry.rule}</small></button>;
        })}
      </section>
      <article ref={detailRef} tabIndex="-1" className="grammar-dossier paper-card reveal delay-2 mobile-detail-target">
        <div className="practice-meta"><span><BrainCircuit size={17} />{topic.title}</span><span>{t('grammar.question', { current: index + 1, total: sessionItems.length })}</span><span className="difficulty">{selectedTopic === 'adaptive' ? t('grammar.adaptive') : t('grammar.focus')}</span></div>
        <div className="grammar-rule"><span>{t('grammar.rule')}</span><p>{topic.rule}</p></div>
        <div className="question-block grammar-question">
          <span className="eyebrow">{item.id.toUpperCase()}</span><h2>{item.prompt}</h2>
          <div className="option-list">{item.options.map((option, optionIndex) => (
            <button key={option} disabled={result !== null} onClick={() => setChoice(optionIndex)} className={`${choice === optionIndex ? 'selected' : ''} ${result !== null && optionIndex === item.answer ? 'correct' : ''} ${result === false && choice === optionIndex && optionIndex !== item.answer ? 'wrong' : ''}`}>
              <span>{String.fromCharCode(65 + optionIndex)}</span>{option}{result !== null && optionIndex === item.answer && <Check size={18} />}
            </button>
          ))}</div>
        </div>
        {result !== null && <section className={`grammar-teaching-feedback ${result ? 'pass' : 'retry'}`} aria-live="polite">
          <header><div className="feedback-score"><strong>{result ? '100%' : '0%'}</strong><span>{result ? t('grammar.correct') : t('grammar.incorrect')}</span></div><div><span className="eyebrow">{teaching.concept}</span><p>{item.explanation}</p></div></header>
          {!result && <div className="answer-explanation wrong-explanation"><strong>{t('grammar.whyWrong', { answer: item.options[choice] })}</strong><p>{teaching.wrongReasons[choice]}</p></div>}
          <div className="answer-explanation correct-explanation"><strong>{t('grammar.whyCorrect', { answer: item.options[item.answer] })}</strong><p>{teaching.correctReason}</p></div>
          <div className="teaching-actions"><button className="secondary-button" onClick={() => setShowLesson(current => !current)}><BookOpen size={17} />{showLesson ? t('grammar.hideLesson') : t('grammar.studyLesson')}</button><button className="secondary-button" onClick={practiceSimilar}><Target size={17} />{t('grammar.similar')}</button></div>
          {showLesson && <article className="mini-lesson"><span className="eyebrow">{t('grammar.miniLesson')}</span><h3>{lesson.title}</h3><p>{lesson.rule}</p><div className="lesson-pattern"><strong>{t('grammar.pattern')}</strong><span>{lesson.pattern}</span></div><div className="lesson-examples"><strong>{t('grammar.examples')}</strong>{lesson.examples.map(example => <span key={example}>{example}</span>)}</div><div className="lesson-mistake"><strong>{t('grammar.commonMistake')}</strong><span>{lesson.mistake}</span></div></article>}
        </section>}
        <div className="practice-actions">
          {result === null ? <button className="primary-button" onClick={evaluate} disabled={choice === null}>{t('grammar.check')} <ArrowRight size={18} /></button> : <button className="primary-button" onClick={next}>{t('grammar.next')} <ArrowRight size={18} /></button>}
          <small>{t('grammar.scoreNote')}</small>
        </div>
      </article>
    </div>
  );
}
