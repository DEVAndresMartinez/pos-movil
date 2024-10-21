import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Unit, UnitCreate } from '../interfaces';


@Injectable({ providedIn: 'root' })
export class UnitsService {

  private baseUrl: string = environment.BASE_URL;

  constructor(private http: HttpClient) { }


  getUnits():Observable<Unit[]> {
    return this.http.get<Unit[]>(`${ this.baseUrl }/v1/units`);
  }

  getUnitById( id: string ): Observable<Unit|undefined> {
    return this.http.get<Unit>(`${ this.baseUrl }/v1/units/${ id }`)
      .pipe(
        catchError( error => of(undefined) )
      );
  }

  addUnit( unitCreate: UnitCreate, clientId:string|null ): Observable<Unit> {
    
    const unit = { ...unitCreate, slug : '', clientId};
    unit.clientId = clientId;
    delete unit.id;

    return this.http.post<Unit>(`${ this.baseUrl }/v1/units`, unit);
  }

  updateUnit( unit: UnitCreate ): Observable<Unit> {
    if ( !unit.id ) throw Error('Unit id is required');

    const unitCopy = { ...unit, slug : '' };
    delete unitCopy.id;

    return this.http.patch<Unit>(`${ this.baseUrl }/v1/units/${ unit.id }`, unitCopy);

  }

  deleteUnitById( id: string ): Observable<boolean> {
    return this.http.delete(`${ this.baseUrl }/v1/units/${ id }`)
      .pipe(
        map( resp => true ),
        catchError( err => of(false) ),
      );
  }  
}