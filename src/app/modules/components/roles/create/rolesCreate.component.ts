import { Component, ElementRef, OnInit, Renderer2, computed, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { Permission, RoleCreate } from 'src/app/modules/interfaces';
import { ActionsService } from 'src/app/modules/service/actions.service';
import { AuthService } from 'src/app/modules/service/auth.service';
import { PermissionsService } from 'src/app/modules/service/permissions.service';
import { RolesService } from 'src/app/modules/service/roles.service';
import { UsersService } from 'src/app/modules/service/users.service';
import Swal from 'sweetalert2';



@Component({
    templateUrl: './rolesCreate.component.html',
    styleUrls: ['./rolesCreate.component.css']
})
export class RolesCreateComponent implements OnInit {

    isAdminRole: boolean = false;
    isEdit: boolean = false;
    editRole: boolean = true;
    isView: boolean = false;
    loading = true;
    roleId: string = '';
    rolePermissionsActiveted: any[] = [];
    roleIds: any[] = [];
    arrayActionsIds: any[] = [];
    myForm!: FormGroup;
    defaultId: string = '';

    public rolesForm = new FormGroup({
        id: new FormControl<string>(''),
        name: new FormControl<string>('', { validators: [Validators.required], nonNullable: true })
    });

    private fieldNames = {
        name: 'Nombres del rol',
    };

    public permissionsForm: FormGroup = this.formBuilder.group({});

    private authService = inject(AuthService);
    public loginUser = computed(() => this.authService.currentUser());

    permissions: any[] = [];
    loginPermissions: string[] = [];

    groupedArray: any[] = [];

    constructor(
        private usersService: UsersService,
        private rolesService: RolesService,
        private permissionService: PermissionsService,
        private actionService: ActionsService,
        private formBuilder: FormBuilder,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private renderer: Renderer2,
        private el: ElementRef,
    ) {
        this.myForm = this.initFormPermissions()
    }

    ngOnInit() {

        const userId = this.loginUser()?.id;
        if (userId) {
            this.usersService.getUserById(userId).subscribe((user) => {
                if (user && Array.isArray(user.roles)) {
                    this.loginPermissions = user.roles.flatMap((role: any) => Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.toString()) : []) || [];
                }
                if (!this.router.url.includes('edit') && !this.router.url.includes('view') && !this.router.url.includes('create')) {
                    this.loading = true;
                    return
                } else if (this.router.url.includes('create')) {
                    this.loading = false;
                    return;
                } else {
                    this.activatedRoute.params
                        .pipe(
                            switchMap(({ id }) => this.rolesService.getRoleById(id)),
                        ).subscribe(role => {
                            this.roleIds = role.userActions;
                            if (!role) {
                                return this.router.navigateByUrl('/');
                            }

                            this.activatedRoute.params.subscribe(params => {
                                const id = params['id'];
                                this.roleId = id;
                            });

                            this.actionService.getUserAction().subscribe(permission => {
                                this.permissions = permission;
                                this.preAddPermissions();
                            });

                            this.rolesForm.reset(role);
                            if (role.slug === 'admin') { this.isAdminRole = true; }
                            if (this.router.url.includes('edit')) {
                                this.isEdit = true;
                                if (this.loginPermissions.includes('assign-permission-to-role')) this.editRole = false;
                            } else if (this.router.url.includes('view')) {
                                this.isView = true;
                                this.getRolPermissions();
                                this.rolesForm.disable();
                                this.editRole = true;
                            }

                            this.loading = false;
                            return;
                        });
                }
            })
        }
    }

    get userActionIds(): FormArray {
        return this.myForm.get('userActionIds') as FormArray;
    }

    initFormPermissions(): FormGroup {
        return this.formBuilder.group({
            userActionIds: this.formBuilder.array([])
        })
    }

    get currentRoles() {
        return this.rolesForm.value as RoleCreate;
    }


    onSubmit() {

        if (this.rolesForm.invalid) {
            for (const field in this.rolesForm.controls) {
                if (this.rolesForm.controls[field as keyof typeof this.rolesForm.controls].invalid) {
                    const fieldName = this.fieldNames[field as keyof typeof this.fieldNames];
                    Swal.fire('Error', `Por favor, completa el campo ${fieldName}`, 'error');
                    return;
                }
            }
        };

        if (this.currentRoles.id) {
            if (this.loginPermissions.includes('assign-permission-to-role') || this.isAdmin()) {
                this.rolesService.updateRole(this.currentRoles)
                    .subscribe(role => {
                        this.editRole = false;
                        const rolNameInput = this.el.nativeElement.querySelector('.disabledRole');
                        this.renderer.setStyle(rolNameInput, 'pointer-events', 'none');
                        this.renderer.setStyle(rolNameInput, 'opacity', '60%');
                    });
            } else {
                this.rolesService.updateRole(this.currentRoles)
                    .subscribe(role => {
                        this.router.navigate(['/home/roles/list']);
                    });
            }
            return;
        } else {
            this.rolesService.addRole(this.currentRoles, this.loginUser()?.clientId || null)
                .subscribe(role => {
                    this.router.navigate(['/home/roles/list']);
                });
        }
    }


    getRolPermissions() {
        this.rolesService.getRoleById(this.roleId).subscribe(
            res => {
                this.rolePermissionsActiveted = res.userActions
            }
        )
    }

    onSubmitPermission() {
        if (this.permissionsForm.invalid) {
            return;
        }
    
        if (!this.currentRoles.id) {
            Swal.fire('Error', 'Por favor, guarda el rol primero', 'error');
            return;
        } else if (this.currentRoles.id) {
            if (this.isEdit) {
                const permission = this.permissions.find(action => action.model === 'user-list');
                if (permission) {
                    this.defaultId = permission.id;
                    if (this.defaultId) {
                        this.arrayActionsIds.push(this.defaultId);
                    }
                }
                const userActionIds = this.userActionIds.value;
                this.arrayActionsIds.push(...userActionIds);
    
                this.rolesService.assignPermission(this.currentRoles.id, this.arrayActionsIds).subscribe(() => {
                    Swal.fire('Guardado', 'Permisos asignados correctamente', 'success');
                    this.router.navigate(['/home/roles/list']);
                });
            } else if (this.isView) {
                this.router.navigate(['/home/roles/edit', this.currentRoles.id]);
            }
        }
    }
    

    onBack() {
        if (this.isEdit) {
            this.router.navigate(['/home/roles/view', this.currentRoles.id]);
        } else if (this.isView || this.router.url.includes('create')) {
            this.router.navigate(['/home/roles/list']);
        }
    }

    onEditRolName() {
        const rolNameInput = this.el.nativeElement.querySelector('.disabledRole');
        this.renderer.setStyle(rolNameInput, 'pointer-events', 'auto');
        this.renderer.setStyle(rolNameInput, 'opacity', '100%');
        rolNameInput.focus();

        this.editRole = true;
    }

    preAddPermissions() {
        this.roleIds.forEach((roleId) => {
            this.addPermission(roleId.id);
        })
    }


    addPermission(permissionId: any): void {
        if (!this.userActionIds.controls.some(control => control.value === permissionId)) {
            this.userActionIds.push(new FormControl(permissionId));
        }
    }

    removePermission(permissionId: any): void {
        const index = this.userActionIds.controls.findIndex(x => x.value === permissionId);
        if (index !== -1) {
            this.userActionIds.removeAt(index);
        }
    }

    isPermissionChecked(permissionId: any): boolean {
        if (this.roleIds.find(m => m.id === permissionId)) {
            return true;
        }
        return false;
    }

    onChangeCheckbox(permissionId: any, event: Event): void {
        const target = event.target as HTMLInputElement;
        if (target.checked) {
            this.addPermission(permissionId);
        } else {
            this.removePermission(permissionId);
        }
    }

    isAdmin(): boolean {
        if (this.loginUser()?.roles?.some(role => role.slug === 'admin')) return true;
        return false;
    }
}