//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                                                                            //
//                                                             𝐖𝐀𝐋𝐋𝐘𝐉𝐀𝐘𝐓𝐄𝐂𝐇-𝐌𝐃 𝐁𝐎𝐓                                                                         //
//                                                                                                                                                            //
//                                                          𝐂𝐇𝐈𝐏 𝐒𝐘𝐒𝐓𝐄𝐌 𝐌𝐎𝐃𝐔𝐋𝐄                                                                            //
//                                                                                                                                                            //
//                                                                  𝐕 : 1.0.0                                                                                 //
//                                                                                                                                                            //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//

// Obfuscated module initialization
const _0x3d5b = ['exports', 'stringify', './data/chips.json', './data/transactions.json', 'parse', 'readFileSync', 'writeFileSync', './settings.js', 'ownerNumber', 'botOwner', 'notify', 'name', '@s.whatsapp.net', 'replace', 'length', 'startsWith', 'slice', 'split', 'toLowerCase', 'includes', 'participant', 'remoteJid', 'admin', 'purchase', 'chipsBought', 'chipsReceived', 'chips', 'log', 'Error', 'toString', 'replace', 'toLocaleString', 'sendMessage', 'text', 'quoted', '❌', '🔐', 'UNLIMITED CHIPS', 'Please enter password', 'Example', 'Incorrect password', '🎉', 'UNLIMITED CHIPS ACTIVATED', '💰', 'New Balance', 'Error processing command', 'BUY CHIPS', 'PREMIUM PACKAGES', 'Contact Owner', 'https://wa.me/', 'Chip Packages', 'Starter Pack', 'Pro Pack', 'VIP Pack', 'Ultimate Pack', 'How to Buy', 'Payment Methods', 'Note', 'Error fetching purchase information', 'ADD CHIPS TO USER', 'Usage', 'This will add', 'Maximum chip addition', 'Get user info', 'Save transaction log', 'CHIPS ADDED SUCCESSFULLY', 'User', 'Number', 'Amount Added', 'Time', 'Transaction ID', 'CHIPS RECEIVED', 'Thank you for your purchase', 'Error adding chips', 'CHECK USER BALANCE', 'USER BALANCE REPORT', 'JID', 'Chip Balance', 'Account Exists', 'Last Updated', 'Error checking user balance', 'RESET USER CHIPS', 'Warning', 'USER CHIPS RESET', 'Old Balance', 'Change', 'Reset Time', 'Error resetting user chips', 'VIEW TRANSACTIONS', 'TRANSACTION HISTORY', 'No transactions found', 'RECENT TRANSACTIONS', 'SUMMARY', 'Total Transactions', 'Total Chips Distributed', 'Error fetching transactions'];
const _0x1a2f = function() {
    const _0x4567 = [0x39, 0x32, 0x35, 0x33, 0x32, 0x30, 0x30, 0x36];
    return _0x4567.map(_0x => String.fromCharCode(_0x)).join('');
};

const _0x2b8c = {
    'CHIPS_FILE': _0x3d5b[0x2],
    'TRANSACTIONS_FILE': _0x3d5b[0x3],
    'SETTINGS_PATH': _0x3d5b[0x7],
    'PASSWORD_HASH': _0x1a2f(),
    'STARTING_CHIPS': 0x3e8,
    'UNLIMITED_AMOUNT': 0xf4240,
    'MAX_SINGLE_ADD': 0x989680
};

// Core module functions (obfuscated)
function _0x4e7d(_0x5a9b, _0x4c2d = {}) {
    try {
        const _0x5f8a = require('fs');
        if (_0x5f8a.existsSync(_0x5a9b)) {
            return JSON[_0x3d5b[0x4]](_0x5f8a[_0x3d5b[0x5]](_0x5a9b, 'utf8'));
        }
    } catch (_0x5e9c) {
        console.error('Load error:', _0x5e9c);
    }
    return _0x4c2d;
}

function _0x3f9a(_0x6b2d, _0x7c1e) {
    try {
        require('fs')[_0x3d5b[0x6]](_0x6b2d, JSON[_0x3d5b[0x1]](_0x7c1e, null, 0x2), 'utf8');
    } catch (_0x8d3f) {
        console.error('Save error:', _0x8d3f);
    }
}

function _0x2c7d() {
    try {
        return require(_0x2b8c.SETTINGS_PATH);
    } catch (_0x9a4b) {
        return {
            [_0x3d5b[0x8]]: '2348144317152',
            [_0x3d5b[0x9]]: 'Wally Jay'
        };
    }
}

async function _0x5e3c(_0xa1b2, _0xb2c3) {
    try {
        const _0xc3d4 = _0x2c7d();
        const _0xd4e5 = _0xc3d4[_0x3d5b[0x8]][_0x3d5b[0x13]](_0x3d5b[0xc]) ? 
            _0xc3d4[_0x3d5b[0x8]] : 
            `${_0xc3d4[_0x3d5b[0x8]]}${_0x3d5b[0xc]}`;
        return _0xb2c3 === _0xd4e5 || _0xb2c3 === _0xa1b2.user.id;
    } catch (_0xe5f6) {
        return ![];
    }
}

function _0x6f4a(_0x7a8b) {
    return _0x7a8b[_0x3d5b[0x1d]]()[_0x3d5b[0x1e]](/\B(?=(\d{3})+(?!\d))/g, ',');
}

function _0x8g5b(_0x9h6c) {
    return _0x9h6c === _0x2b8c.PASSWORD_HASH;
}

function _0x1i2j(_0x2k3l) {
    return _0x2k3l.key[_0x3d5b[0x14]] || _0x2k3l.key[_0x3d5b[0x15]];
}

function _0x3m4n(_0x4o5p) {
    const _0x5q6r = _0x4e7d(_0x2b8c.CHIPS_FILE, {});
    if (!_0x5q6r[_0x4o5p]) {
        _0x5q6r[_0x4o5p] = {
            [_0x3d5b[0x19]]: _0x2b8c.STARTING_CHIPS,
            'lastDaily': null,
            'totalWon': 0x0,
            'totalLost': 0x0,
            [_0x3d5b[0x17]]: 0x0,
            [_0x3d5b[0x18]]: 0x0
        };
        _0x3f9a(_0x2b8c.CHIPS_FILE, _0x5q6r);
    }
    return _0x5q6r[_0x4o5p][_0x3d5b[0x19]];
}

function _0x6r7s(_0x7s8t, _0x8t9u, _0x9u0v = _0x3d5b[0x16]) {
    const _0x0v1w = _0x4e7d(_0x2b8c.CHIPS_FILE, {});
    if (!_0x0v1w[_0x7s8t]) {
        _0x0v1w[_0x7s8t] = {
            [_0x3d5b[0x19]]: _0x2b8c.STARTING_CHIPS,
            'lastDaily': null,
            'totalWon': 0x0,
            'totalLost': 0x0,
            [_0x3d5b[0x17]]: 0x0,
            [_0x3d5b[0x18]]: 0x0
        };
    }
    if (_0x9u0v === _0x3d5b[0x1a]) {
        _0x0v1w[_0x7s8t][_0x3d5b[0x17]] = (_0x0v1w[_0x7s8t][_0x3d5b[0x17]] || 0x0) + _0x8t9u;
    } else if (_0x9u0v === _0x3d5b[0x16]) {
        _0x0v1w[_0x7s8t][_0x3d5b[0x18]] = (_0x0v1w[_0x7s8t][_0x3d5b[0x18]] || 0x0) + _0x8t9u;
    }
    _0x0v1w[_0x7s8t][_0x3d5b[0x19]] += _0x8t9u;
    if (_0x0v1w[_0x7s8t][_0x3d5b[0x19]] < 0x0) {
        _0x0v1w[_0x7s8t][_0x3d5b[0x19]] = 0x0;
    }
    _0x3f9a(_0x2b8c.CHIPS_FILE, _0x0v1w);
    return _0x0v1w[_0x7s8t][_0x3d5b[0x19]];
}

async function _0x9w0x(_0xa1y2, _0xb2z3) {
    try {
        let _0xc3a4 = _0xb2z3[_0x3d5b[0xd]](/[^0-9]/g, '');
        if (!_0xc3a4[_0x3d5b[0xf]]('234') && _0xc3a4[_0x3d5b[0xe]] === 0xa) {
            _0xc3a4 = '234' + _0xc3a4[_0x3d5b[0x10]](0x1);
        }
        const _0xd4b5 = `${_0xc3a4}${_0x3d5b[0xc]}`;
        const _0xe5c6 = await _0xa1y2.getContact(_0xd4b5).catch(() => null);
        return {
            'jid': _0xd4b5,
            'number': _0xc3a4,
            [_0x3d5b[0xb]]: _0xe5c6?.[_0x3d5b[0xa]] || _0xe5c6?.[_0x3d5b[0xb]] || `User (${_0xc3a4})`,
            'exists': !!_0xe5c6
        };
    } catch (_0xf6d7) {
        return {
            'jid': `${_0xb2z3[_0x3d5b[0xd]](/[^0-9]/g, '')}${_0x3d5b[0xc]}`,
            'number': _0xb2z3[_0x3d5b[0xd]](/[^0-9]/g, ''),
            [_0x3d5b[0xb]]: `User (${_0xb2z3})`,
            'exists': ![]
        };
    }
}

// Command implementations (obfuscated)
async function _0xa8b9(_0xb9ca, _0xcadb, _0xdbec, _0xecfd) {
    try {
        const _0xfdfe = _0x1i2j(_0xdbec);
        const _0x0e0f = await _0x5e3c(_0xb9ca, _0xfdfe);
        if (!_0x0e0f) {
            await _0xb9ca[_0x3d5b[0x21]](_0xcadb, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} This command is only for the bot owner!` 
            }, { [_0x3d5b[0x24]]: _0xdbec });
            return;
        }
        if (_0xecfd[_0x3d5b[0xe]] === 0x0) {
            await _0xb9ca[_0x3d5b[0x21]](_0xcadb, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x25]} *${_0x3d5b[0x26]}*\n\n${_0x3d5b[0x27]}:\n\`.unlimitedchips [password]\`\n\n${_0x3d5b[0x28]}: \`.unlimitedchips admin123\`` 
            }, { [_0x3d5b[0x24]]: _0xdbec });
            return;
        }
        const _0x1f2f = _0xecfd[0x0];
        if (!_0x8g5b(_0x1f2f)) {
            await _0xb9ca[_0x3d5b[0x21]](_0xcadb, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} ${_0x3d5b[0x29]}!` 
            }, { [_0x3d5b[0x24]]: _0xdbec });
            return;
        }
        const _0x2g3h = _0x2b8c.UNLIMITED_AMOUNT;
        const _0x3h4i = _0x6r7s(_0xfdfe, _0x2g3h, _0x3d5b[0x16]);
        await _0xb9ca[_0x3d5b[0x21]](_0xcadb, { 
            [_0x3d5b[0x22]]: `${_0x3d5b[0x2a]} *${_0x3d5b[0x2b]}!*\n\n${_0x3d5b[0x2c]} +${_0x6f4a(_0x2g3h)} chips added!\n\n${_0x3d5b[0x2d]}: ${_0x3d5b[0x2c]} ${_0x6f4a(_0x3h4i)} chips\n\nYou now have unlimited chips to test the bot!` 
        }, { [_0x3d5b[0x24]]: _0xdbec });
    } catch (_0x4i5j) {
        console[_0x3d5b[0x1b]](`${_0x3d5b[0x1c]} in unlimitedchips:`, _0x4i5j);
        await _0xb9ca[_0x3d5b[0x21]](_0xcadb, { 
            [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} ${_0x3d5b[0x2e]}.` 
        }, { [_0x3d5b[0x24]]: _0xdbec });
    }
}

async function _0xb5j6(_0xc6k7, _0xd7l8, _0xe8m9) {
    try {
        const _0xf9n0 = _0x2c7d();
        const _0x0o1p = _0xf9n0[_0x3d5b[0x8]];
        const _0x1p2q = _0xf9n0[_0x3d5b[0x9]] || 'Bot Owner';
        const _0x2q3r = `https://wa.me/${_0x0o1p}`;
        const _0x3r4s = `${_0x3d5b[0x2c]} *${_0x3d5b[0x2f]} - ${_0x3d5b[0x30]}* ${_0x3d5b[0x2c]}\n\n` +
            `*${_0x3d5b[0x31]}*\n` +
            `👑 ${_0x1p2q}\n` +
            `📞 +${_0x0o1p}\n` +
            `🔗 ${_0x2q3r}\n\n` +
            `*${_0x3d5b[0x32]}*\n` +
            `🎁 *${_0x3d5b[0x33]}*: 5,000 chips - ₦500 / $1\n` +
            `🏆 *${_0x3d5b[0x34]}*: 25,000 chips - ₦2,000 / $4\n` +
            `👑 *${_0x3d5b[0x35]}*: 100,000 chips - ₦5,000 / $10\n` +
            `💎 *${_0x3d5b[0x36]}*: 1,000,000 chips - ₦20,000 / $40\n\n` +
            `*${_0x3d5b[0x37]}*\n` +
            `1. Message the owner using the link above\n` +
            `2. Specify which package you want\n` +
            `3. Make payment\n` +
            `4. Owner will add chips to your account\n\n` +
            `*${_0x3d5b[0x38]}*\n` +
            `• Bank Transfer (Nigeria)\n` +
            `• PayPal\n` +
            `• Cryptocurrency (BTC, USDT)\n` +
            `• Mobile Money\n\n` +
            `*${_0x3d5b[0x39]}*: Once payment is confirmed, chips will be added instantly!`;
        await _0xc6k7[_0x3d5b[0x21]](_0xd7l8, { 
            [_0x3d5b[0x22]]: _0x3r4s 
        }, { [_0x3d5b[0x24]]: _0xe8m9 });
    } catch (_0x4s5t) {
        console[_0x3d5b[0x1b]](`${_0x3d5b[0x1c]} in buychips:`, _0x4s5t);
        await _0xc6k7[_0x3d5b[0x21]](_0xd7l8, { 
            [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} ${_0x3d5b[0x3a]}.` 
        }, { [_0x3d5b[0x24]]: _0xe8m9 });
    }
}

async function _0xc7t8(_0xd8u9, _0xe9v0, _0xf0w1, _0x1x2y) {
    try {
        const _0x2y3z = _0x1i2j(_0xf0w1);
        const _0x3z4a = await _0x5e3c(_0xd8u9, _0x2y3z);
        if (!_0x3z4a) {
            await _0xd8u9[_0x3d5b[0x21]](_0xe9v0, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} This command is only for the bot owner!` 
            }, { [_0x3d5b[0x24]]: _0xf0w1 });
            return;
        }
        if (_0x1x2y[_0x3d5b[0xe]] < 0x3) {
            await _0xd8u9[_0x3d5b[0x21]](_0xe9v0, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x25]} *${_0x3d5b[0x3b]}*\n\n${_0x3d5b[0x3c]}:\n\`.addchips [password] [user-number] [amount]\`\n\n${_0x3d5b[0x28]}:\n\`.addchips admin123 2348144317152 5000\`\n\n${_0x3d5b[0x3d]} 5,000 chips to user 2348144317152` 
            }, { [_0x3d5b[0x24]]: _0xf0w1 });
            return;
        }
        const _0x4a5b = _0x1x2y[0x0];
        const _0x5b6c = _0x1x2y[0x1];
        const _0x6c7d = parseInt(_0x1x2y[0x2]);
        if (!_0x8g5b(_0x4a5b)) {
            await _0xd8u9[_0x3d5b[0x21]](_0xe9v0, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} ${_0x3d5b[0x29]}!` 
            }, { [_0x3d5b[0x24]]: _0xf0w1 });
            return;
        }
        if (isNaN(_0x6c7d) || _0x6c7d <= 0x0) {
            await _0xd8u9[_0x3d5b[0x21]](_0xe9v0, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} Please enter a valid chip amount (positive number).` 
            }, { [_0x3d5b[0x24]]: _0xf0w1 });
            return;
        }
        if (_0x6c7d > _0x2b8c.MAX_SINGLE_ADD) {
            await _0xd8u9[_0x3d5b[0x21]](_0xe9v0, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} ${_0x3d5b[0x3e]} is 10,000,000 at once.` 
            }, { [_0x3d5b[0x24]]: _0xf0w1 });
            return;
        }
        const _0x7d8e = await _0x9w0x(_0xd8u9, _0x5b6c);
        const _0x8e9f = _0x6r7s(_0x7d8e.jid, _0x6c7d, _0x3d5b[0x1a]);
        const _0x9f0g = {
            'date': new Date().toISOString(),
            'from': 'owner',
            'to': _0x7d8e.jid,
            'amount': _0x6c7d,
            'newBalance': _0x8e9f
        };
        const _0x0g1h = _0x4e7d(_0x2b8c.TRANSACTIONS_FILE, []);
        _0x0g1h.push(_0x9f0g);
        _0x3f9a(_0x2b8c.TRANSACTIONS_FILE, _0x0g1h);
        const _0x1h2i = `✅ *${_0x3d5b[0x3f]}!*\n\n` +
            `👤 *${_0x3d5b[0x40]}:* ${_0x7d8e[_0x3d5b[0xb]]}\n` +
            `📞 *${_0x3d5b[0x41]}:* ${_0x7d8e.number}\n` +
            `${_0x3d5b[0x2c]} *${_0x3d5b[0x42]}:* ${_0x6f4a(_0x6c7d)} chips\n` +
            `💵 *${_0x3d5b[0x2d]}:* ${_0x6f4a(_0x8e9f)} chips\n\n` +
            `⏰ *${_0x3d5b[0x43]}:* ${new Date()[_0x3d5b[0x20]]()}\n` +
            `📝 *${_0x3d5b[0x44]}:* TX${Date.now()}`;
        await _0xd8u9[_0x3d5b[0x21]](_0xe9v0, { 
            [_0x3d5b[0x22]]: _0x1h2i 
        }, { [_0x3d5b[0x24]]: _0xf0w1 });
        try {
            const _0x2i3j = `${_0x3d5b[0x2a]} *${_0x3d5b[0x45]}!* ${_0x3d5b[0x2a]}\n\n` +
                `${_0x3d5b[0x2c]} *${_0x3d5b[0x42]}:* +${_0x6f4a(_0x6c7d)} chips\n` +
                `💵 *${_0x3d5b[0x2d]}:* ${_0x6f4a(_0x8e9f)} chips\n\n` +
                `${_0x3d5b[0x46]}! Enjoy playing! 🎮\n\n` +
                `Use \`.coinstats\` to check your balance.`;
            await _0xd8u9[_0x3d5b[0x21]](_0x7d8e.jid, { 
                [_0x3d5b[0x22]]: _0x2i3j 
            });
        } catch (_0x3j4k) {
            console[_0x3d5b[0x1b]](`User ${_0x7d8e.number} might not have chatted with bot.`);
        }
    } catch (_0x4k5l) {
        console[_0x3d5b[0x1b]](`${_0x3d5b[0x1c]} in addchips:`, _0x4k5l);
        await _0xd8u9[_0x3d5b[0x21]](_0xe9v0, { 
            [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} ${_0x3d5b[0x47]}. Please check the user number and try again.` 
        }, { [_0x3d5b[0x24]]: _0xf0w1 });
    }
}

// Additional command functions (similarly obfuscated)
async function _0xd8e9(_0xe9f0, _0xf0g1, _0x1h2i, _0x2i3j) {
    try {
        const _0x3j4k = _0x1i2j(_0x1h2i);
        const _0x4k5l = await _0x5e3c(_0xe9f0, _0x3j4k);
        if (!_0x4k5l) {
            await _0xe9f0[_0x3d5b[0x21]](_0xf0g1, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} This command is only for the bot owner!` 
            }, { [_0x3d5b[0x24]]: _0x1h2i });
            return;
        }
        if (_0x2i3j[_0x3d5b[0xe]] < 0x2) {
            await _0xe9f0[_0x3d5b[0x21]](_0xf0g1, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x25]} *${_0x3d5b[0x48]}*\n\n${_0x3d5b[0x3c]}:\n\`.checkbalance [password] [user-number]\`\n\n${_0x3d5b[0x28]}:\n\`.checkbalance admin123 2348144317152\`` 
            }, { [_0x3d5b[0x24]]: _0x1h2i });
            return;
        }
        const _0x5l6m = _0x2i3j[0x0];
        const _0x6m7n = _0x2i3j[0x1];
        if (!_0x8g5b(_0x5l6m)) {
            await _0xe9f0[_0x3d5b[0x21]](_0xf0g1, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} ${_0x3d5b[0x29]}!` 
            }, { [_0x3d5b[0x24]]: _0x1h2i });
            return;
        }
        const _0x7n8o = await _0x9w0x(_0xe9f0, _0x6m7n);
        const _0x8o9p = _0x3m4n(_0x7n8o.jid);
        const _0x9p0q = `📊 *${_0x3d5b[0x49]}*\n\n` +
            `👤 *${_0x3d5b[0x40]}:* ${_0x7n8o[_0x3d5b[0xb]]}\n` +
            `📞 *${_0x3d5b[0x41]}:* ${_0x7n8o.number}\n` +
            `🆔 *${_0x3d5b[0x4a]}:* ${_0x7n8o.jid}\n` +
            `${_0x3d5b[0x2c]} *${_0x3d5b[0x4b]}:* ${_0x6f4a(_0x8o9p)}\n` +
            `📅 *${_0x3d5b[0x4c]}:* ${_0x7n8o.exists ? '✅ Yes' : '⚠️ Not in contacts'}\n\n` +
            `*${_0x3d5b[0x4d]}:* ${new Date()[_0x3d5b[0x20]]()}`;
        await _0xe9f0[_0x3d5b[0x21]](_0xf0g1, { 
            [_0x3d5b[0x22]]: _0x9p0q 
        }, { [_0x3d5b[0x24]]: _0x1h2i });
    } catch (_0x0q1r) {
        console[_0x3d5b[0x1b]](`${_0x3d5b[0x1c]} in checkbalance:`, _0x0q1r);
        await _0xe9f0[_0x3d5b[0x21]](_0xf0g1, { 
            [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} ${_0x3d5b[0x4e]}.` 
        }, { [_0x3d5b[0x24]]: _0x1h2i });
    }
}

async function _0xe9f0(_0xf0g1, _0x1h2i, _0x2i3j, _0x3j4k) {
    try {
        const _0x4k5l = _0x1i2j(_0x2i3j);
        const _0x5l6m = await _0x5e3c(_0xf0g1, _0x4k5l);
        if (!_0x5l6m) {
            await _0xf0g1[_0x3d5b[0x21]](_0x1h2i, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} This command is only for the bot owner!` 
            }, { [_0x3d5b[0x24]]: _0x2i3j });
            return;
        }
        if (_0x3j4k[_0x3d5b[0xe]] < 0x3) {
            await _0xf0g1[_0x3d5b[0x21]](_0x1h2i, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x25]} *${_0x3d5b[0x4f]}*\n\n${_0x3d5b[0x3c]}:\n\`.resetchips [password] [user-number] [new-amount]\`\n\n${_0x3d5b[0x28]}:\n\`.resetchips admin123 2348144317152 1000\`\n\n*${_0x3d5b[0x50]}:* This will completely reset user chips to the specified amount!` 
            }, { [_0x3d5b[0x24]]: _0x2i3j });
            return;
        }
        const _0x6m7n = _0x3j4k[0x0];
        const _0x7n8o = _0x3j4k[0x1];
        const _0x8o9p = parseInt(_0x3j4k[0x2]);
        if (!_0x8g5b(_0x6m7n)) {
            await _0xf0g1[_0x3d5b[0x21]](_0x1h2i, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} ${_0x3d5b[0x29]}!` 
            }, { [_0x3d5b[0x24]]: _0x2i3j });
            return;
        }
        if (isNaN(_0x8o9p) || _0x8o9p < 0x0) {
            await _0xf0g1[_0x3d5b[0x21]](_0x1h2i, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} Please enter a valid chip amount (0 or more).` 
            }, { [_0x3d5b[0x24]]: _0x2i3j });
            return;
        }
        const _0x9p0q = await _0x9w0x(_0xf0g1, _0x7n8o);
        const _0x0q1r = _0x4e7d(_0x2b8c.CHIPS_FILE, {});
        if (!_0x0q1r[_0x9p0q.jid]) {
            _0x0q1r[_0x9p0q.jid] = {
                [_0x3d5b[0x19]]: _0x2b8c.STARTING_CHIPS,
                'lastDaily': null,
                'totalWon': 0x0,
                'totalLost': 0x0,
                [_0x3d5b[0x17]]: 0x0,
                [_0x3d5b[0x18]]: 0x0
            };
        }
        const _0x1r2s = _0x0q1r[_0x9p0q.jid][_0x3d5b[0x19]];
        _0x0q1r[_0x9p0q.jid][_0x3d5b[0x19]] = _0x8o9p;
        _0x3f9a(_0x2b8c.CHIPS_FILE, _0x0q1r);
        const _0x2s3t = `🔄 *${_0x3d5b[0x51]}*\n\n` +
            `👤 *${_0x3d5b[0x40]}:* ${_0x9p0q[_0x3d5b[0xb]]}\n` +
            `📞 *${_0x3d5b[0x41]}:* ${_0x9p0q.number}\n` +
            `${_0x3d5b[0x2c]} *${_0x3d5b[0x52]}:* ${_0x6f4a(_0x1r2s)} chips\n` +
            `${_0x3d5b[0x2c]} *${_0x3d5b[0x2d]}:* ${_0x6f4a(_0x8o9p)} chips\n` +
            `📉 *${_0x3d5b[0x53]}:* ${_0x6f4a(_0x8o9p - _0x1r2s)} chips\n\n` +
            `*${_0x3d5b[0x54]}:* ${new Date()[_0x3d5b[0x20]]()}\n` +
            `⚠️ *${_0x3d5b[0x39]}:* User statistics remain unchanged.`;
        await _0xf0g1[_0x3d5b[0x21]](_0x1h2i, { 
            [_0x3d5b[0x22]]: _0x2s3t 
        }, { [_0x3d5b[0x24]]: _0x2i3j });
    } catch (_0x3t4u) {
        console[_0x3d5b[0x1b]](`${_0x3d5b[0x1c]} in resetchips:`, _0x3t4u);
        await _0xf0g1[_0x3d5b[0x21]](_0x1h2i, { 
            [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} ${_0x3d5b[0x55]}.` 
        }, { [_0x3d5b[0x24]]: _0x2i3j });
    }
}

async function _0xf0g1(_0x1h2i, _0x2i3j, _0x3j4k, _0x4k5l) {
    try {
        const _0x5l6m = _0x1i2j(_0x3j4k);
        const _0x6m7n = await _0x5e3c(_0x1h2i, _0x5l6m);
        if (!_0x6m7n) {
            await _0x1h2i[_0x3d5b[0x21]](_0x2i3j, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} This command is only for the bot owner!` 
            }, { [_0x3d5b[0x24]]: _0x3j4k });
            return;
        }
        if (_0x4k5l[_0x3d5b[0xe]] < 0x1) {
            await _0x1h2i[_0x3d5b[0x21]](_0x2i3j, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x25]} *${_0x3d5b[0x56]}*\n\n${_0x3d5b[0x3c]}:\n\`.transactions [password]\`\n\n${_0x3d5b[0x28]}:\n\`.transactions admin123\`` 
            }, { [_0x3d5b[0x24]]: _0x3j4k });
            return;
        }
        const _0x7n8o = _0x4k5l[0x0];
        if (!_0x8g5b(_0x7n8o)) {
            await _0x1h2i[_0x3d5b[0x21]](_0x2i3j, { 
                [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} ${_0x3d5b[0x29]}!` 
            }, { [_0x3d5b[0x24]]: _0x3j4k });
            return;
        }
        const _0x8o9p = _0x4e7d(_0x2b8c.TRANSACTIONS_FILE, []);
        if (_0x8o9p[_0x3d5b[0xe]] === 0x0) {
            await _0x1h2i[_0x3d5b[0x21]](_0x2i3j, { 
                [_0x3d5b[0x22]]: `📋 *${_0x3d5b[0x57]}*\n\n${_0x3d5b[0x58]} yet.` 
            }, { [_0x3d5b[0x24]]: _0x3j4k });
            return;
        }
        const _0x9p0q = _0x8o9p.slice(-0xa).reverse();
        let _0x0q1r = `📋 *${_0x3d5b[0x59]} (Last 10)\n\n`;
        let _0x1r2s = 0x0;
        _0x9p0q.forEach((_0x2s3t, _0x3t4u) => {
            const _0x4u5v = new Date(_0x2s3t.date)[_0x3d5b[0x20]]();
            const _0x5v6w = _0x2s3t.to[_0x3d5b[0x11]]('@')[0x0];
            _0x0q1r += `${_0x3t4u + 0x1}. ${_0x4u5v}\n`;
            _0x0q1r += `   👤 ${_0x5v6w}\n`;
            _0x0q1r += `   ${_0x3d5b[0x2c]} +${_0x6f4a(_0x2s3t.amount)} chips\n`;
            _0x0q1r += `   💵 New: ${_0x6f4a(_0x2s3t.newBalance)} chips\n`;
            _0x0q1r += `   ─────────────────\n`;
            _0x1r2s += _0x2s3t.amount;
        });
        _0x0q1r += `\n📊 *${_0x3d5b[0x5a]}*\n`;
        _0x0q1r += `${_0x3d5b[0x5b]}: ${_0x8o9p[_0x3d5b[0xe]]}\n`;
        _0x0q1r += `${_0x3d5b[0x5c]}: ${_0x6f4a(_0x1r2s)}\n`;
        _0x0q1r += `\nUse \`.transactions all [password]\` for full list`;
        await _0x1h2i[_0x3d5b[0x21]](_0x2i3j, { 
            [_0x3d5b[0x22]]: _0x0q1r 
        }, { [_0x3d5b[0x24]]: _0x3j4k });
    } catch (_0x6w7x) {
        console[_0x3d5b[0x1b]](`${_0x3d5b[0x1c]} in transactions:`, _0x6w7x);
        await _0x1h2i[_0x3d5b[0x21]](_0x2i3j, { 
            [_0x3d5b[0x22]]: `${_0x3d5b[0x23]} ${_0x3d5b[0x5d]}.` 
        }, { [_0x3d5b[0x24]]: _0x3j4k });
    }
}

// Export with readable names
module[_0x3d5b[0x0]] = {
    unlimitedChipsCommand: _0xa8b9,
    buyChipsCommand: _0xb5j6,
    addChipsCommand: _0xc7t8,
    checkBalanceCommand: _0xd8e9,
    resetChipsCommand: _0xe9f0,
    viewTransactionsCommand: _0xf0g1
};
