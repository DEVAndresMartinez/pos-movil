import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, computed } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import * as saveAs from "file-saver";
import { catchError, switchMap, throwError } from "rxjs";
import { Unit } from "src/app/modules/interfaces";
import { TaxesType } from "src/app/modules/interfaces/taxes";
import { AuthService } from "src/app/modules/service/auth.service";
import { ProductsService } from "src/app/modules/service/products.service";
import { TaxesService } from "src/app/modules/service/taxes.service";
import { UnitsService } from "src/app/modules/service/units.service";
import Swal from "sweetalert2";

import * as XLSX from 'xlsx';

@Component({
    templateUrl: './products-create.component.html',
    styleUrl: './products-create.component.scss',
})
export class ProductsCreateComponent implements OnInit {

    productDialog: boolean = false;
    submitted: boolean = false;
    taxes: TaxesType[] = [];
    units: Unit[] = [];
    isEdit: boolean = false;
    isView: boolean = false;
    loading: boolean = true;
    estados: any[] = [];
    permissions: string[] = [];
    selectedProduct: any;
    unitIdSelect: any;
    selectedFile: File | null = null;
    importDialog: boolean = false;
    actualQuantityEdit: number = 0;
    productForm = new FormGroup({
        id: new FormControl<string>(''),
        name: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        description: new FormControl<string>(''),
        sku: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        unitId: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
        status: new FormControl<boolean>(true),
        price: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
        actualQuantity: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
        minQuantity: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
        taxesIds: new FormControl<any[]>([]),
        ean: new FormControl<string>('', { validators: [Validators.maxLength(13)], nonNullable: true })
    })

    fieldNames: { [key: string]: string } = {

        name: 'Nombre del Producto',
        description: 'Descripción del Producto',
        sku: 'Código SKU del Producto',
        unitId: 'Unidad del Producto',
        price: 'Precio del Producto',
        actualQuantity: 'Cantidad Actual del Producto',
        minQuantity: 'Cantidad Mínima del Producto',
        taxesIds: 'Impuestos del Producto',
        ean: 'EAN del Producto',
    }

    public loginUser = computed(() => this.authService.currentUser());

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private productsService: ProductsService,
        private authService: AuthService,
        private unitsService: UnitsService,
        private taxesService: TaxesService
    ) { }

    get currentProduct(): any {
        const product = this.productForm.value as any;
        product.taxesIds = product.taxesIds.map((taxId: any) => taxId);
        return product;
    }

    ngOnInit(): void {
        this.taxesService.getTypeTaxes().subscribe(
            res => {
                if (res) {
                    this.taxes = res.filter(tax => tax.status === true);
                }
            }
        )
        this.unitsService.getUnits()
            .pipe(
                catchError(error => throwError(error))
            )
            .subscribe(units => {
                this.units = units.filter(unit => unit.status === true);
            });
        if (this.router.url.includes('edit')) {
            this.activatedRoute.params
                .pipe(switchMap(({ id }) => this.productsService.getProductsById(id)))
                .subscribe(product => {
                    if (!product) {
                        return this.router.navigateByUrl('/');
                    }
                    this.isEdit = true;
                    this.selectedProduct = product?.ingredient.unit.name;
                    this.unitIdSelect = product?.ingredient.unit.id;
                    this.actualQuantityEdit = product?.actualQuantity;
                    this.productForm.patchValue({
                        id: product.id,
                        name: product.ingredient.name,
                        description: product.ingredient.description,
                        sku: product.ingredient.sku,
                        unitId: this.unitIdSelect,
                        price: product.price,
                        actualQuantity: 0,
                        minQuantity: product.minQuantity,
                        taxesIds: product.ingredient.taxesIngredients.map((tax: any) => tax.tax.id),
                        ean: product.ingredient.ean,
                    });
                    if (product.actualQuantity <= product.minQuantity) {
                        this.productForm.controls.actualQuantity.enable();
                    } else {
                        this.productForm.controls.actualQuantity.disable();
                    }
                    this.loading = false;
                    return
                });
        } else {
            this.isEdit = false;
            this.productForm.controls.actualQuantity.enable();
            this.loading = false;
        }
    }

    onUnitChange(event: any) {
        const selectedUnit = event.value;
        this.selectedProduct = selectedUnit.name;
        if (selectedUnit && selectedUnit.id) {
            this.productForm.patchValue({
                unitId: selectedUnit.id
            });
            this.units = [selectedUnit, ...this.units.filter(unit => unit.id !== selectedUnit.id)];
        }
    }

    hideDialog() {
        this.productForm.reset();
        this.productDialog = false;
        this.submitted = false;
    }

    onSubmit() {
        if (this.productForm.invalid) {
            for (const field in this.productForm.controls) {
                if (this.productForm.controls[field as keyof typeof this.productForm.controls].invalid) {
                    const fieldName = this.fieldNames[field as keyof typeof this.fieldNames];
                    Swal.fire({
                        title: 'Error',
                        html: `Por favor, el campo <b> ${fieldName} </b> no puede estar vacío o es inválido.`,
                        icon: 'error',
                        customClass: {
                            popup: 'swal2-popup'
                        },
                        willOpen: () => {
                            this.productDialog = false;
                        },
                        willClose: () => {
                            this.productDialog = true;
                        }
                    });
                    return;
                }
            }
        }

        const productData = { ...this.currentProduct };
        if (!this.isEdit) {
            productData.taxesIds = this.productForm.value.taxesIds ? this.productForm.value.taxesIds : [];
            this.productsService.validateSku(this.productForm.get('sku')?.value || '').subscribe(
                res => {
                    if (res) {
                        Swal.fire({
                            title: 'Error',
                            html: 'El código SKU ya existe. Por favor, ingrese un nuevo código.',
                            icon: 'error',
                            customClass: {
                                popup: 'swal2-popup'
                            },
                            willOpen: () => {
                                this.productDialog = false;
                            },
                            willClose: () => {
                                this.productDialog = true;
                            }
                        });
                    } else {
                        this.productsService.validateEan(this.productForm.get('ean')?.value || '').subscribe(
                            data => {
                                if (data) {
                                    Swal.fire({
                                        title: 'Error',
                                        html: 'El código EAN ya existe. Por favor, ingrese un nuevo código.',
                                        icon: 'error',
                                        customClass: {
                                            popup: 'swal2-popup'
                                        },
                                        willOpen: () => {
                                            this.productDialog = false;
                                        },
                                        willClose: () => {
                                            this.productDialog = true;
                                        }
                                    });
                                } else {
                                    delete productData.id;
                                    this.productsService.addProduct(productData, this.loginUser()?.clientId || null)
                                        .subscribe(
                                            (data: any) => {
                                                Swal.fire('Guardado', 'Producto creado correctamente', 'success');
                                                this.submitted = true;
                                                this.productForm.reset();
                                                this.selectedProduct = '';
                                            },
                                            (error: HttpErrorResponse) => {
                                                if (error.error.message === 'the sku already exists') {
                                                    Swal.fire({
                                                        title: 'Error',
                                                        html: 'El código SKU ya existe. Por favor, ingrese un nuevo código.',
                                                        icon: 'error',
                                                        customClass: {
                                                            popup: 'swal2-popup'
                                                        },
                                                        willOpen: () => {
                                                            this.productDialog = false;
                                                        },
                                                        willClose: () => {
                                                            this.productDialog = true;
                                                        }
                                                    });
                                                } else {
                                                    Swal.fire('Error', 'Hubo un problema al crear el producto.', 'error');
                                                }
                                            }
                                        );
                                }
                            });
                    }

                }
            )
        } else {
            if (this.currentProduct.id) {
                if (this.actualQuantityEdit !== null && this.actualQuantityEdit !== undefined) {
                    const currentActualQuantity = this.productForm.value.actualQuantity ?? 0;
                    const newActualQuantity = this.actualQuantityEdit + currentActualQuantity;

                    this.productForm.patchValue({
                        actualQuantity: newActualQuantity
                    });
                }

                this.productsService.updateProducts(productData)
                    .subscribe({
                        next: () => {
                            Swal.fire('Guardado', 'Producto actualizado correctamente', 'success');
                            this.submitted = true;
                            this.productDialog = false;
                            this.ngOnInit();
                            this.productForm.reset();
                        },
                        error: (err) => {
                            Swal.fire('Error', err?.message || 'Error al actualizar el producto', 'error');
                        }
                    });
            }
        }
    }

    onBack() {
        if (this.router.url.includes('edit') || this.router.url.includes('create')) {
            this.router.navigate(['/home/products/inventory']);
        }
    }

    downloadFormat() {
        this.productsService.downloadFormat().subscribe(
            (res: Blob) => {
                const file = 'Formato para Cargue de Productos.xlsx';
                saveAs(res, file);
                Swal.fire('Exitoso', 'Formato descargado con éxioto', 'success')
            }, error => {
                Swal.fire('Error', 'Hubo un problema al descargar el formato.', 'error');
            });
    }

    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        if (file) {
            this.selectedFile = file;
        }
        this.importDialog = true;
    }

    uploadFormat() {
        if (this.selectedFile) {
            this.productsService.uploadFormat(this.selectedFile).subscribe(
                res => {
                    this.importDialog = false;
                    if (res) {
                        Swal.fire('Archivo importado', 'Formato procesado con éxito', 'success').then(() => {
                            this.ngOnInit();
                            
                            if (res.total_success === 0) {
                                Swal.fire('Algo salió mal', 'No se pudieron cargar los productos debido a un error', 'error');
                                this.selectedFile = null;
                                return;
                            }
                            const productsExists = res.data.products_exist;
                            const productsErrors = res.data.products_errors;
    
                            if (productsExists.length > 0 && productsErrors.length > 0) {
                                const existingProducts = productsExists.map((product: any) => `<li>${product.name}</li>`).join('');
                                const errorProducts = productsErrors.map((product: any) => `<li>${product.name}</li>`).join('');
                            
                                Swal.fire({
                                    title: 'Productos existentes',
                                    html: `<p>Los siguientes productos ya existen en la base de datos:</p><ul>${existingProducts}</ul>`,
                                    icon: 'warning',
                                }).then(() => {
                                    Swal.fire({
                                        title: 'Productos con errores',
                                        html: `<p>Los siguientes productos presentaron errores durante la importación:</p><ul>${errorProducts}</ul>`,
                                        icon: 'error',
                                    });
                                });
                            }
                             else if (productsExists.length > 0) {
                                const existingProducts = productsExists.map((product: any) => `<li>${product.name}</li>`).join('');
                                Swal.fire({
                                    title: 'Productos existentes',
                                    html: `<p>Los siguientes productos ya existen en la base de datos:</p><ul>${existingProducts}</ul>`,
                                    icon: 'warning',
                                });
    
                            } else if (productsErrors.length > 0) {
                                const errorProducts = productsErrors.map((product: any) => `<li>${product.name}</li>`).join('');
                                Swal.fire({
                                    title: 'Productos con errores',
                                    html: `<p>Los siguientes productos presentaron errores durante la importación:</p><ul>${errorProducts}</ul>`,
                                    icon: 'error',
                                });
    
                            } else if (res.data.success.length > 0) {
                                Swal.fire('Completado', 'Productos guardados con éxito', 'success');
                            }
    
                            this.selectedFile = null;
                        });
                    }
                },
                error => {
                    Swal.fire('Error', 'Hubo un problema al importar el archivo.', 'error');
                }
            );
        } else {
            Swal.fire('Error', 'Por favor seleccione un archivo', 'error');
        }
    }

    cancelImport() {
        this.selectedFile = null;
        this.importDialog = false;
    }

    triggerFileUpload(): void {
        const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
        fileInput.click();
    }

    restrictInput(event: KeyboardEvent): void {
        const inputElement = event.target as HTMLInputElement;
        if (event.key === '-' || event.key === 'e') {
            event.preventDefault();
        }
        if (inputElement.value.length >= 3) {
            event.preventDefault();
        }
    }

    restrictInputPrice(event: KeyboardEvent): void {
        const inputElement = event.target as HTMLInputElement;
        if (event.key === '-' || event.key === 'e') {
            event.preventDefault();
        }
        if (inputElement.value.length > 8) {
            event.preventDefault();
        }
    }
}