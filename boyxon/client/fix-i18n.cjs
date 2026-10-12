const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(__dirname, 'src', 'locales');
// i18next '{{var}}' sintaksis kutadi, lekin JSON'larda '{var}' yozilgan -
// shu sababli interfeysda "{count} ta", "{code}" kabi xom matnlar chiqadi.
for (const f of ['uz.json', 'ru.json', 'en.json']) {
  const p = path.join(dir, f);
  const raw = fs.readFileSync(p, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const json = JSON.parse(raw);
  let n = 0;
  for (const [k, v] of Object.entries(json)) {
    if (typeof v !== 'string') continue;
    const nv = v.replace(/(?<!\{)\{([A-Za-z_][A-Za-z0-9_]*)\}(?!\})/g, '{{$1}}');
    if (nv !== v) { json[k] = nv; n++; }
  }
  fs.writeFileSync(p, JSON.stringify(json, null, 2).split('\n').join(eol) + eol, 'utf8');
  console.log(f + ': fixed ' + n);
}
