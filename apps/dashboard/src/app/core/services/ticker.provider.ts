import { DestroyRef, InjectionToken, inject, type Provider, type Signal, signal } from '@angular/core';

/** @description Shared clock so every relative timestamp on screen ticks from one interval instead of one per row */
export const TICKER = new InjectionToken<Signal<number>>('ticker');

export const provideTicker = (intervalMs = 1000): Provider => ({
    provide: TICKER,
    useFactory: () => {
        const tick = signal(Date.now());
        const handle = setInterval(() => tick.set(Date.now()), intervalMs);

        inject(DestroyRef).onDestroy(() => clearInterval(handle));

        return tick.asReadonly();
    },
});
