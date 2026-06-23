const fs = require('fs');
const pdfParse = require('pdf-parse');

async function main() {
  const pdfBuffer = fs.readFileSync('./gita.pdf');
  const data = await pdfParse(pdfBuffer);

  console.log(`Pages: ${data.numpages}`);
  console.log(`Characters: ${data.text.length}`);
  console.log(`First 5000 chars:\n${data.text.slice(0, 5000)}`);
  console.log(`\n--- MIDDLE (page ~400) ---\n${data.text.slice(400000, 405000)}`);
  console.log(`\n--- LAST 3000 chars ---\n${data.text.slice(-3000)}`);

  fs.writeFileSync('./gita_full_text.txt', data.text);
  console.log('\nSaved full text to gita_full_text.txt');
}

main().catch(console.error);
