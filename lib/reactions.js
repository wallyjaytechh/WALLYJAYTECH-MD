//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                                                                                                        //
//                                                             𝐖𝐀𝐋𝐋𝐘𝐉𝐀𝐘𝐓𝐄𝐂𝐇-𝐌𝐃 𝐁𝐎𝐓                                                                                                     //
//                                                                                                                                                                                        //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                                                                                                                                        //
//                                                                                                                                                                                        //
//                ██╗    ██╗ █████╗ ██╗     ██╗  ██╗   ██╗   ██╗ █████╗ ██╗   ██╗████████╗███████╗ ██████╗██╗  ██╗      ███╗   ███╗██████╗                                 //
//                ██║    ██║██╔══██╗██║     ██║  ╚██╗ ██╔╝   ██║██╔══██╗╚██╗ ██╔╝╚══██╔══╝██╔════╝██╔════╝██║  ██║      ████╗ ████║██╔══██╗                              //
//                ██║ █╗ ██║███████║██║     ██║   ╚████╔╝    ██║███████║ ╚████╔╝    ██║   █████╗  ██║     ███████║█████╗██╔████╔██║██║  ██║                               //
//                ██║███╗██║██╔══██║██║     ██║    ╚██╔╝██   ██║██╔══██║  ╚██╔╝     ██║   ██╔══╝  ██║     ██╔══██║╚════╝██║╚██╔╝██║██║  ██║                               //
//                ╚███╔███╔╝██║  ██║███████╗███████╗██║ ╚█████╔╝██║  ██║   ██║      ██║   ███████╗╚██████╗██║  ██║      ██║ ╚═╝ ██║██████╔╝                              //
//                 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝      ╚═╝     ╚═╝╚═════╝                                 //
//                                                                                                                                                                                        //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2025                                                                                                        //
//                                                                                                                                                                                        //
//                                                                                                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * project_name : WALLYJAYTECH-MD
//  * author : wallyjaytech
//  * youtube : https://www.youtube.com/wallyjaytechy
//  * description : WALLYJAYTECH-MD ,A Multi-Device whatsapp user bot.
//*
//*
//re-upload? recode? copy code? give credit to wallyjaytech 2025:)
//Instagram: wallyjaytech
//Telegram: t.me/wallyjaytech
//GitHub: wallyjaytechh
//WhatsApp: +2348144317152
//want more free bot scripts? subscribe to my youtube channel: https://youtube.com/@wallyjaytechy
//   * Created By Github: wallyjaytechh.
//   * Credit To ally jay tech
//   * © 2025 WALLYJAYTECH-MD.
// ⛥┌┤
// */
/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Auto-React Command - Professional reaction system
 * Features: Include/Exclude numbers | Bulk add | Full emoji keyboard
 */

const fs = require('fs');
const path = require('path');

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

const reactionEmojis = [
    // Smileys & Emotion
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😶‍🌫️', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤',
    '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '😵‍💫', '🤯', '🤠', '🥳', '🥸',
    '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰',
    '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈',
    '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼',
    '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊',
    // Hearts
    '💋', '💌', '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', '❤️‍🔥', '❤️‍🩹', '❤️', '🧡',
    '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍',
    // Hands & Body
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
    '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️',
    '👅', '👄', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵', '🙍', '🙎',
    '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷', '👮', '🕵️', '💂', '🥷', '👷', '🤴', '👸', '👳',
    '👲', '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧝',
    '🧞', '🧟', '💆', '💇', '🚶', '🧍', '🧎', '🏃', '💃', '🕺', '🕴️', '👯', '🧖', '🧗', '🤸', '⛹️',
    '🏋️', '🚴', '🚵', '🤼', '🤽', '🤾', '🤺', '⛷️', '🏂', '🏄', '🚣', '🏊', '🤿', '🧘', '🛀', '🛌',
    // People & Family
    '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👨‍👨‍👦', '👨‍👨‍👧', '👨‍👨‍👧‍👦', '👨‍👨‍👦‍👦', '👨‍👨‍👧‍👧', '👩‍👩‍👦', '👩‍👩‍👧', '👩‍👩‍👧‍👦', '👩‍👩‍👦‍👦', '👩‍👩‍👧‍👧', '👨‍👦', '👨‍👦‍👦', '👨‍👧', '👨‍👧‍👦', '👨‍👧‍👧', '👩‍👦', '👩‍👦‍👦', '👩‍👧', '👩‍👧‍👦', '👩‍👧‍👧',
    // Animals & Nature
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈',
    '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴',
    '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🦂', '🐢',
    '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🐠', '🐟', '🐡', '🐬', '🦈', '🐳', '🐋', '🐊',
    '🦭', '🦧', '🐘', '🦣', '🦏', '🦛', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖',
    '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦤', '🦚', '🦜',
    '🦢', '🦩', '🕊️', '🐇', '🦫', '🦔', '🦇', '🐻‍❄️', '🐿️', '🦥', '🦦', '🦨', '🐾', '🐉', '🐲',
    '🌵', '🎄', '🌲', '🌳', '🌴', '🪹', '🪺', '🪵', '🌱', '🌿', '☘️', '🍀', '🎍', '🪴', '🎋', '🍃',
    '🍂', '🍁', '🍄', '🐚', '🪨', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝',
    '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '🪐',
    '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️',
    '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔', '☂️', '🌊', '🌫️',
    // Food & Drink
    '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥',
    '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠',
    '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴',
    '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝',
    '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡',
    '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜',
    '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸',
    '🍹', '🧉', '🍾', '🧊', '🥄', '🍴', '🍽️', '🥣', '🥡', '🥢', '🧂',
    // Activities & Sports
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
    '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌',
    '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽',
    '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹',
    '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎷', '🎸', '🎹', '🎺', '🎻', '🪕', '🥁', '🪘', '🎮', '👾',
    '🎯', '🎲', '♟️', '🕹️', '🎰', '🎳', '🧩', '🪅', '🪆', '🧿',
    // Travel & Places
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵',
    '🚲', '🛴', '🛹', '🦼', '🦽', '🦯', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋',
    '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️',
    '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🪝', '🚧', '⛽', '🚏', '🚦',
    '🚥', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '🏖️', '🏝️', '🏜️', '🌋', '⛰️',
    '🏔️', '🗻', '🏕️', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩',
    '🏪', '🏫', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩️', '🛤️', '🛣️', '🗾', '🎑', '🏞️', '🌅', '🌄',
    '🌠', '🎇', '🎆', '🌇', '🌆', '🏙️', '🌃', '🌌', '🌉', '🌁',
    // Objects
    '⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷',
    '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️',
    '⏲️', '⏰', '🕰️', '⌛', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴',
    '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚',
    '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️',
    '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '🪬', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩻', '🩹', '🩺', '💊',
    '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🪠', '🧺', '🧻', '🚽', '🚿', '🛁', '🪥', '🪒',
    '🧴', '🧷', '🧹', '🧽', '🧼', '🪣', '🧯', '🛒',
    // Symbols
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈',
    '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴',
    '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲',
    '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷',
    '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️',
    '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤',
    '🏧', '🚾', '♿', '🅿️', '🛗', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚰', '🚮', '🎦', '📶', '🈁',
    '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '🔟', '🔢', '⏏️', '▶️', '⏸️',
    '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️',
    '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵',
    '🎶', '➕', '➖', '➗', '✖️', '🟰', '♾️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚',
    '🔙', '🔛', '🔝', '🔜', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺',
    '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨',
    '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '💬', '💭',
    '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗',
    '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧',
    // Flags
    '🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇺🇳',
    '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿',
    '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇲', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇧🇳', '🇧🇬',
    '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇨🇻', '🇧🇶', '🇨🇫', '🇹🇩', '🇨🇱', '🇨🇳', '🇨🇴', '🇰🇲', '🇨🇬', '🇨🇩', '🇨🇰',
    '🇨🇷', '🇨🇮', '🇭🇷', '🇨🇺', '🇨🇼', '🇨🇾', '🇨🇿', '🇩🇰', '🇩🇯', '🇩🇲', '🇩🇴', '🇪🇨', '🇪🇬', '🇸🇻', '🇬🇶', '🇪🇷',
    '🇪🇪', '🇪🇹', '🇫🇰', '🇫🇴', '🇫🇯', '🇫🇮', '🇫🇷', '🇬🇫', '🇵🇫', '🇬🇦', '🇬🇲', '🇬🇪', '🇩🇪', '🇬🇭', '🇬🇮', '🇬🇷',
    '🇬🇱', '🇬🇩', '🇬🇵', '🇬🇺', '🇬🇹', '🇬🇬', '🇬🇳', '🇬🇼', '🇬🇾', '🇭🇹', '🇭🇳', '🇭🇰', '🇭🇺', '🇮🇸', '🇮🇳', '🇮🇩',
    '🇮🇷', '🇮🇶', '🇮🇪', '🇮🇱', '🇮🇹', '🇯🇲', '🇯🇵', '🎌', '🇯🇪', '🇯🇴', '🇰🇿', '🇰🇪', '🇰🇮', '🇰🇵', '🇰🇷', '🇰🇼',
    '🇰🇬', '🇱🇦', '🇱🇻', '🇱🇧', '🇱🇸', '🇱🇷', '🇱🇾', '🇱🇮', '🇱🇹', '🇱🇺', '🇲🇴', '🇲🇬', '🇲🇼', '🇲🇾', '🇲🇻', '🇲🇱',
    '🇲🇹', '🇲🇭', '🇲🇶', '🇲🇷', '🇲🇺', '🇾🇹', '🇲🇽', '🇫🇲', '🇲🇩', '🇲🇨', '🇲🇳', '🇲🇪', '🇲🇸', '🇲🇦', '🇲🇿', '🇲🇲',
    '🇳🇦', '🇳🇷', '🇳🇵', '🇳🇱', '🇳🇨', '🇳🇿', '🇳🇮', '🇳🇪', '🇳🇬', '🇳🇺', '🇳🇫', '🇲🇰', '🇲🇵', '🇳🇴', '🇴🇲', '🇵🇰',
    '🇵🇼', '🇵🇸', '🇵🇦', '🇵🇬', '🇵🇾', '🇵🇪', '🇵🇭', '🇵🇳', '🇵🇱', '🇵🇹', '🇵🇷', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇺', '🇷🇼',
    '🇼🇸', '🇸🇲', '🇸🇦', '🇸🇳', '🇷🇸', '🇸🇨', '🇸🇱', '🇸🇬', '🇸🇽', '🇸🇰', '🇸🇮', '🇸🇧', '🇸🇴', '🇿🇦', '🇸🇸', '🇪🇸',
    '🇱🇰', '🇸🇩', '🇸🇷', '🇸🇿', '🇸🇪', '🇨🇭', '🇸🇾', '🇹🇼', '🇹🇯', '🇹🇿', '🇹🇭', '🇹🇱', '🇹🇬', '🇹🇰', '🇹🇴', '🇹🇹',
    '🇹🇳', '🇹🇷', '🇹🇲', '🇹🇻', '🇺🇬', '🇺🇦', '🇦🇪', '🇬🇧', '🇺🇸', '🇺🇾', '🇺🇿', '🇻🇺', '🇻🇦', '🇻🇪', '🇻🇳', '🇼🇫',
    '🇪🇭', '🇾🇪', '🇿🇲', '🇿🇼'
];

const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

const defaultSettings = {
    enabled: false,
    reactToCommands: true,
    reactToOthers: true,
    reactToSelf: true,
    reactInGroups: true,
    reactInDMs: true,
    reactInLockedGroups: true,
    randomMode: true,
    specificEmoji: '💊',
    emojiPool: reactionEmojis,
    includeMode: false,
    numberList: []
};

// ═══════════════════════════════════════
// STATE MANAGEMENT (Auto-migrate)
// ═══════════════════════════════════════

function loadAutoReactionState() {
    try {
        if (fs.existsSync(USER_GROUP_DATA)) {
            const data = JSON.parse(fs.readFileSync(USER_GROUP_DATA));
            const loaded = data.autoReaction || { ...defaultSettings };
            for (const [key, value] of Object.entries(defaultSettings)) {
                if (loaded[key] === undefined) loaded[key] = value;
            }
            return loaded;
        }
    } catch (error) { console.error('Error loading auto-reaction state:', error); }
    return { ...defaultSettings };
}

function saveAutoReactionState(settings) {
    try {
        const data = fs.existsSync(USER_GROUP_DATA)
            ? JSON.parse(fs.readFileSync(USER_GROUP_DATA))
            : { groups: [], chatbot: {} };
        data.autoReaction = settings;
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    } catch (error) { console.error('Error saving auto-reaction state:', error); }
}

let settings = loadAutoReactionState();

// ═══════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════

function getRandomEmoji() { return settings.emojiPool[Math.floor(Math.random() * settings.emojiPool.length)]; }
function getReactionEmoji() { return settings.randomMode ? getRandomEmoji() : settings.specificEmoji; }

function extractPhoneNumber(jid) {
    if (!jid) return null;
    const parts = jid.split('@')[0].split(':')[0];
    return parts.replace(/[^0-9]/g, '');
}

function isNumberInList(jid) {
    if (!settings.numberList || settings.numberList.length === 0) return null;
    const phone = extractPhoneNumber(jid);
    if (!phone) return null;
    
    // Match: exact match or ends with (for numbers with/without country code)
    const found = settings.numberList.some(num => {
        return phone === num || phone.endsWith(num) || num.endsWith(phone);
    });
    
    if (settings.includeMode) {
        return found; // true = react, false = skip
    } else {
        return !found; // true = react (not excluded), false = skip (excluded)
    }
}

async function isGroupLocked(sock, chatId) {
    try {
        if (!chatId.endsWith('@g.us')) return false;
        const metadata = await sock.groupMetadata(chatId);
        return metadata.announce !== false;
    } catch (error) { return false; }
}

function hasAnyContent(message) {
    if (!message || !message.message) return false;
    const msg = message.message;
    return !!(msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage || msg.videoMessage ||
              msg.audioMessage || msg.stickerMessage || msg.documentMessage || msg.contactMessage ||
              msg.locationMessage || msg.buttonsResponseMessage || msg.listResponseMessage || msg.reactionMessage);
}

async function shouldReactToMessage(sock, message) {
    if (!settings.enabled) return false;
    
    const chatId = message.key.remoteJid;
    const senderId = message.key.participant || message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const isSelf = message.key.fromMe;
    const isCommand = message.message?.conversation?.startsWith('.') || message.message?.extendedTextMessage?.text?.startsWith('.');
    
    if (!hasAnyContent(message)) return false;
    if (isGroup && !settings.reactInGroups) return false;
    if (!isGroup && !settings.reactInDMs) return false;
    
    if (isGroup) {
        const isLocked = await isGroupLocked(sock, chatId);
        if (isLocked && !settings.reactInLockedGroups) return false;
    }
    
    // Check include/exclude list with debug
    const listResult = isNumberInList(senderId);
    if (settings.numberList.length > 0) {
        console.log(`🔍 AREACT | sender: ${extractPhoneNumber(senderId)} | mode: ${settings.includeMode ? 'INCLUDE' : 'EXCLUDE'} | list: [${settings.numberList.join(',')}] | react: ${listResult}`);
    }
    if (listResult !== null && !listResult) return false;
    
    if (isCommand && !settings.reactToCommands) return false;
    if (!isCommand && !isSelf && !settings.reactToOthers) return false;
    if (isSelf && !settings.reactToSelf) return false;
    if (message.message?.protocolMessage) return false;
    
    return true;
}

// ═══════════════════════════════════════
// REACTION HANDLERS
// ═══════════════════════════════════════

async function handleAutoreact(sock, message) {
    try {
        const shouldReact = await shouldReactToMessage(sock, message);
        if (!shouldReact) return;
        const emoji = getReactionEmoji();
        try { await sock.sendMessage(message.key.remoteJid, { react: { text: emoji, key: message.key } }); }
        catch (error) { console.error('Error adding auto-reaction:', error); }
    } catch (error) { console.error('Error in handleAutoreact:', error); }
}

async function addCommandReaction(sock, message) {
    try {
        const shouldReact = await shouldReactToMessage(sock, message);
        if (!shouldReact || !message?.key?.id) return;
        const emoji = getReactionEmoji();
        await sock.sendMessage(message.key.remoteJid, { react: { text: emoji, key: message.key } });
    } catch (error) { console.error('Error adding command reaction:', error); }
}

// ═══════════════════════════════════════
// COMMAND HANDLER
// ═══════════════════════════════════════

async function handleAreactCommand(sock, chatId, message, isOwner) {
    try {
        if (!isOwner) {
            await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner!', ...channelInfo });
            return;
        }

        const userMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = userMessage.split(' ').slice(1);
        const action = args[0]?.toLowerCase();

        if (!action) {
            const status = settings.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = settings.enabled ? '🟢' : '🔴';
            const mode = settings.randomMode ? '🎲 Random' : `🎯 Specific (${settings.specificEmoji})`;
            const filterMode = settings.includeMode ? '✅ Include Only' : '🚫 Exclude';
            const numberCount = settings.numberList.length;

            await sock.sendMessage(chatId, {
                text: `🎭 *AUTO-REACT SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `🎲 *Mode:* ${mode}\n` +
                      `📦 *Emoji Pool:* ${settings.emojiPool.length}+ available\n` +
                      `🔢 *Filter:* ${filterMode} (${numberCount} numbers)\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📊 *React To:*\n` +
                      `└ Commands: ${settings.reactToCommands ? '✅' : '❌'}\n` +
                      `└ Others: ${settings.reactToOthers ? '✅' : '❌'}\n` +
                      `└ Self: ${settings.reactToSelf ? '✅' : '❌'}\n` +
                      `└ Groups: ${settings.reactInGroups ? '✅' : '❌'}\n` +
                      `└ DMs: ${settings.reactInDMs ? '✅' : '❌'}\n` +
                      `└ Locked: ${settings.reactInLockedGroups ? '✅' : '❌'}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .areact on/off\n` +
                      `└ .areact random / specific <emoji>\n` +
                      `└ .areact emojis\n` +
                      `└ .areact commands/others/self on/off\n` +
                      `└ .areact groups/dms/lockedgroups on/off\n` +
                      `└ .areact include add <numbers>\n` +
                      `└ .areact include remove <numbers>\n` +
                      `└ .areact exclude add <numbers>\n` +
                      `└ .areact exclude remove <numbers>\n` +
                      `└ .areact includelist / excludelist\n` +
                      `└ .areact includeclear / excludeclear\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Examples:*\n` +
                      `└ .areact include add 2347012345678\n` +
                      `└ .areact include add 2347012345678,2349012345678\n` +
                      `└ .areact exclude add 2348012345678\n\n` +
                      `⚠️ Country code is required (234 for Nigeria)`,
                ...channelInfo
            });
            return;
        }

        if (action === 'on') {
            if (settings.enabled) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎭 Auto-React is already *ON*.\n\n💡 Use .areact off to disable.`,
                    ...channelInfo
                });
                return;
            }
            settings.enabled = true;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, {
                text: `✅ *AUTO-REACT ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will react to messages instantly.\n🎲 Mode: ${settings.randomMode ? 'Random' : 'Specific'}\n💚 ${settings.randomMode ? `${settings.emojiPool.length}+ emojis` : `Using: ${settings.specificEmoji}`}`,
                ...channelInfo
            });
        }
        else if (action === 'off') {
            if (!settings.enabled) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎭 Auto-React is already *OFF*.\n\n💡 Use .areact on to enable.`,
                    ...channelInfo
                });
                return;
            }
            settings.enabled = false;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, {
                text: `❌ *AUTO-REACT DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will no longer react to messages.\n\n💡 Use .areact on to enable.`,
                ...channelInfo
            });
        }
        else if (action === 'random') {
            if (settings.randomMode) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY RANDOM*\n\n━━━━━━━━━━━━━━━━━━━━\n🎲 Random mode is already *ON*.\n\n💡 Use .areact specific <emoji> to change.`,
                    ...channelInfo
                });
                return;
            }
            settings.randomMode = true;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, {
                text: `🎲 *RANDOM MODE ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will react with random emojis.\n\n✨ *Sample:* ${getRandomEmoji()} ${getRandomEmoji()} ${getRandomEmoji()}`,
                ...channelInfo
            });
        }
        else if (action === 'specific') {
            const emoji = args[1];
            if (!emoji) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE:* .areact specific <emoji>\n\n✨ *Example:* .areact specific ❤️`,
                    ...channelInfo
                });
                return;
            }
            if (settings.specificEmoji === emoji && !settings.randomMode) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY SET*\n\n━━━━━━━━━━━━━━━━━━━━\n🎯 Specific emoji is already *${emoji}*.`,
                    ...channelInfo
                });
                return;
            }
            settings.randomMode = false;
            settings.specificEmoji = emoji;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, {
                text: `🎯 *SPECIFIC REACTION SET*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Emoji: ${emoji}\n\n📌 Bot will react with ${emoji} to all messages.`,
                ...channelInfo
            });
        }
        else if (action === 'emojis') {
            const page = parseInt(args[1]) || 1;
            const perPage = 30;
            const totalPages = Math.ceil(settings.emojiPool.length / perPage);
            const start = (page - 1) * perPage;
            const pageEmojis = settings.emojiPool.slice(start, start + perPage);
            const emojiList = pageEmojis.map((e, i) => `${start + i + 1}. ${e}`).join('\n');

            await sock.sendMessage(chatId, {
                text: `📦 *AVAILABLE EMOJIS*\n\n━━━━━━━━━━━━━━━━━━━━\n📊 Total: ${settings.emojiPool.length}\n📄 Page: ${page}/${totalPages}\n\n${emojiList}\n\n💡 .areact emojis <page>`,
                ...channelInfo
            });
        }
        // Include commands
        else if (action === 'include') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'add') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) {
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *USAGE:* .areact include add <numbers>\n\n✨ *Single:* .areact include add 2347012345678\n✨ *Bulk:* .areact include add 2347012345678,2349012345678\n\n⚠️ Country code is required`,
                        ...channelInfo
                    });
                    return;
                }
                settings.includeMode = true;
                const added = [];
                for (const num of numbers) {
                    if (!settings.numberList.includes(num)) {
                        settings.numberList.push(num);
                        added.push(num);
                    }
                }
                saveAutoReactionState(settings);
                await sock.sendMessage(chatId, {
                    text: `✅ *INCLUDE ADDED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Mode: *Include Only*\n🔢 Added ${added.length} number(s):\n${added.map(n => `└ +${n}`).join('\n')}\n\n📊 Total in list: ${settings.numberList.length}\n\n💡 Bot will ONLY react to these numbers.`,
                    ...channelInfo
                });
            }
            else if (sub === 'remove') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) {
                    await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .areact include remove <numbers>`, ...channelInfo });
                    return;
                }
                const before = settings.numberList.length;
                settings.numberList = settings.numberList.filter(n => !numbers.includes(n));
                saveAutoReactionState(settings);
                await sock.sendMessage(chatId, {
                    text: `✅ *INCLUDE REMOVED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Removed ${before - settings.numberList.length} number(s).\n📊 Remaining: ${settings.numberList.length}`,
                    ...channelInfo
                });
            }
            else {
                await sock.sendMessage(chatId, {
                    text: `📋 *INCLUDE MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 Numbers: ${settings.numberList.length}\n\n📖 .areact include add <numbers>\n📖 .areact include remove <numbers>\n📖 .areact includelist\n📖 .areact includeclear`,
                    ...channelInfo
                });
            }
        }
        // Exclude commands
        else if (action === 'exclude') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'add') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) {
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *USAGE:* .areact exclude add <numbers>\n\n✨ *Single:* .areact exclude add 2347012345678\n✨ *Bulk:* .areact exclude add 2347012345678,2349012345678\n\n⚠️ Country code is required`,
                        ...channelInfo
                    });
                    return;
                }
                settings.includeMode = false;
                const added = [];
                for (const num of numbers) {
                    if (!settings.numberList.includes(num)) {
                        settings.numberList.push(num);
                        added.push(num);
                    }
                }
                saveAutoReactionState(settings);
                await sock.sendMessage(chatId, {
                    text: `✅ *EXCLUDE ADDED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Mode: *Exclude*\n🔢 Added ${added.length} number(s):\n${added.map(n => `└ +${n}`).join('\n')}\n📊 Total excluded: ${settings.numberList.length}\n\n💡 Bot will NOT react to these numbers.`,
                    ...channelInfo
                });
            }
            else if (sub === 'remove') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) {
                    await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .areact exclude remove <numbers>`, ...channelInfo });
                    return;
                }
                const before = settings.numberList.length;
                settings.numberList = settings.numberList.filter(n => !numbers.includes(n));
                saveAutoReactionState(settings);
                await sock.sendMessage(chatId, {
                    text: `✅ *EXCLUDE REMOVED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Removed ${before - settings.numberList.length} number(s).\n📊 Remaining: ${settings.numberList.length}`,
                    ...channelInfo
                });
            }
            else {
                await sock.sendMessage(chatId, {
                    text: `📋 *EXCLUDE MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 Numbers: ${settings.numberList.length}\n\n📖 .areact exclude add <numbers>\n📖 .areact exclude remove <numbers>\n📖 .areact excludelist\n📖 .areact excludeclear`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'includelist') {
            const page = parseInt(args[1]) || 1;
            const perPage = 20;
            const totalPages = Math.ceil(settings.numberList.length / perPage) || 1;
            const start = (page - 1) * perPage;
            const pageNums = settings.numberList.slice(start, start + perPage);
            await sock.sendMessage(chatId, {
                text: `📋 *INCLUDE LIST*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 Mode: *Include Only*\n📊 Total: ${settings.numberList.length}\n📄 Page: ${page}/${totalPages}\n\n${pageNums.length > 0 ? pageNums.map((n, i) => `${start + i + 1}. +${n}`).join('\n') : '└ No numbers'}\n\n💡 .areact includelist <page>`,
                ...channelInfo
            });
        }
        else if (action === 'excludelist') {
            const page = parseInt(args[1]) || 1;
            const perPage = 20;
            const totalPages = Math.ceil(settings.numberList.length / perPage) || 1;
            const start = (page - 1) * perPage;
            const pageNums = settings.numberList.slice(start, start + perPage);
            await sock.sendMessage(chatId, {
                text: `📋 *EXCLUDE LIST*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 Mode: *Exclude*\n📊 Total: ${settings.numberList.length}\n📄 Page: ${page}/${totalPages}\n\n${pageNums.length > 0 ? pageNums.map((n, i) => `${start + i + 1}. +${n}`).join('\n') : '└ No numbers'}\n\n💡 .areact excludelist <page>`,
                ...channelInfo
            });
        }
        else if (action === 'includeclear') {
            settings.numberList = [];
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { text: `✅ *INCLUDE LIST CLEARED*`, ...channelInfo });
        }
        else if (action === 'excludeclear') {
            settings.numberList = [];
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { text: `✅ *EXCLUDE LIST CLEARED*`, ...channelInfo });
        }
        else if (['commands', 'others', 'self', 'groups', 'dms', 'lockedgroups'].includes(action)) {
            const subAction = args[1]?.toLowerCase();
            if (subAction === 'on' || subAction === 'off') {
                const settingMap = {
                    'commands': 'reactToCommands', 'others': 'reactToOthers', 'self': 'reactToSelf',
                    'groups': 'reactInGroups', 'dms': 'reactInDMs', 'lockedgroups': 'reactInLockedGroups'
                };
                const key = settingMap[action];
                const newState = subAction === 'on';

                if (settings[key] === newState) {
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *ALREADY ${newState ? 'ENABLED' : 'DISABLED'}*\n\n━━━━━━━━━━━━━━━━━━━━\n🎭 ${action} reactions are already *${newState ? 'ON' : 'OFF'}*.\n\n💡 Use .areact ${action} ${newState ? 'off' : 'on'} to change.`,
                        ...channelInfo
                    });
                    return;
                }
                settings[key] = newState;
                saveAutoReactionState(settings);
                await sock.sendMessage(chatId, {
                    text: `🎭 *${action.toUpperCase()} REACTIONS ${newState ? 'ENABLED ✅' : 'DISABLED ❌'}*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will ${newState ? 'now' : 'no longer'} react to ${action} messages.`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .areact ${action} on/off`, ...channelInfo });
            }
        }
        else {
            await sock.sendMessage(chatId, {
                text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Use .areact to see all available options.`,
                ...channelInfo
            });
        }
    } catch (error) { console.error('Error handling areact command:', error); }
}

module.exports = { addCommandReaction, handleAreactCommand, handleAutoreact };
