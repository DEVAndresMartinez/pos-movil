import { HttpClient, HttpHeaders } from "@angular/common/http";
import { computed, inject, Injectable, signal } from "@angular/core";
import { catchError, map, Observable, of, tap, throwError } from "rxjs";
import { AuthStatus, CheckTokenResponse, LoginResponse, User } from "../interfaces";
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private readonly baseUrl : string = environment.BASE_URL ;
    private http = inject(HttpClient);

    private _currentUser = signal<User|null>(null);
    private _authStatus = signal<AuthStatus>( AuthStatus.checking );

    public currentUser = computed( () => this._currentUser() );
    public authStatus = computed( () => this._authStatus() );

    constructor() { 
        this.checkAuthStatus().subscribe();
    }

    private setAuthentication(user: User, token:string): boolean {

        this._currentUser.set( user );
        this._authStatus.set( AuthStatus.authenticated );
        localStorage.setItem('token', token);

        return true;
    } 

    login(username: string, password: string): Observable<boolean> {
        const url = `${this.baseUrl}/auth/login`;
        const body = {user:{ email: username, password: password }};
        
        return this.http.post<LoginResponse>(url, body)
            .pipe(
                map( ({ user, access_token }) => this.setAuthentication( user, access_token )),
                catchError( err => throwError( () => err.error.message ))
              );
        
        };

    checkAuthStatus(): Observable<boolean> {
        const url = `${this.baseUrl}/auth`;
        const token = localStorage.getItem('token');

        if (!token) {
            this.logout();
            return of(false);
        
        };

        const headers = new HttpHeaders()
            .set('Authorization', `Bearer ${token}`);

        return this.http.get<CheckTokenResponse>(url, { headers })
        .pipe(
            map((user)=> {
                this._currentUser.set(user);
                this._authStatus.set(AuthStatus.authenticated);
                return true;
            }),
            catchError( () => {
                this._authStatus.set(AuthStatus.unauthenticated);
                return of(false);
            })
        );


    }

    logout() {
        localStorage.removeItem('token');
        this._currentUser.set(null);
        this._authStatus.set(AuthStatus.unauthenticated);
    }

    changePassword(newPassword: string, userId: string): Observable<boolean> {
        const password = { password: newPassword };
        const url = `${this.baseUrl}/v1/users/${userId}/change-password`;
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders()
            .set('Authorization', `Bearer ${token}`);

        return this.http.patch<boolean>(url, password, { headers });
    }

    updatePassword(newPassword: string, lastPassword: string, userId: string): Observable<boolean> {
        const password = { 
            newPassword: newPassword,
            currentPassword: lastPassword
         };
        const url = `${this.baseUrl}/v1/users/${userId}/update-password`;
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders()
            .set('Authorization', `Bearer ${token}`);

        return this.http.patch<boolean>(url, password, { headers });
    }

    isSuperAdmin() {
        const user = this._currentUser();
        if (user?.roles && user.roles.length === 0) {
            return true
        } else {
            return false;
        }
    }

}