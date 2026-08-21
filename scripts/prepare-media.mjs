#!/usr/bin/env node
/**
 * Turns two source clips into everything the site needs.
 *
 *   1. Put your clips in public/video/source/ as hero.mp4 and scroll.mp4
 *   2. Run: npm run media
 *
 * Produces:
 *   public/video/hero.webm      ambient loop (WebM first — some browsers
 *   public/video/hero.mp4       ship no H.264 and would render nothing)
 *   public/video/hero-poster.jpg
 *   public/frames/frame-000.webp … the scroll-scrubbed sequence
 *   public/frames/manifest.json  read at runtime to switch renderers
 *
 * Frames are extracted at the source's own resolution. Downscaling here is
 * the single biggest cause of a blurry scroll section and cannot be undone.
 */

import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(root, 'public/video/source');
const VIDEO_OUT = join(root, 'public/video');
const FRAMES_OUT = join(root, 'public/frames');

/** Frames per second for the scroll sequence. Lower this before lowering
    quality if the sequence gets too heavy — scroll rarely outruns 12fps. */
const FPS = 12;

function findFfmpeg() {
  try {
    const mod = join(root, 'node_modules/ffmpeg-static/ffmpeg');
    if (existsSync(mod)) return mod;
  } catch {
    /* fall through */
  }
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

function run(args) {
  execFileSync(ffmpeg, ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
}

const heroSrc = join(SOURCE, 'hero.mp4');
const scrollSrc = join(SOURCE, 'scroll.mp4');

mkdirSync(VIDEO_OUT, { recursive: true });

/* ---- hero ------------------------------------------------------------- */
if (existsSync(heroSrc)) {
  console.log('→ hero: encoding WebM…');
  run([
    '-i', heroSrc,
    '-an',
    '-c:v', 'libvpx-vp9',
    '-b:v', '0',
    '-crf', '34',
    '-row-mt', '1',
    '-cpu-used', '4',
    join(VIDEO_OUT, 'hero.webm'),
  ]);

  console.log('→ hero: copying mp4 fallback…');
  run(['-i', heroSrc, '-an', '-c:v', 'copy', join(VIDEO_OUT, 'hero.mp4')]);

  console.log('→ hero: poster frame…');
  run([
    '-ss', '0.5',
    '-i', heroSrc,
    '-frames:v', '1',
    '-q:v', '3',
    join(VIDEO_OUT, 'hero-poster.jpg'),
  ]);
} else {
  console.log(`· skipping hero — no file at ${heroSrc}`);
}

/* ---- scroll sequence -------------------------------------------------- */
if (existsSync(scrollSrc)) {
  console.log('→ scroll: extracting frames at source resolution…');
  rmSync(FRAMES_OUT, { recursive: true, force: true });
  mkdirSync(FRAMES_OUT, { recursive: true });

  run([
    '-i', scrollSrc,
    /* No scale filter, deliberately. */
    '-vf', `fps=${FPS}`,
    '-c:v', 'libwebp',
    '-quality', '76',
    '-start_number', '0',
    join(FRAMES_OUT, 'frame-%03d.webp'),
  ]);

  const count = readdirSync(FRAMES_OUT).filter((f) =>
    f.endsWith('.webp')
  ).length;

  writeFileSync(
    join(FRAMES_OUT, 'manifest.json'),
    `${JSON.stringify({ count, pattern: '/frames/frame-{i}.webp', fps: FPS }, null, 2)}\n`
  );

  console.log(`✓ ${count} frames written. The scroll section will use them.`);

  if (count < 60) {
    console.warn(
      `! only ${count} frames — the sequence will feel steppy. Use a longer clip or raise FPS.`
    );
  }
  if (count > 200) {
    console.warn(
      `! ${count} frames is heavy to download. Lower FPS in this script.`
    );
  }
} else {
  console.log(`· skipping scroll sequence — no file at ${scrollSrc}`);
  console.log('  The site falls back to its composed scroll scene.');
}

console.log('\nDone.');
