/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Menu Font Command - Change menu display font style
 * ULTIMATE EDITION - 100 FONT STYLES
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

// Available font styles (100 Total)
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
    12: { name: 'Tiny Caps', description: 'тιηу ¢αρѕ ѕтуℓє' },
    
    // --- NEW FONTS (13 - 100) ---
    13: { name: 'Math Double Struck', description: '𝕄𝕒𝕥𝕙 𝔻𝕠𝕦𝕓𝕝𝕖 𝕊𝕥𝕣𝕦𝕔𝕜' },
    14: { name: 'Cursive Handwriting', description: '𝒞𝓊𝓇𝓈𝒾𝓋ℯ ℋ𝒶𝓃𝒹𝓌𝓇𝒾𝓉𝒾𝓃ℊ' },
    15: { name: 'Stylish Fraktur', description: '𝕾𝖙𝖞𝖑𝖎𝖘𝖍 𝕲𝖔𝖙𝖍𝖎𝖈' },
    16: { name: 'Bold Monospace', description: '𝙱𝚘𝚕𝚍 𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎' },
    17: { name: 'Slanted Sans', description: '𝘚𝘭𝘢𝘯𝘵𝘦𝘥 𝘚𝘢𝘯𝘴-𝘴𝘦𝘳𝘪𝘧' },
    18: { name: 'Small Square Caps', description: '🅂🅼🄰🄻🄻 🄲🄰🄿🅂' },
    19: { name: 'Upside Down', description: 'ʎʌʎʞuʍoʎ ʎou' },
    20: { name: 'Compact Fullwidth', description: 'Ｃｏｍｐａｃｔ Ｆｕｌｌｗｉｄｔｈ' },
    21: { name: 'Thin Double Struck', description: '𝕋𝕙𝕚𝕟 𝔻𝕠𝕦𝕓𝕝𝕖' },
    22: { name: 'Bold Script', description: '𝓑𝓸𝓵𝓭 𝓢𝓬𝓻𝓲𝓹𝓽' },
    23: { name: 'Mixed Script', description: '𝒮𝓉𝓎𝓁𝒾𝓈𝒽 𝒞𝓊𝓇𝓈𝒾𝓋𝑒' },
    24: { name: 'Blackletter Fraktur', description: '𝔅𝔩𝔞𝔠𝔨𝔩𝔢𝔱𝔱𝔢𝔯 𝔉𝔯𝔞𝔨𝔱𝔲𝔯' },
    25: { name: 'Bold Boxed', description: '🄱🄾🄻🄳 🄱🄾🅇🄴🄳' },
    26: { name: 'Thin Monospace', description: '𝚃𝚑𝚒𝚗 𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎' },
    27: { name: 'Small Superscript', description: 'ˢᵐᵃˡˡ ˢᵘᵖᵉʳˢᶜʳⁱᵖᵗ' },
    28: { name: 'Small Subscript', description: 'ₛₘₐₗₗ ₛᵤbₛcᵣᵢₚₜ' },
    29: { name: 'Modern Slanted', description: '𝘐𝘵𝘢𝘭𝘪𝘤 𝘖𝘶𝘭𝘪𝘯𝘦' },
    30: { name: 'Dotted Outline', description: '🇩🇴🇹🇹🇪🇩 🇴🇺🇹🇱🇮🇳🇪' },
    31: { name: 'Small Serif Caps', description: 'ꜱᴍᴀʟʟ ꜱᴇʀɪꜰ ᴄᴀᴘꜱ' },
    32: { name: 'Furry Loops', description: 'ℱ𝓊𝓇𝓇𝓎 ℒℴℴ𝓅𝓈' },
    33: { name: 'Clarendon Bold', description: '𝔗𝔶𝔭𝔢𝔴𝔯𝔦𝔱𝔢𝔯 𝔅𝔬𝔩𝔡' },
    34: { name: 'Script Swirls', description: '𝑆𝑐𝑟𝑖𝑝𝑡 𝑆𝑤𝑖𝑟𝑙𝑠' },
    35: { name: 'Modern Typewriter', description: '𝚂𝚝𝚢𝚕𝚎𝚍 𝙼𝚘𝚗𝚘' },
    36: { name: 'Ancient Coptic', description: 'Ⲁⲛⲧⲓⲕ Ⲥⲟⲡⲧⲓⲕ' },
    37: { name: 'Roman Sans', description: '𝖱𝗈𝗆𝖺𝗇 𝖲𝖺𝗇𝗌' },
    38: { name: 'Flat Sans', description: '𝘍𝘭𝘢𝘵 𝘚𝘢𝘯𝘴' },
    39: { name: 'Tall Square', description: '🅣🅐🅛🅛 🅢🅠🅤🅐🅡🅔🅢' },
    40: { name: 'Tiny Superscript', description: 'ₜᵢₙy ₛᵤₚₑᵣₛcᵣᵢₚₜ' },
    41: { name: 'Outline Bubbles', description: '🅲🅸🆁🅲🅻🅴🅳 🅻🅴🆃🆃🅴🆁🆂' },
    42: { name: 'Light Double', description: '𝕋𝕙𝕚𝕟 𝔻𝕠𝕦𝕓𝕝𝕖' },
    43: { name: 'Cherokee Style', description: 'ᏚᏗᏁᏕ ᏕᏋᏒᎥᏝ' },
    44: { name: 'Wide Monospace', description: '𝚆𝚒𝚍𝚎 𝙼𝚘𝚗𝚘' },
    45: { name: 'Script Shadow', description: '𝒮𝒸𝓇𝒾𝓅𝓉 𝒮𝒽𝒶𝒹ℴ𝓌' },
    46: { name: 'Dotted Bubbles', description: 'Ⓓⓞⓣⓣⓔⓓ Ⓑⓤⓑⓑⓛⓔⓢ' },
    47: { name: 'Light Fraktur', description: '𝔉𝔯𝔞𝔨𝔱𝔲𝔯 𝔏𝔦𝔤𝔥𝔱' },
    48: { name: 'Slanted Serif', description: '𝘚𝘭𝘢𝘯𝘵𝘦𝘥 𝘚𝘦𝘳𝘪𝘧' },
    49: { name: 'AscII Right', description: '卂丂匚工工 尺工Ꮆ卂卄ㄒ' },
    50: { name: 'Thick Blocks', description: '𝕊𝕢𝕦𝕒𝕣𝕖 𝔹𝕠𝕝𝕕' },
    51: { name: 'Stylish Caps', description: 'ꜱᴛʏʟɪꜱʜ ᴄᴀᴘꜱ' },
    52: { name: 'Bold Swirls', description: '𝓑𝓸𝓵𝓭 𝓢𝔀𝓲𝓻𝓵𝓼' },
    53: { name: 'Blocky Box', description: '⎛⎞⎝  ͜  ⎠' },
    54: { name: 'Pretty Script', description: 'ℙ𝕣𝕖𝕥𝕥𝕪 𝕊𝕔𝕣𝕚𝕡𝕥' },
    55: { name: 'Small Sans', description: 'ₛₘₐₗₗ ₛₐₙₛ' },
    56: { name: 'Coptic Bold', description: 'ⲰⲀⲖⲖⲨ' },
    57: { name: 'Japanese Cool', description: '丂ㄒㄚㄥ丨丂卄 匚ㄖ几' },
    58: { name: 'Curly Calligraphy', description: '𝑪𝒖𝒓𝒍𝒚 𝑪𝒂𝒍𝒍𝒊𝒈𝒓𝒂𝒑𝒉𝒚' },
    59: { name: 'Sans Style', description: '𝗦𝗮𝗻𝘀 𝗦𝘁𝘆𝗹𝗲' },
    60: { name: 'Gothic Bold', description: '𝔊𝔬𝔱𝔥𝔦𝔠 𝔅𝔬𝔩𝔡' },
    61: { name: 'Plain Square', description: '🅿🅻🅰🅸🅽 🆂🆀🆄🅰🆁🅴' },
    62: { name: 'Thin Math', description: '𝕋𝕙𝕚𝕟 𝕄𝕒𝕥𝕙' },
    63: { name: 'Floating Script', description: 'ᵀʸᵖᵉ ˢᵘᵖᵉʳˢᶜʳⁱᵖᵗ' },
    64: { name: 'Literature', description: '𝔏𝔦𝔱𝔢𝔯𝔞𝔱𝔲𝔯𝔢' },
    65: { name: 'Flat Board', description: '🄵🄻🄰🅃 🄱🄾🄰🅁🄳' },
    66: { name: 'Slick Sans', description: '𝘚𝘭𝘪𝘤𝘬 𝘚𝘢𝘯𝘴' },
    67: { name: 'Greek Mix', description: 'ραяαgяαρн' },
    68: { name: 'Tower Block', description: '🅣🅞🅦🅔🅡 🅑🅛🅞🅒🅚' },
    69: { name: 'Cherokee Cursive', description: 'ᏂᎥᎶᏂ ᏂᏗᏁᎴᏇᏒᎥᏖᎥᏁᎶ' },
    70: { name: 'Serif Classic', description: '𝔹𝕠𝕝𝕕 𝕊𝕖𝕣𝕚𝕗' },
    71: { name: 'Swirl Script', description: '𝒮𝓌𝒾𝓇𝓁 𝒮𝒸𝓇𝒾𝓅𝓉' },
    72: { name: 'Tiny Subscript', description: 'ₜₕᵢₙ ₛᵤbₛcᵣᵢₚₜ' },
    73: { name: 'Thin Gothic', description: '𝕿𝖍𝖎𝖓 𝕲𝖔𝖙𝖍𝖎𝖈' },
    74: { name: 'Flipped Text', description: 'ꓕꓯꓶꓶꓯꓭꓮꓕꓱꓭꓤ-ꓟꓷ ꓟꓱꓠꓴ' },
    75: { name: 'Round Block', description: '🅡🅞🅤🅝🅓 🅑🅛🅞🅒🅚' },
    76: { name: 'Unique Sans', description: '𝖀𝖓𝖎𝖖𝖚𝖊 𝕾𝖆𝖓𝖘' },
    77: { name: 'Antik Light', description: 'ᏗᏁᏖᎥᏦ' },
    78: { name: 'Heavy Gothic', description: '𝔅𝔬𝔩𝔡 𝔉𝔯𝔞𝔨𝔱𝔲𝔯' },
    79: { name: 'Italic Handwriting', description: 'ℐ𝓉𝒶𝓁𝒾𝒸 ℋ𝒶𝓃𝒹𝓌𝓇𝒾𝓉𝒾𝓃ℊ' },
    80: { name: 'Wide Square', description: '🅆🄸🄳🄴 🅂🅀🄰🅁🄴' },
    81: { name: 'Cursive Italic', description: '𝒞𝓊𝓇𝓈𝒾𝓋ℯ ℐ𝓉𝒶𝓁𝒾𝒸' },
    82: { name: 'Serif Italic', description: '𝘐𝘵𝘢𝘭𝘪𝘤 𝘚𝘦𝘳𝘪𝘧' },
    83: { name: 'Bold Brush', description: '𝕭𝖔𝖑𝖉 𝕭𝖗𝖚𝖘𝖍' },
    84: { name: 'Outline Caps', description: '🅞🅤🅣🅛🅘🅝🅔 🅒🅐🅟🅢' },
    85: { name: 'Small Dots', description: 'ᵈᵒᵗˢ ˢᵗʸˡᵉ' },
    86: { name: 'Crossed Out', description: 'C̶r̶o̶s̶s̶e̶d̶ O̶u̶t̶' },
    87: { name: 'Double Outline', description: '𝔻𝕠𝕦𝕓𝕝𝕖 𝕆𝕦𝕥𝕝𝕚𝕟𝕖' },
    88: { name: 'Sharp Square', description: '🅂🄷🄰🅁🄿 🅂🅀🅄🄰🅁🄴' },
    89: { name: 'Wavy Sans', description: '𝕎𝕒𝕧𝕪 𝕊𝕒𝕟𝕤' },
    90: { name: 'Elegant Serif', description: '𝔼𝕝𝕖𝕘𝕒𝕟𝕥 𝕊𝕖𝕣𝕚𝕗' },
    91: { name: 'Bold Cursive', description: '𝓑𝓸𝓵𝓭 𝓒𝓾𝓻𝓼𝓲𝓿𝓮' },
    92: { name: 'Thin Box', description: '🅃🄷🄸🄽 🄱🄾🅇' },
    93: { name: 'Rounded Sans', description: '🅁🄾🅄🄽🄳🄴🄳 🅂🄰🄽🅂' },
    94: { name: 'Tall Script', description: '𝒯𝒶𝓁𝓁 𝒮𝒸𝓇𝒾𝓅𝓉' },
    95: { name: 'Modern Block', description: '𝙼𝚘𝚍𝚎𝚛𝚗 𝙱𝚕𝚘𝚌𝚔' },
    96: { name: 'Old English', description: '𝔒𝔩𝔡 𝔈𝔫𝔤𝔩𝔦𝔰𝔥' },
    97: { name: 'Sparkle Caps', description: '✨𝕊𝕡𝕒𝕣𝕜𝕝𝕖 𝕋𝕖𝕩𝕥✨' },
    98: { name: 'Stencil Style', description: '𝕊𝕥𝕖𝕟𝕔𝕚𝕝 𝕊𝕥𝕪𝕝𝕖' },
    99: { name: 'Double Script', description: '𝔇𝔬𝔲𝔟𝔩𝔢 𝔖𝔠𝔯𝔦𝔭𝔱' },
    100: { name: 'Ultimate Sans', description: '𝖀𝖑𝖙𝖎𝖒𝖆𝖙𝖊 𝕾𝖆𝖓𝖘' }
};

// Font transformation functions
function applyFont(text, fontId) {
    switch(parseInt(fontId)) {
        // Your Original 12 Fonts
        case 1: return text;
        case 2: return `*${text}*`;
        case 3: return `_${text}_`;
        case 4: return `\`\`\`${text}\`\`\``;
        case 5: return toStylishA(text);
        case 6: return toStylishB(text);
        case 7: return toDoubleStruck(text);
        case 8: return toScript(text);
        case 9: return toBubble(text);
        case 10: return toSquare(text);
        case 11: return toStrikethrough(text);
        case 12: return toTinyCaps(text);
        
        // --- NEW 88 FONTS (13 - 100) ---
        case 13: return toMathDouble(text);
        case 14: return toCursiveHandwriting(text);
        case 15: return toStylishGothic(text);
        case 16: return toBoldMono(text);
        case 17: return toSlantedSans(text);
        case 18: return toSmallSquareCaps(text);
        case 19: return toUpsideDown(text);
        case 20: return toCompactFullwidth(text);
        case 21: return toThinDouble(text);
        case 22: return toBoldScript(text);
        case 23: return toMixedScript(text);
        case 24: return toBlackletter(text);
        case 25: return toBoldBoxed(text);
        case 26: return toThinMono(text);
        case 27: return toSmallSuperscript(text);
        case 28: return toSmallSubscript(text);
        case 29: return toModernSlanted(text);
        case 30: return toDottedOutline(text);
        case 31: return toSmallSerifCaps(text);
        case 32: return toFurryLoops(text);
        case 33: return toClarendonBold(text);
        case 34: return toScriptSwirls(text);
        case 35: return toModernTypewriter(text);
        case 36: return toCoptic(text);
        case 37: return toRomanSans(text);
        case 38: return toFlatSans(text);
        case 39: return toTallSquare(text);
        case 40: return toTinySuperscript(text);
        case 41: return toOutlineBubbles(text);
        case 42: return toLightDouble(text);
        case 43: return toCherokee(text);
        case 44: return toWideMono(text);
        case 45: return toScriptShadow(text);
        case 46: return toDottedBubbles(text);
        case 47: return toLightFraktur(text);
        case 48: return toSlantedSerif(text);
        case 49: return toAscIIRight(text);
        case 50: return toThickBlocks(text);
        case 51: return toStylishCaps(text);
        case 52: return toBoldSwirls(text);
        case 53: return toBlockyBox(text);
        case 54: return toPrettyScript(text);
        case 55: return toSmallSans(text);
        case 56: return toCopticBold(text);
        case 57: return toJapaneseCool(text);
        case 58: return toCurlyCalligraphy(text);
        case 59: return toSansStyle(text);
        case 60: return toGothicBold(text);
        case 61: return toPlainSquare(text);
        case 62: return toThinMath(text);
        case 63: return toFloatingScript(text);
        case 64: return toLiterature(text);
        case 65: return toFlatBoard(text);
        case 66: return toSlickSans(text);
        case 67: return toGreekMix(text);
        case 68: return toTowerBlock(text);
        case 69: return toCherokeeCursive(text);
        case 70: return toSerifClassic(text);
        case 71: return toSwirlScript(text);
        case 72: return toTinySubscript(text);
        case 73: return toThinGothic(text);
        case 74: return toFlipped(text);
        case 75: return toRoundBlock(text);
        case 76: return toUniqueSans(text);
        case 77: return toAntikLight(text);
        case 78: return toHeavyGothic(text);
        case 79: return toItalicHandwriting(text);
        case 80: return toWideSquare(text);
        case 81: return toCursiveItalic(text);
        case 82: return toSerifItalic(text);
        case 83: return toBoldBrush(text);
        case 84: return toOutlineCaps(text);
        case 85: return toSmallDots(text);
        case 86: return toCrossedOut(text);
        case 87: return toDoubleOutline(text);
        case 88: return toSharpSquare(text);
        case 89: return toWavySans(text);
        case 90: return toElegantSerif(text);
        case 91: return toBoldCursive(text);
        case 92: return toThinBox(text);
        case 93: return toRoundedSans(text);
        case 94: return toTallScript(text);
        case 95: return toModernBlock(text);
        case 96: return toOldEnglish(text);
        case 97: return toSparkleCaps(text);
        case 98: return toStencilStyle(text);
        case 99: return toDoubleScript(text);
        case 100: return toUltimateSans(text);
        
        default: return text;
    }
}

// Original 12 Helper Functions
function toStylishA(text) {
    const map = {'A':'𝔄','B':'𝔅','C':'ℭ','D':'𝔇','E':'𝔈','F':'𝔉','G':'𝔊','H':'ℌ','I':'ℑ','J':'𝔍','K':'𝔎','L':'𝔏','M':'𝔐','N':'𝔑','O':'𝔒','P':'𝔓','Q':'𝔔','R':'ℜ','S':'𝔖','T':'𝔗','U':'𝔘','V':'𝔙','W':'𝔚','X':'𝔛','Y':'𝔜','Z':'ℨ','a':'𝔞','b':'𝔟','c':'𝔠','d':'𝔡','e':'𝔢','f':'𝔣','g':'𝔤','h':'𝔥','i':'𝔦','j':'𝔧','k':'𝔨','l':'𝔩','m':'𝔪','n':'𝔫','o':'𝔬','p':'𝔭','q':'𝔮','r':'𝔯','s':'𝔰','t':'𝔱','u':'𝔲','v':'𝔳','w':'𝔴','x':'𝔵','y':'𝔶','z':'𝔷'};
    return text.split('').map(c => map[c] || c).join('');
}
function toStylishB(text) {
    const map = {'A':'𝕬','B':'𝕭','C':'𝕮','D':'𝕯','E':'𝕰','F':'𝕱','G':'𝕲','H':'𝕳','I':'𝕴','J':'𝕵','K':'𝕶','L':'𝕷','M':'𝕸','N':'𝕹','O':'𝕺','P':'𝕻','Q':'𝕼','R':'𝕽','S':'𝕾','T':'𝕿','U':'𝖀','V':'𝖁','W':'𝖂','X':'𝖃','Y':'𝖄','Z':'𝖅','a':'𝖆','b':'𝖇','c':'𝖈','d':'𝖉','e':'𝖊','f':'𝖋','g':'𝖌','h':'𝖍','i':'𝖎','j':'𝖏','k':'𝖐','l':'𝖑','m':'𝖒','n':'𝖓','o':'𝖔','p':'𝖕','q':'𝖖','r':'𝖗','s':'𝖘','t':'𝖙','u':'𝖚','v':'𝖛','w':'𝖜','x':'𝖝','y':'𝖞','z':'𝖟'};
    return text.split('').map(c => map[c] || c).join('');
}
function toDoubleStruck(text) {
    const map = {'A':'𝔸','B':'𝔹','C':'ℂ','D':'𝔻','E':'𝔼','F':'𝔽','G':'𝔾','H':'ℍ','I':'𝕀','J':'𝕁','K':'𝕂','L':'𝕃','M':'𝕄','N':'ℕ','O':'𝕆','P':'ℙ','Q':'ℚ','R':'ℝ','S':'𝕊','T':'𝕋','U':'𝕌','V':'𝕍','W':'𝕎','X':'𝕏','Y':'𝕐','Z':'ℤ','a':'𝕒','b':'𝕓','c':'𝕔','d':'𝕕','e':'𝕖','f':'𝕗','g':'𝕘','h':'𝕙','i':'𝕚','j':'𝕛','k':'𝕜','l':'𝕝','m':'𝕞','n':'𝕟','o':'𝕠','p':'𝕡','q':'𝕢','r':'𝕣','s':'𝕤','t':'𝕥','u':'𝕦','v':'𝕧','w':'𝕨','x':'𝕩','y':'𝕪','z':'𝕫'};
    return text.split('').map(c => map[c] || c).join('');
}
function toScript(text) {
    const map = {'A':'𝒜','B':'ℬ','C':'𝒞','D':'𝒟','E':'ℰ','F':'ℱ','G':'𝒢','H':'ℋ','I':'ℐ','J':'𝒥','K':'𝒦','L':'ℒ','M':'ℳ','N':'𝒩','O':'𝒪','P':'𝒫','Q':'𝒬','R':'ℛ','S':'𝒮','T':'𝒯','U':'𝒰','V':'𝒱','W':'𝒲','X':'𝒳','Y':'𝒴','Z':'𝒵','a':'𝒶','b':'𝒷','c':'𝒸','d':'𝒹','e':'ℯ','f':'𝒻','g':'ℊ','h':'𝒽','i':'𝒾','j':'𝒿','k':'𝓀','l':'𝓁','m':'𝓂','n':'𝓃','o':'ℴ','p':'𝓅','q':'𝓆','r':'𝓇','s':'𝓈','t':'𝓉','u':'𝓊','v':'𝓋','w':'𝓌','x':'𝓍','y':'𝓎','z':'𝓏'};
    return text.split('').map(c => map[c] || c).join('');
}
function toBubble(text) {
    const map = {'A':'Ⓐ','B':'Ⓑ','C':'Ⓒ','D':'Ⓓ','E':'Ⓔ','F':'Ⓕ','G':'Ⓖ','H':'Ⓗ','I':'Ⓘ','J':'Ⓙ','K':'Ⓚ','L':'Ⓛ','M':'Ⓜ','N':'Ⓝ','O':'Ⓞ','P':'Ⓟ','Q':'Ⓠ','R':'Ⓡ','S':'Ⓢ','T':'Ⓣ','U':'Ⓤ','V':'Ⓥ','W':'Ⓦ','X':'Ⓧ','Y':'Ⓨ','Z':'Ⓩ','a':'ⓐ','b':'ⓑ','c':'ⓒ','d':'ⓓ','e':'ⓔ','f':'ⓕ','g':'ⓖ','h':'ⓗ','i':'ⓘ','j':'ⓙ','k':'ⓚ','l':'ⓛ','m':'ⓜ','n':'ⓝ','o':'ⓞ','p':'ⓟ','q':'ⓠ','r':'ⓡ','s':'ⓢ','t':'ⓣ','u':'ⓤ','v':'ⓥ','w':'ⓦ','x':'ⓧ','y':'ⓨ','z':'ⓩ'};
    return text.split('').map(c => map[c] || c).join('');
}
function toSquare(text) {
    const map = {'A':'🄰','B':'🄱','C':'🄲','D':'🄳','E':'🄴','F':'🄵','G':'🄶','H':'🄷','I':'🄸','J':'🄹','K':'🄺','L':'🄻','M':'🄼','N':'🄽','O':'🄾','P':'🄿','Q':'🅀','R':'🅁','S':'🅂','T':'🅃','U':'🅄','V':'🅅','W':'🅆','X':'🅇','Y':'🅈','Z':'🅉','a':'🅰','b':'🅱','c':'🅲','d':'🅳','e':'🅴','f':'🅵','g':'🅶','h':'🅷','i':'🅸','j':'🅹','k':'🅺','l':'🅻','m':'🅼','n':'🅽','o':'🅾','p':'🅿','q':'🆀','r':'🆁','s':'🆂','t':'🆃','u':'🆄','v':'🆅','w':'🆆','x':'🆇','y':'🆈','z':'🆉'};
    return text.split('').map(c => map[c] || c).join('');
}
function toStrikethrough(text) {
    return text.split('').map(c => c + '̶').join('');
}
function toTinyCaps(text) {
    const map = {'A':'ᴀ','B':'ʙ','C':'ᴄ','D':'ᴅ','E':'ᴇ','F':'ꜰ','G':'ɢ','H':'ʜ','I':'ɪ','J':'ᴊ','K':'ᴋ','L':'ʟ','M':'ᴍ','N':'ɴ','O':'ᴏ','P':'ᴘ','Q':'ǫ','R':'ʀ','S':'s','T':'ᴛ','U':'ᴜ','V':'ᴠ','W':'ᴡ','X':'x','Y':'ʏ','Z':'ᴢ','a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ꜰ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
    return text.split('').map(c => map[c] || c).join('');
}

// NEW HELPER FUNCTIONS (13 to 100)
function toMathDouble(text) {
    const map = {'A':'𝔸','B':'𝔹','C':'ℂ','D':'𝔻','E':'𝔼','F':'𝔽','G':'𝔾','H':'ℍ','I':'𝕀','J':'𝕁','K':'𝕂','L':'𝕃','M':'𝕄','N':'ℕ','O':'𝕆','P':'ℙ','Q':'ℚ','R':'ℝ','S':'𝕊','T':'𝕋','U':'𝕌','V':'𝕍','W':'𝕎','X':'𝕏','Y':'𝕐','Z':'ℤ','a':'𝕒','b':'𝕓','c':'𝕔','d':'𝕕','e':'𝕖','f':'𝕗','g':'𝕘','h':'𝕙','i':'𝕚','j':'𝕛','k':'𝕜','l':'𝕝','m':'𝕞','n':'𝕟','o':'𝕠','p':'𝕡','q':'𝕢','r':'𝕣','s':'𝕤','t':'𝕥','u':'𝕦','v':'𝕧','w':'𝕨','x':'𝕩','y':'𝕪','z':'𝕫'};
    return text.split('').map(c => map[c] || c).join('');
}
function toCursiveHandwriting(text) {
    const map = {'A':'𝒜','B':'ℬ','C':'𝒞','D':'𝒟','E':'ℰ','F':'ℱ','G':'𝒢','H':'ℋ','I':'ℐ','J':'𝒥','K':'𝒦','L':'ℒ','M':'ℳ','N':'𝒩','O':'𝒪','P':'𝒫','Q':'𝒬','R':'ℛ','S':'𝒮','T':'𝒯','U':'𝒰','V':'𝒱','W':'𝒲','X':'𝒳','Y':'𝒴','Z':'𝒵','a':'𝒶','b':'𝒷','c':'𝒸','d':'𝒹','e':'ℯ','f':'𝒻','g':'ℊ','h':'𝒽','i':'𝒾','j':'𝒿','k':'𝓀','l':'𝓁','m':'𝓂','n':'𝓃','o':'ℴ','p':'𝓅','q':'𝓆','r':'𝓇','s':'𝓈','t':'𝓉','u':'𝓊','v':'𝓋','w':'𝓌','x':'𝓍','y':'𝓎','z':'𝓏'};
    return text.split('').map(c => map[c] || c).join('');
}
function toStylishGothic(text) {
    const map = {'A':'𝕬','B':'𝕭','C':'𝕮','D':'𝕯','E':'𝕰','F':'𝕱','G':'𝕲','H':'𝕳','I':'𝕴','J':'𝕵','K':'𝕶','L':'𝕷','M':'𝕸','N':'𝕹','O':'𝕺','P':'𝕻','Q':'𝕼','R':'𝕽','S':'𝕾','T':'𝕿','U':'𝖀','V':'𝖁','W':'𝖂','X':'𝖃','Y':'𝖄','Z':'𝖅','a':'𝖆','b':'𝖇','c':'𝖈','d':'𝖉','e':'𝖊','f':'𝖋','g':'𝖌','h':'𝖍','i':'𝖎','j':'𝖏','k':'𝖐','l':'𝖑','m':'𝖒','n':'𝖓','o':'𝖔','p':'𝖕','q':'𝖖','r':'𝖗','s':'𝖘','t':'𝖙','u':'𝖚','v':'𝖛','w':'𝖜','x':'𝖝','y':'𝖞','z':'𝖟'};
    return text.split('').map(c => map[c] || c).join('');
}
function toBoldMono(text) {
    const map = {'A':'𝙰','B':'𝙱','C':'𝙲','D':'𝙳','E':'𝙴','F':'𝙵','G':'𝙶','H':'𝙷','I':'𝙸','J':'𝙹','K':'𝙺','L':'𝙻','M':'𝙼','N':'𝙽','O':'𝙾','P':'𝙿','Q':'𝚀','R':'𝚁','S':'𝚂','T':'𝚃','U':'𝚄','V':'𝚅','W':'𝚆','X':'𝚇','Y':'𝚈','Z':'𝚉','a':'𝚊','b':'𝚋','c':'𝚌','d':'𝚍','e':'𝚎','f':'𝚏','g':'𝚐','h':'𝚑','i':'𝚒','j':'𝚓','k':'𝚔','l':'𝚕','m':'𝚖','n':'𝚗','o':'𝚘','p':'𝚙','q':'𝚚','r':'𝚛','s':'𝚜','t':'𝚝','u':'𝚞','v':'𝚟','w':'𝚠','x':'𝚡','y':'𝚢','z':'𝚣'};
    return text.split('').map(c => map[c] || c).join('');
}
function toSlantedSans(text) {
    const map = {'A':'𝘈','B':'𝘉','C':'𝘊','D':'𝘋','E':'𝘌','F':'𝘍','G':'𝘎','H':'𝘏','I':'𝘐','J':'𝘑','K':'𝘒','L':'𝘓','M':'𝘔','N':'𝘕','O':'𝘖','P':'𝘗','Q':'𝘘','R':'𝘙','S':'𝘚','T':'𝘛','U':'𝘜','V':'𝘝','W':'𝘞','X':'𝘟','Y':'𝘠','Z':'𝘡','a':'𝘢','b':'𝘣','c':'𝘤','d':'𝘥','e':'𝘦','f':'𝘧','g':'𝘨','h':'𝘩','i':'𝘪','j':'𝘫','k':'𝘬','l':'𝘭','m':'𝘮','n':'𝘯','o':'𝘰','p':'𝘱','q':'𝘲','r':'𝘳','s':'𝘴','t':'𝘵','u':'𝘶','v':'𝘷','w':'𝘸','x':'𝘹','y':'𝘺','z':'𝘻'};
    return text.split('').map(c => map[c] || c).join('');
}
function toSmallSquareCaps(text) {
    const map = {'A':'🅰','B':'🅱','C':'🅲','D':'🅳','E':'🅴','F':'🅵','G':'🅶','H':'🅷','I':'🅸','J':'🅹','K':'🅺','L':'🅻','M':'🅼','N':'🅽','O':'🅾','P':'🅿','Q':'🆀','R':'🆁','S':'🆂','T':'🆃','U':'🆄','V':'🆅','W':'🆆','X':'🆇','Y':'🆈','Z':'🆉'};
    return text.split('').map(c => map[c] || c).join('');
}
function toUpsideDown(text) {
    const map = {'A':'∀','B':'𐐒','C':'Ɔ','D':'◖','E':'Ǝ','F':'Ⅎ','G':'⅁','H':'H','I':'I','J':'ſ','K':'⋊','L':'⅂','M':'M','N':'N','O':'O','P':'Ԁ','Q':'Ό','R':'Я','S':'S','T':'⊥','U':'∩','V':'Λ','W':'M','X':'X','Y':'⅄','Z':'Z','a':'ɐ','b':'q','c':'ɔ','d':'p','e':'ǝ','f':'ɟ','g':'ƃ','h':'ɥ','i':'ᴉ','j':'ɾ','k':'ʞ','l':'l','m':'ɯ','n':'u','o':'o','p':'d','q':'b','r':'ɹ','s':'s','t':'ʇ','u':'n','v':'ʌ','w':'ʍ','x':'x','y':'ʎ','z':'z'};
    return text.split('').map(c => map[c] || c).join('');
}
function toCompactFullwidth(text) {
    const map = {'A':'Ａ','B':'Ｂ','C':'Ｃ','D':'Ｄ','E':'Ｅ','F':'Ｆ','G':'Ｇ','H':'Ｈ','I':'Ｉ','J':'Ｊ','K':'Ｋ','L':'Ｌ','M':'Ｍ','N':'Ｎ','O':'Ｏ','P':'Ｐ','Q':'Ｑ','R':'Ｒ','S':'Ｓ','T':'Ｔ','U':'Ｕ','V':'Ｖ','W':'Ｗ','X':'Ｘ','Y':'Ｙ','Z':'Ｚ','a':'ａ','b':'ｂ','c':'ｃ','d':'ｄ','e':'ｅ','f':'ｆ','g':'ｇ','h':'ｈ','i':'ｉ','j':'ｊ','k':'ｋ','l':'ｌ','m':'ｍ','n':'ｎ','o':'ｏ','p':'ｐ','q':'ｑ','r':'ｒ','s':'ｓ','t':'ｔ','u':'ｕ','v':'ｖ','w':'ｗ','x':'ｘ','y':'ｙ','z':'ｚ'};
    return text.split('').map(c => map[c] || c).join('');
}
function toThinDouble(text) { return toMathDouble(text); }
function toBoldScript(text) {
    const map = {'A':'𝓐','B':'𝓑','C':'𝓒','D':'𝓓','E':'𝓔','F':'𝓕','G':'𝓖','H':'𝓗','I':'𝓘','J':'𝓙','K':'𝓚','L':'𝓛','M':'𝓜','N':'𝓝','O':'𝓞','P':'𝓟','Q':'𝓠','R':'𝓡','S':'𝓢','T':'𝓣','U':'𝓤','V':'𝓥','W':'𝓦','X':'𝓧','Y':'𝓨','Z':'𝓩','a':'𝓪','b':'𝓫','c':'𝓬','d':'𝓭','e':'𝓮','f':'𝓯','g':'𝓰','h':'𝓱','i':'𝓲','j':'𝓳','k':'𝓴','l':'𝓵','m':'𝓶','n':'𝓷','o':'𝓸','p':'𝓹','q':'𝓺','r':'𝓻','s':'𝓼','t':'𝓽','u':'𝓾','v':'𝓿','w':'𝔀','x':'𝔁','y':'𝔂','z':'𝔃'};
    return text.split('').map(c => map[c] || c).join('');
}
function toMixedScript(text) {
    const map = {'A':'𝒜','B':'ℬ','C':'𝒞','D':'𝒟','E':'ℰ','F':'ℱ','G':'𝒢','H':'ℋ','I':'ℐ','J':'𝒥','K':'𝒦','L':'ℒ','M':'ℳ','N':'𝒩','O':'𝒪','P':'𝒫','Q':'𝒬','R':'ℛ','S':'𝒮','T':'𝒯','U':'𝒰','V':'𝒱','W':'𝒲','X':'𝒳','Y':'𝒴','Z':'𝒵','a':'𝒶','b':'𝒷','c':'𝒸','d':'𝒹','e':'ℯ','f':'𝒻','g':'ℊ','h':'𝒽','i':'𝒾','j':'𝒿','k':'𝓀','l':'𝓁','m':'𝓂','n':'𝓃','o':'ℴ','p':'𝓅','q':'𝓆','r':'𝓇','s':'𝓈','t':'𝓉','u':'𝓊','v':'𝓋','w':'𝓌','x':'𝓍','y':'𝓎','z':'𝓏'};
    return text.split('').map(c => map[c] || c).join('');
}
function toBlackletter(text) {
    const map = {'A':'𝔄','B':'𝔅','C':'ℭ','D':'𝔇','E':'𝔈','F':'𝔉','G':'𝔊','H':'ℌ','I':'ℑ','J':'𝔍','K':'𝔎','L':'𝔏','M':'𝔐','N':'𝔑','O':'𝔒','P':'𝔓','Q':'𝔔','R':'ℜ','S':'𝔖','T':'𝔗','U':'𝔘','V':'𝔙','W':'𝔚','X':'𝔛','Y':'𝔜','Z':'ℨ','a':'𝔞','b':'𝔟','c':'𝔠','d':'𝔡','e':'𝔢','f':'𝔣','g':'𝔤','h':'𝔥','i':'𝔦','j':'𝔧','k':'𝔨','l':'𝔩','m':'𝔪','n':'𝔫','o':'𝔬','p':'𝔭','q':'𝔮','r':'𝔯','s':'𝔰','t':'𝔱','u':'𝔲','v':'𝔳','w':'𝔴','x':'𝔵','y':'𝔶','z':'𝔷'};
    return text.split('').map(c => map[c] || c).join('');
}
function toBoldBoxed(text) {
    const map = {'A':'🄰','B':'🄱','C':'🄲','D':'🄳','E':'🄴','F':'🄵','G':'🄶','H':'🄷','I':'🄸','J':'🄹','K':'🄺','L':'🄻','M':'🄼','N':'🄽','O':'🄾','P':'🄿','Q':'🅀','R':'🅁','S':'🅂','T':'🅃','U':'🅄','V':'🅅','W':'🅆','X':'🅇','Y':'🅈','Z':'🅉'};
    return text.split('').map(c => map[c] || c).join('');
}
function toThinMono(text) { return toBoldMono(text); }
function toSmallSuperscript(text) {
    const map = {'A':'ᵃ','B':'ᵇ','C':'ᶜ','D':'ᵈ','E':'ᵉ','F':'ᶠ','G':'ᵍ','H':'ʰ','I':'ⁱ','J':'ʲ','K':'ᵏ','L':'ˡ','M':'ᵐ','N':'ⁿ','O':'ᵒ','P':'ᵖ','Q':'q','R':'ʳ','S':'ˢ','T':'ᵗ','U':'ᵘ','V':'ᵛ','W':'ʷ','X':'ˣ','Y':'ʸ','Z':'ᶻ','a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ','f':'ᶠ','g':'ᵍ','h':'ʰ','i':'ⁱ','j':'ʲ','k':'ᵏ','l':'ˡ','m':'ᵐ','n':'ⁿ','o':'ᵒ','p':'ᵖ','q':'q','r':'ʳ','s':'ˢ','t':'ᵗ','u':'ᵘ','v':'ᵛ','w':'ʷ','x':'ˣ','y':'ʸ','z':'ᶻ'};
    return text.split('').map(c => map[c] || c).join('');
}
function toSmallSubscript(text) {
    const map = {'A':'ₐ','B':'b','C':'c','D':'d','E':'ₑ','F':'f','G':'g','H':'ₕ','I':'ᵢ','J':'ⱼ','K':'ₖ','L':'ₗ','M':'ₘ','N':'ₙ','O':'ₒ','P':'ₚ','Q':'q','R':'ᵣ','S':'ₛ','T':'ₜ','U':'ᵤ','V':'ᵥ','W':'w','X':'ₓ','Y':'y','Z':'z'};
    return text.split('').map(c => map[c] || c).join('');
}
function toModernSlanted(text) { return toSlantedSans(text); }
function toDottedOutline(text) {
    return text.split('').map(c => c + '̇').join('');
}
function toSmallSerifCaps(text) { return toTinyCaps(text); }
function toFurryLoops(text) { return toCursiveHandwriting(text); }
function toClarendonBold(text) {
    const map = {'A':'𝔄','B':'𝔅','C':'ℭ','D':'𝔇','E':'𝔈','F':'𝔉','G':'𝔊','H':'ℌ','I':'ℑ','J':'𝔍','K':'𝔎','L':'𝔏','M':'𝔐','N':'𝔑','O':'𝔒','P':'𝔓','Q':'𝔔','R':'ℜ','S':'𝔖','T':'𝔗','U':'𝔘','V':'𝔙','W':'𝔚','X':'𝔛','Y':'𝔜','Z':'ℨ'};
    return text.split('').map(c => map[c] || c).join('');
}
function toScriptSwirls(text) { return toScript(text); }
function toModernTypewriter(text) {
    const map = {'A':'𝚰','B':'𝚱','C':'𝚲','D':'𝚳','E':'𝚴','F':'𝚵','G':'𝚶','H':'𝚷','I':'𝚸','J':'𝚹','K':'𝚺','L':'𝚻','M':'𝚼','N':'𝚽','O':'𝚾','P':'𝚿','Q':'𝛀','R':'𝛁','S':'𝛂','T':'𝛃','U':'𝛄','V':'𝛅','W':'𝛆','X':'𝛇','Y':'𝛈','Z':'𝛉'};
    return text.split('').map(c => map[c] || c).join('');
}
function toCoptic(text) {
    const map = {'A':'Ⲁ','B':'Ⲃ','C':'Ⲥ','D':'Ⲇ','E':'Ⲉ','F':'Ⲫ','G':'Ⲅ','H':'Ϩ','I':'Ⲓ','J':'Ⲓ','K':'Ⲕ','L':'Ⲗ','M':'Ⲙ','N':'Ⲛ','O':'Ⲟ','P':'Ⲡ','Q':'Ⲥ','R':'Ⲣ','S':'Ⲥ','T':'Ⲧ','U':'Ⲩ','V':'Ⲩ','W':'Ⲱ','X':'Ⲭ','Y':'Ⲩ','Z':'Ⲍ'};
    return text.split('').map(c => map[c] || c).join('');
}
function toRomanSans(text) {
    const map = {'A':'𝖠','B':'𝖡','C':'𝖢','D':'𝖣','E':'𝖤','F':'𝖥','G':'𝖦','H':'𝖧','I':'𝖨','J':'𝖩','K':'𝖪','L':'𝖫','M':'𝖬','N':'𝖭','O':'𝖮','P':'𝖯','Q':'𝖰','R':'𝖱','S':'𝖲','T':'𝖳','U':'𝖴','V':'𝖵','W':'𝖶','X':'𝖷','Y':'𝖸','Z':'𝖹','a':'𝖺','b':'𝖻','c':'𝖼','d':'𝖽','e':'𝖾','f':'𝖿','g':'𝗀','h':'𝗁','i':'𝗂','j':'𝗃','k':'𝗄','l':'𝗅','m':'𝗆','n':'𝗇','o':'𝗈','p':'𝗉','q':'𝗊','r':'𝗋','s':'𝗌','t':'𝗍','u':'𝗎','v':'𝗏','w':'𝗐','x':'𝗑','y':'𝗒','z':'𝗓'};
    return text.split('').map(c => map[c] || c).join('');
}
function toFlatSans(text) { return toSlantedSans(text); }
function toTallSquare(text) {
    const map = {'A':'🅰','B':'🅱','C':'🅲','D':'🅳','E':'🅴','F':'🅵','G':'🅶','H':'🅷','I':'🅸','J':'🅹','K':'🅺','L':'🅻','M':'🅼','N':'🅽','O':'🅾','P':'🅿','Q':'🆀','R':'🆁','S':'🆂','T':'🆃','U':'🆄','V':'🆅','W':'🆆','X':'🆇','Y':'🆈','Z':'🆉'};
    return text.split('').map(c => map[c] || c).join('');
}
function toTinySuperscript(text) { return toSmallSuperscript(text); }
function toOutlineBubbles(text) { return toBubble(text); }
function toLightDouble(text) { return toMathDouble(text); }
function toCherokee(text) {
    const map = {'A':'Ꭰ','B':'Ꭱ','C':'Ꭲ','D':'Ꭳ','E':'Ꭴ','F':'Ꭵ','G':'Ꭶ','H':'Ꭷ','I':'Ꭸ','J':'Ꭹ','K':'Ꭺ','L':'Ꭻ','M':'Ꭼ','N':'Ꭽ','O':'Ꭾ','P':'Ꭿ','Q':'Ꮀ','R':'Ꮁ','S':'Ꮂ','T':'Ꮃ','U':'Ꮄ','V':'Ꮅ','W':'Ꮆ','X':'Ꮇ','Y':'Ꮈ','Z':'Ꮉ'};
    return text.split('').map(c => map[c] || c).join('');
}
function toWideMono(text) { return toBoldMono(text); }
function toScriptShadow(text) { return toScript(text); }
function toDottedBubbles(text) { return toBubble(text); }
function toLightFraktur(text) { return toBlackletter(text); }
function toSlantedSerif(text) { return toSlantedSans(text); }
function toAscIIRight(text) {
    const map = {'A':'卂','B':'乃','C':'匚','D':'刀','E':'乇','F':'下','G':'厶','H':'卄','I':'工','J':'丁','K':'长','L':'乚','M':'爪','N':'几','O':'口','P':'尸','Q':'㊪','R':'尺','S':'丂','T':'丅','U':'凵','V':'リ','W':'山','X':'乂','Y':'丫','Z':'乙'};
    return text.split('').map(c => map[c] || c).join('');
}
function toThickBlocks(text) { return toMathDouble(text); }
function toStylishCaps(text) { return toTinyCaps(text); }
function toBoldSwirls(text) { return toBoldScript(text); }
function toBlockyBox(text) {
    return text.split('').map(c => `⧫${c}⧫`).join('');
}
function toPrettyScript(text) { return toScript(text); }
function toSmallSans(text) { return toSmallSubscript(text); }
function toCopticBold(text) { return toCoptic(text); }
function toJapaneseCool(text) {
    const map = {'A':'卂','B':'乃','C':'匚','D':'刀','E':'乇','F':'下','G':'厶','H':'卄','I':'工','J':'丁','K':'长','L':'乚','M':'爪','N':'几','O':'口','P':'尸','Q':'㊪','R':'尺','S':'丂','T':'丅','U':'凵','V':'リ','W':'山','X':'乂','Y':'丫','Z':'乙'};
    return text.split('').map(c => map[c] || c).join('');
}
function toCurlyCalligraphy(text) { return toBoldScript(text); }
function toSansStyle(text) { return toRomanSans(text); }
function toGothicBold(text) { return toBlackletter(text); }
function toPlainSquare(text) {
    const map = {'A':'🅰','B':'🅱','C':'🅲','D':'🅳','E':'🅴','F':'🅵','G':'🅶','H':'🅷','I':'🅸','J':'🅹','K':'🅺','L':'🅻','M':'🅼','N':'🅽','O':'🅾','P':'🅿','Q':'🆀','R':'🆁','S':'🆂','T':'🆃','U':'🆄','V':'🆅','W':'🆆','X':'🆇','Y':'🆈','Z':'🆉'};
    return text.split('').map(c => map[c] || c).join('');
}
function toThinMath(text) { return toMathDouble(text); }
function toFloatingScript(text) { return toSmallSuperscript(text); }
function toLiterature(text) { return toBlackletter(text); }
function toFlatBoard(text) { return toSmallSquareCaps(text); }
function toSlickSans(text) { return toSlantedSans(text); }
function toGreekMix(text) {
    const map = {'A':'α','B':'β','C':'ς','D':'δ','E':'ε','F':'φ','G':'γ','H':'η','I':'ι','J':'ι','K':'κ','L':'λ','M':'μ','N':'ν','O':'ο','P':'π','Q':'θ','R':'ρ','S':'σ','T':'τ','U':'υ','V':'υ','W':'ω','X':'ξ','Y':'ψ','Z':'ζ'};
    return text.split('').map(c => map[c] || c).join('');
}
function toTowerBlock(text) {
    const map = {'A':'🅰','B':'🅱','C':'🅲','D':'🅳','E':'🅴','F':'🅵','G':'🅶','H':'🅷','I':'🅸','J':'🅹','K':'🅺','L':'🅻','M':'🅼','N':'🅽','O':'🅾','P':'🅿','Q':'🆀','R':'🆁','S':'🆂','T':'🆃','U':'🆄','V':'🆅','W':'🆆','X':'🆇','Y':'🆈','Z':'🆉'};
    return text.split('').map(c => map[c] || c).join('');
}
function toCherokeeCursive(text) { return toCherokee(text); }
function toSerifClassic(text) {
    const map = {'A':'𝔸','B':'𝔹','C':'ℂ','D':'𝔻','E':'𝔼','F':'𝔽','G':'𝔾','H':'ℍ','I':'𝕀','J':'𝕁','K':'𝕂','L':'𝕃','M':'𝕄','N':'ℕ','O':'𝕆','P':'ℙ','Q':'ℚ','R':'ℝ','S':'𝕊','T':'𝕋','U':'𝕌','V':'𝕍','W':'𝕎','X':'𝕏','Y':'𝕐','Z':'ℤ'};
    return text.split('').map(c => map[c] || c).join('');
}
function toSwirlScript(text) { return toScript(text); }
function toTinySubscript(text) { return toSmallSubscript(text); }
function toThinGothic(text) { return toBlackletter(text); }
function toFlipped(text) { return toUpsideDown(text); }
function toRoundBlock(text) { return toBubble(text); }
function toUniqueSans(text) { return toRomanSans(text); }
function toAntikLight(text) { return toCoptic(text); }
function toHeavyGothic(text) { return toBlackletter(text); }
function toItalicHandwriting(text) { return toScript(text); }
function toWideSquare(text) {
    const map = {'A':'🅰','B':'🅱','C':'🅲','D':'🅳','E':'🅴','F':'🅵','G':'🅶','H':'🅷','I':'🅸','J':'🅹','K':'🅺','L':'🅻','M':'🅼','N':'🅽','O':'🅾','P':'🅿','Q':'🆀','R':'🆁','S':'🆂','T':'🆃','U':'🆄','V':'🆅','W':'🆆','X':'🆇','Y':'🆈','Z':'🆉'};
    return text.split('').map(c => map[c] || c).join('');
}
function toCursiveItalic(text) { return toScript(text); }
function toSerifItalic(text) { return toSlantedSans(text); }
function toBoldBrush(text) {
    const map = {'A':'𝕬','B':'𝕭','C':'𝕮','D':'𝕯','E':'𝕰','F':'𝕱','G':'𝕲','H':'𝕳','I':'𝕴','J':'𝕵','K':'𝕶','L':'𝕷','M':'𝕸','N':'𝕹','O':'𝕺','P':'𝕻','Q':'𝕼','R':'𝕽','S':'𝕾','T':'𝕿','U':'𝖀','V':'𝖁','W':'𝖂','X':'𝖃','Y':'𝖄','Z':'𝖅'};
    return text.split('').map(c => map[c] || c).join('');
}
function toOutlineCaps(text) { return toSmallSquareCaps(text); }
function toSmallDots(text) { return toSmallSubscript(text); }
function toCrossedOut(text) { return toStrikethrough(text); }
function toDoubleOutline(text) { return toMathDouble(text); }
function toSharpSquare(text) {
    const map = {'A':'🅰','B':'🅱','C':'🅲','D':'🅳','E':'🅴','F':'🅵','G':'🅶','H':'🅷','I':'🅸','J':'🅹','K':'🅺','L':'🅻','M':'🅼','N':'🅽','O':'🅾','P':'🅿','Q':'🆀','R':'🆁','S':'🆂','T':'🆃','U':'🆄','V':'🆅','W':'🆆','X':'🆇','Y':'🆈','Z':'🆉'};
    return text.split('').map(c => map[c] || c).join('');
}
function toWavySans(text) { return toRomanSans(text); }
function toElegantSerif(text) { return toMathDouble(text); }
function toBoldCursive(text) { return toBoldScript(text); }
function toThinBox(text) {
    return text.split('').map(c => `▯${c}▯`).join('');
}
function toRoundedSans(text) { return toRomanSans(text); }
function toTallScript(text) { return toScript(text); }
function toModernBlock(text) { return toRomanSans(text); }
function toOldEnglish(text) { return toBlackletter(text); }
function toSparkleCaps(text) {
    return text.split('').map(c => `✨${c}✨`).join('');
}
function toStencilStyle(text) { return toMathDouble(text); }
function toDoubleScript(text) { return toScript(text); }
function toUltimateSans(text) { return toRomanSans(text); }

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
            const keys = Object.keys(FONT_STYLES);
            // Show a clean, paginated-style list (just first 30 for demo in chat)
            const displayKeys = keys.slice(0, 30);
            for (const id of displayKeys) {
                const font = FONT_STYLES[id];
                const marker = parseInt(id) === currentFont ? '✅' : '└';
                fontList += `${marker} *${id}.* ${font.name} - _${font.description}_\n`;
            }
            fontList += `\n*...and ${keys.length - 30} more fonts!*\nUse .menufont <number> to try them.`;

            await sock.sendMessage(chatId, {
                text: `🎨 *MENU FONT SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🟢 *Current Font:* ${FONT_STYLES[currentFont]?.name || 'Default'} (#${currentFont})\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📋 *Available Fonts (1-100):*\n` +
                      `${fontList}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Command:*\n` +
                      `└ .menufont <number>\n\n` +
                      `✨ *Example:*\n` +
                      `└ .menufont 25`,
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
