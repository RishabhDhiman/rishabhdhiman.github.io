// Renders the social share image and PNG icons into public/.
// Run `npm run og` after changing the name or job title.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const out = (f) => fileURLToPath(new URL(`../public/${f}`, import.meta.url));
const FONT = "Segoe UI, Inter, Helvetica, Arial, sans-serif";
const AVATAR = out('rishabh-dhiman-avatar.jpg');

/** The avatar photo cropped to a circle, as a PNG buffer for compositing. */
const circle = async (size) =>
  sharp(AVATAR)
    .resize(size, size)
    .composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`), blend: 'dest-in' }])
    .png()
    .toBuffer();

const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f7f6f2"/>
  <rect x="0" y="0" width="14" height="630" fill="#17734a"/>
  <g font-family="${FONT}">
    <circle cx="955" cy="275" r="172" fill="#17734a"/>
    <text x="96" y="150" font-size="28" font-weight="600" fill="#17734a" letter-spacing="3">I BUILD THE APPS INDIA SHOPS &amp; PAYS WITH</text>
    <text x="96" y="300" font-size="92" font-weight="700" fill="#141614" letter-spacing="-3.5">Rishabh</text>
    <text x="96" y="392" font-size="92" font-weight="700" fill="#141614" letter-spacing="-3.5">Dhiman</text>
    <text x="96" y="460" font-size="40" font-weight="600" fill="#17734a" letter-spacing="-1">Senior Android Engineer</text>
    <text x="96" y="534" font-size="30" fill="#4a4f4a">Nykaa · ex-Paytm · Payments &amp; e-commerce</text>
    <text x="1104" y="534" text-anchor="end" font-size="30" font-weight="600" fill="#141614">rishabhdhiman.com</text>
  </g>
</svg>`;

// Home-screen icons need more pixels than the 320px avatar, so cut the same
// face crop out of the 800px headshot (the avatar box from make-headshot.mjs,
// expressed inside the square box: about 600px at left 102, top 20).
const FACE = await sharp(out('rishabh-dhiman.jpg')).extract({ left: 102, top: 20, width: 600, height: 600 }).toBuffer();

/** The face crop as a full square (iOS and Android round the corners themselves). */
const square = (size) => sharp(FACE).resize(size, size).png({ palette: true, quality: 92, effort: 10, dither: 0.6 });

/** Packs PNG buffers into a .ico file (PNG-in-ICO, supported by every current browser). */
function ico(pngs) {
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ size, buf }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(buf.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += buf.length;
  });
  return Buffer.concat([header, ...pngs.map((p) => p.buf)]);
}

// One share card per blog post, so a LinkedIn/WhatsApp share shows the post
// title instead of the generic card. Rendered locally (not on the CI server,
// which may lack fonts) and committed under public/og/writing/.
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function wrap(text, max = 26) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}
const postCard = (title, tag) => {
  const lines = wrap(title);
  const size = lines.length > 3 ? 64 : 76;
  const startY = 300 - ((lines.length - 1) * size * 1.12) / 2;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#141614"/>
  <rect x="0" y="0" width="14" height="630" fill="#6fd39c"/>
  <g font-family="${FONT}">
    <text x="96" y="120" font-size="26" font-weight="600" fill="#6fd39c" letter-spacing="3">${esc(tag.toUpperCase())}</text>
    ${lines
      .map((l, i) => `<text x="96" y="${startY + i * size * 1.12}" font-size="${size}" font-weight="700" fill="#f7f6f2" letter-spacing="-2">${esc(l)}</text>`)
      .join('\n    ')}
    <circle cx="124" cy="534" r="31" fill="#6fd39c"/>
    <text x="170" y="526" font-size="28" font-weight="600" fill="#f7f6f2">Rishabh Dhiman</text>
    <text x="170" y="560" font-size="22" fill="#b4bab2">Senior Android Engineer</text>
    <text x="1104" y="545" text-anchor="end" font-size="26" fill="#b4bab2">rishabhdhiman.com</text>
  </g>
</svg>`;
};

const postsDir = fileURLToPath(new URL('../src/content/writing/', import.meta.url));
mkdirSync(out('og/writing'), { recursive: true });
for (const file of readdirSync(postsDir).filter((f) => f.endsWith('.md'))) {
  const src = readFileSync(postsDir + file, 'utf8');
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(src)?.[1] ?? '';
  const title = /^title:\s*['"]?(.*?)['"]?\s*$/m.exec(fm)?.[1] ?? file;
  const tag = /^tags:\s*\[\s*['"]?([^'",\]]+)/m.exec(fm)?.[1] ?? 'writing';
  const slug = file.replace(/\.md$/, '');
  await sharp(Buffer.from(postCard(title, tag)))
    .composite([{ input: await circle(56), left: 96, top: 506 }])
    .png({ compressionLevel: 9 })
    .toFile(out(`og/writing/${slug}.png`));
}

await sharp(Buffer.from(og))
  .composite([{ input: await circle(330), left: 790, top: 110 }])
  .png({ compressionLevel: 9 })
  .toFile(out('og.png'));
// Icons use the headshot: round for browser tabs and search results,
// square for home-screen icons.
await square(180).png().toFile(out('apple-touch-icon.png'));
await square(192).png().toFile(out('icon-192.png'));
await square(512).png().toFile(out('icon-512.png'));
writeFileSync(out('favicon-32.png'), await circle(32));
writeFileSync(out('favicon-96.png'), await circle(96));
writeFileSync(
  out('favicon.ico'),
  ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, buf: await circle(size) })))),
);
console.log('Generated og.png and icons in public/');
