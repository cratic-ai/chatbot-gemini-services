/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export interface RagStore {
    name: string;
    displayName: string;
}

export interface CustomMetadata {
  key?: string;
  stringValue?: string;
  stringListValue?: string[];
  numericValue?: number;
}

export interface Document {
    name: string;
    displayName: string;
    customMetadata?: CustomMetadata[];
}

export interface GroundingChunk {
    retrievedContext?: {
        text?: string;
    };
}

export interface QueryResult {
    text: string;
    groundingChunks: GroundingChunk[];
}

export enum AppStatus {
    Initializing,
    Welcome,
    Uploading,
    Chatting,
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
    groundingChunks?: GroundingChunk[];
}

export const supportedLanguages = {
    // Global & European
    en: 'English',
    es: 'Spanish (Español)',
    fr: 'French (Français)',
    de: 'German (Deutsch)',

    // East Asian
    ja: 'Japanese (日本語)',
    ko: 'Korean (한국어)',

    // Indian Subcontinent
    hi: 'Hindi (हिन्दी)',
    bn: 'Bengali (বাংলা)',
    ta: 'Tamil (தமிழ்)',
    te: 'Telugu (తెలుగు)',
    mr: 'Marathi (मराठी)',
    gu: 'Gujarati (ગુજરાતી)',
    pa: 'Punjabi (ਪੰਜਾਬੀ)',
    kn: 'Kannada (ಕನ್ನಡ)',
    ml: 'Malayalam (മലയാളം)',
    or: 'Odia (ଓଡ଼ିଆ)',
    as: 'Assamese (অসমীয়া)',
    ur: 'Urdu (اردو)',
    ne: 'Nepali (नेपाली)',
    si: 'Sinhala (සිංහල)',

    // Southeast Asian
    vi: 'Vietnamese (Tiếng Việt)',
    th: 'Thai (ไทย)',
    id: 'Indonesian (Bahasa Indonesia)',
    ms: 'Malay (Bahasa Melayu)'
};


export type LanguageCode = keyof typeof supportedLanguages;

export const languageFlags: Record<LanguageCode, string> = {
    en: '🇬🇧',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    ja: '🇯🇵',
    ko: '🇰🇷',
    hi: '🇮🇳',
    bn: '🇧🇩',
    ta: '🇮🇳',
    te: '🇮🇳',
    mr: '🇮🇳',
    gu: '🇮🇳',
    pa: '🇮🇳',
    kn: '🇮🇳',
    ml: '🇮🇳',
    or: '🇮🇳',
    as: '🇮🇳',
    ur: '🇵🇰',
    ne: '🇳🇵',
    si: '🇱🇰',
    vi: '🇻🇳',
    th: '🇹🇭',
    id: '🇮🇩',
    ms: '🇲🇾'
};