import { vocabularyBank } from './vocabularyBank.js';
import { workbookVocabulary } from './workbookVocabulary.js';

const articlePattern = /^(der|die|das)\s+(.+)$/i;

function articleHint(article, noun) {
  const lower = noun.toLocaleLowerCase('de');
  if (article === 'die' && /(ung|heit|keit|schaft|ion|tät|ik|ei)$/.test(lower)) return 'Viele Nomen mit dieser Endung sind feminin.';
  if (article === 'das' && /(chen|lein|ment|um)$/.test(lower)) return 'Viele Nomen mit dieser Endung sind neutral.';
  if (article === 'der' && /(ling|ismus)$/.test(lower)) return 'Viele Nomen mit dieser Endung sind maskulin.';
  return `Lerne das Nomen immer als Einheit: ${article} ${noun}.`;
}

const seen = new Set();

export const articleBank = [...vocabularyBank, ...workbookVocabulary].flatMap(item => {
  const match = item.word.trim().match(articlePattern);
  if (!match) return [];
  const article = match[1].toLocaleLowerCase('de');
  const noun = match[2].trim();
  const key = `${article} ${noun}`.toLocaleLowerCase('de');
  if (seen.has(key)) return [];
  seen.add(key);
  return [{
    id: `article-${item.id}`,
    vocabularyId: item.id,
    article,
    noun,
    word: `${article} ${noun}`,
    detail: item.detail ?? '',
    example: item.example ?? '',
    chapter: item.chapter ?? item.topic,
    sourcePage: item.sourcePage,
    hint: articleHint(article, noun)
  }];
});

export const articleOptions = ['der', 'die', 'das'];
