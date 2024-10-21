import { ChangeDetectorRef, Component, computed, ElementRef, inject, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { AuthService } from '../modules/service/auth.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {

    menu: MenuItem[] = [];

    @ViewChild('searchinput') searchInput!: ElementRef;

    @ViewChild('menubutton') menuButton!: ElementRef;

    searchActive: boolean = false;

    isClient: boolean = false;

    isActiveClient: boolean = true;

    posDashDialog: boolean = false;

    submitted: boolean = false;

    showPosButton: boolean = true;

    showDashboardButton: boolean = false;
    isMobile: boolean = false;

    private authService = inject(AuthService);

    public loginUser = computed(() => this.authService.currentUser());

    constructor(
        public layoutService: LayoutService,
        private cdRef: ChangeDetectorRef,
        private router: Router,
        private breakpointObserver: BreakpointObserver
    ) { }

    ngOnInit(): void {
        this.breakpointObserver.observe(['(max-width: 992px)',]).subscribe((state: BreakpointState) => {
            this.isMobile = state.matches;
        })
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                const url = event.url.split('/').join('/');
                if (url.includes('home/pos')) {
                    if (this.isMobile) {
                        this.showPosButton = true;
                    } else {
                        this.showPosButton = false;
                    }
                    this.showDashboardButton = true;
                    this.layoutService.onMenuToggle();

                } else {
                    this.showPosButton = true;
                    this.showDashboardButton = false;
                }
                this.cdRef.detectChanges();
            }
        });


        if (this.loginUser()?.clientId !== null) {
            this.isClient = true;
        }

        if (this.loginUser()?.clientStatus === 'Inactivo' || this.loginUser()?.status === 'Inactivo' || this.loginUser()?.status === 'Eliminado') {
            this.isActiveClient = false;
        }
    }

    onLogout() {
        this.authService.logout();
        window.location.reload();
    }

    onProfile() {
        this.router.navigateByUrl('/home/profile');
    }

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    activateSearch() {
        this.searchActive = true;
        setTimeout(() => {
            this.searchInput.nativeElement.focus();
        }, 100);
    }

    deactivateSearch() {
        this.searchActive = false;
    }

    removeTab(event: MouseEvent, item: MenuItem, index: number) {
        this.layoutService.onTabClose(item, index);
        event.preventDefault();
    }

    openPos() {
        this.router.navigate(['/home/pos']);
    }


    hideDialog() {
        this.posDashDialog = true;
    }

    openHideDashboard() {
        this.posDashDialog = false;
        this.router.navigate(['/home/cash']);
    }

    get layoutTheme(): string {
        return this.layoutService.config().layoutTheme;
    }

    get colorScheme(): string {
        return this.layoutService.config().colorScheme;
    }

    get logo(): string {
        const path = 'assets/layout/images/logo-';
        const logo = (this.layoutTheme === 'primaryColor' && !(this.layoutService.config().theme == "yellow")) ? 'light.png' : (this.colorScheme === 'light' ? 'dark.png' : 'light.png');
        return path + logo;
    }

    get tabs(): MenuItem[] {
        return this.layoutService.tabs;
    }

    reload() {
        window.location.reload();
    }
}
