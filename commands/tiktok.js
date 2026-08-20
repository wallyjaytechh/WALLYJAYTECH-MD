/**
 * WALLYJAYTECH-MD - TikTok Downloader
 * Full Professional Version with Multi-API, Animation, Full Info
 */

const axios = require('axios');
const { getCurrentFont, applyFont } = require('./menufont');
const { getCurrentStyle } = require('./menustyle');
const langManager = require('../language/manager');

// ---- 23 LANGUAGES ----
const translations = {
    'en': {
        title: "🎬 TIKTOK DOWNLOADER",
        downloading: "DOWNLOADING TIKTOK",
        success: "Downloaded successfully!",
        failed: "DOWNLOAD FAILED",
        caption_label: "Caption",
        hashtags_label: "Hashtags",
        stats_label: "Stats",
        audio_label: "Audio",
        quality_label: "Quality",
        size_label: "Size",
        duration_label: "Duration",
        api_used_label: "API Used",
        views: "Views",
        likes: "Likes",
        comments: "Comments",
        shares: "Shares",
        favorites: "Favorites",
        no_hashtags: "No hashtags found",
        no_caption: "No caption",
        unknown_audio: "Unknown audio",
        invalid_link: "Invalid TikTok link",
        invalid_link_msg: "Please provide a valid TikTok link.",
        usage_msg: "Usage: .tiktok <link>",
        examples: "Examples:",
        features: "Features:",
        no_watermark: "No watermark video",
        hd_quality: "HD quality",
        multiple_api: "Multiple API fallback",
        tips: "Tips:",
        check_public: "Check if video is public",
        try_different: "Try a different video",
        try_again: "Try again later",
        download_failed: "Could not download video",
        send_failed: "Could not send the video",
        file_too_large: "The file may be too large",
        api_trying: "Trying",
        api_failed: "failed",
        processing: "Processing...",
        video: "Video",
        music: "Music",
        story: "Story",
        photo: "Photo",
        creator: "Creator",
        followers: "Followers",
        total_likes: "Total Likes",
        type: "Type",
        content_type: "Content Type",
        resolution: "Resolution"
    },
    'ha': {
        title: "🎬 MAI ZAZZAGIN TIKTOK",
        downloading: "ANA ZAZZAGIN TIKTOK",
        success: "An zazzage cikin nasara!",
        failed: "ZA AZ ZAZZAGI YA GASA",
        caption_label: "Taken",
        hashtags_label: "Hashtags",
        stats_label: "Kididdiga",
        audio_label: "Sauti",
        quality_label: "Inganci",
        size_label: "Girma",
        duration_label: "Tsawon Lokaci",
        api_used_label: "API Da Aka Yi Amfani",
        views: "Kallo",
        likes: "Soyayya",
        comments: "Sharhi",
        shares: "Raba",
        favorites: "Favori",
        no_hashtags: "Babu hashtags",
        no_caption: "Babu taken",
        unknown_audio: "Sauti da ba a sani ba",
        invalid_link: "Mahaɗin TikTok mara inganci",
        invalid_link_msg: "Don Allah ka ba da mahaɗin TikTok mai inganci.",
        usage_msg: "Amfani: .tiktok <mahaɗi>",
        examples: "Misalai:",
        features: "Siffofi:",
        no_watermark: "Bidiyo mara tambarin ruwa",
        hd_quality: "Ingancin HD",
        multiple_api: "Faduwar API da yawa",
        tips: "Shawarwari:",
        check_public: "Tabbatar cewa bidiyo na jama'a ne",
        try_different: "Gwada wani bidiyo daban",
        try_again: "Gwada daga baya",
        download_failed: "An kasa zazzage bidiyo",
        send_failed: "An kasa aika bidiyo",
        file_too_large: "Fayil ɗin na iya zama babba sosai",
        api_trying: "Ana gwada",
        api_failed: "ya gaza",
        processing: "Ana sarrafawa...",
        video: "Bidiyo",
        music: "Kiɗa",
        story: "Labari",
        photo: "Hoto",
        creator: "Mai ƙirƙira",
        followers: "Mabiya",
        total_likes: "Jimlar Soyayya",
        type: "Nau'i",
        content_type: "Nau'in Abun Ciki",
        resolution: "Ƙuduri"
    },
    'yo': {
        title: "🎬 AṢÀJẸ́ FÍDÍÒ TIKTOK",
        downloading: "N GBA FÍDÍÒ TIKTOK",
        success: "A gba fídíò yìí ṣe!",
        failed: "GÍGBA FÍDÍÒ KÙNÀ",
        caption_label: "Akọle",
        hashtags_label: "Hashtags",
        stats_label: "Iṣiro",
        audio_label: "Ohun",
        quality_label: "Didara",
        size_label: "Iwọn",
        duration_label: "Iye akoko",
        api_used_label: "API Ti A Lò",
        views: "Wiwo",
        likes: "Ifẹ",
        comments: "Awọn asọye",
        shares: "Pínpín",
        favorites: "Awọn ayanfẹ",
        no_hashtags: "Ko si hashtags",
        no_caption: "Ko si akọle",
        unknown_audio: "Ohun ti a ko mọ",
        invalid_link: "Ọ̀nà TikTok ti ko wulo",
        invalid_link_msg: "Jọ̀wọ́ fi ọ̀nà TikTok ti o wulo.",
        usage_msg: "Lilo: .tiktok <ọ̀nà>",
        examples: "Àwọn àpẹẹrẹ:",
        features: "Àwọn ẹ̀ya:",
        no_watermark: "Fídíò láìsí àmi",
        hd_quality: "Didara HD",
        multiple_api: "Ọ̀pọ̀ API fallback",
        tips: "Àwọn ọ̀nà:",
        check_public: "Ríi dájú pé fídíò jẹ́ ti gbogbo ènìyàn",
        try_different: "Gbíyànjú fídíò míìran",
        try_again: "Gbíyànjú lẹ́ẹ̀kan sí i",
        download_failed: "A ko le gba fídíò",
        send_failed: "A ko le fi fídíò ránṣẹ́",
        file_too_large: "Fáìlì náà lè tóbi jù",
        api_trying: "N gbìyànjú",
        api_failed: "kùnà",
        processing: "N ṣiṣẹ...",
        video: "Fídíò",
        music: "Orin",
        story: "Ìtàn",
        photo: "Àwòrán",
        creator: "Olùdá",
        followers: "Àwọn ọmọlẹ́yìn",
        total_likes: "Lapapọ Ifẹ",
        type: "Iru",
        content_type: "Iru Akoonu",
        resolution: "Ipinnu"
    },
    'ig': {
        title: "🎬 ONYE NA-ETWETA VIDIYO TIKTOK",
        downloading: "NA-ETWETA VIDIYO TIKTOK",
        success: "Ewetala nke ọma!",
        failed: "ETWETA VIDIYO DARA",
        caption_label: "Isiokwu",
        hashtags_label: "Hashtags",
        stats_label: "Ọnụọgụ",
        audio_label: "Ọlụ",
        quality_label: "Ọkwa",
        size_label: "Nha",
        duration_label: "Oge",
        api_used_label: "API Ejiri",
        views: "Nlele",
        likes: "Ọkụ",
        comments: "Nkwuwa",
        shares: "Kekọrịta",
        favorites: "Ọkacha",
        no_hashtags: "Enweghị hashtags",
        no_caption: "Enweghị isiokwu",
        unknown_audio: "Ọlụ amaghị",
        invalid_link: "Njikọ TikTok adịghị mma",
        invalid_link_msg: "Biko nye njikọ TikTok ziri ezi.",
        usage_msg: "Ojiji: .tiktok <njikọ>",
        examples: "Ọmụmaatụ:",
        features: "Atụmatụ:",
        no_watermark: "Vidiyo enweghị akara",
        hd_quality: "Ọkwa HD",
        multiple_api: "Ọtụtụ API fallback",
        tips: "Ndụmọdụ:",
        check_public: "Hụ na vidiyo dị n'ihu ọha",
        try_different: "Nwaa vidiyo ọzọ",
        try_again: "Nwaa ọzọ",
        download_failed: "Enweghị ike ịkwatu vidiyo",
        send_failed: "Enweghị ike iziga vidiyo",
        file_too_large: "Faịlụ nwere ike buru ibu",
        api_trying: "Na-anwa",
        api_failed: "dara",
        processing: "Na-arụ ọrụ...",
        video: "Vidiyo",
        music: "Egwu",
        story: "Akụkọ",
        photo: "Foto",
        creator: "Onye okike",
        followers: "Ndị na-eso",
        total_likes: "Ngụkọta Ọkụ",
        type: "Ụdị",
        content_type: "Ụdị Ọdịnaya",
        resolution: "Mkpebi"
    },
    'fr': {
        title: "🎬 TÉLÉCHARGEUR TIKTOK",
        downloading: "TÉLÉCHARGEMENT TIKTOK",
        success: "Téléchargé avec succès !",
        failed: "ÉCHEC DU TÉLÉCHARGEMENT",
        caption_label: "Légende",
        hashtags_label: "Hashtags",
        stats_label: "Statistiques",
        audio_label: "Audio",
        quality_label: "Qualité",
        size_label: "Taille",
        duration_label: "Durée",
        api_used_label: "API Utilisée",
        views: "Vues",
        likes: "J'aime",
        comments: "Commentaires",
        shares: "Partages",
        favorites: "Favoris",
        no_hashtags: "Aucun hashtag trouvé",
        no_caption: "Pas de légende",
        unknown_audio: "Audio inconnu",
        invalid_link: "Lien TikTok invalide",
        invalid_link_msg: "Veuillez fournir un lien TikTok valide.",
        usage_msg: "Utilisation: .tiktok <lien>",
        examples: "Exemples:",
        features: "Fonctionnalités:",
        no_watermark: "Vidéo sans filigrane",
        hd_quality: "Qualité HD",
        multiple_api: "Plusieurs API de secours",
        tips: "Conseils:",
        check_public: "Vérifiez que la vidéo est publique",
        try_different: "Essayez une vidéo différente",
        try_again: "Réessayez plus tard",
        download_failed: "Impossible de télécharger la vidéo",
        send_failed: "Impossible d'envoyer la vidéo",
        file_too_large: "Le fichier est peut-être trop volumineux",
        api_trying: "Essai",
        api_failed: "a échoué",
        processing: "Traitement en cours...",
        video: "Vidéo",
        music: "Musique",
        story: "Story",
        photo: "Photo",
        creator: "Créateur",
        followers: "Abonnés",
        total_likes: "Total des likes",
        type: "Type",
        content_type: "Type de contenu",
        resolution: "Résolution"
    },
    'de': {
        title: "🎬 TIKTOK DOWNLOADER",
        downloading: "TIKTOK WIRD HERUNTERGELADEN",
        success: "Erfolgreich heruntergeladen!",
        failed: "HERUNTERLADEN FEHLGESCHLAGEN",
        caption_label: "Untertitel",
        hashtags_label: "Hashtags",
        stats_label: "Statistiken",
        audio_label: "Audio",
        quality_label: "Qualität",
        size_label: "Größe",
        duration_label: "Dauer",
        api_used_label: "Verwendete API",
        views: "Aufrufe",
        likes: "Gefällt mir",
        comments: "Kommentare",
        shares: "Geteilt",
        favorites: "Favoriten",
        no_hashtags: "Keine Hashtags gefunden",
        no_caption: "Kein Untertitel",
        unknown_audio: "Unbekanntes Audio",
        invalid_link: "Ungültiger TikTok-Link",
        invalid_link_msg: "Bitte geben Sie einen gültigen TikTok-Link ein.",
        usage_msg: "Verwendung: .tiktok <Link>",
        examples: "Beispiele:",
        features: "Funktionen:",
        no_watermark: "Video ohne Wasserzeichen",
        hd_quality: "HD-Qualität",
        multiple_api: "Mehrere API-Fallbacks",
        tips: "Tipps:",
        check_public: "Überprüfen Sie, ob das Video öffentlich ist",
        try_different: "Versuchen Sie ein anderes Video",
        try_again: "Versuchen Sie es später erneut",
        download_failed: "Video konnte nicht heruntergeladen werden",
        send_failed: "Video konnte nicht gesendet werden",
        file_too_large: "Die Datei könnte zu groß sein",
        api_trying: "Versuche",
        api_failed: "fehlgeschlagen",
        processing: "Wird verarbeitet...",
        video: "Video",
        music: "Musik",
        story: "Story",
        photo: "Foto",
        creator: "Ersteller",
        followers: "Follower",
        total_likes: "Gefällt mir insgesamt",
        type: "Typ",
        content_type: "Inhaltstyp",
        resolution: "Auflösung"
    },
    'ar': {
        title: "🎬 تحميل تيك توك",
        downloading: "جاري تحميل تيك توك",
        success: "تم التحميل بنجاح!",
        failed: "فشل التحميل",
        caption_label: "التعليق",
        hashtags_label: "الوسوم",
        stats_label: "الإحصائيات",
        audio_label: "الصوت",
        quality_label: "الجودة",
        size_label: "الحجم",
        duration_label: "المدة",
        api_used_label: "API المستخدمة",
        views: "المشاهدات",
        likes: "الإعجابات",
        comments: "التعليقات",
        shares: "المشاركات",
        favorites: "المفضلة",
        no_hashtags: "لا توجد وسوم",
        no_caption: "لا يوجد تعليق",
        unknown_audio: "صوت غير معروف",
        invalid_link: "رابط تيك توك غير صالح",
        invalid_link_msg: "يرجى تقديم رابط تيك توك صالح.",
        usage_msg: "الاستخدام: .tiktok <الرابط>",
        examples: "أمثلة:",
        features: "المميزات:",
        no_watermark: "فيديو بدون علامة مائية",
        hd_quality: "جودة HD",
        multiple_api: "عدة واجهات برمجة تطبيقات احتياطية",
        tips: "نصائح:",
        check_public: "تأكد من أن الفيديو عام",
        try_different: "جرب فيديو مختلف",
        try_again: "حاول مرة أخرى لاحقًا",
        download_failed: "تعذر تحميل الفيديو",
        send_failed: "تعذر إرسال الفيديو",
        file_too_large: "قد يكون الملف كبيرًا جدًا",
        api_trying: "جاري المحاولة",
        api_failed: "فشل",
        processing: "جاري المعالجة...",
        video: "فيديو",
        music: "موسيقى",
        story: "قصة",
        photo: "صورة",
        creator: "المنشئ",
        followers: "المتابعون",
        total_likes: "إجمالي الإعجابات",
        type: "النوع",
        content_type: "نوع المحتوى",
        resolution: "الدقة"
    },
    'zh': {
        title: "🎬 抖音下载器",
        downloading: "正在下载抖音",
        success: "下载成功！",
        failed: "下载失败",
        caption_label: "标题",
        hashtags_label: "话题标签",
        stats_label: "统计",
        audio_label: "音频",
        quality_label: "质量",
        size_label: "大小",
        duration_label: "时长",
        api_used_label: "使用的API",
        views: "观看次数",
        likes: "点赞",
        comments: "评论",
        shares: "分享",
        favorites: "收藏",
        no_hashtags: "未找到话题标签",
        no_caption: "无标题",
        unknown_audio: "未知音频",
        invalid_link: "无效的抖音链接",
        invalid_link_msg: "请提供有效的抖音链接。",
        usage_msg: "用法: .tiktok <链接>",
        examples: "示例:",
        features: "功能:",
        no_watermark: "无水印视频",
        hd_quality: "高清质量",
        multiple_api: "多个API备用",
        tips: "提示:",
        check_public: "检查视频是否公开",
        try_different: "尝试不同的视频",
        try_again: "稍后再试",
        download_failed: "无法下载视频",
        send_failed: "无法发送视频",
        file_too_large: "文件可能太大",
        api_trying: "正在尝试",
        api_failed: "失败",
        processing: "处理中...",
        video: "视频",
        music: "音乐",
        story: "故事",
        photo: "照片",
        creator: "创作者",
        followers: "粉丝",
        total_likes: "总点赞数",
        type: "类型",
        content_type: "内容类型",
        resolution: "分辨率"
    },
    'hi': {
        title: "🎬 टिकटॉक डाउनलोडर",
        downloading: "टिकटॉक डाउनलोड हो रहा है",
        success: "सफलतापूर्वक डाउनलोड!",
        failed: "डाउनलोड विफल",
        caption_label: "शीर्षक",
        hashtags_label: "हैशटैग",
        stats_label: "आँकड़े",
        audio_label: "ऑडियो",
        quality_label: "गुणवत्ता",
        size_label: "आकार",
        duration_label: "अवधि",
        api_used_label: "प्रयुक्त API",
        views: "दृश्य",
        likes: "पसंद",
        comments: "टिप्पणियाँ",
        shares: "शेयर",
        favorites: "पसंदीदा",
        no_hashtags: "कोई हैशटैग नहीं मिला",
        no_caption: "कोई शीर्षक नहीं",
        unknown_audio: "अज्ञात ऑडियो",
        invalid_link: "अमान्य टिकटॉक लिंक",
        invalid_link_msg: "कृपया एक वैध टिकटॉक लिंक प्रदान करें।",
        usage_msg: "उपयोग: .tiktok <लिंक>",
        examples: "उदाहरण:",
        features: "विशेषताएँ:",
        no_watermark: "बिना वॉटरमार्क वीडियो",
        hd_quality: "एचडी गुणवत्ता",
        multiple_api: "एकाधिक API बैकअप",
        tips: "सुझाव:",
        check_public: "जाँचें कि वीडियो सार्वजनिक है",
        try_different: "एक अलग वीडियो आज़माएँ",
        try_again: "बाद में पुनः प्रयास करें",
        download_failed: "वीडियो डाउनलोड नहीं हो सका",
        send_failed: "वीडियो भेजा नहीं जा सका",
        file_too_large: "फ़ाइल बहुत बड़ी हो सकती है",
        api_trying: "प्रयास कर रहा है",
        api_failed: "विफल",
        processing: "प्रसंस्करण...",
        video: "वीडियो",
        music: "संगीत",
        story: "कहानी",
        photo: "फोटो",
        creator: "निर्माता",
        followers: "अनुयायी",
        total_likes: "कुल पसंद",
        type: "प्रकार",
        content_type: "सामग्री प्रकार",
        resolution: "रिज़ॉल्यूशन"
    },
    'es': {
        title: "🎬 DESCARGADOR DE TIKTOK",
        downloading: "DESCARGANDO TIKTOK",
        success: "¡Descargado con éxito!",
        failed: "DESCARGA FALLIDA",
        caption_label: "Título",
        hashtags_label: "Hashtags",
        stats_label: "Estadísticas",
        audio_label: "Audio",
        quality_label: "Calidad",
        size_label: "Tamaño",
        duration_label: "Duración",
        api_used_label: "API Usada",
        views: "Vistas",
        likes: "Me gusta",
        comments: "Comentarios",
        shares: "Compartidos",
        favorites: "Favoritos",
        no_hashtags: "No se encontraron hashtags",
        no_caption: "Sin título",
        unknown_audio: "Audio desconocido",
        invalid_link: "Enlace de TikTok inválido",
        invalid_link_msg: "Por favor, proporcione un enlace de TikTok válido.",
        usage_msg: "Uso: .tiktok <enlace>",
        examples: "Ejemplos:",
        features: "Características:",
        no_watermark: "Video sin marca de agua",
        hd_quality: "Calidad HD",
        multiple_api: "Múltiples API de respaldo",
        tips: "Consejos:",
        check_public: "Verifique que el video sea público",
        try_different: "Pruebe un video diferente",
        try_again: "Intente de nuevo más tarde",
        download_failed: "No se pudo descargar el video",
        send_failed: "No se pudo enviar el video",
        file_too_large: "El archivo puede ser demasiado grande",
        api_trying: "Intentando",
        api_failed: "falló",
        processing: "Procesando...",
        video: "Video",
        music: "Música",
        story: "Historia",
        photo: "Foto",
        creator: "Creador",
        followers: "Seguidores",
        total_likes: "Total de Me gusta",
        type: "Tipo",
        content_type: "Tipo de contenido",
        resolution: "Resolución"
    },
    'pt': {
        title: "🎬 BAIXADOR DE TIKTOK",
        downloading: "BAIXANDO TIKTOK",
        success: "Baixado com sucesso!",
        failed: "FALHA NO BAIXAR",
        caption_label: "Legenda",
        hashtags_label: "Hashtags",
        stats_label: "Estatísticas",
        audio_label: "Áudio",
        quality_label: "Qualidade",
        size_label: "Tamanho",
        duration_label: "Duração",
        api_used_label: "API Usada",
        views: "Visualizações",
        likes: "Curtidas",
        comments: "Comentários",
        shares: "Compartilhamentos",
        favorites: "Favoritos",
        no_hashtags: "Nenhum hashtag encontrado",
        no_caption: "Sem legenda",
        unknown_audio: "Áudio desconhecido",
        invalid_link: "Link do TikTok inválido",
        invalid_link_msg: "Por favor, forneça um link válido do TikTok.",
        usage_msg: "Uso: .tiktok <link>",
        examples: "Exemplos:",
        features: "Recursos:",
        no_watermark: "Vídeo sem marca d'água",
        hd_quality: "Qualidade HD",
        multiple_api: "Múltiplas APIs de fallback",
        tips: "Dicas:",
        check_public: "Verifique se o vídeo é público",
        try_different: "Tente um vídeo diferente",
        try_again: "Tente novamente mais tarde",
        download_failed: "Não foi possível baixar o vídeo",
        send_failed: "Não foi possível enviar o vídeo",
        file_too_large: "O arquivo pode ser muito grande",
        api_trying: "Tentando",
        api_failed: "falhou",
        processing: "Processando...",
        video: "Vídeo",
        music: "Música",
        story: "História",
        photo: "Foto",
        creator: "Criador",
        followers: "Seguidores",
        total_likes: "Total de Curtidas",
        type: "Tipo",
        content_type: "Tipo de Conteúdo",
        resolution: "Resolução"
    },
    'ru': {
        title: "🎬 ЗАГРУЗЧИК TIKTOK",
        downloading: "ЗАГРУЗКА TIKTOK",
        success: "Успешно загружено!",
        failed: "ОШИБКА ЗАГРУЗКИ",
        caption_label: "Подпись",
        hashtags_label: "Хэштеги",
        stats_label: "Статистика",
        audio_label: "Аудио",
        quality_label: "Качество",
        size_label: "Размер",
        duration_label: "Длительность",
        api_used_label: "Использованный API",
        views: "Просмотры",
        likes: "Лайки",
        comments: "Комментарии",
        shares: "Поделились",
        favorites: "Избранное",
        no_hashtags: "Хэштеги не найдены",
        no_caption: "Нет подписи",
        unknown_audio: "Неизвестное аудио",
        invalid_link: "Недействительная ссылка TikTok",
        invalid_link_msg: "Пожалуйста, предоставьте действительную ссылку TikTok.",
        usage_msg: "Использование: .tiktok <ссылка>",
        examples: "Примеры:",
        features: "Возможности:",
        no_watermark: "Видео без водяного знака",
        hd_quality: "Качество HD",
        multiple_api: "Несколько запасных API",
        tips: "Советы:",
        check_public: "Проверьте, что видео общедоступно",
        try_different: "Попробуйте другое видео",
        try_again: "Попробуйте позже",
        download_failed: "Не удалось загрузить видео",
        send_failed: "Не удалось отправить видео",
        file_too_large: "Файл может быть слишком большим",
        api_trying: "Попытка",
        api_failed: "не удалось",
        processing: "Обработка...",
        video: "Видео",
        music: "Музыка",
        story: "История",
        photo: "Фото",
        creator: "Создатель",
        followers: "Подписчики",
        total_likes: "Всего лайков",
        type: "Тип",
        content_type: "Тип контента",
        resolution: "Разрешение"
    },
    'ur': {
        title: "🎬 ٹک ٹاک ڈاؤن لوڈر",
        downloading: "ٹک ٹاک ڈاؤن لوڈ ہو رہا ہے",
        success: "کامیابی سے ڈاؤن لوڈ!",
        failed: "ڈاؤن لوڈ ناکام",
        caption_label: "عنوان",
        hashtags_label: "ہیش ٹیگز",
        stats_label: "شماریات",
        audio_label: "آڈیو",
        quality_label: "کوالٹی",
        size_label: "سائز",
        duration_label: "مدت",
        api_used_label: "استعمال شدہ API",
        views: "مناظر",
        likes: "پسند",
        comments: "تبصرے",
        shares: "شیئرز",
        favorites: "پسندیدہ",
        no_hashtags: "کوئی ہیش ٹیگ نہیں ملا",
        no_caption: "کوئی عنوان نہیں",
        unknown_audio: "نامعلوم آڈیو",
        invalid_link: "غلط ٹک ٹاک لنک",
        invalid_link_msg: "براہ کرم ایک درست ٹک ٹاک لنک فراہم کریں۔",
        usage_msg: "استعمال: .tiktok <لنک>",
        examples: "مثالیں:",
        features: "خصوصیات:",
        no_watermark: "بغیر واٹر مارک ویڈیو",
        hd_quality: "ایچ ڈی کوالٹی",
        multiple_api: "متعدد API بیک اپ",
        tips: "مشورے:",
        check_public: "چیک کریں کہ ویڈیو عوامی ہے",
        try_different: "مختلف ویڈیو آزمائیں",
        try_again: "بعد میں دوبارہ کوشش کریں",
        download_failed: "ویڈیو ڈاؤن لوڈ نہیں ہو سکی",
        send_failed: "ویڈیو بھیجی نہیں جا سکی",
        file_too_large: "فائل بہت بڑی ہو سکتی ہے",
        api_trying: "کوشش کر رہا ہے",
        api_failed: "ناکام",
        processing: "پروسیسنگ...",
        video: "ویڈیو",
        music: "موسیقی",
        story: "کہانی",
        photo: "تصویر",
        creator: "تخلیق کار",
        followers: "فالوورز",
        total_likes: "کل پسند",
        type: "قسم",
        content_type: "مواد کی قسم",
        resolution: "ریزولوشن"
    },
    'bn': {
        title: "🎬 টিকটক ডাউনলোডার",
        downloading: "টিকটক ডাউনলোড হচ্ছে",
        success: "সফলভাবে ডাউনলোড!",
        failed: "ডাউনলোড ব্যর্থ",
        caption_label: "শিরোনাম",
        hashtags_label: "হ্যাশট্যাগ",
        stats_label: "পরিসংখ্যান",
        audio_label: "অডিও",
        quality_label: "গুণমান",
        size_label: "আকার",
        duration_label: "সময়কাল",
        api_used_label: "ব্যবহৃত API",
        views: "দেখা",
        likes: "লাইক",
        comments: "মন্তব্য",
        shares: "শেয়ার",
        favorites: "পছন্দ",
        no_hashtags: "কোন হ্যাশট্যাগ পাওয়া যায়নি",
        no_caption: "কোন শিরোনাম নেই",
        unknown_audio: "অজানা অডিও",
        invalid_link: "অবৈধ টিকটক লিঙ্ক",
        invalid_link_msg: "অনুগ্রহ করে একটি বৈধ টিকটক লিঙ্ক প্রদান করুন।",
        usage_msg: "ব্যবহার: .tiktok <লিঙ্ক>",
        examples: "উদাহরণ:",
        features: "বৈশিষ্ট্য:",
        no_watermark: "জলছাপবিহীন ভিডিও",
        hd_quality: "এইচডি গুণমান",
        multiple_api: "একাধিক API ব্যাকআপ",
        tips: "টিপস:",
        check_public: "ভিডিওটি পাবলিক কিনা চেক করুন",
        try_different: "একটি ভিন্ন ভিডিও চেষ্টা করুন",
        try_again: "পরে আবার চেষ্টা করুন",
        download_failed: "ভিডিও ডাউনলোড করা যায়নি",
        send_failed: "ভিডিও পাঠানো যায়নি",
        file_too_large: "ফাইলটি খুব বড় হতে পারে",
        api_trying: "চেষ্টা করছে",
        api_failed: "ব্যর্থ",
        processing: "প্রক্রিয়াকরণ...",
        video: "ভিডিও",
        music: "সঙ্গীত",
        story: "গল্প",
        photo: "ছবি",
        creator: "স্রষ্টা",
        followers: "অনুসারী",
        total_likes: "মোট লাইক",
        type: "ধরন",
        content_type: "বিষয়বস্তুর ধরন",
        resolution: "রেজোলিউশন"
    },
    'pcm': {
        title: "🎬 TIKTOK DOWNLOADA",
        downloading: "DE DOWNLOAD TIKTOK",
        success: "Don download finish!",
        failed: "DOWNLOAD NO WORK",
        caption_label: "Caption",
        hashtags_label: "Hashtags",
        stats_label: "Stats",
        audio_label: "Audio",
        quality_label: "Quality",
        size_label: "Size",
        duration_label: "How long",
        api_used_label: "API Wey Dem Use",
        views: "Views",
        likes: "Likes",
        comments: "Comments",
        shares: "Shares",
        favorites: "Favorites",
        no_hashtags: "No hashtags wey dem see",
        no_caption: "No caption",
        unknown_audio: "Audio wey no know",
        invalid_link: "TikTok link no correct",
        invalid_link_msg: "Please give correct TikTok link.",
        usage_msg: "How to use: .tiktok <link>",
        examples: "Example:",
        features: "Wetin e get:",
        no_watermark: "Video wey no get watermark",
        hd_quality: "HD quality",
        multiple_api: "Plenty API backup",
        tips: "Tips:",
        check_public: "Make sure say video dey public",
        try_different: "Try anoda video",
        try_again: "Try again later",
        download_failed: "No fit download video",
        send_failed: "No fit send video",
        file_too_large: "File fit too big",
        api_trying: "De try",
        api_failed: "no work",
        processing: "De process am...",
        video: "Video",
        music: "Music",
        story: "Story",
        photo: "Photo",
        creator: "Person wey make am",
        followers: "Followers",
        total_likes: "Total Likes",
        type: "Type",
        content_type: "Wetin Inside",
        resolution: "Resolution"
    },
    'it': {
        title: "🎬 DOWNLOADER TIKTOK",
        downloading: "SCARICANDO TIKTOK",
        success: "Scaricato con successo!",
        failed: "SCARICAMENTO FALLITO",
        caption_label: "Didascalia",
        hashtags_label: "Hashtag",
        stats_label: "Statistiche",
        audio_label: "Audio",
        quality_label: "Qualità",
        size_label: "Dimensione",
        duration_label: "Durata",
        api_used_label: "API Utilizzata",
        views: "Visualizzazioni",
        likes: "Mi piace",
        comments: "Commenti",
        shares: "Condivisioni",
        favorites: "Preferiti",
        no_hashtags: "Nessun hashtag trovato",
        no_caption: "Nessuna didascalia",
        unknown_audio: "Audio sconosciuto",
        invalid_link: "Link TikTok non valido",
        invalid_link_msg: "Si prega di fornire un link TikTok valido.",
        usage_msg: "Utilizzo: .tiktok <link>",
        examples: "Esempi:",
        features: "Caratteristiche:",
        no_watermark: "Video senza filigrana",
        hd_quality: "Qualità HD",
        multiple_api: "Multipli API di fallback",
        tips: "Suggerimenti:",
        check_public: "Verifica che il video sia pubblico",
        try_different: "Prova un video diverso",
        try_again: "Riprova più tardi",
        download_failed: "Impossibile scaricare il video",
        send_failed: "Impossibile inviare il video",
        file_too_large: "Il file potrebbe essere troppo grande",
        api_trying: "Tentativo",
        api_failed: "fallito",
        processing: "Elaborazione in corso...",
        video: "Video",
        music: "Musica",
        story: "Storia",
        photo: "Foto",
        creator: "Creatore",
        followers: "Follower",
        total_likes: "Mi piace totali",
        type: "Tipo",
        content_type: "Tipo di contenuto",
        resolution: "Risoluzione"
    },
    'id': {
        title: "🎬 PENGUNDUH TIKTOK",
        downloading: "MENGUNDUH TIKTOK",
        success: "Berhasil diunduh!",
        failed: "GAGAL MENGUNDUH",
        caption_label: "Keterangan",
        hashtags_label: "Hashtag",
        stats_label: "Statistik",
        audio_label: "Audio",
        quality_label: "Kualitas",
        size_label: "Ukuran",
        duration_label: "Durasi",
        api_used_label: "API yang Digunakan",
        views: "Tayangan",
        likes: "Suka",
        comments: "Komentar",
        shares: "Bagikan",
        favorites: "Favorit",
        no_hashtags: "Tidak ada hashtag ditemukan",
        no_caption: "Tidak ada keterangan",
        unknown_audio: "Audio tidak dikenal",
        invalid_link: "Link TikTok tidak valid",
        invalid_link_msg: "Silakan berikan link TikTok yang valid.",
        usage_msg: "Penggunaan: .tiktok <link>",
        examples: "Contoh:",
        features: "Fitur:",
        no_watermark: "Video tanpa watermark",
        hd_quality: "Kualitas HD",
        multiple_api: "Banyak API cadangan",
        tips: "Tips:",
        check_public: "Periksa apakah video bersifat publik",
        try_different: "Coba video yang berbeda",
        try_again: "Coba lagi nanti",
        download_failed: "Tidak dapat mengunduh video",
        send_failed: "Tidak dapat mengirim video",
        file_too_large: "File mungkin terlalu besar",
        api_trying: "Mencoba",
        api_failed: "gagal",
        processing: "Memproses...",
        video: "Video",
        music: "Musik",
        story: "Cerita",
        photo: "Foto",
        creator: "Pembuat",
        followers: "Pengikut",
        total_likes: "Total Suka",
        type: "Tipe",
        content_type: "Jenis Konten",
        resolution: "Resolusi"
    },
    'ja': {
        title: "🎬 TikTokダウンローダー",
        downloading: "TikTokをダウンロード中",
        success: "ダウンロード完了！",
        failed: "ダウンロード失敗",
        caption_label: "キャプション",
        hashtags_label: "ハッシュタグ",
        stats_label: "統計",
        audio_label: "オーディオ",
        quality_label: "品質",
        size_label: "サイズ",
        duration_label: "時間",
        api_used_label: "使用API",
        views: "再生回数",
        likes: "いいね",
        comments: "コメント",
        shares: "シェア",
        favorites: "お気に入り",
        no_hashtags: "ハッシュタグが見つかりません",
        no_caption: "キャプションなし",
        unknown_audio: "不明なオーディオ",
        invalid_link: "無効なTikTokリンク",
        invalid_link_msg: "有効なTikTokリンクを入力してください。",
        usage_msg: "使用方法: .tiktok <リンク>",
        examples: "例:",
        features: "機能:",
        no_watermark: "ウォーターマークなし動画",
        hd_quality: "HD品質",
        multiple_api: "複数APIフォールバック",
        tips: "ヒント:",
        check_public: "動画が公開されているか確認",
        try_different: "別の動画を試す",
        try_again: "後でもう一度試す",
        download_failed: "動画をダウンロードできませんでした",
        send_failed: "動画を送信できませんでした",
        file_too_large: "ファイルが大きすぎる可能性があります",
        api_trying: "試行中",
        api_failed: "失敗",
        processing: "処理中...",
        video: "動画",
        music: "音楽",
        story: "ストーリー",
        photo: "写真",
        creator: "クリエイター",
        followers: "フォロワー",
        total_likes: "合計いいね",
        type: "タイプ",
        content_type: "コンテンツタイプ",
        resolution: "解像度"
    },
    'sw': {
        title: "🎬 MPAGAZI WA TIKTOK",
        downloading: "INAPAKUA TIKTOK",
        success: "Imepakua kikamilifu!",
        failed: "KUPAKUA KUMESHINDWA",
        caption_label: "Maelezo",
        hashtags_label: "Hashtag",
        stats_label: "Takwimu",
        audio_label: "Sauti",
        quality_label: "Ubora",
        size_label: "Ukubwa",
        duration_label: "Muda",
        api_used_label: "API Iliyotumika",
        views: "Matazamo",
        likes: "Kupendwa",
        comments: "Maoni",
        shares: "Kushiriki",
        favorites: "Vipendwa",
        no_hashtags: "Hakuna hashtag zilizopatikana",
        no_caption: "Hakuna maelezo",
        unknown_audio: "Sauti isiyojulikana",
        invalid_link: "Kiungo cha TikTok si sahihi",
        invalid_link_msg: "Tafadhali toa kiungo sahihi cha TikTok.",
        usage_msg: "Matumizi: .tiktok <kiungo>",
        examples: "Mifano:",
        features: "Vipengele:",
        no_watermark: "Video bila alama ya maji",
        hd_quality: "Ubora wa HD",
        multiple_api: "API nyingi za mbadala",
        tips: "Vidokezo:",
        check_public: "Hakikisha video iko wazi",
        try_different: "Jaribu video nyingine",
        try_again: "Jaribu tena baadaye",
        download_failed: "Imeshindwa kupakua video",
        send_failed: "Imeshindwa kutuma video",
        file_too_large: "Faili inaweza kuwa kubwa sana",
        api_trying: "Inajaribu",
        api_failed: "imeshindwa",
        processing: "Inachakata...",
        video: "Video",
        music: "Muziki",
        story: "Hadithi",
        photo: "Picha",
        creator: "Muundaji",
        followers: "Wafuasi",
        total_likes: "Jumla ya Kupendwa",
        type: "Aina",
        content_type: "Aina ya Maudhui",
        resolution: "Ubora"
    },
    'tr': {
        title: "🎬 TIKTOK İNDİRİCİ",
        downloading: "TIKTOK İNDİRİLİYOR",
        success: "Başarıyla indirildi!",
        failed: "İNDİRME BAŞARISIZ",
        caption_label: "Başlık",
        hashtags_label: "Hashtag'ler",
        stats_label: "İstatistikler",
        audio_label: "Ses",
        quality_label: "Kalite",
        size_label: "Boyut",
        duration_label: "Süre",
        api_used_label: "Kullanılan API",
        views: "Görüntülenme",
        likes: "Beğeni",
        comments: "Yorumlar",
        shares: "Paylaşımlar",
        favorites: "Favoriler",
        no_hashtags: "Hashtag bulunamadı",
        no_caption: "Başlık yok",
        unknown_audio: "Bilinmeyen ses",
        invalid_link: "Geçersiz TikTok bağlantısı",
        invalid_link_msg: "Lütfen geçerli bir TikTok bağlantısı sağlayın.",
        usage_msg: "Kullanım: .tiktok <bağlantı>",
        examples: "Örnekler:",
        features: "Özellikler:",
        no_watermark: "Filigransız video",
        hd_quality: "HD kalite",
        multiple_api: "Çoklu API yedeklemesi",
        tips: "İpuçları:",
        check_public: "Videonun herkese açık olduğunu kontrol edin",
        try_different: "Farklı bir video deneyin",
        try_again: "Daha sonra tekrar deneyin",
        download_failed: "Video indirilemedi",
        send_failed: "Video gönderilemedi",
        file_too_large: "Dosya çok büyük olabilir",
        api_trying: "Deneniyor",
        api_failed: "başarısız",
        processing: "İşleniyor...",
        video: "Video",
        music: "Müzik",
        story: "Hikaye",
        photo: "Fotoğraf",
        creator: "Oluşturan",
        followers: "Takipçiler",
        total_likes: "Toplam Beğeni",
        type: "Tür",
        content_type: "İçerik Türü",
        resolution: "Çözünürlük"
    },
    'ko': {
        title: "🎬 틱톡 다운로더",
        downloading: "틱톡 다운로드 중",
        success: "다운로드 완료!",
        failed: "다운로드 실패",
        caption_label: "캡션",
        hashtags_label: "해시태그",
        stats_label: "통계",
        audio_label: "오디오",
        quality_label: "화질",
        size_label: "크기",
        duration_label: "시간",
        api_used_label: "사용된 API",
        views: "조회수",
        likes: "좋아요",
        comments: "댓글",
        shares: "공유",
        favorites: "즐겨찾기",
        no_hashtags: "해시태그 없음",
        no_caption: "캡션 없음",
        unknown_audio: "알 수 없는 오디오",
        invalid_link: "잘못된 틱톡 링크",
        invalid_link_msg: "유효한 틱톡 링크를 제공해주세요.",
        usage_msg: "사용법: .tiktok <링크>",
        examples: "예시:",
        features: "기능:",
        no_watermark: "워터마크 없는 영상",
        hd_quality: "HD 화질",
        multiple_api: "여러 API 대체",
        tips: "팁:",
        check_public: "영상이 공개인지 확인",
        try_different: "다른 영상 시도",
        try_again: "나중에 다시 시도",
        download_failed: "영상을 다운로드할 수 없음",
        send_failed: "영상을 전송할 수 없음",
        file_too_large: "파일이 너무 클 수 있음",
        api_trying: "시도 중",
        api_failed: "실패",
        processing: "처리 중...",
        video: "영상",
        music: "음악",
        story: "스토리",
        photo: "사진",
        creator: "크리에이터",
        followers: "팔로워",
        total_likes: "총 좋아요",
        type: "유형",
        content_type: "콘텐츠 유형",
        resolution: "해상도"
    },
    'vi': {
        title: "🎬 TẢI XUỐNG TIKTOK",
        downloading: "ĐANG TẢI TIKTOK",
        success: "Tải xuống thành công!",
        failed: "TẢI XUỐNG THẤT BẠI",
        caption_label: "Chú thích",
        hashtags_label: "Hashtag",
        stats_label: "Thống kê",
        audio_label: "Âm thanh",
        quality_label: "Chất lượng",
        size_label: "Kích thước",
        duration_label: "Thời lượng",
        api_used_label: "API Đã Sử Dụng",
        views: "Lượt xem",
        likes: "Thích",
        comments: "Bình luận",
        shares: "Chia sẻ",
        favorites: "Yêu thích",
        no_hashtags: "Không tìm thấy hashtag",
        no_caption: "Không có chú thích",
        unknown_audio: "Âm thanh không xác định",
        invalid_link: "Liên kết TikTok không hợp lệ",
        invalid_link_msg: "Vui lòng cung cấp liên kết TikTok hợp lệ.",
        usage_msg: "Cách dùng: .tiktok <liên kết>",
        examples: "Ví dụ:",
        features: "Tính năng:",
        no_watermark: "Video không có watermark",
        hd_quality: "Chất lượng HD",
        multiple_api: "Nhiều API dự phòng",
        tips: "Mẹo:",
        check_public: "Kiểm tra video có công khai không",
        try_different: "Thử video khác",
        try_again: "Thử lại sau",
        download_failed: "Không thể tải video",
        send_failed: "Không thể gửi video",
        file_too_large: "Tệp có thể quá lớn",
        api_trying: "Đang thử",
        api_failed: "thất bại",
        processing: "Đang xử lý...",
        video: "Video",
        music: "Nhạc",
        story: "Câu chuyện",
        photo: "Ảnh",
        creator: "Người tạo",
        followers: "Người theo dõi",
        total_likes: "Tổng Thích",
        type: "Loại",
        content_type: "Loại Nội dung",
        resolution: "Độ phân giải"
    },
    'ta': {
        title: "🎬 டிக்டாக் பதிவிறக்கி",
        downloading: "டிக்டாக் பதிவிறக்கப்படுகிறது",
        success: "வெற்றிகரமாக பதிவிறக்கப்பட்டது!",
        failed: "பதிவிறக்கம் தோல்வி",
        caption_label: "தலைப்பு",
        hashtags_label: "ஹேஷ்டேக்குகள்",
        stats_label: "புள்ளிவிவரங்கள்",
        audio_label: "ஆடியோ",
        quality_label: "தரம்",
        size_label: "அளவு",
        duration_label: "காலம்",
        api_used_label: "பயன்படுத்தப்பட்ட API",
        views: "பார்வைகள்",
        likes: "விருப்பங்கள்",
        comments: "கருத்துகள்",
        shares: "பகிர்வுகள்",
        favorites: "விருப்பத்தேர்வுகள்",
        no_hashtags: "ஹேஷ்டேக்குகள் இல்லை",
        no_caption: "தலைப்பு இல்லை",
        unknown_audio: "அறியப்படாத ஆடியோ",
        invalid_link: "செல்லாத டிக்டாக் இணைப்பு",
        invalid_link_msg: "செல்லுபடியாகும் டிக்டாக் இணைப்பை வழங்கவும்.",
        usage_msg: "பயன்பாடு: .tiktok <இணைப்பு>",
        examples: "எடுத்துக்காட்டுகள்:",
        features: "அம்சங்கள்:",
        no_watermark: "வாட்டர்மார்க் இல்லாத வீடியோ",
        hd_quality: "HD தரம்",
        multiple_api: "பல API காப்புப்பிரதிகள்",
        tips: "குறிப்புகள்:",
        check_public: "வீடியோ பொது உரிமையானதா என சரிபார்க்கவும்",
        try_different: "வேறு வீடியோவை முயற்சிக்கவும்",
        try_again: "பின்னர் மீண்டும் முயற்சிக்கவும்",
        download_failed: "வீடியோவை பதிவிறக்க முடியவில்லை",
        send_failed: "வீடியோவை அனுப்ப முடியவில்லை",
        file_too_large: "கோப்பு மிகப்பெரியதாக இருக்கலாம்",
        api_trying: "முயற்சிக்கிறது",
        api_failed: "தோல்வி",
        processing: "செயலாக்குகிறது...",
        video: "வீடியோ",
        music: "இசை",
        story: "கதை",
        photo: "புகைப்படம்",
        creator: "உருவாக்குநர்",
        followers: "பின்தொடர்பவர்கள்",
        total_likes: "மொத்த விருப்பங்கள்",
        type: "வகை",
        content_type: "உள்ளடக்க வகை",
        resolution: "தெளிவுத்திறன்"
    }
};

function getTranslation(langCode, key) {
    return translations[langCode]?.[key] || translations['en'][key] || key;
}

// ---- BUILD STYLED MESSAGE ----
function buildStyledMessage(styleId, title, contentLines, extraLines = []) {
    if (styleId === 1) {
        let menu = `╭──◆「 *${title}* 」◆\n├\n`;
        for (const line of contentLines) menu += `├◇ ${line}\n`;
        for (const line of extraLines) menu += `├◇ ${line}\n`;
        menu += `├\n╰─┬─★─☆─♪♪─★\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
        return menu;
    } else if (styleId === 2) {
        let menu = `◈──────────────────────◈\n           *${title}*\n◈──────────────────────◈\n\n`;
        for (const line of contentLines) menu += `▤ ${line}\n`;
        for (const line of extraLines) menu += `▤ ${line}\n`;
        menu += `◈──────────────────────◈\n\n◈──────────────────────◈\n           *WALLYJAYTECH-MD*\n◈──────────────────────◈`;
        return menu;
    } else if (styleId === 3) {
        let menu = `╔══════════════════╗\n║ *${title}*\n║ ══════════════════\n`;
        for (const line of contentLines) menu += `║ ${line}\n`;
        for (const line of extraLines) menu += `║ ${line}\n`;
        menu += `╚══════════════════╝\n\n╔══════════════════╗\n║ *WALLYJAYTECH-MD*\n╚══════════════════╝`;
        return menu;
    } else if (styleId === 4) {
        let menu = `╭──〔 *${title}* 〕─┈𓊉꧂\n║     ╭──────────────┈❀\n`;
        for (const line of contentLines) menu += `║☠︎︎║ ${line}\n`;
        for (const line of extraLines) menu += `║☠︎︎║ ${line}\n`;
        menu += `║     ╰──────────────┈❀\n╰───────────────────┈𓊉꧂\n\n╭─〔 *WALLYJAYTECH-MD* 〕──┈𓊉꧂\n╰─────────────────┈𓊉꧂`;
        return menu;
    } else if (styleId === 5) {
        let menu = `  🌀◈── *${title}* ──◈❃🌸❃\n\n╭──────────●●➤\n`;
        for (const line of contentLines) menu += `┊ ${line}\n`;
        for (const line of extraLines) menu += `┊ ${line}\n`;
        menu += `╰──────·••─────•────●○\n\n╭──────────●●➤\n┊ *WALLYJAYTECH-MD*\n╰──────·••─────•────●○`;
        return menu;
    } else if (styleId === 6) {
        let menu = `╭──〈 *${title}* 〉──💕⃝🕊️\n`;
        for (const line of contentLines) menu += `⚚  ${line}\n`;
        for (const line of extraLines) menu += `⚚  ${line}\n`;
        menu += `╰────────────────✌︎㋡\n\n╭──〈 *WALLYJAYTECH-MD* 〉──💕⃝🕊️\n╰──────────────✌︎㋡`;
        return menu;
    } else if (styleId === 7) {
        let menu = `╔══════════════════❥❥❥\n✧  *${title}*\n╚══════════════════❥❥❥\n`;
        for (const line of contentLines) menu += `✧  ${line}\n`;
        for (const line of extraLines) menu += `✧  ${line}\n`;
        menu += `\n╔══════════════════❥❥❥\n✧  *WALLYJAYTECH-MD*\n╚══════════════════❥❥❥`;
        return menu;
    } else {
        let menu = `╭──◆「 *${title}* 」◆\n├\n`;
        for (const line of contentLines) menu += `├◇ ${line}\n`;
        for (const line of extraLines) menu += `├◇ ${line}\n`;
        menu += `├\n╰─┬─★─☆─♪♪─★\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
        return menu;
    }
}

// ---- LOADING ANIMATION ----
const LOADING_FRAMES = {
    'en': [
        'Downloading [■□□□□□□□□□] 10%',
        'Downloading [■■□□□□□□□□] 20%',
        'Downloading [■■■□□□□□□□] 30%',
        'Downloading [■■■■□□□□□□] 40%',
        'Downloading [■■■■■□□□□□] 50%',
        'Downloading [■■■■■■□□□□] 60%',
        'Downloading [■■■■■■■□□□] 70%',
        'Downloading [■■■■■■■■□□] 80%',
        'Downloading [■■■■■■■■■□] 90%',
        'Downloaded [■■■■■■■■■■] 100%'
    ],
    'ha': [
        'Ana zazzage [■□□□□□□□□□] 10%',
        'Ana zazzage [■■□□□□□□□□] 20%',
        'Ana zazzage [■■■□□□□□□□] 30%',
        'Ana zazzage [■■■■□□□□□□] 40%',
        'Ana zazzage [■■■■■□□□□□] 50%',
        'Ana zazzage [■■■■■■□□□□] 60%',
        'Ana zazzage [■■■■■■■□□□] 70%',
        'Ana zazzage [■■■■■■■■□□] 80%',
        'Ana zazzage [■■■■■■■■■□] 90%',
        'An zazzage [■■■■■■■■■■] 100%'
    ],
    'yo': [
        'N gba [■□□□□□□□□□] 10%',
        'N gba [■■□□□□□□□□] 20%',
        'N gba [■■■□□□□□□□] 30%',
        'N gba [■■■■□□□□□□] 40%',
        'N gba [■■■■■□□□□□] 50%',
        'N gba [■■■■■■□□□□] 60%',
        'N gba [■■■■■■■□□□] 70%',
        'N gba [■■■■■■■■□□] 80%',
        'N gba [■■■■■■■■■□] 90%',
        'A gba [■■■■■■■■■■] 100%'
    ],
    'ig': [
        'Na-akwatu [■□□□□□□□□□] 10%',
        'Na-akwatu [■■□□□□□□□□] 20%',
        'Na-akwatu [■■■□□□□□□□] 30%',
        'Na-akwatu [■■■■□□□□□□] 40%',
        'Na-akwatu [■■■■■□□□□□] 50%',
        'Na-akwatu [■■■■■■□□□□] 60%',
        'Na-akwatu [■■■■■■■□□□] 70%',
        'Na-akwatu [■■■■■■■■□□] 80%',
        'Na-akwatu [■■■■■■■■■□] 90%',
        'Ewetala [■■■■■■■■■■] 100%'
    ],
    'fr': [
        'Téléchargement [■□□□□□□□□□] 10%',
        'Téléchargement [■■□□□□□□□□] 20%',
        'Téléchargement [■■■□□□□□□□] 30%',
        'Téléchargement [■■■■□□□□□□] 40%',
        'Téléchargement [■■■■■□□□□□] 50%',
        'Téléchargement [■■■■■■□□□□] 60%',
        'Téléchargement [■■■■■■■□□□] 70%',
        'Téléchargement [■■■■■■■■□□] 80%',
        'Téléchargement [■■■■■■■■■□] 90%',
        'Téléchargé [■■■■■■■■■■] 100%'
    ],
    'de': [
        'Herunterladen [■□□□□□□□□□] 10%',
        'Herunterladen [■■□□□□□□□□] 20%',
        'Herunterladen [■■■□□□□□□□] 30%',
        'Herunterladen [■■■■□□□□□□] 40%',
        'Herunterladen [■■■■■□□□□□] 50%',
        'Herunterladen [■■■■■■□□□□] 60%',
        'Herunterladen [■■■■■■■□□□] 70%',
        'Herunterladen [■■■■■■■■□□] 80%',
        'Herunterladen [■■■■■■■■■□] 90%',
        'Heruntergeladen [■■■■■■■■■■] 100%'
    ],
    'ar': [
        'جاري التحميل [■□□□□□□□□□] 10%',
        'جاري التحميل [■■□□□□□□□□] 20%',
        'جاري التحميل [■■■□□□□□□□] 30%',
        'جاري التحميل [■■■■□□□□□□] 40%',
        'جاري التحميل [■■■■■□□□□□] 50%',
        'جاري التحميل [■■■■■■□□□□] 60%',
        'جاري التحميل [■■■■■■■□□□] 70%',
        'جاري التحميل [■■■■■■■■□□] 80%',
        'جاري التحميل [■■■■■■■■■□] 90%',
        'تم التحميل [■■■■■■■■■■] 100%'
    ],
    'zh': [
        '下载中 [■□□□□□□□□□] 10%',
        '下载中 [■■□□□□□□□□] 20%',
        '下载中 [■■■□□□□□□□] 30%',
        '下载中 [■■■■□□□□□□] 40%',
        '下载中 [■■■■■□□□□□] 50%',
        '下载中 [■■■■■■□□□□] 60%',
        '下载中 [■■■■■■■□□□] 70%',
        '下载中 [■■■■■■■■□□] 80%',
        '下载中 [■■■■■■■■■□] 90%',
        '已下载 [■■■■■■■■■■] 100%'
    ],
    'hi': [
        'डाउनलोड [■□□□□□□□□□] 10%',
        'डाउनलोड [■■□□□□□□□□] 20%',
        'डाउनलोड [■■■□□□□□□□] 30%',
        'डाउनलोड [■■■■□□□□□□] 40%',
        'डाउनलोड [■■■■■□□□□□] 50%',
        'डाउनलोड [■■■■■■□□□□] 60%',
        'डाउनलोड [■■■■■■■□□□] 70%',
        'डाउनलोड [■■■■■■■■□□] 80%',
        'डाउनलोड [■■■■■■■■■□] 90%',
        'डाउनलोड हुआ [■■■■■■■■■■] 100%'
    ],
    'es': [
        'Descargando [■□□□□□□□□□] 10%',
        'Descargando [■■□□□□□□□□] 20%',
        'Descargando [■■■□□□□□□□] 30%',
        'Descargando [■■■■□□□□□□] 40%',
        'Descargando [■■■■■□□□□□] 50%',
        'Descargando [■■■■■■□□□□] 60%',
        'Descargando [■■■■■■■□□□] 70%',
        'Descargando [■■■■■■■■□□] 80%',
        'Descargando [■■■■■■■■■□] 90%',
        'Descargado [■■■■■■■■■■] 100%'
    ],
    'pt': [
        'Baixando [■□□□□□□□□□] 10%',
        'Baixando [■■□□□□□□□□] 20%',
        'Baixando [■■■□□□□□□□] 30%',
        'Baixando [■■■■□□□□□□] 40%',
        'Baixando [■■■■■□□□□□] 50%',
        'Baixando [■■■■■■□□□□] 60%',
        'Baixando [■■■■■■■□□□] 70%',
        'Baixando [■■■■■■■■□□] 80%',
        'Baixando [■■■■■■■■■□] 90%',
        'Baixado [■■■■■■■■■■] 100%'
    ],
    'ru': [
        'Загрузка [■□□□□□□□□□] 10%',
        'Загрузка [■■□□□□□□□□] 20%',
        'Загрузка [■■■□□□□□□□] 30%',
        'Загрузка [■■■■□□□□□□] 40%',
        'Загрузка [■■■■■□□□□□] 50%',
        'Загрузка [■■■■■■□□□□] 60%',
        'Загрузка [■■■■■■■□□□] 70%',
        'Загрузка [■■■■■■■■□□] 80%',
        'Загрузка [■■■■■■■■■□] 90%',
        'Загружено [■■■■■■■■■■] 100%'
    ],
    'ur': [
        'ڈاؤن لوڈ [■□□□□□□□□□] 10%',
        'ڈاؤن لوڈ [■■□□□□□□□□] 20%',
        'ڈاؤن لوڈ [■■■□□□□□□□] 30%',
        'ڈاؤن لوڈ [■■■■□□□□□□] 40%',
        'ڈاؤن لوڈ [■■■■■□□□□□] 50%',
        'ڈاؤن لوڈ [■■■■■■□□□□] 60%',
        'ڈاؤن لوڈ [■■■■■■■□□□] 70%',
        'ڈاؤن لوڈ [■■■■■■■■□□] 80%',
        'ڈاؤن لوڈ [■■■■■■■■■□] 90%',
        'ڈاؤن لوڈ ہو گیا [■■■■■■■■■■] 100%'
    ],
    'bn': [
        'ডাউনলোড [■□□□□□□□□□] 10%',
        'ডাউনলোড [■■□□□□□□□□] 20%',
        'ডাউনলোড [■■■□□□□□□□] 30%',
        'ডাউনলোড [■■■■□□□□□□] 40%',
        'ডাউনলোড [■■■■■□□□□□] 50%',
        'ডাউনলোড [■■■■■■□□□□] 60%',
        'ডাউনলোড [■■■■■■■□□□] 70%',
        'ডাউনলোড [■■■■■■■■□□] 80%',
        'ডাউনলোড [■■■■■■■■■□] 90%',
        'ডাউনলোড হয়েছে [■■■■■■■■■■] 100%'
    ],
    'pcm': [
        'De download [■□□□□□□□□□] 10%',
        'De download [■■□□□□□□□□] 20%',
        'De download [■■■□□□□□□□] 30%',
        'De download [■■■■□□□□□□] 40%',
        'De download [■■■■■□□□□□] 50%',
        'De download [■■■■■■□□□□] 60%',
        'De download [■■■■■■■□□□] 70%',
        'De download [■■■■■■■■□□] 80%',
        'De download [■■■■■■■■■□] 90%',
        'Don download [■■■■■■■■■■] 100%'
    ],
    'it': [
        'Scaricando [■□□□□□□□□□] 10%',
        'Scaricando [■■□□□□□□□□] 20%',
        'Scaricando [■■■□□□□□□□] 30%',
        'Scaricando [■■■■□□□□□□] 40%',
        'Scaricando [■■■■■□□□□□] 50%',
        'Scaricando [■■■■■■□□□□] 60%',
        'Scaricando [■■■■■■■□□□] 70%',
        'Scaricando [■■■■■■■■□□] 80%',
        'Scaricando [■■■■■■■■■□] 90%',
        'Scaricato [■■■■■■■■■■] 100%'
    ],
    'id': [
        'Mengunduh [■□□□□□□□□□] 10%',
        'Mengunduh [■■□□□□□□□□] 20%',
        'Mengunduh [■■■□□□□□□□] 30%',
        'Mengunduh [■■■■□□□□□□] 40%',
        'Mengunduh [■■■■■□□□□□] 50%',
        'Mengunduh [■■■■■■□□□□] 60%',
        'Mengunduh [■■■■■■■□□□] 70%',
        'Mengunduh [■■■■■■■■□□] 80%',
        'Mengunduh [■■■■■■■■■□] 90%',
        'Diunduh [■■■■■■■■■■] 100%'
    ],
    'ja': [
        'ダウンロード中 [■□□□□□□□□□] 10%',
        'ダウンロード中 [■■□□□□□□□□] 20%',
        'ダウンロード中 [■■■□□□□□□□] 30%',
        'ダウンロード中 [■■■■□□□□□□] 40%',
        'ダウンロード中 [■■■■■□□□□□] 50%',
        'ダウンロード中 [■■■■■■□□□□] 60%',
        'ダウンロード中 [■■■■■■■□□□] 70%',
        'ダウンロード中 [■■■■■■■■□□] 80%',
        'ダウンロード中 [■■■■■■■■■□] 90%',
        'ダウンロード完了 [■■■■■■■■■■] 100%'
    ],
    'sw': [
        'Inapakua [■□□□□□□□□□] 10%',
        'Inapakua [■■□□□□□□□□] 20%',
        'Inapakua [■■■□□□□□□□] 30%',
        'Inapakua [■■■■□□□□□□] 40%',
        'Inapakua [■■■■■□□□□□] 50%',
        'Inapakua [■■■■■■□□□□] 60%',
        'Inapakua [■■■■■■■□□□] 70%',
        'Inapakua [■■■■■■■■□□] 80%',
        'Inapakua [■■■■■■■■■□] 90%',
        'Imepakua [■■■■■■■■■■] 100%'
    ],
    'tr': [
        'İndiriliyor [■□□□□□□□□□] 10%',
        'İndiriliyor [■■□□□□□□□□] 20%',
        'İndiriliyor [■■■□□□□□□□] 30%',
        'İndiriliyor [■■■■□□□□□□] 40%',
        'İndiriliyor [■■■■■□□□□□] 50%',
        'İndiriliyor [■■■■■■□□□□] 60%',
        'İndiriliyor [■■■■■■■□□□] 70%',
        'İndiriliyor [■■■■■■■■□□] 80%',
        'İndiriliyor [■■■■■■■■■□] 90%',
        'İndirildi [■■■■■■■■■■] 100%'
    ],
    'ko': [
        '다운로드 중 [■□□□□□□□□□] 10%',
        '다운로드 중 [■■□□□□□□□□] 20%',
        '다운로드 중 [■■■□□□□□□□] 30%',
        '다운로드 중 [■■■■□□□□□□] 40%',
        '다운로드 중 [■■■■■□□□□□] 50%',
        '다운로드 중 [■■■■■■□□□□] 60%',
        '다운로드 중 [■■■■■■■□□□] 70%',
        '다운로드 중 [■■■■■■■■□□] 80%',
        '다운로드 중 [■■■■■■■■■□] 90%',
        '다운로드 완료 [■■■■■■■■■■] 100%'
    ],
    'vi': [
        'Đang tải [■□□□□□□□□□] 10%',
        'Đang tải [■■□□□□□□□□] 20%',
        'Đang tải [■■■□□□□□□□] 30%',
        'Đang tải [■■■■□□□□□□] 40%',
        'Đang tải [■■■■■□□□□□] 50%',
        'Đang tải [■■■■■■□□□□] 60%',
        'Đang tải [■■■■■■■□□□] 70%',
        'Đang tải [■■■■■■■■□□] 80%',
        'Đang tải [■■■■■■■■■□] 90%',
        'Đã tải [■■■■■■■■■■] 100%'
    ],
    'ta': [
        'பதிவிறக்கம் [■□□□□□□□□□] 10%',
        'பதிவிறக்கம் [■■□□□□□□□□] 20%',
        'பதிவிறக்கம் [■■■□□□□□□□] 30%',
        'பதிவிறக்கம் [■■■■□□□□□□] 40%',
        'பதிவிறக்கம் [■■■■■□□□□□] 50%',
        'பதிவிறக்கம் [■■■■■■□□□□] 60%',
        'பதிவிறக்கம் [■■■■■■■□□□] 70%',
        'பதிவிறக்கம் [■■■■■■■■□□] 80%',
        'பதிவிறக்கம் [■■■■■■■■■□] 90%',
        'பதிவிறக்கப்பட்டது [■■■■■■■■■■] 100%'
    ]
};

function getLoadingFrames(langCode) {
    return LOADING_FRAMES[langCode] || LOADING_FRAMES['en'];
}

// ---- API LIST ----
const API_LIST = [
    {
        name: 'TikWM',
        url: (u) => `https://www.tikwm.com/api/?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.data?.play || null,
        title: (d) => d?.data?.title || null,
        views: (d) => d?.data?.play_count || null,
        likes: (d) => d?.data?.digg_count || null,
        comments: (d) => d?.data?.comment_count || null,
        shares: (d) => d?.data?.share_count || null,
        hashtags: (d) => d?.data?.hashtags || null,
        audio: (d) => d?.data?.music_info?.title || null,
        duration: (d) => d?.data?.duration || null,
        author: (d) => d?.data?.author?.unique_id || null,
        author_name: (d) => d?.data?.author?.nickname || null,
        followers: (d) => d?.data?.author?.follower_count || null,
        total_likes: (d) => d?.data?.author?.heart || null,
        type: (d) => d?.data?.type || 'video',
        headers: {}
    },
    {
        name: 'Tiklydown',
        url: (u) => `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.video?.noWatermark || null,
        title: (d) => d?.music?.title || null,
        views: (d) => d?.stats?.playCount || null,
        likes: (d) => d?.stats?.diggCount || null,
        comments: (d) => d?.stats?.commentCount || null,
        shares: (d) => d?.stats?.shareCount || null,
        hashtags: (d) => d?.hashtags || null,
        audio: (d) => d?.music?.title || null,
        duration: (d) => d?.video?.duration || null,
        author: (d) => d?.author?.uniqueId || null,
        author_name: (d) => d?.author?.nickname || null,
        followers: (d) => d?.author?.followerCount || null,
        total_likes: (d) => d?.author?.heart || null,
        type: (d) => d?.type || 'video',
        headers: {}
    },
    {
        name: 'Siputzx',
        url: (u) => `https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.data?.urls?.[0] || d?.data?.video_url || d?.data?.url || null,
        title: (d) => d?.data?.metadata?.title || null,
        views: (d) => d?.data?.metadata?.play_count || null,
        likes: (d) => d?.data?.metadata?.digg_count || null,
        comments: (d) => d?.data?.metadata?.comment_count || null,
        shares: (d) => d?.data?.metadata?.share_count || null,
        hashtags: (d) => d?.data?.metadata?.hashtags || null,
        audio: (d) => d?.data?.metadata?.music_name || null,
        duration: (d) => d?.data?.metadata?.duration || null,
        author: (d) => d?.data?.metadata?.author || null,
        author_name: (d) => d?.data?.metadata?.author_name || null,
        followers: (d) => d?.data?.metadata?.follower_count || null,
        total_likes: (d) => d?.data?.metadata?.total_likes || null,
        type: (d) => d?.data?.metadata?.type || 'video',
        headers: {}
    },
    {
        name: 'Tiktokio',
        url: (u) => `https://tiktokio.com/api/v1/tiktok?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.data?.video_url || d?.video || null,
        title: (d) => d?.data?.title || null,
        views: (d) => d?.data?.play_count || null,
        likes: (d) => d?.data?.digg_count || null,
        comments: (d) => d?.data?.comment_count || null,
        shares: (d) => d?.data?.share_count || null,
        hashtags: (d) => d?.data?.hashtags || null,
        audio: (d) => d?.data?.music_title || null,
        duration: (d) => d?.data?.duration || null,
        author: (d) => d?.data?.author || null,
        author_name: (d) => d?.data?.author_name || null,
        followers: (d) => d?.data?.follower_count || null,
        total_likes: (d) => d?.data?.total_likes || null,
        type: (d) => d?.data?.type || 'video',
        headers: {}
    },
    {
        name: 'SSSTikTok',
        url: (u) => `https://ssstik.io/api/action?url=${encodeURIComponent(u)}`,
        extract: (d) => d?.video || d?.data?.video || null,
        title: (d) => d?.title || d?.data?.title || null,
        views: (d) => d?.views || null,
        likes: (d) => d?.likes || null,
        comments: (d) => d?.comments || null,
        shares: (d) => d?.shares || null,
        hashtags: (d) => d?.hashtags || null,
        audio: (d) => d?.audio || null,
        duration: (d) => d?.duration || null,
        author: (d) => d?.author || null,
        author_name: (d) => d?.author_name || null,
        followers: (d) => d?.followers || null,
        total_likes: (d) => d?.total_likes || null,
        type: (d) => d?.type || 'video',
        headers: {}
    }
];

// ---- HELPER FUNCTIONS ----
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function formatDuration(seconds) {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatFileSize(bytes) {
    if (!bytes || bytes < 1024) return '0KB';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + 'KB';
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

function detectContentType(title, audio, hashtags) {
    if (audio && !title && !hashtags) return 'music';
    if (title && title.toLowerCase().includes('story')) return 'story';
    if (title && title.toLowerCase().includes('photo')) return 'photo';
    return 'video';
}

// ---- MAIN COMMAND ----
async function tiktokCommand(sock, chatId, message) {
    let loadingMsg;

    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const userId = senderId.split('@')[0];
        const userLang = langManager.getUserLanguage(userId);
        const t = (key) => getTranslation(userLang, key);
        const loadingFrames = getLoadingFrames(userLang);

        const fontId = getCurrentFont();
        const styleId = getCurrentStyle();

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const url = text.split(' ').slice(1).join(' ').trim();

        if (!url || !url.includes('tiktok.com')) {
            const content = [
                `📥 ${t('usage_msg')}`,
                '',
                `*${t('examples')}*`,
                '  └ .tiktok https://vt.tiktok.com/xxxxx',
                '  └ .tiktok https://www.tiktok.com/@user/video/xxxxx',
                '',
                `*${t('features')}*`,
                `  └ ${t('no_watermark')}`,
                `  └ ${t('hd_quality')}`,
                `  └ ${t('multiple_api')}`
            ];
            let msg = buildStyledMessage(styleId, t('title'), content);
            msg = applyFont(msg, fontId);
            return await sock.sendMessage(chatId, { text: msg }, { quoted: message });
        }

        // Send loading animation
        loadingMsg = await sock.sendMessage(chatId, { text: loadingFrames[0] });

        let frame = 0;
        const interval = setInterval(async () => {
            try {
                if (frame < loadingFrames.length - 1) {
                    frame++;
                    await sock.sendMessage(chatId, { edit: loadingMsg.key, text: loadingFrames[frame] });
                }
            } catch (e) {}
        }, 600);

        let videoUrl = null;
        let usedApi = '';
        let apiData = null;

        for (const api of API_LIST) {
            try {
                console.log(`🔍 Trying ${api.name}...`);
                const res = await axios.get(api.url(url), {
                    timeout: 15000,
                    headers: api.headers || {}
                });

                const extractedUrl = api.extract(res.data);
                if (extractedUrl) {
                    videoUrl = extractedUrl;
                    usedApi = api.name;
                    apiData = res.data;
                    console.log(`✅ ${api.name} success`);
                    break;
                }
            } catch (e) {
                console.log(`⚠️ ${api.name} failed: ${e.message}`);
            }
        }

        clearInterval(interval);

        if (!videoUrl || !apiData) {
            const content = [
                `❌ ${t('download_failed')}`,
                '',
                `*${t('tips')}*`,
                `  └ ${t('check_public')}`,
                `  └ ${t('try_different')}`,
                `  └ ${t('try_again')}`
            ];
            let msg = buildStyledMessage(styleId, t('failed'), content);
            msg = applyFont(msg, fontId);
            await sock.sendMessage(chatId, { text: msg }, { quoted: message });
            return;
        }

        // Extract data
        const title = API_LIST.find(a => a.name === usedApi)?.title(apiData) || 'No caption';
        const views = API_LIST.find(a => a.name === usedApi)?.views(apiData) || 0;
        const likes = API_LIST.find(a => a.name === usedApi)?.likes(apiData) || 0;
        const comments = API_LIST.find(a => a.name === usedApi)?.comments(apiData) || 0;
        const shares = API_LIST.find(a => a.name === usedApi)?.shares(apiData) || 0;
        const hashtags = API_LIST.find(a => a.name === usedApi)?.hashtags(apiData) || [];
        const audio = API_LIST.find(a => a.name === usedApi)?.audio(apiData) || t('unknown_audio');
        const duration = API_LIST.find(a => a.name === usedApi)?.duration(apiData) || 0;
        const author = API_LIST.find(a => a.name === usedApi)?.author(apiData) || 'Unknown';
        const author_name = API_LIST.find(a => a.name === usedApi)?.author_name(apiData) || author;
        const followers = API_LIST.find(a => a.name === usedApi)?.followers(apiData) || 0;
        const totalLikes = API_LIST.find(a => a.name === usedApi)?.total_likes(apiData) || 0;
        const contentType = detectContentType(title, audio, hashtags);

        const hashtagStr = Array.isArray(hashtags) ? hashtags.join(' ') : hashtags || '';
        const hashtagDisplay = hashtagStr ? `#${hashtagStr.replace(/,/g, ' #')}` : t('no_hashtags');

        const contentLines = [
            `📥 ${t('success')}`,
            '',
            `📝 *${t('caption_label')}:*`,
            `  ${title || t('no_caption')}`,
            '',
            `🏷️ *${t('hashtags_label')}:*`,
            `  ${hashtagDisplay}`,
            '',
            `📊 *${t('stats_label')}:*`,
            `  👁️ ${t('views')}: ${formatNumber(views)}`,
            `  ❤️ ${t('likes')}: ${formatNumber(likes)}`,
            `  💬 ${t('comments')}: ${formatNumber(comments)}`,
            `  🔄 ${t('shares')}: ${formatNumber(shares)}`,
            '',
            `🎵 *${t('audio_label')}:*`,
            `  🎶 ${audio}`,
            `  ⏱️ ${t('duration_label')}: ${formatDuration(duration)}`,
            '',
            `👤 *${t('creator')}:*`,
            `  📱 @${author}`,
            `  👥 ${t('followers')}: ${formatNumber(followers)}`,
            `  ❤️ ${t('total_likes')}: ${formatNumber(totalLikes)}`,
            '',
            `📌 *${t('api_used_label')}:* ${usedApi} ✅`,
            `📂 *${t('content_type')}:* ${t(contentType)}`
        ];

        let msg = buildStyledMessage(styleId, t('title'), contentLines);
        msg = applyFont(msg, fontId);

        await sock.sendMessage(chatId, { edit: loadingMsg.key, text: loadingFrames[loadingFrames.length - 1] });

        // Try to send video
        try {
            const response = await axios.get(videoUrl, {
                responseType: 'arraybuffer',
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            const buffer = Buffer.from(response.data);
            const size = formatFileSize(buffer.length);

            const finalContent = [
                ...contentLines,
                '',
                `📦 *${t('size_label')}:* ${size}`
            ];
            let finalMsg = buildStyledMessage(styleId, t('title'), finalContent);
            finalMsg = applyFont(finalMsg, fontId);

            await sock.sendMessage(chatId, {
                video: buffer,
                mimetype: "video/mp4",
                caption: finalMsg
            }, { quoted: message });

        } catch (downloadErr) {
            try {
                await sock.sendMessage(chatId, {
                    video: { url: videoUrl },
                    mimetype: "video/mp4",
                    caption: msg
                }, { quoted: message });
            } catch (sendErr) {
                const errorContent = [
                    `❌ ${t('send_failed')}`,
                    `💡 ${t('file_too_large')}`
                ];
                let errorMsg = buildStyledMessage(styleId, t('failed'), errorContent);
                errorMsg = applyFont(errorMsg, fontId);
                await sock.sendMessage(chatId, { text: errorMsg }, { quoted: message });
            }
        }

    } catch (error) {
        console.error('❌ TikTok error:', error.message);
        if (loadingMsg) {
            try {
                const senderId = message.key.participant || message.key.remoteJid;
                const userId = senderId.split('@')[0];
                const userLang = langManager.getUserLanguage(userId);
                const loadingFrames = getLoadingFrames(userLang);
                await sock.sendMessage(chatId, { edit: loadingMsg.key, text: loadingFrames[loadingFrames.length - 1] });
            } catch (e) {}
        }

        const senderId = message.key.participant || message.key.remoteJid;
        const userId = senderId.split('@')[0];
        const userLang = langManager.getUserLanguage(userId);
        const t = (key) => getTranslation(userLang, key);
        const fontId = getCurrentFont();
        const styleId = getCurrentStyle();

        const errorContent = [
            `❌ ${t('download_failed')}`,
            `💡 ${t('try_again')}`
        ];
        let errorMsg = buildStyledMessage(styleId, t('failed'), errorContent);
        errorMsg = applyFont(errorMsg, fontId);
        await sock.sendMessage(chatId, { text: errorMsg }, { quoted: message });
    }
}

module.exports = tiktokCommand;
