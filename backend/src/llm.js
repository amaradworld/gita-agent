import { detectEmotions, findBestVerse, gitaVerses } from './gita.js';

const LLM_API = process.env.LLM_API || 'openai';
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

RESPONSE FORMAT:
1. Acknowledge their emotion (1 sentence)
2. Share relevant Gita wisdom (1-2 sentences with verse reference)
3. Practical, loving advice (1-2 sentences)
4. A gentle closing thought`;

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
      max_tokens: 500,
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
        generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
      }),
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function generateResponse(userMessage, chatHistory = []) {
  const emotions = detectEmotions(userMessage);
  const verse = findBestVerse(emotions);

  const verseContext = `
RELEVANT GITA VERSE:
Chapter ${verse.chapter}, Verse ${verse.verse}
Sanskrit: ${verse.sanskrit}
Translation: "${verse.translation}"
Explanation: ${verse.explanation}
Related Advice: ${verse.advice}

Detected emotions: ${emotions.join(', ')}
`;

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
    // Fallback: generate without LLM
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

function generateFallbackResponse(userMessage, emotions, verse) {
  const chapterText = verse.chapter <= 9 ? thisChapterNames[verse.chapter - 1] : otherChapterNames[verse.chapter - 10] || '';

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
