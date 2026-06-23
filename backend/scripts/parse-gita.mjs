import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PDFParser = require('pdf2json');

function parsePdf(path, label) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== Parsing ${label} ===`);
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', err => reject(err.parserError));
    pdfParser.on('pdfParser_dataReady', pdfData => {
      const text = pdfParser.getRawTextContent();
      const outPath = `./${label}.txt`;
      fs.writeFileSync(outPath, text);
      console.log(`Pages: ${pdfData.Pages?.length}, Chars: ${text.length}`);
      console.log(`Saved: ${outPath}`);
      resolve({ text, pages: pdfData.Pages?.length || 0 });
    });

    pdfParser.loadPDF(path);
  });
}

const [p1, p2] = await Promise.all([
  parsePdf('./gita.pdf', 'tirumala_gita'),
  parsePdf('./gita-iskcon.pdf', 'iskcon_gita'),
]);

console.log(`\nTirumala: ${p1.text.length} chars`);
console.log(`ISKCON: ${p2.text.length} chars`);

console.log('\n--- TIRUMALA FIRST 4000 ---');
console.log(p1.text.slice(0, 4000));
console.log('\n--- ISKCON FIRST 4000 ---');
console.log(p2.text.slice(0, 4000));

// Show sample chapter structure
console.log('\n--- TIRUMALA MIDDLE SAMPLE ---');
const mid = Math.floor(p1.text.length / 2);
console.log(p1.text.slice(mid, mid + 3000));
