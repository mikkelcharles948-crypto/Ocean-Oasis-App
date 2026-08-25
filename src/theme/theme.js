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
