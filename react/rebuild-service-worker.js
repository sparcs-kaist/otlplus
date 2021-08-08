
const FS = require('fs');

const text = FS.readFileSync('./build/service-worker.js').toString();

const start = text.indexOf('blacklist: [');
const end = text.indexOf('\n', start) - 2;

const blacklistUrls = [
  /\/session\/login/,
  /\/session\/logout/,
  /\/api\/share/,
];
// eslint-disable-next-line prefer-template
const newText = text.substring(0, end) + ',' + blacklistUrls.join(',') + text.substring(end);

FS.writeFileSync('./build/service-worker.js', newText);
