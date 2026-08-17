import type { EventMessage } from 'fastify-sse-v2';

type Push<T> = (data: T) => void;

export type StreamOptions<T> = {
    initialData?: () => Promise<T | T[]> | T | T[];
    subscribe?: (push: Push<T>) => () => void;
    pingIntervalMs?: number;
    maxQueueSize?: number;
};

export type SubscribeCallback<T> = StreamOptions<T>['subscribe'];
export type InitialDataCallback<T> = StreamOptions<T>['initialData'];

export const buildStream = <T>(options: StreamOptions<T>) =>
    async function* (abortController: AbortController): AsyncGenerator<EventMessage> {
        const { initialData, subscribe, pingIntervalMs = 30_000, maxQueueSize = 1000 } = options;
        const signal = abortController.signal;
        const queue: EventMessage[] = [];
        let wake: (() => void) | undefined;

        const wakeUp = () => {
            wake?.();
            wake = undefined;
        };

        const push = (message: EventMessage) => {
            // the dashboard only cares about the newest state, so the oldest update is the one to lose
            if (queue.length >= maxQueueSize) {
                queue.shift();
            }

            queue.push(message);
            wakeUp();
        };

        signal.addEventListener('abort', wakeUp, { once: true });

        // an SSE comment keeps the connection alive without reaching the client onmessage handler
        const ping = setInterval(() => push({ comment: 'ping' }), pingIntervalMs);
        const unsubscribe = subscribe?.((data) => push({ data: JSON.stringify(data) }));

        // subscribed before the snapshot so no update is missed, the snapshot is then moved ahead of them
        if (initialData) {
            queue.unshift({ data: JSON.stringify(await initialData()) });
        }

        try {
            while (!signal.aborted) {
                while (queue.length && !signal.aborted) {
                    const message = queue.shift();

                    if (message) {
                        yield message;
                    }
                }

                if (signal.aborted) {
                    break;
                }

                await new Promise<void>((resolve) => {
                    wake = resolve;
                });
            }
        } finally {
            clearInterval(ping);
            signal.removeEventListener('abort', wakeUp);
            unsubscribe?.();
        }
    };
