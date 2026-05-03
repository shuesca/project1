import { readdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';

const clientDir = join(process.cwd(), 'build/client');
const maxBytes = 25 * 1024 * 1024;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }

    const info = await stat(path);
    if (info.size > maxBytes) {
      await rm(path);
      console.log(`Removed oversized Cloudflare asset: ${path} (${Math.round(info.size / 1024 / 1024)} MiB)`);
    }
  }
}

await walk(clientDir);
