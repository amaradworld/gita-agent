import fs from 'fs';

const text = fs.readFileSync('./iskcon_gita.txt', 'utf8');

// Clean up fragmented text by joining broken words
const cleaned = text
  .replace(/(\w)-\n(\w)/g, '$1$2')     // hyphenated line breaks
  .replace(/(\w)\n(\w)/g, '$1 $2')      // join broken words across lines
  .replace(/\n{3,}/g, '\n\n')           // collapse multiple blank lines
  .replace(/\t/g, ' ')                  // tabs to spaces
  .replace(/ {3,}/g, '  ');             // collapse spaces

// Split into overlapping chunks of ~2000 chars for RAG
const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;
const chunks = [];

for (let i = 0; i < cleaned.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
  const chunk = cleaned.slice(i, i + CHUNK_SIZE).trim();
  if (chunk.length > 100) {
    chunks.push({
      id: chunks.length,
      text: chunk,
      startChar: i,
    });
  }
}

console.log(`Cleaned text: ${cleaned.length} chars`);
console.log(`Chunks created: ${chunks.length}`);
console.log(`First chunk preview: ${chunks[0].text.slice(0, 300)}`);

// Save chunks for RAG
fs.writeFileSync('./gita_chunks.json', JSON.stringify(chunks, null, 2));
console.log('Saved gita_chunks.json');
