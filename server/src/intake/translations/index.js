/**
 * Translation Registry
 *
 * Dynamically loads language packs. To add a new language:
 * 1. Create a new file (e.g., ta.js for Tamil)
 * 2. Import and register it here
 *
 * No changes to clinical workflow required when adding languages.
 */
import en from './en.js';
import hi from './hi.js';
import mr from './mr.js';

const translations = {
  en,
  hi,
  mr,
};

/**
 * Get translations for a given language code.
 * Falls back to English if the language is not found.
 */
export const getTranslation = (langCode) => {
  return translations[langCode] || translations.en;
};

/**
 * Get question text by question ID and language.
 */
export const getQuestionText = (questionId, langCode) => {
  const t = getTranslation(langCode);
  return t.questions?.[questionId] || translations.en.questions?.[questionId] || questionId;
};

/**
 * Get option label by option key and language.
 */
export const getOptionLabel = (optionKey, langCode) => {
  const t = getTranslation(langCode);
  return t.options?.[optionKey] || translations.en.options?.[optionKey] || optionKey;
};

/**
 * Get UI string by key and language.
 */
export const getUIString = (key, langCode) => {
  const t = getTranslation(langCode);
  return t.ui?.[key] || translations.en.ui?.[key] || key;
};

/**
 * Get red flag message by key and language.
 */
export const getRedFlagMessage = (key, langCode) => {
  const t = getTranslation(langCode);
  return t.redFlags?.[key] || translations.en.redFlags?.[key] || key;
};

/**
 * Get list of supported languages with metadata.
 */
export const getSupportedLanguages = () => {
  return Object.values(translations).map((t) => ({
    code: t._meta.code,
    name: t._meta.name,
    nativeName: t._meta.nativeName,
    direction: t._meta.direction,
  }));
};

/**
 * Check if a language is supported.
 */
export const isLanguageSupported = (langCode) => {
  return !!translations[langCode];
};

export default translations;
