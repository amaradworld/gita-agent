import fs from 'fs';

// Read ISKCON text (the authoritative As It Is with commentary)
const raw = fs.readFileSync('./iskcon_gita.txt', 'utf8');

// Clean: join broken words, collapse whitespace
let cleaned = raw
  .replace(/(\w)-\n(\w)/g, '$1$2')
  .replace(/\t/g, ' ')
  .replace(/ {3,}/g, '  ');

// Join broken words: if a line ends mid-word (no period/comma/colon), join with next
const lines = cleaned.split('\n');
const joined = [];
let buffer = '';
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed) {
    if (buffer) { joined.push(buffer); buffer = ''; }
    joined.push('');
    continue;
  }
  // If buffer exists and current line starts with lowercase, it's a continuation
  if (buffer && /^[a-z]/.test(trimmed)) {
    buffer += trimmed;
  } else if (buffer && trimmed.length < 4 && !/[.!?;:]$/.test(buffer)) {
    buffer += trimmed;
  } else {
    if (buffer) joined.push(buffer);
    buffer = trimmed;
  }
}
if (buffer) joined.push(buffer);

const fullText = joined.join('\n').replace(/\n{3,}/g, '\n\n');

// Build chunks of ~4000 chars with ~500 char overlap for RAG
const CHUNK_SIZE = 4000;
const OVERLAP = 500;
const chunks = [];
let pos = 0;

while (pos < fullText.length) {
  const end = Math.min(pos + CHUNK_SIZE, fullText.length);
  // Try to break at paragraph or sentence boundary
  let breakPos = end;
  if (end < fullText.length) {
    const lastPara = fullText.lastIndexOf('\n\n', end);
    const lastSent = fullText.lastIndexOf('. ', end);
    breakPos = Math.max(lastPara, lastSent, end - 500);
  }
  const chunk = fullText.slice(pos, breakPos).trim();
  if (chunk.length > 200) {
    chunks.push(chunk);
  }
  pos = breakPos - OVERLAP;
  if (pos < 0) pos = 0;
  if (breakPos === end) break; // reached end
}

console.log(`Cleaned text: ${fullText.length} chars`);
console.log(`Chunks: ${chunks.length}`);
console.log(`First chunk preview: ${chunks[0].slice(0, 200)}`);

// Also build an inverted index for keyword search
const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
  'might', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and', 'or', 'if',
  'while', 'that', 'this', 'these', 'those', 'it', 'its', 'he', 'she', 'they', 'them',
  'his', 'her', 'their', 'what', 'which', 'who', 'whom', 'my', 'your', 'our', 'me',
  'him', 'us', 'about', 'up', 'also', 'even', 'now', 'man', 'one', 'like', 'much',
  'know', 'take', 'come', 'make', 'made', 'say', 'said', 'give', 'let', 'go', 'see',
  'tell', 'think', 'good', 'well', 'way', 'back', 'much', 'still']);

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

// Build chunk index
const chunkIndex = chunks.map((chunk, id) => {
  const tokens = tokenize(chunk);
  const freq = {};
  for (const t of tokens) { freq[t] = (freq[t] || 0) + 1; }
  return { id, freq, text: chunk };
});

function searchChunks(query, topK = 5) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scores = chunkIndex.map(ci => {
    let score = 0;
    for (const qt of queryTokens) {
      if (ci.freq[qt]) score += ci.freq[qt];
    }
    return { id: ci.id, score, text: ci.text };
  });

  return scores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// Test search
console.log('\n--- TEST SEARCH: "duty action without attachment" ---');
const results = searchChunks('duty action without attachment results karma');
results.forEach(r => {
  console.log(`Chunk ${r.id} (score ${r.score}): ${r.text.slice(0, 150)}...`);
});

console.log('\n--- TEST SEARCH: "who is Krishna" ---');
const results2 = searchChunks('who is Krishna God supreme');
results2.forEach(r => {
  console.log(`Chunk ${r.id} (score ${r.score}): ${r.text.slice(0, 150)}...`);
});

// Save chunks and index
fs.writeFileSync('./gita_rag_chunks.json', JSON.stringify(chunks));
fs.writeFileSync('./gita_rag_index.json', JSON.stringify(chunkIndex.map(c => ({ id: c.id, freq: c.freq }))));
console.log('\nSaved gita_rag_chunks.json and gita_rag_index.json');
console.log(`Total chunks: ${chunks.length}`);
