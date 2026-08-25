// -----------------------------------------------------------------------
// Ocean Oasis — Guest-facing CONTENT translation layer.
//
// UI chrome (headers, buttons, labels) is translated via i18next resource
// bundles in src/i18n/locales/*.json. That system is not a good fit for
// per-record prose (a destination's description, a dish's name) because
// those records are keyed by id and can come from either the local mock
// data (src/data/mockData.js) or the live Supabase tables, which were
// seeded from that same mock data using the same ids.
//
// Each file in this directory exports a dictionary keyed by record id (or,
// for shared strings like room amenities, by the canonical English string
// itself), where every entry holds `{ en, fr, es, zh }` translations of
// that record's translatable fields. The helpers below resolve the right
// language for the current i18next locale and merge it over the original
// (English) object fetched from mockData/Supabase, so:
//   - any field not covered by the dictionary passes through untouched
//   - any id/locale combination missing from the dictionary falls back to
//     English, then to the original source value — never blank, never a
//     thrown error.
// -----------------------------------------------------------------------

function pick(localeMap, locale) {
  if (!localeMap) return null;
  return localeMap[locale] || localeMap.en || null;
}

/**
 * Look up the translated fields for `id` in `dictionary` at `locale`, and
 * merge them over `fallbackObject` (typically the original mockData/DB
 * record). Fields present in the dictionary entry override the fallback;
 * every other field on `fallbackObject` passes through unchanged.
 */
export function getLocalizedContent(dictionary, id, locale, fallbackObject) {
  const base = fallbackObject || {};
  try {
    const entry = dictionary && id != null ? dictionary[id] : null;
    if (!entry) return base;
    const en = entry.en || {};
    const localized = pick(entry, locale) || en;
    return { ...base, ...en, ...localized };
  } catch (e) {
    return base;
  }
}

/**
 * Look up a single translated string keyed by its own canonical English
 * value (used for shared strings like room amenity names, which repeat
 * across many records rather than belonging to one id).
 */
export function getLocalizedString(dictionary, key, locale, fallbackString) {
  try {
    const entry = dictionary && key != null ? dictionary[key] : null;
    if (!entry) return fallbackString;
    return pick(entry, locale) || entry.en || fallbackString;
  } catch (e) {
    return fallbackString;
  }
}

/**
 * Dining menus have a nested shape (sections -> items -> name/description)
 * that doesn't fit the flat getLocalizedContent shape, so they get their
 * own merge helper. `fallbackMenu` is the original { sections: [...] }
 * object from mockData.js; sections/items are matched by position.
 */
export function getLocalizedMenu(dictionary, venueId, locale, fallbackMenu) {
  try {
    if (!fallbackMenu || !Array.isArray(fallbackMenu.sections)) return fallbackMenu;
    const entry = dictionary ? dictionary[venueId] : null;
    const dictSections = entry && Array.isArray(entry.sections) ? entry.sections : [];

    const sections = fallbackMenu.sections.map((section, sIdx) => {
      const dictSection = dictSections[sIdx];
      const title = dictSection ? (pick(dictSection.title, locale) || section.title) : section.title;
      const dictItems = dictSection && Array.isArray(dictSection.items) ? dictSection.items : [];

      const items = (section.items || []).map((item, iIdx) => {
        const dictItem = dictItems[iIdx];
        if (!dictItem) return item;
        return {
          ...item,
          name: pick(dictItem.name, locale) || item.name,
          description: pick(dictItem.description, locale) || item.description,
        };
      });

      return { ...section, title, items };
    });

    return { ...fallbackMenu, sections };
  } catch (e) {
    return fallbackMenu;
  }
}
