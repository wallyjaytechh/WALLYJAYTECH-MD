/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Menu Style Command - 12 Professional Menu Layouts
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
    1: { name: 'Original Classic', description: 'Boxed design with bold double-line borders' },
    2: { name: 'Archie Drop', description: 'Layered sections with arrow connectors and star dividers' },
    3: { name: 'Starlet', description: 'Flower-star borders with elegant spacing' },
    4: { name: 'Asterisk Ring', description: 'Circular ring markers with clean layout' },
    5: { name: 'Deco Line', description: 'Diamond-pattern decorative lines with cross dividers' },
    6: { name: 'Digital Glitch', description: 'Hexagonal tech-themed markers' },
    7: { name: 'Target Dashboard', description: 'Target point markers with arrow indicators' },
    8: { name: 'Target Point', description: 'Clean target points with play arrows' },
    9: { name: 'Orbit System', description: 'Orbital cross markers with arrow entries' },
    10: { name: 'Arrow Menu', description: 'Sharp arrow indicators with target headers' },
    11: { name: 'Target Profile', description: 'Target-framed profile section' },
    12: { name: 'APL Terminal', description: 'Up-arrow terminal style interface' }
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
                      `📖 *Available Styles (12):*\n\n` +
                      `${styleList}` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .menustyle <1-12> - Change menu layout\n` +
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
                text: `⚠️ *INVALID STYLE*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Choose a style from 1-12.\n\n💡 Use .menustyle to see all options.`,
                ...channelInfo
            });
            return;
        }

        if (styleId === currentStyle) {
            await sock.sendMessage(chatId, {
                text: `⚠️ *ALREADY SET*\n\n━━━━━━━━━━━━━━━━━━━━\n📋 Style *${STYLES[styleId].name}* (#${styleId}) is already active.\n\n💡 Use .menustyle <1-12> to switch.\n\n🎨 Also try .menufont <1-12> for text fonts!`,
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
