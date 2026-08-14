import { clearInterval, setInterval } from 'node:timers';
import type { EventMessage } from 'fastify-sse-v2';

type Push<T> = (data: T) => void;

export type StreamOptions<T> = {
    initialData?: () => Promise<T | T[]> | T | T[];
    subscribe?: (push: Push<T>) => () => void;
    pingIntervalMs?: number;
    idleDelayMs?: number;
};

export type SubscribeCallback<T> = StreamOptions<T>['subscribe'];
export type InitialDataCallback<T> = StreamOptions<T>['initialData'];

export const buildStream = <T>(options: StreamOptions<T>) =>
    async function* (abortController: AbortController): AsyncGenerator<EventMessage> {
        const { initialData, subscribe, pingIntervalMs = 30_000, idleDelayMs = 1000 } = options;
        const signal = abortController.signal;
        const queue: EventMessage[] = [];

        const ping = setInterval(() => queue.push({ data: '{"data":"ping"}' }), pingIntervalMs);
        const unsubscribe = subscribe?.((data) => queue.push({ data: JSON.stringify(data) }));

        if (initialData) {
            queue.push({ data: JSON.stringify(await initialData()) });
        }

        try {
            while (!signal.aborted) {
                const message = queue.shift();
                if (message) {
                    yield message;
                } else {
                    await new Promise((r) => setTimeout(r, idleDelayMs));
                }
            }
        } finally {
            clearInterval(ping);
            unsubscribe?.();
        }
    };
