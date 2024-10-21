import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Role, User, UserCreate } from '../interfaces';


@Injectable({ providedIn: 'root' })
export class UsersService {

  private baseUrl: string = environment.BASE_URL;


  constructor(private http: HttpClient) { }

  
  getUsers():Observable<User[]> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${ token }` };
    
    return this.http.get<User[]>(`${ this.baseUrl }/v1/users`, { headers });
  }

  getUserById( id: string ): Observable<User|undefined> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${ token }` };

    return this.http.get<User>(`${ this.baseUrl }/v1/users/${ id }`, { headers })
      .pipe(
        catchError( error => of(undefined) )
      );
  }

  getProfileById(id: string): Observable<User|undefined> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${ token }` };
    return this.http.get<User>(`${ this.baseUrl }/v1/users/${ id }/profile`, { headers })
  }

  // getSuggestions( query: string ): Observable<User[]> {
  //   return this.http.get<User[]>(`${ this.baseUrl }/users?q=${ query }&_limit=6`);
  // }


  addUser( user: UserCreate, clientId : string | null): Observable<User> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${ token }` };

    user.roleIds = (user.roles as Role[]).map(role => role.id);
    user.clientId = clientId;
    user.cellPhone = user.cellPhone?.toString();

    return this.http.post<User>(`${ this.baseUrl }/v1/users`, user, { headers });
  }

  updateuser( user: UserCreate, clientId : string | null ): Observable<User> {
    if ( !user.id ) throw Error('user id is required');

    const copyUser = { ...user, clientId };
    delete copyUser.id;
    delete copyUser.branch;
    delete copyUser.roles;

    copyUser.roleIds = (user.roles as Role[]).map(role => role.id);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${ token }` };

    return this.http.patch<User>(`${ this.baseUrl }/v1/users/${ user.id }`, copyUser, { headers });
  }
  updateProfile( user: UserCreate, clientId : string | null ): Observable<User> {
    if ( !user.id ) throw Error('user id is required');

    const copyUser = { ...user, clientId };
    delete copyUser.id;
    delete copyUser.branch;
    delete copyUser.roles;

    copyUser.roleIds = (user.roles as Role[]).map(role => role.id);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${ token }` };

    return this.http.patch<User>(`${ this.baseUrl }/v1/users/${ user.id }/profile`, copyUser, { headers });
  }

  deleteUserById( id: string ): Observable<boolean> {

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${ token }` };

    return this.http.delete(`${ this.baseUrl }/v1/users/${ id }`, { headers })
      .pipe(
        map( resp => true ),
        catchError( err => of(false) ),
      );
  }


}