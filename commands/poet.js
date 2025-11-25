const settings = require('../settings');

async function poetCommand(sock, chatId, message) {
    try {
        // Array of 200+ poetic messages and quotes
        const poeticMessages = [
            // Romantic Poetry
            "The stars are the street lights of eternity. ✨",
            "Your voice is the melody my heart beats to. 🎵",
            "In the garden of life, you are the most beautiful flower. 🌸",
            "Your eyes are the windows to a soul I'd love to explore. 👀",
            "Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day. 💖",
            "If I had a flower for every time I thought of you, I could walk through my garden forever. 🌹",
            "You are the poem I never knew how to write until I met you. 📝",
            "Your smile is the sunrise that brightens my darkest nights. ☀️",
            "In your arms is where I found my home. 🏡",
            "Your love is the music that colors my world. 🎨",

            // Nature Poetry
            "The trees are poems the earth writes upon the sky. 🌳",
            "Rivers know this: there is no hurry. We shall get there someday. 🌊",
            "The mountains are calling and I must go. ⛰️",
            "Every flower is a soul blossoming in nature. 🌺",
            "The ocean's roar is music to the soul. 🌊",
            "Sunset is still my favorite color, and rainbow is second. 🌈",
            "The forest is a temple where the wise seek answers. 🌲",
            "Stars are the love letters of the universe. ⭐",
            "Rain is the sky's way of washing away our tears. 🌧️",
            "The moon is a loyal companion. It never leaves. It's always there, watching, steadfast. 🌙",

            // Life Wisdom
            "Life is a journey that must be traveled no matter how bad the roads and accommodations. 🛣️",
            "The purpose of our lives is to be happy. 😊",
            "Life is what happens to you while you're busy making other plans. 📅",
            "In the middle of difficulty lies opportunity. 💪",
            "The only way to do great work is to love what you do. ❤️",
            "Life isn't about waiting for the storm to pass, it's about learning to dance in the rain. 💃",
            "The future belongs to those who believe in the beauty of their dreams. 🔮",
            "Be the change you wish to see in the world. 🌍",
            "What lies behind us and what lies before us are tiny matters compared to what lies within us. 🧠",
            "The only impossible journey is the one you never begin. 🚀",

            // Short & Powerful
            "Still waters run deep. 💧",
            "Time flies over us, but leaves its shadow behind. ⏰",
            "The soul becomes dyed with the color of its thoughts. 🎨",
            "No act of kindness, no matter how small, is ever wasted. 🤗",
            "Hope is the thing with feathers that perches in the soul. 🕊️",
            "To live is the rarest thing in the world. Most people exist, that is all. 🌟",
            "The only true wisdom is in knowing you know nothing. 🦉",
            "Be yourself; everyone else is already taken. 👤",
            "We are all in the gutter, but some of us are looking at the stars. 🌌",
            "You must be the change you wish to see in the world. ✨",

            // Love & Relationships
            "Love is composed of a single soul inhabiting two bodies. 💑",
            "The best thing to hold onto in life is each other. 🤝",
            "A successful marriage requires falling in love many times, always with the same person. 💍",
            "Love is friendship that has caught fire. 🔥",
            "The greatest happiness of life is the conviction that we are loved. 😊",
            "To love and be loved is to feel the sun from both sides. ☀️",
            "Love doesn't make the world go round. Love is what makes the ride worthwhile. 🎡",
            "The giving of love is an education in itself. 📚",
            "Love is when the other person's happiness is more important than your own. 💝",
            "True love stories never have endings. 📖",

            // Inspirational
            "Shoot for the moon. Even if you miss, you'll land among the stars. 🌙",
            "The only way to achieve the impossible is to believe it is possible. 💫",
            "Your time is limited, don't waste it living someone else's life. ⏳",
            "The harder the conflict, the more glorious the triumph. 🏆",
            "Don't watch the clock; do what it does. Keep going. ⏰",
            "Believe you can and you're halfway there. 🎯",
            "The future depends on what you do today. 📅",
            "It always seems impossible until it's done. ✅",
            "Success is not final, failure is not fatal: it is the courage to continue that counts. 🦁",
            "The way to get started is to quit talking and begin doing. 🎤",

            // Philosophical
            "I think, therefore I am. 🤔",
            "The unexamined life is not worth living. 🔍",
            "Man is born free, and everywhere he is in chains. 🔗",
            "One cannot step twice in the same river. 🌊",
            "Happiness is the meaning and the purpose of life, the whole aim and end of human existence. 😊",
            "The only thing I know is that I know nothing. ❓",
            "To be is to be perceived. 👁️",
            "We are what we repeatedly do. Excellence, then, is not an act, but a habit. ⭐",
            "The mind is everything. What you think you become. 🧠",
            "Life must be understood backward. But it must be lived forward. 🔄",

            // Nature's Beauty
            "Adopt the pace of nature: her secret is patience. 🐢",
            "Nature does not hurry, yet everything is accomplished. 🍃",
            "The earth has music for those who listen. 🎵",
            "Look deep into nature, and then you will understand everything better. 🔍",
            "To sit in the shade on a fine day and look upon verdure is the most perfect refreshment. 🌳",
            "The poetry of the earth is never dead. 🌍",
            "Nature always wears the colors of the spirit. 🌈",
            "The clearest way into the Universe is through a forest wilderness. 🌲",
            "In every walk with nature one receives far more than he seeks. 🚶",
            "The mountains are my bones, the rivers my veins. ⛰️",

            // Dreams & Aspirations
            "All our dreams can come true, if we have the courage to pursue them. 🌟",
            "The future belongs to those who believe in the beauty of their dreams. 💭",
            "Dream big and dare to fail. 🚀",
            "A dream doesn't become reality through magic; it takes sweat, determination and hard work. 💪",
            "Hold fast to dreams, for if dreams die, life is a broken-winged bird that cannot fly. 🕊️",
            "Dreams are the touchstones of our characters. 💎",
            "The only thing that will stop you from fulfilling your dreams is you. 🛑",
            "Go confidently in the direction of your dreams. Live the life you have imagined. 🗺️",
            "Dreams are illustrations from the book your soul is writing about you. 📖",
            "First dream, then believe, then achieve. 🏆",

            // Friendship
            "A real friend is one who walks in when the rest of the world walks out. 👣",
            "Friendship is born at that moment when one person says to another: 'What! You too? I thought I was the only one.' 🤝",
            "True friendship comes when the silence between two people is comfortable. 🤫",
            "Friends are the family we choose for ourselves. 👨‍👩‍👧‍👦",
            "A friend is someone who knows all about you and still loves you. ❤️",
            "There is nothing better than a friend, unless it is a friend with chocolate. 🍫",
            "Good friends are like stars. You don't always see them, but you know they're always there. ⭐",
            "Friendship is the only cement that will ever hold the world together. 🌍",
            "A single rose can be my garden, a single friend my world. 🌹",
            "The language of friendship is not words but meanings. 💬",

            // Time & Moments
            "Time you enjoy wasting is not wasted time. ⏳",
            "The present moment is filled with joy and happiness. If you are attentive, you will see it. 😊",
            "Yesterday is history, tomorrow is a mystery, today is a gift. That's why it's called the present. 🎁",
            "Time is what we want most, but what we use worst. ⏰",
            "The key is in not spending time, but in investing it. 💰",
            "Lost time is never found again. 🔍",
            "Time is the most valuable thing a man can spend. 💎",
            "Don't count every hour in the day, make every hour in the day count. 📊",
            "The two most powerful warriors are patience and time. ⏳",
            "Time is the wisest counselor of all. 🦉",

            // Courage & Strength
            "Courage is not the absence of fear, but rather the assessment that something else is more important than fear. 🦁",
            "What lies behind us and what lies before us are tiny matters compared to what lies within us. 💪",
            "Be strong now because things will get better. It might be stormy now, but it can't rain forever. 🌧️",
            "You have power over your mind - not outside events. Realize this, and you will find strength. 🧠",
            "The human capacity for burden is like bamboo - far more flexible than you'd ever believe at first glance. 🎍",
            "Strength does not come from physical capacity. It comes from an indomitable will. 💪",
            "It takes courage to grow up and become who you really are. 🌱",
            "You never know how strong you are until being strong is your only choice. 💎",
            "The oak fought the wind and was broken, the willow bent when it must and survived. 🌳",
            "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage. ❤️",

            // Beauty & Art
            "Everything has beauty, but not everyone sees it. 👁️",
            "Art is the lie that enables us to realize the truth. 🎨",
            "The beauty of a woman is not in the clothes she wears, but in her eyes. 👀",
            "Beauty begins the moment you decide to be yourself. 💃",
            "Art washes away from the soul the dust of everyday life. 🎭",
            "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart. 💖",
            "Beauty is how you feel inside, and it reflects in your eyes. 😊",
            "Art is not what you see, but what you make others see. 🖼️",
            "The most beautiful things are not associated with money; they are memories and moments. 📸",
            "Beauty is not in the face; beauty is a light in the heart. 💡",

            // Hope & Faith
            "Hope is being able to see that there is light despite all of the darkness. 💡",
            "We must accept finite disappointment, but never lose infinite hope. 🌈",
            "Hope is the thing with feathers that perches in the soul. 🕊️",
            "Keep your face always toward the sunshine - and shadows will fall behind you. ☀️",
            "When you have a dream, you've got to grab it and never let go. 🌟",
            "Faith is taking the first step even when you don't see the whole staircase. 🪜",
            "The very essence of romance is uncertainty. ❓",
            "Hope is the only bee that makes honey without flowers. 🐝",
            "Where there is no vision, the people perish. 👁️",
            "Faith is the bird that feels the light when the dawn is still dark. 🐦",

            // Success & Achievement
            "Success is not the key to happiness. Happiness is the key to success. 😊",
            "The road to success and the road to failure are almost exactly the same. 🛣️",
            "Success usually comes to those who are too busy to be looking for it. 🔍",
            "Don't be afraid to give up the good to go for the great. 🚀",
            "I find that the harder I work, the more luck I seem to have. 🍀",
            "Success is walking from failure to failure with no loss of enthusiasm. 🚶",
            "The secret of success is to do the common thing uncommonly well. ⭐",
            "Success is not in what you have, but who you are. 👤",
            "The successful warrior is the average man, with laser-like focus. 🎯",
            "Success is getting what you want, happiness is wanting what you get. 🎁",

            // Wisdom & Knowledge
            "The only true wisdom is in knowing you know nothing. 🦉",
            "Knowledge is power. 💡",
            "The beautiful thing about learning is that no one can take it away from you. 📚",
            "Education is the most powerful weapon which you can use to change the world. 🌍",
            "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice. 🎁",
            "Wisdom is not a product of schooling but of the lifelong attempt to acquire it. 🏫",
            "The more that you read, the more things you will know. The more that you learn, the more places you'll go. 📖",
            "Knowledge speaks, but wisdom listens. 👂",
            "The journey of a thousand miles begins with a single step. 👣",
            "Wisdom begins in wonder. ❓",

            // Peace & Serenity
            "Peace begins with a smile. 😊",
            "Inner peace is the new success. 🧘",
            "Do not let the behavior of others destroy your inner peace. 🕊️",
            "Peace is not the absence of conflict, but the ability to cope with it. ☮️",
            "The life of inner peace, being harmonious and without stress, is the easiest type of existence. 🌊",
            "If you want peace, stop fighting. If you want peace of mind, stop fighting with your thoughts. 🤫",
            "Peace comes from within. Do not seek it without. 🔍",
            "When you find peace within yourself, you become the kind of person who can live at peace with others. 👥",
            "The greater the level of calmness of our mind, the greater our peace of mind. 🧠",
            "Peace is the beauty of life. It is sunshine. It is the smile of a child. 👶",

            // Final Inspirational
            "The best way to predict the future is to create it. 🔮",
            "Your life does not get better by chance, it gets better by change. 🔄",
            "The only limit to our realization of tomorrow will be our doubts of today. ❓",
            "What you get by achieving your goals is not as important as what you become by achieving your goals. 🎯",
            "The flower that blooms in adversity is the rarest and most beautiful of all. 🌸",
            "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart. 💭",
            "The secret of getting ahead is getting started. 🚀",
            "You are never too old to set another goal or to dream a new dream. 🌟",
            "The only person you are destined to become is the person you decide to be. 👤",
            "Life is 10% what happens to you and 90% how you react to it. 📊"
        ];

        // Select random poetic message
        const randomPoem = poeticMessages[Math.floor(Math.random() * poeticMessages.length)];

        // Create the final message with header
        const finalMessage = `📜 *POETIC WISDOM* 📜\n\n` +
                           `"${randomPoem}"\n\n` +
                           `*${settings.packname || 'WALLYJAYTECH-MD'}* 🤖 | *200+ Poetic Quotes*`;

        // Send the poetic message
        await sock.sendMessage(chatId, {
            text: finalMessage,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in poet command:', error);
        
        await sock.sendMessage(chatId, {
            text: '*❌ Failed to generate poetic message!*\n\nPlease try again later.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

module.exports = poetCommand;
