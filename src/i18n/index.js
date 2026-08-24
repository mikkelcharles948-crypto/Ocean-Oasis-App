import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import zh from './locales/zh.json';

// Guests staying at Ocean Oasis are most commonly English, French, Spanish,
// or (Simplified) Chinese speaking, so those are the only languages this
// app ships translations for. Anything else falls back to English.
export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'zh'];
export const DEFAULT_LANGUAGE = 'en';

export const LANGUAGE_STORAGE_KEY = 'oceanOasis.language';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  zh: { translation: zh },
};

// Reduce a device locale tag like "fr-CA" or "zh-Hans-CN" down to one of our
// supported language codes, falling back to English if there's no match.
function resolveSupportedLanguage(tag) {
  if (!tag) return DEFAULT_LANGUAGE;
  const primary = tag.toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LANGUAGES.includes(primary) ? primary : DEFAULT_LANGUAGE;
}

function detectDeviceLanguage() {
  try {
    const locales = Localization.getLocales?.();
    const deviceTag = locales && locales.length > 0 ? locales[0].languageTag : null;
    return resolveSupportedLanguage(deviceTag);
  } catch (e) {
    return DEFAULT_LANGUAGE;
  }
}

// i18next needs to be initialized synchronously before the app renders, so
// we start with the device-detected language immediately. Once the
// persisted preference (if any) is read back from AsyncStorage, we switch
// to it — this happens fast enough (before first meaningful paint in
// practice) and changeLanguage() re-renders everything subscribed via
// useTranslation, so there's no flash of the wrong language in normal use.
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: detectDeviceLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
    returnEmptyString: false,
  });

AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
  .then((stored) => {
    if (stored && SUPPORTED_LANGUAGES.includes(stored) && stored !== i18n.language) {
      i18n.changeLanguage(stored);
    }
  })
  .catch(() => {
    // No persisted preference yet (or storage unavailable) — keep the
    // device-detected language i18next already initialized with.
  });

// Call this to change the active language and persist the choice so it
// survives app restarts. Screens using useTranslation() re-render
// automatically once the language changes.
export async function changeLanguage(languageCode) {
  if (!SUPPORTED_LANGUAGES.includes(languageCode)) return;
  await i18n.changeLanguage(languageCode);
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
  } catch (e) {
    // Persistence failure shouldn't block the in-session language change.
  }
}

export default i18n;
