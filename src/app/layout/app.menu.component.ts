import { Component, OnInit, computed, inject } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../modules/service/auth.service';
import { UsersService } from '../modules/service/users.service';


@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];
    
    isClient = false;
    isClientActive = true;
    permissions: string[] = [];


    private authService = inject(AuthService);
    public loginUser = computed(() => this.authService.currentUser()); 

    constructor(public layoutService: LayoutService, private usersService: UsersService) { }

    ngOnInit() {

        if(this.loginUser()?.clientId !== null ) {
            this.isClient = true;
        }

        
        if (this.loginUser()?.clientStatus === "Inactivo" || this.loginUser()?.status === 'Inactivo' || this.loginUser()?.status==='Eliminado') {
            this.isClientActive = false;
        }

        const userId = this.loginUser()?.id;
        if (userId) {
            this.usersService.getUserById(userId).subscribe((user) => {
                if (user && Array.isArray(user.roles)) {
                    this.permissions = user.roles.flatMap((role: any) => Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.toString()) : []) || [];
                    if (this.isClientActive) {
                        this.model = [
                            // {
                            //     label: 'Dashboard', icon: 'pi pi-home',
                            //     items: [
                            //         { label: 'Inicio', icon: 'pi pi-desktop', routerLink: ['/'] },
                            //     ]
                            // },
                            ((this.permissions.includes('list-users') || this.isClient && this.permissions.includes('list-roles') || !this.isClient) || this.isAdmin()) ? {
                                label: 'Usuarios',
                                icon: 'pi pi-fw pi-user',
                                items: [
                                    (!this.isClient ) ?
                                    {
                                        label: 'Clientes',
                                        icon: 'pi pi-fw pi-id-card',
                                        routerLink: ['clients/list']
                                    }: null,
                                    (!this.isClient && !this.isAdmin()) ? 
                                    {
                                        label: 'Acciones',
                                        icon: 'pi pi-fw pi-key',
                                        routerLink: ['roles/actions']
                                    } : null, 
                                    (this.isClient && (this.permissions.includes('list-users') || this.isAdmin())) ? 
                                    {
                                        label: 'Usuarios',
                                        icon: 'pi pi-fw pi-users',
                                        routerLink: ['users/list']
                                    } : null,
                                    (this.isClient && (this.permissions.includes('list-roles') || this.isAdmin())) ? 
                                    {
                                        label: 'Roles',
                                        icon: 'pi pi-fw pi-briefcase',
                                        routerLink: ['roles/list']
                                    }: null
                                ]
                            }:null,
                            (this.isClient && ((this.isClient && this.permissions.includes('list-stocktaking') ) || this.isAdmin())) ?
                            { 
                                label: 'Inventario',
                                icon: 'pi pi-fw pi-book',
                                items: [
                                    // (this.isClient && (this.permissions.includes('list-units') || this.isAdmin())) ? 
                                    // {
                                    //     label: 'Unidades',
                                    //     icon: 'pi pi-fw pi-box',
                                    //     routerLink: ['units/list']
                                    // } : null,
                                    // (this.isClient && (this.permissions.includes('list-ingredients') || this.isAdmin())) ? 
                                    // {
                                    //     label: 'Ingredientes',
                                    //     icon: 'pi pi-fw pi-apple',
                                    //     routerLink: ['ingredients/list']
                                    // }: null,
                                    (this.isClient && (this.permissions.includes('list-stocktaking') || this.isAdmin())) ?
                                    {
                                        label: 'Productos',
                                        icon: 'pi pi-fw pi-book',
                                        routerLink: ['products/inventory']
                                    }: null,
                                ]
                            }:null,
                            (this.isClient && ((this.permissions.includes('find-cash-closing') || this.isClient && this.permissions.includes('list-sales') ) || this.isAdmin())) ?
                            { 
                                label: 'TRANSACCIONES',
                                icon: 'pi pi-fw pi-book',
                                items: [
                                    (this.isClient && (this.permissions.includes('list-sales') || this.isAdmin())) ?
                                    {
                                        label: 'Ventas',
                                        icon: 'pi pi-tags',
                                        routerLink: ['sales/list']
                                    }: null,
                                    (this.isClient && ((this.permissions.includes('find-cash-closing') || this.isAdmin()))) ?
                                    {
                                        label: 'Turnos',
                                        icon: 'pi pi-calendar-plus',
                                        routerLink: ['cash']
                                    }: null
                                ]
                            }:null,
                            //Pendiente a Permisos de Reportes
                            (this.isClient && ((this.permissions.includes('') || this.isAdmin()))) ?
                            {
                                label: 'REPORTES',
                                icon: 'pi pi-book',
                                items: [
                                    (this.isClient && (this.permissions.includes('') || this.isAdmin())) ?
                                    {
                                        label: 'Reporte de Stock',
                                        icon: 'pi pi-check-square',
                                        routerLink: ['reports/stocktaking']
                                    }: null,
                                    (this.isClient && (this.permissions.includes('') || this.isAdmin())) ?
                                    {
                                        label: 'Reporte de Ventas',
                                        icon: 'pi pi-check-square',
                                        routerLink: ['reports/sales']
                                    }: null,
                                    (this.isClient && (this.permissions.includes('') || this.isAdmin())) ?
                                    {
                                        label: 'Reporte de Turnos',
                                        icon: 'pi pi-check-square',
                                        routerLink: ['reports/cash']
                                    }: null
                                ]
                            }:null
                        ];
                    } else { 
                        this.model = [];
                    }
                };
            });
        };
    } 

    isAdmin(): boolean {
        if(this.loginUser()?.roles?.some(role => role.slug === 'admin')) return true;
        return false;
    }
}
