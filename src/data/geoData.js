// Real-world coordinates for the map. Sourced from OpenStreetMap's Nominatim
// geocoder and Wikipedia's coordinate data, cross-checked by place name —
// not guessed. A few interior trail sites (Titou Gorge, Freshwater Lake)
// have no dedicated geocoder entry, so they're pinned to the nearest named
// landmark they sit beside (noted per entry) rather than left inaccurate.
// Bush Rum Tasting has no pin: the destination itself describes it as
// "rustic bush bars and rum shacks across the island", not one place.

export const HOTEL_LOCATION = {
  lat: 15.2887,
  lng: -61.3739,
  label: 'Ocean Oasis',
};

export const DESTINATION_COORDS = {
  d_1: { lat: 15.2472, lng: -61.3734 }, // Champagne Reef
  d_2: { lat: 15.3183, lng: -61.2942 }, // Boiling Lake
  d_3: { lat: 15.3167, lng: -61.35 }, // Trafalgar Falls (Trafalgar village)
  d_4: { lat: 15.325, lng: -61.3167 }, // Morne Trois Pitons National Park
  d_5: { lat: 15.3973, lng: -61.3119 }, // Emerald Pool
  d_6: { lat: 15.3014, lng: -61.3883 }, // Whale Watching — departs Roseau
  d_7: { lat: 15.3014, lng: -61.3883 }, // Old Roseau Market & Waterfront
  d_8: { lat: 15.3197, lng: -61.3389 }, // Ti Kwen Glo Cho — Wotten Waven
  d_9: { lat: 15.3352, lng: -61.333 }, // Titou Gorge — pinned at Laudat, its trailhead village
  d_10: { lat: 15.5852, lng: -61.4702 }, // Cabrits National Park & Fort Shirley
  d_11: { lat: 15.5667, lng: -61.4667 }, // Indian River, Portsmouth
  d_12: { lat: 15.3483, lng: -61.3358 }, // Middleham Falls
  d_13: { lat: 15.34, lng: -61.323 }, // Freshwater Lake — approximate, between Laudat and Boeri Lake
  d_14: { lat: 15.49, lng: -61.2533 }, // Kalinago Territory
  d_15: { lat: 15.5174, lng: -61.4244 }, // Syndicate Nature Trail & Parrot Reserve
  d_16: { lat: 15.4167, lng: -61.4333 }, // Mero Beach
  d_17: { lat: 15.2322, lng: -61.3597 }, // Soufriere Village & Sulphur Springs
  // d_18 Bush Rum Tasting — intentionally no pin, see note above.
  d_19: { lat: 15.2124, lng: -61.3677 }, // Scotts Head (Cachacrou)
  d_20: { lat: 15.3522, lng: -61.3211 }, // Boeri Lake
  d_21: { lat: 15.3664, lng: -61.252 }, // Wavine Cyrique
};
