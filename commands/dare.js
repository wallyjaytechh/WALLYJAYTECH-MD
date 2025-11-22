const fetch = require('node-fetch');

async function dareCommand(sock, chatId, message) {
    try {
        const res = await fetch(`https://truth-dare-api.officialhectormanuel.workers.dev/?type=dare`);
        
        if (!res.ok) throw await res.text();
        
        const json = await res.json();
        const dareMessage = json?.game?.question || "Couldn't fetch a dare right now.";

        await sock.sendMessage(chatId, { text: dareMessage }, { quoted: message });
    } catch (error) {
        console.error('Error in dare command:', error);
        await sock.sendMessage(chatId, { text: '*❌ Failed to get dare. Please try again later!*' }, { quoted: message });
    }
}

module.exports = { dareCommand };
