// Renders an activity's price in the current language. Most activities are
// a flat per-person rate (priceValue > 0); a couple are complimentary or
// have variable/contact-for pricing (priceValue === 0) — distinguished by
// checking the raw seeded `price` string rather than a dedicated DB
// column, so this works for both the live Supabase-backed data and the
// local mock fallback without a schema change.
export function formatActivityPrice(activity, t) {
  const raw = (activity.price || '').toLowerCase();
  if (activity.priceValue > 0) {
    return t('activities.perPersonPrice', { price: activity.priceValue });
  }
  if (raw.includes('contact')) {
    return t('activities.contactForPricing');
  }
  return t('activities.complimentaryPrice');
}
