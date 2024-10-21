import { Component, OnInit, computed, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { IngredientsService } from 'src/app/modules/service/ingredients.services';
import { Ingredients, IngredientsCreate, Unit, UnitCreate } from 'src/app/modules/interfaces';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/modules/service/auth.service';
import Swal from 'sweetalert2';
import { UnitsService } from 'src/app/modules/service/units.service';
import { UsersService } from 'src/app/modules/service/users.service';

@Component({
    templateUrl: './crud.component.html',
    providers: [MessageService, ConfirmationService]
})
export class CrudComponent implements OnInit {

    ingredientDialog: boolean = false;

    deleteIngredientDialog: boolean = false;

    deleteIngredientsDialog: boolean = false;

    ingredients: Ingredients[] = [];

    ingredient: IngredientsCreate = {};
    
    selectedIngredient: Ingredients[] = [];
    
    submitted: boolean = false;

    units: Unit[] = [];

    cols: any[] = [];
    
    rowsPerPageOptions = [5, 10, 20];

    permissions: string[] = [];

    loading = true;

    ingredientForm = new FormGroup({
        id:                 new FormControl<string>(''),    
        name:               new FormControl<string>('', {validators: [Validators.required], nonNullable: true}),
        description:        new FormControl<string>('', {validators: [Validators.required], nonNullable: true}),
        sku:               new FormControl<string>('', {validators: [Validators.required], nonNullable: true}),
        unit:               new FormControl<UnitCreate>({}, {validators: [Validators.required], nonNullable: true}),
    });

    private fieldNames = {
        name: 'Nombre',
        description: 'Descripción',
        sku: 'Codigo',
        unit: 'Unidad',
    };

    private authService = inject(AuthService);
    public loginUser = computed(() => this.authService.currentUser()); 
    
    constructor(
        private ingredientsService: IngredientsService,
        private unitsService: UnitsService, 
        private usersService: UsersService,
        private messageService: MessageService, 
    ) { }
    
    ngOnInit() {
        const userId = this.loginUser()?.id;
        if (userId) {
            this.usersService.getUserById(userId).subscribe((user) => {
                if (user && Array.isArray(user.roles)) {
                    this.permissions = user.roles.flatMap((role: any) => Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.toString()) : []) || [];
                    this.ingredientsService.getIngredients().subscribe(ingredients => {
                        this.ingredients = ingredients.filter(ingredient => ingredient.status === true);
                    });
                    this.loading = false;
                };
            });
        };
    }

    get currentIngredients():IngredientsCreate {
        
        const ingredients = this.ingredientForm.value as IngredientsCreate;
        return ingredients;
    }

    openNew() {
        this.unitsService.getUnits().subscribe(units => {
            this.units = units.filter(unit => unit.status === true);
        });
        this.submitted = false;
        this.ingredientDialog = true;
    }

    deleteSelectedIngredient() {
        this.deleteIngredientsDialog = true;
    }

    editIngredient(ingredient: Ingredients) {
        if (ingredient.id) {
            this.ingredientsService.getIngredientById(ingredient.id).subscribe(ingredient => {
                if (ingredient) {
                    this.ingredientForm.patchValue(ingredient);
                } else {
                    Swal.fire('Error', 'No se encontró la unidad', 'error');
                }                
            });
            this.ingredientDialog = true;
        }
    }

    deleteIngredient(ingredient: Ingredients) {
        this.deleteIngredientDialog = true;
        this.ingredient = ingredient || {};
    }

    confirmDeleteSelected() {
        this.deleteIngredientsDialog = false;
        this.selectedIngredient.forEach(ingredient => { this.ingredientsService.deleteIngredientById(ingredient.id || '').subscribe( ()=> this.ngOnInit()); });
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Ingredientes Eliminados', life: 3000 });
        this.selectedIngredient = [];
    }

    confirmDelete() {
        this.deleteIngredientDialog = false;
        this.ingredientsService.deleteIngredientById(this.ingredient.id || '')
        .subscribe({
            next: unit => {
                Swal.fire('Eliminado', 'Unidad eliminada correctamente', 'success');
                this.ngOnInit();
                this.ingredient = {};
                this.deleteIngredientDialog = false;
            },
            error: (message) => {
                Swal.fire('Error', message.name, 'error');
            } 
        });          
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Ingrediente Eliminado', life: 3000 });
    }

    hideDialog() {
        this.ingredientForm.reset();
        this.ingredientDialog = false;
        this.submitted = false;
    }

    saveIngredient() {

        if (this.ingredientForm.invalid) {
            for (const field in this.ingredientForm.controls) { 
                if (this.ingredientForm.controls[field as keyof typeof this.ingredientForm.controls].invalid) {
                    const fieldName = this.fieldNames[field as keyof typeof this.fieldNames];
                    Swal.fire({
                        title: 'Error',
                        text: `Por favor, completa el campo ${fieldName}`,
                        icon: 'error',
                        customClass: {
                          popup: 'swal2-popup',
                        },
                        willOpen: () => {
                            this.ingredientDialog = false;
                        },
                        willClose: () => {
                            this.ingredientDialog = true;
                        }
                      });                    
                      return;
                }
            }            
        }

        if (this.currentIngredients.id) {
            this.ingredientsService.updateIngredient(this.currentIngredients)
            .subscribe({
                next: ingredient => {
                    Swal.fire('Guardado', 'Ingrediente actualizado correctamente', 'success');
                    this.submitted = true;
                    this.ingredientDialog = false;
                    this.ngOnInit();
                    this.ingredientForm.reset();
                },
                error: (message) => {
                    Swal.fire('Error', message.name, 'error');
                }            
            });
            return;
        } else {
            if(this.currentIngredients.unit){
                this.currentIngredients.unitId = this.currentIngredients.unit.id;
            }
            delete this.currentIngredients.id;
            this.ingredientsService.addIngredient(this.currentIngredients, this.loginUser()?.clientId || null)
            .subscribe({
                next: ingredient => {
                    Swal.fire('Guardado', 'Ingrediente Creado correctamente', 'success');
                    this.submitted = true;
                    this.ingredientDialog = false;
                    this.ngOnInit();
                    this.ingredientForm.reset();
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
