#!/usr/bin/env node
// Last-prompt line for ccstatusline (Custom Command widget, preserve colors on).
//   ▸ 23:02 <last prompt>
// Reads the Claude Code status JSON from stdin and pulls the prompt from transcript_path.
const fs = require('fs');

const RESET = '\x1b[0m';
const GRAY = '\x1b[90m';
const WHITE = '\x1b[97m';

const PROMPT_MAX_WIDTH = 80;

function parsePrompt(line) {
  if (!line.includes('"user"')) return null;
  let e;
  try { e = JSON.parse(line); } catch { return null; }
  if (e.type !== 'user' || e.isMeta || e.isSidechain || e.isCompactSummary || e.isVisibleInTranscriptOnly) return null;
  if (e.toolUseResult !== undefined) return null;
  let c = e.message && e.message.content;
  if (Array.isArray(c)) {
    if (c.some((b) => b.type === 'tool_result')) return null;
    c = c.filter((b) => b.type === 'text').map((b) => b.text).join(' ');
  }
  if (typeof c !== 'string') return null;
  const cmd = c.match(/<command-name>([\s\S]*?)<\/command-name>/);
  const bash = c.match(/<bash-input>([\s\S]*?)<\/bash-input>/);
  if (cmd) {
    const args = ((c.match(/<command-args>([\s\S]*?)<\/command-args>/) || [])[1] || '').trim();
    c = cmd[1].trim() + (args ? ' ' + args : '');
  } else if (bash) {
    c = '! ' + bash[1];
  } else if (/^\s*</.test(c)) {
    return null; // command output, caveats, system reminders, notifications
  }
  c = c.replace(/\s+/g, ' ').trim();
  return c ? { text: c, ts: e.timestamp } : null;
}

// Scan the transcript from the end, growing the window until a user prompt turns up.
function lastPrompt(path) {
  if (!path) return null;
  let fd;
  try {
    fd = fs.openSync(path, 'r');
    const size = fs.fstatSync(fd).size;
    for (let chunk = 256 * 1024; ; chunk *= 4) {
      const start = Math.max(0, size - chunk);
      const buf = Buffer.alloc(size - start);
      fs.readSync(fd, buf, 0, buf.length, start);
      const lines = buf.toString('utf8').split('\n');
      if (start > 0) lines.shift(); // first line is partial
      for (let i = lines.length - 1; i >= 0; i--) {
        const p = parsePrompt(lines[i]);
        if (p) return p;
      }
      if (start === 0) return null;
    }
  } catch {
    return null;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

function hhmm(ts) {
  const d = new Date(ts);
  if (isNaN(d)) return '';
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦\u{1F300}-\u{1FAFF}]/u;
const charWidth = (ch) => (WIDE.test(ch) ? 2 : 1);

function truncate(s, max) {
  let total = 0;
  for (const ch of s) total += charWidth(ch);
  if (total <= max) return s;
  let w = 0;
  let out = '';
  for (const ch of s) {
    const cw = charWidth(ch);
    if (w + cw > max - 1) break;
    w += cw;
    out += ch;
  }
  return out + '…';
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(raw.replace(/^﻿/, '')); } catch {}
  const prompt = lastPrompt(data.transcript_path);
  if (!prompt) return;
  const time = hhmm(prompt.ts);
  process.stdout.write(GRAY + '▸' + (time ? ' ' + time : '') + RESET + ' ' + WHITE + truncate(prompt.text, PROMPT_MAX_WIDTH) + RESET);
});
