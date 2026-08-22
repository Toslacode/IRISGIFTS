#!/usr/bin/env node
/**
 * Turns the studio clip into everything the site needs.
 *
 *   npm run media
 *
 * Sources:
 *   public/video/source/opening-rings.mp4 — the shop's own film: a couple
 *     under warm bokeh, hands meeting, the ring going on. This is the
 *     opening, and the visitor scrubs it with their scroll, so it is cut
 *     into a frame sequence rather than encoded as a video.
 *   public/video/source/basket-burst.mp4 — a white bridal basket opening.
 *     No longer a video moment; it is only the quarry for the still imagery
 *     the cards use.
 *
 * The site has exactly one video moment: the opening. It is scroll-driven,
 * so the arc has to be one continuous transformation with a clear start and
 * end — which is why the window below skips the clip's head and tail.
 *
 * On quality: the source is 720p, which is the ceiling. Rather than hand the
 * browser a 720p file to upscale with bilinear filtering on a retina hero,
 * this encodes to 1080p through lanczos with a light unsharp pass, at a CRF
 * low enough that compression is not the thing softening the picture. Encodes
 * compared side by side at CRF 36 / 28 / 31@1080p / 27@1080p: the jump from
 * 720p to a sharpened 1080p was the visible one, and CRF 29 sits where extra
 * bitrate stops buying detail.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(root, 'public/video/source');
const VIDEO_OUT = join(root, 'public/video');
const STILLS_OUT = join(root, 'public/images');
const FRAMES_OUT = join(root, 'public/frames');

/* --- the opening film ---------------------------------------------------

   Two cuts of the same clip, because a 16:9 frame and a phone held upright
   want different pictures, not the same picture cropped harder. The wide cut
   keeps the whole frame, the shop's mark included; the tall cut is a 4:5
   window on the hands, which is the moment the film is about and the only
   part that survives a portrait crop anyway.

   It plays once. No loop, no scrub — the visitor watches it and moves on. */

/** Eased out to about twelve seconds. The clip runs ten, and at its own pace
    the film was over before anyone had settled into the page. */
const OPEN_SLOW = 1.22;

/** The source is 720p, which is the ceiling on detail — but not on the number
    of pixels worth shipping. A 1440-wide window on a retina display asks for
    2880 device pixels; hand the browser 1920 and it upscales by half again
    with a bilinear filter, which is the softness that reads as "low quality".
    Lanczos to 1440p with a real unsharp pass moves that work off the browser
    and costs about half a megabyte over the 1080p encode. */
const OPEN_W = 2560;
const OPEN_H = 1440;

/** The phone window: 576x720 of the source, centred on where the hands meet.
    Also puts the burned-in mark outside the frame, which a portrait crop
    would otherwise cut in half. */
const OPEN_CROP = '576:720:352:0';
const OPEN_TALL_W = 1152;
const OPEN_TALL_H = 1440;

/* --- the burned-in mark ------------------------------------------------

   The shop's mark is part of the footage, sitting in the top-right corner at
   1280x720 — the same corner the site's own header badge occupies, so the two
   read as one pile. And at that size it is being upscaled about 2.5x by the
   time it reaches a retina screen, which is what makes it look soft. Nothing
   can sharpen it; those pixels do not exist. So it is lifted out, the hole is
   patched, and it is set back down smaller and lower, where it is upscaled
   less and clears the header.

   Two boxes, not one. MARK_WIPE covers every burned-in pixel of it — disc and
   scattered stars alike — because anything left behind would read as a ghost
   beside the moved mark. MARK_LIFT is deliberately tighter: it takes the disc
   and the sparkles inside it, and lets the outer stars be patched away. The
   block carries whatever sat behind the mark at its old position, so the less
   of that background travels with it, the less there is to disagree with what
   it lands on.

   The patch works because the mark sits on the groom's dark jacket for most of
   the film: delogo interpolates from the border of its box, and across a
   low-detail dark field that reads as cloth rather than as a smear. Both boxes
   are measured off the source at 4x — the disc spans x 955..1205, y 82..342,
   loose stars reach x 912 and y 70, and the caption under it starts at y 360 —
   and MARK_WIPE keeps real margin beyond that, because delogo samples a band
   just inside its own border and a box that grazes the mark samples the mark.

   The block is masked to a soft-edged ellipse rather than dropped in as a
   rectangle — a straight edge against moving cloth crawls, a gradient across
   twenty-odd pixels does not. */
const MARK_WIPE = { x: 880, y: 52, w: 372, h: 302 };
const MARK_LIFT = { x: 930, y: 64, w: 300, h: 296 };
const MARK_SCALE = 0.8;
const MARK_TO = { x: 960, y: 121 };
const MARK_FEATHER = 0.13;

/** delogo leaves a smooth linear fill where it had texture to replace. A
    little blur across the same box turns that into something the eye reads as
    defocus, which is what the rest of that corner already is. */
const MARK_BLUR = 14;
const MARK_BLUR_FEATHER = 0.3;

/** The chain that does it, ending on the label given. */
function markChain(out) {
  const w = Math.round(MARK_LIFT.w * MARK_SCALE);
  const h = Math.round(MARK_LIFT.h * MARK_SCALE);
  const ellipse =
    `255*clip((1-hypot((X/W-0.5)*2\\,(Y/H-0.5)*2))/${MARK_FEATHER}\\,0\\,1)`;
  const rect =
    `255*clip(min(min(X\\,W-1-X)/(W*${MARK_BLUR_FEATHER})\\,` +
    `min(Y\\,H-1-Y)/(H*${MARK_BLUR_FEATHER}))\\,0\\,1)`;
  const rgba = (a) =>
    `format=rgba,geq=r='r(X\\,Y)':g='g(X\\,Y)':b='b(X\\,Y)':a='${a}'`;
  return (
    `[0:v]split=2[src][mark];` +
    `[src]delogo=x=${MARK_WIPE.x}:y=${MARK_WIPE.y}:` +
    `w=${MARK_WIPE.w}:h=${MARK_WIPE.h}[patched];` +
    `[patched]split=2[p1][p2];` +
    `[p2]crop=${MARK_WIPE.w}:${MARK_WIPE.h}:${MARK_WIPE.x}:${MARK_WIPE.y},` +
    `gblur=sigma=${MARK_BLUR},${rgba(rect)}[soft];` +
    `[p1][soft]overlay=x=${MARK_WIPE.x}:y=${MARK_WIPE.y}:format=auto[smooth];` +
    `[mark]crop=${MARK_LIFT.w}:${MARK_LIFT.h}:${MARK_LIFT.x}:${MARK_LIFT.y},` +
    `scale=${w}:${h}:flags=lanczos,${rgba(ellipse)}[small];` +
    `[smooth][small]overlay=x=${MARK_TO.x}:y=${MARK_TO.y}:format=auto[${out}]`
  );
}


/* --- the still-imagery clip's shape, in seconds ------------------------ */

/** The calm head: the basket settled, roses only just beginning to lift.
    Slowed and mirrored, this becomes the hero loop. */
const HERO_START = 0.0;
const HERO_END = 3.1;

/** How far to stretch it. Enough that the motion reads as a drift. */
const HERO_SLOW = 1.5;

/** Delivery size for the hero. The source is 720p; upscaling here with a
    good filter beats leaving it to the browser on a retina display. */
const HERO_W = 1920;
const HERO_H = 1080;

/** VP9 constant quality. Lower is better and larger. */
const HERO_CRF = 29;

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
const openingSrc = join(SOURCE, 'opening-rings.mp4');

mkdirSync(VIDEO_OUT, { recursive: true });
mkdirSync(STILLS_OUT, { recursive: true });

/* --- the opening: two cuts, both playing once -------------------------- */

if (existsSync(openingSrc)) {
  const sharpen = 'unsharp=5:5:0.5:5:5:0.0';
  const grade = 'eq=saturation=0.95:contrast=1.03';

  const ease = `setpts=${OPEN_SLOW}*PTS`;

  const cuts = [
    {
      name: 'opening-wide',
      filter: `${ease},scale=${OPEN_W}:${OPEN_H}:flags=lanczos,${sharpen},${grade}`,
      vp9: 20,
      h264: 19,
    },
    {
      name: 'opening-tall',
      filter:
        `${ease},crop=${OPEN_CROP},` +
        `scale=${OPEN_TALL_W}:${OPEN_TALL_H}:flags=lanczos,${sharpen},${grade}`,
      vp9: 24,
      h264: 21,
    },
  ];

  /* The mark is repositioned at source resolution, before anything is
     scaled up, so the patch and the block are sharpened and graded along
     with the rest of the frame instead of being pasted on afterwards. */
  const graph = (rest) => `${markChain('m')};[m]${rest}[v]`;

  for (const cut of cuts) {
    console.log(`→ opening: ${cut.name}…`);

    /* WebM first at playback time: some browsers ship no H.264 and would
       render nothing from the mp4 alone. `-an` strips the audio a muted
       autoplay has no use for. */
    run([
      '-i', openingSrc, '-an',
      '-filter_complex', graph(cut.filter), '-map', '[v]', '-r', '24',
      '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(cut.vp9),
      '-row-mt', '1', '-cpu-used', '2', '-g', '240',
      join(VIDEO_OUT, `${cut.name}.webm`),
    ]);

    /* Safari shipped VP9-in-WebM late, so the mp4 is what iPhones on older
       systems actually play — which is why the phone cut's is not an
       afterthought. */
    run([
      '-i', openingSrc, '-an',
      '-filter_complex', graph(cut.filter), '-map', '[v]', '-r', '24',
      '-c:v', 'libx264', '-crf', String(cut.h264), '-preset', 'slow',
      '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
      join(VIDEO_OUT, `${cut.name}.mp4`),
    ]);

    /* What the visitor sees before a single byte of video has arrived. */
    run([
      '-ss', '0.4', '-i', openingSrc, '-frames:v', '1', '-update', '1',
      '-filter_complex', graph(cut.filter.replace(`${ease},`, '')),
      '-map', '[v]', '-q:v', '4',
      join(VIDEO_OUT, `${cut.name}-poster.jpg`),
    ]);
  }

  /* The scroll-scrubbed sequence this replaced. */
  rmSync(FRAMES_OUT, { recursive: true, force: true });

  console.log('✓ opening: wide and tall cuts written to public/video');
} else {
  console.log(`· no opening film at ${openingSrc} — leaving public/video alone`);
}

if (!existsSync(src)) {
  console.log(`· no still-imagery clip at ${src} — nothing more to do`);
  process.exit(0);
}

const heroDuration = (HERO_END - HERO_START).toFixed(3);

/* --- hero: slowed, mirrored, seamless --------------------------------- */

console.log('→ hero: building a seamless loop from the calm head…');

/* setpts stretches it to a drift; reverse+concat makes the loop join
   invisible, so there is no cut behind the headline. The scale/unsharp pair
   is what keeps it sharp on a retina hero. -an strips the audio track, which
   a muted autoplay loop has no use for. */
const heroFilter =
  `[0:v]trim=start=${HERO_START}:duration=${heroDuration},` +
  `setpts=${HERO_SLOW}*(PTS-STARTPTS),${WARM},` +
  `scale=${HERO_W}:${HERO_H}:flags=lanczos,unsharp=5:5:0.45:5:5:0.0[f];` +
  `[f]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0[out]`;

run([
  '-i', src,
  '-filter_complex', heroFilter,
  '-map', '[out]',
  '-an',
  '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(HERO_CRF),
  '-row-mt', '1', '-cpu-used', '1',
  join(VIDEO_OUT, 'hero.webm'),
]);

/* H.264 fallback for the browsers that ship no VP9. */
run([
  '-i', src,
  '-filter_complex', heroFilter,
  '-map', '[out]',
  '-an',
  '-c:v', 'libx264', '-crf', '26', '-preset', 'slow', '-pix_fmt', 'yuv420p',
  '-profile:v', 'high', '-movflags', '+faststart',
  join(VIDEO_OUT, 'hero.mp4'),
]);

console.log('→ hero: poster frame…');
run([
  '-ss', String(HERO_START + 0.3), '-i', src,
  '-vf', `${WARM},scale=1600:-1:flags=lanczos,unsharp=5:5:0.4:5:5:0.0`,
  '-frames:v', '1', '-q:v', '5',
  join(VIDEO_OUT, 'hero-poster.jpg'),
]);

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
