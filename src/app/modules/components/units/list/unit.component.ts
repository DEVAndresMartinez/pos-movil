import { Component, OnInit, computed, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { UnitsService } from 'src/app/modules/service/units.service';
import { Unit, UnitCreate } from 'src/app/modules/interfaces';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/modules/service/auth.service';
import { UsersService } from 'src/app/modules/service/users.service';

@Component({
    templateUrl: './unit.component.html',
    providers: [MessageService, ConfirmationService]
})
export class UnitComponent implements OnInit {

    unitDialog: boolean = false;

    deleteUnitDialog: boolean = false;

    deleteUnitsDialog: boolean = false;

    units: Unit[] = [];

    unit: UnitCreate = {};
    
    selectedUnit: Unit[] = [];
    
    submitted: boolean = false;
    
    cols: any[] = [];
        
    rowsPerPageOptions = [5, 10, 20];

    permissions: string[] = [];

    loading = true;

    unitForm = new FormGroup({
        id:                 new FormControl<string>(''),    
        name:               new FormControl<string>('', {validators: [Validators.required], nonNullable: true}),
        abbreviation:       new FormControl<string>('', {validators: [Validators.required], nonNullable: true}),    
    });

    private fieldNames = {
        name: 'Nombre',
        abbreviation: 'Abreviatura',
    };

    private authService = inject(AuthService);
    public loginUser = computed(() => this.authService.currentUser()); 
    
    constructor(
        private unitsService: UnitsService, 
        private messageService: MessageService, 
        private usersService: UsersService,
    ) { }
    
    ngOnInit() {
        const userId = this.loginUser()?.id;
        if (userId) {
            this.usersService.getUserById(userId).subscribe((user) => {
                if (user && Array.isArray(user.roles)) {
                    this.permissions = user.roles.flatMap((role: any) => Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.toString()) : []) || [];
                    this.unitsService.getUnits().subscribe(unit => {
                        this.units = unit.filter(unit => unit.status === true);
                    });
                    this.loading = false;
                };
            });
        };
    }

    get currentUnits():UnitCreate {
        
        const unit = this.unitForm.value as UnitCreate;
        return unit;
    }

    openNew() {
        this.submitted = false;
        this.unitDialog = true;
    }

    deleteSelectedUnit() {
        this.deleteUnitsDialog = true;
    }

    editUnit(unit: Unit) {
        if (unit.id) {
            this.unitsService.getUnitById(unit.id).subscribe(unit => {
                if (unit) {
                    this.unitForm.patchValue(unit);
                } else {
                    Swal.fire('Error', 'No se encontró la unidad', 'error');
                }                
            });
            this.unitDialog = true;
        }
    }

    deleteUnit(unit: Unit) {
        this.deleteUnitDialog = true;
        this.unit = unit || {};
    }

    confirmDeleteSelected() {
        this.deleteUnitsDialog = false;
        this.selectedUnit.forEach(unit => { this.unitsService.deleteUnitById(unit.id || '').subscribe( ()=> this.ngOnInit()); });
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Ingredientes Eliminados', life: 3000 });
        this.selectedUnit = [];
    }

    confirmDelete() {
        this.deleteUnitDialog = false;
        this.unitsService.deleteUnitById(this.unit.id || '')
        .subscribe({
            next: unit => {
                Swal.fire('Eliminado', 'Unidad eliminada correctamente', 'success');
                this.ngOnInit();
                this.unit = {};
                this.deleteUnitDialog = false;
            },
            error: (message) => {
                Swal.fire('Error', message.name, 'error');
            } 
        });        
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Ingrediente Eliminado', life: 3000 });

    }

    hideDialog() {
        this.unitForm.reset();
        this.unitDialog = false;
        this.submitted = false;
    }

    saveUnit() {

        if (this.unitForm.invalid) {
            for (const field in this.unitForm.controls) { 
                if (this.unitForm.controls[field as keyof typeof this.unitForm.controls].invalid) {
                    const fieldName = this.fieldNames[field as keyof typeof this.fieldNames];
                    Swal.fire({
                        title: 'Error',
                        text: `Por favor, completa el campo ${fieldName}`,
                        icon: 'error',
                        customClass: {
                          popup: 'swal2-popup',
                        },
                        willOpen: () => {
                            this.unitDialog = false;
                        },
                        willClose: () => {
                            this.unitDialog = true;
                        }
                      });                    
                      return;
                }
            }            
        }

        if (this.currentUnits.id) {
            this.unitsService.updateUnit(this.currentUnits)
            .subscribe({
                next: unit => {
                    Swal.fire('Guardado', 'Unidad actualizada correctamente', 'success');
                    this.submitted = true;
                    this.unitDialog = false;
                    this.ngOnInit();
                    this.unitForm.reset();
                },
                error: (message) => {
                    Swal.fire('Error', message.name, 'error');
                }            
            });
            return;
        } else {
            delete this.currentUnits.id;
            this.unitsService.addUnit(this.currentUnits, this.loginUser()?.clientId || null)
            .subscribe({
                next: unit => {
                    Swal.fire('Guardado', 'Unidad Creada correctamente', 'success');
                    this.submitted = true;
                    this.unitDialog = false;
                    this.ngOnInit();
                    this.unitForm.reset();
                },
                error: (message) => {
                    Swal.fire('Error', message.name, 'error');
                }            
            });
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    isAdmin(): boolean {
        if(this.loginUser()?.roles?.some(role => role.slug === 'admin')) return true;
        return false;
    }
}
