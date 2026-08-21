const fs = require('fs');
const path = require('path');

const packageRoot = path.join(__dirname, '..', 'node_modules', 'expo-asset');
const replacements = [
  {
    file: path.join(packageRoot, 'build', 'AssetUris.js'),
    before: `    urlObject.protocol = nextProtocol;\n    // Trim filename, query parameters, and fragment\n    const directory = urlObject.pathname.substring(0, urlObject.pathname.lastIndexOf('/') + 1);\n    urlObject.pathname = directory;\n    urlObject.search = '';\n    urlObject.hash = '';\n`,
    after: `    const normalizedUrl = urlObject.href.replace(urlObject.protocol, nextProtocol);\n    const normalizedUrlObject = new URL(normalizedUrl);\n    // Trim filename, query parameters, and fragment\n    const directory = normalizedUrlObject.pathname.substring(0, normalizedUrlObject.pathname.lastIndexOf('/') + 1);\n    normalizedUrlObject.pathname = directory;\n    normalizedUrlObject.search = '';\n    normalizedUrlObject.hash = '';\n`,
    tailBefore: `    return urlObject.protocol !== nextProtocol\n        ? urlObject.href.replace(urlObject.protocol, nextProtocol)\n        : urlObject.href;`,
    tailAfter: `    return normalizedUrlObject.href;`,
  },
  {
    file: path.join(packageRoot, 'src', 'AssetUris.ts'),
    before: `  urlObject.protocol = nextProtocol;\n\n  // Trim filename, query parameters, and fragment, if any\n  const directory = urlObject.pathname.substring(0, urlObject.pathname.lastIndexOf('/') + 1);\n  urlObject.pathname = directory;\n  urlObject.search = '';\n  urlObject.hash = '';\n`,
    after: `  const normalizedUrl = urlObject.href.replace(urlObject.protocol, nextProtocol);\n  const normalizedUrlObject = new URL(normalizedUrl);\n\n  // Trim filename, query parameters, and fragment, if any\n  const directory = normalizedUrlObject.pathname.substring(\n    0,\n    normalizedUrlObject.pathname.lastIndexOf('/') + 1\n  );\n  normalizedUrlObject.pathname = directory;\n  normalizedUrlObject.search = '';\n  normalizedUrlObject.hash = '';\n`,
    tailBefore: `  return urlObject.protocol !== nextProtocol\n    ? urlObject.href.replace(urlObject.protocol, nextProtocol)\n    : urlObject.href;`,
    tailAfter: `  return normalizedUrlObject.href;`,
  },
];

for (const replacement of replacements) {
  if (!fs.existsSync(replacement.file)) {
    continue;
  }

  let source = fs.readFileSync(replacement.file, 'utf8');
  if (source.includes('const withoutQueryOrFragment = normalizedUrl.split(/[?#]/, 1)[0];')) {
    continue;
  }
  if (!source.includes(replacement.before) || !source.includes(replacement.tailBefore)) {
    throw new Error(`Unexpected expo-asset source format: ${replacement.file}`);
  }

  source = source.replace(replacement.before, replacement.after);
  source = source.replace(replacement.tailBefore, replacement.tailAfter);
  fs.writeFileSync(replacement.file, source);
}
