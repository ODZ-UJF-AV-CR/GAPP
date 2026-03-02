import { inject, Pipe, type PipeTransform } from '@angular/core';
import type { UnitCategory } from '@core/services/unit.provider';
import { UnitService } from '@core/services/unit.service';

@Pipe({
    name: 'unit',
    pure: false,
})
export class UnitPipe implements PipeTransform {
    private unitService = inject(UnitService);

    transform(value: number | undefined | null, category: UnitCategory = 'distance'): string {
        if (value === null || value === undefined) return '';

        const converted = this.unitService.convert(value, category);

        const formattedNumber = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 0,
        }).format(converted.value);

        return `${formattedNumber} ${converted.unit}`;
    }
}
