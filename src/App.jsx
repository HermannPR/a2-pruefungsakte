import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import {
  ArrowRight, BarChart3, Bell, Bookmark, BookOpen, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleHelp,
  BrainCircuit, CircleDashed, Clock3, Eye, EyeOff, Flame, Headphones, Home, Library, LockKeyhole, Menu, MessageCircle,
  Languages, LoaderCircle, LogOut, Mail, Mic, Pause, PenLine, Play, RotateCcw, ShieldCheck,
  Sparkles, Target, UserRound, Volume2, X
} from 'lucide-react';
import { curriculum, initialProgress, practiceBank, skills } from './data/curriculum.js';
import { goetheListeningTests } from './data/goetheListening.js';
import { goetheReadingTests } from './data/goetheReading.js';
import { goetheSpeakingTests, goetheWritingTests } from './data/goetheProduction.js';
import { getInstructionTranslation } from './data/instructionTranslations.js';
import { vocabularyBank, vocabularyTopics } from './data/vocabularyBank.js';
import { getVocabularyTranslation } from './data/vocabularyTranslations.js';
import { WORKBOOK_VOCABULARY_TOTAL } from './data/workbookVocabularyMeta.js';
import { ARTICLE_BANK_TOTAL } from './data/articleBankMeta.js';
import { achievementDefinitions, getNewAchievements } from './data/achievements.js';
import { LanguageProvider, languages, useLanguage } from './i18n.jsx';
import { isSupabaseConfigured, supabase } from './lib/supabase.js';
import { createFullExamSession, formatExamTime, FULL_EXAM_SECTIONS, scoreObjectiveSection, scoreSpeakingSection, scoreWritingSection } from './lib/fullExam.js';
import { cancelGermanSpeech, speakGerman } from './lib/germanSpeech.js';
import { updateGrammarQuestionStats } from './lib/grammarAdaptive.js';
import { useMobileDetailReveal } from './lib/useMobileDetailReveal.js';
import AchievementBadge from './AchievementBadge.jsx';
import AchievementPopup, { achievementCopy } from './AchievementPopup.jsx';
import { AvatarCompanion, AvatarSetup, AvatarUnlockPopup } from './avatar/AvatarExperience.jsx';
import AvatarRenderer from './avatar/AvatarRenderer.jsx';
import { initialAvatarState, normalizeAvatarState } from './avatar/avatarCatalog.js';
import { avatarDisplayName, avatarText } from './avatar/avatarCopy.js';
import { applyAvatarRewards, getNewAvatarRewards } from './avatar/avatarUnlocks.js';

const WorkbookVocabularyLibrary = lazy(() => import('./WorkbookVocabularyLibrary.jsx'));
const ArticleTrainer = lazy(() => import('./ArticleTrainer.jsx'));
const GrammarView = lazy(() => import('./GrammarView.jsx'));
const AvatarCustomizer = lazy(() => import('./avatar/AvatarCustomizer.jsx'));

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
const googleAuthEnabled = import.meta.env.VITE_GOOGLE_AUTH_ENABLED?.trim() === 'true';
const emailCooldownMilliseconds = 120000;

function emailCooldownStorageKey(email) {
  return `a2-email-cooldown:${encodeURIComponent(email.trim().toLowerCase())}`;
}

function emailCooldownSeconds(email) {
  if (!email.trim()) return 0;
  const expiresAt = Number(localStorage.getItem(emailCooldownStorageKey(email))) || 0;
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
}

const navigation = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: Home },
  { id: 'learn', labelKey: 'nav.learn', icon: Library },
  { id: 'grammar', labelKey: 'nav.grammar', icon: BrainCircuit },
  { id: 'vocabulary', labelKey: 'nav.vocabulary', icon: Sparkles },
  { id: 'practice', labelKey: 'nav.practice', icon: Target },
  { id: 'exam', labelKey: 'nav.exam', icon: ShieldCheck },
  { id: 'progress', labelKey: 'nav.progress', icon: BarChart3 }
];

const skillIcons = { reading: BookOpen, listening: Headphones, writing: PenLine, speaking: MessageCircle };

function InstructionTranslator() {
  const { t } = useLanguage();
  const [translation, setTranslation] = useState(null);

  useEffect(() => {
    function inspectSelection() {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (!selection || !selectedText || selection.rangeCount === 0) {
        setTranslation(null);
        return;
      }
      const range = selection.getRangeAt(0);
      const element = (range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentElement)?.closest?.('[data-instruction-translation]');
      const english = element?.dataset.instructionTranslation;
      if (!english || !element.contains(range.startContainer) || !element.contains(range.endContainer)) {
        setTranslation(null);
        return;
      }
      const box = range.getBoundingClientRect();
      setTranslation({
        selectedText,
        english,
        left: Math.min(Math.max(16, box.left + (box.width / 2)), window.innerWidth - 16),
        top: Math.max(16, box.top - 12)
      });
    }

    function closeOnEscape(event) {
      if (event.key === 'Escape') setTranslation(null);
    }

    document.addEventListener('mouseup', inspectSelection);
    document.addEventListener('touchend', inspectSelection);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mouseup', inspectSelection);
      document.removeEventListener('touchend', inspectSelection);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  if (!translation) return null;
  return (
    <aside className="translation-popover" style={{ left: translation.left, top: translation.top }} role="status" aria-live="polite">
      <div><Languages size={15} /><span>{t('translator.title')}</span><button onClick={() => setTranslation(null)} aria-label={t('translator.close')}><X size={14} /></button></div>
      <small>{translation.selectedText}</small>
      <strong>{translation.english}</strong>
      <p>{t('translator.boundary')}</p>
    </aside>
  );
}

function scoreFor(skillProgress) {
  if (!skillProgress?.possible) return 0;
  return Math.round((skillProgress.earned / skillProgress.possible) * 100);
}

function skillLabel(skillId, t) {
  return t(`skill.${skillId}`);
}

function formatDate(date = new Date(), locale = 'de-DE') {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function LanguageSelector({ compact = false }) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <label className={`language-selector ${compact ? 'compact' : ''}`}>
      <Languages size={16} />
      {!compact && <span>{t('language.label')}</span>}
      <select value={language} onChange={event => setLanguage(event.target.value)} aria-label={t('language.label')}>
        {languages.map(option => <option key={option.code} value={option.code}>{option.flag} {option.label}</option>)}
      </select>
    </label>
  );
}

function GoogleMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285f4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.4 2.9-7.5Z"/><path fill="#34a853" d="M12 22c2.7 0 5-.9 6.7-2.3l-3.3-2.6c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.7A10 10 0 0 0 12 22Z"/><path fill="#fbbc05" d="M6.5 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.3L6.5 14Z"/><path fill="#ea4335" d="M12 6.1c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.7 9.7 0 0 0 3.1 7.4l3.4 2.7A5.9 5.9 0 0 1 12 6.1Z"/></svg>;
}

function authErrorKey(code) {
  return {
    invalid_credentials: 'auth.error.invalid',
    email_not_confirmed: 'auth.error.confirm',
    user_already_exists: 'auth.error.exists',
    weak_password: 'auth.error.weak',
    over_email_send_rate_limit: 'auth.error.emailRate',
    over_request_rate_limit: 'auth.error.rate',
    email_address_not_authorized: 'auth.error.smtp',
    email_address_invalid: 'auth.error.invalidEmail',
    signup_disabled: 'auth.error.disabled',
    captcha_failed: 'auth.error.captchaFailed'
  }[code] ?? 'auth.error.generic';
}

function useStoredProgress(userId) {
  const [progress, setProgress] = useState(initialProgress);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadProgress() {
      if (isSupabaseConfigured && userId) {
        const { data, error } = await supabase.from('user_progress').select('*').eq('user_id', userId).maybeSingle();
        if (!active) return;
        if (error) console.error('Unable to load progress', error);
        if (data) {
          const { _study: storedStudy, _achievements: storedAchievements, _avatar: storedAvatar, ...storedSkills } = data.skills ?? {};
          const storedGrammar = storedSkills.grammar ?? {};
          const storedVocabulary = storedSkills.vocabulary ?? {};
          setProgress({
            skills: {
              ...initialProgress.skills,
              ...storedSkills,
              grammar: {
                ...initialProgress.skills.grammar,
                ...storedGrammar,
                byTopic: { ...initialProgress.skills.grammar.byTopic, ...storedGrammar.byTopic },
                byQuestion: { ...initialProgress.skills.grammar.byQuestion, ...storedGrammar.byQuestion }
              },
              vocabulary: {
                reviewed: storedVocabulary.reviewed ?? [],
                mastered: storedVocabulary.mastered ?? []
              }
            },
            completedUnits: data.completed_units ?? [],
            streak: data.streak ?? 0,
            totalSessions: data.total_sessions ?? 0,
            lastStudyDate: data.last_study_date,
            activity: data.activity ?? [],
            achievements: storedAchievements ?? [],
            avatar: normalizeAvatarState(storedAvatar),
            study: {
              ...initialProgress.study,
              ...storedStudy,
              resume: { ...initialProgress.study.resume, ...storedStudy?.resume },
              reminder: { ...initialProgress.study.reminder, ...storedStudy?.reminder }
            }
          });
        } else if (error) {
          try {
            const cached = JSON.parse(localStorage.getItem(`a2-progress-cache:${userId}`));
            if (cached) setProgress({ ...initialProgress, ...cached, avatar: normalizeAvatarState(cached.avatar), study: { ...initialProgress.study, ...cached.study, resume: { ...initialProgress.study.resume, ...cached.study?.resume }, reminder: { ...initialProgress.study.reminder, ...cached.study?.reminder } } });
          } catch {}
        }
      } else {
        try {
          const stored = localStorage.getItem('a2-pruefungsakte-progress');
          if (stored) {
            const parsed = JSON.parse(stored);
            setProgress({ ...initialProgress, ...parsed, avatar: normalizeAvatarState(parsed.avatar), study: { ...initialProgress.study, ...parsed.study, resume: { ...initialProgress.study.resume, ...parsed.study?.resume }, reminder: { ...initialProgress.study.reminder, ...parsed.study?.reminder } } });
          }
        } catch {
          setProgress(initialProgress);
        }
      }
      if (active) setLoaded(true);
    }
    loadProgress();
    return () => { active = false; };
  }, [userId]);

  useEffect(() => {
    if (!loaded) return undefined;
    const timer = window.setTimeout(async () => {
      if (isSupabaseConfigured && userId) {
        localStorage.setItem(`a2-progress-cache:${userId}`, JSON.stringify(progress));
        const { error } = await supabase.from('user_progress').upsert({
          user_id: userId,
          skills: { ...progress.skills, _study: progress.study, _achievements: progress.achievements, _avatar: progress.avatar },
          completed_units: progress.completedUnits,
          streak: progress.streak,
          total_sessions: progress.totalSessions,
          last_study_date: progress.lastStudyDate,
          activity: progress.activity,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        if (error) console.error('Unable to save progress', error);
      } else {
        localStorage.setItem('a2-pruefungsakte-progress', JSON.stringify(progress));
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [loaded, progress, userId]);

  return [progress, setProgress, loaded];
}

function getStreak(lastStudyDate, currentStreak) {
  if (!lastStudyDate) return 1;
  const today = new Date();
  const previous = new Date(lastStudyDate);
  const todayKey = today.toISOString().slice(0, 10);
  const previousKey = previous.toISOString().slice(0, 10);
  if (todayKey === previousKey) return currentStreak;
  const difference = Math.round((new Date(todayKey) - new Date(previousKey)) / 86400000);
  return difference === 1 ? currentStreak + 1 : 1;
}

function trackMistake(study, entry, passed) {
  const key = `${entry.type}:${entry.label}`;
  const existing = study.mistakes.filter(item => `${item.type}:${item.label}` !== key);
  return {
    ...study,
    mistakes: passed ? existing : [{ ...entry, id: crypto.randomUUID() }, ...existing].slice(0, 50)
  };
}

function LearningApp({ user, onSignOut }) {
  const { t } = useLanguage();
  const avatarSetupPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('avatar-setup') === '1';
  const onboardingPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('onboarding-preview') === '1';
  const initialView = navigation.some(item => item.id === window.history.state?.a2View) ? window.history.state.a2View : 'dashboard';
  const [view, setView] = useState(initialView);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const onboardingKey = `a2-onboarding-complete:${user?.id ?? 'preview'}`;
  const [onboardingOpen, setOnboardingOpen] = useState(() => (Boolean(user) || onboardingPreview) && localStorage.getItem(onboardingKey) !== '1');
  const [selectedUnitId, setSelectedUnitId] = useState(curriculum[0].id);
  const [selectedSkill, setSelectedSkill] = useState('reading');
  const [achievementQueue, setAchievementQueue] = useState([]);
  const [avatarRewardQueue, setAvatarRewardQueue] = useState([]);
  const mainRef = useRef(null);
  const previousView = useRef(view);
  const [progress, setProgress, progressLoaded] = useStoredProgress(user?.id);

  const scores = useMemo(
    () => Object.fromEntries(skills.map(skill => [skill.id, scoreFor(progress.skills[skill.id])])),
    [progress]
  );
  const attemptedSkills = skills.filter(skill => progress.skills[skill.id]?.possible > 0).length;
  const readiness = attemptedSkills
    ? Math.round(skills.reduce((sum, skill) => sum + scores[skill.id], 0) / skills.length)
    : 0;
  const ready = skills.every(skill => progress.skills[skill.id]?.possible > 0 && scores[skill.id] >= 60);

  useEffect(() => {
    if (!progressLoaded || onboardingOpen) return;
    const newAchievements = getNewAchievements(scores, progress.achievements);
    if (!newAchievements.length) return;
    const unlockedAt = new Date().toISOString();
    setProgress(current => ({
      ...current,
      achievements: [...(current.achievements ?? []), ...newAchievements.map(achievement => ({ id: achievement.id, unlockedAt }))]
    }));
    setAchievementQueue(current => [...current, ...newAchievements]);
  }, [progressLoaded, onboardingOpen, scores, progress.achievements]);

  useEffect(() => {
    if (!progressLoaded || !progress.avatar?.setupComplete) return;
    const rewards = getNewAvatarRewards(progress, scores);
    if (!rewards.length) return;
    setProgress(current => ({ ...current, avatar: applyAvatarRewards(current.avatar ?? initialAvatarState, rewards) }));
    setAvatarRewardQueue(current => [...current, ...rewards.slice(0, 3)]);
  }, [progressLoaded, scores, progress.skills, progress.completedUnits, progress.streak, progress.totalSessions, progress.avatar]);

  useEffect(() => {
    if (!progressLoaded) return;
    setProgress(current => {
      const resume = current.study?.resume ?? initialProgress.study.resume;
      if (resume.view === view && resume.unitId === selectedUnitId && resume.skillId === selectedSkill) return current;
      return { ...current, study: { ...current.study, resume: { view, unitId: selectedUnitId, skillId: selectedSkill } } };
    });
  }, [progressLoaded, view, selectedUnitId, selectedSkill]);

  useEffect(() => {
    if (!progressLoaded || !progress.study?.reminder?.enabled) return undefined;
    async function checkReminder() {
      const reminder = progress.study.reminder;
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const currentTime = now.toTimeString().slice(0, 5);
      if (!('Notification' in window) || currentTime < reminder.time || reminder.lastNotifiedDate === today || Notification.permission !== 'granted') return;
      const registration = await navigator.serviceWorker?.ready;
      if (registration) await registration.showNotification(t('reminder.notificationTitle'), { body: t('reminder.notificationBody'), icon: '/favicon.svg', tag: 'a2-daily-reminder' });
      else new Notification(t('reminder.notificationTitle'), { body: t('reminder.notificationBody'), icon: '/favicon.svg', tag: 'a2-daily-reminder' });
      setProgress(current => ({ ...current, study: { ...current.study, reminder: { ...current.study.reminder, lastNotifiedDate: today } } }));
    }
    checkReminder();
    const timer = window.setInterval(checkReminder, 30000);
    return () => window.clearInterval(timer);
  }, [progressLoaded, progress.study?.reminder?.enabled, progress.study?.reminder?.time, progress.study?.reminder?.lastNotifiedDate, t]);

  useEffect(() => {
    if (previousView.current !== view) {
      mainRef.current?.focus({ preventScroll: true });
      previousView.current = view;
    }
  }, [view]);

  useEffect(() => {
    window.history.replaceState({ ...window.history.state, a2View: view, a2Overlay: null }, '');
    function restoreView(event) {
      const restored = event.state?.a2View;
      setHelpOpen(event.state?.a2Overlay === 'help');
      setOnboardingOpen(event.state?.a2Overlay === 'tour');
      if (navigation.some(item => item.id === restored)) {
        setView(restored);
        setMobileMenu(false);
        window.scrollTo({ top: 0 });
      }
    }
    window.addEventListener('popstate', restoreView);
    return () => window.removeEventListener('popstate', restoreView);
  }, []);

  function recordResult(skillId, resultScore, label) {
    setProgress(current => {
      const today = new Date().toISOString();
      const skillProgress = current.skills[skillId] ?? { earned: 0, possible: 0 };
      const date = today;
      const mistake = { type: 'skill', skillId, label, score: resultScore, date, view: label.startsWith('Simulation:') ? 'exam' : 'practice' };
      return {
        ...current,
        skills: {
          ...current.skills,
          [skillId]: {
            earned: skillProgress.earned + resultScore,
            possible: skillProgress.possible + 100
          }
        },
        streak: getStreak(current.lastStudyDate, current.streak),
        totalSessions: current.totalSessions + 1,
        lastStudyDate: today,
        activity: [
          { id: crypto.randomUUID(), type: 'practice', skillId, score: resultScore, label, date: today },
          ...current.activity
        ].slice(0, 30),
        study: trackMistake(current.study ?? initialProgress.study, mistake, resultScore >= 60)
      };
    });
  }

  function completeUnit(unit) {
    if (progress.completedUnits.includes(unit.id)) return;
    setProgress(current => {
      const today = new Date().toISOString();
      return {
        ...current,
        completedUnits: [...current.completedUnits, unit.id],
        streak: getStreak(current.lastStudyDate, current.streak),
        totalSessions: current.totalSessions + 1,
        lastStudyDate: today,
        activity: [
          { id: crypto.randomUUID(), type: 'unit', label: unit.title, date: today },
          ...current.activity
        ].slice(0, 30)
      };
    });
  }

  function recordGrammarResult(topicId, correct, label, questionId) {
    setProgress(current => {
      const today = new Date().toISOString();
      const grammar = current.skills.grammar ?? initialProgress.skills.grammar;
      const topic = grammar.byTopic?.[topicId] ?? { earned: 0, possible: 0 };
      const question = grammar.byQuestion?.[questionId] ?? {};
      const earned = correct ? 100 : 0;
      const mistake = { type: 'grammar', skillId: 'grammar', label, score: earned, date: today, view: 'grammar' };
      return {
        ...current,
        skills: {
          ...current.skills,
          grammar: {
            ...grammar,
            earned: grammar.earned + earned,
            possible: grammar.possible + 100,
            byTopic: {
              ...grammar.byTopic,
              [topicId]: { earned: topic.earned + earned, possible: topic.possible + 100 }
            },
            byQuestion: {
              ...grammar.byQuestion,
              [questionId]: updateGrammarQuestionStats(question, correct, today)
            }
          }
        },
        streak: getStreak(current.lastStudyDate, current.streak),
        totalSessions: current.totalSessions + 1,
        lastStudyDate: today,
        activity: [
          { id: crypto.randomUUID(), type: 'grammar', skillId: 'grammar', score: earned, label, date: today },
          ...current.activity
        ].slice(0, 30),
        study: trackMistake(current.study ?? initialProgress.study, mistake, correct)
      };
    });
  }

  function recordVocabularyResult(itemId, mastered) {
    setProgress(current => {
      const vocabulary = current.skills.vocabulary ?? initialProgress.skills.vocabulary;
      return {
        ...current,
        skills: {
          ...current.skills,
          vocabulary: {
            reviewed: [...new Set([...vocabulary.reviewed, itemId])],
            mastered: mastered
              ? [...new Set([...vocabulary.mastered, itemId])]
              : vocabulary.mastered.filter(id => id !== itemId)
          }
        }
      };
    });
  }

  function toggleBookmark(bookmark) {
    setProgress(current => {
      const study = current.study ?? initialProgress.study;
      const exists = study.bookmarks.some(item => item.type === bookmark.type && item.id === bookmark.id);
      return { ...current, study: { ...study, bookmarks: exists ? study.bookmarks.filter(item => !(item.type === bookmark.type && item.id === bookmark.id)) : [bookmark, ...study.bookmarks].slice(0, 30) } };
    });
  }

  function dismissMistake(mistakeId) {
    setProgress(current => ({ ...current, study: { ...current.study, mistakes: current.study.mistakes.filter(item => item.id !== mistakeId) } }));
  }

  function resumeStudy() {
    const resume = progress.study?.resume ?? initialProgress.study.resume;
    setSelectedUnitId(resume.unitId);
    setSelectedSkill(resume.skillId);
    navigate(resume.view === 'dashboard' ? 'learn' : resume.view);
  }

  function reviewMistake(mistake) {
    if (skills.some(skill => skill.id === mistake.skillId)) setSelectedSkill(mistake.skillId);
    navigate(mistake.view ?? (mistake.type === 'grammar' ? 'grammar' : 'practice'));
  }

  function openBookmark(bookmark) {
    if (bookmark.unitId) setSelectedUnitId(bookmark.unitId);
    navigate(bookmark.view ?? 'learn');
  }

  function navigate(nextView, { replace = false, preserveOverlay = false } = {}) {
    if (!navigation.some(item => item.id === nextView)) return;
    if (nextView !== view) {
      const historyMethod = replace ? 'replaceState' : 'pushState';
      window.history[historyMethod]({ ...window.history.state, a2View: nextView, a2Overlay: preserveOverlay ? window.history.state?.a2Overlay : null }, '');
    }
    setView(nextView);
    setMobileMenu(false);
    if (!preserveOverlay) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openHelpCenter() {
    window.history.pushState({ ...window.history.state, a2View: view, a2Overlay: 'help' }, '');
    setHelpOpen(true);
  }

  function closeHelpCenter() {
    if (window.history.state?.a2Overlay === 'help') window.history.back();
    else setHelpOpen(false);
  }

  function finishOnboarding(nextView = 'dashboard') {
    localStorage.setItem(onboardingKey, '1');
    if (window.history.state?.a2Overlay === 'tour') window.history.replaceState({ ...window.history.state, a2View: nextView, a2Overlay: null, a2TourStep: null }, '');
    setOnboardingOpen(false);
    navigate(nextView, { replace: true });
  }

  function startOnboarding() {
    if (window.history.state?.a2Overlay === 'help') window.history.replaceState({ ...window.history.state, a2Overlay: null }, '');
    setHelpOpen(false);
    setOnboardingOpen(true);
  }

  if (!progressLoaded) return <LoadingScreen label={t('loading.progress')} />;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{t('accessibility.skip')}</a>
      <Sidebar view={view} navigate={navigate} open={mobileMenu} close={() => setMobileMenu(false)} />
      <main id="main-content" ref={mainRef} tabIndex="-1" className="main-canvas">
        <Topbar view={view} menuOpen={mobileMenu} openMenu={() => setMobileMenu(true)} openHelp={openHelpCenter} streak={progress.streak} user={user} avatar={progress.avatar} openAvatar={() => navigate('progress')} onSignOut={onSignOut} />
        {view === 'dashboard' && (
          <Dashboard
            scores={scores} readiness={readiness} ready={ready} progress={progress}
            onPractice={skillId => { setSelectedSkill(skillId); navigate('practice'); }}
            onLearn={unitId => { setSelectedUnitId(unitId); navigate('learn'); }}
            onExam={() => navigate('exam')}
            onResume={resumeStudy}
            onReviewMistakes={() => navigate('progress')}
            avatar={progress.avatar} onCustomizeAvatar={() => navigate('progress')}
          />
        )}
        {view === 'learn' && (
          <LearnView
            selectedUnitId={selectedUnitId} selectUnit={setSelectedUnitId}
            completedUnits={progress.completedUnits} completeUnit={completeUnit}
            practiceSkill={skillId => { setSelectedSkill(skillId); navigate('practice'); }}
            bookmarks={progress.study?.bookmarks ?? []} toggleBookmark={toggleBookmark}
          />
        )}
        {view === 'grammar' && <GrammarView grammarProgress={progress.skills.grammar} onResult={recordGrammarResult} />}
        {view === 'vocabulary' && <VocabularyView vocabularyProgress={progress.skills.vocabulary} onResult={recordVocabularyResult} />}
        {view === 'practice' && (
          <PracticeView selectedSkill={selectedSkill} setSelectedSkill={setSelectedSkill} onResult={recordResult} scores={scores} />
        )}
        {view === 'exam' && <ExamView onResult={recordResult} scores={scores} />}
        {view === 'progress' && <ProgressView progress={progress} scores={scores} readiness={readiness} ready={ready} reviewMistake={reviewMistake} dismissMistake={dismissMistake} openBookmark={openBookmark} toggleBookmark={toggleBookmark} updateAvatar={avatar => setProgress(current => ({ ...current, avatar }))} reset={() => setProgress(current => ({ ...initialProgress, avatar: current.avatar }))} />}
      </main>
      <InstructionTranslator />
      <HelpCenter open={helpOpen} close={closeHelpCenter} navigate={navigate} startTour={startOnboarding} user={user} reminder={progress.study?.reminder ?? initialProgress.study.reminder} updateReminder={reminder => setProgress(current => ({ ...current, study: { ...current.study, reminder } }))} />
      <OnboardingTour open={onboardingOpen && progress.avatar?.setupComplete} close={() => finishOnboarding('dashboard')} navigate={navigate} finish={finishOnboarding} avatar={progress.avatar ?? initialAvatarState} />
      {achievementQueue[0] && <AchievementPopup achievement={achievementQueue[0]} remaining={achievementQueue.length - 1} close={() => setAchievementQueue(current => current.slice(1))} />}
      {!achievementQueue[0] && avatarRewardQueue[0] && <AvatarUnlockPopup reward={avatarRewardQueue[0]} avatar={progress.avatar} close={() => setAvatarRewardQueue(current => current.slice(1))} />}
      {progressLoaded && (Boolean(user) || avatarSetupPreview) && !progress.avatar?.setupComplete && <AvatarSetup avatar={progress.avatar ?? initialAvatarState} save={avatar => setProgress(current => ({ ...current, avatar }))} />}
    </div>
  );
}

function Sidebar({ view, navigate, open, close }) {
  const { t } = useLanguage();
  const sidebarRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previousFocus.current = document.activeElement;
    sidebarRef.current?.querySelector('.sidebar-close')?.focus();
    function closeOnEscape(event) {
      if (event.key === 'Escape') close();
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      previousFocus.current?.focus?.();
    };
  }, [open]);

  return (
    <>
      {open && <button className="menu-scrim" onClick={close} aria-label={t('sidebar.close')} />}
      <aside id="primary-sidebar" ref={sidebarRef} className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark">A2</div>
          <div><strong>Prüfungsakte</strong><span>{t('brand.subtitle')}</span></div>
        </div>
        <button className="sidebar-close" onClick={close} aria-label={t('sidebar.close')}><X size={20} /></button>
        <nav aria-label={t('sidebar.navigation')}>
          {navigation.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} aria-current={view === item.id ? 'page' : undefined} className={view === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>
                <Icon size={19} strokeWidth={1.8} /><span>{t(item.labelKey)}</span><ChevronRight className="nav-arrow" size={15} />
              </button>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <span className="note-kicker">{t('sidebar.rule')}</span>
          <strong>{t('sidebar.minimum')}</strong>
          <p>{t('sidebar.ruleText')}</p>
        </div>
        <div className="source-status"><span className="status-dot" />{t('sidebar.sources')}</div>
        <div className="creator-credit">Created by <strong>Hermann Pauwells</strong></div>
      </aside>
    </>
  );
}

function Topbar({ view, menuOpen, openMenu, openHelp, streak, user, avatar, openAvatar, onSignOut }) {
  const { t, locale } = useLanguage();
  const label = t(navigation.find(item => item.id === view)?.labelKey);
  return (
    <header className="topbar">
      <button className="menu-trigger" onClick={openMenu} aria-label={t('sidebar.open')} aria-expanded={menuOpen} aria-controls="primary-sidebar"><Menu size={22} /></button>
      <div><span className="topbar-eyebrow">{t('topbar.file')} / {label}</span><strong>{formatDate(new Date(), locale)}</strong></div>
      <div className="topbar-actions">
        <button id="help-button" className="help-trigger" onClick={openHelp} aria-label={t('help.open')} title={t('help.open')}><CircleHelp size={19} /></button>
        <LanguageSelector compact />
        <div className="streak-chip"><Flame size={17} fill="currentColor" /><span>{t('topbar.days', { count: streak })}</span></div>
        {user && <div className="account-chip"><button className="topbar-avatar-button" onClick={openAvatar} aria-label={avatarText(locale, 'customize')}><AvatarRenderer avatar={avatar} size="topbar" /></button><span>{user.email}</span><button onClick={onSignOut} title={t('topbar.logout')} aria-label={t('topbar.logout')}><LogOut size={15} /></button></div>}
      </div>
    </header>
  );
}

const onboardingSteps = [
  { view: 'dashboard', target: '[data-tour="avatar-companion"]', titleKey: 'onboarding.companionTitle', descriptionKey: 'onboarding.companion' },
  { view: 'dashboard', target: '[data-tour="dashboard-focus"]', descriptionKey: 'onboarding.dashboard' },
  { view: 'learn', target: '[data-tour="learn-plan"]', descriptionKey: 'onboarding.learn' },
  { view: 'grammar', target: '[data-tour="grammar-workshop"]', descriptionKey: 'onboarding.grammar' },
  { view: 'vocabulary', target: '[data-tour="vocabulary-practice"]', descriptionKey: 'onboarding.vocabulary' },
  { view: 'practice', target: '[data-tour="skill-practice"]', descriptionKey: 'onboarding.practice' },
  { view: 'exam', target: '.exam-cover-copy > .primary-button', descriptionKey: 'onboarding.exam' },
  { view: 'progress', target: '[data-tour="avatar-progress"]', titleKey: 'onboarding.rewardsTitle', descriptionKey: 'onboarding.progress' }
];

function OnboardingTour({ open, close, navigate, finish, avatar }) {
  const { t, locale } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const dialogRef = useRef(null);
  const step = onboardingSteps[stepIndex];
  const navigationItem = navigation.find(item => item.id === step.view);
  const Icon = navigationItem.icon;

  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add('guided-tour-active');
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    const previousOverflow = document.documentElement.style.overflow;
    const previousPaddingRight = document.documentElement.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.scrollBehavior = 'auto';
    document.documentElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    const storedStep = Number(window.history.state?.a2TourStep);
    const initialStep = window.history.state?.a2Overlay === 'tour' && Number.isInteger(storedStep) && storedStep >= 0 && storedStep < onboardingSteps.length ? storedStep : 0;
    setStepIndex(initialStep);
    if (window.history.state?.a2Overlay !== 'tour') window.history.pushState({ ...window.history.state, a2View: onboardingSteps[initialStep].view, a2Overlay: 'tour', a2TourStep: initialStep }, '');
    const previousFocus = document.activeElement;
    function closeOnEscape(event) { if (event.key === 'Escape') close(); }
    function restoreTourStep(event) {
      if (event.state?.a2Overlay !== 'tour') { close(); return; }
      const restoredStep = Number(event.state.a2TourStep);
      if (Number.isInteger(restoredStep) && onboardingSteps[restoredStep]) setStepIndex(restoredStep);
    }
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('popstate', restoreTourStep);
    return () => { document.body.classList.remove('guided-tour-active'); document.documentElement.style.scrollBehavior = previousScrollBehavior; document.documentElement.style.overflow = previousOverflow; document.documentElement.style.paddingRight = previousPaddingRight; document.removeEventListener('keydown', closeOnEscape); window.removeEventListener('popstate', restoreTourStep); previousFocus?.focus?.(); };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    navigate(step.view, { replace: true, preserveOverlay: true });
    setTargetRect(null);
    let attempts = 0;
    let target;
    let settleTimer;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function measure() {
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const padding = 8;
      const left = Math.max(8, rect.left - padding);
      const top = Math.max(8, rect.top - padding);
      setTargetRect({ left, top, width: Math.min(window.innerWidth - left - 8, rect.width + padding * 2), height: Math.min(window.innerHeight - top - 8, rect.height + padding * 2) });
    }
    const finder = window.setInterval(() => {
      attempts += 1;
      target = document.querySelector(step.target);
      if (!target && attempts < 30) return;
      window.clearInterval(finder);
      if (!target) target = document.querySelector('#main-content');
      if (target && window.innerWidth <= 760) {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
        window.scrollBy({ top: 8, behavior: 'auto' });
      } else target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      settleTimer = window.setTimeout(() => { measure(); dialogRef.current?.focus({ preventScroll: true }); }, reducedMotion ? 30 : 380);
    }, 80);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });
    return () => { window.clearInterval(finder); window.clearTimeout(settleTimer); window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure); };
  }, [open, stepIndex]);

  if (!open) return null;
  const isLast = stepIndex === onboardingSteps.length - 1;
  const panelStyle = targetRect && window.innerWidth > 760 ? getTourPanelPosition(targetRect) : undefined;
  function moveTo(nextIndex) {
    const nextStep = onboardingSteps[nextIndex];
    window.history.pushState({ ...window.history.state, a2View: nextStep.view, a2Overlay: 'tour', a2TourStep: nextIndex }, '');
    setStepIndex(nextIndex);
  }
  return (
    <div className={`guided-tour-layer ${targetRect ? '' : 'waiting'}`} role="presentation">
      {targetRect && <div className="guided-tour-spotlight" style={targetRect} aria-hidden="true" />}
      <section ref={dialogRef} style={panelStyle} tabIndex="-1" className="guided-tour-panel" role="dialog" aria-modal="true" aria-labelledby="onboarding-title" aria-describedby="onboarding-description">
        <button className="guided-tour-close" onClick={close} aria-label={t('onboarding.skip')}><X size={18} /></button>
        <div className="guided-tour-guide"><div key={stepIndex} className="guided-tour-speaker"><AvatarRenderer avatar={avatar} size="tour" /><span className="tour-speech-dots" aria-hidden="true"><i /><i /><i /></span></div><div><span>{avatarDisplayName(locale, avatar)}</span><strong>{t('onboarding.eyebrow')}</strong></div></div>
        <div className="guided-tour-index"><span><Icon size={15} />{t(navigationItem.labelKey)}</span><strong>{String(stepIndex + 1).padStart(2, '0')} / {String(onboardingSteps.length).padStart(2, '0')}</strong></div>
        <h2 id="onboarding-title">{step.titleKey ? t(step.titleKey) : t(navigationItem.labelKey)}</h2>
        <p id="onboarding-description">{t(step.descriptionKey)}</p>
        <div className="tour-progress" aria-hidden="true">{onboardingSteps.map((item, index) => <span key={`${item.view}-${item.target}`} className={index <= stepIndex ? 'active' : ''} />)}</div>
        <div className="guided-tour-actions">
          <button className="tour-back" onClick={() => window.history.back()} disabled={stepIndex === 0}><ChevronLeft size={17} />{t('onboarding.back')}</button>
          <button className="primary-button" onClick={() => isLast ? finish('dashboard') : moveTo(stepIndex + 1)}>{isLast ? t('onboarding.finish') : t('onboarding.next')}<ArrowRight size={17} /></button>
        </div>
      </section>
    </div>
  );
}

function getTourPanelPosition(rect) {
  const panelWidth = 360;
  const panelHeight = 470;
  const gap = 22;
  let left = rect.left + rect.width + gap;
  if (left + panelWidth > window.innerWidth - 18) left = rect.left - panelWidth - gap;
  if (left < 18) left = Math.max(18, Math.min(window.innerWidth - panelWidth - 18, rect.left));
  let top = Math.max(18, Math.min(rect.top, window.innerHeight - panelHeight - 18));
  if (rect.width > window.innerWidth - panelWidth - gap * 3) top = rect.top + rect.height + gap;
  if (top + panelHeight > window.innerHeight - 18) top = Math.max(18, rect.top - panelHeight - gap);
  return { left, top };
}

const helpTopics = [
  { view: 'dashboard', questionKey: 'help.startQuestion', answerKey: 'help.startAnswer' },
  { view: 'learn', questionKey: 'help.planQuestion', answerKey: 'help.planAnswer' },
  { view: 'grammar', questionKey: 'help.grammarQuestion', answerKey: 'help.grammarAnswer' },
  { view: 'vocabulary', questionKey: 'help.vocabularyQuestion', answerKey: 'help.vocabularyAnswer' },
  { view: 'practice', questionKey: 'help.practiceQuestion', answerKey: 'help.practiceAnswer' },
  { view: 'exam', questionKey: 'help.examQuestion', answerKey: 'help.examAnswer' },
  { view: 'progress', questionKey: 'help.progressQuestion', answerKey: 'help.progressAnswer' }
];

function HelpCenter({ open, close, navigate, startTour, user, reminder, updateReminder }) {
  const { t } = useLanguage();
  const drawerRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    drawerRef.current?.querySelector('.dialog-close')?.focus();
    function closeOnEscape(event) { if (event.key === 'Escape') close(); }
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.removeEventListener('keydown', closeOnEscape); previousFocus?.focus?.(); };
  }, [open]);
  if (!open) return null;
  return (
    <div className="help-layer">
      <button className="help-scrim" onClick={close} aria-label={t('help.close')} />
      <div ref={drawerRef} className="help-drawer" role="dialog" aria-modal="true" aria-labelledby="help-title">
        <button className="dialog-close" onClick={close} aria-label={t('help.close')}><X size={20} /></button>
        <span className="eyebrow"><CircleHelp size={15} />{t('help.eyebrow')}</span>
        <h2 id="help-title">{t('help.title')}</h2>
        <p className="help-intro">{t('help.intro')}</p>
        <button className="restart-tour" onClick={startTour}><Sparkles size={17} />{t('help.restartTour')}<ArrowRight size={16} /></button>
        {user && <AccountSecurity />}
        <StudyReminder reminder={reminder} updateReminder={updateReminder} />
        <div className="faq-list">
          {helpTopics.map(topic => {
            const Icon = navigation.find(item => item.id === topic.view).icon;
            return <details key={topic.view}><summary><Icon size={17} /><span>{t(topic.questionKey)}</span><ChevronRight size={16} /></summary><p>{t(topic.answerKey)}</p><button onClick={() => { navigate(topic.view); close(); }}>{t('help.openSection')}<ArrowRight size={15} /></button></details>;
          })}
        </div>
      </div>
    </div>
  );
}

function AccountSecurity() {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function changePassword(event) {
    event.preventDefault();
    setMessage(''); setError('');
    if (password.length < 12) { setError(t('auth.error.weak')); return; }
    if (password !== confirmation) { setError(t('auth.passwordMismatch')); return; }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(updateError.code === 'weak_password' ? t('auth.error.weak') : t('auth.error.generic'));
    else { setPassword(''); setConfirmation(''); setMessage(t('account.passwordChanged')); }
    setBusy(false);
  }

  return (
    <details className="account-security">
      <summary><LockKeyhole size={17} />{t('account.security')}<ChevronRight size={16} /></summary>
      <form onSubmit={changePassword}>
        <p>{t('account.passwordIntro')}</p>
        <label><span>{t('auth.newPassword')}</span><input type="password" value={password} onChange={event => setPassword(event.target.value)} required minLength={12} autoComplete="new-password" /></label>
        <label><span>{t('auth.confirmPassword')}</span><input type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required minLength={12} autoComplete="new-password" /></label>
        {error && <div className="auth-message error" role="alert">{error}</div>}{message && <div className="auth-message success" role="status">{message}</div>}
        <button className="secondary-button" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <LockKeyhole size={17} />}{t('account.changePassword')}</button>
      </form>
    </details>
  );
}

function StudyReminder({ reminder, updateReminder }) {
  const { t } = useLanguage();
  const [error, setError] = useState('');
  async function toggleReminder(event) {
    const enabled = event.target.checked;
    setError('');
    if (enabled && (!('Notification' in window) || await Notification.requestPermission() !== 'granted')) {
      setError(t('reminder.denied'));
      return;
    }
    updateReminder({ ...reminder, enabled });
  }
  return (
    <section className="study-reminder">
      <div><Bell size={17} /><span><strong>{t('reminder.title')}</strong><small>{t('reminder.note')}</small></span><label className="switch"><input type="checkbox" aria-label={t('reminder.title')} checked={reminder.enabled} onChange={toggleReminder} /><span /></label></div>
      {reminder.enabled && <label className="reminder-time"><span>{t('reminder.time')}</span><input type="time" value={reminder.time} onChange={event => updateReminder({ ...reminder, time: event.target.value, lastNotifiedDate: null })} /></label>}
      {error && <p className="reminder-error" role="alert">{error}</p>}
    </section>
  );
}

function Dashboard({ scores, readiness, ready, progress, onPractice, onLearn, onExam, onResume, onReviewMistakes, avatar, onCustomizeAvatar }) {
  const { t } = useLanguage();
  const weakest = [...skills].sort((left, right) => scores[left.id] - scores[right.id])[0];
  const nextUnit = curriculum.find(unit => !progress.completedUnits.includes(unit.id)) ?? curriculum.at(-1);
  const examDate = Date.parse('2026-07-23T00:00:00+02:00');
  const showExamDate = Date.now() <= Date.parse('2026-07-23T23:59:59+02:00');
  const examDaysLeft = Math.max(0, Math.ceil((examDate - Date.now()) / 86400000));

  return (
    <div className="page dashboard-page">
      <section className="hero-grid reveal">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14} /> {t('dashboard.eyebrow')}</span>
          <h1>{t('dashboard.title1')}<br /><em>{t('dashboard.title2')}</em></h1>
          <p>{t('dashboard.intro')}</p>
          {showExamDate && <div className="exam-countdown"><CalendarDays size={19} /><div><span>{t('dashboard.examDate')}</span><strong>{t('dashboard.examDateValue')}</strong><small>{t('dashboard.examDaysLeft', { count: examDaysLeft })}</small></div></div>}
          <div className="hero-actions">
            <button className="primary-button" onClick={() => onPractice(weakest.id)}>{t('dashboard.trainWeakest')} <ArrowRight size={18} /></button>
            <button className="text-button" onClick={onExam}>{t('dashboard.startTest')} <Play size={16} /></button>
          </div>
        </div>
        <ReadinessDial value={readiness} ready={ready} />
        <div className="exam-stamp" aria-hidden="true">{t('dashboard.target')}<br />60% × 4</div>
      </section>

      <section className="section-block reveal delay-1">
        <div className="section-heading"><div><span className="eyebrow">{t('dashboard.parts')}</span><h2>{t('dashboard.redLine')}</h2></div><span className="micro-note">{t('dashboard.updated')}</span></div>
        <div className="skill-grid">
          {skills.map(skill => <SkillCard key={skill.id} skill={skill} score={scores[skill.id]} attempted={progress.skills[skill.id]?.possible > 0} onClick={() => onPractice(skill.id)} />)}
        </div>
      </section>

      <section className="dashboard-lower reveal delay-2">
        <div className="today-card paper-card" data-tour="dashboard-focus">
          <div className="card-index">{t('dashboard.today')}</div>
          <div className="section-heading compact"><div><span className="eyebrow">{t('dashboard.next')}</span><h2>{t('dashboard.focus')}</h2></div><Clock3 size={22} /></div>
          <div className="task-list">
            <button className="resume-task" onClick={onResume}><span className="task-number"><Play size={14} /></span><span><strong>{t('dashboard.continue')}</strong><small>{t('dashboard.continueHint')}</small></span><ArrowRight size={18} /></button>
            <button onClick={() => onPractice(weakest.id)}><span className="task-number">01</span><span><strong>{t('dashboard.train', { skill: skillLabel(weakest.id, t) })}</strong><small>{t('dashboard.minutesCurrent', { score: scores[weakest.id] })}</small></span><ArrowRight size={18} /></button>
            <button onClick={() => onLearn(nextUnit.id)}><span className="task-number">02</span><span><strong>{nextUnit.title}</strong><small>{nextUnit.grammar.slice(0, 2).join(' · ')}</small></span><ArrowRight size={18} /></button>
            {(progress.study?.mistakes?.length ?? 0) > 0
              ? <button onClick={onReviewMistakes}><span className="task-number">03</span><span><strong>{t('dashboard.reviewMistakes', { count: progress.study.mistakes.length })}</strong><small>{t('dashboard.reviewMistakesHint')}</small></span><ArrowRight size={18} /></button>
              : <button onClick={onExam}><span className="task-number">03</span><span><strong>{t('dashboard.shortExam')}</strong><small>{t('dashboard.allParts')}</small></span><ArrowRight size={18} /></button>}
          </div>
        </div>
        <div className="curriculum-peek paper-card">
          <div className="card-index">{t('dashboard.curriculum')}</div>
          <span className="eyebrow">{t('dashboard.coverage')}</span>
          <h2>{t('dashboard.filesDone', { count: progress.completedUnits.length })}</h2>
          <div className="unit-stripes">
            {curriculum.map(unit => (
              <button key={unit.id} title={unit.title} className={progress.completedUnits.includes(unit.id) ? 'done' : ''} onClick={() => onLearn(unit.id)}>
                <span>{unit.number}</span>
              </button>
            ))}
          </div>
          <p>{t('dashboard.coverageText')}</p>
          <button className="text-button" onClick={() => onLearn(nextUnit.id)}>{t('dashboard.openPlan')} <ArrowRight size={16} /></button>
        </div>
        <AvatarCompanion avatar={avatar} skillName={skillLabel(weakest.id, t)} onTrain={() => onPractice(weakest.id)} onCustomize={onCustomizeAvatar} />
      </section>
      <p className="method-note"><CircleDashed size={15} /> {t('dashboard.method')}</p>
    </div>
  );
}

function ReadinessDial({ value, ready }) {
  const { t } = useLanguage();
  return (
    <div className="readiness-panel">
      <div className="dial" style={{ '--value': `${value * 3.6}deg` }}>
        <div><strong>{value}%</strong><span>{t('readiness.total')}</span></div>
      </div>
      <div className="readiness-caption"><span className={ready ? 'ready-dot pass' : 'ready-dot'} />{ready ? t('readiness.ready') : t('readiness.building')}</div>
      <small>{t('readiness.rule')}</small>
    </div>
  );
}

function SkillCard({ skill, score, attempted, onClick }) {
  const { t } = useLanguage();
  const Icon = skillIcons[skill.id];
  return (
    <button className="skill-card" onClick={onClick} style={{ '--skill': skill.color }}>
      <div className="skill-card-top"><span className="skill-monogram">{skill.short}</span><Icon size={20} /></div>
      <div><strong>{skillLabel(skill.id, t)}</strong><span>{attempted ? `${score}%` : t('skill.open')}</span></div>
      <div className="score-track"><i style={{ width: `${score}%` }} /><b /></div>
      <small>{score >= 60 ? t('skill.above') : t('skill.points', { count: 60 - score })}</small>
    </button>
  );
}

function LearnView({ selectedUnitId, selectUnit, completedUnits, completeUnit, practiceSkill, bookmarks, toggleBookmark }) {
  const { t } = useLanguage();
  const detailRef = useMobileDetailReveal(selectedUnitId);
  const unit = curriculum.find(item => item.id === selectedUnitId) ?? curriculum[0];
  const completed = completedUnits.includes(unit.id);
  const bookmarked = bookmarks.some(item => item.type === 'unit' && item.id === unit.id);
  return (
    <div className="page learn-page">
      <section className="page-intro reveal">
        <div><span className="eyebrow">{t('learn.eyebrow')}</span><h1>{t('learn.title')}</h1><p>{t('learn.intro')}</p></div>
        <div className="completion-ticket"><strong>{completedUnits.length}/12</strong><span>{t('learn.completed')}</span></div>
      </section>
      <div className="learn-layout reveal delay-1">
        <div className="unit-list" aria-label={t('learn.files')}>
          {curriculum.map(item => (
            <button key={item.id} data-tour={item.id === unit.id ? 'learn-plan' : undefined} onClick={() => selectUnit(item.id)} className={`${item.id === unit.id ? 'active' : ''} ${completedUnits.includes(item.id) ? 'done' : ''}`}>
              <span>{item.number}</span><div><strong>{item.title}</strong><small>{item.subtitle}</small></div>{completedUnits.includes(item.id) ? <CheckCircle2 size={18} /> : <ChevronRight size={18} />}
            </button>
          ))}
        </div>
        <article ref={detailRef} tabIndex="-1" className="unit-dossier paper-card mobile-detail-target" key={unit.id}>
          <div className="dossier-tab">{t('learn.file')} {unit.number}</div>
          <button className={`bookmark-button ${bookmarked ? 'active' : ''}`} onClick={() => toggleBookmark({ type: 'unit', id: unit.id, label: unit.title, view: 'learn', unitId: unit.id })} aria-label={bookmarked ? t('bookmarks.remove') : t('bookmarks.add')} title={bookmarked ? t('bookmarks.remove') : t('bookmarks.add')}><Bookmark size={19} fill={bookmarked ? 'currentColor' : 'none'} /></button>
          <span className="eyebrow">{completed ? t('learn.doneEyebrow') : t('learn.nextEyebrow')}</span>
          <h2>{unit.title}</h2><p className="unit-subtitle">{unit.subtitle}</p>
          <div className="dossier-rule" />
          <div className="dossier-columns">
            <div><h3>{t('learn.canDo')}</h3><ul className="check-list">{unit.goals.map(goal => <li key={goal}><Check size={16} />{goal}</li>)}</ul></div>
            <div><h3>{t('learn.tools')}</h3><div className="tag-stack">{unit.grammar.map(item => <span key={item}>{item}</span>)}</div><h3 className="spaced-heading">{t('learn.words')}</h3><div className="tag-stack soft">{unit.vocabulary.map(item => <span key={item}>{item}</span>)}</div></div>
          </div>
          <div className="source-slip"><BookOpen size={17} /><span><small>{t('learn.source')}</small>{unit.sourceHint}</span></div>
          <div className="dossier-actions">
            <button className="primary-button" onClick={() => completeUnit(unit)} disabled={completed}>{completed ? <><Check size={18} /> {t('learn.done')}</> : <>{t('learn.complete')} <Check size={18} /></>}</button>
            <button className="secondary-button" onClick={() => practiceSkill(unit.practiceSkill)}>{t('learn.tasks')} · {skillLabel(unit.practiceSkill, t)} <ArrowRight size={17} /></button>
          </div>
        </article>
      </div>
    </div>
  );
}

function VocabularyView({ vocabularyProgress, onResult }) {
  const { t, language } = useLanguage();
  const [sourceMode, setSourceMode] = useState('workbook');
  const [selectedTopic, setSelectedTopic] = useState(vocabularyTopics[0].id);
  const [mode, setMode] = useState('cards');
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [choice, setChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const sourceDetailRef = useMobileDetailReveal(sourceMode);
  const cardDetailRef = useMobileDetailReveal(selectedTopic);
  const reviewed = vocabularyProgress?.reviewed ?? [];
  const mastered = vocabularyProgress?.mastered ?? [];
  const items = vocabularyBank.filter(item => item.topic === selectedTopic);
  const item = items[index % items.length];
  const topic = vocabularyTopics.find(entry => entry.id === selectedTopic);
  const topicMastered = items.filter(entry => mastered.includes(entry.id)).length;
  const totalVocabulary = vocabularyBank.length + WORKBOOK_VOCABULARY_TOTAL;
  const coverage = Math.round((reviewed.length / totalVocabulary) * 100);
  const translation = getVocabularyTranslation(item.id, language);
  const quizOptions = useMemo(() => {
    const candidates = [item, ...items.filter(entry => entry.id !== item.id).slice(index % 4, (index % 4) + 3)];
    while (candidates.length < 4) {
      const fallback = items.find(entry => !candidates.includes(entry));
      if (!fallback) break;
      candidates.push(fallback);
    }
    const shift = index % candidates.length;
    return [...candidates.slice(shift), ...candidates.slice(0, shift)];
  }, [index, item, items]);

  function selectTopic(topicId) {
    setSelectedTopic(topicId);
    setIndex(0); setRevealed(false); setChoice(null); setResult(null); setShowTranslation(false);
  }

  function selectMode(nextMode) {
    setMode(nextMode);
    setRevealed(false); setChoice(null); setResult(null); setShowTranslation(false);
  }

  function next() {
    setIndex(current => (current + 1) % items.length);
    setRevealed(false); setChoice(null); setResult(null); setShowTranslation(false);
  }

  function pronounce() {
    speakGerman(item.word, { rate: 0.82 });
  }

  function mark(masteredWord) {
    onResult(item.id, masteredWord);
    next();
  }

  function answer(option) {
    if (result !== null) return;
    const correct = option.id === item.id;
    setChoice(option.id);
    setResult(correct);
    onResult(item.id, correct);
  }

  return (
    <div className="page vocabulary-page">
      <section className="page-intro reveal">
        <div><span className="eyebrow"><Sparkles size={15} />{t('vocabulary.eyebrow')}</span><h1>{t('vocabulary.title')}</h1><p>{t('vocabulary.intro')}</p></div>
        <div className="score-ticket"><span>{t('vocabulary.coverage')}</span><strong>{coverage}%</strong><small>{t('vocabulary.masteredTotal', { count: mastered.length, total: totalVocabulary })}</small></div>
      </section>

      <div className="vocabulary-mode-switch vocabulary-source-switch reveal delay-1" role="tablist">
        <button data-tour="vocabulary-practice" role="tab" aria-selected={sourceMode === 'workbook'} className={sourceMode === 'workbook' ? 'active' : ''} onClick={() => setSourceMode('workbook')}><Library size={17} />{t('vocabulary.workbook')} ({WORKBOOK_VOCABULARY_TOTAL})</button>
        <button role="tab" aria-selected={sourceMode === 'trainer'} className={sourceMode === 'trainer' ? 'active' : ''} onClick={() => setSourceMode('trainer')}><Sparkles size={17} />{t('vocabulary.enriched')} ({vocabularyBank.length})</button>
        <button role="tab" aria-selected={sourceMode === 'articles'} className={sourceMode === 'articles' ? 'active' : ''} onClick={() => setSourceMode('articles')}><BrainCircuit size={17} />{t('vocabulary.articles')} ({ARTICLE_BANK_TOTAL})</button>
      </div>

      <div ref={sourceDetailRef} tabIndex="-1" className="mobile-detail-target vocabulary-source-detail">{sourceMode === 'workbook' ? <Suspense fallback={<div className="section-loading paper-card"><LoaderCircle className="spin" size={24} /><strong>{t('loading.progress')}</strong></div>}><WorkbookVocabularyLibrary vocabularyProgress={vocabularyProgress} onResult={onResult} /></Suspense> : sourceMode === 'articles' ? <Suspense fallback={<div className="section-loading paper-card"><LoaderCircle className="spin" size={24} /><strong>{t('loading.progress')}</strong></div>}><ArticleTrainer vocabularyProgress={vocabularyProgress} onResult={onResult} /></Suspense> : <>
      <div className="vocabulary-mode-switch reveal delay-1" role="tablist">
        <button role="tab" aria-selected={mode === 'cards'} className={mode === 'cards' ? 'active' : ''} onClick={() => selectMode('cards')}><BookOpen size={17} />{t('vocabulary.cards')}</button>
        <button role="tab" aria-selected={mode === 'quiz'} className={mode === 'quiz' ? 'active' : ''} onClick={() => selectMode('quiz')}><Target size={17} />{t('vocabulary.quiz')}</button>
      </div>
      <section className="vocabulary-layout reveal delay-1">
        <aside className="vocabulary-topics" aria-label={t('vocabulary.topics')}>
          {vocabularyTopics.map(entry => {
            const topicItems = vocabularyBank.filter(word => word.topic === entry.id);
            const known = topicItems.filter(word => mastered.includes(word.id)).length;
            return (
              <button key={entry.id} className={selectedTopic === entry.id ? 'active' : ''} onClick={() => selectTopic(entry.id)}>
                <span>{entry.short}</span><div><strong>{entry.title}</strong><small>{entry.description}</small></div><b>{known}/{topicItems.length}</b>
              </button>
            );
          })}
        </aside>

        <article ref={cardDetailRef} tabIndex="-1" className="vocabulary-card paper-card mobile-detail-target">
          <div className="vocabulary-card-meta"><span>{topic.title}</span><span>{t('vocabulary.wordCount', { current: index + 1, total: items.length })}</span><strong>{topicMastered}/{items.length}</strong></div>
          {mode === 'cards' ? (
            <>
              <div className="word-face">
                <button className="pronounce-button" onClick={pronounce} aria-label={t('vocabulary.pronounce')}><Volume2 size={20} /></button>
                <span>{t('vocabulary.word')}</span><h2>{item.word}</h2>{item.detail && <small>{item.detail}</small>}
              </div>
              {revealed ? (
                <div className="word-reveal"><div><span>{t('vocabulary.meaning')}</span><p>{item.definition}</p>{translation && <button className="inline-translation-button" onClick={() => setShowTranslation(current => !current)}><Languages size={15} />{showTranslation ? t('vocabulary.hideTranslation') : t('vocabulary.translateMeaning')}</button>}{showTranslation && translation && <p className="optional-translation" lang={language}>{translation.meaning}</p>}</div><div><span>{t('vocabulary.example')}</span><p>{item.example}</p>{showTranslation && translation?.example && <p className="optional-translation" lang={language}>{translation.example}</p>}</div></div>
              ) : <button className="reveal-word" onClick={() => setRevealed(true)}>{t('vocabulary.reveal')} <ArrowRight size={18} /></button>}
              {revealed && <div className="vocabulary-actions"><button className="secondary-button" onClick={() => mark(false)}><RotateCcw size={17} />{t('vocabulary.again')}</button><button className="primary-button" onClick={() => mark(true)}><Check size={17} />{t('vocabulary.know')}</button></div>}
            </>
          ) : (
            <>
              <div className="quiz-prompt"><span>{t('vocabulary.whichWord')}</span><h2>{item.definition}</h2></div>
              <div className="vocabulary-options">{quizOptions.map(option => (
                <button key={option.id} onClick={() => answer(option)} disabled={result !== null} className={`${choice === option.id ? 'selected' : ''} ${result !== null && option.id === item.id ? 'correct' : ''} ${result === false && choice === option.id ? 'wrong' : ''}`}>
                  {option.word}{result !== null && option.id === item.id && <Check size={17} />}
                </button>
              ))}</div>
              {result !== null && <div className={`vocabulary-feedback ${result ? 'pass' : 'retry'}`}><strong>{result ? t('vocabulary.correct') : t('vocabulary.retry')}</strong><span>{item.example}</span></div>}
              {result !== null && <button className="primary-button vocabulary-next" onClick={next}>{t('vocabulary.next')} <ArrowRight size={18} /></button>}
            </>
          )}
        </article>
      </section></>}</div>
    </div>
  );
}

function PracticeView({ selectedSkill, setSelectedSkill, onResult, scores }) {
  const { t } = useLanguage();
  const detailRef = useMobileDetailReveal(selectedSkill);
  const [listeningMode, setListeningMode] = useState('official');
  const [readingMode, setReadingMode] = useState('official');
  const [writingMode, setWritingMode] = useState('official');
  const [speakingMode, setSpeakingMode] = useState('official');
  return (
    <div className="page practice-page">
      <section className="page-intro reveal">
        <div><span className="eyebrow">{t('practice.eyebrow')}</span><h1>{t('practice.title')}</h1><p>{t('practice.intro')}</p></div>
        <div className="score-ticket"><span>{skillLabel(selectedSkill, t)}</span><strong>{scores[selectedSkill]}%</strong><small>{t('practice.target')}</small></div>
      </section>
      <div className="skill-tabs reveal delay-1" role="tablist" data-tour="skill-practice">
        {skills.map(skill => {
          const Icon = skillIcons[skill.id];
          return <button role="tab" aria-selected={selectedSkill === skill.id} key={skill.id} className={selectedSkill === skill.id ? 'active' : ''} onClick={() => setSelectedSkill(skill.id)}><Icon size={17} />{skillLabel(skill.id, t)}<span>{scores[skill.id]}%</span></button>;
        })}
      </div>
      {selectedSkill === 'reading' && <div className="listening-mode-switch reveal delay-1"><button className={readingMode === 'official' ? 'active' : ''} onClick={() => setReadingMode('official')}><BookOpen size={16} />{t('reading.official')}</button><button className={readingMode === 'quick' ? 'active' : ''} onClick={() => setReadingMode('quick')}><Target size={16} />{t('reading.quick')}</button></div>}
      {selectedSkill === 'listening' && <div className="listening-mode-switch reveal delay-1"><button className={listeningMode === 'official' ? 'active' : ''} onClick={() => setListeningMode('official')}><Headphones size={16} />{t('listening.official')}</button><button className={listeningMode === 'quick' ? 'active' : ''} onClick={() => setListeningMode('quick')}><Target size={16} />{t('listening.quick')}</button></div>}
      {selectedSkill === 'writing' && <div className="listening-mode-switch reveal delay-1"><button className={writingMode === 'official' ? 'active' : ''} onClick={() => setWritingMode('official')}><PenLine size={16} />{t('writing.official')}</button><button className={writingMode === 'quick' ? 'active' : ''} onClick={() => setWritingMode('quick')}><Target size={16} />{t('reading.quick')}</button></div>}
      {selectedSkill === 'speaking' && <div className="listening-mode-switch reveal delay-1"><button className={speakingMode === 'official' ? 'active' : ''} onClick={() => setSpeakingMode('official')}><Mic size={16} />{t('speaking.official')}</button><button className={speakingMode === 'quick' ? 'active' : ''} onClick={() => setSpeakingMode('quick')}><Target size={16} />{t('reading.quick')}</button></div>}
      <div ref={detailRef} tabIndex="-1" className="practice-detail-target mobile-detail-target">{selectedSkill === 'listening' && listeningMode === 'official' ? <OfficialListeningTrainer onResult={onResult} />
        : selectedSkill === 'reading' && readingMode === 'official' ? <OfficialReadingTrainer onResult={onResult} />
          : selectedSkill === 'writing' && writingMode === 'official' ? <OfficialWritingTrainer onResult={onResult} />
            : selectedSkill === 'speaking' && speakingMode === 'official' ? <OfficialSpeakingTrainer onResult={onResult} />
          : <PracticeSession key={selectedSkill} skillId={selectedSkill} items={practiceBank[selectedSkill]} onResult={onResult} />}</div>
    </div>
  );
}

function OfficialWritingTrainer({ onResult }) {
  const { t } = useLanguage();
  const [testIndex, setTestIndex] = useState(0);
  const [taskIndex, setTaskIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [checks, setChecks] = useState({});
  const [results, setResults] = useState({});
  const test = goetheWritingTests[testIndex];
  const task = test.tasks[taskIndex];
  const key = `${test.id}-${task.number}`;
  const response = responses[key] ?? '';
  const words = response.trim() ? response.trim().split(/\s+/).length : 0;
  const taskChecks = checks[key] ?? [];

  function selectTest(index) { setTestIndex(index); setTaskIndex(0); }
  function toggleCheck(index) { setChecks(current => ({ ...current, [key]: taskChecks.includes(index) ? taskChecks.filter(entry => entry !== index) : [...taskChecks, index] })); }
  function assess() {
    const lengthScore = words >= task.minWords && words <= task.maxWords ? 50 : Math.min(45, Math.round((words / task.minWords) * 45));
    const score = Math.min(100, lengthScore + Math.round((taskChecks.length / 3) * 50));
    setResults(current => ({ ...current, [key]: score }));
    onResult('writing', score, `${test.title} Schreiben Teil ${task.number}`);
  }

  return <section className="official-listening official-production paper-card reveal delay-2">
    <header className="official-listening-head"><div><span className="eyebrow">GOETHE-ZERTIFIKAT A2</span><h2>{t('writing.officialTitle')}</h2><p>{t('writing.officialIntro')}</p></div><div className="listening-progress"><strong>2</strong><span>{t('writing.tasks')}</span></div></header>
    <div className="official-test-tabs">{goetheWritingTests.map((entry, index) => <button key={entry.id} className={testIndex === index ? 'active' : ''} onClick={() => selectTest(index)}><span>0{index + 1}</span><strong>{entry.title}</strong><small>30 min</small></button>)}</div>
    <div className="official-part-tabs production-parts">{test.tasks.map((entry, index) => <button key={entry.number} className={taskIndex === index ? 'active' : ''} onClick={() => setTaskIndex(index)}><span>{t('listening.part', { number: entry.number })}</span><small>{entry.type} · {entry.minWords}–{entry.maxWords}</small>{results[`${test.id}-${entry.number}`] !== undefined && <Check size={15} />}</button>)}</div>
    <div className="official-production-layout"><figure className="official-sheet"><a href={test.sheet} target="_blank" rel="noreferrer"><img src={test.sheet} alt={t('writing.sheetAlt')} /></a><figcaption>{t('listening.zoomHint')}</figcaption></figure><div className="production-workspace"><span className="eyebrow">{task.type} · {task.minWords}–{task.maxWords} {t('practice.words', { count: '' }).trim()}</span><h3>{task.prompt}</h3><ul>{task.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul><textarea value={response} onChange={event => setResponses(current => ({ ...current, [key]: event.target.value }))} placeholder={t('writing.placeholder')} /><div className={`word-range ${words >= task.minWords && words <= task.maxWords ? 'good' : ''}`}><strong>{words}</strong><span>{t('practice.words', { count: words })} · {task.minWords}–{task.maxWords}</span></div><div className="self-check"><strong>{t('writing.selfCheck')}</strong>{[t('writing.checkPoints'), t('writing.checkLength'), t('writing.checkLanguage')].map((label, index) => <label key={label}><input type="checkbox" checked={taskChecks.includes(index)} onChange={() => toggleCheck(index)} />{label}</label>)}</div>{results[key] !== undefined && <div className={`production-score ${results[key] >= 60 ? 'pass' : 'retry'}`}><strong>{results[key]}%</strong><span>{t('writing.trainingScore')}</span></div>}<button className="primary-button" onClick={assess} disabled={words < 8}>{t('writing.assess')} <ArrowRight size={18} /></button></div></div>
    <footer className="official-attribution"><ShieldCheck size={16} /><span>{t('writing.disclaimer')}</span><a href={test.sourceUrl} target="_blank" rel="noreferrer">{t('listening.officialPdf')}</a></footer>
  </section>;
}

function OfficialSpeakingTrainer({ onResult }) {
  const { t } = useLanguage();
  const [testIndex, setTestIndex] = useState(0);
  const [partIndex, setPartIndex] = useState(0);
  const [response, setResponse] = useState('');
  const [recording, setRecording] = useState(false);
  const [checks, setChecks] = useState([]);
  const [score, setScore] = useState(null);
  const recognitionRef = useRef(null);
  const test = goetheSpeakingTests[testIndex];
  const part = test.parts[partIndex];
  const words = response.trim() ? response.trim().split(/\s+/).length : 0;

  useEffect(() => () => recognitionRef.current?.stop?.(), []);
  function resetWork() { setResponse(''); setChecks([]); setScore(null); setRecording(false); recognitionRef.current?.stop?.(); }
  function selectTest(index) { setTestIndex(index); setPartIndex(0); resetWork(); }
  function selectPart(index) { setPartIndex(index); resetWork(); }
  function toggleRecording() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    if (recording) { recognitionRef.current?.stop(); setRecording(false); return; }
    const recognition = new Recognition(); recognition.lang = 'de-DE'; recognition.interimResults = true; recognition.continuous = true;
    recognition.onresult = event => setResponse([...event.results].map(entry => entry[0].transcript).join(' '));
    recognition.onend = () => setRecording(false); recognition.start(); recognitionRef.current = recognition; setRecording(true);
  }
  function assess() {
    const lengthTarget = part.number === 1 ? 18 : 35;
    const finalScore = Math.min(100, Math.round(Math.min(1, words / lengthTarget) * 50) + Math.round((checks.length / 3) * 50));
    setScore(finalScore); onResult('speaking', finalScore, `${test.title} Sprechen Teil ${part.number}`);
  }
  return <section className="official-listening official-production paper-card reveal delay-2">
    <header className="official-listening-head"><div><span className="eyebrow">GOETHE-ZERTIFIKAT A2</span><h2>{t('speaking.officialTitle')}</h2><p>{t('speaking.officialIntro')}</p></div><div className="listening-progress"><strong>3</strong><span>{t('writing.tasks')}</span></div></header>
    <div className="official-test-tabs">{goetheSpeakingTests.map((entry, index) => <button key={entry.id} className={testIndex === index ? 'active' : ''} onClick={() => selectTest(index)}><span>0{index + 1}</span><strong>{entry.title}</strong><small>15 min</small></button>)}</div>
    <div className="official-part-tabs production-parts speaking-parts">{test.parts.map((entry, index) => <button key={entry.number} className={partIndex === index ? 'active' : ''} onClick={() => selectPart(index)}><span>{t('listening.part', { number: entry.number })}</span><small>{entry.title}</small></button>)}</div>
    <div className="speaking-sheet-grid">{part.images.map(imagePath => <figure className="official-sheet" key={imagePath}><a href={imagePath} target="_blank" rel="noreferrer"><img loading="lazy" decoding="async" src={imagePath} alt={`${part.title} ${part.number}`} /></a><figcaption>{t('listening.zoomHint')}</figcaption></figure>)}</div>
    <div className="speaking-workspace"><div><span className="eyebrow">{part.title}</span><h3>{part.prompts[0]}</h3>{part.prompts.length > 1 && <p>{part.prompts.slice(1).join(' / ')}</p>}</div><div className="record-row"><button onClick={toggleRecording} className={recording ? 'recording' : ''} disabled={!(window.SpeechRecognition || window.webkitSpeechRecognition)}><Mic size={19} />{recording ? t('practice.stopRecording') : t('practice.record')}</button><span>{t('practice.localSpeech')}</span></div><textarea value={response} onChange={event => setResponse(event.target.value)} placeholder={t('speaking.placeholder')} /><div className="self-check"><strong>{t('writing.selfCheck')}</strong>{[t('speaking.checkTask'), t('speaking.checkSentences'), t('speaking.checkClear')].map((label, index) => <label key={label}><input type="checkbox" checked={checks.includes(index)} onChange={() => setChecks(current => current.includes(index) ? current.filter(entry => entry !== index) : [...current, index])} />{label}</label>)}</div>{score !== null && <div className={`production-score ${score >= 60 ? 'pass' : 'retry'}`}><strong>{score}%</strong><span>{t('speaking.trainingScore')}</span></div>}<button className="primary-button" onClick={assess} disabled={words < 5}>{t('writing.assess')} <ArrowRight size={18} /></button></div>
    <footer className="official-attribution"><ShieldCheck size={16} /><span>{t('speaking.disclaimer')}</span><a href={test.sourceUrl} target="_blank" rel="noreferrer">{t('listening.officialPdf')}</a></footer>
  </section>;
}

function OfficialReadingTrainer({ onResult }) {
  const { t } = useLanguage();
  const [testIndex, setTestIndex] = useState(0);
  const [partIndex, setPartIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const test = goetheReadingTests[testIndex];
  const part = test.parts[partIndex];
  const answeredCount = Object.keys(answers).length;
  const correctCount = submitted ? test.parts.flatMap(entry => entry.questions).filter(question => answers[question.number] === question.answer).length : 0;
  const score = Math.round((correctCount / 20) * 100);
  const usedPartAnswers = new Set(part.questions.map(question => answers[question.number]).filter(Boolean));

  function selectTest(index) { setTestIndex(index); setPartIndex(0); setAnswers({}); setSubmitted(false); }
  function choose(questionNumber, answer) { if (!submitted) setAnswers(current => ({ ...current, [questionNumber]: answer })); }
  function submit() {
    if (answeredCount !== 20) return;
    const totalCorrect = test.parts.flatMap(entry => entry.questions).filter(question => answers[question.number] === question.answer).length;
    const finalScore = Math.round((totalCorrect / 20) * 100);
    setSubmitted(true);
    onResult('reading', finalScore, `${test.title} Lesen`);
  }
  function restart() { setPartIndex(0); setAnswers({}); setSubmitted(false); }

  return (
    <section className="official-listening paper-card reveal delay-2">
      <header className="official-listening-head"><div><span className="eyebrow">GOETHE-ZERTIFIKAT A2</span><h2>{t('reading.officialTitle')}</h2><p>{t('reading.officialIntro')}</p></div><div className="listening-progress"><strong>{answeredCount}/20</strong><span>{t('listening.answered')}</span></div></header>
      <div className="official-test-tabs">{goetheReadingTests.map((entry, index) => <button key={entry.id} className={testIndex === index ? 'active' : ''} onClick={() => selectTest(index)}><span>0{index + 1}</span><strong>{entry.title}</strong><small>{entry.duration}</small></button>)}</div>
      <div className="official-part-tabs">{test.parts.map((entry, index) => { const complete = entry.questions.every(question => answers[question.number]); return <button key={entry.number} className={`${partIndex === index ? 'active' : ''} ${complete ? 'complete' : ''}`} onClick={() => setPartIndex(index)}><span>{t('listening.part', { number: entry.number })}</span><small>{entry.start}–{entry.end}</small>{complete && <Check size={15} />}</button>; })}</div>
      <div className="official-part-layout">
        <div className="official-reading-sheets">{part.images.map((imagePath, index) => <figure className="official-sheet" key={imagePath}><a href={imagePath} target="_blank" rel="noreferrer"><img loading="lazy" decoding="async" src={imagePath} alt={t('reading.sheetAlt', { part: part.number, page: index + 1 })} /></a><figcaption>{t('listening.zoomHint')}</figcaption></figure>)}</div>
        <div className="official-answer-sheet"><div><span className="eyebrow">{t('listening.answers')}</span><strong>{part.start}–{part.end}</strong></div>{part.questions.map(question => <div className="official-answer-row" key={question.number}><b>{question.number}</b><div>{part.options.map(option => { const selected = answers[question.number] === option; const unavailable = part.unique && usedPartAnswers.has(option) && !selected; const correct = submitted && question.answer === option; const wrong = submitted && selected && !correct; return <button key={option} disabled={submitted || unavailable} className={`${selected ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`} onClick={() => choose(question.number, option)}>{option.toUpperCase()}</button>; })}</div></div>)}<div className="official-part-navigation"><button onClick={() => setPartIndex(index => Math.max(0, index - 1))} disabled={partIndex === 0}>{t('listening.previous')}</button><button onClick={() => setPartIndex(index => Math.min(3, index + 1))} disabled={partIndex === 3}>{t('listening.next')}</button></div></div>
      </div>
      {submitted ? <div className={`official-result ${score >= 60 ? 'pass' : 'retry'}`}><div><strong>{score}%</strong><span>{correctCount}/20</span></div><p>{score >= 60 ? t('reading.passed') : t('reading.retry')}</p><button onClick={restart}><RotateCcw size={16} />{t('listening.restart')}</button></div> : <div className="official-submit"><div><strong>{answeredCount}/20</strong><span>{answeredCount === 20 ? t('listening.readySubmit') : t('listening.remaining', { count: 20 - answeredCount })}</span></div><button className="primary-button" onClick={submit} disabled={answeredCount !== 20}>{t('listening.submit')} <ArrowRight size={18} /></button></div>}
      <footer className="official-attribution"><ShieldCheck size={16} /><span>{t('reading.attribution')}</span><a href={test.sourceUrl} target="_blank" rel="noreferrer">{t('listening.officialPdf')}</a></footer>
    </section>
  );
}

function OfficialListeningTrainer({ onResult }) {
  const { t } = useLanguage();
  const [testIndex, setTestIndex] = useState(0);
  const [partIndex, setPartIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const test = goetheListeningTests[testIndex];
  const part = test.parts[partIndex];
  const answeredCount = Object.keys(answers).length;
  const correctCount = submitted ? test.parts.flatMap(entry => entry.questions).filter(question => answers[question.number] === question.answer).length : 0;
  const score = Math.round((correctCount / 20) * 100);
  const usedPartAnswers = new Set(part.questions.map(question => answers[question.number]).filter(Boolean));

  function selectTest(index) {
    setTestIndex(index);
    setPartIndex(0);
    setAnswers({});
    setSubmitted(false);
    setAudioLoaded(false);
  }

  function choose(questionNumber, answer) {
    if (submitted) return;
    setAnswers(current => ({ ...current, [questionNumber]: answer }));
  }

  function submit() {
    if (answeredCount !== 20) return;
    const totalCorrect = test.parts.flatMap(entry => entry.questions).filter(question => answers[question.number] === question.answer).length;
    const finalScore = Math.round((totalCorrect / 20) * 100);
    setSubmitted(true);
    onResult('listening', finalScore, `${test.title} Hören`);
  }

  function restart() {
    setPartIndex(0);
    setAnswers({});
    setSubmitted(false);
    setAudioLoaded(false);
  }

  return (
    <section className="official-listening paper-card reveal delay-2">
      <header className="official-listening-head">
        <div><span className="eyebrow">GOETHE-ZERTIFIKAT A2</span><h2>{t('listening.title')}</h2><p>{t('listening.intro')}</p></div>
        <div className="listening-progress"><strong>{answeredCount}/20</strong><span>{t('listening.answered')}</span></div>
      </header>

      <div className="official-test-tabs">{goetheListeningTests.map((entry, index) => <button key={entry.id} className={testIndex === index ? 'active' : ''} onClick={() => selectTest(index)}><span>0{index + 1}</span><strong>{entry.title}</strong><small>{entry.duration}</small></button>)}</div>

      <div className="official-audio">
        {!audioLoaded ? <button className="primary-button" onClick={() => setAudioLoaded(true)}><Play size={18} />{t('listening.loadAudio')}</button> : <audio controls preload="none" src={test.audioUrl}>{t('listening.noAudio')}</audio>}
        <div><strong>{t('listening.audioSource')}</strong><span>{t('listening.externalNotice')}</span></div>
      </div>

      <div className="official-part-tabs">{test.parts.map((entry, index) => {
        const complete = entry.questions.every(question => answers[question.number]);
        return <button key={entry.number} className={`${partIndex === index ? 'active' : ''} ${complete ? 'complete' : ''}`} onClick={() => setPartIndex(index)}><span>{t('listening.part', { number: entry.number })}</span><small>{entry.start}–{entry.end} · {t('listening.plays', { count: entry.plays })}</small>{complete && <Check size={15} />}</button>;
      })}</div>

      <div className="official-part-layout">
        <figure className="official-sheet"><a href={part.image} target="_blank" rel="noreferrer"><img loading="lazy" decoding="async" src={part.image} alt={t('listening.sheetAlt', { number: part.number })} /></a><figcaption>{t('listening.zoomHint')}</figcaption></figure>
        <div className="official-answer-sheet">
          <div><span className="eyebrow">{t('listening.answers')}</span><strong>{part.start}–{part.end}</strong></div>
          {part.questions.map(question => (
            <div className="official-answer-row" key={question.number}>
              <b>{question.number}</b>
              <div>{part.options.map(option => {
                const selected = answers[question.number] === option;
                const unavailable = part.unique && usedPartAnswers.has(option) && !selected;
                const correct = submitted && question.answer === option;
                const wrong = submitted && selected && !correct;
                return <button key={option} disabled={submitted || unavailable} className={`${selected ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`} onClick={() => choose(question.number, option)} aria-label={t('listening.answerLabel', { question: question.number, answer: option })}>{option === 'ja' ? t('listening.yes') : option === 'nein' ? t('listening.no') : option.toUpperCase()}</button>;
              })}</div>
            </div>
          ))}
          <div className="official-part-navigation"><button onClick={() => setPartIndex(index => Math.max(0, index - 1))} disabled={partIndex === 0}>{t('listening.previous')}</button><button onClick={() => setPartIndex(index => Math.min(3, index + 1))} disabled={partIndex === 3}>{t('listening.next')}</button></div>
        </div>
      </div>

      {submitted && <div className={`official-result ${score >= 60 ? 'pass' : 'retry'}`}><div><strong>{score}%</strong><span>{correctCount}/20</span></div><p>{score >= 60 ? t('listening.passed') : t('listening.retry')}</p><button onClick={restart}><RotateCcw size={16} />{t('listening.restart')}</button></div>}
      {!submitted && <div className="official-submit"><div><strong>{answeredCount}/20</strong><span>{answeredCount === 20 ? t('listening.readySubmit') : t('listening.remaining', { count: 20 - answeredCount })}</span></div><button className="primary-button" onClick={submit} disabled={answeredCount !== 20}>{t('listening.submit')} <ArrowRight size={18} /></button></div>}
      <footer className="official-attribution"><ShieldCheck size={16} /><span>{t('listening.attribution')}</span><a href={test.sourceUrl} target="_blank" rel="noreferrer">{t('listening.officialPdf')}</a></footer>
    </section>
  );
}

function PracticeSession({ skillId, items, onResult, afterResult }) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const [response, setResponse] = useState('');
  const [result, setResult] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [listenCount, setListenCount] = useState(0);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);
  const item = items[index % items.length];
  const isChoiceTask = skillId === 'reading' || skillId === 'listening';

  useEffect(() => () => {
    cancelGermanSpeech();
    recognitionRef.current?.stop?.();
  }, []);

  function playListening() {
    if (!('speechSynthesis' in window) || listenCount >= 2) return;
    setListenCount(count => count + 1);
    setPlaying(true);
    speakGerman(item.transcript, { rate: 0.84, pitch: 0.98, onend: () => setPlaying(false), onerror: () => setPlaying(false) });
  }

  function toggleRecording() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'de-DE';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = event => {
      const transcript = [...event.results].map(entry => entry[0].transcript).join(' ');
      setResponse(transcript);
    };
    recognition.onend = () => setRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  }

  function evaluate() {
    let score;
    if (isChoiceTask) {
      score = choice === item.answer ? 100 : 0;
    } else {
      const words = response.trim().split(/\s+/).filter(Boolean);
      const targetWords = item.targetWords ?? [];
      const matchedTargets = targetWords.filter(word => response.toLocaleLowerCase('de').includes(word.toLocaleLowerCase('de'))).length;
      const lengthTarget = skillId === 'writing' ? item.minWords : 28;
      const lengthScore = Math.min(1, words.length / lengthTarget) * 60;
      const contentScore = targetWords.length ? (matchedTargets / targetWords.length) * 40 : 40;
      score = Math.round(lengthScore + contentScore);
    }
    setResult(score);
    onResult(skillId, score, item.title);
    afterResult?.(score);
  }

  function next() {
    setIndex(current => (current + 1) % items.length);
    setChoice(null); setResponse(''); setResult(null); setPlaying(false); setListenCount(0);
    window.speechSynthesis?.cancel();
  }

  const words = response.trim() ? response.trim().split(/\s+/).length : 0;
  const SkillIcon = skillIcons[skillId];
  return (
    <article className="practice-dossier paper-card reveal delay-2">
      <div className="practice-meta"><span><SkillIcon size={17} />{skillLabel(skillId, t)}</span><span>{t('practice.task', { current: index + 1, total: items.length })}</span>{item.goethePart && <span className="goethe-part">{item.goethePart}</span>}<span className="translation-hint"><Languages size={14} />{t('practice.translateHint')}</span><span className={`difficulty ${item.level}`}>{t(`difficulty.${item.level}`)}</span></div>
      <div className="practice-heading"><div><span className="eyebrow">{item.id.toUpperCase()}</span><h2>{item.title}</h2></div><div className="sixty-marker">60</div></div>

      {skillId === 'reading' && <div className="source-text"><span>{t('practice.text')}</span><p>{item.passage}</p></div>}
      {skillId === 'listening' && (
        <div className="audio-panel">
          <button onClick={playListening} disabled={playing || listenCount >= 2}>{playing ? <Pause size={24} /> : <Volume2 size={24} />}</button>
          <div><strong>{playing ? t('practice.audioPlaying') : listenCount >= 2 ? t('practice.playLimit') : t('practice.playAudio')}</strong><span>{t('practice.plays', { count: listenCount })} · {t('practice.audioHelp')}</span></div>
          <div className={`audio-wave ${playing ? 'playing' : ''}`}>{[1,2,3,4,5,6,7,8,9,10,11,12].map(bar => <i key={bar} />)}</div>
        </div>
      )}

      {isChoiceTask ? (
        <div className="question-block">
          <h3 data-instruction-translation={getInstructionTranslation(item.id, 'question')}>{item.question}</h3>
          <div className="option-list">{item.options.map((option, optionIndex) => (
            <button key={option} disabled={result !== null} onClick={() => setChoice(optionIndex)} className={`${choice === optionIndex ? 'selected' : ''} ${result !== null && optionIndex === item.answer ? 'correct' : ''} ${result !== null && choice === optionIndex && choice !== item.answer ? 'wrong' : ''}`}>
              <span>{String.fromCharCode(65 + optionIndex)}</span>{option}{result !== null && optionIndex === item.answer && <Check size={18} />}
            </button>
          ))}</div>
        </div>
      ) : (
        <div className="production-task">
          <div className="task-brief"><span>{t('practice.instruction')}</span><h3 data-instruction-translation={getInstructionTranslation(item.id, 'prompt')}>{item.prompt}</h3><ul>{item.bullets.map((bullet, bulletIndex) => <li key={bullet} data-instruction-translation={getInstructionTranslation(item.id, 'bullets', bulletIndex)}><span />{bullet}</li>)}</ul></div>
          {skillId === 'speaking' && (
            <><div className="record-row">
              <button onClick={toggleRecording} className={recording ? 'recording' : ''} disabled={!(window.SpeechRecognition || window.webkitSpeechRecognition)}><Mic size={19} />{recording ? t('practice.stopRecording') : t('practice.record')}</button>
              <span>{window.SpeechRecognition || window.webkitSpeechRecognition ? t('practice.localSpeech') : t('practice.noSpeech')}</span>
            </div><p className="assessment-limit"><ShieldCheck size={15} />{t('practice.speakingLimit')}</p></>
          )}
          <div className="writing-area"><textarea value={response} disabled={result !== null} onChange={event => setResponse(event.target.value)} placeholder={skillId === 'writing' ? item.modelStart : 'Ich möchte über … sprechen.'} /><span>{t('practice.words', { count: words })} {skillId === 'writing' && `/ ${t('practice.wordTarget', { count: item.minWords })}`}</span></div>
        </div>
      )}

      {result !== null && (
        <div className={`feedback-panel ${result >= 60 ? 'pass' : 'retry'}`}>
          <div className="feedback-score"><strong>{result}%</strong><span>{result >= 60 ? t('practice.passed') : t('practice.retry')}</span></div>
          <p>{isChoiceTask ? item.explanation : result >= 60 ? t('practice.feedbackPass') : t('practice.feedbackRetry')}</p>
        </div>
      )}

      <div className="practice-actions">
        {result === null ? <button className="primary-button" onClick={evaluate} disabled={isChoiceTask ? choice === null : response.trim().length < 8}>{t('practice.check')} <ArrowRight size={18} /></button> : <button className="primary-button" onClick={next}>{t('practice.next')} <ArrowRight size={18} /></button>}
        <small>{result === null ? t('practice.counts') : t('practice.saved')}</small>
      </div>
    </article>
  );
}

const fullExamStorageKey = 'a2-full-exam-v1';

function readSavedExam() {
  try {
    const stored = JSON.parse(localStorage.getItem(fullExamStorageKey));
    return stored?.version === 1 && stored.status === 'exam' ? stored : null;
  } catch { return null; }
}

function ExamObjectiveSection({ kind, test, partIndex, setPartIndex, answers, choose, t }) {
  const part = test.parts[partIndex];
  const usedAnswers = new Set(part.questions.map(question => answers[question.number]).filter(Boolean));
  const audioRef = useRef(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [audioFinished, setAudioFinished] = useState(false);
  const [audioProgress, setAudioProgress] = useState({ current: 0, duration: 0 });
  function startAudio() {
    if (audioStarted) return;
    setAudioStarted(true);
    audioRef.current?.play().catch(() => setAudioStarted(false));
  }
  return <div className="full-exam-workspace">
    {kind === 'listening' && <div className="official-audio exam-audio"><audio ref={audioRef} preload="none" src={test.audioUrl} onLoadedMetadata={event => setAudioProgress(current => ({ ...current, duration: event.currentTarget.duration }))} onTimeUpdate={event => setAudioProgress(current => ({ ...current, current: event.currentTarget.currentTime }))} onEnded={() => setAudioFinished(true)}>{t('listening.noAudio')}</audio><button className="exam-audio-start" onClick={startAudio} disabled={audioStarted}><Play size={18} />{audioFinished ? t('exam.audioFinished') : audioStarted ? t('exam.audioRunning') : t('exam.audioStart')}</button><div className="exam-audio-status"><strong>{t('exam.audioOnce')}</strong><span>{t('exam.audioRule')}</span>{audioStarted && <div><i style={{ width: `${audioProgress.duration ? (audioProgress.current / audioProgress.duration) * 100 : 0}%` }} /><b>{formatExamTime(audioProgress.current * 1000)} / {audioProgress.duration ? formatExamTime(audioProgress.duration * 1000) : '—'}</b></div>}</div></div>}
    <div className="official-part-tabs exam-part-tabs">{test.parts.map((entry, index) => { const complete = entry.questions.every(question => answers[question.number]); return <button key={entry.number} className={`${partIndex === index ? 'active' : ''} ${complete ? 'complete' : ''}`} onClick={() => setPartIndex(index)}><span>{t('listening.part', { number: entry.number })}</span><small>{entry.start}–{entry.end}</small>{complete && <Check size={15} />}</button>; })}</div>
    <div className="official-part-layout">
      <div className="official-reading-sheets">{(kind === 'reading' ? part.images : [part.image]).map((imagePath, index) => <figure className="official-sheet" key={imagePath}><img loading="lazy" decoding="async" src={imagePath} alt={kind === 'reading' ? t('reading.sheetAlt', { part: part.number, page: index + 1 }) : t('listening.sheetAlt', { number: part.number })} /><figcaption>{t('exam.noAnswerReveal')}</figcaption></figure>)}</div>
      <div className="official-answer-sheet"><div><span className="eyebrow">{t('listening.answers')}</span><strong>{part.start}–{part.end}</strong></div>{part.questions.map(question => <div className="official-answer-row" key={question.number}><b>{question.number}</b><div>{part.options.map(option => { const selected = answers[question.number] === option; const unavailable = part.unique && usedAnswers.has(option) && !selected; return <button key={option} disabled={unavailable} className={selected ? 'selected' : ''} onClick={() => choose(question.number, option)} aria-label={t('listening.answerLabel', { question: question.number, answer: option })}>{option === 'ja' ? t('listening.yes') : option === 'nein' ? t('listening.no') : option.toUpperCase()}</button>; })}</div></div>)}<div className="official-part-navigation"><button onClick={() => setPartIndex(Math.max(0, partIndex - 1))} disabled={partIndex === 0}>{t('listening.previous')}</button><button onClick={() => setPartIndex(Math.min(3, partIndex + 1))} disabled={partIndex === 3}>{t('listening.next')}</button></div></div>
    </div>
  </div>;
}

function ExamWritingSection({ test, partIndex, setPartIndex, responses, checks, updateResponse, toggleCheck, t }) {
  const task = test.tasks[partIndex];
  const response = responses[task.number] ?? '';
  const words = response.trim() ? response.trim().split(/\s+/).length : 0;
  const taskChecks = checks[task.number] ?? [];
  const labels = [t('writing.checkPoints'), t('writing.checkLength'), t('writing.checkLanguage')];
  return <div className="full-exam-workspace"><div className="official-part-tabs exam-part-tabs two-parts">{test.tasks.map((entry, index) => <button key={entry.number} className={partIndex === index ? 'active' : ''} onClick={() => setPartIndex(index)}><span>{t('listening.part', { number: entry.number })}</span><small>{entry.type} · {entry.minWords}–{entry.maxWords}</small>{responses[entry.number]?.trim() && <Check size={15} />}</button>)}</div><div className="official-production-layout"><figure className="official-sheet"><img src={test.sheet} alt={t('writing.sheetAlt')} /><figcaption>{t('exam.noAnswerReveal')}</figcaption></figure><div className="production-workspace"><span className="eyebrow">{task.type} · {task.minWords}–{task.maxWords}</span><h3>{task.prompt}</h3><ul>{task.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul><textarea value={response} onChange={event => updateResponse(task.number, event.target.value)} placeholder={t('writing.placeholder')} /><div className={`word-range ${words >= task.minWords && words <= task.maxWords ? 'good' : ''}`}><strong>{words}</strong><span>{t('practice.words', { count: words })}</span></div><div className="self-check"><strong>{t('exam.selfAssessment')}</strong>{labels.map((label, index) => <label key={label}><input type="checkbox" checked={taskChecks.includes(index)} onChange={() => toggleCheck(task.number, index)} />{label}</label>)}</div></div></div></div>;
}

function ExamSpeakingSection({ test, partIndex, setPartIndex, responses, checks, updateResponse, toggleCheck, recording, toggleRecording, t }) {
  const part = test.parts[partIndex];
  const response = responses[part.number] ?? '';
  const partChecks = checks[part.number] ?? [];
  const labels = [t('speaking.checkTask'), t('speaking.checkSentences'), t('speaking.checkClear')];
  return <div className="full-exam-workspace"><div className="official-part-tabs exam-part-tabs speaking-parts">{test.parts.map((entry, index) => <button key={entry.number} className={partIndex === index ? 'active' : ''} onClick={() => setPartIndex(index)}><span>{t('listening.part', { number: entry.number })}</span><small>{entry.title}</small>{responses[entry.number]?.trim() && <Check size={15} />}</button>)}</div><div className="speaking-sheet-grid">{part.images.map(imagePath => <figure className="official-sheet" key={imagePath}><img src={imagePath} alt={`${part.title} ${part.number}`} /><figcaption>{t('exam.speakAloud')}</figcaption></figure>)}</div><div className="speaking-workspace"><div><span className="eyebrow">{part.title}</span><h3>{part.prompts[0]}</h3>{part.prompts.length > 1 && <p>{part.prompts.slice(1).join(' / ')}</p>}</div><div className="record-row"><button onClick={toggleRecording} className={recording ? 'recording' : ''} disabled={!(window.SpeechRecognition || window.webkitSpeechRecognition)}><Mic size={19} />{recording ? t('practice.stopRecording') : t('practice.record')}</button><span>{t('exam.speechPrivacy')}</span></div><textarea value={response} onChange={event => updateResponse(part.number, event.target.value)} placeholder={t('speaking.placeholder')} /><div className="self-check"><strong>{t('exam.selfAssessment')}</strong>{labels.map((label, index) => <label key={label}><input type="checkbox" checked={partChecks.includes(index)} onChange={() => toggleCheck(part.number, index)} />{label}</label>)}</div></div></div>;
}

function ExamView({ onResult, scores }) {
  const { t } = useLanguage();
  const [savedExam, setSavedExam] = useState(readSavedExam);
  const [session, setSession] = useState(null);
  const [selectedTest, setSelectedTest] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [recording, setRecording] = useState(false);
  const timeoutHandled = useRef(false);
  const recognitionRef = useRef(null);

  const activeSection = session ? FULL_EXAM_SECTIONS[session.sectionIndex] : null;
  const testCollections = { reading: goetheReadingTests, listening: goetheListeningTests, writing: goetheWritingTests, speaking: goetheSpeakingTests };
  const activeTest = activeSection ? testCollections[activeSection.id][session.testIndex] : null;
  const remaining = session?.deadline ? Math.max(0, session.deadline - now) : 0;

  useEffect(() => {
    if (session?.status !== 'exam') return undefined;
    localStorage.setItem(fullExamStorageKey, JSON.stringify(session));
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [session]);

  useEffect(() => {
    timeoutHandled.current = false;
  }, [session?.deadline]);

  useEffect(() => {
    if (session?.status === 'exam' && remaining === 0 && !timeoutHandled.current) {
      timeoutHandled.current = true;
      submitSection(true);
    }
  }, [remaining, session?.status]);

  useEffect(() => () => recognitionRef.current?.stop?.(), []);

  function begin(testIndex = selectedTest) {
    recognitionRef.current?.stop?.();
    const next = createFullExamSession(testIndex);
    localStorage.setItem(fullExamStorageKey, JSON.stringify(next));
    setSavedExam(null); setSession(next); setNow(Date.now()); setRecording(false);
  }

  function discardSaved() { localStorage.removeItem(fullExamStorageKey); setSavedExam(null); }
  function updateSession(updater) { setSession(current => typeof updater === 'function' ? updater(current) : { ...current, ...updater }); }
  function setPartIndex(index) { updateSession(current => ({ ...current, partIndexes: { ...current.partIndexes, [activeSection.id]: index } })); }
  function choose(questionNumber, answer) { updateSession(current => ({ ...current, answers: { ...current.answers, [activeSection.id]: { ...current.answers[activeSection.id], [questionNumber]: answer } } })); }
  function updateResponse(kind, number, value) { updateSession(current => ({ ...current, responses: { ...current.responses, [kind]: { ...current.responses[kind], [number]: value } } })); }
  function toggleCheck(kind, number, index) { updateSession(current => { const currentChecks = current.checks[kind][number] ?? []; const nextChecks = currentChecks.includes(index) ? currentChecks.filter(entry => entry !== index) : [...currentChecks, index]; return { ...current, checks: { ...current.checks, [kind]: { ...current.checks[kind], [number]: nextChecks } } }; }); }

  function calculateSectionResult(sectionId) {
    const test = testCollections[sectionId][session.testIndex];
    if (sectionId === 'reading' || sectionId === 'listening') return scoreObjectiveSection(test.parts, session.answers[sectionId]);
    if (sectionId === 'writing') return scoreWritingSection(test.tasks, session.responses.writing, session.checks.writing);
    return scoreSpeakingSection(test.parts, session.responses.speaking, session.checks.speaking);
  }

  function submitSection(timedOut = false) {
    if (!session || session.status !== 'exam') return;
    const section = FULL_EXAM_SECTIONS[session.sectionIndex];
    if (!timedOut && !window.confirm(t('exam.submitConfirm'))) return;
    recognitionRef.current?.stop?.(); setRecording(false);
    const result = calculateSectionResult(section.id);
    const scoreEntry = { skillId: section.id, score: result.score, detail: result, timedOut };
    const nextScores = [...session.scores.filter(entry => entry.skillId !== section.id), scoreEntry];
    onResult(section.id, result.score, `Simulation: ${activeTest.title} ${skillLabel(section.id, t)}`);
    if (session.sectionIndex === FULL_EXAM_SECTIONS.length - 1) {
      localStorage.removeItem(fullExamStorageKey);
      setSession({ ...session, status: 'finished', scores: nextScores, timedOut: timedOut ? [...session.timedOut, section.id] : session.timedOut, deadline: null, completedAt: new Date().toISOString() });
      return;
    }
    const nextIndex = session.sectionIndex + 1;
    setSession({ ...session, sectionIndex: nextIndex, scores: nextScores, timedOut: timedOut ? [...session.timedOut, section.id] : session.timedOut, deadline: Date.now() + FULL_EXAM_SECTIONS[nextIndex].minutes * 60000 });
    setNow(Date.now()); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleRecording() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    if (recording) { recognitionRef.current?.stop(); setRecording(false); return; }
    const partNumber = activeTest.parts[session.partIndexes.speaking].number;
    const recognition = new Recognition(); recognition.lang = 'de-DE'; recognition.interimResults = true; recognition.continuous = true;
    recognition.onresult = event => updateResponse('speaking', partNumber, [...event.results].map(entry => entry[0].transcript).join(' '));
    recognition.onend = () => setRecording(false); recognition.start(); recognitionRef.current = recognition; setRecording(true);
  }

  if (!session) return <div className="page exam-page"><section className="exam-cover reveal"><div className="exam-cover-copy"><span className="eyebrow">{t('exam.eyebrow')}</span><h1>{t('exam.title1')}<br />{t('exam.title2')}</h1><p>{t('exam.intro')}</p><div className="exam-set-picker"><span>{t('exam.chooseSet')}</span>{goetheReadingTests.map((test, index) => <button key={test.id} className={selectedTest === index ? 'active' : ''} onClick={() => setSelectedTest(index)}><strong>{test.title}</strong><small>{index === 0 ? t('exam.setOfficial') : t('exam.setPractice')}</small></button>)}</div><button className="primary-button" onClick={() => begin()}>{t('exam.start')} <Play size={18} /></button>{savedExam && <div className="exam-resume"><Clock3 size={19} /><div><strong>{t('exam.savedTitle')}</strong><span>{t('exam.savedSection', { section: skillLabel(FULL_EXAM_SECTIONS[savedExam.sectionIndex].id, t) })}</span></div><button onClick={() => { setSession(savedExam); setNow(Date.now()); }}>{t('exam.resume')}</button><button onClick={discardSaved} aria-label={t('exam.discard')}><X size={16} /></button></div>}</div><div className="exam-rules"><div className="rules-head"><ShieldCheck size={28} /><span>{t('exam.protocol')}</span></div>{FULL_EXAM_SECTIONS.map((section, index) => { const Icon = skillIcons[section.id]; return <div key={section.id}><span>0{index + 1}</span><Icon size={18} /><strong>{skillLabel(section.id, t)}</strong><small>{section.minutes} min · {scores[section.id]}%</small></div>; })}<p><Clock3 size={16} />{t('exam.duration')}</p></div></section><section className="simulation-note reveal delay-1"><LockKeyhole size={20} /><div><strong>{t('exam.logic')}</strong><p>{t('exam.disclaimer')}</p></div></section></div>;

  if (session.status === 'finished') {
    const allPassed = session.scores.length === 4 && session.scores.every(entry => entry.score >= 60);
    return <div className="page exam-page"><section className="exam-result reveal"><span className="eyebrow">{t('exam.finished')}</span><h1>{allPassed ? t('exam.allPassed') : t('exam.needsWork')}</h1><p className="exam-result-lead">{t('exam.resultLead')}</p><div className="exam-result-grid">{skills.map(skill => { const result = session.scores.find(entry => entry.skillId === skill.id); const score = result?.score ?? 0; return <div key={skill.id} className={score >= 60 ? 'pass' : ''}><span>{skillLabel(skill.id, t)}</span><strong>{score}%</strong><small>{result?.timedOut ? t('exam.timedOut') : score >= 60 ? t('exam.passed') : t('exam.under')}</small>{result?.detail?.correct !== undefined && <em>{result.detail.correct}/{result.detail.total}</em>}</div>; })}</div><div className="exam-result-actions"><button className="primary-button" onClick={() => begin(session.testIndex)}><RotateCcw size={17} /> {t('exam.again')}</button></div></section></div>;
  }

  const partIndex = session.partIndexes[activeSection.id];
  const objectiveAnswers = session.answers[activeSection.id] ?? {};
  const answered = Object.keys(objectiveAnswers).length;
  const urgent = remaining <= 5 * 60000;
  return <div className="page exam-page full-exam-page"><header className="full-exam-header reveal"><div><span>{t('exam.part', { current: session.sectionIndex + 1 })}</span><h1>{skillLabel(activeSection.id, t)}</h1><small>{activeTest.title}</small></div><div className="full-exam-track">{FULL_EXAM_SECTIONS.map((section, index) => <i key={section.id} className={index < session.sectionIndex ? 'done' : index === session.sectionIndex ? 'active' : ''} />)}</div><div className={`exam-clock ${urgent ? 'urgent' : ''}`} role="timer" aria-live={urgent ? 'polite' : 'off'}><Clock3 size={21} /><div><span>{t('exam.timeLeft')}</span><strong>{formatExamTime(remaining)}</strong></div></div></header><div className="exam-autosave"><CheckCircle2 size={15} /><span>{t('exam.autosaved')}</span>{(activeSection.id === 'reading' || activeSection.id === 'listening') && <b>{t('exam.answered', { count: answered })}</b>}</div>
    {(activeSection.id === 'reading' || activeSection.id === 'listening') && <ExamObjectiveSection kind={activeSection.id} test={activeTest} partIndex={partIndex} setPartIndex={setPartIndex} answers={objectiveAnswers} choose={choose} t={t} />}
    {activeSection.id === 'writing' && <ExamWritingSection test={activeTest} partIndex={partIndex} setPartIndex={setPartIndex} responses={session.responses.writing} checks={session.checks.writing} updateResponse={(number, value) => updateResponse('writing', number, value)} toggleCheck={(number, index) => toggleCheck('writing', number, index)} t={t} />}
    {activeSection.id === 'speaking' && <ExamSpeakingSection test={activeTest} partIndex={partIndex} setPartIndex={setPartIndex} responses={session.responses.speaking} checks={session.checks.speaking} updateResponse={(number, value) => updateResponse('speaking', number, value)} toggleCheck={(number, index) => toggleCheck('speaking', number, index)} recording={recording} toggleRecording={toggleRecording} t={t} />}
    <footer className="exam-submit-bar"><div><strong>{t('exam.lockWarning')}</strong><span>{t('exam.lockDetail')}</span></div><button className="primary-button" onClick={() => submitSection(false)}>{session.sectionIndex === 3 ? t('exam.finish') : t('exam.submitSection')} <ArrowRight size={18} /></button></footer>
  </div>;
}

function AchievementCollection({ unlockedAchievements }) {
  const { t } = useLanguage();
  const unlockedIds = new Set((unlockedAchievements ?? []).map(entry => typeof entry === 'string' ? entry : entry.id));

  return <section className="achievement-collection paper-card reveal delay-2">
    <div className="section-heading">
      <div><span className="eyebrow">{t('achievement.collectionEyebrow')}</span><h2>{t('achievement.collectionTitle')}</h2></div>
      <strong>{unlockedIds.size}/{achievementDefinitions.length}</strong>
    </div>
    <p>{t('achievement.collectionIntro')}</p>
    <div className="achievement-grid">
      {achievementDefinitions.map(achievement => {
        const unlocked = unlockedIds.has(achievement.id);
        const copy = achievementCopy(achievement, t);
        return <article key={achievement.id} className={unlocked ? 'unlocked' : 'locked'}>
          <AchievementBadge achievement={achievement} locked={!unlocked} />
          <div><span>{unlocked ? t('achievement.earned') : t('achievement.locked')}</span><h3>{copy.title}</h3><p>{copy.description}</p></div>
        </article>;
      })}
    </div>
  </section>;
}

function ProgressView({ progress, scores, readiness, ready, reviewMistake, dismissMistake, openBookmark, toggleBookmark, updateAvatar, reset }) {
  const { t, locale } = useLanguage();
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <div className="page progress-page">
      <section className="page-intro reveal"><div><span className="eyebrow">{t('progress.eyebrow')}</span><h1>{t('progress.title')}</h1><p>{t('progress.intro')}</p></div><div className={`status-seal ${ready ? 'pass' : ''}`}><span>{ready ? t('progress.ready') : t('progress.working')}</span><strong>{readiness}%</strong></div></section>
      <section className="progress-ledger paper-card reveal delay-1">
        <div className="ledger-head"><span>{t('progress.part')}</span><span>{t('progress.evidence')}</span><span>{t('progress.level')}</span><span>{t('progress.status')}</span></div>
        {skills.map(skill => { const score = scores[skill.id]; const attempts = (progress.skills[skill.id]?.possible ?? 0) / 100; return <div className="ledger-row" key={skill.id}><strong>{skillLabel(skill.id, t)}</strong><span>{t('progress.tasks', { count: attempts })}</span><div className="ledger-score"><i style={{ width: `${score}%`, background: skill.color }} /><b /></div><span className={score >= 60 ? 'passed' : ''}>{score >= 60 ? t('progress.over') : `${score}%`}</span></div>; })}
      </section>
      <AchievementCollection unlockedAchievements={progress.achievements} />
      <Suspense fallback={<div className="section-loading paper-card"><LoaderCircle className="spin" size={24} /></div>}><AvatarCustomizer avatar={progress.avatar ?? initialAvatarState} progress={progress} scores={scores} updateAvatar={updateAvatar} /></Suspense>
      <section className="progress-columns reveal delay-2">
        <div className="paper-card activity-card"><div className="section-heading compact"><div><span className="eyebrow">{t('progress.activity')}</span><h2>{t('progress.latest')}</h2></div><CalendarDays size={21} /></div>{progress.activity.length ? <div className="activity-list">{progress.activity.slice(0, 8).map(item => <div key={item.id}><span className={`activity-icon ${item.type}`}>{item.type === 'unit' ? <BookOpen size={15} /> : <Target size={15} />}</span><div><strong>{item.label}</strong><small>{formatDate(new Date(item.date), locale)}</small></div>{item.score !== undefined && <b>{item.score}%</b>}</div>)}</div> : <div className="empty-state"><CircleDashed size={28} /><p>{t('progress.empty')}</p></div>}</div>
        <div className="paper-card stats-card"><span className="eyebrow">{t('progress.stats')}</span><div className="big-stat"><strong>{progress.streak}</strong><span>{t('progress.days')}<br />{t('progress.streak')}</span></div><div className="stat-pairs"><div><strong>{progress.totalSessions}</strong><span>{t('progress.sessions')}</span></div><div><strong>{progress.completedUnits.length}</strong><span>{t('progress.files')}</span></div></div><button className="danger-link" onClick={() => setConfirmReset(true)}>{t('progress.reset')}</button>{confirmReset && <div className="reset-confirm" role="alertdialog" aria-modal="true" aria-label={t('progress.confirm')}><p>{t('progress.confirm')}</p><button onClick={() => { reset(); setConfirmReset(false); }}>{t('progress.yesReset')}</button><button onClick={() => setConfirmReset(false)}>{t('progress.cancel')}</button></div>}</div>
      </section>
      <section className="mistake-notebook paper-card reveal delay-2">
        <div className="section-heading"><div><span className="eyebrow">{t('mistakes.eyebrow')}</span><h2>{t('mistakes.title')}</h2></div><strong>{progress.study?.mistakes?.length ?? 0}</strong></div>
        <p>{t('mistakes.intro')}</p>
        {(progress.study?.mistakes?.length ?? 0) > 0 ? <div className="mistake-list">{progress.study.mistakes.map(mistake => <article key={mistake.id}><span className="mistake-score">{mistake.score}%</span><div><strong>{mistake.label}</strong><small>{mistake.skillId === 'grammar' ? t('nav.grammar') : skillLabel(mistake.skillId, t)}</small></div><button onClick={() => reviewMistake(mistake)}>{t('mistakes.review')}<ArrowRight size={15} /></button><button className="mistake-dismiss" onClick={() => dismissMistake(mistake.id)} aria-label={t('mistakes.dismiss')}><X size={15} /></button></article>)}</div> : <div className="empty-state"><CheckCircle2 size={28} /><p>{t('mistakes.empty')}</p></div>}
      </section>
      <section className="bookmark-index paper-card reveal delay-2">
        <div className="section-heading"><div><span className="eyebrow">{t('bookmarks.eyebrow')}</span><h2>{t('bookmarks.title')}</h2></div><Bookmark size={22} /></div>
        {(progress.study?.bookmarks?.length ?? 0) > 0 ? <div className="bookmark-list">{progress.study.bookmarks.map(bookmark => <article key={`${bookmark.type}-${bookmark.id}`}><Bookmark size={17} fill="currentColor" /><button onClick={() => openBookmark(bookmark)}>{bookmark.label}</button><button onClick={() => toggleBookmark(bookmark)} aria-label={t('bookmarks.remove')}><X size={15} /></button></article>)}</div> : <p className="bookmark-empty">{t('bookmarks.empty')}</p>}
      </section>
    </div>
  );
}

function LoadingScreen({ label }) {
  const { t } = useLanguage();
  return <div className="auth-shell"><div className="auth-loading"><LoaderCircle size={30} /><strong>{label ?? t('loading.opening')}</strong></div></div>;
}

function AuthScreen({ disableCaptcha = false }) {
  const { language, t } = useLanguage();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [emailCooldown, setEmailCooldown] = useState(0);
  const turnstileRef = useRef(null);

  useEffect(() => {
    const updateCooldown = () => setEmailCooldown(emailCooldownSeconds(email));
    updateCooldown();
    const interval = window.setInterval(updateCooldown, 1000);
    return () => window.clearInterval(interval);
  }, [email]);

  function requireCaptcha() {
    if (!turnstileSiteKey || captchaToken) return true;
    setError(t('auth.captchaRequired'));
    setErrorCode('captcha_required');
    return false;
  }

  function resetCaptcha() {
    setCaptchaToken('');
    turnstileRef.current?.reset();
  }

  function startEmailCooldown() {
    localStorage.setItem(emailCooldownStorageKey(email), String(Date.now() + emailCooldownMilliseconds));
    setEmailCooldown(Math.ceil(emailCooldownMilliseconds / 1000));
  }

  function blockDuringEmailCooldown() {
    const seconds = emailCooldownSeconds(email);
    if (!seconds) return false;
    setEmailCooldown(seconds);
    setError(t('auth.emailCooldown', { count: seconds }));
    setErrorCode('email_cooldown');
    return true;
  }

  async function submit(event) {
    event.preventDefault();
    if (mode === 'signup' && password !== passwordConfirmation) {
      setError(t('auth.passwordMismatch'));
      setErrorCode('password_mismatch');
      return;
    }
    if (mode === 'signup' && blockDuringEmailCooldown()) return;
    if (!requireCaptcha()) return;
    setBusy(true); setError(''); setErrorCode(''); setMessage('');
    try {
      const result = mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password, options: { captchaToken } })
        : await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName.trim() }, captchaToken } });
      if (result.error) {
        setError(t(authErrorKey(result.error.code)));
        setErrorCode(result.error.code ?? 'unknown_auth_error');
        setNeedsConfirmation(['email_not_confirmed', 'user_already_exists', 'over_email_send_rate_limit'].includes(result.error.code));
        if (result.error.code === 'over_email_send_rate_limit') startEmailCooldown();
      } else if (mode === 'signup' && !result.data.session) {
        setMessage(t('auth.created'));
        setNeedsConfirmation(true);
        startEmailCooldown();
      }
    } catch {
      setError(t('auth.error.generic'));
      setErrorCode('network_error');
    } finally {
      resetCaptcha();
      setBusy(false);
    }
  }

  async function resendConfirmation() {
    if (!email) { setError(t('auth.enterEmail')); return; }
    if (blockDuringEmailCooldown()) return;
    if (!requireCaptcha()) return;
    setBusy(true); setError(''); setErrorCode(''); setMessage('');
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: window.location.origin, captchaToken } });
    if (resendError) { setError(t(authErrorKey(resendError.code))); setErrorCode(resendError.code ?? 'unknown_auth_error'); }
    else { setMessage(t('auth.resent')); startEmailCooldown(); }
    resetCaptcha();
    setBusy(false);
  }

  async function sendPasswordReset() {
    if (!email) { setError(t('auth.enterEmail')); return; }
    if (blockDuringEmailCooldown()) return;
    if (!requireCaptcha()) return;
    setBusy(true); setError(''); setErrorCode(''); setMessage('');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin, captchaToken });
    if (resetError) { setError(t(authErrorKey(resetError.code))); setErrorCode(resetError.code ?? 'unknown_auth_error'); }
    else { setMessage(t('auth.resetSent')); startEmailCooldown(); }
    resetCaptcha();
    setBusy(false);
  }

  async function signInWithGoogle() {
    setBusy(true); setError(''); setErrorCode(''); setMessage('');
    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (oauthError) {
      setError(t('auth.error.google'));
      setErrorCode(oauthError.code ?? 'google_oauth_error');
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <aside className="auth-poster">
        <div className="auth-brand"><span>A2</span><strong>Prüfungsakte</strong></div>
        <div><span className="eyebrow">{t('auth.roadmap')}</span><h1>{t('auth.title1')}<br /><em>{t('auth.title2')}</em></h1><p>{t('auth.poster')}</p></div>
        <div className="auth-poster-footer"><span className="creator-credit light">Created by <strong>Hermann Pauwells</strong></span></div>
      </aside>
      <main className="auth-form-panel">
        <form onSubmit={submit} className="auth-form">
          <LanguageSelector />
          <span className="eyebrow">{mode === 'login' ? t('auth.welcome') : t('auth.newFile')}</span>
          <h2>{mode === 'login' ? t('auth.login') : t('auth.create')}</h2>
          <p>{mode === 'login' ? t('auth.resume') : t('auth.private')}</p>
          {googleAuthEnabled && <><button type="button" className="google-auth-button" onClick={signInWithGoogle} disabled={busy}><GoogleMark />{t('auth.google')}</button><div className="auth-divider"><span>{t('auth.orEmail')}</span></div></>}
          {mode === 'signup' && <label><span>{t('auth.name')}</span><div><UserRound size={17} /><input value={displayName} onChange={event => setDisplayName(event.target.value)} required placeholder={t('auth.yourName')} autoComplete="name" /></div></label>}
          <label><span>{t('auth.email')}</span><div><Mail size={17} /><input type="email" value={email} onChange={event => setEmail(event.target.value)} required placeholder="name@example.com" autoComplete="email" /></div></label>
          <label><span>{t('auth.password')}</span><div><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} required minLength={mode === 'signup' ? 12 : 8} placeholder={mode === 'signup' ? t('auth.minPassword') : t('auth.yourPassword')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /><button type="button" className="password-visibility" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          {mode === 'signup' && <label><span>{t('auth.confirmPassword')}</span><div><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} value={passwordConfirmation} onChange={event => setPasswordConfirmation(event.target.value)} required minLength={12} placeholder={t('auth.confirmPassword')} autoComplete="new-password" /></div></label>}
          {mode === 'signup' && <p className="verification-note"><Mail size={15} />{t('auth.verifyNote')}</p>}
          {turnstileSiteKey && !disableCaptcha && <div className="turnstile-wrap"><Turnstile key={mode} ref={turnstileRef} siteKey={turnstileSiteKey} options={{ action: mode, language: language === 'zh' ? 'zh-cn' : language, size: 'flexible', theme: 'light' }} onSuccess={setCaptchaToken} onExpire={() => setCaptchaToken('')} onError={() => { setCaptchaToken(''); setError(t('auth.captchaFailed')); setErrorCode('captcha_failed'); }} /></div>}
          {error && <div className="auth-message error" role="alert">{error}{errorCode && <small>{t('auth.error.code', { code: errorCode })}</small>}</div>}
          {message && <div className="auth-message success" role="status" aria-live="polite">{message}</div>}
          <button className="primary-button" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} /> : mode === 'login' ? t('auth.login') : t('auth.createButton')}<ArrowRight size={18} /></button>
          <div className="auth-recovery-actions">
            {needsConfirmation && <button type="button" onClick={resendConfirmation} disabled={busy || emailCooldown > 0}>{emailCooldown > 0 ? t('auth.resendCountdown', { count: emailCooldown }) : t('auth.resend')}</button>}
            {mode === 'login' && <button type="button" onClick={sendPasswordReset} disabled={busy || emailCooldown > 0}>{emailCooldown > 0 ? t('auth.resetCountdown', { count: emailCooldown }) : t('auth.forgot')}</button>}
          </div>
          <button type="button" className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setPasswordConfirmation(''); setCaptchaToken(''); setError(''); setErrorCode(''); setMessage(''); }}>{mode === 'login' ? t('auth.registerSwitch') : t('auth.loginSwitch')}</button>
          <details className="security-disclosure">
            <summary><ShieldCheck size={16} />{t('auth.securityTitle')}</summary>
            <div>
              <p><strong>{t('auth.securityLead')}</strong> {t('auth.securityText')}</p>
              <p>{t('auth.hash')}</p>
            </div>
          </details>
          <small>{t('auth.cloudConsent')}</small>
        </form>
      </main>
    </div>
  );
}

function PasswordRecoveryScreen({ onDone }) {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (password !== confirmation) { setError(t('auth.passwordMismatch')); return; }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(updateError.code === 'weak_password' ? t('auth.error.weak') : t('auth.error.generic'));
    else await onDone();
    setBusy(false);
  }

  return (
    <div className="auth-shell recovery-shell">
      <main className="auth-form-panel">
        <form onSubmit={submit} className="auth-form">
          <LanguageSelector />
          <span className="eyebrow"><ShieldCheck size={15} />{t('auth.securityTitle')}</span>
          <h2>{t('auth.resetTitle')}</h2>
          <p>{t('auth.resetIntro')}</p>
          <label><span>{t('auth.newPassword')}</span><div><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} required minLength={12} autoComplete="new-password" /><button type="button" className="password-visibility" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          <label><span>{t('auth.confirmPassword')}</span><div><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} value={confirmation} onChange={event => setConfirmation(event.target.value)} required minLength={12} autoComplete="new-password" /></div></label>
          {error && <div className="auth-message error" role="alert">{error}</div>}
          <button className="primary-button" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} /> : t('auth.savePassword')}<ArrowRight size={18} /></button>
        </form>
      </main>
    </div>
  );
}

function EmailConfirmationScreen() {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const tokenHash = new URLSearchParams(window.location.search).get('token_hash');

  async function confirmEmail() {
    if (!tokenHash) {
      setError(t('auth.confirmMissing'));
      return;
    }
    setBusy(true);
    setError('');
    const { error: confirmationError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' });
    if (confirmationError) {
      setError(t('auth.confirmInvalid'));
      setBusy(false);
      return;
    }
    window.location.replace('/');
  }

  return (
    <div className="auth-shell recovery-shell">
      <main className="auth-form-panel">
        <section className="auth-form confirmation-form" aria-labelledby="confirmation-title">
          <LanguageSelector />
          <span className="eyebrow"><ShieldCheck size={15} />{t('auth.confirmEyebrow')}</span>
          <h2 id="confirmation-title">{t('auth.confirmTitle')}</h2>
          <p>{t('auth.confirmIntro')}</p>
          {error && <div className="auth-message error" role="alert">{error}</div>}
          <button type="button" className="primary-button" onClick={confirmEmail} disabled={busy || !tokenHash}>
            {busy ? <LoaderCircle className="spin" size={18} /> : t('auth.confirmButton')}<ArrowRight size={18} />
          </button>
          <small>{t('auth.confirmSafety')}</small>
        </section>
      </main>
    </div>
  );
}

function AppContent() {
  const [session, setSession] = useState(undefined);
  const [recoveringPassword, setRecoveringPassword] = useState(false);
  const accessibilityPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === '1';
  const authPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('auth-preview') === '1';
  const confirmingEmail = window.location.pathname === '/confirm-signup';

  useEffect(() => {
    if (accessibilityPreview || authPreview) { setSession(null); return undefined; }
    if (!isSupabaseConfigured) { setSession(null); return undefined; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') setRecoveringPassword(true);
    });
    return () => listener.subscription.unsubscribe();
  }, [accessibilityPreview, authPreview]);

  if (accessibilityPreview) return <LearningApp user={null} />;
  if (authPreview) return <AuthScreen disableCaptcha />;
  if (!isSupabaseConfigured) return <LearningApp user={null} />;
  if (confirmingEmail) return <EmailConfirmationScreen />;
  if (session === undefined) return <LoadingScreen />;
  if (session && recoveringPassword) return <PasswordRecoveryScreen onDone={async () => { await supabase.auth.signOut(); setRecoveringPassword(false); setSession(null); }} />;
  if (!session) return <AuthScreen />;
  return <LearningApp user={session.user} onSignOut={() => supabase.auth.signOut()} />;
}

function App() {
  return <LanguageProvider><AppContent /></LanguageProvider>;
}

export default App;
