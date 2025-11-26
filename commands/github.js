 const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function githubCommand(sock, chatId, message) {
    try {
        // Show typing indicator
        await sock.sendPresenceUpdate('composing', chatId);

        const res = await fetch('https://api.github.com/repos/wallyjaytechh/WALLYJAYTECH-MD');
        if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
        
        const json = await res.json();

        // Create professional formatted message
        let txt = `*🤖 WALLYJAYTECH-MD REPOSITORY* 🤖\n\n`;
        txt += `📛 *Repository Name:* ${json.name || 'WALLYJAYTECH-MD'}\n`;
        txt += `📖 *Description:* ${json.description || 'A Multi-Device WhatsApp User Bot'}\n`;
        txt += `👁️ *Watchers:* ${json.watchers_count?.toLocaleString() || '0'}\n`;
        txt += `💾 *Repository Size:* ${(json.size / 1024).toFixed(2)} MB\n`;
        txt += `🕒 *Last Updated:* ${moment(json.updated_at).format('DD MMM YYYY - HH:mm:ss')}\n`;
        txt += `🌐 *Repository URL:* ${json.html_url}\n`;
        txt += `🔀 *Forks Count:* ${json.forks_count?.toLocaleString() || '0'}\n`;
        txt += `⭐ *Stars Count:* ${json.stargazers_count?.toLocaleString() || '0'}\n`;
        txt += `🐛 *Open Issues:* ${json.open_issues_count?.toLocaleString() || '0'}\n`;
        txt += `🌿 *Default Branch:* ${json.default_branch || 'main'}\n`;
        txt += `📄 *Language:* ${json.language || 'JavaScript'}\n\n`;
        txt += `📊 *Repository Statistics:*\n`;
        txt += `├─ 📈 Stars: ${json.stargazers_count?.toLocaleString() || '0'}\n`;
        txt += `├─ 🔄 Forks: ${json.forks_count?.toLocaleString() || '0'}\n`;
        txt += `├─ 👁️ Watchers: ${json.watchers_count?.toLocaleString() || '0'}\n`;
        txt += `└─ 🐛 Issues: ${json.open_issues_count?.toLocaleString() || '0'}\n\n`;
        txt += `🔗 *Quick Links:*\n`;
        txt += `• 📂 [View Repository](${json.html_url})\n`;
        txt += `• 🐛 [Report Issues](${json.html_url}/issues)\n`;
        txt += `• ⭐ [Star Repository](${json.html_url})\n\n`;
        txt += `*© WALLYJAYTECH 2025 | All Rights Reserved*`;

        // Try to use local asset image, fallback to repository image
        let imageBuffer;
        const imgPath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imgPath)) {
            imageBuffer = fs.readFileSync(imgPath);
        } else if (json.owner?.avatar_url) {
            // Fallback to repository owner avatar
            const avatarRes = await fetch(json.owner.avatar_url);
            imageBuffer = await avatarRes.buffer();
        }

        // Send message with image if available, otherwise text only
        if (imageBuffer) {
            await sock.sendMessage(chatId, { 
                image: imageBuffer, 
                caption: txt,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: txt,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }

        console.log('✅ GitHub repository info sent successfully');

    } catch (error) {
        console.error('❌ Error in github command:', error);
        
        await sock.sendMessage(chatId, { 
            text: `*❌ GITHUB REPOSITORY ERROR*\n\nFailed to fetch repository information.\n\n*Error Details:* ${error.message}\n\nPlease try again later or check the repository manually:\nhttps://github.com/wallyjaytechh/WALLYJAYTECH-MD`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

// Function to get repository statistics (can be used for other purposes)
async function getRepoStats() {
    try {
        const res = await fetch('https://api.github.com/repos/wallyjaytechh/WALLYJAYTECH-MD');
        if (!res.ok) throw new Error('Failed to fetch repository data');
        return await res.json();
    } catch (error) {
        console.error('Error fetching repo stats:', error);
        return null;
    }
}

module.exports = githubCommand;
module.exports.getRepoStats = getRepoStats;
