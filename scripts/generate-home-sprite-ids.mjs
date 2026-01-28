#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const getArg = (flag, fallback) => {
  const index = args.indexOf(flag);
  if (index === -1) {
    return fallback;
  }
  const value = args[index + 1];
  return value ?? fallback;
};

const outPath = path.resolve(process.cwd(), getArg('--out', 'frontend/src/utils/pokemonHomeSpriteIds.json'));
const missingPath = getArg('--missing', '');
const concurrency = Number(getArg('--concurrency', '12'));
const limitArg = getArg('--limit', '');
const limit = limitArg ? Number(limitArg) : 100000;

if (!Number.isFinite(concurrency) || concurrency < 1) {
  console.error('Invalid --concurrency value.');
  process.exit(1);
}

if (!Number.isFinite(limit) || limit < 1) {
  console.error('Invalid --limit value.');
  process.exit(1);
}

const listUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=0`;

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}`);
  }
  return response.json();
};

const extractSpriteId = (spriteUrl, fallbackId) => {
  if (!spriteUrl) {
    return null;
  }
  const match = spriteUrl.match(/\/(\\d+)\\.png$/);
  if (match) {
    return Number(match[1]);
  }
  return typeof fallbackId === 'number' ? fallbackId : null;
};

const main = async () => {
  console.log(`Fetching Pokemon list from ${listUrl}`);
  const listData = await fetchJson(listUrl);
  const entries = Array.isArray(listData.results) ? listData.results : [];

  if (entries.length === 0) {
    console.error('No Pokemon entries returned from PokeAPI.');
    process.exit(1);
  }

  console.log(`Found ${entries.length} entries. Fetching sprites with concurrency=${concurrency}...`);

  const results = {};
  const missing = [];
  let index = 0;

  const worker = async () => {
    while (true) {
      const current = index;
      index += 1;
      if (current >= entries.length) {
        break;
      }

      const entry = entries[current];
      try {
        const data = await fetchJson(entry.url);
        const spriteUrl = data?.sprites?.other?.home?.front_default ?? null;
        const spriteId = extractSpriteId(spriteUrl, data?.id);

        if (!spriteId) {
          missing.push({
            name: entry.name,
            id: typeof data?.id === 'number' ? data.id : null,
            spriteUrl,
          });
          continue;
        }

        results[entry.name] = spriteId;
      } catch (error) {
        missing.push({
          name: entry.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  };

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const sortedResults = Object.keys(results)
    .sort()
    .reduce((acc, name) => {
      acc[name] = results[name];
      return acc;
    }, {});

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(sortedResults, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${Object.keys(sortedResults).length} entries to ${outPath}`);

  if (missingPath) {
    const resolvedMissing = path.resolve(process.cwd(), missingPath);
    await fs.mkdir(path.dirname(resolvedMissing), { recursive: true });
    await fs.writeFile(resolvedMissing, `${JSON.stringify(missing, null, 2)}\n`, 'utf8');
    console.log(`Wrote ${missing.length} missing entries to ${resolvedMissing}`);
  } else if (missing.length > 0) {
    console.warn(`Missing sprites for ${missing.length} entries (use --missing to save details).`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
