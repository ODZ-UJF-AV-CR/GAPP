// biome-ignore-all lint/suspicious/noExplicitAny: ok for evetn bus
import EventEmitter from 'node:events';

export class EventBus<TEvents extends Record<string, any>> {
    private _emitter = new EventEmitter().setMaxListeners(1000);

    public get emitter() {
        return this._emitter;
    }

    emit<TEventName extends keyof TEvents & string>(eventName: TEventName, ...eventArg: TEvents[TEventName]) {
        this._emitter.emit(eventName, ...(eventArg as []));
    }

    on<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void) {
        this._emitter.on(eventName, handler as any);
    }

    off<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void) {
        this._emitter.off(eventName, handler as any);
    }
}
