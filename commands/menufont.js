/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Menu Font Command - Change menu display font style
 * Professional Version
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/menuFont.json');
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

// Available font styles
const FONT_STYLES = {
    1: { name: 'Default', description: 'Standard WhatsApp font' },
    2: { name: 'Bold', description: 'Bold text style' },
    3: { name: 'Italic', description: 'Italic text style' },
    4: { name: 'Monospace', description: 'Code-like monospace font' },
    5: { name: 'Stylish A', description: '𝔖𝔱𝔶𝔩𝔦𝔰𝔥 𝔘𝔫𝔦𝔠𝔬𝔡𝔢' },
    6: { name: 'Stylish B', description: '𝕾𝖙𝖞𝖑𝖎𝖘𝖍 𝕲𝖔𝖙𝖍𝖎𝖈' },
    7: { name: 'Double', description: '𝕯𝕺𝖀𝕭𝕷𝕰 𝕾𝖳𝕽𝖀𝕶' },
    8: { name: 'Script', description: '𝒮𝒸𝓇𝒾𝓅𝓉 𝒮𝓉𝓎𝓁𝑒' },
    9: { name: 'Bubble', description: 'Ⓑⓤⓑⓑⓛⓔ Ⓢⓣⓨⓛⓔ' },
    10: { name: 'Square', description: '🅂🅀🅄🄰🅁🄴 🅂🅃🅈🄻🄴' },
    11: { name: 'Strikethrough', description: 'S̶t̶r̶i̶k̶e̶t̶h̶r̶o̶u̶g̶h̶' },
    12: { name: 'Tiny Caps', description: 'тιηу ¢αρѕ ѕтуℓє' }
};

// Font transformation functions
function applyFont(text, fontId) {
    switch(fontId) {
        case 1: return text; // Default - no change
        case 2: return `*${text}*`; // Bold
        case 3: return `_${text}_`; // Italic
        case 4: return `\`\`\`${text}\`\`\``; // Monospace
        case 5: return toStylishA(text);
        case 6: return toStylishB(text);
        case 7: return toDoubleStruck(text);
        case 8: return toScript(text);
        case 9: return toBubble(text);
        case 10: return toSquare(text);
        case 11: return toStrikethrough(text);
        case 12: return toTinyCaps(text);
        default: return text;
    }
}

function toStylishA(text) {
    const map = {
        'A':'𝔄','B':'𝔅','C':'ℭ','D':'𝔇','E':'𝔈','F':'𝔉','G':'𝔊','H':'ℌ','I':'ℑ',
        'J':'𝔍','K':'𝔎','L':'𝔏','M':'𝔐','N':'𝔑','O':'𝔒','P':'𝔓','Q':'𝔔','R':'ℜ',
        'S':'𝔖','T':'𝔗','U':'𝔘','V':'𝔙','W':'𝔚','X':'𝔛','Y':'𝔜','Z':'ℨ',
        'a':'𝔞','b':'𝔟','c':'𝔠','d':'𝔡','e':'𝔢','f':'𝔣','g':'𝔤','h':'𝔥','i':'𝔦',
        'j':'𝔧','k':'𝔨','l':'𝔩','m':'𝔪','n':'𝔫','o':'𝔬','p':'𝔭','q':'𝔮','r':'𝔯',
        's':'𝔰','t':'𝔱','u':'𝔲','v':'𝔳','w':'𝔴','x':'𝔵','y':'𝔶','z':'𝔷'
    };
    return text.split('').map(c => map[c] || c).join('');
}

function toStylishB(text) {
    const map = {
        'A':'𝕬','B':'𝕭','C':'𝕮','D':'𝕯','E':'𝕰','F':'𝕱','G':'𝕲','H':'𝕳','I':'𝕴',
        'J':'𝕵','K':'𝕶','L':'𝕷','M':'𝕸','N':'𝕹','O':'𝕺','P':'𝕻','Q':'𝕼','R':'𝕽',
        'S':'𝕾','T':'𝕿','U':'𝖀','V':'𝖁','W':'𝖂','X':'𝖃','Y':'𝖄','Z':'𝖅',
        'a':'𝖆','b':'𝖇','c':'𝖈','d':'𝖉','e':'𝖊','f':'𝖋','g':'𝖌','h':'𝖍','i':'𝖎',
        'j':'𝖏','k':'𝖐','l':'𝖑','m':'𝖒','n':'𝖓','o':'𝖔','p':'𝖕','q':'𝖖','r':'𝖗',
        's':'𝖘','t':'𝖙','u':'𝖚','v':'𝖛','w':'𝖜','x':'𝖝','y':'𝖞','z':'𝖟'
    };
    return text.split('').map(c => map[c] || c).join('');
}

function toDoubleStruck(text) {
    const map = {
        'A':'𝔸','B':'𝔹','C':'ℂ','D':'𝔻','E':'𝔼','F':'𝔽','G':'𝔾','H':'ℍ','I':'𝕀',
        'J':'𝕁','K':'𝕂','L':'𝕃','M':'𝕄','N':'ℕ','O':'𝕆','P':'ℙ','Q':'ℚ','R':'ℝ',
        'S':'𝕊','T':'𝕋','U':'𝕌','V':'𝕍','W':'𝕎','X':'𝕏','Y':'𝕐','Z':'ℤ',
        'a':'𝕒','b':'𝕓','c':'𝕔','d':'𝕕','e':'𝕖','f':'𝕗','g':'𝕘','h':'𝕙','i':'𝕚',
        'j':'𝕛','k':'𝕜','l':'𝕝','m':'𝕞','n':'𝕟','o':'𝕠','p':'𝕡','q':'𝕢','r':'𝕣',
        's':'𝕤','t':'𝕥','u':'𝕦','v':'𝕧','w':'𝕨','x':'𝕩','y':'𝕪','z':'𝕫'
    };
    return text.split('').map(c => map[c] || c).join('');
}

function toScript(text) {
    const map = {
        'A':'𝒜','B':'ℬ','C':'𝒞','D':'𝒟','E':'ℰ','F':'ℱ','G':'𝒢','H':'ℋ','I':'ℐ',
        'J':'𝒥','K':'𝒦','L':'ℒ','M':'ℳ','N':'𝒩','O':'𝒪','P':'𝒫','Q':'𝒬','R':'ℛ',
        'S':'𝒮','T':'𝒯','U':'𝒰','V':'𝒱','W':'𝒲','X':'𝒳','Y':'𝒴','Z':'𝒵',
        'a':'𝒶','b':'𝒷','c':'𝒸','d':'𝒹','e':'ℯ','f':'𝒻','g':'ℊ','h':'𝒽','i':'𝒾',
        'j':'𝒿','k':'𝓀','l':'𝓁','m':'𝓂','n':'𝓃','o':'ℴ','p':'𝓅','q':'𝓆','r':'𝓇',
        's':'𝓈','t':'𝓉','u':'𝓊','v':'𝓋','w':'𝓌','x':'𝓍','y':'𝓎','z':'𝓏'
    };
    return text.split('').map(c => map[c] || c).join('');
}

function toBubble(text) {
    const map = {
        'A':'Ⓐ','B':'Ⓑ','C':'Ⓒ','D':'Ⓓ','E':'Ⓔ','F':'Ⓕ','G':'Ⓖ','H':'Ⓗ','I':'Ⓘ',
        'J':'Ⓙ','K':'Ⓚ','L':'Ⓛ','M':'Ⓜ','N':'Ⓝ','O':'Ⓞ','P':'Ⓟ','Q':'Ⓠ','R':'Ⓡ',
        'S':'Ⓢ','T':'Ⓣ','U':'Ⓤ','V':'Ⓥ','W':'Ⓦ','X':'Ⓧ','Y':'Ⓨ','Z':'Ⓩ',
        'a':'ⓐ','b':'ⓑ','c':'ⓒ','d':'ⓓ','e':'ⓔ','f':'ⓕ','g':'ⓖ','h':'ⓗ','i':'ⓘ',
        'j':'ⓙ','k':'ⓚ','l':'ⓛ','m':'ⓜ','n':'ⓝ','o':'ⓞ','p':'ⓟ','q':'ⓠ','r':'ⓡ',
        's':'ⓢ','t':'ⓣ','u':'ⓤ','v':'ⓥ','w':'ⓦ','x':'ⓧ','y':'ⓨ','z':'ⓩ'
    };
    return text.split('').map(c => map[c] || c).join('');
}

function toSquare(text) {
    const map = {
        'A':'🄰','B':'🄱','C':'🄲','D':'🄳','E':'🄴','F':'🄵','G':'🄶','H':'🄷','I':'🄸',
        'J':'🄹','K':'🄺','L':'🄻','M':'🄼','N':'🄽','O':'🄾','P':'🄿','Q':'🅀','R':'🅁',
        'S':'🅂','T':'🅃','U':'🅄','V':'🅅','W':'🅆','X':'🅇','Y':'🅈','Z':'🅉',
        'a':'🅰','b':'🅱','c':'🅲','d':'🅳','e':'🅴','f':'🅵','g':'🅶','h':'🅷','i':'🅸',
        'j':'🅹','k':'🅺','l':'🅻','m':'🅼','n':'🅽','o':'🅾','p':'🅿','q':'🆀','r':'🆁',
        's':'🆂','t':'🆃','u':'🆄','v':'🆅','w':'🆆','x':'🆇','y':'🆈','z':'🆉'
    };
    return text.split('').map(c => map[c] || c).join('');
}

function toStrikethrough(text) {
    return text.split('').map(c => c + '̶').join('');
}

function toTinyCaps(text) {
    const map = {
        'A':'ᴀ','B':'ʙ','C':'ᴄ','D':'ᴅ','E':'ᴇ','F':'ꜰ','G':'ɢ','H':'ʜ','I':'ɪ',
        'J':'ᴊ','K':'ᴋ','L':'ʟ','M':'ᴍ','N':'ɴ','O':'ᴏ','P':'ᴘ','Q':'ǫ','R':'ʀ',
        'S':'s','T':'ᴛ','U':'ᴜ','V':'ᴠ','W':'ᴡ','X':'x','Y':'ʏ','Z':'ᴢ',
        'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ꜰ','g':'ɢ','h':'ʜ','i':'ɪ',
        'j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ',
        's':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'
    };
    return text.split('').map(c => map[c] || c).join('');
}

function initConfig() {
    try {
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({ fontId: 1 }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath));
    } catch (e) {
        return { fontId: 1 };
    }
}

function getCurrentFont() {
    return initConfig().fontId || 1;
}

function setFont(fontId) {
    fs.writeFileSync(configPath, JSON.stringify({ fontId }, null, 2));
}

async function menuFontCommand(sock, chatId, message, args) {
    try {
        const currentFont = getCurrentFont();

        if (!args || args.length === 0) {
            let fontList = '';
            for (const [id, font] of Object.entries(FONT_STYLES)) {
                const marker = parseInt(id) === currentFont ? '✅' : '└';
                fontList += `${marker} *${id}.* ${font.name} - _${font.description}_\n`;
            }

            await sock.sendMessage(chatId, {
                text: `🎨 *MENU FONT SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🟢 *Current Font:* ${FONT_STYLES[currentFont]?.name || 'Default'} (#${currentFont})\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📋 *Available Fonts:*\n` +
                      `${fontList}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .menufont <number> - Change font\n` +
                      `└ .menufont - Show this menu\n\n` +
                      `✨ *Example:*\n` +
                      `└ .menufont 5`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const fontId = parseInt(args[0]);

        if (!FONT_STYLES[fontId]) {
            await sock.sendMessage(chatId, {
                text: `⚠️ *INVALID FONT*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Choose a font from 1-${Object.keys(FONT_STYLES).length}.\n\n💡 Use .menufont to see all options.`,
                ...channelInfo
            });
            return;
        }

        if (fontId === currentFont) {
            await sock.sendMessage(chatId, {
                text: `⚠️ *ALREADY SET*\n\n━━━━━━━━━━━━━━━━━━━━\n🎨 Font *${FONT_STYLES[fontId].name}* is already active.\n\n💡 Use .menufont <number> to change.`,
                ...channelInfo
            });
            return;
        }

        setFont(fontId);

        // Show preview
        const preview = applyFont('WALLYJAYTECH-MD Menu Preview', fontId);

        await sock.sendMessage(chatId, {
            text: `✅ *FONT UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎨 *New Font:* ${FONT_STYLES[fontId].name} (#${fontId})\n📝 *Style:* ${FONT_STYLES[fontId].description}\n\n━━━━━━━━━━━━━━━━━━━━\n📋 *Preview:*\n${preview}\n\n💡 Use .menu to see your menu in this font.`,
            ...channelInfo
        });
    } catch (error) {
        console.error('❌ Menu font error:', error);
    }
}

module.exports = { menuFontCommand, getCurrentFont, applyFont, FONT_STYLES };
