// Destinations and dining venues have no DB row of their own — resolves a
// staff-edited replacement photo (see the Photo Library / photo_overrides
// table) for one, falling back to whatever mockData.js originally shipped
// with if no override has been set for that slot yet.
export function resolvePhotoUrl(photoOverrides, slotKey, fallbackUrl) {
  return photoOverrides?.[slotKey]?.imageUrl || fallbackUrl;
}
