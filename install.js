#!/usr/bin/env node
// Installs this statusline: ccstatusline + layout + last-prompt script.
// Existing files are backed up to <file>.bak before being overwritten.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const home = os.homedir();
const scriptDest = path.join(home, '.claude', 'statusline.js');
const layoutDest = path.join(home, '.config', 'ccstatusline', 'settings.json');
const claudeSettings = path.join(home, '.claude', 'settings.json');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) fs.copyFileSync(file, file + '.bak');
  fs.writeFileSync(file, content);
  console.log('  wrote ' + file);
}

// Parse settings up front so a malformed file stops us before anything is written.
const settings = fs.existsSync(claudeSettings) ? readJson(claudeSettings) : {};

try {
  execSync(process.platform === 'win32' ? 'where ccstatusline' : 'command -v ccstatusline', { stdio: 'ignore' });
} catch {
  console.log('Installing ccstatusline (npm -g)...');
  execSync('npm install -g ccstatusline', { stdio: 'inherit' });
}

write(scriptDest, fs.readFileSync(path.join(__dirname, 'statusline.js'), 'utf8'));

// ccstatusline runs the command through the shell as-is (no ~ expansion on Windows), so use an absolute path.
const layout = readJson(path.join(__dirname, 'ccstatusline.json'));
layout.lines.flat().find((w) => w.id === 'prompt').commandPath =
  'node "' + scriptDest.split(path.sep).join('/') + '"';
write(layoutDest, JSON.stringify(layout, null, 2) + '\n');

settings.statusLine = { type: 'command', command: 'ccstatusline', padding: 0, refreshInterval: 60 };
write(claudeSettings, JSON.stringify(settings, null, 2) + '\n');

console.log('Done. Restart Claude Code to see the new statusline.');
