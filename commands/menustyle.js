/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Menu Style Command - 7 Professional Menu Layouts
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/menuStyle.json');

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

const STYLES = {
    1: { name: 'Diamond Classic', description: '◆ Diamond headers with star dividers' },
    2: { name: 'Box Frame', description: '◈ Boxed sections with sleek bullets' },
    3: { name: 'Double Line', description: '╔═╗ Double-line professional boxes' },
    4: { name: 'Jarvis Aesthetic', description: '𓊉꧂ Decorative Jarvis-inspired layout' },
    5: { name: 'Swirl Bloom', description: '🌀◈ Swirl headers with bloom accents' },
    6: { name: 'Love Wing', description: '💕⃝🕊️ Winged headers with soft closers' },
    7: { name: 'Aesthetic Bloom', description: '👹✧❥ Decorative aesthetic with flower accents' },
};

function initConfig() {
    try {
        if (!fs.existsSync(configPath)) {
            const dir = path.dirname(configPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(configPath, JSON.stringify({ style: 1 }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath));
    } catch (e) { return { style: 1 }; }
}

function getCurrentStyle() {
    return initConfig().style || 1;
}

function setStyle(style) {
    try {
        fs.writeFileSync(configPath, JSON.stringify({ style }, null, 2));
    } catch (e) {}
}

async function menuStyleCommand(sock, chatId, message, args) {
    try {
        const currentStyle = getCurrentStyle();

        if (!args || args.length === 0) {
            let styleList = '';
            for (const [id, style] of Object.entries(STYLES)) {
                const marker = parseInt(id) === currentStyle ? '✅' : '└';
                styleList += `${marker} *${id}.* ${style.name}\n   _${style.description}_\n\n`;
            }

            await sock.sendMessage(chatId, {
                text: `📋 *MENU STYLE SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🟢 *Current Style:* ${STYLES[currentStyle]?.name || 'Original'} (#${currentStyle})\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Available Styles (7):*\n\n` +
                      `${styleList}` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .menustyle <1-7> - Change menu layout\n` +
                      `└ .menustyle - Show this menu\n\n` +
                      `✨ *Example:*\n` +
                      `└ .menustyle 3\n` +
                      `└ .menustyle 7`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const styleId = parseInt(args[0]);

        if (!STYLES[styleId]) {
            await sock.sendMessage(chatId, {
                text: `⚠️ *INVALID STYLE*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Choose a style from 1-7.\n\n💡 Use .menustyle to see all options.`,
                ...channelInfo
            });
            return;
        }

        if (styleId === currentStyle) {
            await sock.sendMessage(chatId, {
                text: `⚠️ *ALREADY SET*\n\n━━━━━━━━━━━━━━━━━━━━\n📋 Style *${STYLES[styleId].name}* (#${styleId}) is already active.\n\n💡 Use .menustyle <1-7> to switch.\n\n🎨 Also try .menufont <1-12> for text fonts!`,
                ...channelInfo
            });
            return;
        }

        setStyle(styleId);

        await sock.sendMessage(chatId, {
            text: `✅ *STYLE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n📋 *New Style:* ${STYLES[styleId].name} (#${styleId})\n📝 *${STYLES[styleId].description}*\n\n💡 Use .menu to see your new layout.\n🎨 Use .menufont <1-12> to change text font.`,
            ...channelInfo
        });
    } catch (error) {
        console.error('❌ Menu style error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing command!',
            ...channelInfo
        });
    }
}

module.exports = { menuStyleCommand, getCurrentStyle, STYLES };
