#!/usr/bin/env node
/**
 * Turns the studio clip into everything the site needs.
 *
 *   npm run media
 *
 * Source: public/video/source/basket-burst.mp4 — a white bridal basket that
 * sits packed, bursts open, and then collapses back together.
 *
 * That shape drives every decision below:
 *
 *   • The SCROLL sequence scrubs only the opening half. Running the whole clip
 *     would return the visitor to the packed basket at 100% scroll, so the
 *     scroll would read as "nothing happened". We stop at the widest spread.
 *
 *   • The static head of the clip is trimmed off the scroll range too — a
 *     quarter of the runway with no visible change feels broken.
 *
 *   • The HERO reuses that same calm head, slowed and mirrored, so it loops
 *     seamlessly behind the headline instead of cutting.
 *
 * Adjust the four constants below if the footage is ever recut.
 */

import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(root, 'public/video/source');
const VIDEO_OUT = join(root, 'public/video');
const FRAMES_OUT = join(root, 'public/frames');
const STILLS_OUT = join(root, 'public/images');

/* --- the clip's shape, in seconds ------------------------------------- */

/** The calm head: basket packed, breathing. Becomes the hero loop. */
const HERO_START = 0.0;
const HERO_END = 2.25;

/** The opening: from just before motion starts to the widest spread. */
const SCROLL_START = 1.15;
const SCROLL_END = 8.35;

/** Frames per second for the scroll sequence. Lower this before lowering
    quality if the sequence gets heavy — scroll rarely outruns 15fps. */
const FPS = 15;

/** The footage is a cool studio white; the site is warm ivory. This pulls it
    into the palette so it does not read as clinical against the cream. */
const WARM =
  'colortemperature=temperature=4700:mix=0.85,' +
  'eq=saturation=0.96:contrast=1.03:brightness=0.02';

/* ---------------------------------------------------------------------- */

function findFfmpeg() {
  const bundled = join(root, 'node_modules/ffmpeg-static/ffmpeg');
  if (existsSync(bundled)) return bundled;
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return 'ffmpeg';
  } catch {
    return null;
  }
}

const ffmpeg = findFfmpeg();

if (!ffmpeg) {
  console.error(
    '\nffmpeg not found.\n' +
      'Install it once with:  npm i -D ffmpeg-static\n' +
      'then run this script again.\n'
  );
  process.exit(1);
}

const run = (args) =>
  execFileSync(ffmpeg, ['-v', 'error', '-y', ...args], { stdio: 'inherit' });

const src = join(SOURCE, 'basket-burst.mp4');

if (!existsSync(src)) {
  console.log(`· no source clip at ${src}`);
  console.log('  The site falls back to its composed scroll scene.');
  process.exit(0);
}

mkdirSync(VIDEO_OUT, { recursive: true });
mkdirSync(STILLS_OUT, { recursive: true });

const heroDuration = (HERO_END - HERO_START).toFixed(3);

/* --- hero: slowed, mirrored, seamless --------------------------------- */

console.log('→ hero: building a seamless loop from the calm head…');

/* setpts stretches it to a drift; reverse+concat makes the loop join
   invisible, so there is no cut behind the headline. -an strips the audio
   track, which a muted autoplay loop has no use for. */
const heroFilter =
  `[0:v]trim=start=${HERO_START}:duration=${heroDuration},setpts=1.9*(PTS-STARTPTS),${WARM}[f];` +
  `[f]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0[out]`;

run([
  '-i', src,
  '-filter_complex', heroFilter,
  '-map', '[out]',
  '-an',
  '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', '-cpu-used', '4',
  join(VIDEO_OUT, 'hero.webm'),
]);

run([
  '-i', src,
  '-filter_complex', heroFilter,
  '-map', '[out]',
  '-an',
  '-c:v', 'libx264', '-crf', '25', '-preset', 'slow', '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  join(VIDEO_OUT, 'hero.mp4'),
]);

console.log('→ hero: poster frame…');
run([
  '-ss', String(HERO_START + 0.4), '-i', src,
  '-vf', WARM, '-frames:v', '1', '-q:v', '3',
  join(VIDEO_OUT, 'hero-poster.jpg'),
]);

/* --- scroll sequence --------------------------------------------------- */

console.log('→ scroll: extracting frames at source resolution…');

rmSync(FRAMES_OUT, { recursive: true, force: true });
mkdirSync(FRAMES_OUT, { recursive: true });

/* No scale filter, deliberately: downscaling here is the single biggest
   cause of a blurry scroll section and cannot be undone later. */
run([
  '-ss', String(SCROLL_START),
  '-to', String(SCROLL_END),
  '-i', src,
  '-vf', `fps=${FPS},${WARM}`,
  '-c:v', 'libwebp', '-quality', '74', '-compression_level', '5',
  '-start_number', '0',
  join(FRAMES_OUT, 'frame-%03d.webp'),
]);

const frames = readdirSync(FRAMES_OUT).filter((f) => f.endsWith('.webp'));
const count = frames.length;
const bytes = frames.reduce(
  (sum, f) => sum + statSync(join(FRAMES_OUT, f)).size,
  0
);

writeFileSync(
  join(FRAMES_OUT, 'manifest.json'),
  `${JSON.stringify(
    { count, pattern: '/frames/frame-{i}.webp', fps: FPS },
    null,
    2
  )}\n`
);

console.log(
  `✓ ${count} frames, ${(bytes / 1024 / 1024).toFixed(1)} MB total`
);

if (count < 60) {
  console.warn(`! only ${count} frames — the sequence will feel steppy.`);
}
if (bytes > 7 * 1024 * 1024) {
  console.warn(`! heavy to download. Lower FPS or quality in this script.`);
}

/* --- stills for the cards --------------------------------------------- */

/* The store has no product photography yet, so the editorial imagery comes
   from this same clip at varied timestamps and crops. Crop rectangles must
   fit inside 1280x720. */
const stills = [
  /* Basket and section imagery — wide crops that read at card size. */
  { name: 'basket-bride-luxury', ss: 0.9, crop: '720:540:280:90' },
  { name: 'basket-bride-soft', ss: 7.6, crop: '760:570:260:80' },
  { name: 'story-bride', ss: 5.4, crop: '860:645:210:50' },
  { name: 'basket-shabbat-hatan', ss: 3.1, crop: '700:525:290:110' },
  { name: 'hero-still', ss: 1.0, crop: '1280:720:0:0' },

  /* Inspiration cards on the home page. Six moments and six framings from
     the same clip, chosen so they read as six photographs rather than one
     basket repeated. 4:5 portrait, all inside the 1280x720 source. */
  { name: 'inspiration-1', ss: 0.9, crop: '560:700:360:10', portrait: true },
  { name: 'inspiration-2', ss: 7.0, crop: '560:700:330:10', portrait: true },
  { name: 'inspiration-3', ss: 5.2, crop: '520:650:60:60', portrait: true },
  { name: 'inspiration-4', ss: 3.1, crop: '480:600:400:60', portrait: true },
  { name: 'inspiration-5', ss: 6.3, crop: '520:650:700:40', portrait: true },
  { name: 'inspiration-6', ss: 8.6, crop: '600:720:340:0', portrait: true },

  /* Style cards — one crop each, chosen for mood rather than subject. */
  { name: 'style-clean', ss: 2.0, crop: '600:450:340:150' },
  { name: 'style-luxury', ss: 6.4, crop: '620:465:330:130' },
  { name: 'style-romantic', ss: 7.0, crop: '380:380:390:140' },
  { name: 'style-pampering', ss: 6.6, crop: '360:360:110:210' },

];

console.log('→ stills: cropping editorial imagery from the same clip…');

for (const { name, ss, crop, square, portrait } of stills) {
  run([
    '-ss', String(ss), '-i', src,
    '-frames:v', '1',
    '-vf', `crop=${crop},scale=${square ? '640:640' : portrait ? '760:950' : '1100:-1'},${WARM}`,
    '-c:v', 'libwebp', '-quality', '82',
    join(STILLS_OUT, square ? `../products/${name}.webp` : `${name}.webp`),
  ]);
}

console.log(`✓ ${stills.length} stills written to public/images`);
console.log('\nDone.');
