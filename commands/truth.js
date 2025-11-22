const fetch = require('node-fetch');

async function truthCommand(sock, chatId, message) {
    try {
        const res = await fetch(`https://truth-dare-api.officialhectormanuel.workers.dev/?type=truth`);
        
        if (!res.ok) throw await res.text();
        
        const json = await res.json();
        const truthMessage = json?.game?.question || "Couldn't fetch a truth right now.";

        await sock.sendMessage(chatId, { text: truthMessage }, { quoted: message });
    } catch (error) {
        console.error('Error in truth command:', error);
        await sock.sendMessage(chatId, { text: '*❌ Failed to get truth. Please try again later!*' }, { quoted: message });
    }
}

module.exports = { truthCommand };
