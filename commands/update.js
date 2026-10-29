const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const isOwnerOrSudo = require('../lib/isOwner');

function run(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
            if (err) return reject(new Error((stderr || stdout || err.message || '').toString()));
            resolve((stdout || '').toString());
        });
    });
}

async function hasGitRepo() {
    const gitDir = path.join(process.cwd(), '.git');
    if (!fs.existsSync(gitDir)) return false;
    try { await run('git --version'); return true; } catch { return false; }
}

async function updateViaGit() {
    const oldRev = (await run('git rev-parse HEAD').catch(() => 'unknown')).trim();
    await run('git fetch --all --prune');
    const newRev = (await run('git rev-parse origin/main')).trim();
    await run(`git reset --hard ${newRev}`);
    await run('git clean -fd');
}

function downloadFile(url, dest, visited = new Set()) {
    return new Promise((resolve, reject) => {
        try {
            if (visited.has(url) || visited.size > 5) return reject(new Error('Too many redirects'));
            visited.add(url);
            const client = url.startsWith('https://') ? require('https') : require('http');
            const req = client.get(url, { headers: { 'User-Agent': 'Bot-Updater', 'Accept': '*/*' } }, res => {
                if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                    const location = res.headers.location;
                    if (!location) return reject(new Error(`HTTP ${res.statusCode}`));
                    res.resume();
                    return downloadFile(new URL(location, url).toString(), dest, visited).then(resolve).catch(reject);
                }
                if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
                const file = fs.createWriteStream(dest);
                res.pipe(file);
                file.on('finish', () => file.close(resolve));
                file.on('error', err => { try { file.close(() => {}); } catch {} fs.unlink(dest, () => reject(err)); });
            });
            req.on('error', err => { fs.unlink(dest, () => reject(err)); });
        } catch (e) { reject(e); }
    });
}

async function extractZip(zipPath, outDir) {
    if (process.platform === 'win32') {
        await run(`powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir.replace(/\\/g, '/')}' -Force"`);
        return;
    }
    try { await run('command -v unzip'); await run(`unzip -o '${zipPath}' -d '${outDir}'`); return; } catch {}
    try { await run('command -v 7z'); await run(`7z x -y '${zipPath}' -o'${outDir}'`); return; } catch {}
    throw new Error("No system unzip tool found.");
}

function copyRecursive(src, dest, ignore = []) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
        if (ignore.includes(entry)) continue;
        const s = path.join(src, entry);
        const d = path.join(dest, entry);
        if (fs.lstatSync(s).isDirectory()) copyRecursive(s, d, ignore);
        else fs.copyFileSync(s, d);
    }
}

async function updateViaZip(sock, chatId, message, zipOverride) {
    const zipUrl = (zipOverride || settings.updateZipUrl || process.env.UPDATE_ZIP_URL || '').trim();
    if (!zipUrl) throw new Error('No ZIP URL configured.');
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const zipPath = path.join(tmpDir, 'update.zip');
    await downloadFile(zipUrl, zipPath);
    const extractTo = path.join(tmpDir, 'update_extract');
    if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
    await extractZip(zipPath, extractTo);

    const [root] = fs.readdirSync(extractTo).map(n => path.join(extractTo, n));
    const srcRoot = fs.existsSync(root) && fs.lstatSync(root).isDirectory() ? root : extractTo;

    const ignore = ['node_modules', '.git', 'session', 'tmp', 'data', 'baileys_store.json'];
    copyRecursive(srcRoot, process.cwd(), ignore);
    
    try { fs.rmSync(extractTo, { recursive: true, force: true }); } catch {}
    try { fs.rmSync(zipPath, { force: true }); } catch {}
}

async function updateCommand(sock, chatId, message, zipOverride) {
    const senderId = message.key.participant || message.key.remoteJid;
    const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
    
    if (!message.key.fromMe && !isOwner) {
        return await sock.sendMessage(chatId, { text: 'Only bot owner or sudo can use .update' }, { quoted: message });
    }
    
    try {
        // STOP FILE WATCHER RESTARTS
        global.IS_UPDATING = true; 
        
        await sock.sendMessage(chatId, { text: '🔄 Updating the bot, please wait…' }, { quoted: message });
        
        if (await hasGitRepo()) {
            await updateViaGit();
            await run('npm install --no-audit --no-fund');
        } else {
            await updateViaZip(sock, chatId, message, zipOverride);
        }
        
        await sock.sendMessage(chatId, { text: `✅ Update done. The panel will restart the bot shortly...` }, { quoted: message });
        
        // Wait for message to send, then force a clean exit
        setTimeout(() => {
            process.kill(process.pid, 'SIGTERM'); // Clean shutdown signal for Katabump
        }, 3000);

    } catch (err) {
        global.IS_UPDATING = false; 
        await sock.sendMessage(chatId, { text: `❌ Update failed:\n${err.message}` }, { quoted: message });
    }
}

module.exports = updateCommand;