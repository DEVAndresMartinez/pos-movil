import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStatus } from "src/app/modules/interfaces";
import { AuthService } from "src/app/modules/service/auth.service";

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {

    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.authStatus() === AuthStatus.authenticated){
        return true;
    }

    router.navigateByUrl('/auth/login');

    return false;
}