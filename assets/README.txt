logo.png — official Ocean Oasis, Dominica logo (circular wave emblem + wordmark).
Used by src/components/Logo.js via require('../../assets/logo.png').

icon-square.png — app.json's icon/adaptiveIcon source (1254x1254). Final
brand art supplied directly, not a placeholder — squared off with a pngjs
script that replaced the image's baked-in rounded-corner/black letterboxing
with its own navy background color, since iOS/Android apply their own
corner-rounding mask and expect a full-bleed square with sharp corners, not
one that's already rounded.
