// Published content changes only when staff publish, unpublish, archive or delete something, so public
// content responses are cached in memory and the whole cache is dropped on every such change. Entries
// also expire after a minute, so changes made by another process (a second instance, the seed script)
// show up without a restart.
let version = 0;
const cache = new Map<string, { version: number; at: number; value: unknown }>();
const MAX_ENTRIES = 500;
const TTL_MS = 60_000;

export const bumpContentVersion = () => {
  version++;
  cache.clear();
};

export async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.version === version && Date.now() - hit.at < TTL_MS) return hit.value as T;
  const at = version;
  const value = await load();
  if (at === version) {
    if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value!);
    cache.set(key, { version: at, at: Date.now(), value });
  }
  return value;
}
