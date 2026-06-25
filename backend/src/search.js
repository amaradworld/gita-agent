// ============================================================
// GITA GYAN — ENHANCED SEARCH
// Full-text search across verses, scenarios, commentaries, topics
// ============================================================

import { gitaVerses, searchGitaBook } from './gita.js';
import { VERSE_SCENARIOS, TOPIC_VERSES, MOOD_VERSES } from './verseData.js';

// Build a search index from all verse data
const searchIndex = new Map();

function buildIndex() {
  // Index verse translations and explanations
  for (const verse of gitaVerses) {
    const key = `${verse.chapter}.${verse.verse}`;
    const tokens = new Set();
    const text = `${verse.translation} ${verse.explanation || ''} ${verse.advice || ''} ${verse.sanskrit || ''}`.toLowerCase();
    for (const word of text.split(/[\s,.\-!?;:'"()]+/)) {
      if (word.length > 2) tokens.add(word);
    }
    // Also index emotions
    for (const emotion of (verse.emotions || [])) {
      tokens.add(emotion.toLowerCase());
    }
    searchIndex.set(key, {
      chapter: verse.chapter,
      verse: verse.verse,
      tokens,
      verse,
    });
  }

  // Index scenario data
  for (const [key, data] of Object.entries(VERSE_SCENARIOS)) {
    const entry = searchIndex.get(key) || {
      chapter: parseInt(key.split('.')[0]),
      verse: parseInt(key.split('.')[1]),
      tokens: new Set(),
      verse: null,
    };
    for (const scenario of (data.scenarios || [])) {
      entry.tokens.add(scenario.toLowerCase());
    }
    if (data.lifeArea) entry.tokens.add(data.lifeArea.toLowerCase());
    if (data.practicalAdvice) {
      for (const word of data.practicalAdvice.toLowerCase().split(/[\s,.\-!?;:'"()]+/)) {
        if (word.length > 2) entry.tokens.add(word);
      }
    }
    if (data.modernApplication) {
      for (const word of data.modernApplication.toLowerCase().split(/[\s,.\-!?;:'"()]+/)) {
        if (word.length > 2) entry.tokens.add(word);
      }
    }
    entry.scenarioData = data;
    searchIndex.set(key, entry);
  }

  // Index topic data
  for (const [topic, verses] of Object.entries(TOPIC_VERSES)) {
    for (const verseKey of verses) {
      const entry = searchIndex.get(verseKey);
      if (entry) {
        entry.tokens.add(topic.toLowerCase());
      }
    }
  }

  // Index mood data
  for (const [mood, verses] of Object.entries(MOOD_VERSES)) {
    for (const verseKey of verses) {
      const entry = searchIndex.get(verseKey);
      if (entry) {
        entry.tokens.add(mood.toLowerCase());
      }
    }
  }

  return searchIndex;
}

// Build on module load
buildIndex();

// Enhanced search function
export function enhancedSearch(query, options = {}) {
  const { limit = 10, minScore = 1 } = options;
  const queryLower = query.toLowerCase().trim();
  const queryTokens = queryLower.split(/[\s,.\-!?;:'"()]+/).filter(t => t.length > 2);

  if (queryTokens.length === 0) return [];

  const results = [];

  for (const [key, entry] of searchIndex.entries()) {
    let score = 0;
    const matchedTokens = [];

    for (const qt of queryTokens) {
      // Exact token match
      if (entry.tokens.has(qt)) {
        score += 2;
        matchedTokens.push(qt);
      }
      // Partial match
      for (const token of entry.tokens) {
        if (token.includes(qt) || qt.includes(token)) {
          score += 1;
          matchedTokens.push(token);
        }
      }
    }

    // Boost for exact phrase match in verse text
    if (entry.verse) {
      const verseText = `${entry.verse.translation || ''} ${entry.verse.explanation || ''}`.toLowerCase();
      if (verseText.includes(queryLower)) {
        score += 5;
      }
    }

    // Boost for scenario data match
    if (entry.scenarioData) {
      if (entry.scenarioData.practicalAdvice?.toLowerCase().includes(queryLower)) {
        score += 3;
      }
      if (entry.scenarioData.modernApplication?.toLowerCase().includes(queryLower)) {
        score += 2;
      }
    }

    if (score >= minScore) {
      results.push({
        key,
        chapter: entry.chapter,
        verse: entry.verse,
        score,
        matchedTokens: [...new Set(matchedTokens)].slice(0, 5),
        verseData: entry.verse,
        scenarioData: entry.scenarioData || null,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

// Autocomplete suggestions
export function getSearchSuggestions(query) {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  const suggestions = new Set();

  // From scenarios
  for (const [key, data] of Object.entries(VERSE_SCENARIOS)) {
    for (const scenario of (data.scenarios || [])) {
      if (scenario.includes(q)) suggestions.add(scenario);
    }
    if (data.lifeArea?.toLowerCase().includes(q)) suggestions.add(data.lifeArea);
  }

  // From topics
  for (const topic of Object.keys(TOPIC_VERSES)) {
    if (topic.includes(q)) suggestions.add(topic);
  }

  // From moods
  for (const mood of Object.keys(MOOD_VERSES)) {
    if (mood.includes(q)) suggestions.add(mood);
  }

  // From verse text
  for (const verse of gitaVerses) {
    const text = `${verse.translation || ''} ${verse.explanation || ''}`.toLowerCase();
    if (text.includes(q)) {
      suggestions.add(`Chapter ${verse.chapter} Verse ${verse.verse}`);
    }
  }

  return [...suggestions].slice(0, 8);
}
