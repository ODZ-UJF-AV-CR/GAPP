import { Injectable, inject, signal } from '@angular/core';
import { UNIT_CONFIG, type UnitCategory, type UnitDefinition, type UnitSystem } from './unit.provider';

const LOCAL_STORAGE_KEY = 'gapp-unit-system';

@Injectable({ providedIn: 'root' })
export class UnitService {
    private config = inject(UNIT_CONFIG);
    private readonly _system = signal<UnitSystem>(this.getInitialSystem());
    public readonly system = this._system.asReadonly();

    private get availableSystems() {
        return Object.keys(this.config) as UnitSystem[];
    }

    public setSystem(system: UnitSystem) {
        if (system in this.config) {
            this._system.set(system);
            localStorage.setItem(LOCAL_STORAGE_KEY, system);
        }
    }

    public convert(value: number, category: UnitCategory): { value: number; unit: string } {
        const currentSystem = this.system();
        const definition: UnitDefinition | undefined = this.config[currentSystem]?.[category];

        if (!definition) {
            return { value, unit: '' };
        }

        const convertedValue = value * definition.factor + (definition.offset || 0);
        return { value: convertedValue, unit: definition.unit };
    }

    public getAvailableSystems() {
        return this.availableSystems;
    }

    private getInitialSystem(): UnitSystem {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY) as UnitSystem | null;

        if (stored && this.availableSystems.includes(stored)) {
            return stored;
        }

        return this.availableSystems[0] || 'metric';
    }
}
