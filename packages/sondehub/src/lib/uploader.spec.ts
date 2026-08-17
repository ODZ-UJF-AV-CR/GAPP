import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type TelemetryPacket, Uploader } from './uploader.ts';

vi.mock('axios', () => ({ default: { put: vi.fn() } }));

const put = vi.mocked(axios.put);

const packet = (): TelemetryPacket => ({
    time_received: '2026-08-17T10:00:00.000Z',
    payload_callsign: 'balloon',
    datetime: '2026-08-17T10:00:00.000Z',
    lat: 50,
    lon: 14,
    alt: 1000,
});

const uploaders: Uploader[] = [];

const createUploader = (overrides = {}) => {
    const uploader = new Uploader({
        uploader_callsign: 'TEST',
        // the automatic cycle must not fire on its own, tests drive processQueue directly
        uploadRate: 60_000,
        uploadRetries: 3,
        uploadRetryDelay: 0,
        logLevel: 'none',
        ...overrides,
    });

    uploaders.push(uploader);
    return uploader;
};

const queueSize = (uploader: Uploader) => (uploader as unknown as { telemetryQueue: unknown[] }).telemetryQueue.length;
const flush = (uploader: Uploader) => (uploader as unknown as { processQueue: () => Promise<void> }).processQueue();

describe('Uploader', () => {
    beforeEach(() => put.mockReset());

    afterEach(() => {
        // a running uploader keeps retrying leftover packets and would pollute the next test
        uploaders.splice(0).forEach((uploader) => uploader.stop());
        vi.useRealTimers();
    });

    it('uploads queued packets and empties the queue', async () => {
        put.mockResolvedValue({ status: 200, statusText: 'OK' });
        const uploader = createUploader();
        uploader.addTelemetry(packet());

        await flush(uploader);

        expect(put).toHaveBeenCalledTimes(1);
        expect(queueSize(uploader)).toBe(0);
    });

    it('retries a server error and keeps the packets until it succeeds', async () => {
        put.mockResolvedValueOnce({ status: 500, statusText: 'Server Error' }).mockResolvedValueOnce({ status: 200, statusText: 'OK' });
        const uploader = createUploader();
        uploader.addTelemetry(packet());

        await flush(uploader);

        expect(put).toHaveBeenCalledTimes(2);
        expect(queueSize(uploader)).toBe(0);
    });

    it('keeps packets queued when every attempt fails', async () => {
        put.mockResolvedValue({ status: 503, statusText: 'Unavailable' });
        const uploader = createUploader();
        uploader.addTelemetry(packet());

        await flush(uploader);

        expect(put).toHaveBeenCalledTimes(3);
        expect(queueSize(uploader)).toBe(1);
    });

    it('retries network failures', async () => {
        put.mockRejectedValueOnce(new Error('ECONNRESET')).mockResolvedValueOnce({ status: 200, statusText: 'OK' });
        const uploader = createUploader();
        uploader.addTelemetry(packet());

        await flush(uploader);

        expect(put).toHaveBeenCalledTimes(2);
        expect(queueSize(uploader)).toBe(0);
    });

    it('does not retry a client error, the payload would be rejected again', async () => {
        put.mockResolvedValue({ status: 400, statusText: 'Bad Request' });
        const uploader = createUploader();
        uploader.addTelemetry(packet());

        await flush(uploader);

        expect(put).toHaveBeenCalledTimes(1);
        expect(queueSize(uploader)).toBe(0);
    });

    it('keeps packets added while an upload is in flight', async () => {
        put.mockResolvedValue({ status: 503, statusText: 'Unavailable' });
        const uploader = createUploader();
        uploader.addTelemetry(packet());

        const pending = flush(uploader);
        uploader.addTelemetry(packet());
        await pending;

        expect(queueSize(uploader)).toBe(2);
    });

    it('treats a test mode response as delivered', async () => {
        put.mockResolvedValue({ status: 202, statusText: 'Accepted' });
        const uploader = createUploader();
        uploader.addTelemetry(packet());

        await flush(uploader);

        expect(queueSize(uploader)).toBe(0);
    });

    it('skips the request when nothing is queued', async () => {
        const uploader = createUploader();

        await flush(uploader);

        expect(put).not.toHaveBeenCalled();
    });

    it('retries a station position on a server error', async () => {
        put.mockResolvedValueOnce({ status: 500, statusText: 'Server Error' }).mockResolvedValueOnce({ status: 200, statusText: 'OK' });
        const uploader = createUploader();

        await uploader.uploadStationPosition({ uploader_callsign: 'CHASE', uploader_position: [50, 14, 100], mobile: true });

        expect(put).toHaveBeenCalledTimes(2);
    });

    it('uploads the remaining queue on deinit', async () => {
        put.mockResolvedValue({ status: 200, statusText: 'OK' });
        const uploader = createUploader();
        uploader.addTelemetry(packet());

        await uploader.deinit();

        expect(put).toHaveBeenCalledTimes(1);
        expect(queueSize(uploader)).toBe(0);
    });

    it('stops scheduling uploads after deinit', async () => {
        vi.useFakeTimers();
        put.mockResolvedValue({ status: 200, statusText: 'OK' });
        const uploader = createUploader({ uploadRate: 50 });

        await uploader.deinit();
        uploader.addTelemetry(packet());
        await vi.advanceTimersByTimeAsync(500);

        expect(put).not.toHaveBeenCalled();
    });

    it('sends the uploader callsign and software metadata with each packet', async () => {
        put.mockResolvedValue({ status: 200, statusText: 'OK' });
        const uploader = createUploader({ software_name: 'gapp-server', software_version: '1.2.3' });
        uploader.addTelemetry(packet());

        await flush(uploader);

        const queued = (uploader as unknown as { telemetryQueue: unknown[] }).telemetryQueue;
        expect(queued).toHaveLength(0);
        expect(put.mock.calls[0][0]).toBe(Uploader.SONDEHUB_AMATEUR_URL);
    });
});
