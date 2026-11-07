// Crops Rishabh's photo into the web headshots the site uses.
// Usage: node scripts/make-headshot.mjs "C:\path\to\photo.jpg"
//
// Boxes are fractions of the source size, tuned for IMG_1310.jpg (square
// headshot, face centred ~50% across, top of hair ~8% down). For a different
// photo, adjust the boxes and re-run.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const input = process.argv[2];
if (!input) {
  console.error('Pass the photo path: node scripts/make-headshot.mjs "<photo>"');
  process.exit(1);
}
const out = (f) => fileURLToPath(new URL(`../public/${f}`, import.meta.url));

// [left, top, width, height] as fractions of the source width/height.
const BOXES = {
  square: [0.045, 0.027, 0.906, 0.906], // head + shoulders, room above the hair
  avatar: [0.16, 0.05, 0.68, 0.68], // tighter on the face; reads well at 56–160px
  portrait: [0.115, 0.027, 0.77, 0.963], // ~4:5 for large hero placements
};

const meta = await sharp(input).rotate().metadata();
const W = meta.autoOrient?.width ?? meta.width;
const H = meta.autoOrient?.height ?? meta.height;
const box = ([l, t, w, h]) => {
  const width = Math.round(w * W);
  const height = Math.round(h * H);
  return {
    left: Math.max(0, Math.min(W - width, Math.round(l * W))),
    top: Math.max(0, Math.min(H - height, Math.round(t * H))),
    width,
    height,
  };
};

const jpeg = { quality: 84, mozjpeg: true };
const crop = (b, w, h, file) => sharp(input).rotate().extract(box(b)).resize(w, h, { fit: 'cover' }).jpeg(jpeg).toFile(out(file));

await crop(BOXES.square, 800, 800, 'rishabh-dhiman.jpg');
await crop(BOXES.avatar, 320, 320, 'rishabh-dhiman-avatar.jpg');
await crop(BOXES.portrait, 800, 1000, 'rishabh-dhiman-portrait.jpg');
console.log(`source ${W}x${H} →`, Object.fromEntries(Object.entries(BOXES).map(([k, b]) => [k, box(b)])));
