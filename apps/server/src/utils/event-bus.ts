import EventEmitter from 'node:events';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class EventBus<TEvents extends Record<string, any>> {
    private _emitter = new EventEmitter().setMaxListeners(100);

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
