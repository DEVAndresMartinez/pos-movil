import { Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { Role } from 'src/app/modules/interfaces';
import { AuthService } from 'src/app/modules/service/auth.service';
import { RolesService } from 'src/app/modules/service/roles.service';
import { UsersService } from 'src/app/modules/service/users.service';
import Swal from 'sweetalert2';

@Component({
    templateUrl: './rolesList.component.html',
    styleUrls: ['./rolesList.component.css']
})
export class RolesListComponent implements OnInit {

    roles: Role[] = [];
    permissions: string[] = [];

    loading = true;

    private authService = inject(AuthService);
    public loginUser = computed(() => this.authService.currentUser()); 

    constructor(
        private usersService: UsersService,
        private rolesService: RolesService, 
        private router: Router
    ) { }

    ngOnInit() {
        const userId = this.loginUser()?.id;
        if (userId) {
            this.usersService.getUserById(userId).subscribe((user) => {
                if (user && Array.isArray(user.roles)) {
                    this.permissions = user.roles.flatMap((role: any) => Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.toString()) : []) || [];

                    this.rolesService.getRoles().subscribe(roles => {
                        this.roles = roles;
                        this.roles.forEach(role => {
                            role.items = [];
                            if (this.permissions.includes('get-role') || this.isAdmin()) {
                                role.items.push({label: 'Ver', icon: 'pi pi-eye', command: (event) => this.onViewRole(role)});
                            }
                            if ((this.permissions.includes('update-role') || this.isAdmin())  && !this.permissions.includes('get-role')) {
                                role.items.push({label: 'Editar', icon: 'pi pi-pencil', command: (event) => this.onEditRole(role)});
                            }
                            if (this.permissions.includes('delete-role') || this.isAdmin()) {
                                role.items.push({label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.onDeleteRole(role)})
                            }
                        });
                        this.loading = false;
                    });
                };
            });
        };
    };
    

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }

    navigateToCreateRole(){
        this.router.navigate(['/home/roles/create'])
    }

    onEditRole(role: Role){
        this.router.navigate(['/home/roles/edit', role.id])
    }

    onViewRole(role: Role){
        this.router.navigate(['/home/roles/view', role.id])
    }
    
    onDeleteRole(role: Role){
        if (confirm('¿Estás seguro de que quieres eliminar este rol?')) {
            this.rolesService.deleteRoleById(role.id)
            .subscribe( {
                next: role => {
                    Swal.fire('Eliminado', 'Rol eliminado correctamente', 'success');
                    this.ngOnInit();
                    },
                error: (message) => {
                    Swal.fire('Error', message.name, 'error');
                } 
            });
        }
    }

    isAdmin(): boolean {
        if(this.loginUser()?.roles?.some(role => role.slug === 'admin')) return true;
        return false;
    }
}