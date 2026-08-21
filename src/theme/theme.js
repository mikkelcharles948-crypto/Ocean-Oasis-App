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
};
