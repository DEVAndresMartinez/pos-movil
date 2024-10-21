import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { LayoutService, AppConfig } from './layout/service/app.layout.service';
import { AuthService } from "./modules/service/auth.service";
import { AuthStatus } from "./modules/interfaces";
import { NavigationEnd, Router } from '@angular/router';
import { MenuService } from './layout/app.menu.service';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    showPosButton = true;
    permissions: any[] = [];

    constructor(
        private router: Router,
        private primengConfig: PrimeNGConfig,
        private layoutService: LayoutService,
        private menuService: MenuService
    ) { }

    private authService = inject(AuthService);

    public finishedAuthCheck = computed<boolean>(() => {
        if (this.authService.authStatus() === AuthStatus.checking) {
            return false;
        }
        return true;
    });

    public authStatusChangedEffect = effect(() => {

        switch (this.authService.authStatus()) {

            case AuthStatus.checking:
                break;

            case AuthStatus.authenticated:
                if (this.authService.isSuperAdmin() === true) {
                    this.router.navigateByUrl('/home/clients/list');
                } else if (this.authService.isSuperAdmin() === false) {
                    this.router.navigateByUrl('/home/reports/stocktaking');
                }
                break;

            case AuthStatus.unauthenticated:
                localStorage.removeItem('actualStockExecuted');
                this.ngOnInit();
                break;
        }
    });


    ngOnInit(): void {
        this.primengConfig.ripple = true;

        //optional configuration with the default configuration
        const config: AppConfig = {
            ripple: false, //toggles ripple on and off
            inputStyle: 'outlined', //default style for input elements
            menuMode: 'static', //layout mode of the menu, valid values are "static", "overlay", "slim", and "slim-plus"
            colorScheme: 'light', //color scheme of the template, valid values are "light", "dim" and "dark"
            theme: 'yellow', //default component theme for PrimeNG, see theme section for available values
            layoutTheme: 'colorScheme', //theme of the layout, see layout theme section for available values
            scale: 14, //size of the body font size to scale the whole application
        };
        this.layoutService.config.set(config);

        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                if (event.urlAfterRedirects === '/home/pos') {
                    this.showPosButton = false;
                    this.layoutService.hideMenu();
                } else {
                    this.showPosButton = true;
                    this.layoutService.showMenu();
                }
            }
        });
    }
}




