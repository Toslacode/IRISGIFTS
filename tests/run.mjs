#!/usr/bin/env node
/**
 * Compiles the engine and the data it reads to plain CommonJS, rewrites the
 * `@/…` path alias to real relative requires, then runs the assertions.
 *
 * No test framework: the suite is a single script that exits non-zero on the
 * first broken invariant, which is all this needs.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const out = join(here, '.engine-build');

rmSync(out, { recursive: true, force: true });

execFileSync('npx', ['tsc', '-p', 'tsconfig.engine.json'], {
  cwd: root,
  stdio: 'inherit',
});

/* tsc emits the alias verbatim; Node cannot resolve it. */
function rewrite(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) rewrite(full);
    else if (entry.endsWith('.js')) {
      writeFileSync(full, readFileSync(full, 'utf8').replaceAll('require("@/', 'require("../'));
    }
  }
}
rewrite(out);

execFileSync('node', [join(here, 'engine.test.cjs')], { stdio: 'inherit' });
