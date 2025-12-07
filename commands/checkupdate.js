// checkupdate.js - Check for updates from GitHub repository (COMMIT-BASED)
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const moment = require('moment-timezone');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const GITHUB_REPO = 'wallyjaytechh/WALLYJAYTECH-MD';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}`;
const GITHUB_COMMITS_URL = `${GITHUB_API}/commits`;
const GITHUB_MAIN_BRANCH = 'main'; // or 'master'

// Try to get current version from settings
let CURRENT_VERSION = '1.0.0';
let TIMEZONE = 'Africa/Lagos';
try {
    const settings = require('../settings');
    CURRENT_VERSION = settings.version || '1.0.0';
    TIMEZONE = settings.timezone || 'Africa/Lagos';
} catch (error) {
    console.error('Could not load settings:', error.message);
}

const CHANNEL_INFO = {
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

// Store update check results
let lastUpdateCheck = null;
let updateAvailable = false;
let latestCommitHash = '';
let latestCommitMessage = '';
let latestCommitTime = null;
let latestCommitAuthor = '';
let latestCommitFiles = [];
let commitCount = 0;

// Store last known commit to compare
let lastKnownCommit = '';

// Load last known commit from file
function loadLastKnownCommit() {
    try {
        const commitFile = path.join(__dirname, '../data/last_commit.json');
        if (fs.existsSync(commitFile)) {
            const data = JSON.parse(fs.readFileSync(commitFile, 'utf8'));
            lastKnownCommit = data.lastCommit || '';
            return lastKnownCommit;
        }
    } catch (error) {
        console.error('Error loading last commit:', error.message);
    }
    return '';
}

// Save last known commit to file
function saveLastKnownCommit(commitHash) {
    try {
        const commitFile = path.join(__dirname, '../data/last_commit.json');
        const dataDir = path.dirname(commitFile);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        const data = {
            lastCommit: commitHash,
            lastCheck: new Date().toISOString(),
            currentVersion: CURRENT_VERSION
        };
        
        fs.writeFileSync(commitFile, JSON.stringify(data, null, 2));
        lastKnownCommit = commitHash;
    } catch (error) {
        console.error('Error saving last commit:', error.message);
    }
}

// Format time in bot's timezone
function formatTime(dateString) {
    try {
        return moment(dateString).tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
    } catch (error) {
        return new Date(dateString).toLocaleString();
    }
}

// Get time ago
function timeAgo(dateString) {
    try {
        const date = moment(dateString);
        const now = moment();
        const diff = now.diff(date, 'minutes');
        
        if (diff < 1) return 'just now';
        if (diff < 60) return `${diff} minutes ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
        return `${Math.floor(diff / 1440)} days ago`;
    } catch (error) {
        return 'some time ago';
    }
}

async function checkForUpdates() {
    try {
        console.log('🔍 Checking for GitHub commits...');
        
        // Load last known commit
        loadLastKnownCommit();
        
        // Get latest commits from GitHub
        const response = await axios.get(`${GITHUB_COMMITS_URL}?sha=${GITHUB_MAIN_BRANCH}&per_page=5`, {
            headers: {
                'User-Agent': 'WALLYJAYTECH-MD-Bot',
                'Accept': 'application/vnd.github.v3+json'
            },
            timeout: 10000
        });
        
        const commits = response.data;
        
        if (!commits || commits.length === 0) {
            console.log('⚠️ No commits found on GitHub');
            lastUpdateCheck = new Date();
            return { updateAvailable: false, commitCount: 0, details: null };
        }
        
        // Get the latest commit
        const latestCommit = commits[0];
        latestCommitHash = latestCommit.sha.substring(0, 7);
        latestCommitMessage = latestCommit.commit.message;
        latestCommitTime = latestCommit.commit.author?.date || latestCommit.commit.committer?.date;
        latestCommitAuthor = latestCommit.commit.author?.name || latestCommit.commit.committer?.name || 'Unknown';
        commitCount = commits.length;
        
        // Try to get changed files for the latest commit
        try {
            const commitDetailResponse = await axios.get(`${GITHUB_COMMITS_URL}/${latestCommit.sha}`, {
                headers: {
                    'User-Agent': 'WALLYJAYTECH-MD-Bot'
                },
                timeout: 5000
            });
            
            const commitDetails = commitDetailResponse.data;
            latestCommitFiles = commitDetails.files?.map(file => ({
                filename: file.filename,
                status: file.status,
                changes: file.changes || 0,
                additions: file.additions || 0,
                deletions: file.deletions || 0
            })) || [];
            
        } catch (fileError) {
            console.log('⚠️ Could not get commit file details:', fileError.message);
            latestCommitFiles = [];
        }
        
        console.log(`📝 Latest commit: ${latestCommitHash} - "${latestCommitMessage}"`);
        
        // Check if this is a new commit compared to last known
        if (lastKnownCommit && lastKnownCommit !== latestCommitHash) {
            updateAvailable = true;
            console.log(`🆕 New commit detected! (Previous: ${lastKnownCommit.substring(0, 7) || 'none'})`);
        } else if (!lastKnownCommit) {
            // First time checking - save but don't notify
            console.log('📋 First time checking, saving commit reference');
            updateAvailable = false;
        } else {
            updateAvailable = false;
            console.log('✅ No new commits since last check');
        }
        
        // Save the latest commit for next time
        saveLastKnownCommit(latestCommitHash);
        
        lastUpdateCheck = new Date();
        
        return {
            updateAvailable,
            latestVersion: `commit-${latestCommitHash}`,
            currentVersion: CURRENT_VERSION,
            commitCount,
            details: {
                hash: latestCommitHash,
                message: latestCommitMessage,
                time: latestCommitTime,
                author: latestCommitAuthor,
                files: latestCommitFiles,
                fullHash: latestCommit.sha,
                html_url: latestCommit.html_url
            }
        };
        
    } catch (error) {
        console.error('❌ Error checking for updates:', error.message);
        
        // Fallback: Check local git if available
        try {
            if (fs.existsSync(path.join(__dirname, '../.git'))) {
                const { stdout: gitHash } = await execAsync('git rev-parse --short HEAD', { cwd: path.join(__dirname, '..') });
                const { stdout: gitMessage } = await execAsync('git log -1 --pretty=%B', { cwd: path.join(__dirname, '..') });
                
                latestCommitHash = gitHash.trim();
                latestCommitMessage = gitMessage.trim();
                
                console.log(`📝 Local git commit: ${latestCommitHash} - "${latestCommitMessage}"`);
            }
        } catch (gitError) {
            console.log('⚠️ Could not check local git:', gitError.message);
        }
        
        lastUpdateCheck = new Date();
        return { 
            updateAvailable: false, 
            latestVersion: `commit-${latestCommitHash || 'unknown'}`,
            currentVersion: CURRENT_VERSION,
            commitCount: 0,
            details: null,
            error: error.message 
        };
    }
}

async function checkUpdateCommand(sock, chatId, message) {
    try {
        await sock.sendPresenceUpdate('composing', chatId);
        
        const result = await checkForUpdates();
        
        let responseText = '';
        
        if (result.updateAvailable && result.details) {
            responseText = `🆕 *NEW UPDATE AVAILABLE!*\n\n` +
                          `*Current Version:* v${result.currentVersion}\n` +
                          `*Latest Commit:* ${result.details.hash}\n` +
                          `*Commit Message:* ${result.details.message}\n` +
                          `*Author:* ${result.details.author}\n` +
                          `*Time:* ${formatTime(result.details.time)} (${timeAgo(result.details.time)})\n\n`;
            
            // Show changed files if available
            if (result.details.files && result.details.files.length > 0) {
                responseText += `📁 *Changed Files (${result.details.files.length}):*\n`;
                
                // Show up to 5 files
                const filesToShow = result.details.files.slice(0, 5);
                filesToShow.forEach((file, index) => {
                    const statusEmoji = file.status === 'added' ? '🟢' : 
                                      file.status === 'modified' ? '🔵' : 
                                      file.status === 'removed' ? '🔴' : '⚪';
                    responseText += `${statusEmoji} ${file.filename} (${file.status})\n`;
                });
                
                if (result.details.files.length > 5) {
                    responseText += `... and ${result.details.files.length - 5} more files\n`;
                }
                responseText += '\n';
            }
            
            responseText += `*Recent Commits:* ${result.commitCount} new commit(s)\n\n` +
                          `🔗 *View Commit:* ${result.details.html_url || `https://github.com/${GITHUB_REPO}/commit/${result.details.fullHash}`}\n\n` +
                          `📥 *How to update:*\n` +
                          `1. Download latest code from GitHub\n` +
                          `2. Backup your session folder\n` +
                          `3. Replace all files (except session)\n` +
                          `4. Restart the bot\n\n` +
                          `💡 *Quick update:* \`.update ${GITHUB_REPO}\``;
            
        } else {
            responseText = `✅ *You're up to date!*\n\n` +
                          `*Current Version:* v${result.currentVersion}\n` +
                          `*Latest Commit:* ${result.latestVersion.replace('commit-', '')}\n\n`;
            
            if (result.details) {
                responseText += `*Last Commit:* ${result.details.message}\n` +
                              `*Author:* ${result.details.author}\n` +
                              `*Time:* ${formatTime(result.details.time)} (${timeAgo(result.details.time)})\n\n`;
            }
            
            responseText += `*Last Checked:* ${lastUpdateCheck ? formatTime(lastUpdateCheck) : 'Never'}\n\n` +
                          `🔧 *Bot Information:*\n` +
                          `• Platform: ${global.deploymentPlatform || 'Unknown'}\n` +
                          `• Node.js: ${process.version}\n` +
                          `• Uptime: ${formatUptime(process.uptime())}\n` +
                          `• Timezone: ${TIMEZONE}\n\n` +
                          `⭐ *GitHub Repository:*\n` +
                          `https://github.com/${GITHUB_REPO}\n\n` +
                          `📈 *Commit tracking enabled*\n` +
                          `Bot will notify you of new commits automatically.`;
            
            if (result.error) {
                responseText += `\n\n⚠️ *Note:* ${result.error}`;
            }
        }
        
        // Add footer with instructions
        responseText += `\n\n📌 *Update Commands:*\n` +
                       `• \`.checkupdate\` - Check for updates\n` +
                       `• \`.updateinfo\` - Update information\n` +
                       `• \`.update\` - Update the bot\n` +
                       `• \`.botinfo\` - Bot information`;
        
        await sock.sendMessage(chatId, {
            text: responseText,
            ...CHANNEL_INFO
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error in checkUpdateCommand:', error);
        await sock.sendMessage(chatId, {
            text: `❌ *Failed to check for updates*\n\nError: ${error.message}\n\nPlease check your internet connection.`,
            ...CHANNEL_INFO
        }, { quoted: message });
    }
}

async function updateInfoCommand(sock, chatId, message) {
    try {
        await sock.sendPresenceUpdate('composing', chatId);
        
        // Force a fresh check
        const result = await checkForUpdates();
        
        if (!result.details) {
            await sock.sendMessage(chatId, {
                text: `❌ *No commit information available*\n\nCould not fetch commit details from GitHub.\n\nMake sure your repository exists and is public.`,
                ...CHANNEL_INFO
            }, { quoted: message });
            return;
        }
        
        let responseText = `📋 *UPDATE INFORMATION*\n\n` +
                          `*Repository:* ${GITHUB_REPO}\n` +
                          `*Branch:* ${GITHUB_MAIN_BRANCH}\n` +
                          `*Current Version:* v${result.currentVersion}\n` +
                          `*Latest Commit:* ${result.details.hash}\n\n` +
                          `📝 *Commit Details:*\n` +
                          `*Message:* ${result.details.message}\n` +
                          `*Author:* ${result.details.author}\n` +
                          `*Time:* ${formatTime(result.details.time)}\n` +
                          `*Timezone:* ${TIMEZONE}\n\n`;
        
        // Show all changed files
        if (result.details.files && result.details.files.length > 0) {
            responseText += `📁 *All Changed Files:*\n`;
            result.details.files.forEach((file) => {
                const changes = file.changes > 0 ? ` (${file.changes} changes)` : '';
                const additions = file.additions > 0 ? ` +${file.additions}` : '';
                const deletions = file.deletions > 0 ? ` -${file.deletions}` : '';
                const stats = additions || deletions ? ` [${additions}${deletions}]` : '';
                
                const statusEmoji = file.status === 'added' ? '🟢 ADDED' : 
                                  file.status === 'modified' ? '🔵 MODIFIED' : 
                                  file.status === 'removed' ? '🔴 REMOVED' : '⚪ ' + file.status.toUpperCase();
                
                responseText += `${statusEmoji} ${file.filename}${stats}\n`;
            });
            responseText += '\n';
        }
        
        responseText += `🔗 *View on GitHub:*\n` +
                       `${result.details.html_url || `https://github.com/${GITHUB_REPO}/commit/${result.details.fullHash}`}\n\n` +
                       `📥 *Update Instructions:*\n` +
                       `1. \`git pull origin ${GITHUB_MAIN_BRANCH}\` (if using git)\n` +
                       `2. Or download ZIP from GitHub\n` +
                       `3. Backup your session folder\n` +
                       `4. Replace files (keep session)\n` +
                       `5. Run \`npm install\` if needed\n` +
                       `6. Restart the bot\n\n` +
                       `⚠️ *Always backup before updating!*`;
        
        await sock.sendMessage(chatId, {
            text: responseText,
            ...CHANNEL_INFO
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error in updateInfoCommand:', error);
        await sock.sendMessage(chatId, {
            text: `❌ *Failed to get update information*\n\nError: ${error.message}`,
            ...CHANNEL_INFO
        }, { quoted: message });
    }
}

async function autoCheckUpdates(sock) {
    try {
        console.log('⏰ Starting auto-update checker (commit-based)...');
        
        // Create data directory if needed
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Initial check
        await checkForUpdates();
        
        // Check for new commits every hour
        setInterval(async () => {
            const result = await checkForUpdates();
            
            if (result.updateAvailable && result.details) {
                console.log(`🆕 Auto-check: New commit detected! ${result.details.hash}`);
                
                // Notify bot owner
                try {
                    const settings = require('../settings');
                    const ownerNumber = settings.ownerNumber;
                    if (ownerNumber && sock) {
                        const ownerJid = `${ownerNumber}@s.whatsapp.net`;
                        
                        let notifyText = `🔔 *NEW COMMIT DETECTED!*\n\n` +
                                        `*Commit:* ${result.details.hash}\n` +
                                        `*Message:* ${result.details.message}\n` +
                                        `*Author:* ${result.details.author}\n` +
                                        `*Time:* ${timeAgo(result.details.time)}\n\n`;
                        
                        if (result.details.files && result.details.files.length > 0) {
                            const fileCount = result.details.files.length;
                            const added = result.details.files.filter(f => f.status === 'added').length;
                            const modified = result.details.files.filter(f => f.status === 'modified').length;
                            const removed = result.details.files.filter(f => f.status === 'removed').length;
                            
                            notifyText += `📁 *Files changed:* ${fileCount}\n` +
                                         `🟢 Added: ${added} | 🔵 Modified: ${modified} | 🔴 Removed: ${removed}\n\n`;
                        }
                        
                        notifyText += `📥 *Update now:*\n` +
                                     `Use \`.checkupdate\` for details\n` +
                                     `Use \`.update\` to update bot\n\n` +
                                     `🔗 ${result.details.html_url || `https://github.com/${GITHUB_REPO}`}`;
                        
                        await sock.sendMessage(ownerJid, { text: notifyText });
                    }
                } catch (error) {
                    console.error('Could not notify owner:', error.message);
                }
            }
        }, 60 * 60 * 1000); // Check every hour
        
    } catch (error) {
        console.error('Error in autoCheckUpdates:', error);
    }
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
}

// Export functions
module.exports = {
    checkUpdateCommand,
    updateInfoCommand,
    autoCheckUpdates,
    checkForUpdates,
    getUpdateStatus: () => ({
        updateAvailable,
        latestVersion: `commit-${latestCommitHash || 'unknown'}`,
        currentVersion: CURRENT_VERSION,
        lastCheck: lastUpdateCheck,
        commitDetails: {
            hash: latestCommitHash,
            message: latestCommitMessage,
            time: latestCommitTime,
            author: latestCommitAuthor,
            files: latestCommitFiles
        }
    }),
    loadLastKnownCommit,
    saveLastKnownCommit
};
