 const fs = require('fs');

const words = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'be', 'am', 'go', 'to', 'in', 'on', 'up', 'by', 'so', 'my', 'we', 'he', 'it', 'as', 'at', 'or', 'no', 'if', 'me', 'an', 'is', 'do', 'of', 'ok', 'us', 'hi', 'yo', 'cat', 'dog', 'sun', 'run', 'big', 'red', 'you', 'and', 'the', 'but', 'not', 'yes', 'out', 'see', 'new', 'old', 'man', 'boy', 'girl', 'sky', 'sea', 'car', 'bus', 'pen', 'able', 'bark', 'cold', 'dust', 'eave', 'frog', 'gold', 'hard', 'iris', 'joke', 'kite', 'lamp', 'mind', 'nose', 'open', 'port', 'quiz', 'road', 'sun', 'tree', 'undo', 'vast', 'wind', 'xray', 'yard', 'zone', 'house', 'apple', 'world', 'music', 'river', 'light', 'green', 'peace', 'heart', 'smile', 'laugh', 'crown', 'storm', 'fruit', 'chair', 'table', 'dream', 'night', 'beach', 'cloud', 'planet', 'coffee', 'summer', 'garden', 'jacket', 'bright', 'travel', 'friend', 'golden', 'silver', 'market', 'spring', ' Laughed', 'stamped', 'dreamed', 'shipped', 'shutter', 'started', 'staying', 'visions', 'wonders', 'building', 'computer', 'elephant', 'language', 'sunshine', 'football', 'mountain', 'laughter', 'hospital', 'distance', 'knowledge', 'happiness', 'beautiful', 'adventure', 'friendship', 'community', 'education', 'chocolate', 'discovery', 'butterfly', 'background', 'celebration', 'development', 'extraordinary', 'friendliness', 'information', 'leadership', 'management', 'technology', 'understanding'];
let hangmanGames = {};

function startHangman(sock, chatId) {
    const word = words[Math.floor(Math.random() * words.length)];
    const maskedWord = '_ '.repeat(word.length).trim();

    hangmanGames[chatId] = {
        word,
        maskedWord: maskedWord.split(' '),
        guessedLetters: [],
        wrongGuesses: 0,
        maxWrongGuesses: 6,
    };

    sock.sendMessage(chatId, { text: `*Game started! The word is: ${maskedWord}*` });
}

function guessLetter(sock, chatId, letter) {
    if (!hangmanGames[chatId]) {
        sock.sendMessage(chatId, { text: '*No game in progress. Start a new game with .hangman*' });
        return;
    }

    const game = hangmanGames[chatId];
    const { word, guessedLetters, maskedWord, maxWrongGuesses } = game;

    if (guessedLetters.includes(letter)) {
        sock.sendMessage(chatId, { text: `*You already guessed "${letter}". Try another letter.*` });
        return;
    }

    guessedLetters.push(letter);

    if (word.includes(letter)) {
        for (let i = 0; i < word.length; i++) {
            if (word[i] === letter) {
                maskedWord[i] = letter;
            }
        }
        sock.sendMessage(chatId, { text: `*Good guess! ${maskedWord.join(' ')}*` });

        if (!maskedWord.includes('_')) {
            sock.sendMessage(chatId, { text: `*Congratulations! You guessed the word: ${word}*` });
            delete hangmanGames[chatId];
        }
    } else {
        game.wrongGuesses += 1;
        sock.sendMessage(chatId, { text: `*Wrong guess! You have ${maxWrongGuesses - game.wrongGuesses} tries left.*` });

        if (game.wrongGuesses >= maxWrongGuesses) {
            sock.sendMessage(chatId, { text: `*Game over! The word was: ${word}*` });
            delete hangmanGames[chatId];
        }
    }
}

module.exports = { startHangman, guessLetter };
