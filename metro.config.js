const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// supabase/functions/** contains Deno Edge Function source (TypeScript) that
// runs server-side on Supabase, never bundled into the app — excluding it
// stops Metro from treating the project as a TypeScript RN app and demanding
// typescript/@types/react be installed just because a .ts file exists
// somewhere in the repo.
config.resolver.blockList = [/supabase\/functions\/.*/];

module.exports = config;
