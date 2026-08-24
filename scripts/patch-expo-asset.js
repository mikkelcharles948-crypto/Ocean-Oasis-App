const fs = require('fs');
const path = require('path');

const packageRoot = path.join(__dirname, '..', 'node_modules', 'expo-asset');
const immutableMarker = 'const withoutQueryOrFragment = normalizedUrl.split(/[?#]/, 1)[0];';

function patchFile(file, isTypeScript) {
  if (!fs.existsSync(file)) return;
  let source = fs.readFileSync(file, 'utf8');
  if (source.includes(immutableMarker)) return;

  const block = isTypeScript
    ? /  urlObject\.protocol = nextProtocol;[\s\S]*?  return urlObject\.protocol !== nextProtocol\n    \? urlObject\.href\.replace\(urlObject\.protocol, nextProtocol\)\n    : urlObject\.href;/
    : /    urlObject\.protocol = nextProtocol;[\s\S]*?    return urlObject\.protocol !== nextProtocol\n        \? urlObject\.href\.replace\(urlObject\.protocol, nextProtocol\)\n        : urlObject\.href;/;
  const replacement = isTypeScript
    ? `  const normalizedUrl = urlObject.href.replace(urlObject.protocol, nextProtocol);\n  ${immutableMarker}\n  return withoutQueryOrFragment.substring(0, withoutQueryOrFragment.lastIndexOf('/') + 1);`
    : `    const normalizedUrl = urlObject.href.replace(urlObject.protocol, nextProtocol);\n    ${immutableMarker}\n    return withoutQueryOrFragment.substring(0, withoutQueryOrFragment.lastIndexOf('/') + 1);`;

  if (!block.test(source)) throw new Error(`Unable to locate expo-asset URL helper in ${file}`);
  fs.writeFileSync(file, source.replace(block, replacement));
}

patchFile(path.join(packageRoot, 'build', 'AssetUris.js'), false);
patchFile(path.join(packageRoot, 'src', 'AssetUris.ts'), true);
