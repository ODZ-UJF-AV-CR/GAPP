export interface Cache {
    get: <T>(key: string) => Promise<T | undefined>;
    set: (key: string, value: unknown, ttl?: number) => Promise<void>;
    del: (key: string) => Promise<void>;
    clear: () => Promise<void>;
}

const SWEEP_INTERVAL_MS = 60 * 60 * 1000;

export class InMemoryCache implements Cache {
    private store = new Map<string, { value: unknown; expiresAt: number | null }>();
    private sweep: NodeJS.Timeout;

    /** @description Reading an entry is not guaranteed to happen again, so expired ones are swept instead of freed lazily */
    constructor(sweepIntervalMs = SWEEP_INTERVAL_MS) {
        this.sweep = setInterval(() => this.removeExpired(), sweepIntervalMs);
        this.sweep.unref();
    }

    async get<T>(key: string): Promise<T | undefined> {
        const item = this.store.get(key);
        if (!item) {
            return undefined;
        }

        if (this.isExpired(item.expiresAt)) {
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

    public dispose() {
        clearInterval(this.sweep);
        this.store.clear();
    }

    private isExpired(expiresAt: number | null) {
        return !!expiresAt && Date.now() > expiresAt;
    }

    private removeExpired() {
        for (const [key, item] of this.store) {
            if (this.isExpired(item.expiresAt)) {
                this.store.delete(key);
            }
        }
    }
}
