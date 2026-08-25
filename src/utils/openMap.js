import { Linking } from 'react-native';

// Opens a real Google Maps search for a place — no API key needed, works on
// iOS and Android (opens the native Maps/Google Maps app if installed, the
// mobile web view otherwise). Use a specific, disambiguating query
// (e.g. "Trafalgar Falls, Dominica" rather than just "Trafalgar Falls") so
// the search reliably lands on the right place.
export function openInGoogleMaps(query) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return Linking.openURL(url).catch(() => {});
}

// Opens Google Maps directions to a place, optionally from the hotel.
export function openDirectionsInGoogleMaps(destinationQuery, originQuery) {
  const params = new URLSearchParams({ api: '1', destination: destinationQuery });
  if (originQuery) params.set('origin', originQuery);
  const url = `https://www.google.com/maps/dir/?${params.toString()}`;
  return Linking.openURL(url).catch(() => {});
}
