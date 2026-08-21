# Video

Drop your two source clips here, then run `npm run media` from the project root.

```
public/video/source/hero.mp4     ambient loop behind the headline
public/video/source/scroll.mp4   the basket opening, scrubbed on scroll
```

## What each clip needs to be

**hero.mp4** — plays behind the headline, looping and muted, forever.
Slow ambient motion, no hard cuts, no camera moves that yank attention.
Text sits on top of it, so it needs a region calm enough to read against.

**scroll.mp4** — becomes a timeline the visitor scrubs with their scroll.
It must be *one continuous transformation with a clear start and end*: the
basket closed, then opening, then its contents revealed. Loops, cuts, and
ambient drift all fail here, because scrubbing back and forth through them
reads as noise rather than as control.

Both: 6–12 seconds, 1080p or better, no burned-in text or logos, subject
roughly centred (the canvas crops to fill, so edges get eaten on wide screens).

## Until the clips exist

The site works now. The hero falls back to a lit champagne ground and the
scroll section plays a composed scene driven by the same scroll progress.
Nothing is broken and nothing needs changing when you add the footage —
`npm run media` writes `public/frames/manifest.json`, and the scroll section
switches to your footage the next time the page loads.
