import { HttpInterceptorFn } from "@angular/common/http";
import { catchError, throwError } from "rxjs";
import Swal from "sweetalert2";



export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('token');
    const clone = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
    
    return next(clone).pipe(
        catchError(err => {
            if (err.error.statusCode === 401 && err.error.message === 'jwt expired') {
                Swal.fire('Sesión expirada', 'Por  favor, inicia sesión nuevamente', 'info').then(() => {
                    localStorage.removeItem('token');
                    window.location.reload();
                });
                return throwError(() => new Error('Token expired'));
            } 
            if (err.error.statusCode === 403 && err.error.message === 'Forbidden resource') {
                Swal.fire('Acceso denegado', 'No tienes permisos para realizar esta acción.', 'error');
                return throwError(() => new Error('Forbidden'));
            }
            return throwError(() => err);
        })
    );
}