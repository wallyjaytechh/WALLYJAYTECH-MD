const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const settings = require('../settings');
const isOwnerOrSudo = require('../lib/isOwner');

// Channel info for professional branding
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420618370733@newsletter',
            newsletterName: 'WALLYJAYTECH-MD BOTS',
            serverMessageId: -1
        }
    }
};

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
    try {
        await run('git --version');
        return true;
    } catch {
        return false;
    }
}

async function updateViaGit() {
    const oldRev = (await run('git rev-parse HEAD').catch(() => 'unknown')).trim();
    await run('git fetch --all --prune');
    const newRev = (await run('git rev-parse origin/main')).trim();
    const alreadyUpToDate = oldRev === newRev;
    const commits = alreadyUpToDate ? '' : await run(`git log --pretty=format:"%h %s (%an)" ${oldRev}..${newRev}`).catch(() => '');
    const files = alreadyUpToDate ? '' : await run(`git diff --name-status ${oldRev} ${newRev}`).catch(() => '');
    await run(`git reset --hard ${newRev}`);
    await run('git clean -fd');
    return { oldRev, newRev, alreadyUpToDate, commits, files };
}

function downloadFile(url, dest, visited = new Set()) {
    return new Promise((resolve, reject) => {
        try {
            if (visited.has(url) || visited.size > 5) {
                return reject(new Error('Too many redirects'));
            }
            visited.add(url);

            const useHttps = url.startsWith('https://');
            const client = useHttps ? require('https') : require('http');
            const req = client.get(url, {
                headers: {
                    'User-Agent': 'WALLYJAYTECH-MD-Updater/1.0',
                    'Accept': '*/*'
                }
            }, res => {
                if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                    const location = res.headers.location;
                    if (!location) return reject(new Error(`HTTP ${res.statusCode} without Location`));
                    const nextUrl = new URL(location, url).toString();
                    res.resume();
                    return downloadFile(nextUrl, dest, visited).then(resolve).catch(reject);
                }

                if (res.statusCode !== 200) {
                    return reject(new Error(`HTTP ${res.statusCode}`));
                }

                const file = fs.createWriteStream(dest);
                res.pipe(file);
                file.on('finish', () => file.close(resolve));
                file.on('error', err => {
                    try { file.close(() => {}); } catch {}
                    fs.unlink(dest, () => reject(err));
                });
            });
            req.on('error', err => {
                fs.unlink(dest, () => reject(err));
            });
        } catch (e) {
            reject(e);
        }
    });
}

async function extractZip(zipPath, outDir) {
    if (process.platform === 'win32') {
        const cmd = `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir.replace(/\\/g, '/')}' -Force"`;
        await run(cmd);
        return;
    }
    try {
        await run('command -v unzip');
        await run(`unzip -o '${zipPath}' -d '${outDir}'`);
        return;
    } catch {}
    try {
        await run('command -v 7z');
        await run(`7z x -y '${zipPath}' -o'${outDir}'`);
        return;
    } catch {}
    try {
        await run('busybox unzip -h');
        await run(`busybox unzip -o '${zipPath}' -d '${outDir}'`);
        return;
    } catch {}
    throw new Error("No system unzip tool found (unzip/7z/busybox). Git mode is recommended on this panel.");
}

function copyRecursive(src, dest, ignore = [], relative = '', outList = []) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
        if (ignore.includes(entry)) continue;
        const s = path.join(src, entry);
        const d = path.join(dest, entry);
        const stat = fs.lstatSync(s);
        if (stat.isDirectory()) {
            copyRecursive(s, d, ignore, path.join(relative, entry), outList);
        } else {
            fs.copyFileSync(s, d);
            if (outList) outList.push(path.join(relative, entry).replace(/\\/g, '/'));
        }
    }
}

async function updateViaZip(sock, chatId, message, zipOverride) {
    const zipUrl = (zipOverride || settings.updateZipUrl || process.env.UPDATE_ZIP_URL || '').trim();
    if (!zipUrl) {
        throw new Error('No ZIP URL configured. Set settings.updateZipUrl or UPDATE_ZIP_URL env.');
    }
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const zipPath = path.join(tmpDir, 'update.zip');
    await downloadFile(zipUrl, zipPath);
    const extractTo = path.join(tmpDir, 'update_extract');
    if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
    await extractZip(zipPath, extractTo);

    const [root] = fs.readdirSync(extractTo).map(n => path.join(extractTo, n));
    const srcRoot = fs.existsSync(root) && fs.lstatSync(root).isDirectory() ? root : extractTo;

    const ignore = ['node_modules', '.git', 'session', 'tmp', 'temp', 'data', 'baileys_store.json'];
    const copied = [];
    let preservedOwner = null;
    let preservedBotOwner = null;
    try {
        const currentSettings = require('../settings');
        preservedOwner = currentSettings && currentSettings.ownerNumber ? String(currentSettings.ownerNumber) : null;
        preservedBotOwner = currentSettings && currentSettings.botOwner ? String(currentSettings.botOwner) : null;
    } catch {}
    copyRecursive(srcRoot, process.cwd(), ignore, '', copied);
    if (preservedOwner) {
        try {
            const settingsPath = path.join(process.cwd(), 'settings.js');
            if (fs.existsSync(settingsPath)) {
                let text = fs.readFileSync(settingsPath, 'utf8');
                text = text.replace(/ownerNumber:\s*'[^']*'/, `ownerNumber: '${preservedOwner}'`);
                if (preservedBotOwner) {
                    text = text.replace(/botOwner:\s*'[^']*'/, `botOwner: '${preservedBotOwner}'`);
                }
                fs.writeFileSync(settingsPath, text);
            }
        } catch {}
    }
    try { fs.rmSync(extractTo, { recursive: true, force: true }); } catch {}
    try { fs.rmSync(zipPath, { force: true }); } catch {}
    return { copiedFiles: copied };
}

// PANEL-FRIENDLY RESTART - NO AUTO EXIT
async function restartProcess(sock, chatId, message) {
    try {
        await sock.sendMessage(chatId, { 
            text: `✅ *UPDATE COMPLETE!*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot has been updated successfully.\n\n━━━━━━━━━━━━━━━━━━━━\n⚠️ *IMPORTANT:*\nPlease restart the bot manually from your hosting panel for changes to take effect.\n\n━━━━━━━━━━━━━━━━━━━━\n💡 *How to restart:*\n└ Go to your bot panel\n└ Click the Restart/Stop button\n└ Then Start again\n\n━━━━━━━━━━━━━━━━━━━━\n🤖 *WALLYJAYTECH-MD*`,
            ...channelInfo
        }, { quoted: message });
    } catch {}
    
    // DO NOT call process.exit() - let panel handle restart manually
    console.log('✅ Update completed. Please restart the bot manually from your panel.');
}

async function updateCommand(sock, chatId, message, zipOverride) {
    const senderId = message.key.participant || message.key.remoteJid;
    const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
    
    if (!message.key.fromMe && !isOwner) {
        await sock.sendMessage(chatId, { 
            text: '❌ Only bot owner or sudo can use .update',
            ...channelInfo
        }, { quoted: message });
        return;
    }
    
    try {
        await sock.sendMessage(chatId, { 
            text: `🔄 *UPDATING BOT*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Downloading latest updates...\n⏳ Please wait...`,
            ...channelInfo
        }, { quoted: message });
        
        if (await hasGitRepo()) {
            const { oldRev, newRev, alreadyUpToDate } = await updateViaGit();
            
            if (alreadyUpToDate) {
                await sock.sendMessage(chatId, { 
                    text: `✅ *ALREADY UP TO DATE*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Current version: ${newRev}\n\n━━━━━━━━━━━━━━━━━━━━\n🤖 No updates available.`,
                    ...channelInfo
                }, { quoted: message });
                return;
            }
            
            await sock.sendMessage(chatId, { 
                text: `✅ *GIT UPDATE COMPLETED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Updated from: ${oldRev}\n📌 To: ${newRev}\n\n━━━━━━━━━━━━━━━━━━━━\n📦 Installing dependencies...`,
                ...channelInfo
            }, { quoted: message });
            
            await run('npm install --no-audit --no-fund');
            
        } else {
            const { copiedFiles } = await updateViaZip(sock, chatId, message, zipOverride);
            
            await sock.sendMessage(chatId, { 
                text: `✅ *ZIP UPDATE COMPLETED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Files updated: ${copiedFiles.length}\n\n━━━━━━━━━━━━━━━━━━━━\n📦 Installing dependencies...`,
                ...channelInfo
            }, { quoted: message });
            
            await run('npm install --no-audit --no-fund');
        }
        
        await restartProcess(sock, chatId, message);
        
    } catch (err) {
        console.error('Update failed:', err);
        await sock.sendMessage(chatId, { 
            text: `❌ *UPDATE FAILED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Error: ${String(err.message || err)}\n\n━━━━━━━━━━━━━━━━━━━━\n💡 Try manual update:\n└ git pull\n└ npm install\n└ Restart bot manually`,
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = updateCommand;
