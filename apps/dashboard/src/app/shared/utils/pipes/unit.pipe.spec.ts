import { TestBed } from '@angular/core/testing';
import { UNIT_CONFIG, type UnitConfig } from '@core/services/unit.provider';
import { UnitService } from '@core/services/unit.service';
import { UnitPipe } from './unit.pipe';

describe('UnitPipe', () => {
    let pipe: UnitPipe;
    let unitService: UnitService;

    const mockConfig: UnitConfig = {
        metric: {
            distance: { unit: 'm', factor: 1 },
        },
        imperial: {
            distance: { unit: 'ft', factor: 3.28084 },
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                UnitPipe,
                UnitService,
                {
                    provide: UNIT_CONFIG,
                    useValue: mockConfig,
                },
            ],
        });
        pipe = TestBed.inject(UnitPipe);
        unitService = TestBed.inject(UnitService);
    });

    it('should format metric properly', () => {
        unitService.setSystem('metric');
        expect(pipe.transform(1234, 'distance')).toBe('1,234 m');
    });

    it('should format imperial properly', () => {
        unitService.setSystem('imperial');
        expect(pipe.transform(10, 'distance')).toBe('33 ft'); // 10 * 3.28084 = 32.8084 rounded to 33
    });

    it('should handle null/undefined', () => {
        expect(pipe.transform(null)).toBe('');
        expect(pipe.transform(undefined)).toBe('');
    });
});
