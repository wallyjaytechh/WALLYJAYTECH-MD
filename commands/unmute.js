 async function unmuteCommand(sock, chatId) {
    await sock.groupSettingUpdate(chatId, 'not_announcement'); // Unmute the group
    await sock.sendMessage(chatId, { text: '*🔴This group has been successfully unmuted🔴.*' });
}

module.exports = unmuteCommand;
