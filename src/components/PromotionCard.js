import React from 'react';
import EditorialImageCard from './EditorialImageCard';

// Curated offers. `validityLabel` and `eyebrowLabel` are pre-translated
// strings the screen supplies via t() — this stays a pure presentation
// wrapper like ExperienceCard/EventCard, with no hardcoded copy of its own.
//
//   <PromotionCard promotion={localizedPromo} eyebrowLabel={t('promotions.offer')} validityLabel="Through Aug 31" onPress={...} />
export default function PromotionCard({ promotion, eyebrowLabel, validityLabel, size = 'large', onPress, style }) {
  return (
    <EditorialImageCard
      image={promotion.imageUrl ? { uri: promotion.imageUrl } : null}
      fallbackIcon="pricetag-outline"
      eyebrow={eyebrowLabel}
      title={promotion.title}
      meta={promotion.description}
      trailing={validityLabel}
      size={size}
      onPress={onPress}
      style={style}
    />
  );
}
