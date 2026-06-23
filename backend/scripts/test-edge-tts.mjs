import { randomUUID } from 'crypto';
import { default as WebSocket } from 'ws';
import fs from 'fs';

const text = 'Namaste! The Bhagavad Gita teaches us about the eternal soul. Chapter 2, Verse 20.';
const voice = 'en-IN-PrabhatNeural';
const requestId = randomUUID();
const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');

const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-IN"><voice name="${voice}"><prosody rate="-5%" pitch="-2Hz">${text}</prosody></voice></speak>`;

const connectUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=D6A5B880345141A3A59E2D83D2E35263&ConnectionId=${randomUUID()}`;

const ws = new WebSocket(connectUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
const audioChunks = [];

ws.on('open', () => {
  ws.send(`Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataOptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-96kbitrate-mono-mp3"}}}}`);
  ws.send(`X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${timestamp}Z\r\nPath:ssml\r\n\r\n${ssml}`);
});

ws.on('message', (data) => {
  if (Buffer.isBuffer(data)) {
    if (data.length > 2) {
      const headerLen = data.readUInt16BE(0);
      if (data.length > headerLen + 2) audioChunks.push(data.slice(headerLen + 2));
    }
  } else {
    if (data.toString().includes('Path:turn.end')) {
      const audio = Buffer.concat(audioChunks);
      fs.writeFileSync('./test_edge_tts.mp3', audio);
      console.log('Edge TTS audio:', audio.length, 'bytes');
      ws.close();
      process.exit(0);
    }
  }
});

ws.on('error', (e) => { console.error('WS error:', e.message); process.exit(1); });
setTimeout(() => { console.error('Timeout'); process.exit(1); }, 15000);
