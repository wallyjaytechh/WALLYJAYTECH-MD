// checkupdate.js - Check for updates from GitHub repository
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration - Use your actual GitHub repo
const GITHUB_REPO = 'wallyjaytechh/WALLYJAYTECH-MD';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}`;

// Try to get current version from settings
let CURRENT_VERSION = '1.0.0';
try {
    const settings = require('../settings');
    CURRENT_VERSION = settings.version || '1.0.0';
} catch (error) {
    console.error('Could not load settings for version:', error.message);
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
let latestVersion = CURRENT_VERSION;
let updateDetails = null;

async function checkForUpdates() {
    try {
        console.log('🔍 Checking for updates...');
        
        // Try to get latest release from GitHub API
        let latestRelease = null;
        try {
            const response = await axios.get(`${GITHUB_API}/releases/latest`, {
                headers: {
                    'User-Agent': 'WALLYJAYTECH-MD-Bot'
                },
                timeout: 10000 // 10 second timeout
            });
            latestRelease = response.data;
        } catch (githubError) {
            console.log('⚠️ GitHub API error:', githubError.message);
            
            // If no releases, try to get latest commit
            try {
                const commitsResponse = await axios.get(`${GITHUB_API}/commits/main`, {
                    headers: {
                        'User-Agent': 'WALLYJAYTECH-MD-Bot'
                    },
                    timeout: 10000
                });
                
                latestRelease = {
                    tag_name: `commit-${commitsResponse.data.sha.substring(0, 7)}`,
                    name: 'Latest Commit',
                    body: `Latest commit: ${commitsResponse.data.commit.message}`,
                    published_at: commitsResponse.data.commit.author?.date || new Date().toISOString(),
                    html_url: commitsResponse.data.html_url
                };
                
                console.log('📝 Using latest commit info instead of release');
            } catch (commitError) {
                console.log('⚠️ Could not get commit info:', commitError.message);
                latestRelease = null;
            }
        }
        
        if (!latestRelease) {
            console.log('⚠️ Could not fetch update information from GitHub');
            
            // Fallback: Check local package.json
            try {
                const packageJsonPath = path.join(__dirname, '../package.json');
                if (fs.existsSync(packageJsonPath)) {
                    const packageJson = require(packageJsonPath);
                    const packageVersion = packageJson.version || '1.0.0';
                    
                    if (packageVersion !== CURRENT_VERSION) {
                        updateAvailable = true;
                        latestVersion = packageVersion;
                        updateDetails = {
                            version: packageVersion,
                            name: 'Local version mismatch detected',
                            body: 'Local package.json version differs from settings.js version',
                            published_at: new Date()
                        };
                        
                        console.log(`⚠️ Version mismatch: package.json v${packageVersion} vs settings.js v${CURRENT_VERSION}`);
                        lastUpdateCheck = new Date();
                        return { updateAvailable, latestVersion, details: updateDetails };
                    }
                }
            } catch (e) {
                console.error('Could not check package.json:', e.message);
            }
            
            lastUpdateCheck = new Date();
            return { updateAvailable: false, latestVersion: CURRENT_VERSION, details: null };
        }
        
        // Extract version from release
        latestVersion = latestRelease.tag_name.replace(/^v/, '').trim();
        if (latestVersion === '') {
            latestVersion = '1.0.0';
        }
        
        // Compare versions
        const currentParts = CURRENT_VERSION.split('.').map(Number);
        const latestParts = latestVersion.split('.').map(Number);
        
        let isNewer = false;
        
        // Simple semantic version comparison
        for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
            const current = currentParts[i] || 0;
            const latest = latestParts[i] || 0;
            
            if (latest > current) {
                isNewer = true;
                break;
            } else if (latest < current) {
                break;
            }
        }
        
        updateAvailable = isNewer;
        
        if (updateAvailable) {
            updateDetails = {
                version: latestVersion,
                name: latestRelease.name || `Release ${latestRelease.tag_name}`,
                body: latestRelease.body || 'No release notes available',
                published_at: new Date(latestRelease.published_at || new Date()),
                download_url: latestRelease.zipball_url || `${GITHUB_API}/archive/refs/heads/main.zip`,
                html_url: latestRelease.html_url || `https://github.com/${GITHUB_REPO}`
            };
            
            console.log(`🆕 Update available: v${latestVersion} (current: v${CURRENT_VERSION})`);
        } else {
            console.log(`✅ You're running the latest version: v${CURRENT_VERSION}`);
        }
        
        lastUpdateCheck = new Date();
        return { updateAvailable, latestVersion, details: updateDetails };
        
    } catch (error) {
        console.error('❌ Error checking for updates:', error.message);
        lastUpdateCheck = new Date();
        return { updateAvailable: false, latestVersion: CURRENT_VERSION, details: null, error: error.message };
    }
}

async function checkUpdateCommand(sock, chatId, message) {
    try {
        await sock.sendPresenceUpdate('composing', chatId);
        
        const result = await checkForUpdates();
        
        let responseText = '';
        
        if (result.updateAvailable) {
            responseText = `🆕 *UPDATE AVAILABLE!*\n\n` +
                          `*Current Version:* v${CURRENT_VERSION}\n` +
                          `*Latest Version:* v${result.latestVersion}\n\n`;
            
            if (result.details?.name) {
                responseText += `*What's New:* ${result.details.name}\n`;
            }
            
            if (result.details?.body) {
                const shortBody = result.details.body.length > 300 
                    ? result.details.body.substring(0, 300) + '...'
                    : result.details.body;
                responseText += `\n*Release Notes:*\n${shortBody}\n`;
            }
            
            responseText += `\n*Published:* ${result.details?.published_at?.toLocaleDateString() || 'Unknown'}\n\n` +
                          `🔗 *GitHub Release:* ${result.details?.html_url || 'https://github.com/wallyjaytechh/WALLYJAYTECH-MD'}\n\n` +
                          `*To update your bot:*\n` +
                          `1. Download the latest release\n` +
                          `2. Backup your session folder\n` +
                          `3. Replace files (except session)\n` +
                          `4. Restart the bot\n\n` +
                          `📥 *Quick Update:* \`.update ${result.details?.download_url || ''}\`\n` +
                          `⚠️ *Backup your data before updating!*`;
            
        } else {
            responseText = `✅ *You're up to date!*\n\n` +
                          `*Current Version:* v${CURRENT_VERSION}\n` +
                          `*Latest Version:* v${result.latestVersion}\n\n` +
                          `*Last Checked:* ${lastUpdateCheck ? lastUpdateCheck.toLocaleString() : 'Never'}\n\n`;
            
            if (result.error) {
                responseText += `⚠️ *Note:* Could not check GitHub (${result.error})\n\n`;
            }
            
            responseText += `🔧 *Bot Information:*\n` +
                          `• Platform: ${global.deploymentPlatform || 'Unknown'}\n` +
                          `• Node.js: ${process.version}\n` +
                          `• Uptime: ${formatUptime(process.uptime())}\n\n` +
                          `⭐ *Star our GitHub repository:*\n` +
                          `https://github.com/wallyjaytechh/WALLYJAYTECH-MD`;
        }
        
        // Add footer with instructions
        responseText += `\n\n📌 *Update Commands:*\n` +
                       `• \`.checkupdate\` - Check for updates\n` +
                       `• \`.update\` - Update the bot\n` +
                       `• \`.updateinfo\` - Update information\n` +
                       `• \`.botinfo\` - Bot information`;
        
        await sock.sendMessage(chatId, {
            text: responseText,
            ...CHANNEL_INFO
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error in checkUpdateCommand:', error);
        await sock.sendMessage(chatId, {
            text: `❌ *Failed to check for updates*\n\nError: ${error.message}\n\nPlease check your internet connection and try again.`,
            ...CHANNEL_INFO
        }, { quoted: message });
    }
}

async function updateInfoCommand(sock, chatId, message) {
    try {
        await sock.sendPresenceUpdate('composing', chatId);
        
        if (!updateAvailable || !updateDetails) {
            // Force a fresh check
            const result = await checkForUpdates();
            
            if (!result.updateAvailable) {
                await sock.sendMessage(chatId, {
                    text: `✅ *No updates available*\n\nYou're running the latest version (v${CURRENT_VERSION}).\n\nCheck again later for new updates!`,
                    ...CHANNEL_INFO
                }, { quoted: message });
                return;
            }
        }
        
        let responseText = `📋 *UPDATE INFORMATION*\n\n` +
                          `*Current Version:* v${CURRENT_VERSION}\n` +
                          `*Available Update:* v${updateDetails.version}\n\n`;
        
        if (updateDetails.name) {
            responseText += `*Update Name:* ${updateDetails.name}\n\n`;
        }
        
        if (updateDetails.body) {
            responseText += `*Full Release Notes:*\n${updateDetails.body}\n\n`;
        }
        
        responseText += `*Published:* ${updateDetails.published_at.toLocaleString()}\n\n` +
                       `*Download Link:* ${updateDetails.download_url || updateDetails.html_url}\n\n` +
                       `⚠️ *Important Notes:*\n` +
                       `• Always backup your session folder before updating\n` +
                       `• Make sure to keep your configuration files\n` +
                       `• Check for breaking changes in release notes\n` +
                       `• Restart the bot after updating\n\n` +
                       `📥 *Update Command:*\n` +
                       `Use \`.update ${updateDetails.download_url || ''}\` to update\n\n` +
                       `📞 *Need Help?*\n` +
                       `Contact support if you encounter issues during update.`;
        
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
        console.log('⏰ Starting auto-update check...');
        
        // Initial check
        await checkForUpdates();
        
        // Check for updates every 6 hours
        setInterval(async () => {
            const result = await checkForUpdates();
            
            if (result.updateAvailable) {
                console.log(`🆕 Auto-check: Update v${result.latestVersion} available!`);
                
                // Notify bot owner
                try {
                    const settings = require('../settings');
                    const ownerNumber = settings.ownerNumber;
                    if (ownerNumber && sock) {
                        const ownerJid = `${ownerNumber}@s.whatsapp.net`;
                        await sock.sendMessage(ownerJid, {
                            text: `🔔 *UPDATE NOTIFICATION*\n\nNew version v${result.latestVersion} is available!\nCurrent version: v${CURRENT_VERSION}\n\nUse \`.checkupdate\` for details or \`.update\` to update.`
                        });
                    }
                } catch (error) {
                    console.error('Could not notify owner:', error.message);
                }
            }
        }, 6 * 60 * 60 * 1000); // 6 hours
        
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
        latestVersion,
        currentVersion: CURRENT_VERSION,
        lastCheck: lastUpdateCheck,
        details: updateDetails
    })
};
