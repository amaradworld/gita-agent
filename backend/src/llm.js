import {
  detectEmotions,
  findBestVerse,
  findVerseByChapterVerse,
  findVersesByChapter,
  parseChapterVerse,
  isVerseRequest,
  isChapterRequest,
  chapterNames,
  gitaVerses
} from './gita.js';

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

const SYSTEM_PROMPT = `You are a wise, compassionate spiritual guide rooted in the Bhagavad Gita. You speak with the warmth of a loving friend and the depth of an ancient sage.

CORE RULES:
- Always respond with empathy and compassion
- Reference specific Gita verses when relevant (chapter and verse number)
- Never judge or lecture — only guide and comfort
- Use simple, modern language mixed with Sanskrit wisdom
- Keep responses concise (2-4 paragraphs)
- If someone expresses suicidal thoughts, respond with deep compassion, remind them their soul is eternal, and gently suggest reaching out to a helpline (iConnect India: 9152987821)
- Never dismiss emotions — validate them first, then offer Gita wisdom
- Sometimes just listen and acknowledge pain without offering solutions
- End with a gentle, uplifting thought or question
- When asked about a specific chapter or verse, provide detailed explanation of that verse with its context and meaning
- When asked about a chapter, summarize the key teachings of that chapter

RESPONSE FORMAT:
1. Acknowledge their emotion (1 sentence)
2. Share relevant Gita wisdom (1-2 sentences with verse reference)
3. Practical, loving advice (1-2 sentences)
4. A gentle closing thought or question`;

async function callOpenAI(messages) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 600,
      temperature: 0.7,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callGemini(messages) {
  const contents = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
      }),
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function generateResponse(userMessage, chatHistory = []) {
  const emotions = detectEmotions(userMessage);
  const verse = findBestVerse(emotions);

  // Check if user is asking for a specific verse or chapter
  if (isVerseRequest(userMessage)) {
    const parsed = parseChapterVerse(userMessage);

    // Specific verse requested: "chapter 4 verse 7" or "4.7"
    if (parsed && parsed.chapter && parsed.verse) {
      const specificVerse = findVerseByChapterVerse(parsed.chapter, parsed.verse);
      if (specificVerse) {
        const chapterInfo = chapterNames[parsed.chapter] || {};
        return buildVerseResponse(
          `You asked for Chapter ${parsed.chapter}, Verse ${parsed.verse} — ${chapterInfo.english || ''} (${chapterInfo.subtitle || ''}). Here it is:`,
          specificVerse,
          []
        );
      } else {
        // Verse not in our database — search nearby verses
        const chapterVerses = findVersesByChapter(parsed.chapter);
        if (chapterVerses.length > 0) {
          return buildVerseResponse(
            `I don't have Verse ${parsed.verse} of Chapter ${parsed.chapter} in my collection, but here is a verse from that chapter that may help:`,
            chapterVerses[0],
            []
          );
        }
        return {
          message: `I don't have Chapter ${parsed.chapter}, Verse ${parsed.verse} in my collection. The Bhagavad Gita has 700 verses across 18 chapters. My collection covers the most important verses. Try asking about a specific topic, and I'll find the best verse for you.`,
          verse: { chapter: parsed.chapter, verse: parsed.verse, sanskrit: '', translation: 'Verse not in collection', explanation: '', advice: '' },
          emotions,
        };
      }
    }

    // Chapter requested without specific verse
    if (parsed && parsed.chapter && !parsed.verse) {
      const chapterVerses = findVersesByChapter(parsed.chapter);
      const chapterInfo = chapterNames[parsed.chapter] || {};
      if (chapterVerses.length > 0) {
        // Return first verse of the chapter
        return buildVerseResponse(
          `Here is Chapter ${parsed.chapter} — ${chapterInfo.english || ''} (${chapterInfo.subtitle || ''}). This chapter has ${chapterVerses.length} verse(s) in my collection. Here is the first one:`,
          chapterVerses[0],
          chapterVerses.slice(1) // additional verses for context
        );
      }
      return {
        message: `I don't have Chapter ${parsed.chapter} in my collection yet. The chapter is called "${chapterInfo.english || 'Unknown'}" (${chapterInfo.subtitle || ''}). Try asking about a topic, and I'll find the best verse from the Gita for you.`,
        verse: { chapter: parsed.chapter, verse: 1, sanskrit: '', translation: 'Chapter not yet in collection', explanation: '', advice: '' },
        emotions,
      };
    }
  }

  // Regular emotional query — use emotion-based verse matching
  const verseContext = `
RELEVANT GITA VERSE:
Chapter ${verse.chapter}, Verse ${verse.verse}
Sanskrit: ${verse.sanskrit}
Translation: "${verse.translation}"
Explanation: ${verse.explanation}
Related Advice: ${verse.advice}

Detected emotions: ${emotions.join(', ')}`;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT + '\n\n' + verseContext },
    ...chatHistory.slice(-6),
    { role: 'user', content: userMessage },
  ];

  let aiResponse = '';

  if (OPENAI_KEY) {
    aiResponse = await callOpenAI(messages);
  } else if (GEMINI_KEY) {
    aiResponse = await callGemini(messages);
  } else {
    aiResponse = generateFallbackResponse(userMessage, emotions, verse);
  }

  return {
    message: aiResponse,
    verse: {
      chapter: verse.chapter,
      verse: verse.verse,
      sanskrit: verse.sanskrit,
      translation: verse.translation,
      explanation: verse.explanation,
    },
    emotions,
  };
}

function buildVerseResponse(opener, verse, additionalVerses = []) {
  let message = `${opener}

**Chapter ${verse.chapter}, Verse ${verse.verse}**
*Sanskrit:* ${verse.sanskrit}

*Translation:* "${verse.translation}"

${verse.explanation}

${verse.advice}`;

  if (additionalVerses.length > 0) {
    message += '\n\n---\n\nHere are more verses from this chapter:\n';
    for (const v of additionalVerses) {
      message += `\n**Verse ${verse.chapter}.${v.verse}**: "${v.translation}"\n`;
    }
  }

  return {
    message,
    verse: {
      chapter: verse.chapter,
      verse: verse.verse,
      sanskrit: verse.sanskrit,
      translation: verse.translation,
      explanation: verse.explanation,
    },
    emotions: [],
  };
}

function generateFallbackResponse(userMessage, emotions, verse) {
  const openers = {
    anxiety: [
      `I feel you. Anxiety can be overwhelming, but you are not alone in this.`,
      `Your anxiety is valid. Let me share some wisdom that has calmed millions of hearts.`,
      `I hear the worry in your words. Krishna has something beautiful to say about this.`,
    ],
    sadness: [
      `I can feel the weight of your sadness. Please know — it's okay to cry.`,
      `Your sadness is real, and I won't minimize it. But let me offer you some Gita wisdom.`,
      `Pain like yours needs to be felt, not avoided. Here is what the Gita teaches.`,
    ],
    anger: [
      `I understand that fire inside you. Anger is powerful, but it can burn you.`,
      `Your anger makes sense. But Krishna warns us about letting it cloud our wisdom.`,
      `Frustration is a sign you care deeply. Here's how to channel it wisely.`,
    ],
    loneliness: [
      `You feel alone, but I want you to know — the divine is always with you.`,
      `Loneliness can feel like the whole world has forgotten you. But you are never truly alone.`,
      `Even in your darkest moment of isolation, the universe holds you.`,
    ],
    confusion: [
      `Feeling lost is not a sign of weakness — it means you are seeking truth.`,
      `Even Arjuna was confused in the battlefield. Krishna's advice applies to you too.`,
      `Confusion is the doorway to clarity. Let me guide you through it.`,
    ],
    fear: [
      `Fear is natural, but it doesn't have to control you.`,
      `I sense your fear. Krishna has a powerful message about facing our deepest fears.`,
      `Even the bravest warriors feel fear. What matters is how we respond to it.`,
    ],
    love: [
      `What a beautiful heart you have. Love is the highest form of worship.`,
      `Your capacity to love is sacred. The Gita celebrates this.`,
      `Love is the language of the divine. Let me share what Krishna says about it.`,
    ],
    default: [
      `Thank you for sharing with me. Let me offer you some timeless wisdom.`,
      `I hear you. Here is what the Bhagavad Gita teaches about this.`,
      `Your words carry deep meaning. Let me share a verse that speaks to your heart.`,
    ],
  };

  const openerList = openers[emotions[0]] || openers.default;
  const opener = openerList[Math.floor(Math.random() * openerList.length)];

  return `${opener}

From the Bhagavad Gita, Chapter ${verse.chapter}, Verse ${verse.verse}:
"${verse.translation}"

${verse.explanation}

${verse.advice}`;
}
