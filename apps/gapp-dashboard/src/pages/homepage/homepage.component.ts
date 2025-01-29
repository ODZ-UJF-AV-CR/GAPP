import { Component, inject, OnInit } from '@angular/core';
import { CarsService } from '../../services/cars.service';

@Component({
    selector: 'gapp-homepage',
    templateUrl: './homepage.component.html',
})
export class HomepageComponent implements OnInit {
    private carsService = inject(CarsService);

    public createCar() {
        this.carsService
            .createCar$({
                callsign: 'testing-car',
                description: 'tohle je testovací auto',
            })
            .subscribe((r) => {
                console.log(r);
            });
    }

    public ngOnInit() {
        this.carsService.getCars$().subscribe(console.log);
    }
}
