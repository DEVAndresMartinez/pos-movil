import { Component, OnInit, computed, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Products, ProductsCreate } from 'src/app/modules/interfaces/products.interface';
import { AuthService } from 'src/app/modules/service/auth.service';
import { ProductsService } from 'src/app/modules/service/products.service';
import { UsersService } from 'src/app/modules/service/users.service';
import Swal from 'sweetalert2';

@Component({
  templateUrl: './inventory.component.html',
  styles: `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }`,
  providers: [MessageService, ConfirmationService]
})
export class InventoryComponent implements OnInit {

  deleteProductDialog: boolean = false;

  deleteProductsDialog: boolean = false;

  selectedCategory: any;

  globalFilter: any;

  filteredProducts: any[] = [];

  products: Products[] = [];

  product: ProductsCreate = {
    ingredient: {
      id: '',
      name: '',
      description: '',
      sku: '',
      clientId: '',
      unitId: '',
      status: false,
      createdAt: '',
      updatedAt: '',
      unit: {
        id: '',
        name: '',
        abbreviation: '',
        clientId: '',
        status: false,
        createdAt: '',
        updatedAt: ''
      }
    }
  };

  selectedProduct: Products[] = [];

  submited: boolean = false;

  cols: any[] = [];

  rowsPerPageOptions = [5, 10, 20];

  permissions: string[] = [];

  loading = true;

  currentPageProducts: Products[] = [];
  selectedPageProducts: Set<string> = new Set();

  productToAdd: any;

  addDialog: boolean = false;
  popDialog: boolean = false;

  addForm!: FormGroup;
  popForm!: FormGroup;

  private authService = inject(AuthService);
  public loginUser = computed(() => this.authService.currentUser());

  constructor(
    private productsService: ProductsService,
    private usersService: UsersService,
    private messageService: MessageService,
    private router: Router,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    const userId = this.loginUser()?.id;
    if (userId) {
      this.usersService.getUserById(userId).subscribe((user) => {
        if (user && Array.isArray(user.roles)) {
          this.permissions = user.roles.flatMap((role: any) => Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.toString()) : []) || [];
          this.productsService.getProducts().subscribe(products => {
            this.products = products.filter(product => product.status === true);
          });
          this.loading = false;
        };
      });
    };

    this.initAddForm();
    this.initPopForm();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onEanFilter(table: Table, event: Event) {
    const eans = (event.target as HTMLInputElement).value;
    const filteredProducts = this.products.filter(ean => ean.ingredient.ean == eans);

    if (filteredProducts && filteredProducts.length === 1) {
      const products = filteredProducts[0];
      (event.target as HTMLInputElement).value = '';
      // table.clear();
    } else {
      if (eans.length == 13) {
        (event.target as HTMLInputElement).value = '';
        setTimeout(() => {
          Swal.fire('Error', ' Producto no encontrado o no hay stock disponible', 'error');
        }, 100)
      }
    }
  }

  createProduct() {
    if (this.router.url.includes('inventory')) {
      this.router.navigate(['/home/products/create']);
    }
  }

  onEditProduct(product: any) {
    this.router.navigate(['/home/products/edit', product.id]);
  }

  deleteSelectedProduct() {
    this.deleteProductsDialog = true;
  }

  deleteProduct(product: Products) {
    this.deleteProductDialog = true;
    this.product = product || {};
  }

  confirmDeleteSelect(table: any) {
    this.deleteProductsDialog = false;
    const start = table.first;
    const end = table.first + table.rows;

    const productsToDelete = this.selectedProduct.filter(product => {
      const productIndex = this.products.indexOf(product);
      return productIndex >= start && productIndex < end;
    })
    productsToDelete.forEach(product => {
      this.productsService.deleteProductById(product.id || '').subscribe(() => {
        this.ngOnInit();
      });
    });
    this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Productos Eliminados', life: 3000 });
    this.selectedProduct = [];
    table.reset();
  }

  confirmDelete() {
    this.deleteProductDialog = false;
    this.productsService.deleteProductById(this.product.id || '')
      .subscribe({
        next: product => {
          Swal.fire('Eliminado', 'Producto eliminado correctamente', 'success');
          this.ngOnInit();
          this.product = {
            ingredient: {
              id: '',
              name: '',
              description: '',
              sku: '',
              clientId: '',
              unitId: '',
              status: false,
              createdAt: '',
              updatedAt: '',
              unit: {
                id: '',
                name: '',
                abbreviation: '',
                clientId: '',
                status: false,
                createdAt: '',
                updatedAt: ''
              }
            }
          };
          this.deleteProductDialog = false;
        },
        error: (message) => {
          Swal.fire('Error', message.name, 'error');
        }
      });
    this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Producto Eliminado', life: 3000 });
  }

  initAddForm() {
    this.addForm = this.fb.group({
      quantity: new FormControl<number | null>(null),
      detail: new FormControl<string | ''>('', Validators.maxLength(250))
    })
  }

  initPopForm() {
    this.popForm = this.fb.group({
      quantity: new FormControl<number | null>(null),
      detail: new FormControl<string | ''>('', Validators.maxLength(250))
    })
  }


  addStockDialog(product: any) {
    this.addDialog = true;
    this.productToAdd = product;
  }

  popStockDialog(product: any) {
    this.popDialog = true;
    this.productToAdd = product;
  }

  addStock() {
    const quantity = this.addForm.value.quantity;
    if (quantity <= 0 || quantity === null) {
      this.addDialog = false
      Swal.fire('Error', 'Debe ingresar una cantidad positiva', 'error').then(() => {
        this.addDialog = true
      });
      return;
    } else {
      this.addDialog = false;
      this.productsService.updateStock(this.productToAdd.id, this.addForm.value.quantity || 0, this.addForm.value.detail)
       .subscribe(() => {
          Swal.fire('Agregado', 'Stock agregado correctamente', 'success');
          this.ngOnInit();
        });
      this.messageService.add({ severity:'success', summary: 'Exitoso', detail: 'Stock Agregado', life: 3000 });
      this.addForm.reset();
    }
  }

  popStock() {
    const quantity = this.popForm.value.quantity;
    if (quantity <= 0 || quantity === null) {
      this.popDialog = false
      Swal.fire('Error', 'Debe ingresar una cantidad mayor a cero', 'error').then(() => {
        this.popDialog = true
      });
    } else if (quantity > this.productToAdd.actualQuantity) {
      this.popDialog = false
      Swal.fire('Error', 'La cantidad ingresada no puede ser mayor a la existente', 'error').then(() => {
        this.popDialog = true
      });
    } else {
      this.popDialog = false;
      this.productsService.updateStock(this.productToAdd.id, (this.popForm.value.quantity * -1) || 0, this.popForm.value.detail)
      .subscribe(() => {
          Swal.fire('Agregado', 'Stock retirado correctamente', 'success');
          this.ngOnInit();
        });
      this.messageService.add({ severity:'success', summary: 'Exitoso', detail: 'Stock Retirado', life: 3000 });
      this.popForm.reset();
    }

  }

  isAdmin(): boolean {
    if (this.loginUser()?.roles?.some(role => role.slug === 'admin')) return true;
    return false;
  }

}