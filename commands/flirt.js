const fetch = require('node-fetch');
const translate = require('translatte'); // Import the translator

async function flirtCommand(sock, chatId, message) {
    try {
        const shizokeys = 'shizo';
        // 1. Fetch the original message (likely in Indonesian/Mixed)
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/flirt?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const originalMessage = json.result;

        // 2. Translate the message to English ('en')
        // You can change 'en' to 'es' (Spanish), 'fr' (French), etc.
        const translation = await translate(originalMessage, { to: 'en' });
        const finalMessage = translation.text;

        // 3. Send the translated message
        await sock.sendMessage(chatId, { text: finalMessage }, { quoted: message });

    } catch (error) {
        console.error('Error in flirt command:', error);
        await sock.sendMessage(chatId, { text: '*❌ Failed to get flirt message. Please try again later!*' }, { quoted: message });
    }
}

module.exports = { flirtCommand };
