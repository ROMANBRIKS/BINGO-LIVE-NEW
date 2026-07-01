import React, { createContext, useContext, useEffect, useState } from 'react';

export type LanguageCode = 'en' | 'fr' | 'es' | 'ar' | 'pt' | 'zh' | 'tl' | 'km' | 'de' | 'hi' | 'ja';

interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', dir: 'ltr' },
  { code: 'zh', name: '中文 (简体)', flag: '🇨🇳', dir: 'ltr' },
  { code: 'tl', name: 'Tagalog (Filipino)', flag: '🇵🇭', dir: 'ltr' },
  { code: 'km', name: 'ភាសាខ្មែរ (Khmer)', flag: '🇰🇭', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵', dir: 'ltr' }
];

const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Nav / Common
    "live": "Live",
    "party": "Party",
    "chats": "Chats",
    "me": "Me",
    "home": "Home",
    "family_title": "Family Activities",
    "back": "Back",
    "welcome": "Welcome to BINGO LIVE",
    "all_languages": "Languages",
    "all_rooms": "Live Rooms",
    "popular_creators": "Popular Creators",
    "earnings": "Earnings Center",
    "agency": "Agency Desk",
    "vip_center": "VIP Center",
    "wallet": "Wallet",
    "admin": "Admin Desk",
    "visitors": "Visitors",
    "total_visitors": "Total Visitors",
    "no_creator_online": "No creators online right now",
    "search_engine_panel": "Search Engine Audit",
    "account_settings": "Account Settings",
    "save_settings": "Save Settings",
    "display_name": "Display Name",
    "choose_language": "App Language",
    "search_talents": "Discover Talents",
    "level_progress": "Level Progress",
  },
  fr: {
    "live": "En Direct",
    "party": "Fête",
    "chats": "Discussions",
    "me": "Moi",
    "home": "Accueil",
    "family_title": "Activités Familiales",
    "back": "Retour",
    "welcome": "Bienvenue sur BINGO LIVE",
    "all_languages": "Langues",
    "all_rooms": "Salons en Direct",
    "popular_creators": "Créateurs Populaires",
    "earnings": "Centre de Gains",
    "agency": "Bureau de l'Agence",
    "vip_center": "Centre VIP",
    "wallet": "Portefeuille",
    "admin": "Panneau d'administration",
    "visitors": "Visiteurs",
    "total_visitors": "Total Visiteurs",
    "no_creator_online": "Aucun créateur en ligne en ce moment",
    "search_engine_panel": "Audit du moteur de recherche",
    "account_settings": "Paramètres du compte",
    "save_settings": "Enregistrer",
    "display_name": "Nom d'affichage",
    "choose_language": "Langue de l'application",
    "search_talents": "Découvrir des Talents",
    "level_progress": "Progression de niveau",
  },
  es: {
    "live": "En Vivo",
    "party": "Fiesta",
    "chats": "Chats",
    "me": "Perfil",
    "home": "Inicio",
    "family_title": "Actividades de Familia",
    "back": "Atrás",
    "welcome": "Bienvenido a BINGO LIVE",
    "all_languages": "Idiomas",
    "all_rooms": "Salas en Vivo",
    "popular_creators": "Creadores Populares",
    "earnings": "Centro de Ganancias",
    "agency": "Mesa de Agencia",
    "vip_center": "Centro VIP",
    "wallet": "Billetera",
    "admin": "Mesa de Administración",
    "visitors": "Visitantes",
    "total_visitors": "Visitantes Totales",
    "no_creator_online": "No hay creadores activos ahora",
    "search_engine_panel": "Auditoría de SEO",
    "account_settings": "Configuración de Cuenta",
    "save_settings": "Guardar Ajustes",
    "display_name": "Nombre de Pantalla",
    "choose_language": "Idioma de Aplicación",
    "search_talents": "Descubrir Talentos",
    "level_progress": "Progreso de nivel",
  },
  ar: {
    "live": "بث مباشر",
    "party": "الحفلات",
    "chats": "المحادثات",
    "me": "صفحتي",
    "home": "الرئيسية",
    "family_title": "أنشطة العائلة",
    "back": "رجوع",
    "welcome": "مرحباً بكم في بينجو لايف",
    "all_languages": "اللغات",
    "all_rooms": "غرف البث المباشر",
    "popular_creators": "البث المثير",
    "earnings": "مركز الأرباح",
    "agency": "مكتب الوكالة",
    "vip_center": "مركز الـ VIP",
    "wallet": "المحفظة",
    "admin": "لوحة الإدارة",
    "visitors": "الزائرين",
    "total_visitors": "إجمالي الزوار",
    "no_creator_online": "لا يوجد مقدمو بث نشطون الآن",
    "search_engine_panel": "تدقيق محرك البحث",
    "account_settings": "إعدادات الحساب",
    "save_settings": "حفظ الإعدادات",
    "display_name": "الاسم المستعار",
    "choose_language": "لغة التطبيق",
    "search_talents": "استكشف المواهب",
    "level_progress": "مستوى التقدم",
  },
  pt: {
    "live": "Ao Vivo",
    "party": "Festa",
    "chats": "Chats",
    "me": "Eu",
    "home": "Início",
    "family_title": "Atividades de Família",
    "back": "Voltar",
    "welcome": "Bem-vindo ao BINGO LIVE",
    "all_languages": "Idiomas",
    "all_rooms": "Sales ao Vivo",
    "popular_creators": "Criadores Populares",
    "earnings": "Centro de Ganhos",
    "agency": "Painel de Agência",
    "vip_center": "Centro VIP",
    "wallet": "Carteira",
    "admin": "Mesa do Administrador",
    "visitors": "Visitantes",
    "total_visitors": "Total Visitantes",
    "no_creator_online": "Não há criadores ativos agora",
    "search_engine_panel": "Auditoria de Busca",
    "account_settings": "Configurações da Conta",
    "save_settings": "Salvar Configurações",
    "display_name": "Nome de Exibição",
    "choose_language": "Idioma do Aplicativo",
    "search_talents": "Descobrir Talentos",
    "level_progress": "Progresso do Nível",
  },
  zh: {
    "live": "直播",
    "party": "派对",
    "chats": "聊天",
    "me": "我的",
    "home": "首页",
    "family_title": "家族活动",
    "back": "返回",
    "welcome": "欢迎来到 BINGO LIVE",
    "all_languages": "语言选择",
    "all_rooms": "直播群组",
    "popular_creators": "热门主播",
    "earnings": "收益中心",
    "agency": "公会前台",
    "vip_center": "VIP 尊享中心",
    "wallet": "我的钱包",
    "admin": "管理员后台",
    "visitors": "访客",
    "total_visitors": "总访客数",
    "no_creator_online": "当前暂无主播在线",
    "search_engine_panel": "搜素引擎审核",
    "account_settings": "账号设置",
    "save_settings": "保存设置",
    "display_name": "昵称显示",
    "choose_language": "软件语言",
    "search_talents": "发现才艺",
    "level_progress": "等级进度",
  },
  tl: {
    "live": "Live",
    "party": "Salo-salo",
    "chats": "Tsismis",
    "me": "Ako",
    "home": "Tahanan",
    "family_title": "Mga Aktibidad ng Pamilya",
    "back": "Bumalik",
    "welcome": "Maligayang pagdating sa BINGO LIVE",
    "all_languages": "Mga Wika",
    "all_rooms": "Mga Kwarto",
    "popular_creators": "Mga Sikat",
    "earnings": "Sentro ng Kita",
    "agency": "Desk ng Ahensya",
    "vip_center": "VIP Sentro",
    "wallet": "Wallet",
    "admin": "Admin Desk",
    "visitors": "Mga Bisita",
    "total_visitors": "Kabuuang Bisita",
    "no_creator_online": "Walang mga streamer online ngayon",
    "search_engine_panel": "Search Audit",
    "account_settings": "Mga Setting",
    "save_settings": "I-save",
    "display_name": "Pangalan",
    "choose_language": "Wika ng App",
    "search_talents": "Maghanap ng Talento",
    "level_progress": "Progreso ng Antas",
  },
  km: {
    "live": "បន្តផ្ទាល់",
    "party": "កម្មវិធីជប់លៀង",
    "chats": "ជជែក",
    "me": "ខ្ញុំ",
    "home": "ទំព័រដើម",
    "family_title": "សកម្មភាពគ្រួសារ",
    "back": "ថយក្រោយ",
    "welcome": "សូមស្វាគមន៍មកកាន់ BINGO LIVE",
    "all_languages": "ភាសា",
    "all_rooms": "បន្ទប់បន្តផ្ទាល់",
    "popular_creators": "អ្នកបង្កើតពេញនិយម",
    "earnings": "មជ្ឈមណ្ឌលចំណូល",
    "agency": "តុភ្នាក់ងារ",
    "vip_center": "មជ្ឈមណ្ឌល VIP",
    "wallet": "កាបូបប្រាក់",
    "admin": "តុគ្រប់គ្រង",
    "visitors": "អ្នកទស្សនា",
    "total_visitors": "អ្នកទស្សនាសរុប",
    "no_creator_online": "មិនមានអ្នកបង្កើតនៅលីនទេឥឡូវនេះ",
    "search_engine_panel": "សវនកម្មម៉ាស៊ីនស្វែងរក",
    "account_settings": "ការកំណត់គណនី",
    "save_settings": "រក្សាទុកការកំណត់",
    "display_name": "ឈ្មោះបង្ហាញ",
    "choose_language": "ភាសាកម្មវិធី",
    "search_talents": "ស្វែងរកទេពកោសល្យ",
    "level_progress": "វឌ្ឍនភាពកម្រិត",
  },
  de: {
    "live": "Live",
    "party": "Party",
    "chats": "Chats",
    "me": "Ich",
    "home": "Home",
    "family_title": "Familienaktivitäten",
    "back": "Zurück",
    "welcome": "Willkommen bei BINGO LIVE",
    "all_languages": "Sprachen",
    "all_rooms": "Live-Räume",
    "popular_creators": "Beliebte Creator",
    "earnings": "Einnahmen-Center",
    "agency": "Agentur-Desk",
    "vip_center": "VIP-Center",
    "wallet": "Geldbeutel",
    "admin": "Admin-Desk",
    "visitors": "Besucher",
    "total_visitors": "Besucher Gesamt",
    "no_creator_online": "Gerade keine Creator online",
    "search_engine_panel": "Suchmaschinen-Audit",
    "account_settings": "Kontoeinstellungen",
    "save_settings": "Einstellungen speichern",
    "display_name": "Anzeigename",
    "choose_language": "App-Sprache",
    "search_talents": "Talente entdecken",
    "level_progress": "Level-Fortschritt",
  },
  hi: {
    "live": "लाइव",
    "party": "पार्टी",
    "chats": "चैट",
    "me": "प्रोफ़ाइल",
    "home": "होम",
    "family_title": "परिवार गतिविधियां",
    "back": "पीछे",
    "welcome": "BINGO LIVE में आपका स्वागत है",
    "all_languages": "भाषाएँ",
    "all_rooms": "लाइव कमरे",
    "popular_creators": "लोकप्रिय क्रिएटर",
    "earnings": "कमाई केंद्र",
    "agency": "एजेंसी डेस्क",
    "vip_center": "वीआईपी केंद्र",
    "wallet": "वॉलेट",
    "admin": "व्यवस्थापक डेस्क",
    "visitors": "आगंतुक",
    "total_visitors": "कुल आगंतुक",
    "no_creator_online": "इस समय कोई क्रिएटर लाइव नहीं है",
    "search_engine_panel": "खोज इंजन ऑडिट",
    "account_settings": "खाता सेटिंग्स",
    "save_settings": "सेटिंग्स सुरक्षित करें",
    "display_name": "प्रदर्शित नाम",
    "choose_language": "ऐप भाषा",
    "search_talents": "प्रतिभा खोजें",
    "level_progress": "स्तर प्रगति",
  },
  ja: {
    "live": "ライブ",
    "party": "パーティー",
    "chats": "チャット",
    "me": "マイページ",
    "home": "ホーム",
    "family_title": "ファミリーアクティビティ",
    "back": "戻る",
    "welcome": "BINGO LIVE へようこそ",
    "all_languages": "言語設定",
    "all_rooms": "ライブ配信ルーム",
    "popular_creators": "人気ライバー",
    "earnings": "収益センター",
    "agency": "事務所管理",
    "vip_center": "VIP特典センター",
    "wallet": "マイウォレット",
    "admin": "管理者コンソール",
    "visitors": "訪問者",
    "total_visitors": "累計来訪者数",
    "no_creator_online": "現在オンラインのライバーはいません",
    "search_engine_panel": "検索エンジン監査",
    "account_settings": "アカウント設定",
    "save_settings": "設定を保存",
    "display_name": "表示名",
    "choose_language": "アプリ言語",
    "search_talents": "タレントを探す",
    "level_progress": "レベル進捗",
  }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  currentLanguageDetails: Language;
}

const GLOBAL_AUTO_DICT: Record<string, Record<LanguageCode, string>> = {
  "live": {
    en: "Live", fr: "En Direct", es: "En Vivo", ar: "بث مباشر", pt: "Ao Vivo", zh: "直播", tl: "Live", km: "បន្តផ្ទាល់", de: "Live", hi: "लाइव", ja: "ライブ"
  },
  "party": {
    en: "Party", fr: "Fête", es: "Fiesta", ar: "الحفلات", pt: "Festa", zh: "派对", tl: "Salo-salo", km: "កម្មវិធីជប់លៀង", de: "Party", hi: "पार्टी", ja: "パーティー"
  },
  "chats": {
    en: "Chats", fr: "Discussions", es: "Chats", ar: "المحادثات", pt: "Chats", zh: "聊天", tl: "Tsismis", km: "ជជែក", de: "Chats", hi: "चैट", ja: "チャット"
  },
  "me": {
    en: "Me", fr: "Moi", es: "Perfil", ar: "صفحتي", pt: "Eu", zh: "我的", tl: "Ako", km: "ខ្ញុំ", de: "Ich", hi: "प्रोफ़ाइल", ja: "マイページ"
  },
  "home": {
    en: "Home", fr: "Accueil", es: "Inicio", ar: "الرئيسية", pt: "Início", zh: "首页", tl: "Tahanan", km: "ទំព័រដើម", de: "Home", hi: "होम", ja: "ホーム"
  },
  "welcome to bingo live": {
    en: "Welcome to BINGO LIVE", fr: "Bienvenue sur BINGO LIVE", es: "Bienvenido a BINGO LIVE", ar: "مرحباً بكم في بينجو لايف", pt: "Bem-vindo ao BINGO LIVE", zh: "欢迎来到 BINGO LIVE", tl: "Maligayang pagdating sa BINGO LIVE", km: "សូមស្វាគមន៍មកកាន់ BINGO LIVE", de: "Willkommen bei BINGO LIVE", hi: "BINGO LIVE में आपका स्वागत है", ja: "BINGO LIVE へようこそ"
  },
  "discover talents": {
    en: "Discover Talents", fr: "Découvrir des Talents", es: "Descubrir Talentos", ar: "استكشف المواهب", pt: "Descobrir Talentos", zh: "发现才艺", tl: "Maghanap ng Talento", km: "ស្វែងរកទេពកោសល្យ", de: "Talente entdecken", hi: "प्रतिभा खोजें", ja: "タレントを探す"
  },
  "live rooms": {
    en: "Live Rooms", fr: "Salons en Direct", es: "Salas en Vivo", ar: "غرف البث المباشر", pt: "Salas ao Vivo", zh: "直播群组", tl: "Mga Kwarto", km: "បន្ទប់បន្តផ្ទាល់", de: "Live-Räume", hi: "लाइव कमरे", ja: "ライブ配信ルーム"
  },
  "popular creators": {
    en: "Popular Creators", fr: "Créateurs Populaires", es: "Creadores Populares", ar: "البث المثير", pt: "Criadores Populares", zh: "热门主播", tl: "Mga Sikat", km: "អ្នកបង្កើតពេញនិយម", de: "Beliebte Creator", hi: "लोकप्रिय क्रिएटर", ja: "人気ライバー"
  },
  "no creators online right now": {
    en: "No creators online right now", fr: "Aucun créateur en ligne en ce moment", es: "No hay creadores activos ahora", ar: "لا يوجد مقدمو بث نشطون الآن", pt: "Não há criadores ativos agora", zh: "当前暂无主播在线", tl: "Walang mga streamer online ngayon", km: "មិនមានអ្នកបង្កើតនៅលីនទេឥឡូវនេះ", de: "Gerade keine Creator online", hi: "इस समय कोई क्रिएटर लाइव नहीं है", ja: "現在オンラインのライバーはいません"
  },
  "earnings center": {
    en: "Earnings Center", fr: "Centre de Gains", es: "Centro de Ganancias", ar: "مركز الأرباح", pt: "Centro de Ganhos", zh: "收益中心", tl: "Sentro ng Kita", km: "មជ្ឈមណ្ឌលចំណូល", de: "Einnahmen-Center", hi: "कमाई केंद्र", ja: "収益センター"
  },
  "agency desk": {
    en: "Agency Desk", fr: "Bureau de l'Agence", es: "Mesa de Agencia", ar: "مكتب الوكالة", pt: "Painel de Agência", zh: "公会前台", tl: "Desk ng Ahensya", km: "តុភ្នាក់ងារ", de: "Agentur-Desk", hi: "एजेंसी डेस्क", ja: "事務所管理"
  },
  "vip center": {
    en: "VIP Center", fr: "Centre VIP", es: "Centro VIP", ar: "مركز الـ VIP", pt: "Centro VIP", zh: "VIP 尊享中心", tl: "VIP Sentro", km: "មជ្ឈមណ្ឌល VIP", de: "VIP-Center", hi: "वीआईपी केंद्र", ja: "VIP特典センター"
  },
  "wallet": {
    en: "Wallet", fr: "Portefeuille", es: "Billetera", ar: "المحفظة", pt: "Carteira", zh: "我的钱包", tl: "Wallet", km: "កាបូបប្រាក់", de: "Geldbeutel", hi: "वॉलेट", ja: "マイウォレット"
  },
  "admin desk": {
    en: "Admin Desk", fr: "Panneau d'administration", es: "Mesa de Administración", ar: "لوحة الإدارة", pt: "Mesa do Administrador", zh: "管理员后台", tl: "Admin Desk", km: "តុគ្រប់គ្រង", de: "Admin-Desk", hi: "व्यवस्थापक डेस्क", ja: "管理者コンソール"
  },
  "account settings": {
    en: "Account Settings", fr: "Paramètres du compte", es: "Configuración de Cuenta", ar: "إعدادات الحساب", pt: "Configurações da Conta", zh: "账号设置", tl: "Mga Setting", km: "ការកំណត់គណនី", de: "Kontoeinstellungen", hi: "खाता सेटिंग्स", ja: "アカウント設定"
  },
  "save settings": {
    en: "Save Settings", fr: "Enregistrer les modifications", es: "Guardar Ajustes", ar: "حفظ الإعدادات", pt: "Salvar Configurações", zh: "保存设置", tl: "I-save", km: "រក្សាទុកការកំណត់", de: "Einstellungen speichern", hi: "सेटिंग्स सुरक्षित करें", ja: "設定を保存"
  },
  "display name": {
    en: "Display Name", fr: "Nom d'affichage", es: "Nombre de Pantalla", ar: "الاسم المستعار", pt: "Nome de Exibição", zh: "昵称显示", tl: "Pangalan", km: "ឈ្មោះបង្ហាញ", de: "Anzeigename", hi: "प्रदर्शित नाम", ja: "表示名"
  },
  "app language": {
    en: "App Language", fr: "Langue de l'application", es: "Idioma de Aplicación", ar: "لغة التطبيق", pt: "Idioma do Aplicativo", zh: "软件语言", tl: "Wika ng App", km: "ភាសាកម្មវិធី", de: "App-Sprache", hi: "ऐप भाषा", ja: "アプリ言語"
  },
  "level progress": {
    en: "Level Progress", fr: "Progression de niveau", es: "Progreso de nivel", ar: "مستوى التقدم", pt: "Progresso do Nível", zh: "等级进度", tl: "Progreso ng Antas", km: "វឌ្ឍនភាពកម្រិត", de: "Level-Fortschritt", hi: "स्तर प्रगति", ja: "レベル進捗"
  },
  "back": {
    en: "Back", fr: "Retour", es: "Atrás", ar: "رجوع", pt: "Voltar", zh: "返回", tl: "Bumalik", km: "ថយក្រោយ", de: "Zurück", hi: "पीछे", ja: "戻る"
  },
  "total visitors": {
    en: "Total Visitors", fr: "Total Visiteurs", es: "Visitantes Totales", ar: "إجمالي الزوار", pt: "Total Visitantes", zh: "总访客数", tl: "Kabuuang Bisita", km: "អ្នកទស្សនាសរុប", de: "Besucher Gesamt", hi: "कुल आगंतुक", ja: "累計来訪者数"
  },
  "visitors": {
    en: "Visitors", fr: "Visiteurs", es: "Visitantes", ar: "الزائرين", pt: "Visitantes", zh: "访客", tl: "Mga Bisita", km: "អ្នកទស្សនា", de: "Besucher", hi: "आगंतुक", ja: "訪問者"
  },
  "search engine audit": {
    en: "Search Engine Audit", fr: "Audit du moteur", es: "Auditoría de SEO", ar: "تدقيق محرك البحث", pt: "Auditoria de Busca", zh: "搜索引擎审核", tl: "Search Audit", km: "សវនកម្មម៉ាស៊ីនស្វែងរក", de: "Suchmaschinen-Audit", hi: "खोज इंजन ऑडिट", ja: "検索エンジン監査"
  },
  "family activities": {
    en: "Family Activities", fr: "Activités Familiales", es: "Actividades de Familia", ar: "أنشطة العائلة", pt: "Atividades de Família", zh: "家族活动", tl: "Mga Aktibidad", km: "សកម្មភាពគ្រួសារ", de: "Familienaktivitäten", hi: "परिवार गतिविधियां", ja: "ファミリーアクティビティ"
  },
  "join guest seat": {
    en: "Join Guest Seat", fr: "Rejoindre le siège d'invité", es: "Unirse a Asiento", ar: "الانضمام كمستضيف فرعي", pt: "Entrar no Assento", zh: "申请上麦", tl: "Sumali sa upuan", km: "ចូលរួមកម្មវិធី", de: "Gast-Sitz beitreten", hi: "गेस्ट सीट से जुड़ें", ja: "ゲストシートに参加"
  },
  "leave seat": {
    en: "Leave Seat", fr: "Quitter le siège", es: "Dejar Asiento", ar: "مغادرة المايك", pt: "Sair do Assento", zh: "下麦", tl: "Umalis sa upuan", km: "ចាកចេញពីកន្លែង", de: "Sitz verlassen", hi: "सीट छोड़ें", ja: "シートを降りる"
  },
  "send gift": {
    en: "Send Gift", fr: "Envoyer un cadeau", es: "Enviar Regalo", ar: "إرسال هدية", pt: "Enviar Presente", zh: "送礼", tl: "Magpadala ng Regalo", km: "ផ្ញើកាដូ", de: "Geschenk senden", hi: "उपहार भेजें", ja: "ギフトを送る"
  },
  "gift box": {
    en: "Gift Box", fr: "Boîte à Cadeaux", es: "Caja de Regalos", ar: "صندوق الهدايا", pt: "Caixa de Presentes", zh: "礼物箱", tl: "Kahon ng Regalo", km: "ប្រអប់កាដូ", de: "Geschenkbox", hi: "उपहार पेटी", ja: "ギフトボックス"
  },
  "leaderboard": {
    en: "Leaderboard", fr: "Classement", es: "Tabla de líderes", ar: "قائمة المتصدرين", pt: "Classificação", zh: "排行榜", tl: "Leaderboard", km: "តារាងពិន្ទុ", de: "Bestenliste", hi: "लीडरबोर्ड", ja: "ランキング"
  },
  "trends": {
    en: "Trends", fr: "Tendances", es: "Tendencias", ar: "الشائع", pt: "Tendências", zh: "流行趋势", tl: "Trends", km: "និន្នាការ", de: "Trends", hi: "रुझان", ja: "トレンド"
  },
  "go live": {
    en: "Go Live", fr: "Lancer un Direct", es: "Transmitir en Vivo", ar: "بدء البث", pt: "Iniciar Transmissão", zh: "开启直播", tl: "Mag-live", km: "ផ្សាយផ្ទាល់", de: "Live gehen", hi: "लाइव जाएं", ja: "配信スタート"
  },
  "official host registration": {
    en: "Official Host Registration", fr: "Enregistrement d'Animateur", es: "Registro de Host Oficial", ar: "تسجيل المضيف الرسمي", pt: "Registro de Host Oficial", zh: "官方签约主播申请", tl: "Opisyal na Pagrehistro", km: "ការចុះឈ្មោះជាផ្លូវការ", de: "Offizielle Host-Registrierung", hi: "आधिकारिक होस्ट पंजीकरण", ja: "公認ライバー登録"
  },
  "pk battle": {
    en: "PK Battle", fr: "Combat PK", es: "Batalla PK", ar: "تحدي PK", pt: "Batalha PK", zh: "PK 大战", tl: "Labanang PK", km: "ការប្រយុទ្ធ PK", de: "PK-Battle", hi: "पीके बैटल", ja: "PKバトル"
  },
  "live chat": {
    en: "Live Chat", fr: "Chat en direct", es: "Chat en Vivo", ar: "الدردشة الحية", pt: "Chat ao Vivo", zh: "实时聊天", tl: "Live Chat", km: "ជជែកផ្ទាល់", de: "Live-Chat", hi: "लाइव चैट", ja: "ライブチャット"
  },
  "level": {
    en: "Level", fr: "Niveau", es: "Nivel", ar: "المستوى", pt: "Nível", zh: "等级", tl: "Antas", km: "កម្រិត", de: "Level", hi: "स्तर", ja: "レベル"
  },
  "diamonds": {
    en: "Diamonds", fr: "Diamants", es: "Diamantes", ar: "الماسات", pt: "Diamantes", zh: "钻石", tl: "Diyamante", km: "ពេជ្រ", de: "Diamanten", hi: "हीरे", ja: "ダイヤ"
  },
  "coins": {
    en: "Coins", fr: "Pièces", es: "Monedas", ar: "العملات", pt: "Moedas", zh: "金币", tl: "Barya", km: "កាក់", de: "Münzen", hi: "सिक्के", ja: "コイン"
  },
  "viewers": {
    en: "Viewers", fr: "Spectateurs", es: "Espectadores", ar: "المشاهدين", pt: "Espectadores", zh: "观众", tl: "Manonood", km: "អ្នកទស្សនា", de: "Zuschauer", hi: "दर्शक", ja: "視聴者"
  },
  "music player": {
    en: "Music Player", fr: "Lecteur de musique", es: "Reproductor de Música", ar: "مشغل الموسيقى", pt: "Player de Música", zh: "音乐播放器", tl: "Music Player", km: "កម្មវិធីចាក់តន្ត្រី", de: "Musikplayer", hi: "म्यूजिक प्लेयर", ja: "音楽プレイヤー"
  },
  "mini game center": {
    en: "Mini Game Center", fr: "Centre de mini-jeux", es: "Centro de Mini Juegos", ar: "مركز الألعاب المصغرة", pt: "Centro de Minijogos", zh: "小游戏娱乐城", tl: "Palaruan", km: "មជ្ឈមណ្ឌលហ្គេមខ្នាតតូច", de: "Mini-Spielcenter", hi: "मिनी गेम सेंटर", ja: "ミニゲームセンター"
  },
  "explore": {
    en: "Explore", fr: "Explorer", es: "Explorar", ar: "استكشف", pt: "Explorar", zh: "探索发现", tl: "Galugarin", km: "ស្វែងរក", de: "Entdecken", hi: "खोजें", ja: "見つける"
  },
  "rankings": {
    en: "Rankings", fr: "Classements", es: "Clasificaciones", ar: "الترتيب", pt: "Rankings", zh: "排行榜单", tl: "Ranggo", km: "ចំណាត់ថ្នាក់", de: "Bestenlisten", hi: "रैंकिंग", ja: "ランキング"
  },
  "create family": {
    en: "Create Family", fr: "Créer une famille", es: "Crear Familia", ar: "إنشاء عائلة", pt: "Criar Família", zh: "创建家族", tl: "Lumikha ng Pamilya", km: "បង្កើតគ្រួសារ", de: "Familie gründen", hi: "परिवार बनाएं", ja: "ファミリー作成"
  },
  "join room": {
    en: "Join Room", fr: "Rejoindre le salon", es: "Entrar a Sala", ar: "دخول الغرفة", pt: "Entrar na Sala", zh: "进入房间", tl: "Pumasok sa Kwarto", km: "ចូលរួមបន្ទប់", de: "Raum beitreten", hi: "कमरे में शामिल हों", ja: "入室する"
  },
  "family list": {
    en: "Family List", fr: "Liste des familles", es: "Lista de Familias", ar: "قائمة العائلات", pt: "Lista de Famílias", zh: "家族列表", tl: "Lista ng Pamilya", km: "បញ្ជីគ្រួសារ", de: "Familienliste", hi: "परिवार सूची", ja: "ファミリー一覧"
  },
  "active rooms": {
    en: "Active Rooms", fr: "Salons Actifs", es: "Salas Activas", ar: "الغرف النشطة", pt: "Salas Ativas", zh: "在线房间", tl: "Mga Aktibong Kwarto", km: "បន្ទប់សកម្ម", de: "Aktive Räume", hi: "सक्रिय कमरे", ja: "アクティブルーム"
  },
  "weekly star": {
    en: "Weekly Star", fr: "Étoile Hebdomadaire", es: "Estrella Semanal", ar: "نجم الأسبوع", pt: "Estrela Semanal", zh: "周星擂台", tl: "Lingguhang Bituin", km: "ផ្កាយប្រចាំសប្តាហ៍", de: "Wöchentlicher Star", hi: "साप्ताहिक स्टार", ja: "ウィークリースター"
  },
  "audio stream": {
    en: "Audio Stream", fr: "Audio uniquement", es: "Transmisión de Audio", ar: "البث الصوتي", pt: "Transmissão de Áudio", zh: "语音直播", tl: "Audio Stream", km: "ស្ទ្រីមអូឌីយ៉ូ", de: "Audio-Stream", hi: "ऑडियो स्ट्रीम", ja: "音声配信"
  },
  "co-stream": {
    en: "Co-Stream", fr: "Diffuser en duo", es: "Co-transmisión", ar: "البث المشترك", pt: "Co-transmissão", zh: "连麦互动", tl: "Co-Stream", km: "ការស្ទ្រីមរួមគ្នា", de: "Co-Stream", hi: "सह-स्ट्रीम", ja: "コラボ配信"
  },
  "gifts sent": {
    en: "Gifts Sent", fr: "Cadeaux Envoyés", es: "Regalos Enviados", ar: "الهدايا المرسلة", pt: "Presentes Enviados", zh: "送出礼物", tl: "Napadalang Regalo", km: "កាដូផ្ញើចេញ", de: "Gesendete Geschenke", hi: "भेजे गए उपहार", ja: "送ったギフト"
  },
  "gifts received": {
    en: "Gifts Received", fr: "Cadeaux Reçus", es: "Regalos Recibidos", ar: "الهدايا المستقبلة", pt: "Presentes Recebidos", zh: "收获礼物", tl: "Natanggap na Regalo", km: "កាដូបានទទួល", de: "Erhaltene Geschenke", hi: "प्राप्त उपहार", ja: "受け取ったギフト"
  },
  "official agent": {
    en: "Official Agent", fr: "Agent Officiel", es: "Agente Oficial", ar: "الوكيل الرسمي", pt: "Agente Oficial", zh: "官方签约经纪人", tl: "Opisyal na Ahente", km: "ភ្នាក់ងារផ្លូវការ", de: "Offizieller Agent", hi: "आधिकारिक एजेंट", ja: "公式エージェント"
  },
  "vip noble benefits": {
    en: "VIP Noble Benefits", fr: "Avantages Nobles VIP", es: "Beneficios Nobles VIP", ar: "مزايا النبلاء VIP", pt: "Benefícios VIP Nobre", zh: "VIP 贵族独享特权", tl: "VIP Noble Benepisyo", km: "អត្ថប្រយោជន៍ VIP Noble", de: "VIP-Adelsvorteile", hi: "वीआईपी नोबल लाभ", ja: "VIP貴族特典"
  },
  "trending now": {
    en: "Trending Now", fr: "Tendance Actuelle", es: "Tendencias de Ahora", ar: "شائع الآن", pt: "Tendência Agora", zh: "当下热门", tl: "Sikat Ngayon", km: "កំពុងពេញនិយមឥឡូវនេះ", de: "Jetzt im Trend", hi: "अभी ट्रेंडिंग", ja: "急上昇中"
  },
  "search room id or name...": {
    en: "Search Room ID or name...", fr: "Rechercher un salon...", es: "Buscar ID de sala o nombre...", ar: "البحث عن رقم الغرفة أو الاسم...", pt: "Buscar ID ou nome...", zh: "搜索房间ID或主播昵称...", tl: "Maghanap ng Kwarto...", km: "ស្វែងរកបន្ទប់...", de: "Raum-ID oder Name suchen...", hi: "कमरा आईडी या नाम खोजें...", ja: "ルームIDや名前で検索..."
  },
  "official": {
    en: "Official", fr: "Officiel", es: "Oficial", ar: "الرسمي", pt: "Oficial", zh: "官方推荐", tl: "Opisyal", km: "ផ្លូវការ", de: "Offiziell", hi: "आधिकारिक", ja: "公式"
  },
  "level up progress": {
    en: "Level Up Progress", fr: "Progression de niveau", es: "Progreso de nivel", ar: "تطور المستوى", pt: "Progresso do Nível", zh: "升级进度百分比", tl: "Antas Progreso", km: "វឌ្ឍនភាពឡើងកម្រិត", de: "Levelaufstiegs-Fortschritt", hi: "लेवल अप प्रगति", ja: "レベルアップ進捗"
  },
  "send": {
    en: "Send", fr: "Envoyer", es: "Enviar", ar: "إرسال", pt: "Enviar", zh: "发送", tl: "Ipadala", km: "ផ្ញើ", de: "Senden", hi: "भेजें", ja: "送信"
  },
  "all rooms": {
    en: "All Rooms", fr: "Tous les salons", es: "Todas las salas", ar: "كل الغرف", pt: "Todas as Salas", zh: "全部直播间", tl: "Lahat ng Kwarto", km: "បន្ទប់ទាំងអស់", de: "Alle Räume", hi: "सभी कमरे", ja: "すべてのルーム"
  },
  "rankings leaderboard": {
    en: "Rankings Leaderboard", fr: "Tableau de Classement", es: "Tabla de Clasificación", ar: "لوحة الصدارة والترتيب", pt: "Tabela de Classificação", zh: "荣誉英雄榜", tl: "Ranggo Leaderboard", km: "តារាងពិន្ទុចំណាត់ថ្នាក់", de: "Ranking-Bestenliste", hi: "रैंकिंग लीडरबोर्ड", ja: "総合ランキング"
  },
  "activity logs": {
    en: "Activity Logs", fr: "Journaux d'activité", es: "Registro de Actividad", ar: "سجل العمليات", pt: "Registros de Atividades", zh: "系统审核日志", tl: "Mga Log ng Aktibidad", km: "កំណត់ហេតុសកម្មភាព", de: "Aktivitätsprotokolle", hi: "गतिविधि लॉग", ja: "アクティビティログ"
  },
  "gifting area": {
    en: "Gifting Area", fr: "Zone de cadeaux", es: "Zona de Regalos", ar: "منطقة الهدايا والاستلام", pt: "Área de Presentes", zh: "唯美礼物面板", tl: "Lugar ng Regalo", km: "តំបន់កាដូ", de: "Geschenkbereich", hi: "उपहार देने का क्षेत्र", ja: "ギフトエリア"
  },
  "royal vip benefits": {
    en: "Royal VIP Benefits", fr: "Avantages VIP Nobles", es: "Beneficios de VIP Real", ar: "امتيازات VIP الملكية", pt: "Benefícios VIP Reais", zh: "皇家贵族金级特权", tl: "VIP Benepisyo", km: "អត្ថប្រយោជន៍ VIP រាជវง្ស", de: "Königliche VIP-Vorteile", hi: "रॉयल वीआईपी लाभ", ja: "ロイヤルVIP特典"
  },
  "my family": {
    en: "My Family", fr: "Ma famille", es: "Mi Familia", ar: "عائلتي", pt: "Minha Família", zh: "我的家族", tl: "Aking Pamilya", km: "គ្រួសាររបស់ខ្ញុំ", de: "Meine Familie", hi: "मेरा परिवार", ja: "マイファミリー"
  },
  "noble title": {
    en: "Noble Title", fr: "Titre Noble", es: "Título Noble", ar: "اللقب النبيل", pt: "Título Nobre", zh: "贵族爵位", tl: "Noble Titulo", km: "គោរមងារ Noble", de: "Adelstitel", hi: "नोबल उपाधि", ja: "貴族の称号"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as LanguageCode) || 'en';
  });

  // Client-Side Zero-Reload Real-Time Translation Engine
  useEffect(() => {
    localStorage.setItem('app-language', language);
    
    // Apply reading direction (RTL/LTR) directly to document body
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    window.document.documentElement.dir = direction;
    window.document.documentElement.lang = language;

    if (language === 'en') {
      try {
        // Clear cookies aggressively
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
        
        // Reset Google Translate select element if it exists in DOM
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select && select.value !== '') {
          select.value = '';
          select.dispatchEvent(new Event('change'));
        }
      } catch (e) {
        console.warn("Error cleaning up Google Translate for English:", e);
      }
      return;
    }

    const formattedLang = 
      language === 'zh' ? 'zh-CN' : 
      language === 'tl' ? 'tl' : 
      language === 'km' ? 'km' : 
      language;

    // Set up Google Translate automatic cookie mapping for full-page instant translation
    try {
      const cookieValue = `googtrans=/en/${formattedLang}`;

      // Delete any stale cookies
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;

      // Apply Google Translate cookies to target domain to enforce global native rendering
      document.cookie = `${cookieValue}; path=/;`;
      document.cookie = `${cookieValue}; path=/; domain=${window.location.hostname};`;

      // Inject hidden google_translate_element div dynamically (opacity: 0 so it stays active in DOM layout)
      let element = document.getElementById('google_translate_element');
      if (!element) {
        element = document.createElement('div');
        element.id = 'google_translate_element';
        element.setAttribute(
          'style',
          'position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0; z-index: -9999; overflow: hidden;'
        );
        document.body.appendChild(element);
      }

      // Define callback
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'en',
          autoDisplay: false
        }, 'google_translate_element');
      };

      // Append translation widget script securely
      const scriptId = 'google-translate-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(script);
      }

      // Poll for `.goog-te-combo` to execute instant in-browser translation trigger
      const checkAndTrigger = () => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select) {
          if (select.value !== formattedLang) {
            select.value = formattedLang;
            select.dispatchEvent(new Event('change'));
          }
          return true;
        }
        return false;
      };

      if (!checkAndTrigger()) {
        const timer = setInterval(() => {
          if (checkAndTrigger()) {
            clearInterval(timer);
          }
        }, 300);
        setTimeout(() => clearInterval(timer), 8000); // Stop polling after 8s
      }
    } catch (e) {
      console.warn("Google Translate client initialization failed:", e);
    }
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[language];
    return dict?.[key] || fallback || TRANSLATIONS['en'][key] || key;
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const currentLanguageDetails = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLanguageDetails }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
