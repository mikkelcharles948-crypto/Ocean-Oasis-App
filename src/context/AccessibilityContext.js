import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backs AccessibilityScreen's Text Size / Bold Text / High Contrast toggles
// for real. Making these actually change anything app-wide is harder than
// it looks: every screen's styles come from StyleSheet.create({...}) objects
// built once at module load from the static `colors`/`typography` exports in
// theme.js — mutating those later doesn't reach styles already created from
// them. The only way to make a runtime-toggleable preference reach text
// that's already styled that way, without rewriting every screen's styles
// to read from a theme hook, is to intercept at the Text/TextInput
// component itself — see components/AppText.js and AppTextInput.js, which
// read this context and apply the adjustment on top of whatever style the
// screen already passed in.
const AccessibilityContext = createContext({
  textSize: 'Standard',
  boldText: false,
  highContrast: false,
  setTextSize: () => {},
  setBoldText: () => {},
  setHighContrast: () => {},
});

export const TEXT_SIZE_SCALE = { Standard: 1, Large: 1.15, 'Extra Large': 1.3 };

const STORAGE_KEY = 'oo_accessibility_prefs';

export function AccessibilityProvider({ children }) {
  const [textSize, setTextSizeState] = useState('Standard');
  const [boldText, setBoldTextState] = useState(false);
  const [highContrast, setHighContrastState] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const saved = JSON.parse(raw);
        if (saved.textSize) setTextSizeState(saved.textSize);
        if (typeof saved.boldText === 'boolean') setBoldTextState(saved.boldText);
        if (typeof saved.highContrast === 'boolean') setHighContrastState(saved.highContrast);
      } catch (e) {
        // Ignore corrupt storage — defaults already apply.
      }
    });
  }, []);

  const persist = useCallback((next) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setTextSize = useCallback((value) => {
    setTextSizeState(value);
    persist({ textSize: value, boldText, highContrast });
  }, [boldText, highContrast, persist]);

  const setBoldText = useCallback((value) => {
    setBoldTextState(value);
    persist({ textSize, boldText: value, highContrast });
  }, [textSize, highContrast, persist]);

  const setHighContrast = useCallback((value) => {
    setHighContrastState(value);
    persist({ textSize, boldText, highContrast: value });
  }, [textSize, boldText, persist]);

  const value = useMemo(
    () => ({ textSize, boldText, highContrast, setTextSize, setBoldText, setHighContrast }),
    [textSize, boldText, highContrast, setTextSize, setBoldText, setHighContrast]
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibilityPrefs() {
  return useContext(AccessibilityContext);
}
