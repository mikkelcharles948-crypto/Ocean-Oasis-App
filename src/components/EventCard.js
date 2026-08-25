import React from 'react';
import EditorialImageCard from './EditorialImageCard';

const CATEGORY_ICON = {
  Dining: 'restaurant-outline',
  Food: 'restaurant-outline',
  Adventure: 'trail-sign-outline',
  Entertainment: 'musical-notes-outline',
  Wellness: 'leaf-outline',
  Culture: 'color-palette-outline',
  Festival: 'sparkles-outline',
};

// Hotel happenings and island-wide festivals. Most events in this app
// don't have photography yet (see the audit's asset-organization notes),
// so EditorialImageCard's icon fallback carries the card until real
// images exist for imageUrl — no stock photography substituted here.
//
//   <EventCard event={localizedEvent} onPress={...} />
export default function EventCard({ event, size = 'medium', onPress, style }) {
  const meta = [event.date, event.time].filter(Boolean).join(' · ');
  return (
    <EditorialImageCard
      image={event.imageUrl ? { uri: event.imageUrl } : null}
      fallbackIcon={CATEGORY_ICON[event.category] || 'calendar-outline'}
      eyebrow={event.category}
      title={event.title}
      meta={meta}
      trailing={event.location}
      size={size}
      onPress={onPress}
      style={style}
    />
  );
}
