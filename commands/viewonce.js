// commands/viewonce.js
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { getCurrentFont, applyFont } = require('./menufont');
const { getCurrentStyle } = require('./menustyle');
const langManager = require('../language/manager');

// ---- TRANSLATIONS (All 23 Languages) ----
const translations = {
    'en': {
        title: "VIEW ONCE REVEALER",
        processing: "Processing view-once media...",
        not_view_once: "This is not a view-once message!",
        reply_prompt: "📸 Reply to a view-once message with .vv",
        invalid_option: "Invalid option! Use: .vv, .vv dm, or .vv silent",
        revealed: "🔓 Media revealed in this chat",
        sent_owner: "✅ View-once media sent to owner DM! 🔒",
        only_owner: "Only the bot owner can see it.",
        stealth: "🔒 Media revealed stealthily 🎭",
        unsupported: "Unsupported view-once type!",
        image_revealed: "📸 View Once Image Revealed! 🔓",
        video_revealed: "🎥 View Once Video Revealed! 🔓",
        voice_revealed: "🎵 View Once Voice Revealed! 🔓",
        from: "From",
        time: "Time",
        powered_by: "Powered by WALLYJAYTECH-MD",
        owner_dm_issue: "Owner DM Issue: Make sure the bot is in your contacts!",
        recovery_failed: "Recovery failed!",
        error: "Error"
    },
    'ha': {
        title: "MAI BUDA VIEW ONCE",
        processing: "Ana sarrafa view-once media...",
        not_view_once: "Wannan ba saƙon view-once ba ne!",
        reply_prompt: "📸 Amsa saƙon view-once da .vv",
        invalid_option: "Zaɓi mara inganci! Yi amfani: .vv, .vv dm, ko .vv silent",
        revealed: "🔓 An bayyana media a wannan taƙaitaccen",
        sent_owner: "✅ An aika view-once media zuwa DM na mai shi! 🔒",
        only_owner: "Mai shi bot ne kaɗai zai iya gani.",
        stealth: "🔒 An bayyana media a ɓoye 🎭",
        unsupported: "Nau'in view-once mara tallafi!",
        image_revealed: "📸 An Bayyana Hoton View Once! 🔓",
        video_revealed: "🎥 An Bayyana Bidiyon View Once! 🔓",
        voice_revealed: "🎵 An Bayyana Muryar View Once! 🔓",
        from: "Daga",
        time: "Lokaci",
        powered_by: "Ƙarfin WALLYJAYTECH-MD",
        owner_dm_issue: "Matsalar DM na Mai shi: Tabbatar cewa bot yana cikin lambobin sadarwarka!",
        recovery_failed: "Matsar dawo da bayanai ta gaza!",
        error: "Kuskure"
    },
    'yo': {
        title: "AṢÀFIHÀN VIEW ONCE",
        processing: "Ṣiṣe view-once media...",
        not_view_once: "Eyi kii ṣe ifiranṣẹ view-once!",
        reply_prompt: "📸 Dahun si ifiranṣẹ view-once pẹlu .vv",
        invalid_option: "Aṣayan ko wulo! Lo: .vv, .vv dm, tabi .vv silent",
        revealed: "🔓 Ti ṣafihan media ni ibaraẹnisọrọ yii",
        sent_owner: "✅ Ti fi view-once media ranṣẹ si DM onile! 🔒",
        only_owner: "Onile bot nikan ni o le ri.",
        stealth: "🔒 Ti ṣafihan media ni ikọkọ 🎭",
        unsupported: "Iru view-once ti ko ni atilẹyin!",
        image_revealed: "📸 Ti Ṣafihan Aworan View Once! 🔓",
        video_revealed: "🎥 Ti Ṣafihan Fidio View Once! 🔓",
        voice_revealed: "🎵 Ti Ṣafihan Ohun View Once! 🔓",
        from: "Lati",
        time: "Àkókò",
        powered_by: "Agbara WALLYJAYTECH-MD",
        owner_dm_issue: "Iṣoro DM Onile: Rii daju pe bot wa ninu awọn olubasọrọ rẹ!",
        recovery_failed: "Igbapada kuna!",
        error: "Aṣiṣe"
    },
    'ig': {
        title: "NKOWAPU VIEW ONCE",
        processing: "Na-ahazi view-once media...",
        not_view_once: "Nke a abụghị ozi view-once!",
        reply_prompt: "📸 Zaa ozi view-once na .vv",
        invalid_option: "Nhọrọ adịghị mma! Jiri: .vv, .vv dm, ma ọ bụ .vv silent",
        revealed: "🔓 Egosiputara media na mkparita uka a",
        sent_owner: "✅ Ezigara view-once media na DM onyenwe! 🔒",
        only_owner: "Naanị onye nwe bot nwere ike ịhụ ya.",
        stealth: "🔒 Egosiputara media na nzuzo 🎭",
        unsupported: "Ụdị view-once akwadoghị!",
        image_revealed: "📸 Egosiputara Foto View Once! 🔓",
        video_revealed: "🎥 Egosiputara Vidiyo View Once! 🔓",
        voice_revealed: "🎵 Egosiputara Olu View Once! 🔓",
        from: "Site na",
        time: "Oge",
        powered_by: "Site na WALLYJAYTECH-MD",
        owner_dm_issue: "Nsogbu DM Onyenwe: Hụ na bot dị na kọntaktị gị!",
        recovery_failed: "Mweghachi kụrụ afọ!",
        error: "Njehie"
    },
    'fr': {
        title: "RÉVÉLATEUR VIEW ONCE",
        processing: "Traitement du média view-once...",
        not_view_once: "Ce n'est pas un message view-once !",
        reply_prompt: "📸 Répondez à un message view-once avec .vv",
        invalid_option: "Option invalide ! Utilisez: .vv, .vv dm, ou .vv silent",
        revealed: "🔓 Média révélé dans cette discussion",
        sent_owner: "✅ Média view-once envoyé au DM du propriétaire ! 🔒",
        only_owner: "Seul le propriétaire du bot peut le voir.",
        stealth: "🔒 Média révélé discrètement 🎭",
        unsupported: "Type view-once non pris en charge !",
        image_revealed: "📸 Image View Once Révélée ! 🔓",
        video_revealed: "🎥 Vidéo View Once Révélée ! 🔓",
        voice_revealed: "🎵 Voix View Once Révélée ! 🔓",
        from: "De",
        time: "Heure",
        powered_by: "Propulsé par WALLYJAYTECH-MD",
        owner_dm_issue: "Problème DM propriétaire : Assurez-vous que le bot est dans vos contacts !",
        recovery_failed: "Échec de la récupération !",
        error: "Erreur"
    },
    'de': {
        title: "VIEW ONCE ENTHÜLLER",
        processing: "Verarbeite View-Once-Medien...",
        not_view_once: "Dies ist keine View-Once-Nachricht!",
        reply_prompt: "📸 Antworten Sie auf eine View-Once-Nachricht mit .vv",
        invalid_option: "Ungültige Option! Verwenden Sie: .vv, .vv dm, oder .vv silent",
        revealed: "🔓 Medien in diesem Chat enthüllt",
        sent_owner: "✅ View-Once-Medien an Besitzer-DM gesendet! 🔒",
        only_owner: "Nur der Bot-Besitzer kann es sehen.",
        stealth: "🔒 Medien heimlich enthüllt 🎭",
        unsupported: "Nicht unterstützter View-Once-Typ!",
        image_revealed: "📸 View-Once-Bild Enthüllt! 🔓",
        video_revealed: "🎥 View-Once-Video Enthüllt! 🔓",
        voice_revealed: "🎵 View-Once-Sprache Enthüllt! 🔓",
        from: "Von",
        time: "Zeit",
        powered_by: "Unterstützt von WALLYJAYTECH-MD",
        owner_dm_issue: "Besitzer-DM-Problem: Stellen Sie sicher, dass der Bot in Ihren Kontakten ist!",
        recovery_failed: "Wiederherstellung fehlgeschlagen!",
        error: "Fehler"
    },
    'ar': {
        title: "كاشف العرض مرة واحدة",
        processing: "جاري معالجة وسائط العرض مرة واحدة...",
        not_view_once: "هذه ليست رسالة عرض مرة واحدة!",
        reply_prompt: "📸 رد على رسالة العرض مرة واحدة باستخدام .vv",
        invalid_option: "خيار غير صالح! استخدم: .vv, .vv dm, أو .vv silent",
        revealed: "🔓 تم الكشف عن الوسائط في هذه المحادثة",
        sent_owner: "✅ تم إرسال وسائط العرض مرة واحدة إلى DM المالك! 🔒",
        only_owner: "يمكن لمالك البوت فقط رؤيتها.",
        stealth: "🔒 تم الكشف عن الوسائط بشكل سري 🎭",
        unsupported: "نوع العرض مرة واحدة غير مدعوم!",
        image_revealed: "📸 تم الكشف عن صورة العرض مرة واحدة! 🔓",
        video_revealed: "🎥 تم الكشف عن فيديو العرض مرة واحدة! 🔓",
        voice_revealed: "🎵 تم الكشف عن صوت العرض مرة واحدة! 🔓",
        from: "من",
        time: "الوقت",
        powered_by: "مدعوم من WALLYJAYTECH-MD",
        owner_dm_issue: "مشكلة DM المالك: تأكد من أن البوت في جهات اتصالك!",
        recovery_failed: "فشل الاسترداد!",
        error: "خطأ"
    },
    'zh': {
        title: "一次性查看揭示器",
        processing: "正在处理一次性查看媒体...",
        not_view_once: "这不是一次性查看消息！",
        reply_prompt: "📸 回复一次性查看消息使用 .vv",
        invalid_option: "无效选项！使用: .vv, .vv dm, 或 .vv silent",
        revealed: "🔓 媒体在此聊天中已揭示",
        sent_owner: "✅ 一次性查看媒体已发送给所有者私信！🔒",
        only_owner: "只有机器人所有者可以看到。",
        stealth: "🔒 媒体已悄悄揭示 🎭",
        unsupported: "不支持的一次性查看类型！",
        image_revealed: "📸 一次性查看图片已揭示！🔓",
        video_revealed: "🎥 一次性查看视频已揭示！🔓",
        voice_revealed: "🎵 一次性查看语音已揭示！🔓",
        from: "来自",
        time: "时间",
        powered_by: "由 WALLYJAYTECH-MD 提供支持",
        owner_dm_issue: "所有者私信问题：确保机器人在您的联系人中！",
        recovery_failed: "恢复失败！",
        error: "错误"
    },
    'hi': {
        title: "व्यू वन्स रिवीलर",
        processing: "व्यू वन्स मीडिया संसाधित किया जा रहा है...",
        not_view_once: "यह व्यू वन्स संदेश नहीं है!",
        reply_prompt: "📸 .vv के साथ व्यू वन्स संदेश का उत्तर दें",
        invalid_option: "अमान्य विकल्प! उपयोग करें: .vv, .vv dm, या .vv silent",
        revealed: "🔓 इस चैट में मीडिया प्रकट किया गया",
        sent_owner: "✅ व्यू वन्स मीडिया मालिक को भेजा गया! 🔒",
        only_owner: "केवल बॉट मालिक ही देख सकता है।",
        stealth: "🔒 मीडिया गुप्त रूप से प्रकट किया गया 🎭",
        unsupported: "असमर्थित व्यू वन्स प्रकार!",
        image_revealed: "📸 व्यू वन्स छवि प्रकट की गई! 🔓",
        video_revealed: "🎥 व्यू वन्स वीडियो प्रकट किया गया! 🔓",
        voice_revealed: "🎵 व्यू वन्स आवाज प्रकट की गई! 🔓",
        from: "से",
        time: "समय",
        powered_by: "WALLYJAYTECH-MD द्वारा संचालित",
        owner_dm_issue: "मालिक DM समस्या: सुनिश्चित करें कि बॉट आपके संपर्कों में है!",
        recovery_failed: "पुनर्प्राप्ति विफल!",
        error: "त्रुटि"
    },
    'es': {
        title: "REVELADOR DE VIEW ONCE",
        processing: "Procesando medio view-once...",
        not_view_once: "¡Esto no es un mensaje view-once!",
        reply_prompt: "📸 Responde a un mensaje view-once con .vv",
        invalid_option: "¡Opción inválida! Usa: .vv, .vv dm, o .vv silent",
        revealed: "🔓 Medio revelado en este chat",
        sent_owner: "✅ ¡Medio view-once enviado al DM del propietario! 🔒",
        only_owner: "Solo el propietario del bot puede verlo.",
        stealth: "🔒 Medio revelado sigilosamente 🎭",
        unsupported: "¡Tipo view-once no soportado!",
        image_revealed: "📸 ¡Imagen View Once Revelada! 🔓",
        video_revealed: "🎥 ¡Video View Once Revelado! 🔓",
        voice_revealed: "🎵 ¡Voz View Once Revelada! 🔓",
        from: "De",
        time: "Hora",
        powered_by: "Impulsado por WALLYJAYTECH-MD",
        owner_dm_issue: "¡Problema de DM del propietario: Asegúrate de que el bot esté en tus contactos!",
        recovery_failed: "¡Recuperación fallida!",
        error: "Error"
    },
    'pt': {
        title: "REVELADOR VIEW ONCE",
        processing: "Processando mídia view-once...",
        not_view_once: "Esta não é uma mensagem view-once!",
        reply_prompt: "📸 Responda a uma mensagem view-once com .vv",
        invalid_option: "Opção inválida! Use: .vv, .vv dm, ou .vv silent",
        revealed: "🔓 Mídia revelada neste chat",
        sent_owner: "✅ Mídia view-once enviada ao DM do proprietário! 🔒",
        only_owner: "Apenas o proprietário do bot pode vê-la.",
        stealth: "🔒 Mídia revelada em sigilo 🎭",
        unsupported: "Tipo view-once não suportado!",
        image_revealed: "📸 Imagem View Once Revelada! 🔓",
        video_revealed: "🎥 Vídeo View Once Revelado! 🔓",
        voice_revealed: "🎵 Voz View Once Revelada! 🔓",
        from: "De",
        time: "Hora",
        powered_by: "Desenvolvido por WALLYJAYTECH-MD",
        owner_dm_issue: "Problema DM do proprietário: Certifique-se de que o bot está nos seus contatos!",
        recovery_failed: "Recuperação falhou!",
        error: "Erro"
    },
    'ru': {
        title: "РАСКРЫВАТЕЛЬ VIEW ONCE",
        processing: "Обработка медиа view-once...",
        not_view_once: "Это не сообщение view-once!",
        reply_prompt: "📸 Ответьте на сообщение view-once с .vv",
        invalid_option: "Неверная опция! Используйте: .vv, .vv dm, или .vv silent",
        revealed: "🔓 Медиа раскрыто в этом чате",
        sent_owner: "✅ Медиа view-once отправлено владельцу в DM! 🔒",
        only_owner: "Только владелец бота может это увидеть.",
        stealth: "🔒 Медиа раскрыто скрытно 🎭",
        unsupported: "Неподдерживаемый тип view-once!",
        image_revealed: "📸 Изображение View Once Раскрыто! 🔓",
        video_revealed: "🎥 Видео View Once Раскрыто! 🔓",
        voice_revealed: "🎵 Голос View Once Раскрыт! 🔓",
        from: "От",
        time: "Время",
        powered_by: "Работает на WALLYJAYTECH-MD",
        owner_dm_issue: "Проблема DM владельца: Убедитесь, что бот есть в ваших контактах!",
        recovery_failed: "Восстановление не удалось!",
        error: "Ошибка"
    },
    'ur': {
        title: "ویو اونس ریویلر",
        processing: "ویو اونس میڈیا پر کارروائی ہو رہی ہے...",
        not_view_once: "یہ ویو اونس پیغام نہیں ہے!",
        reply_prompt: "📸 .vv کے ساتھ ویو اونس پیغام کا جواب دیں",
        invalid_option: "غلط آپشن! استعمال کریں: .vv, .vv dm, یا .vv silent",
        revealed: "🔓 اس چیٹ میں میڈیا ظاہر کیا گیا",
        sent_owner: "✅ ویو اونس میڈیا مالک کو بھیج دیا گیا! 🔒",
        only_owner: "صرف بوٹ کا مالک ہی دیکھ سکتا ہے۔",
        stealth: "🔒 میڈیا خفیہ طور پر ظاہر کیا گیا 🎭",
        unsupported: "غیر تعاون یافتہ ویو اونس قسم!",
        image_revealed: "📸 ویو اونس تصویر ظاہر کی گئی! 🔓",
        video_revealed: "🎥 ویو اونس ویڈیو ظاہر کی گئی! 🔓",
        voice_revealed: "🎵 ویو اونس آواز ظاہر کی گئی! 🔓",
        from: "سے",
        time: "وقت",
        powered_by: "WALLYJAYTECH-MD کے ذریعے تقویت یافتہ",
        owner_dm_issue: "مالک DM مسئلہ: یقینی بنائیں کہ بوٹ آپ کے رابطوں میں ہے!",
        recovery_failed: "بازیابی ناکام!",
        error: "خرابی"
    },
    'bn': {
        title: "ভিউ ওয়ান্স রিভিলার",
        processing: "ভিউ ওয়ান্স মিডিয়া প্রক্রিয়া করা হচ্ছে...",
        not_view_once: "এটি একটি ভিউ ওয়ান্স বার্তা নয়!",
        reply_prompt: "📸 .vv দিয়ে ভিউ ওয়ান্স বার্তার উত্তর দিন",
        invalid_option: "অবৈধ অপশন! ব্যবহার করুন: .vv, .vv dm, বা .vv silent",
        revealed: "🔓 এই চ্যাটে মিডিয়া প্রকাশিত হয়েছে",
        sent_owner: "✅ ভিউ ওয়ান্স মিডিয়া মালিকের DM-এ পাঠানো হয়েছে! 🔒",
        only_owner: "শুধুমাত্র বট মালিক এটি দেখতে পারেন।",
        stealth: "🔒 মিডিয়া গোপনে প্রকাশিত হয়েছে 🎭",
        unsupported: "অসমর্থিত ভিউ ওয়ান্স ধরন!",
        image_revealed: "📸 ভিউ ওয়ান্স ছবি প্রকাশিত হয়েছে! 🔓",
        video_revealed: "🎥 ভিউ ওয়ান্স ভিডিও প্রকাশিত হয়েছে! 🔓",
        voice_revealed: "🎵 ভিউ ওয়ান্স ভয়েস প্রকাশিত হয়েছে! 🔓",
        from: "থেকে",
        time: "সময়",
        powered_by: "WALLYJAYTECH-MD দ্বারা চালিত",
        owner_dm_issue: "মালিক DM সমস্যা: নিশ্চিত করুন যে বট আপনার পরিচিতিতে আছে!",
        recovery_failed: "পুনরুদ্ধার ব্যর্থ!",
        error: "ত্রুটি"
    },
    'pcm': {
        title: "VIEW ONCE REVEALER",
        processing: "De process view-once media...",
        not_view_once: "This one no be view-once message!",
        reply_prompt: "📸 Reply to view-once message with .vv",
        invalid_option: "Option wey you use no correct! Use: .vv, .vv dm, or .vv silent",
        revealed: "🔓 Media don show for this chat",
        sent_owner: "✅ View-once media don go owner DM! 🔒",
        only_owner: "Only bot owner fit see am.",
        stealth: "🔒 Media don show for secret 🎭",
        unsupported: "View-once type wey no dey supported!",
        image_revealed: "📸 View Once Image Don Show! 🔓",
        video_revealed: "🎥 View Once Video Don Show! 🔓",
        voice_revealed: "🎵 View Once Voice Don Show! 🔓",
        from: "From",
        time: "Time",
        powered_by: "Powered by WALLYJAYTECH-MD",
        owner_dm_issue: "Owner DM Problem: Make sure say bot dey your contacts!",
        recovery_failed: "Recovery no work!",
        error: "Error"
    },
    'it': {
        title: "RIVELATORE VIEW ONCE",
        processing: "Elaborazione media view-once...",
        not_view_once: "Questo non è un messaggio view-once!",
        reply_prompt: "📸 Rispondi a un messaggio view-once con .vv",
        invalid_option: "Opzione non valida! Usa: .vv, .vv dm, o .vv silent",
        revealed: "🔓 Media rivelato in questa chat",
        sent_owner: "✅ Media view-once inviato al DM del proprietario! 🔒",
        only_owner: "Solo il proprietario del bot può vederlo.",
        stealth: "🔒 Media rivelato in segreto 🎭",
        unsupported: "Tipo view-once non supportato!",
        image_revealed: "📸 Immagine View Once Rivelata! 🔓",
        video_revealed: "🎥 Video View Once Rivelato! 🔓",
        voice_revealed: "🎵 Voce View Once Rivelata! 🔓",
        from: "Da",
        time: "Ora",
        powered_by: "Realizzato da WALLYJAYTECH-MD",
        owner_dm_issue: "Problema DM proprietario: Assicurati che il bot sia nei tuoi contatti!",
        recovery_failed: "Recupero fallito!",
        error: "Errore"
    },
    'id': {
        title: "PENGUNGKAP VIEW ONCE",
        processing: "Memproses media view-once...",
        not_view_once: "Ini bukan pesan view-once!",
        reply_prompt: "📸 Balas pesan view-once dengan .vv",
        invalid_option: "Opsi tidak valid! Gunakan: .vv, .vv dm, atau .vv silent",
        revealed: "🔓 Media diungkap di chat ini",
        sent_owner: "✅ Media view-once dikirim ke DM pemilik! 🔒",
        only_owner: "Hanya pemilik bot yang bisa melihatnya.",
        stealth: "🔒 Media diungkap secara diam-diam 🎭",
        unsupported: "Jenis view-once tidak didukung!",
        image_revealed: "📸 Gambar View Once Diungkap! 🔓",
        video_revealed: "🎥 Video View Once Diungkap! 🔓",
        voice_revealed: "🎵 Suara View Once Diungkap! 🔓",
        from: "Dari",
        time: "Waktu",
        powered_by: "Didukung oleh WALLYJAYTECH-MD",
        owner_dm_issue: "Masalah DM pemilik: Pastikan bot ada di kontak Anda!",
        recovery_failed: "Pemulihan gagal!",
        error: "Kesalahan"
    },
    'ja': {
        title: "ビュー・ワンス リビーラー",
        processing: "ビュー・ワンスメディアを処理中...",
        not_view_once: "これはビュー・ワンスメッセージではありません！",
        reply_prompt: "📸 .vvでビュー・ワンスメッセージに返信",
        invalid_option: "無効なオプション！使用: .vv, .vv dm, または .vv silent",
        revealed: "🔓 このチャットでメディアが表示されました",
        sent_owner: "✅ ビュー・ワンスメディアを所有者のDMに送信！🔒",
        only_owner: "ボットの所有者だけが見ることができます。",
        stealth: "🔒 メディアが密かに表示されました 🎭",
        unsupported: "サポートされていないビュー・ワンスタイプ！",
        image_revealed: "📸 ビュー・ワンス画像が表示されました！🔓",
        video_revealed: "🎥 ビュー・ワンス動画が表示されました！🔓",
        voice_revealed: "🎵 ビュー・ワンス音声が表示されました！🔓",
        from: "から",
        time: "時間",
        powered_by: "WALLYJAYTECH-MD によって提供",
        owner_dm_issue: "所有者DMの問題：ボットが連絡先にいることを確認してください！",
        recovery_failed: "復元に失敗しました！",
        error: "エラー"
    },
    'sw': {
        title: "MFUNUAJI WA VIEW ONCE",
        processing: "Inachakata media view-once...",
        not_view_once: "Hii sio ujumbe wa view-once!",
        reply_prompt: "📸 Jibu ujumbe wa view-once kwa .vv",
        invalid_option: "Chaguo batili! Tumia: .vv, .vv dm, au .vv silent",
        revealed: "🔓 Media imefunuliwa katika mazungumzo haya",
        sent_owner: "✅ Media view-once imetumwa kwa DM ya mmiliki! 🔒",
        only_owner: "Mmiliki wa bot pekee ndiye anayeweza kuiona.",
        stealth: "🔒 Media imefunuliwa kwa siri 🎭",
        unsupported: "Aina ya view-once haitumiki!",
        image_revealed: "📸 Picha ya View Once Imefunuliwa! 🔓",
        video_revealed: "🎥 Video ya View Once Imefunuliwa! 🔓",
        voice_revealed: "🎵 Sauti ya View Once Imefunuliwa! 🔓",
        from: "Kutoka",
        time: "Muda",
        powered_by: "Inaendeshwa na WALLYJAYTECH-MD",
        owner_dm_issue: "Shida ya DM ya mmiliki: Hakikisha bot iko kwenye mawasiliano yako!",
        recovery_failed: "Urejeshaji umeshindwa!",
        error: "Hitilafu"
    },
    'tr': {
        title: "VIEW ONCE GÖSTERİCİ",
        processing: "View-once medyası işleniyor...",
        not_view_once: "Bu bir view-once mesajı değil!",
        reply_prompt: "📸 .vv ile bir view-once mesajına yanıt verin",
        invalid_option: "Geçersiz seçenek! Kullan: .vv, .vv dm, veya .vv silent",
        revealed: "🔓 Bu sohbette medya gösterildi",
        sent_owner: "✅ View-once medyası sahibinin DM'sine gönderildi! 🔒",
        only_owner: "Bot sahibinden başkası göremez.",
        stealth: "🔒 Medya gizlice gösterildi 🎭",
        unsupported: "Desteklenmeyen view-once türü!",
        image_revealed: "📸 View Once Görseli Gösterildi! 🔓",
        video_revealed: "🎥 View Once Videosu Gösterildi! 🔓",
        voice_revealed: "🎵 View Once Sesi Gösterildi! 🔓",
        from: "Kimden",
        time: "Zaman",
        powered_by: "WALLYJAYTECH-MD tarafından desteklenmektedir",
        owner_dm_issue: "Sahip DM Sorunu: Botun kişilerinizde olduğundan emin olun!",
        recovery_failed: "Kurtarma başarısız!",
        error: "Hata"
    },
    'ko': {
        title: "뷰 원스 리빌러",
        processing: "뷰 원스 미디어 처리 중...",
        not_view_once: "이것은 뷰 원스 메시지가 아닙니다!",
        reply_prompt: "📸 .vv로 뷰 원스 메시지에 답장",
        invalid_option: "잘못된 옵션! 사용: .vv, .vv dm, 또는 .vv silent",
        revealed: "🔓 이 채팅에서 미디어가 공개되었습니다",
        sent_owner: "✅ 뷰 원스 미디어가 소유자 DM으로 전송되었습니다! 🔒",
        only_owner: "봇 소유자만 볼 수 있습니다.",
        stealth: "🔒 미디어가 비밀리에 공개되었습니다 🎭",
        unsupported: "지원되지 않는 뷰 원스 유형!",
        image_revealed: "📸 뷰 원스 이미지 공개! 🔓",
        video_revealed: "🎥 뷰 원스 비디오 공개! 🔓",
        voice_revealed: "🎵 뷰 원스 음성 공개! 🔓",
        from: "보낸 사람",
        time: "시간",
        powered_by: "WALLYJAYTECH-MD 제공",
        owner_dm_issue: "소유자 DM 문제: 봇이 연락처에 있는지 확인하세요!",
        recovery_failed: "복구 실패!",
        error: "오류"
    },
    'vi': {
        title: "NGƯỜI TIẾT LỘ VIEW ONCE",
        processing: "Đang xử lý media view-once...",
        not_view_once: "Đây không phải tin nhắn view-once!",
        reply_prompt: "📸 Trả lời tin nhắn view-once với .vv",
        invalid_option: "Tùy chọn không hợp lệ! Sử dụng: .vv, .vv dm, hoặc .vv silent",
        revealed: "🔓 Media đã được tiết lộ trong cuộc trò chuyện này",
        sent_owner: "✅ Media view-once đã được gửi đến DM của chủ sở hữu! 🔒",
        only_owner: "Chỉ chủ sở hữu bot mới có thể xem.",
        stealth: "🔒 Media đã được tiết lộ bí mật 🎭",
        unsupported: "Loại view-once không được hỗ trợ!",
        image_revealed: "📸 Hình ảnh View Once Đã Được Tiết Lộ! 🔓",
        video_revealed: "🎥 Video View Once Đã Được Tiết Lộ! 🔓",
        voice_revealed: "🎵 Giọng nói View Once Đã Được Tiết Lộ! 🔓",
        from: "Từ",
        time: "Thời gian",
        powered_by: "Được hỗ trợ bởi WALLYJAYTECH-MD",
        owner_dm_issue: "Vấn đề DM của chủ sở hữu: Đảm bảo bot nằm trong danh bạ của bạn!",
        recovery_failed: "Khôi phục thất bại!",
        error: "Lỗi"
    },
    'ta': {
        title: "வியூ ஒன்ஸ் வெளிப்படுத்தி",
        processing: "வியூ ஒன்ஸ் மீடியா செயலாக்கப்படுகிறது...",
        not_view_once: "இது வியூ ஒன்ஸ் செய்தி அல்ல!",
        reply_prompt: "📸 .vv உடன் வியூ ஒன்ஸ் செய்திக்கு பதிலளிக்கவும்",
        invalid_option: "தவறான விருப்பம்! பயன்படுத்தவும்: .vv, .vv dm, அல்லது .vv silent",
        revealed: "🔓 இந்த அரட்டையில் மீடியா வெளிப்படுத்தப்பட்டது",
        sent_owner: "✅ வியூ ஒன்ஸ் மீடியா உரிமையாளர் DMக்கு அனுப்பப்பட்டது! 🔒",
        only_owner: "பாட் உரிமையாளர் மட்டுமே பார்க்க முடியும்.",
        stealth: "🔒 மீடியா ரகசியமாக வெளிப்படுத்தப்பட்டது 🎭",
        unsupported: "ஆதரிக்கப்படாத வியூ ஒன்ஸ் வகை!",
        image_revealed: "📸 வியூ ஒன்ஸ் படம் வெளிப்படுத்தப்பட்டது! 🔓",
        video_revealed: "🎥 வியூ ஒன்ஸ் வீடியோ வெளிப்படுத்தப்பட்டது! 🔓",
        voice_revealed: "🎵 வியூ ஒன்ஸ் குரல் வெளிப்படுத்தப்பட்டது! 🔓",
        from: "இருந்து",
        time: "நேரம்",
        powered_by: "WALLYJAYTECH-MD ஆல் இயக்கப்படுகிறது",
        owner_dm_issue: "உரிமையாளர் DM சிக்கல்: பாட் உங்கள் தொடர்புகளில் இருப்பதை உறுதிசெய்க!",
        recovery_failed: "மீட்பு தோல்வியடைந்தது!",
        error: "பிழை"
    }
};

function getTranslation(langCode, key) {
    return translations[langCode]?.[key] || translations['en'][key] || key;
}

// ---- BUILD STYLED MESSAGE ----
function buildStyledMessage(styleId, title, contentLines, extraLines = []) {
    // --- STYLE 1 ---
    if (styleId === 1) {
        let menu = `╭──◆「 *${title}* 」◆\n├\n`;
        for (const line of contentLines) {
            menu += `├◇ ${line}\n`;
        }
        for (const line of extraLines) {
            menu += `├◇ ${line}\n`;
        }
        menu += `├\n╰─┬─★─☆─♪♪─★\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
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
        for (const line of extraLines) {
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
        for (const line of extraLines) {
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
        for (const line of extraLines) {
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
        for (const line of extraLines) {
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
        for (const line of extraLines) {
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
        for (const line of extraLines) {
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
        for (const line of extraLines) {
            menu += `├◇ ${line}\n`;
        }
        menu += `├\n╰─┬─★─☆─♪♪─★\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
        return menu;
    }
}

function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

async function viewOnceCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const userId = senderId.split('@')[0];
        const userLang = langManager.getUserLanguage(userId);
        const t = (key) => getTranslation(userLang, key);
        
        const fontId = getCurrentFont();
        const styleId = getCurrentStyle();
        
        const text = message.message?.conversation?.trim() ||
                    message.message?.extendedTextMessage?.text?.trim() || '';
        
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMessage) {
            const content = [
                '📸 Reply to a view-once message with .vv',
                '',
                '*Usage:* .vv',
                '*Options:*',
                '  └ .vv       → Reveal in chat',
                '  └ .vv dm    → Send to owner DM',
                '  └ .vv silent → Reveal stealthily'
            ];
            let menuMessage = buildStyledMessage(styleId, t('title'), content);
            menuMessage = applyFont(menuMessage, fontId);
            return await sock.sendMessage(chatId, { text: menuMessage }, { quoted: message });
        }

        // Check if it's a view-once message
        const isViewOnce = quotedMessage.viewOnceMessageV2 || 
                          quotedMessage.viewOnceMessageV2Extension || 
                          quotedMessage.viewOnceMessage;

        if (!isViewOnce) {
            const content = ['❌ This is not a view-once message!'];
            let menuMessage = buildStyledMessage(styleId, t('error'), content);
            menuMessage = applyFont(menuMessage, fontId);
            return await sock.sendMessage(chatId, { text: menuMessage }, { quoted: message });
        }

        const viewOnceContent = quotedMessage.viewOnceMessageV2 || 
                               quotedMessage.viewOnceMessageV2Extension || 
                               quotedMessage.viewOnceMessage;

        let mediaMessage = null;
        let mediaType = '';

        // Send processing message
        const processingMsg = await sock.sendMessage(chatId, { 
            text: '⏳ ' + t('processing')
        }, { quoted: message });

        // Handle different media types
        if (viewOnceContent.message?.imageMessage) {
            mediaType = 'image';
            const imageMsg = viewOnceContent.message.imageMessage;
            const stream = await downloadContentFromMessage(imageMsg, 'image');
            const buffer = await streamToBuffer(stream);
            
            const caption = `${t('image_revealed')}\n\n` +
                          `*${t('from')}:* ${message.key.remoteJid}\n` +
                          `*${t('time')}:* ${new Date().toLocaleString()}\n\n` +
                          `*${t('powered_by')}*`;
            
            mediaMessage = { image: buffer, caption: caption };
        } 
        else if (viewOnceContent.message?.videoMessage) {
            mediaType = 'video';
            const videoMsg = viewOnceContent.message.videoMessage;
            const stream = await downloadContentFromMessage(videoMsg, 'video');
            const buffer = await streamToBuffer(stream);
            
            const caption = `${t('video_revealed')}\n\n` +
                          `*${t('from')}:* ${message.key.remoteJid}\n` +
                          `*${t('time')}:* ${new Date().toLocaleString()}\n\n` +
                          `*${t('powered_by')}*`;
            
            mediaMessage = { video: buffer, caption: caption };
        }
        else if (viewOnceContent.message?.audioMessage) {
            mediaType = 'voice';
            const audioMsg = viewOnceContent.message.audioMessage;
            const stream = await downloadContentFromMessage(audioMsg, 'audio');
            const buffer = await streamToBuffer(stream);
            
            const caption = `${t('voice_revealed')}\n\n` +
                          `*${t('from')}:* ${message.key.remoteJid}\n` +
                          `*${t('time')}:* ${new Date().toLocaleString()}\n\n` +
                          `*${t('powered_by')}*`;
            
            mediaMessage = {
                audio: buffer,
                ptt: audioMsg.ptt === true,
                mimetype: audioMsg.mimetype || 'audio/ogg; codecs=opus',
                caption: caption
            };
        }
        else {
            const content = ['❌ ' + t('unsupported')];
            let menuMessage = buildStyledMessage(styleId, t('error'), content);
            menuMessage = applyFont(menuMessage, fontId);
            await sock.sendMessage(chatId, { text: menuMessage }, { quoted: message });
            return;
        }

        // Delete processing message
        try {
            await sock.sendMessage(chatId, { delete: processingMsg.key });
        } catch (e) {}

        // Extract option from command
        const option = text.replace(/^\.vv\s*/i, '').trim().toLowerCase();
        
        const settings = require('../settings');
        const ownerNumber = settings.ownerNumber;
        const ownerJID = `${ownerNumber}@s.whatsapp.net`;

        // Handle different privacy options
        switch(option) {
            case 'dm':
            case 'private':
            case 'me':
            case 'owner':
                // Send to owner's DM
                await sock.sendMessage(ownerJID, mediaMessage);
                
                const content1 = [
                    '✅ ' + t('sent_owner'),
                    '',
                    '🔒 ' + t('only_owner')
                ];
                let msg1 = buildStyledMessage(styleId, t('title'), content1);
                msg1 = applyFont(msg1, fontId);
                await sock.sendMessage(chatId, { text: msg1 }, { quoted: message });
                break;

            case 'silent':
            case 'stealth':
            case 'quiet':
                // Send in current chat with stealth mode
                await sock.sendMessage(chatId, mediaMessage);
                
                const content2 = ['🔒 ' + t('stealth')];
                let msg2 = buildStyledMessage(styleId, t('title'), content2);
                msg2 = applyFont(msg2, fontId);
                await sock.sendMessage(chatId, { text: msg2 }, { quoted: message });
                break;

            case '':
                // No option - reveal in current chat normally
                await sock.sendMessage(chatId, mediaMessage);
                
                const content3 = ['🔓 ' + t('revealed')];
                let msg3 = buildStyledMessage(styleId, t('title'), content3);
                msg3 = applyFont(msg3, fontId);
                await sock.sendMessage(chatId, { text: msg3 }, { quoted: message });
                break;

            default:
                const content4 = ['❌ ' + t('invalid_option')];
                let msg4 = buildStyledMessage(styleId, t('error'), content4);
                msg4 = applyFont(msg4, fontId);
                return await sock.sendMessage(chatId, { text: msg4 }, { quoted: message });
        }

    } catch (error) {
        console.error('ViewOnce Error:', error);
        
        const senderId = message.key.participant || message.key.remoteJid;
        const userId = senderId.split('@')[0];
        const userLang = langManager.getUserLanguage(userId);
        const t = (key) => getTranslation(userLang, key);
        
        const fontId = getCurrentFont();
        const styleId = getCurrentStyle();
        
        let errorMsg = `❌ ${t('recovery_failed')}\n\n*${t('error')}:* ${error.message}`;
        
        if (error.message.includes('not-authorized') || error.message.includes('401')) {
            errorMsg += '\n\n💡 ' + t('owner_dm_issue');
        }
        
        const content = [errorMsg];
        let msg = buildStyledMessage(styleId, t('error'), content);
        msg = applyFont(msg, fontId);
        
        await sock.sendMessage(chatId, { text: msg }, { quoted: message });
    }
}

module.exports = viewOnceCommand;
