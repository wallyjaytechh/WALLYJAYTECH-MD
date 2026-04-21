/**
 * WALLYJAYTECH-MD - Simple Dice Command
 * Roll a dice and get random dice sticker
 */

// WhatsApp native dice sticker IDs
// These are the actual WhatsApp dice sticker pack IDs
const diceStickers = [
    { id: '1@1', url: 'https://raw.githubusercontent.com/wallyjaytechh/stickers/main/dice/1.webp' },
    { id: '2@1', url: 'https://raw.githubusercontent.com/wallyjaytechh/stickers/main/dice/2.webp' },
    { id: '3@1', url: 'https://raw.githubusercontent.com/wallyjaytechh/stickers/main/dice/3.webp' },
    { id: '4@1', url: 'https://raw.githubusercontent.com/wallyjaytechh/stickers/main/dice/4.webp' },
    { id: '5@1', url: 'https://raw.githubusercontent.com/wallyjaytechh/stickers/main/dice/5.webp' },
    { id: '6@1', url: 'https://raw.githubusercontent.com/wallyjaytechh/stickers/main/dice/6.webp' }
];

const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

async function diceCommand(sock, chatId, message) {
    try {
        // Roll random number 1-6
        const result = Math.floor(Math.random() * 6);
        const diceFace = diceFaces[result];
        const diceNumber = result + 1;
        
        // Try to send as sticker using WhatsApp's native dice
        try {
            // Method 1: Using WhatsApp's native dice template
            await sock.sendMessage(chatId, {
                dice: diceNumber,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
        } catch (diceError) {
            // Method 2: Send as sticker from URL
            try {
                await sock.sendMessage(chatId, {
                    sticker: { url: diceStickers[result].url },
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420618370733@newsletter',
                            newsletterName: 'WALLYJAYTECH-MD BOTS',
                            serverMessageId: -1
                        }
                    }
                });
            } catch (stickerError) {
                // Method 3: Send text only
                await sock.sendMessage(chatId, {
                    text: `🎲 *DICE ROLL* 🎲\n\n━━━━━━━━━━━━━━━━━━━━\n${diceFace}  Result: *${diceNumber}*\n━━━━━━━━━━━━━━━━━━━━`
                });
            }
        }
        
    } catch (error) {
        console.error('Dice error:', error);
        // Fallback: send text only
        const result = Math.floor(Math.random() * 6);
        const diceFace = diceFaces[result];
        const diceNumber = result + 1;
        
        await sock.sendMessage(chatId, {
            text: `🎲 *DICE ROLL* 🎲\n\n━━━━━━━━━━━━━━━━━━━━\n${diceFace}  Result: *${diceNumber}*\n━━━━━━━━━━━━━━━━━━━━`
        });
    }
}

module.exports = diceCommand;
