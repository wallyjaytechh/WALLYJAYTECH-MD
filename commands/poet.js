const fetch = require('node-fetch');
const translate = require('translatte'); // Import the translator

async function poetCommand(sock, chatId, message) {
    try {
        // 1. Get the original poet
        const response = await fetch('https://shizoapi.onrender.com/api/texts/shayari?apikey=shizo');
        const data = await response.json();
        
        if (!data || !data.result) {
            throw new Error('Invalid response from API');
        }

        // 2. Translate it to English
        // 'poet' is often poetic, so the translation might be literal
        const translation = await translate(data.result, { to: 'en' });
        const englishShayari = translation.text;

        const buttons = [
            { buttonId: '.poet', buttonText: { displayText: 'poet 🪄' }, type: 1 },
            { buttonId: '.roseday', buttonText: { displayText: '🌹 RoseDay' }, type: 1 }
        ];

        // 3. Send the English version
        await sock.sendMessage(chatId, { 
            text: englishShayari, 
            buttons: buttons, 
            headerType: 1 
        }, { quoted: message });

    } catch (error) {
        console.error('Error in poet command:', error);
        await sock.sendMessage(chatId, { 
            text: '*❌ Failed to fetch poet. Please try again later.*', 
        }, { quoted: message });
    }
}

module.exports = { poetCommand };
