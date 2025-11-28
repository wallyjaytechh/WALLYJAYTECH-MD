const fs = require('fs');
const path = require('path');

// Store active games
let activeGames = new Map();
let pendingInvites = new Map();

class ConnectFour {
    constructor(player1, player2, isDM = false, chatId = null) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = Array(6).fill().map(() => Array(7).fill('⚪'));
        this.currentPlayer = player1;
        this.moves = 0;
        this.gameId = Date.now().toString();
        this.startTime = Date.now();
        this.isDM = isDM;
        this.chatId = chatId; // For DM games, this is the game channel
        this.player1DM = player1; // Player 1's DM chat ID
        this.player2DM = player2; // Player 2's DM chat ID
    }

    makeMove(column) {
        if (column < 0 || column > 6) return false;
        
        // Find the lowest empty row in the column
        for (let row = 5; row >= 0; row--) {
            if (this.board[row][column] === '⚪') {
                this.board[row][column] = this.currentPlayer === this.player1 ? '🔴' : '🟡';
                this.moves++;
                return true;
            }
        }
        return false; // Column is full
    }

    checkWin() {
        const currentDisc = this.currentPlayer === this.player1 ? '🔴' : '🟡';
        
        // Check horizontal
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.board[row][col] === currentDisc &&
                    this.board[row][col + 1] === currentDisc &&
                    this.board[row][col + 2] === currentDisc &&
                    this.board[row][col + 3] === currentDisc) {
                    return true;
                }
            }
        }
        
        // Check vertical
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 7; col++) {
                if (this.board[row][col] === currentDisc &&
                    this.board[row + 1][col] === currentDisc &&
                    this.board[row + 2][col] === currentDisc &&
                    this.board[row + 3][col] === currentDisc) {
                    return true;
                }
            }
        }
        
        // Check diagonal (top-left to bottom-right)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.board[row][col] === currentDisc &&
                    this.board[row + 1][col + 1] === currentDisc &&
                    this.board[row + 2][col + 2] === currentDisc &&
                    this.board[row + 3][col + 3] === currentDisc) {
                    return true;
                }
            }
        }
        
        // Check diagonal (top-right to bottom-left)
        for (let row = 0; row < 3; row++) {
            for (let col = 3; col < 7; col++) {
                if (this.board[row][col] === currentDisc &&
                    this.board[row + 1][col - 1] === currentDisc &&
                    this.board[row + 2][col - 2] === currentDisc &&
                    this.board[row + 3][col - 3] === currentDisc) {
                    return true;
                }
            }
        }
        
        return false;
    }

    isBoardFull() {
        return this.moves === 42;
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
    }

    getBoardDisplay() {
        let display = '🎮 *CONNECT FOUR* 🎮\n\n';
        
        // Add column numbers
        display += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣\n';
        
        // Add board
        for (let row = 0; row < 6; row++) {
            display += this.board[row].join('') + '\n';
        }
        
        // Add current player info
        const currentSymbol = this.currentPlayer === this.player1 ? '🔴' : '🟡';
        const currentPlayerName = this.currentPlayer === this.player1 ? this.player1Name : this.player2Name;
        
        display += `\n🎯 Current turn: ${currentSymbol} (${currentPlayerName})`;
        display += `\n🔴 ${this.player1Name}`;
        display += `\n🟡 ${this.player2Name}`;
        display += `\n\n💡 Use: .drop <1-7> to play`;
        display += `\n❌ Use: .surrender to forfeit`;
        
        if (this.isDM) {
            display += `\n\n💬 *Private DM Game*`;
        }
        
        return display;
    }

    setPlayerNames(sock) {
        try {
            this.player1Name = sock.getName(this.player1) || this.player1.split('@')[0];
            this.player2Name = sock.getName(this.player2) || this.player2.split('@')[0];
        } catch (error) {
            this.player1Name = this.player1.split('@')[0];
            this.player2Name = this.player2.split('@')[0];
        }
    }

    // Send game state to both players in DM mode
    async notifyBothPlayers(sock, messageText) {
        if (this.isDM) {
            await sock.sendMessage(this.player1DM, { text: messageText });
            await sock.sendMessage(this.player2DM, { text: messageText });
        } else {
            await sock.sendMessage(this.chatId, { text: messageText });
        }
    }

    // Get the DM chat ID for a specific player
    getPlayerDMChat(playerJid) {
        return playerJid;
    }
}

module.exports = {
    name: 'connect4',
    description: 'Play Connect Four with other users (Groups & DMs)',
    
    async execute(sock, chatId, message, args) {
        try {
            const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const senderId = message.key.participant || message.key.remoteJid;
            const isGroup = chatId.endsWith('@g.us');
            
            // DM INVITE MODE: Invite another user to play in DMs
            if (mentionedJid && !isGroup) {
                await this.handleDMInvite(sock, chatId, senderId, mentionedJid, message);
                return;
            }
            
            // DM SINGLE PLAYER: Play against bot in DM
            if (!mentionedJid && !isGroup) {
                await this.startDMSinglePlayer(sock, chatId, senderId, message);
                return;
            }

            // GROUP MODE: Normal group game
            if (!mentionedJid) {
                const usageText = `🎮 *Connect Four Game*\n\n*Group Usage:* .connect4 @user\n*DM Usage:* .connect4 @user (invite to DM) or .connect4 (play vs bot)\n\nExamples:\n.connect4 @friend - Group game\n.connect4 @friend - DM invite (in private chat)\n.connect4 - Play vs bot in DM`;
                
                await sock.sendMessage(chatId, {
                    text: usageText
                }, { quoted: message });
                return;
            }

            if (mentionedJid === senderId) {
                await sock.sendMessage(chatId, {
                    text: '❌ You cannot play against yourself!'
                }, { quoted: message });
                return;
            }

            // GROUP MODE: Check if mentioned user is in the group
            if (isGroup) {
                try {
                    const groupMetadata = await sock.groupMetadata(chatId);
                    const participants = groupMetadata.participants.map(p => p.id);
                    
                    if (!participants.includes(mentionedJid)) {
                        await sock.sendMessage(chatId, {
                            text: '❌ The mentioned user is not in this group!'
                        }, { quoted: message });
                        return;
                    }
                } catch (error) {
                    console.error('Error checking group participants:', error);
                }
            }

            // Check if either player is already in a game
            for (const [key, game] of activeGames.entries()) {
                if ((game.player1 === senderId || game.player2 === senderId || 
                    game.player1 === mentionedJid || game.player2 === mentionedJid)) {
                    await sock.sendMessage(chatId, {
                        text: '❌ One of the players is already in an active game!'
                    }, { quoted: message });
                    return;
                }
            }

            // Create new GROUP game
            const game = new ConnectFour(senderId, mentionedJid, false, chatId);
            game.setPlayerNames(sock);
            activeGames.set(chatId + game.gameId, game);

            await sock.sendMessage(chatId, {
                text: `🎮 *Connect Four Challenge!*\n\n🔴 ${game.player1Name} challenged 🟡 ${game.player2Name} to Connect Four!\n\n${game.getBoardDisplay()}\n\nGame will auto-end after 5 minutes of inactivity.`
            }, { quoted: message });

            // Auto-end after 5 minutes
            setTimeout(async () => {
                if (activeGames.has(chatId + game.gameId)) {
                    activeGames.delete(chatId + game.gameId);
                    await sock.sendMessage(chatId, {
                        text: `⏰ Game timed out! ${game.player1Name} vs ${game.player2Name} - No moves made in 5 minutes.`
                    });
                }
            }, 300000);

        } catch (error) {
            console.error('Connect4 error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Error starting Connect Four game!'
            }, { quoted: message });
        }
    },

    // Handle DM invitations
    async handleDMInvite(sock, chatId, inviterJid, inviteeJid, message) {
        try {
            // Check if invitee is already in a game
            for (const [key, game] of activeGames.entries()) {
                if (game.player1 === inviteeJid || game.player2 === inviteeJid) {
                    await sock.sendMessage(chatId, {
                        text: '❌ That user is already in an active game!'
                    }, { quoted: message });
                    return;
                }
            }

            // Check if there's already a pending invite
            if (pendingInvites.has(inviteeJid)) {
                await sock.sendMessage(chatId, {
                    text: '❌ That user already has a pending game invite!'
                }, { quoted: message });
                return;
            }

            const inviterName = sock.getName(inviterJid) || inviterJid.split('@')[0];
            const inviteeName = sock.getName(inviteeJid) || inviteeJid.split('@')[0];

            // Store the invite
            pendingInvites.set(inviteeJid, {
                inviter: inviterJid,
                inviterName: inviterName,
                invitee: inviteeJid,
                inviteTime: Date.now()
            });

            // Notify inviter
            await sock.sendMessage(chatId, {
                text: `📩 *Connect Four Invite Sent!*\n\nI've sent a Connect Four game invite to ${inviteeName}.\n\nThey have 2 minutes to accept with: .accept`
            }, { quoted: message });

            // Send invite to invitee
            await sock.sendMessage(inviteeJid, {
                text: `🎮 *Connect Four Invitation!*\n\n${inviterName} has invited you to play Connect Four!\n\nTo accept, reply with: .accept\n\nYou have 2 minutes to respond.`
            });

            // Auto-decline after 2 minutes
            setTimeout(async () => {
                if (pendingInvites.has(inviteeJid)) {
                    pendingInvites.delete(inviteeJid);
                    await sock.sendMessage(inviterJid, {
                        text: `⏰ Connect Four invite to ${inviteeName} expired. They didn't respond in time.`
                    });
                    await sock.sendMessage(inviteeJid, {
                        text: `⏰ Connect Four invite from ${inviterName} has expired.`
                    });
                }
            }, 120000);

        } catch (error) {
            console.error('DM invite error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Error sending game invite!'
            }, { quoted: message });
        }
    },

    // Handle accepting DM invites
    async handleAccept(sock, chatId, userId, message) {
        try {
            const invite = pendingInvites.get(userId);
            
            if (!invite) {
                await sock.sendMessage(chatId, {
                    text: '❌ No pending game invites found!'
                }, { quoted: message });
                return;
            }

            if (invite.invitee !== userId) {
                await sock.sendMessage(chatId, {
                    text: '❌ This invite is not for you!'
                }, { quoted: message });
                return;
            }

            // Remove from pending invites
            pendingInvites.delete(userId);

            // Check if either player is now in a game
            for (const [key, game] of activeGames.entries()) {
                if (game.player1 === invite.inviter || game.player2 === invite.inviter || 
                    game.player1 === userId || game.player2 === userId) {
                    await sock.sendMessage(chatId, {
                        text: '❌ One of the players is now in another game!'
                    });
                    await sock.sendMessage(invite.inviter, {
                        text: `❌ Cannot start game - one of you is in another game now.`
                    });
                    return;
                }
            }

            // Create DM game (game ID uses inviter's DM as base)
            const game = new ConnectFour(invite.inviter, userId, true, invite.inviter);
            game.setPlayerNames(sock);
            activeGames.set(`dm_${invite.inviter}_${game.gameId}`, game);

            // Notify both players
            const startMessage = `🎮 *Connect Four - DM Game Started!*\n\n🔴 ${game.player1Name} vs 🟡 ${game.player2Name}\n\n${game.getBoardDisplay()}\n\nGame will auto-end after 5 minutes of inactivity.`;

            await sock.sendMessage(invite.inviter, { text: startMessage });
            await sock.sendMessage(userId, { text: startMessage });

            // Auto-end after 5 minutes
            setTimeout(async () => {
                const gameKey = `dm_${invite.inviter}_${game.gameId}`;
                if (activeGames.has(gameKey)) {
                    activeGames.delete(gameKey);
                    const timeoutMessage = `⏰ Game timed out! No moves made in 5 minutes.`;
                    await sock.sendMessage(invite.inviter, { text: timeoutMessage });
                    await sock.sendMessage(userId, { text: timeoutMessage });
                }
            }, 300000);

        } catch (error) {
            console.error('Accept invite error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Error accepting game invite!'
            }, { quoted: message });
        }
    },

    // Single player mode for DMs (play against bot)
    async startDMSinglePlayer(sock, chatId, userId, message) {
        try {
            const botJid = sock.user.id;
            const game = new ConnectFour(userId, botJid, true, chatId);
            game.setPlayerNames(sock);
            game.player2Name = "WALLYJAYTECH-MD Bot";
            
            activeGames.set(`dm_${chatId}_${game.gameId}`, game);

            await sock.sendMessage(chatId, {
                text: `🎮 *Connect Four - VS Bot!*\n\n🔴 You vs 🟡 ${game.player2Name}\n\n${game.getBoardDisplay()}\n\nGame will auto-end after 5 minutes of inactivity.`
            }, { quoted: message });

            // Auto-end after 5 minutes
            setTimeout(async () => {
                const gameKey = `dm_${chatId}_${game.gameId}`;
                if (activeGames.has(gameKey)) {
                    activeGames.delete(gameKey);
                    await sock.sendMessage(chatId, {
                        text: `⏰ Game timed out! No moves made in 5 minutes.`
                    });
                }
            }, 300000);

        } catch (error) {
            console.error('Single player Connect4 error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Error starting single player game!'
            }, { quoted: message });
        }
    },

    // Bot makes a move (for single player mode)
    async makeBotMove(game) {
        const preferredColumns = [3, 2, 4, 1, 5, 0, 6];
        
        for (const col of preferredColumns) {
            if (game.makeMove(col)) {
                return true;
            }
        }
        
        for (let col = 0; col < 7; col++) {
            if (game.makeMove(col)) {
                return true;
            }
        }
        
        return false;
    },

    async handleDrop(sock, chatId, userId, column, message) {
        try {
            // Find active game for this user
            let gameKey = null;
            let game = null;
            
            // Check both group games and DM games
            for (const [key, activeGame] of activeGames.entries()) {
                const isGroupGame = key.startsWith(chatId);
                const isDMGameWithUser = activeGame.isDM && 
                    (activeGame.player1 === userId || activeGame.player2 === userId);
                
                if ((isGroupGame || isDMGameWithUser) && 
                    (activeGame.player1 === userId || activeGame.player2 === userId) &&
                    activeGame.currentPlayer === userId) {
                    gameKey = key;
                    game = activeGame;
                    break;
                }
            }

            if (!game) {
                await sock.sendMessage(chatId, {
                    text: '❌ No active game found or it\'s not your turn!'
                }, { quoted: message });
                return false;
            }

            const colNum = parseInt(column) - 1;
            
            if (isNaN(colNum) || colNum < 0 || colNum > 6) {
                await sock.sendMessage(chatId, {
                    text: '❌ Please choose a column between 1 and 7!'
                }, { quoted: message });
                return false;
            }

            // Make the move
            const moveSuccess = game.makeMove(colNum);
            if (!moveSuccess) {
                await sock.sendMessage(chatId, {
                    text: '❌ That column is full! Choose another column.'
                }, { quoted: message });
                return false;
            }

            // Check for win
            if (game.checkWin()) {
                const winnerName = game.currentPlayer === game.player1 ? game.player1Name : game.player2Name;
                const winnerSymbol = game.currentPlayer === game.player1 ? '🔴' : '🟡';
                const timeTaken = Math.floor((Date.now() - game.startTime) / 1000);
                
                activeGames.delete(gameKey);
                
                const winMessage = `🎉 *${winnerName} WINS!* ${winnerSymbol}\n\n${game.getBoardDisplay()}\n\n🏆 Winner: ${winnerName}\n⏱️ Time: ${timeTaken} seconds\n🎯 Moves: ${game.moves}`;
                
                if (game.isDM) {
                    await game.notifyBothPlayers(sock, winMessage);
                } else {
                    await sock.sendMessage(chatId, { text: winMessage });
                }
                return true;
            }

            // Check for draw
            if (game.isBoardFull()) {
                const timeTaken = Math.floor((Date.now() - game.startTime) / 1000);
                activeGames.delete(gameKey);
                
                const drawMessage = `🤝 *DRAW!* The board is full!\n\n${game.getBoardDisplay()}\n\n⏱️ Time: ${timeTaken} seconds\n🎯 Moves: ${game.moves}`;
                
                if (game.isDM) {
                    await game.notifyBothPlayers(sock, drawMessage);
                } else {
                    await sock.sendMessage(chatId, { text: drawMessage });
                }
                return true;
            }

            // Switch player
            game.switchPlayer();
            
            // If it's single player mode and bot's turn
            if (game.isDM && game.player2 === sock.user.id && game.currentPlayer === sock.user.id) {
                setTimeout(async () => {
                    if (activeGames.has(gameKey)) {
                        await this.makeBotMove(game);
                        
                        if (game.checkWin()) {
                            const timeTaken = Math.floor((Date.now() - game.startTime) / 1000);
                            activeGames.delete(gameKey);
                            await sock.sendMessage(game.player1DM, {
                                text: `🤖 *${game.player2Name} WINS!* 🟡\n\n${game.getBoardDisplay()}\n\n🏆 Winner: ${game.player2Name}\n⏱️ Time: ${timeTaken} seconds\n🎯 Moves: ${game.moves}`
                            });
                            return;
                        }
                        
                        if (game.isBoardFull()) {
                            const timeTaken = Math.floor((Date.now() - game.startTime) / 1000);
                            activeGames.delete(gameKey);
                            await sock.sendMessage(game.player1DM, {
                                text: `🤝 *DRAW!* The board is full!\n\n${game.getBoardDisplay()}\n\n⏱️ Time: ${timeTaken} seconds\n🎯 Moves: ${game.moves}`
                            });
                            return;
                        }
                        
                        game.switchPlayer();
                        await sock.sendMessage(game.player1DM, {
                            text: game.getBoardDisplay()
                        });
                    }
                }, 1500);
            } else {
                // Send update to appropriate chat(s)
                if (game.isDM) {
                    await game.notifyBothPlayers(sock, game.getBoardDisplay());
                } else {
                    await sock.sendMessage(chatId, {
                        text: game.getBoardDisplay()
                    }, { quoted: message });
                }
            }

            return true;

        } catch (error) {
            console.error('Drop error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Error making move!'
            }, { quoted: message });
            return false;
        }
    },

    async handleSurrender(sock, chatId, userId, message) {
        try {
            // Find active game for this user
            let gameKey = null;
            let game = null;
            
            for (const [key, activeGame] of activeGames.entries()) {
                const isGroupGame = key.startsWith(chatId);
                const isDMGameWithUser = activeGame.isDM && 
                    (activeGame.player1 === userId || activeGame.player2 === userId);
                
                if ((isGroupGame || isDMGameWithUser) && 
                    (activeGame.player1 === userId || activeGame.player2 === userId)) {
                    gameKey = key;
                    game = activeGame;
                    break;
                }
            }

            if (!game) {
                await sock.sendMessage(chatId, {
                    text: '❌ No active game found to surrender!'
                }, { quoted: message });
                return false;
            }

            const surrenderingPlayer = userId === game.player1 ? game.player1Name : game.player2Name;
            const winningPlayer = userId === game.player1 ? game.player2Name : game.player1Name;
            const winningSymbol = userId === game.player1 ? '🟡' : '🔴';
            
            activeGames.delete(gameKey);
            
            const surrenderMessage = `🏳️ *${surrenderingPlayer} surrendered!*\n\n🎉 ${winningPlayer} wins! ${winningSymbol}\n\nGame ended by surrender.`;
            
            if (game.isDM) {
                await game.notifyBothPlayers(sock, surrenderMessage);
            } else {
                await sock.sendMessage(chatId, { text: surrenderMessage });
            }

            return true;

        } catch (error) {
            console.error('Surrender error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Error surrendering game!'
            }, { quoted: message });
            return false;
        }
    }
};
