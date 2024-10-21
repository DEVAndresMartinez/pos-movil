import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Permission } from '../interfaces';


@Injectable({ providedIn: 'root' })
export class PermissionsService {

  private baseUrl: string = environment.BASE_URL;

  constructor(private http: HttpClient) { }


  getPermissions():Observable<Permission[]> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${ token }` };

    return this.http.get<Permission[]>(`${ this.baseUrl }/v1/permissions`, { headers });
  }

  getPermissionsById( id: string ): Observable<Permission|undefined> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${ token }` };

    return this.http.get<Permission>(`${ this.baseUrl }/v1/permissions/${ id }`, { headers })
      .pipe(
        catchError( error => of(undefined) )
      );
  }
}