/**
 * WALLYJAYTECH-MD - Menu Type Switcher
 * Commands: .menutype button | .menutype text
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/menuType.json');

function initConfig() {
    try {
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({ menuType: 'text' }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath));
    } catch (e) {
        return { menuType: 'text' };
    }
}

function getMenuType() {
    return initConfig().menuType || 'text';
}

function setMenuType(type) {
    fs.writeFileSync(configPath, JSON.stringify({ menuType: type }, null, 2));
}

async function menuTypeCommand(sock, chatId, message, args) {
    const current = getMenuType();

    if (!args || args.length === 0) {
        await sock.sendMessage(chatId, {
            text: `📋 *MENU TYPE SETTINGS*\n\n` +
                  `━━━━━━━━━━━━━━━━━━━━\n` +
                  `🟢 *Current Mode:* ${current === 'button' ? '🟦 Button Menu' : '📄 Text Menu'}\n\n` +
                  `━━━━━━━━━━━━━━━━━━━━\n` +
                  `📖 *Commands:*\n` +
                  `└ .menutype button - Switch to interactive buttons\n` +
                  `└ .menutype text - Switch to classic text menu\n\n` +
                  `💡 *Note:* Button menus support all 100 fonts & 7 styles!`
        }, { quoted: message });
        return;
    }

    const type = args[0].toLowerCase();
    if (type !== 'button' && type !== 'text') {
        await sock.sendMessage(chatId, { text: `⚠️ Invalid type! Use \`.menutype button\` or \`.menutype text\`.` });
        return;
    }

    if (type === current) {
        await sock.sendMessage(chatId, { text: `⚠️ Already set to *${type}* mode.` });
        return;
    }

    setMenuType(type);
    await sock.sendMessage(chatId, {
        text: `✅ *Menu Type Updated!*\n\n` +
              `━━━━━━━━━━━━━━━━━━━━\n` +
              `📋 *New Mode:* ${type === 'button' ? '🟦 Interactive Buttons' : '📄 Classic Text'}\n\n` +
              `💡 Use \`.menu\` to see the new layout!`
    }, { quoted: message });
}

module.exports = { menuTypeCommand, getMenuType, setMenuType };
