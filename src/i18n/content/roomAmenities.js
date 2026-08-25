// Translated room-amenity strings, keyed by the canonical English string
// itself (these are shared labels reused across many rooms/room types
// rather than belonging to one record id — see STANDARD_ROOM_AMENITIES,
// ROOM_TYPES[].amenities, and the live `rooms.amenities` column backfilled
// in supabase/migrations/20260824070000_backfill_room_amenities.sql).
//
// Shape: { [englishLabel]: { en, fr, es, zh } } — each value is the plain
// translated string, consumed via getLocalizedString() in ./index.js.
export const roomAmenities = {
  'Furnished balcony': { en: `Furnished balcony`, fr: `Balcon meublé`, es: `Balcón amueblado`, zh: `配备家具的阳台` },
  'Bathrobe & slippers': { en: `Bathrobe & slippers`, fr: `Peignoir et chaussons`, es: `Bata y zapatillas`, zh: `浴袍与拖鞋` },
  'Pod coffee maker': { en: `Pod coffee maker`, fr: `Cafetière à dosettes`, es: `Cafetera de cápsulas`, zh: `胶囊咖啡机` },
  'In-room dining': { en: `In-room dining`, fr: `Service de restauration en chambre`, es: `Servicio de comidas en la habitación`, zh: `客房送餐服务` },
  'Air conditioning': { en: `Air conditioning`, fr: `Climatisation`, es: `Aire acondicionado`, zh: `空调` },
  'Free Wi-Fi': { en: `Free Wi-Fi`, fr: `Wi-Fi gratuit`, es: `Wi-Fi gratuito`, zh: `免费无线网络` },
  'Ocean view': { en: `Ocean view`, fr: `Vue sur l'océan`, es: `Vista al océano`, zh: `海景` },
  'Rain shower': { en: `Rain shower`, fr: `Douche à effet pluie`, es: `Ducha de lluvia`, zh: `雨淋花洒` },
  'Mini bar': { en: `Mini bar`, fr: `Mini-bar`, es: `Minibar`, zh: `迷你吧` },
  'Separate living area': { en: `Separate living area`, fr: `Espace salon séparé`, es: `Sala de estar independiente`, zh: `独立起居区` },
  'Two sleeping areas': { en: `Two sleeping areas`, fr: `Deux espaces de sommeil`, es: `Dos áreas de descanso`, zh: `两个休息区` },
  'Extra bedding on request': { en: `Extra bedding on request`, fr: `Literie supplémentaire sur demande`, es: `Ropa de cama adicional a solicitud`, zh: `可应要求提供加床用品` },
  'Premium mini bar': { en: `Premium mini bar`, fr: `Mini-bar premium`, es: `Minibar premium`, zh: `高级迷你吧` },
  'Private plunge pool access': { en: `Private plunge pool access`, fr: `Accès à une piscine privée`, es: `Acceso a piscina privada`, zh: `私人小型泳池使用权` },
  'Priority concierge service': { en: `Priority concierge service`, fr: `Service de conciergerie prioritaire`, es: `Servicio de conserjería prioritario`, zh: `优先礼宾服务` },
  // Legacy strings from the top-level mockData.js `ROOM` fallback object
  // (used only if a guest's room can't be matched in the live `rooms`
  // table) — kept for the same "never leave English on screen" guarantee.
  'Private balcony': { en: `Private balcony`, fr: `Balcon privé`, es: `Balcón privado`, zh: `私人阳台` },
  'Nespresso machine': { en: `Nespresso machine`, fr: `Machine Nespresso`, es: `Cafetera Nespresso`, zh: `Nespresso咖啡机` },
};

export default roomAmenities;
