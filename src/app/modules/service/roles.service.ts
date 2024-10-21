import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Role, RoleCreate } from '../interfaces';


@Injectable({ providedIn: 'root' })
export class RolesService {

  private baseUrl: string = environment.BASE_URL;

  constructor(private http: HttpClient) { }


  getRoles():Observable<Role[]> {
    return this.http.get<Role[]>(`${ this.baseUrl }/v1/roles`);
  }

  getRoleById( id: string ): Observable<any> {
    return this.http.get<Role>(`${ this.baseUrl }/v1/roles/${ id }`)
      .pipe(
        catchError( error => of(undefined) )
      );
  }

  addRole( roleCreate: RoleCreate, clientId:string|null ): Observable<Role> {
    const role = { ...roleCreate, slug : '', clientId};
    role.slug = roleCreate.name.toLowerCase().replace(/ /g, '-');
    role.clientId = clientId;
    delete role.id;

    return this.http.post<Role>(`${ this.baseUrl }/v1/roles`, role);
  }

  updateRole( role: RoleCreate ): Observable<Role> {
    if ( !role.id ) throw Error('Role id is required');

    const roleCopy = { ...role, slug : '' };
    roleCopy.slug = role.name.toLowerCase().replace(/ /g, '-');
    delete roleCopy.id;

    return this.http.patch<Role>(`${ this.baseUrl }/v1/roles/${ role.id }`, roleCopy);
  }

  deleteRoleById( id: string ): Observable<boolean> {
    return this.http.delete(`${ this.baseUrl }/v1/roles/${ id }`)
      .pipe(
        map( resp => true ),
        catchError( err => of(false) ),
      );
  }

  assignPermission( roleId: string, userActionIds: string[] ): Observable<boolean> {
    return this.http.post(`${ this.baseUrl }/v1/roles/assign-permission-to-role/${ roleId }`, { userActionIds })
      .pipe(
        map( resp => true ),
        catchError( err => of(false) ),
      );
  }


}