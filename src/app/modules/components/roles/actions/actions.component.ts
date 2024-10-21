import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActionsService } from 'src/app/modules/service/actions.service';
import { PermissionsService } from 'src/app/modules/service/permissions.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss']
})
export class ActionsComponent implements OnInit {
  userActions: any[] = [];
  permissionsByModel: { [key: string]: any[] } = {};
  actionForm: FormGroup;
  actionPermissionForm: FormGroup;

  loading = true;
  actionCreated = false;
  actionCreatedId = '';
  actionCreatedName = '';
  actionDialog = false;
  actionPermissionDialog = false;
  confirmDialog = false;
  confirmDialogAddActions = false;
  isEdit = false;
  rowsPerPageOptions = [5, 10, 20];
  cols: any[] = [];

  constructor(
    private actionService: ActionsService,
    private permissionService: PermissionsService,
    private fb: FormBuilder,
  ) {
    this.actionForm = this.createActionForm();
    this.actionPermissionForm = this.createActionPermissionForm();
  }

  ngOnInit(): void {
    this.loadUserActions();
    this.getPermissionsList();
    this.loading = false;
  }

  loadUserActions(): void {
    this.actionService.getUserAction().subscribe(
      actions => {
        if (actions && actions.length > 0) {
          this.userActions = actions;
        }
      },
      error => {
        console.error('Error loading user actions:', error);
      }
    );
  }

  createActionForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      model: ['', [Validators.required]]
    });
  }

  createActionPermissionForm(): FormGroup {
    return this.fb.group({
      permissionIds: this.fb.array([])
    });
  }

  getPermissionsList(): void {
    this.permissionService.getPermissions().subscribe({
      next: (permissions: any[]) => {
        this.permissionsByModel = this.groupByModel(permissions);
      },
      error: (err) => {
        console.error('Error fetching permissions:', err);
      }
    });
  }

  groupByModel(permissions: any[]): { [key: string]: any[] } {
    return permissions.reduce((result, permission) => {
      const model = permission.model;
      if (!result[model]) {
        result[model] = [];
      }
      result[model].push(permission);
      return result;
    }, {});
  }

  getPermissionsName(permissions: any[]): string {
    return permissions.map(permission => permission.name).join(' - ');
  }

  openActionDialog(): void {
    this.actionDialog = true;
  }

  closeActionDialog(): void {
    this.actionDialog = false;
  }

  confirmActionDialog(): void {
    this.confirmDialog = true;
  }

  newAction(): void {
    this.confirmDialog = false;
    this.actionCreated = true;
    if (this.actionForm.valid) {
      this.actionService.addUserActions(this.actionForm.value).subscribe(
        res => {
          if (res) {
            this.actionCreatedId = res.id;
            this.actionCreatedName = res.name;
            this.actionDialog = false;
            Swal.fire({
              title: 'Acción creada',
              text: 'La acción se ha creado correctamente',
              icon: 'success',
            }).then(() => {
              this.actionPermissionDialog = true;
            });
          }
        },
        error => {
          console.error('Error creating action:', error);
          Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al crear la acción.',
            icon: 'error',
          });
        }
      );
    } else {
      this.actionDialog = false;
      Swal.fire({
        title: 'Error',
        text: 'Por favor, complete todos los campos.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.actionDialog = true;
      });
    }
  }

  get permissionIds(): FormArray {
    return this.actionPermissionForm.get('permissionIds') as FormArray;
  }

  addPermission(permissionId: any): void {
    this.permissionIds.push(new FormControl(permissionId));
  }

  removePermission(permissionId: any): void {
    const index = this.permissionIds.controls.findIndex(x => x.value === permissionId);
    if (index !== -1) {
      this.permissionIds.removeAt(index);
    }
  }

  confirmSave(): void {
    if (this.actionPermissionForm.valid) {
      const permissionIds = this.permissionIds.value;
      const payload: any = { permissionIds };
      
      this.actionService.addUserActionsPermissions(this.actionCreatedId, payload).subscribe(
        res => {
          if (res) {
            this.resetDialogs();
            Swal.fire({
              title: this.isEdit ? 'Permisos actualizados' : 'Permisos asignados',
              text: `Los permisos se han ${this.isEdit ? 'actualizado' : 'asignado'} correctamente`,
              icon: 'success',
            }).then(() => {
              this.ngOnInit();
              this.loadUserActions();
            });
          }
        },
        error => {
          this.confirmDialog = false;
          this.actionDialog = false;
          Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al actualizar los permisos.',
            icon: 'error',
          });
        }
      );
    }
  }

  resetDialogs(): void {
    this.confirmDialog = false;
    this.actionDialog = false;
    this.actionPermissionDialog = false;
    this.confirmDialogAddActions = false;
    this.isEdit = false;
    this.actionForm.reset();
    this.actionPermissionForm.reset();
  }

  editActionPermissions(action: any): void {
    this.isEdit = true;
    this.actionForm.patchValue({
      name: action.name,
      model: action.model
    });

    this.actionCreatedId = action.id;
    this.permissionIds.clear();
    action.permissions.forEach((permission: any) => {
      this.permissionIds.push(new FormControl(permission.id));
    });

    this.actionPermissionDialog = true;
  }

  isPermissionChecked(permissionId: any): boolean {
    return this.permissionIds.value.includes(permissionId);
  }

  onChangeCheckbox(permissionId: any, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.addPermission(permissionId);
    } else {
      this.removePermission(permissionId);
    }
  }
}