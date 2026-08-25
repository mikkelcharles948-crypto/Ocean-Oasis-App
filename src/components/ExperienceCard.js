import React from 'react';
import EditorialImageCard from './EditorialImageCard';

// Activities & Explore destinations. Accepts the raw (already-localized)
// record plus a couple of derived strings the screen computes itself
// (formatActivityPrice, distance/duration text) so this component stays
// free of pricing or i18n logic.
//
//   <ExperienceCard activity={localizedActivity} priceLabel={formatActivityPrice(a, t)} onPress={...} />
export default function ExperienceCard({ activity, priceLabel, size = 'medium', onPress, style }) {
  const title = activity.name || activity.title;
  const meta = [activity.duration, activity.location].filter(Boolean).join(' · ');
  return (
    <EditorialImageCard
      image={activity.imageUrl ? { uri: activity.imageUrl } : null}
      fallbackIcon="compass-outline"
      eyebrow={activity.category}
      title={title}
      meta={meta || activity.shortDescription}
      trailing={priceLabel}
      size={size}
      onPress={onPress}
      style={style}
    />
  );
}
