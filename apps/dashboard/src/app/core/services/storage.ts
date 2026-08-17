/**
 * localStorage is unavailable in the test runner and throws in privacy modes, reads fall back to null
 * and writes are ignored so a missing store never breaks the app.
 */
const getStore = (): Storage | undefined => {
    try {
        return typeof localStorage === 'undefined' ? undefined : localStorage;
    } catch {
        return undefined;
    }
};

export const readStoredValue = <T extends string>(key: string): T | null => {
    try {
        return (getStore()?.getItem(key) as T | null) ?? null;
    } catch {
        return null;
    }
};

export const writeStoredValue = (key: string, value: string) => {
    try {
        getStore()?.setItem(key, value);
    } catch {
        // storage is full or blocked, the in memory signal still holds the value for this session
    }
};
