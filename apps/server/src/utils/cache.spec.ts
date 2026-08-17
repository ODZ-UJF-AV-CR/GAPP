import { describe, expect, it, vi } from 'vitest';
import { InMemoryCache } from './cache.ts';

const storeSize = (cache: InMemoryCache) => (cache as unknown as { store: Map<string, unknown> }).store.size;

describe('InMemoryCache', () => {
    it('returns a stored value', async () => {
        const cache = new InMemoryCache();
        await cache.set('key', 'value');

        expect(await cache.get('key')).toBe('value');
        cache.dispose();
    });

    it('returns undefined for a missing key', async () => {
        const cache = new InMemoryCache();

        expect(await cache.get('nope')).toBeUndefined();
        cache.dispose();
    });

    it('keeps a value without a ttl', async () => {
        vi.useFakeTimers();
        const cache = new InMemoryCache();
        await cache.set('key', 'value');

        vi.advanceTimersByTime(10 * 60 * 60 * 1000);

        expect(await cache.get('key')).toBe('value');
        cache.dispose();
        vi.useRealTimers();
    });

    it('expires a value once the ttl passed', async () => {
        vi.useFakeTimers();
        const cache = new InMemoryCache();
        await cache.set('key', 'value', 1000);

        vi.advanceTimersByTime(1001);

        expect(await cache.get('key')).toBeUndefined();
        cache.dispose();
        vi.useRealTimers();
    });

    it('sweeps expired entries that are never read again', async () => {
        vi.useFakeTimers();
        const cache = new InMemoryCache(500);
        await cache.set('expires', 'value', 100);
        await cache.set('stays', 'value', 60_000);

        expect(storeSize(cache)).toBe(2);
        await vi.advanceTimersByTimeAsync(600);

        expect(storeSize(cache)).toBe(1);
        expect(await cache.get('stays')).toBe('value');

        cache.dispose();
        vi.useRealTimers();
    });

    it('clears everything on dispose', async () => {
        const cache = new InMemoryCache();
        await cache.set('key', 'value');

        cache.dispose();

        expect(storeSize(cache)).toBe(0);
    });
});
