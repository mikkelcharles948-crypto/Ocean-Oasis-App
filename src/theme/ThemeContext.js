import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { colors as baseColors, gradients as baseGradients } from './theme';

const ThemeContext = createContext(null);

// Makes a hotel's brand colors (hotels.theme.colors, set from the Platform
// Admin Hotels screen) actually reactive across the app, not just stored
// data. theme.js's `colors`/`gradients` stay as the default palette and the
// fallback everywhere nothing else has loaded yet (matches today's Ocean
// Oasis look with zero behavior change) — this context layers a per-hotel
// override on top for the components that read it via useTheme() instead
// of importing colors directly.
//
// Scope note: only the highest-leverage shared chrome (Logo, Button,
// tab bars) has been retrofitted to consume this so far — most individual
// screens still import the static `colors` from theme.js directly for
// their card/chip/text colors. A full per-screen retrofit is a much larger,
// separate pass; this is deliberately the 80/20 slice that makes a hotel's
// brand color genuinely visible end to end (buttons, tab bars, the logo)
// without touching every screen in the app.
export function ThemeProvider({ children }) {
  const [hotelColors, setHotelColors] = useState(null);

  const applyHotelTheme = useCallback((theme) => {
    setHotelColors(theme?.colors && Object.keys(theme.colors).length ? theme.colors : null);
  }, []);

  const colors = useMemo(
    () => (hotelColors ? { ...baseColors, ...hotelColors } : baseColors),
    [hotelColors]
  );

  // gradients in theme.js are computed from colors at module-load time
  // (arrays of resolved hex strings, not live references) — recompute the
  // ones actually built from overridable colors so they follow suit.
  const gradients = useMemo(
    () => ({
      ...baseGradients,
      ocean: [colors.deepOcean, colors.turquoiseDark],
      deep: [colors.deepOcean2, colors.deepOceanLight],
      forestTurquoise: [colors.forest, colors.turquoise],
      gold: [colors.gold, colors.goldSoft],
    }),
    [colors]
  );

  const value = useMemo(() => ({ colors, gradients, applyHotelTheme }), [colors, gradients, applyHotelTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
