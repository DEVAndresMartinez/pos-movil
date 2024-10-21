import { Component, ElementRef, OnInit, Renderer2, ViewChild, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { User } from 'src/app/modules/interfaces';
import { AuthService } from 'src/app/modules/service/auth.service';
import { UsersService } from 'src/app/modules/service/users.service';
import Swal from 'sweetalert2';

@Component({
    templateUrl: './usersList.component.html'
})
export class UsersListComponent implements OnInit {

    private authService = inject(AuthService);

    public loginUser = computed(() => this.authService.currentUser()); 
    public checkStatusUser = computed(() => this.authService.checkAuthStatus()); 

    users: User[] = [];
    permissions: string[] = [];

    loading = true;

    constructor(
        private usersService: UsersService, 
        private router: Router,
    ) { }

    ngOnInit() {
        const userId = this.loginUser()?.id;
        if (userId) {
            this.usersService.getUserById(userId).subscribe((user) => {
                if (user && Array.isArray(user.roles)) {
                    this.permissions = user.roles.flatMap((role: any) => Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.toString()) : []) || [];

                    this.usersService.getUsers().subscribe((allUsers: User[]) => {
                        this.users = allUsers
                        .filter(user => user.id !== userId) 
                        .map(user => ({
                            ...user,
                            roleString: user.roles ? user.roles.map((role: any) => role.name).join(', ') : '',
                        }));
                        
                        this.users.forEach(user => {
                            user.items = [];
                            // if ((this.permissions.includes('update-users') || this.isAdmin())  && !this.permissions.includes('get-user')) {
                            //     user.items.push({label: 'Editar', icon: 'pi pi-pencil', command: (event) => this.onEditUser(user)});
                            // }
                            if (this.permissions.includes('get-user') || this.isAdmin()) {
                                user.items.push({label: 'Ver', icon: 'pi pi-eye', command: (event) => this.onViewUser(user)});
                            }
                            if (this.permissions.includes('delete-users') || this.isAdmin()) {
                                user.items.push({label: 'Eliminar', icon: 'pi pi-trash', command: (event) => this.onDeleteUser(user)});
                            }
                        });
                    });
                }
            });
        }
        this.loading = false;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }

    navigateToCreateUser(){
        this.router.navigate(['/home/users/create'])
    }

    onEditUser(user: User){
        this.router.navigate(['/home/users/edit', user.id])
    }

    onViewUser(user: User){
        this.router.navigate(['/home/users/view', user.id])
    }
    
    onDeleteUser(user: User){
        if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            this.usersService.deleteUserById(user.id)
            .subscribe({
                next: user => {
                    Swal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
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