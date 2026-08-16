// commands/language.js
const langManager = require('../language/manager');
const { getCurrentFont, applyFont } = require('./menufont');
const { getCurrentStyle } = require('./menustyle');

// ---- BUILD STYLED MESSAGE ----
function buildStyledMessage(styleId, title, contentLines) {
    // --- STYLE 1 ---
    if (styleId === 1) {
        let menu = `╭──◆「 *${title}* 」◆\n├\n`;
        for (const line of contentLines) {
            menu += `├◇ ${line}\n`;
        }
        menu += `├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
        return menu;
    }
    // --- STYLE 2 ---
    else if (styleId === 2) {
        let menu = `◈──────────────────────◈\n`;
        menu += `           *${title}*\n`;
        menu += `◈──────────────────────◈\n\n`;
        for (const line of contentLines) {
            menu += `▤ ${line}\n`;
        }
        menu += `◈──────────────────────◈\n\n`;
        menu += `◈──────────────────────◈\n`;
        menu += `           *WALLYJAYTECH-MD*\n`;
        menu += `◈──────────────────────◈`;
        return menu;
    }
    // --- STYLE 3 ---
    else if (styleId === 3) {
        let menu = `╔══════════════════╗\n║ *${title}*\n║ ══════════════════\n`;
        for (const line of contentLines) {
            menu += `║ ${line}\n`;
        }
        menu += `╚══════════════════╝\n\n`;
        menu += `╔══════════════════╗\n║ *WALLYJAYTECH-MD*\n╚══════════════════╝`;
        return menu;
    }
    // --- STYLE 4 (Jarvis) ---
    else if (styleId === 4) {
        let menu = `╭──〔 *${title}* 〕─┈𓊉꧂\n║     ╭──────────────┈❀\n`;
        for (const line of contentLines) {
            menu += `║☠︎︎║ ${line}\n`;
        }
        menu += `║     ╰──────────────┈❀\n`;
        menu += `╰───────────────────┈𓊉꧂\n\n`;
        menu += `╭─〔 *WALLYJAYTECH-MD* 〕──┈𓊉꧂\n`;
        menu += `╰─────────────────┈𓊉꧂`;
        return menu;
    }
    // --- STYLE 5 (Swirl) ---
    else if (styleId === 5) {
        let menu = `  🌀◈── *${title}* ──◈❃🌸❃\n\n╭──────────●●➤\n`;
        for (const line of contentLines) {
            menu += `┊ ${line}\n`;
        }
        menu += `╰──────·••─────•────●○\n\n`;
        menu += `╭──────────●●➤\n┊ *WALLYJAYTECH-MD*\n╰──────·••─────•────●○`;
        return menu;
    }
    // --- STYLE 6 (Love Wing) ---
    else if (styleId === 6) {
        let menu = `╭──〈 *${title}* 〉──💕⃝🕊️\n`;
        for (const line of contentLines) {
            menu += `⚚  ${line}\n`;
        }
        menu += `╰────────────────✌︎㋡\n\n`;
        menu += `╭──〈 *WALLYJAYTECH-MD* 〉──💕⃝🕊️\n`;
        menu += `╰──────────────✌︎㋡`;
        return menu;
    }
    // --- STYLE 7 (Aesthetic Bloom) ---
    else if (styleId === 7) {
        let menu = `╔══════════════════❥❥❥\n✧  *${title}*\n╚══════════════════❥❥❥\n`;
        for (const line of contentLines) {
            menu += `✧  ${line}\n`;
        }
        menu += `\n`;
        menu += `╔══════════════════❥❥❥\n✧  *WALLYJAYTECH-MD*\n╚══════════════════❥❥❥`;
        return menu;
    }
    // Fallback
    else {
        let menu = `╭──◆「 *${title}* 」◆\n├\n`;
        for (const line of contentLines) {
            menu += `├◇ ${line}\n`;
        }
        menu += `├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
        return menu;
    }
}

// ---- ALL 23 LANGUAGES ----
const languages = {
    'en': 'English',
    'ha': 'Hausa',
    'yo': 'Yoruba',
    'ig': 'Igbo',
    'fr': 'Français',
    'de': 'Deutsch',
    'ar': 'العربية',
    'zh': '中文',
    'hi': 'हिन्दी',
    'es': 'Español',
    'pt': 'Português',
    'ru': 'Русский',
    'ur': 'اردو',
    'bn': 'বাংলা',
    'pcm': 'Pidgin',
    'it': 'Italiano',
    'id': 'Bahasa Indonesia',
    'ja': '日本語',
    'sw': 'Kiswahili',
    'tr': 'Türkçe',
    'ko': '한국어',
    'vi': 'Tiếng Việt',
    'ta': 'தமிழ்'
};

// ---- TRANSLATIONS FOR LANGUAGE COMMAND ----
const langTranslations = {
    'en': {
        title: "LANGUAGE SETTINGS",
        available: "Available Languages:",
        current: "Current",
        usage: "Usage:",
        example: "Example:",
        changed: "Language changed to",
        error: "LANGUAGE ERROR",
        not_found: "Language not found",
        updated: "LANGUAGE UPDATED"
    },
    'ha': {
        title: "SAITIN HARSHE",
        available: "Harsunan da ake samu:",
        current: "Na yanzu",
        usage: "Amfani:",
        example: "Misali:",
        changed: "An canza harshe zuwa",
        error: "KUSKUREN HARSHE",
        not_found: "Ba a sami harshen ba",
        updated: "HARSHE AN CANJA"
    },
    'yo': {
        title: "ÈTÒ ÈDÈ",
        available: "Àwọn èdè ti o wa:",
        current: "Lọwọlọwọ",
        usage: "Àmúlò:",
        example: "Àpẹẹrẹ:",
        changed: "Èdè yipada si",
        error: "ÀSÌSÈ ÈDÈ",
        not_found: "Èdè ko si",
        updated: "ÈDÈ TI YỌ"
    },
    'ig': {
        title: "NTỌALA ASỤSỤ",
        available: "Asụsụ dị:",
        current: "Ugbu a",
        usage: "Ojiji:",
        example: "Ọmụmaatụ:",
        changed: "Agbanweela asụsụ gaa",
        error: "NJEHIE ASỤSỤ",
        not_found: "Ahụghị asụsụ",
        updated: "EMELITE ASỤSỤ"
    },
    'fr': {
        title: "PARAMÈTRES DE LANGUE",
        available: "Langues disponibles:",
        current: "Actuelle",
        usage: "Utilisation:",
        example: "Exemple:",
        changed: "Langue changée en",
        error: "ERREUR DE LANGUE",
        not_found: "Langue non trouvée",
        updated: "LANGUE MODIFIÉE"
    },
    'de': {
        title: "SPRACHEINSTELLUNGEN",
        available: "Verfügbare Sprachen:",
        current: "Aktuell",
        usage: "Verwendung:",
        example: "Beispiel:",
        changed: "Sprache geändert zu",
        error: "SPRACHFEHLER",
        not_found: "Sprache nicht gefunden",
        updated: "SPRACHE AKTUALISIERT"
    },
    'ar': {
        title: "إعدادات اللغة",
        available: "اللغات المتاحة:",
        current: "الحالية",
        usage: "الاستخدام:",
        example: "مثال:",
        changed: "تم تغيير اللغة إلى",
        error: "خطأ في اللغة",
        not_found: "اللغة غير موجودة",
        updated: "تم تحديث اللغة"
    },
    'zh': {
        title: "语言设置",
        available: "可用语言:",
        current: "当前",
        usage: "使用方法:",
        example: "示例:",
        changed: "语言已更改为",
        error: "语言错误",
        not_found: "找不到该语言",
        updated: "语言已更新"
    },
    'hi': {
        title: "भाषा सेटिंग्स",
        available: "उपलब्ध भाषाएँ:",
        current: "वर्तमान",
        usage: "उपयोग:",
        example: "उदाहरण:",
        changed: "भाषा बदलकर की गई",
        error: "भाषा त्रुटि",
        not_found: "भाषा नहीं मिली",
        updated: "भाषा अपडेट की गई"
    },
    'es': {
        title: "CONFIGURACIÓN DE IDIOMA",
        available: "Idiomas disponibles:",
        current: "Actual",
        usage: "Uso:",
        example: "Ejemplo:",
        changed: "Idioma cambiado a",
        error: "ERROR DE IDIOMA",
        not_found: "Idioma no encontrado",
        updated: "IDIOMA ACTUALIZADO"
    },
    'pt': {
        title: "CONFIGURAÇÕES DE IDIOMA",
        available: "Idiomas disponíveis:",
        current: "Atual",
        usage: "Uso:",
        example: "Exemplo:",
        changed: "Idioma alterado para",
        error: "ERRO DE IDIOMA",
        not_found: "Idioma não encontrado",
        updated: "IDIOMA ATUALIZADO"
    },
    'ru': {
        title: "НАСТРОЙКИ ЯЗЫКА",
        available: "Доступные языки:",
        current: "Текущий",
        usage: "Использование:",
        example: "Пример:",
        changed: "Язык изменен на",
        error: "ОШИБКА ЯЗЫКА",
        not_found: "Язык не найден",
        updated: "ЯЗЫК ОБНОВЛЕН"
    },
    'ur': {
        title: "زبان کی ترتیبات",
        available: "دستیاب زبانیں:",
        current: "موجودہ",
        usage: "استعمال:",
        example: "مثال:",
        changed: "زبان تبدیل کر دی گئی",
        error: "زبان کی خرابی",
        not_found: "زبان نہیں ملی",
        updated: "زبان اپ ڈیٹ کر دی گئی"
    },
    'bn': {
        title: "ভাষা সেটিংস",
        available: "উপলভ্য ভাষা:",
        current: "বর্তমান",
        usage: "ব্যবহার:",
        example: "উদাহরণ:",
        changed: "ভাষা পরিবর্তন করা হয়েছে",
        error: "ভাষা ত্রুটি",
        not_found: "ভাষা পাওয়া যায়নি",
        updated: "ভাষা আপডেট করা হয়েছে"
    },
    'pcm': {
        title: "LANGUAGE SETTINGS",
        available: "Languages wey dey:",
        current: "Current",
        usage: "How to use:",
        example: "Example:",
        changed: "Language don change to",
        error: "LANGUAGE ERROR",
        not_found: "Language no dey",
        updated: "LANGUAGE DON CHANGE"
    },
    'it': {
        title: "IMPOSTAZIONI LINGUA",
        available: "Lingue disponibili:",
        current: "Corrente",
        usage: "Utilizzo:",
        example: "Esempio:",
        changed: "Lingua cambiata in",
        error: "ERRORE LINGUA",
        not_found: "Lingua non trovata",
        updated: "LINGUA AGGIORNATA"
    },
    'id': {
        title: "PENGATURAN BAHASA",
        available: "Bahasa yang tersedia:",
        current: "Saat ini",
        usage: "Penggunaan:",
        example: "Contoh:",
        changed: "Bahasa diubah menjadi",
        error: "KESALAHAN BAHASA",
        not_found: "Bahasa tidak ditemukan",
        updated: "BAHASA DIPERBARUI"
    },
    'ja': {
        title: "言語設定",
        available: "利用可能な言語:",
        current: "現在",
        usage: "使用方法:",
        example: "例:",
        changed: "言語がに変更されました",
        error: "言語エラー",
        not_found: "言語が見つかりません",
        updated: "言語が更新されました"
    },
    'sw': {
        title: "MAPANGILIO YA LUGHA",
        available: "Lugha zinazopatikana:",
        current: "Sasa",
        usage: "Matumizi:",
        example: "Mfano:",
        changed: "Lugha imebadilishwa kwenda",
        error: "KOSA LA LUGHA",
        not_found: "Lugha haipatikani",
        updated: "LUGHA IMESASISHWA"
    },
    'tr': {
        title: "DİL AYARLARI",
        available: "Mevcut diller:",
        current: "Mevcut",
        usage: "Kullanım:",
        example: "Örnek:",
        changed: "Dil olarak değiştirildi",
        error: "DİL HATASI",
        not_found: "Dil bulunamadı",
        updated: "DİL GÜNCELLENDİ"
    },
    'ko': {
        title: "언어 설정",
        available: "사용 가능한 언어:",
        current: "현재",
        usage: "사용법:",
        example: "예시:",
        changed: "언어가 변경되었습니다",
        error: "언어 오류",
        not_found: "언어를 찾을 수 없음",
        updated: "언어가 업데이트되었습니다"
    },
    'vi': {
        title: "CÀI ĐẶT NGÔN NGỮ",
        available: "Ngôn ngữ có sẵn:",
        current: "Hiện tại",
        usage: "Cách sử dụng:",
        example: "Ví dụ:",
        changed: "Ngôn ngữ đã được thay đổi thành",
        error: "LỖI NGÔN NGỮ",
        not_found: "Không tìm thấy ngôn ngữ",
        updated: "NGÔN NGỮ ĐÃ CẬP NHẬT"
    },
    'ta': {
        title: "மொழி அமைப்புகள்",
        available: "கிடைக்கும் மொழிகள்:",
        current: "தற்போதைய",
        usage: "பயன்பாடு:",
        example: "எடுத்துக்காட்டு:",
        changed: "மொழி மாற்றப்பட்டது",
        error: "மொழி பிழை",
        not_found: "மொழி கிடைக்கவில்லை",
        updated: "மொழி புதுப்பிக்கப்பட்டது"
    }
};

function getTranslation(langCode, key) {
    return langTranslations[langCode]?.[key] || langTranslations['en'][key] || key;
}

async function languageCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const userId = senderId.split('@')[0];
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = text.split(' ').slice(1);
        
        const fontId = getCurrentFont();
        const styleId = getCurrentStyle();
        
        // Get user's current language
        const currentLang = langManager.getUserLanguage(userId);
        const t = (key) => getTranslation(currentLang, key);
        
        // Show available languages
        if (!args.length) {
            let content = [`🌐 ${t('available')}`, ''];
            
            for (const [code, name] of Object.entries(languages)) {
                const isCurrent = code === currentLang;
                const flag = getFlag(code);
                content.push(`├◇ ${flag} ${code}: ${name}${isCurrent ? ' ✅' : ''}`);
            }
            
            content.push('');
            content.push(`*${t('usage')}* .language <code>`);
            content.push(`*${t('example')}* .language ha`);
            
            let messageText = buildStyledMessage(styleId, t('title'), content);
            messageText = applyFont(messageText, fontId);
            
            return sock.sendMessage(chatId, { text: messageText }, { quoted: message });
        }
        
        const langCode = args[0].toLowerCase();
        
        if (!languages[langCode]) {
            const content = [`❌ ${t('not_found')}: "${langCode}"`];
            let messageText = buildStyledMessage(styleId, t('error'), content);
            messageText = applyFont(messageText, fontId);
            return sock.sendMessage(chatId, { text: messageText }, { quoted: message });
        }
        
        // Save user's language preference
        langManager.setUserLanguage(userId, langCode);
        
        // Get translation in the NEW language for success message
        const newT = (key) => getTranslation(langCode, key);
        const content = [`✅ ${newT('changed')} *${languages[langCode]}* (${langCode})`];
        
        let messageText = buildStyledMessage(styleId, newT('updated'), content);
        messageText = applyFont(messageText, fontId);
        
        await sock.sendMessage(chatId, { text: messageText }, { quoted: message });
        
    } catch (error) {
        console.error('Language command error:', error);
        await sock.sendMessage(chatId, { text: '❌ Error changing language' }, { quoted: message });
    }
}

function getFlag(code) {
    const flags = {
        'en': '🇬🇧', 'ha': '🇳🇬', 'yo': '🇳🇬', 'ig': '🇳🇬',
        'fr': '🇫🇷', 'de': '🇩🇪', 'ar': '🇸🇦', 'zh': '🇨🇳',
        'hi': '🇮🇳', 'es': '🇪🇸', 'pt': '🇵🇹', 'ru': '🇷🇺',
        'ur': '🇵🇰', 'bn': '🇧🇩', 'pcm': '🇳🇬', 'it': '🇮🇹',
        'id': '🇮🇩', 'ja': '🇯🇵', 'sw': '🇹🇿', 'tr': '🇹🇷',
        'ko': '🇰🇷', 'vi': '🇻🇳', 'ta': '🇱🇰'
    };
    return flags[code] || '🌐';
}

module.exports = languageCommand;
