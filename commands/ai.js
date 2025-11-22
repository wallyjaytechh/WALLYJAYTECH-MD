const axios = require("axios");

async function gptCommand(sock, chatId, message, query) {
    try {
        // React with 🤖 while processing
        await sock.sendMessage(chatId, {
            react: { text: "🤖", key: message.key }
        });

        const apiUrl = `https://all-in-1-ais.officialhectormanuel.workers.dev/?query=${encodeURIComponent(query)}&model=gpt-4.5`;

        const response = await axios.get(apiUrl);

        if (response.data && response.data.success && response.data.message?.content) {
            const answer = response.data.message.content;
            await sock.sendMessage(chatId, { text: answer }, { quoted: message });
        } else {
            throw new Error("Invalid GPT response");
        }
    } catch (error) {
        console.error("GPT API Error:", error.message);
        await sock.sendMessage(chatId, { text: "*❌ GPT failed. Try again later.*" }, { quoted: message });
    }
}

module.exports = { gptCommand };
