import { Platform } from 'react-native';

export const colors = {
  deepOcean: '#0B3B45',
  deepOcean2: '#092E37',
  deepOceanLight: '#134B57',
  turquoise: '#2FB8B0',
  turquoiseDark: '#1E938C',
  forest: '#2E5E45',
  sand: '#E9DCC3',
  sandLight: '#F4ECDC',
  ivory: '#FBF8F2',
  gold: '#C6A25D',
  goldSoft: '#DCC48E',
  // A darker gold for text set directly on ivory/white (colors.gold itself
  // is ~2.4:1 against white — fails WCAG AA; this reaches ~4.9:1). Use this,
  // not colors.gold, for gold-toned text/labels that aren't sitting over a
  // photo with a dark scrim behind them.
  goldDark: '#8A6C25',
  charcoal: '#22302F',
  slate: '#5C6B6A',
  white: '#FFFFFF',
  error: '#B5462F',
  success: '#3C7A5C',
  overlay: 'rgba(9,46,55,0.55)',
  border: '#E4DCC9',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 30,
  pill: 999,
};

export const font = {
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
};

// A named type scale, so new screens reach for `typography.heading` instead
// of picking an arbitrary fontSize/lineHeight pair by eye. Existing screens
// are untouched — this is additive, for new editorial-pass work to build
// on — but any of these objects can be spread directly into a Text style:
//   <Text style={[typography.heading, { color: colors.ivory }]}>
export const typography = {
  hero: { fontFamily: font.display, fontSize: 42, lineHeight: 46, fontWeight: '600', letterSpacing: 0.2 },
  display: { fontFamily: font.display, fontSize: 30, lineHeight: 36, fontWeight: '600', letterSpacing: 0.1 },
  heading: { fontFamily: font.display, fontSize: 22, lineHeight: 27, fontWeight: '600' },
  subheading: { fontFamily: font.body, fontSize: 17, lineHeight: 23, fontWeight: '600' },
  body: { fontFamily: font.body, fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodySmall: { fontFamily: font.body, fontSize: 13, lineHeight: 19, fontWeight: '400' },
  caption: { fontFamily: font.body, fontSize: 12, lineHeight: 16, fontWeight: '500' },
  // Small uppercase eyebrow/label text — tracked out for an editorial feel.
  label: { fontFamily: font.body, fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase' },
};

export const shadow = {
  soft: {
    shadowColor: '#0B3B45',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  card: {
    shadowColor: '#0B3B45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  // A slightly more pronounced lift for hero imagery / photo cards, so they
  // read as floating above the ivory background rather than flat.
  float: {
    shadowColor: '#0B3B45',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 7,
  },
};

// Named gradient pairs, used with intention rather than reused flatly:
// `ocean` for primary hero/stay chrome, `gold` for premium & promotional
// moments, `deep` for darker immersive backdrops, `scrim` to lay a soft
// legibility wash under text/controls placed over a photo.
export const gradients = {
  ocean: [colors.deepOcean, colors.turquoiseDark],
  deep: [colors.deepOcean2, colors.deepOceanLight],
  forestTurquoise: [colors.forest, colors.turquoise],
  gold: [colors.gold, colors.goldSoft],
  success: [colors.success, '#5AA37E'],
  scrim: ['rgba(9,46,55,0)', 'rgba(9,46,55,0.55)'],
};
