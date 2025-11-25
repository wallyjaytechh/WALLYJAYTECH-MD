const settings = require('../settings');

async function flirtCommand(sock, chatId, message) {
    try {
        // Array of flirty messages
        const flirtyMessages = [
            "Are you a magician? Because whenever I look at you, everyone else disappears. ✨",
            "Is your name Google? Because you have everything I've been searching for. 🔍",
            "Do you have a map? I keep getting lost in your eyes. 🗺️",
            "Are you made of copper and tellurium? Because you're Cu-Te. 😉",
            "Is there an airport nearby or is it my heart taking off? ✈️",
            "Do you believe in love at first sight or should I walk by again? 👀",
            "If you were a vegetable, you'd be a cute-cumber! 🥒",
            "Are you a campfire? Because you're hot and I want s'more. 🔥",
            "Is your dad a boxer? Because you're a knockout! 🥊",
            "Do you have a sunburn, or are you always this hot? ☀️",
            "Are you French? Because Eiffel for you. 🗼",
            "Can I follow you home? Cause my parents always told me to follow my dreams. 🏠",
            "Is your dad a thief? Because he stole the stars and put them in your eyes. ⭐",
            "Do you like Star Wars? Because Yoda one for me! 🌟",
            "Are you a time traveler? Because I see you in my future! ⏰",
            "If beauty were time, you'd be an eternity. ⏳",
            "Do you have a Band-Aid? I just scraped my knee falling for you. 🩹",
            "Are you a camera? Because every time I look at you, I smile. 📸",
            "Is there a rainbow today? I just found the treasure I've been searching for. 🌈",
            "Are you a loan? Because you have my interest. 💰",
            "Do you like science? Because I've got my ion you. ⚛️",
            "Are you a parking ticket? Because you've got FINE written all over you. 🚗",
            "Is your name Wi-fi? Because I'm really feeling a connection. 📶",
            "Are you a dream? Because I never want to wake up. 💤",
            "Do you have a name or can I call you mine? 💝",
            "Are you made of grapes? Because you're fine as wine. 🍇",
            "Is your heart a library? Because I'm checking you out. 📚",
            "Are you a bank loan? Because you have my interest! 🏦",
            "Do you like raisins? How about a date? 🍇",
            "Are you a cat? Because you're purr-fect. 🐱",
            "Is your dad a baker? Because you're a cutie pie! 🥧",
            "Do you have a sunburn, or are you always this hot? 🔥",
            "Are you a keyboard? Because you're just my type. ⌨️",
            "Is your name Chapstick? Because you're da balm! 💋",
            "Are you a parking ticket? 'Cause you've got FINE written all over you! 🚓",
            "Do you play soccer? Because you're a goal! ⚽",
            "Are you a banana? Because I find you a-peel-ing! 🍌",
            "Is your name Cinderella? Because I see that dress disappearing by midnight! 👠",
            "Are you a compound of boron and iodine? Because you're BOI-ing my mind! 🧪",
            "Do you like math? Because I think we should add each other! ➕"
        ];

        // Select random flirty message
        const randomFlirt = flirtyMessages[Math.floor(Math.random() * flirtyMessages.length)];

        // Create the final message with header
        const finalMessage = `💖 *FLIRT MESSAGE* 💖\n\n` +
                           `${randomFlirt}\n\n` +
                           `*${settings.packname || 'WALLYJAYTECH-MD'}* 🤖`;

        // Send the flirty message
        await sock.sendMessage(chatId, {
            text: finalMessage,
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

    } catch (error) {
        console.error('Error in flirt command:', error);
        
        await sock.sendMessage(chatId, {
            text: '*❌ Failed to generate flirty message!*\n\nPlease try again later.',
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

module.exports = flirtCommand;
