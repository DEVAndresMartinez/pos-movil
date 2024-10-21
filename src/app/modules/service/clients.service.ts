import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Client, CreateClient } from '../interfaces';


@Injectable({ providedIn: 'root' })
export class ClientsService {

  private baseUrl: string = environment.BASE_URL;


  constructor(private http: HttpClient) { }


  getClients():Observable<Client[]> {
    return this.http.get<Client[]>(`${ this.baseUrl }/v1/clients`);
  }

  getClientById( id: string ): Observable<Client|undefined> {
    return this.http.get<Client>(`${ this.baseUrl }/v1/clients/${ id }`)
      .pipe(
        catchError( error => of(undefined) )
      );
  }

  getSuggestions( query: string ): Observable<Client[]> {
    return this.http.get<Client[]>(`${ this.baseUrl }/v1/clients?q=${ query }&_limit=6`);
  }


  addClient( client: CreateClient ): Observable<Client> {
    return this.http.post<Client>(`${ this.baseUrl }/v1/clients`, client );
  }

  updateclient( client: CreateClient ): Observable<Client> {
    if ( !client.id ) throw Error('client id is required');

    const copyClient = { ...client };
    delete copyClient.id;
    delete copyClient.users;

    return this.http.patch<Client>(`${ this.baseUrl }/v1/clients/${ client.id }`, copyClient);
  }

  deleteClientById( id: string ): Observable<boolean> {
    return this.http.delete(`${ this.baseUrl }/v1/clients/${ id }`)
      .pipe(
        map( resp => true ),
        catchError( err => of(false) ),
      );
  }
}