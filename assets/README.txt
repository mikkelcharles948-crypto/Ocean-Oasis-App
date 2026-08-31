logo.png — official Ocean Oasis, Dominica logo (circular wave emblem + wordmark).
Used by src/components/Logo.js via require('../../assets/logo.png').

logo-mark.png — the circular wave emblem alone, transparent background,
744x755. Re-extracted (via a pngjs crop + navy-distance alpha mask) from
the same 1254x1254 source the user supplied for icon-square.png, replacing
a 110x90 crop of the same mark that read as blurry once rendered above
~90px on a high-DPI screen (upscaling a 110px source past its native
resolution). Kept in the same teal as the original mark (colors.
turquoiseDark) rather than white, since Logo.js's tab-bar usage relies on
that color directly — the `light` prop (Home's hero) tints it white on
top of this regardless of the base color.

icon-square.png — app.json's icon/adaptiveIcon source (1254x1254). Final
brand art supplied directly, not a placeholder — squared off with a pngjs
script that replaced the image's baked-in rounded-corner/black letterboxing
with its own navy background color, since iOS/Android apply their own
corner-rounding mask and expect a full-bleed square with sharp corners, not
one that's already rounded.
