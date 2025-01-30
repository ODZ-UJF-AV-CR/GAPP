import { Injectable } from "@angular/core";
import { ApiServiceBase } from "./api.service.base";

export enum VesselType {
    BALLOON = 'balloon',
    UAV = 'uav',
}

export interface Vessel {
  _id: string;
  callsign: string;
  transmitters: string[];
  description?: string;
  type: VesselType;
}

@Injectable({ providedIn: "root"})
export class VesselsService extends ApiServiceBase {
  public createVessel$(car: Omit<Vessel, '_id'>) {
          return this.post$<Vessel>(this.apiUrl('/vessels'), car);
      }

      public getVessels$() {
          return this.get$<Vessel[]>(this.apiUrl('/vessels'));
      }
}
