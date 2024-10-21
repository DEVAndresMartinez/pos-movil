import { Component, OnInit, computed, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { switchMap } from 'rxjs';
import Swal from 'sweetalert2';

import { Role, User, UserCreate } from 'src/app/modules/interfaces';
import { AuthService } from 'src/app/modules/service/auth.service';
import { UsersService } from 'src/app/modules/service/users.service';
import { NewPasswordComponent } from '../../auth/newpassword/newpassword.component';
import { RolesService } from 'src/app/modules/service/roles.service';

@Component({
    templateUrl: './usersCreate.component.html',
    styleUrls: ['./usersCreate.component.css']
})
export class UsersCreateComponent implements OnInit { 
    
    isEdit:boolean = false;
    isView:boolean = false;
    isLoginUser:boolean = false;
    showPassword = false;
    loading = true;   
    
    roles: Role[] = [];
    sucursales: any[] = [];
    estados: any[] = [];

    permissions: string[] = [];

    public selectedRoles: Role[] = [];
    
    public usersForm = new FormGroup({
        id:         new FormControl<string>(''),
        firstName:  new FormControl<string>('', {validators: [Validators.required], nonNullable: true}),
        lastName:   new FormControl<string>('', {validators: [Validators.required], nonNullable: true}),
        email:      new FormControl<string>('', {validators: [Validators.required], nonNullable: true}),
        roles:      new FormControl<Role[]>([], {validators: [Validators.required], nonNullable: true}),
        cellPhone:  new FormControl<string>("", [Validators.pattern('^[0-9]*$'), Validators.required]),
        branch:     new FormControl<string[]>([]),
        password:   new FormControl<string>('', {validators: [Validators.minLength(8)], nonNullable: true}),
        status:     new FormControl<string>('', {validators: [Validators.required], nonNullable: true}),
      });

      private fieldNames = {
        firstName: 'Nombres',
        lastName: 'Apellidos',
        email: 'Email',
        role: 'Rol',
        cellPhone: 'Teléfono',
        branch: 'Sucursal',
        status: 'Estado',
        Password: 'Contraseña'
    };
      
    private authService = inject(AuthService);
    public loginUser = computed(() => this.authService.currentUser()); 

    constructor(
        private usersService : UsersService,
        private rolesService: RolesService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private dialog: Dialog,
    ) {}


    ngOnInit() {

        const userId = this.loginUser()?.id;
        if (userId) {
            this.usersService.getProfileById(userId).subscribe((user) => {
                if (user && Array.isArray(user.roles)) {
                    this.permissions = user.roles.flatMap((role: any) => Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.toString()) : []) || [];
                }
            })
        }

        this.rolesService.getRoles().subscribe(roles => {
            this.roles = roles;
    
            if (!this.router.url.includes('edit') && !this.router.url.includes('view') && !this.router.url.includes('create')){
                this.loading = true;
                return;
            } else if (this.router.url.includes('create')) {
                this.loading = false;
                return;
            } else {
                this.activatedRoute.params
                .pipe(
                    switchMap(({ id }) => this.usersService.getUserById(id)),
                ).subscribe(user => {
                    if (!user) {
                        this.router.navigateByUrl('/');
                        return;
                    }
    
                    this.activatedRoute.params.subscribe(params => {
                        const id = params['id'];
    
                        if (this.loginUser()?.id === id) {
                            this.isLoginUser = true;       
                        }
                    });
    
                    if (user.roles) {
                        const selectedRoles = user.roles.map(role => this.roles.find(r => r.id === role.id)).filter(role => role !== undefined) as Role[];
                        user.roles = selectedRoles;
                    }
    
                    this.usersForm.patchValue(user);
                    if(this.router.url.includes('edit')) this.isEdit = true;
                    if(this.router.url.includes('view')) {
                        this.isView = true;
                        this.usersForm.disable();
                    }
                    this.loading = false;
                    return;
                });
            }});
    
        this.sucursales = [
            'sucursal 1',
            'sucursal 2',
            'sucursal 3'
        ];
        this.estados = [
            'Activo',
            'Inactivo',
        ];
    }    

    get currentUsers():UserCreate {
        
        const users = this.usersForm.value as UserCreate;
        return users;
    }


    onSubmit() {
        if (this.usersForm.invalid) {
            for (const field in this.usersForm.controls) { 
                if (this.usersForm.controls[field as keyof typeof this.usersForm.controls].invalid) {
                    const fieldName = this.fieldNames[field as keyof typeof this.fieldNames];
                    Swal.fire('Error', `Por favor, completa el campo ${fieldName}`, 'error');
                    return;
                }
            }
        };

        if (this.currentUsers.id) {
            if(this.isLoginUser){
                this.usersService.updateProfile(this.currentUsers, this.loginUser()?.clientId || null)
                .subscribe({
                    next: user => {
                        Swal.fire('Guardado', 'Perfil editado correctamente', 'success');
                        this.router.navigate(['/home/profile']);
                    },
                    error: (message) => {
                        Swal.fire('Error', message.name, 'error');
                    }            
                });
            } else {
                if (this.isEdit){
                    this.usersService.updateuser(this.currentUsers, this.loginUser()?.clientId || null)
                    .subscribe({
                        next: user => {
                            Swal.fire('Guardado', 'Usuario editado correctamente', 'success');
                            this.router.navigate(['/home/users/list']);
                        },
                        error: (message) => {
                            Swal.fire('Error', message.name, 'error');
                        }            
                    });
                } else if (this.isView){
                    this.router.navigate(['/home/users/edit', this.currentUsers.id]);
                }
            }
            return;
        } else {
            delete this.currentUsers.id;
            this.usersService.addUser(this.currentUsers, this.loginUser()?.clientId || null)
            .subscribe({
                next: user => {
                    Swal.fire('Guardado', 'Usuario Creado correctamente', 'success');
                    this.router.navigate(['/home/users/list']);
                },
                error: (message) => {
                    Swal.fire('Error de registro', 'El correo ya existe, intente nuevamente', 'error');
                }            
            });
        }
    }

    onBack() {
        if (this.isLoginUser) {
            this.router.navigate(['/home/profile']);
        }else{
            if (this.isEdit) {
            this.router.navigate(['/home/users/view', this.currentUsers.id]);
            } else if (this.isView || this.router.url.includes('create')) {
                this.router.navigate(['/home/users/list']);
            }        
        }
    }

    navigateToUpdatePassword() {      
        this.dialog.open(NewPasswordComponent,{
            minWidth: '300px',
            minHeight: '300px',
            data: { id: this.currentUsers.id }
        });
    }

    isAdmin(): boolean {
        if(this.loginUser()?.roles?.some(role => role.slug === 'admin')) return true;
        return false;
    }
    
    limitLength(event: any) {
        const input = event.target as HTMLInputElement;
        if (input.value.length > 10) {
          input.value = input.value.slice(0, 10);
        }
      }
}   