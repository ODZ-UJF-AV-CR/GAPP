export class InMemoryCache {
    private store = new Map<string, { value: unknown; expiresAt: number | null }>();

    async get<T>(key: string): Promise<T | undefined> {
        const item = this.store.get(key);
        if (!item) {
            return undefined;
        }

        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.store.delete(key);
            return undefined;
        }

        return item.value as T;
    }

    async set(key: string, value: unknown, ttl?: number): Promise<void> {
        const expiresAt = ttl ? Date.now() + ttl : null;
        this.store.set(key, { value, expiresAt });
    }

    async del(key: string): Promise<void> {
        this.store.delete(key);
    }

    async clear(): Promise<void> {
        this.store.clear();
    }
}
