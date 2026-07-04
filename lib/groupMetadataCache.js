// lib/groupMetadataCache.js
// Caches sock.groupMetadata() results briefly to avoid hammering WhatsApp
// with duplicate calls from isOwnerOrSudo, isAdmin, Antilink, etc. on the
// same incoming message. This prevents "rate-overlimit" (429) errors that
// can throttle the ENTIRE connection, including private message sending.

const cache = new Map(); // chatId -> { data, timestamp }
const TTL_MS = 60 * 1000; // 60 seconds is plenty for a group's metadata to stay fresh

async function getGroupMetadataCached(sock, chatId) {
    const now = Date.now();
    const cached = cache.get(chatId);

    if (cached && (now - cached.timestamp) < TTL_MS) {
        return cached.data;
    }

    const data = await sock.groupMetadata(chatId);
    cache.set(chatId, { data, timestamp: now });
    return data;
}

// Optional: call this after a group update event to force-refresh
function invalidateGroupMetadata(chatId) {
    cache.delete(chatId);
}

module.exports = { getGroupMetadataCached, invalidateGroupMetadata };
