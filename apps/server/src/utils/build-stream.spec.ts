import type { EventMessage } from 'fastify-sse-v2';
import { describe, expect, it } from 'vitest';
import { buildStream } from './build-stream.ts';

type Payload = { value: string };

const collect = async (generator: AsyncGenerator<EventMessage>, count: number) => {
    const messages: EventMessage[] = [];

    for (let i = 0; i < count; i++) {
        const { value, done } = await generator.next();

        if (done || !value) {
            break;
        }

        messages.push(value);
    }

    return messages;
};

const parse = (message: EventMessage) => JSON.parse(message.data ?? '') as Payload;

describe('buildStream', () => {
    it('sends the initial snapshot first', async () => {
        const stream = buildStream<Payload>({ initialData: () => ({ value: 'snapshot' }) });
        const generator = stream(new AbortController());

        const [first] = await collect(generator, 1);

        expect(parse(first)).toEqual({ value: 'snapshot' });
        await generator.return(undefined as never);
    });

    it('keeps the snapshot ahead of updates that arrive while it is loading', async () => {
        let push: ((data: Payload) => void) | undefined;

        const stream = buildStream<Payload>({
            subscribe: (pushFn) => {
                push = pushFn;
                return () => {};
            },
            initialData: async () => {
                // the subscription is already live, so this update races the snapshot
                push?.({ value: 'live-during-snapshot' });
                return { value: 'snapshot' };
            },
        });

        const generator = stream(new AbortController());
        const messages = await collect(generator, 2);

        expect(messages.map(parse)).toEqual([{ value: 'snapshot' }, { value: 'live-during-snapshot' }]);
        await generator.return(undefined as never);
    });

    it('delivers updates without waiting for a poll interval', async () => {
        let push: ((data: Payload) => void) | undefined;
        const stream = buildStream<Payload>({
            subscribe: (pushFn) => {
                push = pushFn;
                return () => {};
            },
        });

        const generator = stream(new AbortController());
        const pending = generator.next();

        push?.({ value: 'first' });
        const started = Date.now();
        const { value } = await pending;

        expect(parse(value as EventMessage)).toEqual({ value: 'first' });
        expect(Date.now() - started).toBeLessThan(200);
        await generator.return(undefined as never);
    });

    it('drops the oldest message when the queue is full', async () => {
        let push: ((data: Payload) => void) | undefined;
        const stream = buildStream<Payload>({
            maxQueueSize: 2,
            subscribe: (pushFn) => {
                push = pushFn;
                return () => {};
            },
        });

        const generator = stream(new AbortController());

        // the generator body only runs once it is pulled, this also parks it on a yield so the queue can fill
        const pending = generator.next();
        push?.({ value: 'one' });
        await pending;

        push?.({ value: 'two' });
        push?.({ value: 'three' });
        push?.({ value: 'four' });

        const messages = await collect(generator, 2);

        expect(messages.map(parse)).toEqual([{ value: 'three' }, { value: 'four' }]);
        await generator.return(undefined as never);
    });

    it('unsubscribes once the stream is aborted', async () => {
        let unsubscribed = false;
        const abortController = new AbortController();
        const stream = buildStream<Payload>({
            initialData: () => ({ value: 'snapshot' }),
            subscribe: () => () => {
                unsubscribed = true;
            },
        });

        const generator = stream(abortController);
        await collect(generator, 1);

        const pending = generator.next();
        abortController.abort();
        await pending;

        expect(unsubscribed).toBe(true);
    });
});
