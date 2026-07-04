const os = require('os');
const settings = require('../settings.js');

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

async function pingCommand(sock, chatId, message) {
    try {
        console.log('🏓 pingCommand called with chatId:', chatId);

        const start = Date.now();

        // DIAGNOSTIC: sending WITHOUT quote to isolate if quoting is the failure point
        await sock.sendMessage(chatId, { text: '📡 *Pong!* 🏓' });

        console.log('🏓 First ping message sent successfully');

        const end = Date.now();
        const ping = Math.round((end - start) / 2);

        const uptimeInSeconds = process.uptime();
        const uptimeFormatted = formatTime(uptimeInSeconds);

        const botInfo = `
╔══ *🤖WALLYJAYTECH-MD🤖* ════╗
║
║  *🚀 Ping: ${ping} ms*
║  *⏱️ Uptime: ${uptimeFormatted}*
║  *🔖 Version: ${settings.version}*
║
║   *Copyright wallyjaytech 2025*
╚════════════════════╝`.trim();

        // DIAGNOSTIC: sending WITHOUT quote here too
        await sock.sendMessage(chatId, { text: botInfo });

        console.log('🏓 Second ping message sent successfully');

    } catch (error) {
        console.error('❌ Error in ping command:', error);
        console.error('❌ Full error stack:', error.stack);
        try {
            await sock.sendMessage(chatId, { text: '❌ Failed to get bot status.' });
        } catch (innerError) {
            console.error('❌ Even the error message failed to send:', innerError);
        }
    }
}

module.exports = pingCommand;
