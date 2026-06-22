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
  const responses = {
    anxiety: `I hear you, and your feelings are completely valid. Anxiety can feel overwhelming, but remember what Lord Krishna says in Chapter ${verse.chapter}, Verse ${verse.verse}:

"${verse.translation}"

${verse.explanation}

${verse.advice}`,
    sadness: `Your pain is real, and I want you to know that it's okay to feel this way. The Bhagavad Gita teaches us in Chapter ${verse.chapter}, Verse ${verse.verse}:

"${verse.translation}"

${verse.explanation}

${verse.advice}`,
    anger: `I understand your frustration. Anger is a powerful emotion, but it can cloud our wisdom. Krishna teaches in Chapter ${verse.chapter}, Verse ${verse.verse}:

"${verse.translation}"

${verse.explanation}

${verse.advice}`,
    loneliness: `You are not alone, even when it feels that way. The Gita reminds us in Chapter ${verse.chapter}, Verse ${verse.verse}:

"${verse.translation}"

${verse.explanation}

${verse.advice}`,
    default: `Thank you for sharing with me. Let me offer you some wisdom from the Bhagavad Gita, Chapter ${verse.chapter}, Verse ${verse.verse}:

"${verse.translation}"

${verse.explanation}

${verse.advice}`,
  };

  const primaryEmotion = emotions[0] || 'default';
  return responses[primaryEmotion] || responses.default;
}
