//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                                                                                                        //
//                                                             𝐖𝐀𝐋𝐋𝐘𝐉𝐀𝐘𝐓𝐄𝐂𝐇-𝐌𝐃 𝐁𝐎𝐓                                                                                                     //
//                                                                                                                                                                                        //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                                                                                                                                        //
//                                                                                                                                                                                        //
//                ██╗    ██╗ █████╗ ██╗     ██╗  ██╗   ██╗   ██╗ █████╗ ██╗   ██╗████████╗███████╗ ██████╗██╗  ██╗      ███╗   ███╗██████╗                                 //
//                ██║    ██║██╔══██╗██║     ██║  ╚██╗ ██╔╝   ██║██╔══██╗╚██╗ ██╔╝╚══██╔══╝██╔════╝██╔════╝██║  ██║      ████╗ ████║██╔══██╗                              //
//                ██║ █╗ ██║███████║██║     ██║   ╚████╔╝    ██║███████║ ╚████╔╝    ██║   █████╗  ██║     ███████║█████╗██╔████╔██║██║  ██║                               //
//                ██║███╗██║██╔══██║██║     ██║    ╚██╔╝██   ██║██╔══██║  ╚██╔╝     ██║   ██╔══╝  ██║     ██╔══██║╚════╝██║╚██╔╝██║██║  ██║                               //
//                ╚███╔███╔╝██║  ██║███████╗███████╗██║ ╚█████╔╝██║  ██║   ██║      ██║   ███████╗╚██████╗██║  ██║      ██║ ╚═╝ ██║██████╔╝                              //
//                 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝      ╚═╝     ╚═╝╚═════╝                                 //
//                                                                                                                                                                                        //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2025                                                                                                        //
//                                                                                                                                                                                        //
//                                                                                                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * project_name : WALLYJAYTECH-MD
//  * author : wallyjaytech
//  * youtube : https://www.youtube.com/wallyjaytechy
//  * description : WALLYJAYTECH-MD ,A Multi-Device whatsapp user bot.
//*
//*
//re-upload? recode? copy code? give credit to wallyjaytech 2025:)
//Instagram: wallyjaytech
//Telegram: t.me/wallyjaytech
//GitHub: wallyjaytechh
//WhatsApp: +2348144317152
//want more free bot scripts? subscribe to my youtube channel: https://youtube.com/@wallyjaytechy
//   * Created By Github: wallyjaytechh.
//   * Credit To ally jay tech
//   * © 2025 WALLYJAYTECH-MD.
// ⛥┌┤
// */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { getCurrentFont, applyFont } = require('./menufont');
const { getCurrentStyle } = require('./menustyle');
const langManager = require('../language/manager');

const PROXY_URL = 'https://gemini-proxy-5t1s.onrender.com';

// ---- TRANSLATIONS (All 23 Languages - CORRECT) ----
const translations = {
    'en': {
        title: "AI CODE GENERATOR",
        generate: "Generate code with AI",
        models: "GPT-4o + Llama + Pollinations",
        premium: "Premium feature",
        usage: "Usage",
        examples: "Examples",
        status: "Status",
        premium_locked: "Premium locked",
        premium_active: "Premium active",
        unlock: "Use .subscribe to unlock",
        raw_code: "RAW CODE",
        live_preview: "LIVE PREVIEW",
        code_preview: "CODE PREVIEW",
        file: "File",
        feedback: "Feedback",
        model: "Model",
        failed: "CODE FAILED",
        unable: "Unable to generate code",
        try_different: "Try a different prompt",
        reply_message: "Reply to a message with .code",
        reply_text: "Reply to text with .code",
        prompt: "prompt"
    },
    'ha': {
        title: "MAI TSARA CODE NA AI",
        generate: "Tsara code tare da AI",
        models: "GPT-4o + Llama + Pollinations",
        premium: "Siffar Premium",
        usage: "Amfani",
        examples: "Misalai",
        status: "Matsayi",
        premium_locked: "Premium a kulle",
        premium_active: "Premium yana aiki",
        unlock: "Yi amfani da .subscribe don buɗe",
        raw_code: "CODE KWARE",
        live_preview: "GANIN KAI TSAYE",
        code_preview: "GANIN CODE",
        file: "Fayil",
        feedback: "Tsokaci",
        model: "Model",
        failed: "CODE YA GASA",
        unable: "Ba a iya tsara code ba",
        try_different: "Gwada wata hanya daban",
        reply_message: "Amsa saƙo da .code",
        reply_text: "Amsa rubutu da .code",
        prompt: "umurni"
    },
    'yo': {
        title: "AṢÈMÚLÒ KÓÒDÙ AI",
        generate: "Ṣe kóòdù pẹlu AI",
        models: "GPT-4o + Llama + Pollinations",
        premium: "Àǹfààní",
        usage: "Àmúlò",
        examples: "Àwọn àpẹẹrẹ",
        status: "Ipò",
        premium_locked: "Àǹfààní ti tì",
        premium_active: "Àǹfààní n ṣiṣẹ",
        unlock: "Lo .subscribe lati ṣí",
        raw_code: "KÓÒDÙ AISE",
        live_preview: "ÌWÒRAN LAAYE",
        code_preview: "ÌWÒRAN KÓÒDÙ",
        file: "Fáìlì",
        feedback: "Èsì",
        model: "Model",
        failed: "KÓÒDÙ KÙNÀ",
        unable: "Ko ṣe ṣe lati ṣe kóòdù",
        try_different: "Gbiyanju ìtọ́ni míràn",
        reply_message: "Ṣe ìdáhùn sí ifọ́rọ́ránṣẹ́ pẹlu .kóòdù",
        reply_text: "Ṣe ìdáhùn sí ọ̀rọ̀ pẹlu .kóòdù",
        prompt: "ìtọ́ni"
    },
    'ig': {
        title: "ỌRỤ Koodu AI",
        generate: "Mepụta koodu site na AI",
        models: "GPT-4o + Llama + Pollinations",
        premium: "Atụmatụ Premium",
        usage: "Ojiji",
        examples: "Ọmụmaatụ",
        status: "Ọnọdụ",
        premium_locked: "Premium akpọchiri",
        premium_active: "Premium na-arụ ọrụ",
        unlock: "Jiri .subscribe mepee",
        raw_code: "KOODU NKWA",
        live_preview: "NLE ANYA NKE DỊ NDỤ",
        code_preview: "NLE ANYA KOODU",
        file: "Faịlụ",
        feedback: "Nzakọ",
        model: "Model",
        failed: "KOODU DARA",
        unable: "Enweghị ike ịmepụta koodu",
        try_different: "Nwaa ụzọ ọzọ",
        reply_message: "Zaa ozi na .koodu",
        reply_text: "Zaa ederede na .koodu",
        prompt: "ntụziaka"
    },
    'fr': {
        title: "GÉNÉRATEUR DE CODE IA",
        generate: "Générer du code avec l'IA",
        models: "GPT-4o + Llama + Pollinations",
        premium: "Fonctionnalité Premium",
        usage: "Utilisation",
        examples: "Exemples",
        status: "Statut",
        premium_locked: "Premium verrouillé",
        premium_active: "Premium actif",
        unlock: "Utilisez .subscribe pour débloquer",
        raw_code: "CODE BRUT",
        live_preview: "APERÇU EN DIRECT",
        code_preview: "APERÇU DU CODE",
        file: "Fichier",
        feedback: "Retour",
        model: "Modèle",
        failed: "CODE ÉCHOUÉ",
        unable: "Impossible de générer le code",
        try_different: "Essayez une autre demande",
        reply_message: "Répondre à un message avec .code",
        reply_text: "Répondre au texte avec .code",
        prompt: "invite"
    },
    'de': {
        title: "KI-CODE-GENERATOR",
        generate: "Code mit KI generieren",
        models: "GPT-4o + Llama + Pollinations",
        premium: "Premium-Funktion",
        usage: "Verwendung",
        examples: "Beispiele",
        status: "Status",
        premium_locked: "Premium gesperrt",
        premium_active: "Premium aktiv",
        unlock: "Verwenden Sie .subscribe zum Entsperren",
        raw_code: "ROHCODE",
        live_preview: "LIVE-VORSCHAU",
        code_preview: "CODE-VORSCHAU",
        file: "Datei",
        feedback: "Rückmeldung",
        model: "Modell",
        failed: "CODE FEHLGESCHLAGEN",
        unable: "Code konnte nicht generiert werden",
        try_different: "Versuchen Sie eine andere Eingabeaufforderung",
        reply_message: "Auf eine Nachricht mit .code antworten",
        reply_text: "Auf Text mit .code antworten",
        prompt: "Eingabeaufforderung"
    },
    'ar': {
        title: "مولد الكود بالذكاء الاصطناعي",
        generate: "إنشاء كود باستخدام الذكاء الاصطناعي",
        models: "GPT-4o + Llama + Pollinations",
        premium: "ميزة مميزة",
        usage: "الاستخدام",
        examples: "أمثلة",
        status: "الحالة",
        premium_locked: "مقفل",
        premium_active: "نشط",
        unlock: "استخدم .subscribe للفتح",
        raw_code: "كود خام",
        live_preview: "معاينة مباشرة",
        code_preview: "معاينة الكود",
        file: "ملف",
        feedback: "ملاحظات",
        model: "النموذج",
        failed: "فشل الكود",
        unable: "تعذر إنشاء الكود",
        try_different: "جرب طلبًا مختلفًا",
        reply_message: "الرد على رسالة باستخدام .code",
        reply_text: "الرد على النص باستخدام .code",
        prompt: "موجه"
    },
    'zh': {
        title: "AI 代码生成器",
        generate: "使用 AI 生成代码",
        models: "GPT-4o + Llama + Pollinations",
        premium: "高级功能",
        usage: "使用方法",
        examples: "示例",
        status: "状态",
        premium_locked: "已锁定",
        premium_active: "已激活",
        unlock: "使用 .subscribe 解锁",
        raw_code: "原始代码",
        live_preview: "实时预览",
        code_preview: "代码预览",
        file: "文件",
        feedback: "反馈",
        model: "模型",
        failed: "代码生成失败",
        unable: "无法生成代码",
        try_different: "尝试不同的提示",
        reply_message: "回复消息使用 .code",
        reply_text: "回复文本使用 .code",
        prompt: "提示"
    },
    'hi': {
        title: "AI कोड जनरेटर",
        generate: "AI के साथ कोड जनरेट करें",
        models: "GPT-4o + Llama + Pollinations",
        premium: "प्रीमियम सुविधा",
        usage: "उपयोग",
        examples: "उदाहरण",
        status: "स्थिति",
        premium_locked: "प्रीमियम लॉक",
        premium_active: "प्रीमियम सक्रिय",
        unlock: "अनलॉक करने के लिए .subscribe का उपयोग करें",
        raw_code: "मूल कोड",
        live_preview: "लाइव पूर्वावलोकन",
        code_preview: "कोड पूर्वावलोकन",
        file: "फ़ाइल",
        feedback: "प्रतिक्रिया",
        model: "मॉडल",
        failed: "कोड विफल",
        unable: "कोड जनरेट करने में असमर्थ",
        try_different: "एक अलग प्रॉम्प्ट आज़माएं",
        reply_message: ".code के साथ संदेश का उत्तर दें",
        reply_text: ".code के साथ पाठ का उत्तर दें",
        prompt: "प्रॉम्प्ट"
    },
    'es': {
        title: "GENERADOR DE CÓDIGO IA",
        generate: "Generar código con IA",
        models: "GPT-4o + Llama + Pollinations",
        premium: "Función Premium",
        usage: "Uso",
        examples: "Ejemplos",
        status: "Estado",
        premium_locked: "Premium bloqueado",
        premium_active: "Premium activo",
        unlock: "Usa .subscribe para desbloquear",
        raw_code: "CÓDIGO CRUDO",
        live_preview: "VISTA PREVIA EN VIVO",
        code_preview: "VISTA PREVIA DEL CÓDIGO",
        file: "Archivo",
        feedback: "Comentarios",
        model: "Modelo",
        failed: "CÓDIGO FALLIDO",
        unable: "No se pudo generar el código",
        try_different: "Prueba con otro mensaje",
        reply_message: "Responder a un mensaje con .code",
        reply_text: "Responder al texto con .code",
        prompt: "mensaje"
    },
    'pt': {
        title: "GERADOR DE CÓDIGO IA",
        generate: "Gerar código com IA",
        models: "GPT-4o + Llama + Pollinations",
        premium: "Recurso Premium",
        usage: "Uso",
        examples: "Exemplos",
        status: "Status",
        premium_locked: "Premium bloqueado",
        premium_active: "Premium ativo",
        unlock: "Use .subscribe para desbloquear",
        raw_code: "CÓDIGO BRUTO",
        live_preview: "PRÉ-VISUALIZAÇÃO AO VIVO",
        code_preview: "PRÉ-VISUALIZAÇÃO DO CÓDIGO",
        file: "Arquivo",
        feedback: "Feedback",
        model: "Modelo",
        failed: "CÓDIGO FALHOU",
        unable: "Não foi possível gerar o código",
        try_different: "Tente um prompt diferente",
        reply_message: "Responder a uma mensagem com .code",
        reply_text: "Responder ao texto com .code",
        prompt: "prompt"
    },
    'ru': {
        title: "ГЕНЕРАТОР КОДА ИИ",
        generate: "Генерировать код с ИИ",
        models: "GPT-4o + Llama + Pollinations",
        premium: "Премиум функция",
        usage: "Использование",
        examples: "Примеры",
        status: "Статус",
        premium_locked: "Премиум заблокирован",
        premium_active: "Премиум активен",
        unlock: "Используйте .subscribe для разблокировки",
        raw_code: "СЫРОЙ КОД",
        live_preview: "ПРЯМОЙ ПРОСМОТР",
        code_preview: "ПРОСМОТР КОДА",
        file: "Файл",
        feedback: "Отзыв",
        model: "Модель",
        failed: "КОД НЕ УДАЛСЯ",
        unable: "Не удалось сгенерировать код",
        try_different: "Попробуйте другой запрос",
        reply_message: "Ответить на сообщение с .code",
        reply_text: "Ответить на текст с .code",
        prompt: "запрос"
    },
    'ur': {
        title: "اے آئی کوڈ جنریٹر",
        generate: "اے آئی کے ساتھ کوڈ بنائیں",
        models: "GPT-4o + Llama + Pollinations",
        premium: "پریمیم فیچر",
        usage: "استعمال",
        examples: "مثالیں",
        status: "حالت",
        premium_locked: "پریمیم لاک",
        premium_active: "پریمیم فعال",
        unlock: "انلاک کرنے کے لیے .subscribe استعمال کریں",
        raw_code: "خام کوڈ",
        live_preview: "لائیو پیش نظارہ",
        code_preview: "کوڈ کا پیش نظارہ",
        file: "فائل",
        feedback: "رائے",
        model: "ماڈل",
        failed: "کوڈ ناکام",
        unable: "کوڈ بنانے میں ناکام",
        try_different: "مختلف پرامپٹ آزمائیں",
        reply_message: ".code کے ساتھ پیغام کا جواب دیں",
        reply_text: ".code کے ساتھ متن کا جواب دیں",
        prompt: "پرامپٹ"
    },
    'bn': {
        title: "এআই কোড জেনারেটর",
        generate: "এআই দিয়ে কোড তৈরি করুন",
        models: "GPT-4o + Llama + Pollinations",
        premium: "প্রিমিয়াম বৈশিষ্ট্য",
        usage: "ব্যবহার",
        examples: "উদাহরণ",
        status: "অবস্থা",
        premium_locked: "প্রিমিয়াম লক",
        premium_active: "প্রিমিয়াম সক্রিয়",
        unlock: "আনলক করতে .subscribe ব্যবহার করুন",
        raw_code: "কাঁচা কোড",
        live_preview: "লাইভ প্রিভিউ",
        code_preview: "কোড প্রিভিউ",
        file: "ফাইল",
        feedback: "মতামত",
        model: "মডেল",
        failed: "কোড ব্যর্থ",
        unable: "কোড তৈরি করা সম্ভব হয়নি",
        try_different: "ভিন্ন প্রম্পট চেষ্টা করুন",
        reply_message: ".code দিয়ে বার্তার উত্তর দিন",
        reply_text: ".code দিয়ে টেক্সটের উত্তর দিন",
        prompt: "প্রম্পট"
    },
    'pcm': {
        title: "AI CODE GENERATOR",
        generate: "Generate code with AI",
        models: "GPT-4o + Llama + Pollinations",
        premium: "Premium feature",
        usage: "How to use",
        examples: "Example",
        status: "Status",
        premium_locked: "Premium lock",
        premium_active: "Premium active",
        unlock: "Use .subscribe to unlock",
        raw_code: "RAW CODE",
        live_preview: "LIVE PREVIEW",
        code_preview: "CODE PREVIEW",
        file: "File",
        feedback: "Feedback",
        model: "Model",
        failed: "CODE FAIL",
        unable: "No fit generate code",
        try_different: "Try different prompt",
        reply_message: "Reply message with .code",
        reply_text: "Reply text with .code",
        prompt: "prompt"
    },
    'it': {
        title: "GENERATORE DI CODICE IA",
        generate: "Genera codice con IA",
        models: "GPT-4o + Llama + Pollinations",
        premium: "Funzione Premium",
        usage: "Utilizzo",
        examples: "Esempi",
        status: "Stato",
        premium_locked: "Premium bloccato",
        premium_active: "Premium attivo",
        unlock: "Usa .subscribe per sbloccare",
        raw_code: "CODICE GREZZO",
        live_preview: "ANTEPRIMA LIVE",
        code_preview: "ANTEPRIMA CODICE",
        file: "File",
        feedback: "Feedback",
        model: "Modello",
        failed: "CODICE FALLITO",
        unable: "Impossibile generare il codice",
        try_different: "Prova un prompt diverso",
        reply_message: "Rispondi a un messaggio con .code",
        reply_text: "Rispondi al testo con .code",
        prompt: "prompt"
    },
    'id': {
        title: "PEMBUAT KODE AI",
        generate: "Buat kode dengan AI",
        models: "GPT-4o + Llama + Pollinations",
        premium: "Fitur Premium",
        usage: "Penggunaan",
        examples: "Contoh",
        status: "Status",
        premium_locked: "Premium terkunci",
        premium_active: "Premium aktif",
        unlock: "Gunakan .subscribe untuk membuka",
        raw_code: "KODE MENTAH",
        live_preview: "PRATINJAU LANGSUNG",
        code_preview: "PRATINJAU KODE",
        file: "Berkas",
        feedback: "Masukan",
        model: "Model",
        failed: "KODE GAGAL",
        unable: "Tidak dapat membuat kode",
        try_different: "Coba prompt yang berbeda",
        reply_message: "Balas pesan dengan .code",
        reply_text: "Balas teks dengan .code",
        prompt: "prompt"
    },
    'ja': {
        title: "AIコードジェネレーター",
        generate: "AIでコードを生成",
        models: "GPT-4o + Llama + Pollinations",
        premium: "プレミアム機能",
        usage: "使用方法",
        examples: "例",
        status: "ステータス",
        premium_locked: "プレミアムロック",
        premium_active: "プレミアムアクティブ",
        unlock: ".subscribeでロック解除",
        raw_code: "生コード",
        live_preview: "ライブプレビュー",
        code_preview: "コードプレビュー",
        file: "ファイル",
        feedback: "フィードバック",
        model: "モデル",
        failed: "コード失敗",
        unable: "コードを生成できません",
        try_different: "別のプロンプトを試してください",
        reply_message: ".codeでメッセージに返信",
        reply_text: ".codeでテキストに返信",
        prompt: "プロンプト"
    },
    'sw': {
        title: "JENERETA YA KODI YA AI",
        generate: "Tengeneza kodi kwa AI",
        models: "GPT-4o + Llama + Pollinations",
        premium: "Kipengele cha Premium",
        usage: "Matumizi",
        examples: "Mifano",
        status: "Hali",
        premium_locked: "Premium imefungwa",
        premium_active: "Premium inafanya kazi",
        unlock: "Tumia .subscribe kufungua",
        raw_code: "KODI GHALI",
        live_preview: "MUONYESHO WA MOJA KWA MOJA",
        code_preview: "MUONYESHO WA KODI",
        file: "Faili",
        feedback: "Maoni",
        model: "Model",
        failed: "KODI IMESHINDWA",
        unable: "Haikuweza kutengeneza kodi",
        try_different: "Jaribu ombi tofauti",
        reply_message: "Jibu ujumbe kwa .code",
        reply_text: "Jibu maandishi kwa .code",
        prompt: "ombi"
    },
    'tr': {
        title: "YAPAY ZEKA KOD ÜRETİCİ",
        generate: "Yapay zeka ile kod oluştur",
        models: "GPT-4o + Llama + Pollinations",
        premium: "Premium özellik",
        usage: "Kullanım",
        examples: "Örnekler",
        status: "Durum",
        premium_locked: "Premium kilitli",
        premium_active: "Premium aktif",
        unlock: "Kilidi açmak için .subscribe kullanın",
        raw_code: "HAM KOD",
        live_preview: "CANLI ÖNİZLEME",
        code_preview: "KOD ÖNİZLEME",
        file: "Dosya",
        feedback: "Geri bildirim",
        model: "Model",
        failed: "KOD BAŞARISIZ",
        unable: "Kod oluşturulamadı",
        try_different: "Farklı bir komut deneyin",
        reply_message: ".code ile mesaja yanıt verin",
        reply_text: ".code ile metne yanıt verin",
        prompt: "komut"
    },
    'ko': {
        title: "AI 코드 생성기",
        generate: "AI로 코드 생성",
        models: "GPT-4o + Llama + Pollinations",
        premium: "프리미엄 기능",
        usage: "사용법",
        examples: "예시",
        status: "상태",
        premium_locked: "프리미엄 잠김",
        premium_active: "프리미엄 활성화",
        unlock: ".subscribe로 잠금 해제",
        raw_code: "원시 코드",
        live_preview: "라이브 미리보기",
        code_preview: "코드 미리보기",
        file: "파일",
        feedback: "피드백",
        model: "모델",
        failed: "코드 실패",
        unable: "코드를 생성할 수 없음",
        try_different: "다른 프롬프트 시도",
        reply_message: ".code로 메시지에 답장",
        reply_text: ".code로 텍스트에 답장",
        prompt: "프롬프트"
    },
    'vi': {
        title: "TRÌNH TẠO MÃ AI",
        generate: "Tạo mã với AI",
        models: "GPT-4o + Llama + Pollinations",
        premium: "Tính năng Premium",
        usage: "Cách sử dụng",
        examples: "Ví dụ",
        status: "Trạng thái",
        premium_locked: "Premium bị khóa",
        premium_active: "Premium đang hoạt động",
        unlock: "Sử dụng .subscribe để mở khóa",
        raw_code: "MÃ THÔ",
        live_preview: "XEM TRƯỚC TRỰC TIẾP",
        code_preview: "XEM TRƯỚC MÃ",
        file: "Tệp",
        feedback: "Phản hồi",
        model: "Mô hình",
        failed: "MÃ THẤT BẠI",
        unable: "Không thể tạo mã",
        try_different: "Thử lệnh khác",
        reply_message: "Trả lời tin nhắn với .code",
        reply_text: "Trả lời văn bản với .code",
        prompt: "lệnh"
    },
    'ta': {
        title: "AI குறியீடு உருவாக்கி",
        generate: "AI மூலம் குறியீடு உருவாக்கு",
        models: "GPT-4o + Llama + Pollinations",
        premium: "பிரீமியம் அம்சம்",
        usage: "பயன்பாடு",
        examples: "எடுத்துக்காட்டுகள்",
        status: "நிலை",
        premium_locked: "பிரீமியம் பூட்டப்பட்டது",
        premium_active: "பிரீமியம் செயலில்",
        unlock: ".subscribe ஐ பயன்படுத்தி திறக்கவும்",
        raw_code: "மூல குறியீடு",
        live_preview: "நேரடி முன்னோட்டம்",
        code_preview: "குறியீட்டு முன்னோட்டம்",
        file: "கோப்பு",
        feedback: "கருத்து",
        model: "மாதிரி",
        failed: "குறியீடு தோல்வி",
        unable: "குறியீடு உருவாக்க முடியவில்லை",
        try_different: "வேறு கட்டளையை முயற்சிக்கவும்",
        reply_message: ".code உடன் செய்திக்கு பதிலளிக்கவும்",
        reply_text: ".code உடன் உரைக்கு பதிலளிக்கவும்",
        prompt: "கட்டளை"
    }
};

function getTranslation(langCode, key) {
    return translations[langCode]?.[key] || translations['en'][key] || key;
}

function getSenderNumber(message) {
    const rawJid = message.key.participant || message.key.remoteJid;
    const senderJid = rawJid.endsWith('@lid') ? (message.key.remoteJidAlt || rawJid) : rawJid;
    return senderJid.split('@')[0].split(':')[0];
}

async function checkPremium(number) {
    try {
        const res = await fetch(`${PROXY_URL}/v1/premium/check/${number}`);
        const data = await res.json();
        return data.premium === true;
    } catch (e) {
        return false;
    }
}

const LOADING_FRAMES = [
    'Coding [■□□□□□□□□□]',
    'Coding [■■□□□□□□□□]',
    'Coding [■■■□□□□□□□]',
    'Coding [■■■■□□□□□□]',
    'Coding [■■■■■□□□□□]',
    'Coding [■■■■■■□□□□]',
    'Coding [■■■■■■■□□□]',
    'Coding [■■■■■■■■□□]',
    'Coding [■■■■■■■■■□]'
];

const EXT_MAP = {
    'javascript': 'js', 'js': 'js', 'typescript': 'ts', 'ts': 'ts',
    'python': 'py', 'py': 'py', 'html': 'html', 'css': 'css',
    'dart': 'dart', 'java': 'java', 'cpp': 'cpp', 'c++': 'cpp',
    'c': 'c', 'csharp': 'cs', 'cs': 'cs', 'ruby': 'rb', 'rb': 'rb',
    'php': 'php', 'swift': 'swift', 'kotlin': 'kt', 'kt': 'kt',
    'go': 'go', 'rust': 'rs', 'rs': 'rs', 'sql': 'sql',
    'json': 'json', 'xml': 'xml', 'yaml': 'yml', 'yml': 'yml',
    'bash': 'sh', 'sh': 'sh', 'powershell': 'ps1', 'ps1': 'ps1',
    'r': 'r', 'scala': 'scala', 'perl': 'pl', 'lua': 'lua',
    'jsx': 'jsx', 'tsx': 'tsx', 'vue': 'vue', 'svelte': 'svelte',
    'dockerfile': 'dockerfile', 'docker': 'dockerfile',
    'markdown': 'md', 'md': 'md', 'makefile': 'makefile'
};

function wrapFeedback(text, maxLen = 25) {
    const words = text.split(/\s+/);
    const lines = [];
    let current = '';
    for (const word of words) {
        if ((current + ' ' + word).length > maxLen && current.length > 0) {
            lines.push(current.trim());
            current = word;
        } else {
            current += (current ? ' ' : '') + word;
        }
    }
    if (current) lines.push(current.trim());
    return lines;
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

async function codeCommand(sock, chatId, message) {
    let loadingMsg;

    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const userId = senderId.split('@')[0];
        const senderNumber = getSenderNumber(message);
        const isPremium = await checkPremium(senderNumber);
        
        // Get user language
        const userLang = langManager.getUserLanguage(userId);
        const t = (key) => getTranslation(userLang, key);
        
        // Get current font and style
        const fontId = getCurrentFont();
        const styleId = getCurrentStyle();
        
        // ---- FIX: Get command and arguments properly ----
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        
        // Get the command without the dot and resolve it
        const rawCommand = text.split(' ')[0].toLowerCase().replace(/^\./, '');
        const resolvedCommand = resolveCommand(rawCommand);
        
        // Get arguments after the command (everything after the command name)
        const args = text.replace(/^[^\s]*\s?/, '').trim();
        const typedQuery = args;  // This is the user's prompt
        
        // ---- DEBUG ----
        console.log('📝 Command:', resolvedCommand);
        console.log('📝 Query:', typedQuery);
        
        // Get quoted message text for reply
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let quotedText = '';
        if (quotedMessage) {
            quotedText = quotedMessage.conversation || 
                        quotedMessage.extendedTextMessage?.text || 
                        quotedMessage.imageMessage?.caption || 
                        quotedMessage.videoMessage?.caption || '';
        }

        // Determine prompt: typed wins over quoted
        let query;
        if (typedQuery) {
            query = typedQuery;
        } else if (quotedText) {
            query = quotedText;
        }

        // No query → show menu
        if (!query) {
            const menuContent = [
                `💻 ${t('generate')}`,
                `🤖 ${t('models')}`,
                `💎 ${t('premium')}`,
                '',
                `*${t('usage')}:*`,
                `  └ .${resolvedCommand} <${t('prompt')}>`,
                `  └ ${t('reply_message')}`,
                `  └ .${resolvedCommand} <${t('prompt')}> + ${t('reply_text').toLowerCase()}`,
                '',
                `*${t('examples')}:*`,
                `  └ .${resolvedCommand} login form in html`,
                `  └ .${resolvedCommand} python fibonacci function`,
                `  └ ${t('reply_text')}`,
                '',
                `${!isPremium ? `*🔒 ${t('premium_locked')}*\n  └ ${t('unlock')}` : `*✅ ${t('premium_active')}*`}`
            ];
            
            let menuMessage = buildStyledMessage(styleId, t('title'), menuContent);
            menuMessage = applyFont(menuMessage, fontId);
            
            return sock.sendMessage(chatId, {
                text: menuMessage
            }, { quoted: message });
        }

        // Has prompt but not premium → block
        if (!isPremium) {
            const blockContent = [
                `💎 ${t('premium_locked')}`,
                `🔓 ${t('unlock')}`
            ];
            
            let blockMessage = buildStyledMessage(styleId, t('premium'), blockContent);
            blockMessage = applyFont(blockMessage, fontId);
            
            return sock.sendMessage(chatId, {
                text: blockMessage
            }, { quoted: message });
        }

        // Premium user with prompt → generate code
        loadingMsg = await sock.sendMessage(chatId, { text: LOADING_FRAMES[0] });

        let frame = 0;
        const interval = setInterval(async () => {
            try { if (frame < LOADING_FRAMES.length - 1) { frame++; await sock.sendMessage(chatId, { edit: loadingMsg.key, text: LOADING_FRAMES[frame] }); } } catch (e) {}
        }, 600);

        const response = await fetch(`${PROXY_URL}/v1/code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-bot-repo': 'wallyjaytechh/WALLYJAYTECH-MD',
                'x-user-number': senderNumber
            },
            body: JSON.stringify({ prompt: query })
        });

        const data = await response.json();

        // Handle proxy error responses
        if (response.status === 426) {
            clearInterval(interval);
            const updateContent = [
                '⚠️ Old version detected',
                '📥 Use .update to upgrade'
            ];
            let updateMessage = buildStyledMessage(styleId, 'UPDATE REQUIRED', updateContent);
            updateMessage = applyFont(updateMessage, fontId);
            
            return sock.sendMessage(chatId, {
                text: updateMessage
            }, { quoted: message });
        }

        if (response.status === 402) {
            clearInterval(interval);
            const premiumContent = [
                '💎 Premium expired or not found',
                '🔓 Use .subscribe to renew'
            ];
            let premiumMessage = buildStyledMessage(styleId, 'PREMIUM REQUIRED', premiumContent);
            premiumMessage = applyFont(premiumMessage, fontId);
            
            return sock.sendMessage(chatId, {
                text: premiumMessage
            }, { quoted: message });
        }

        const answer = data.reply;
        const usedModel = data.model || 'AI';

        clearInterval(interval);

        if (!answer || answer.length < 10) throw new Error('NO_RESPONSE');

        const codeBlockMatch = answer.match(/```[\s\S]*?```/);
        const cleanCode = codeBlockMatch
            ? codeBlockMatch[0].replace(/```\w*\n?/g, '').replace(/```/g, '').trim()
            : answer.trim();

        const langMatch = codeBlockMatch ? codeBlockMatch[0].match(/```(\w+)/) : null;
        const lang = langMatch ? langMatch[1].toLowerCase() : '';
        const extension = EXT_MAP[lang] || 'txt';

        const fileMatch = answer.match(/FILENAME:\s*(\w+)/i);
        const fileNameWord = (fileMatch ? fileMatch[1] : 'code').toLowerCase();
        const fileName = `${fileNameWord}.${extension}`;

        const feedbackRaw = answer.replace(/```[\s\S]*?```/g, '').replace(/FILENAME:\s*\w+/i, '').trim();
        const allFeedbackLines = wrapFeedback(feedbackRaw, 25);

        const mid = Math.ceil(allFeedbackLines.length / 2);
        const rawFeedbackLines = allFeedbackLines.slice(0, mid);
        const demoFeedbackLines = allFeedbackLines.slice(mid);

        let rawFeedbackOutput = [];
        for (const line of rawFeedbackLines) rawFeedbackOutput.push(`${line.toLowerCase()}`);

        let demoFeedbackOutput = [];
        const demoLinesToUse = demoFeedbackLines.length > 0 ? demoFeedbackLines : rawFeedbackLines;
        for (const line of demoLinesToUse) demoFeedbackOutput.push(`${line.toLowerCase()}`);

        const outputDir = './output';
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

        const txtFileName = `${fileNameWord}.txt`;
        const txtPath = path.join(outputDir, txtFileName);
        fs.writeFileSync(txtPath, cleanCode);

        let demoFileName, demoContent;
        if (extension === 'html') {
            demoFileName = fileName;
            demoContent = cleanCode;
        } else {
            demoFileName = `${fileNameWord}_preview.html`;
            demoContent = `<pre><code>${cleanCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
        }
        const demoPath = path.join(outputDir, demoFileName);
        fs.writeFileSync(demoPath, demoContent);

        await sock.sendMessage(chatId, { edit: loadingMsg.key, text: 'Done [■■■■■■■■■■]' });

        // Build styled captions with translations
        const rawCaptionContent = [
            `*${t('file')}:* ${txtFileName}`,
            '',
            `*${t('feedback')}:*`,
            ...rawFeedbackOutput,
            '',
            `*${t('model')}:* ${usedModel}`
        ];
        
        let rawCaption = buildStyledMessage(styleId, t('raw_code'), rawCaptionContent);
        rawCaption = applyFont(rawCaption, fontId);

        const demoCaptionContent = [
            `*${t('file')}:* ${demoFileName}`,
            '',
            `*${t('feedback')}:*`,
            ...demoFeedbackOutput,
            '',
            `*${t('model')}:* ${usedModel}`
        ];
        
        let demoCaption = buildStyledMessage(styleId, extension === 'html' ? t('live_preview') : t('code_preview'), demoCaptionContent);
        demoCaption = applyFont(demoCaption, fontId);

        await sock.sendMessage(chatId, {
            document: fs.readFileSync(txtPath),
            fileName: txtFileName,
            mimetype: 'text/plain',
            caption: rawCaption
        }, { quoted: message });

        await sock.sendMessage(chatId, {
            document: fs.readFileSync(demoPath),
            fileName: demoFileName,
            mimetype: 'text/html',
            caption: demoCaption
        }, { quoted: message });

        fs.unlinkSync(txtPath);
        fs.unlinkSync(demoPath);

    } catch (error) {
        console.error('Code error:', error.message);
        if (loadingMsg) { try { await sock.sendMessage(chatId, { edit: loadingMsg.key, text: 'Failed [■■■■■■■■□□]' }); } catch (e) {} }
        
        const senderId = message.key.participant || message.key.remoteJid;
        const userId = senderId.split('@')[0];
        const userLang = langManager.getUserLanguage(userId);
        const t = (key) => getTranslation(userLang, key);
        
        const errorContent = [
            `❌ ${t('unable')}`,
            `💡 ${t('try_different')}`
        ];
        
        const fontId = getCurrentFont();
        const styleId = getCurrentStyle();
        let errorMessage = buildStyledMessage(styleId, t('failed'), errorContent);
        errorMessage = applyFont(errorMessage, fontId);
        
        await sock.sendMessage(chatId, {
            text: errorMessage
        }, { quoted: message });
    }
}

// ---- Resolve Command Helper ----
function resolveCommand(input) {
    const cmd = input.toLowerCase().replace(/^\./, '');
    // Add your command aliases resolution here
    return cmd;
}

module.exports = codeCommand;
