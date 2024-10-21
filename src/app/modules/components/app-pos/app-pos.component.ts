import { Component, computed, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { ProductsService } from '../../service/products.service';
import { UsersService } from '../../service/users.service';
import { Products } from '../../interfaces/products.interface';
import { Table } from 'primeng/table';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { FinalCustomerService } from '../../service/final-customer.service';
import { FinalCutomerCreate } from '../../interfaces/final-customer';
import { City, Country, Department } from '../../interfaces/location';
import { LocationService } from '../../service/location.service';
import { filter, forkJoin, map, Observable, Subscription, switchMap } from 'rxjs';
import { SalesService } from '../../service/sales.service';
import { PaymentMethodService } from '../../service/payment-method.service';
import { PaymentMethod } from '../../interfaces/payment-method';
import { PrintService } from '../../service/print.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TaxesService } from '../../service/taxes.service';

@Component({
  templateUrl: './app-pos.component.html',
  styleUrls: ['./app-pos.component.scss']
})
export class AppPosComponent implements OnInit {

  saleIdEdit: string | null = null;
  salesDetailsds: any[] = [];
  saleForm!: FormGroup;
  saleId!: string;
  selectedProducts: any[] = [];
  permissions: string[] = [];
  products: Products[] = [];
  stock: any[] = [];
  actual!: number;
  minim!: number;
  selectedProduct: Products[] = [];
  cols: any[] = [];
  submitted: boolean = false;
  unitDialog: boolean = false;
  paymentDialog: boolean = false;
  cancelDialog: boolean = false;
  saveDialog: boolean = false;
  linkClientDialog: boolean = false;
  uploadDialog: boolean = false;
  loading: boolean = true;
  countries!: Country[];
  countryId: any;
  departments!: Department[];
  departmentId: any;
  cities!: City[];
  countrySubscription: Subscription | undefined;
  departmentSubscription: Subscription | undefined;
  payment!: number;
  paymentMethod: PaymentMethod[] = [];
  selectedPaymentMethod: string = '';
  nameCustomer: string = '';
  personType = [
    {
      "id": 1,
      "name": "Persona Jurídica "
    },
    {
      "id": 2,
      "name": "Persona Natural"
    }
  ];
  identificationType: any[] = [];
  regimeType = [
    {
      "id": 48,
      "name": "Responsable de IVA"
    },
    {
      "id": 49,
      "name": "No responsable de IVA"
    }
  ];
  taxesType: any[] = [];
  digitoVerificacion!: number;
  totalIva: number = 0;
  totalIC: number = 0;
  custom: boolean = false;
  customerIdtoLoad: string = "";
  idSale: string = '';
  idSaleDetail: string = '';
  finalCustomerForm = new FormGroup({
    personType: new FormControl<number | null>(null, Validators.required),
    identificationTypeId: new FormControl<string | null>(null, Validators.required),
    identification: new FormControl<any>('', Validators.required),
    identificationDv: new FormControl<number | null>(null),
    regimeType: new FormControl<number | null>(null),
    taxResponsible: new FormControl<string | null>(null),
    tax: new FormControl<string | null>(null),
    businessName: new FormControl<any>(''),
    firstName: new FormControl<any>(''),
    secondName: new FormControl<any>(''),
    lastName: new FormControl<any>(''),
    phoneNumber: new FormControl<any>(''),
    countryId: new FormControl<any>(''),
    departmentId: new FormControl<any>(''),
    cityId: new FormControl<any>(''),
    address: new FormControl<any>(''),
    email: new FormControl<any>('', Validators.required),
  })
  saleToEdit: string = '';
  personTypeSelected!: any;
  printerSize: any[] = [
    {
      id: 48,
      name: '48mm'
    },
    {
      id: 32,
      name: '32mm'
    }
  ];
  printSize: number = this.printerSize[0].id;

  @ViewChild('eanInput') eanInput!: ElementRef;

  private fieldNames = {
    personType: 'Tipo Persona',
    identificationTypeId: 'Tipo Identificación',
    identification: 'Número Identificación',
    identificationDv: 'Dv',
    regimeType: 'Régimen',
    taxResponsible: 'Responsabilidades',
    tax: 'Impuestos',
    businessName: 'Razón Social',
    firstName: 'Primer Nombre Cliente',
    secondName: 'Segundo Nombre Cliente',
    lastName: 'Apellidos Cliente',
    phoneNumber: 'Teléfono',
    countryId: 'País',
    departmentId: 'Departameto / Estado',
    cityId: 'Municipio / Ciudad',
    address: 'Dirección',
    email: 'Correo Electrónico',
  }
  private authService = inject(AuthService);
  public loginUser = computed(() => this.authService.currentUser());

  constructor(
    private productService: ProductsService,
    private finalCustomer: FinalCustomerService,
    private userService: UsersService,
    private location: LocationService,
    private salesService: SalesService,
    private payMethod: PaymentMethodService,
    private printService: PrintService,
    private fb: FormBuilder,
    private taxeService: TaxesService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.saleIdEdit = this.salesService.getSaleId();
    if (this.saleIdEdit !== null) {
      this.loadSaleForEdit();
    }
    this.calcular();
    const userId = this.loginUser()?.id;
    if (userId) {
      this.userService.getUserById(userId).subscribe((user) => {
        if (user && Array.isArray(user.roles)) {
          this.permissions = user.roles.flatMap((role: any) => Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.toString()) : []) || [];
          this.productService.getProducts().subscribe(products => {
            this.products = products.filter(product => product.status === true && product.price !== null);
            if (!localStorage.getItem('actualStockExecuted')) {
              this.actualStock();
              localStorage.setItem('actualStockExecuted', 'true');
            }
          });
          this.loading = false;
        }
      })
    }
    this.initSaleForm();
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    this.finalCustomerForm.reset();
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'F2') {
      this.focusEanInput();
    }
  }

  focusEanInput() {
    this.eanInput.nativeElement.focus();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onEanFilter(table: Table, event: Event) {
    const eans = (event.target as HTMLInputElement).value;
    const filteredProducts = this.products.filter(ean => ean.ingredient.ean == eans);

    if (filteredProducts && filteredProducts.length === 1) {
      const products = filteredProducts[0];
      this.addSaleDetail(products);
      (event.target as HTMLInputElement).value = '';
      table.clear();
    } else {
      if (eans.length == 13) {
        (event.target as HTMLInputElement).value = '';
        setTimeout(() => {
          Swal.fire('Error', ' Producto no encontrado o no hay stock disponible', 'error');
        }, 100)
      }
    }
  }

  handleEanEnter(table: Table, event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onEanFilter(table, event as any)
    }
  }

  hideDialog() {
    this.finalCustomerForm.reset();
    this.unitDialog = false;
    this.submitted = false;
  }

  hideDialogNew() {
    this.finalCustomerForm.reset();
    this.unitDialog = false;
    this.submitted = false;
  }

  openNew() {
    this.taxeService.getTaxes().subscribe(
      res => {
        if (res && res.length > 0) {
          this.taxesType = res;
        }
      })
    this.personTypeChange();
    this.finalCustomer.getIdentificationType().subscribe(
      res => {
        if (res && res.length > 0) {
          this.identificationType = res;
        }
      }
    )
    this.finalCustomerForm.get('identification')?.valueChanges.subscribe(value => {
      this.calcular();
    });
    this.submitted = false;
    this.unitDialog = true;
    this.location.getCountry().subscribe(res => {
      if (res) {
        this.countries = Array.isArray(res) ? res : [];
      }
    });

    this.countrySubscription = this.finalCustomerForm.get('countryId')?.valueChanges.pipe(
      filter(countryId => !!countryId),
      switchMap(countryId => this.location.getDepartment(countryId))
    ).subscribe(res => {
      if (res) {
        this.departments = Array.isArray(res) ? res : [];
      }
    });

    this.departmentSubscription = this.finalCustomerForm.get('departmentId')?.valueChanges.pipe(
      filter(departmentId => !!departmentId),
      switchMap(departmentId => this.location.getCity(departmentId))
    ).subscribe(res => {
      if (res) {
        this.cities = Array.isArray(res) ? res : [];
      }
    });
  }

  personTypeChange() {
    this.finalCustomerForm.get('personType')?.valueChanges.subscribe(
      value => {
        if (value === 1) {
          this.finalCustomerForm.get('identificationTypeId')?.setValue('7f46ef52-1d5c-41d4-9eee-fca8f3da8942');
          this.finalCustomerForm.get('businessName')?.setValidators(Validators.required);
          this.finalCustomerForm.get('firstName')?.clearValidators();
          this.finalCustomerForm.get('lastName')?.clearValidators();
        } else {
          this.finalCustomerForm.get('businessName')?.clearValidators();
          this.finalCustomerForm.get('identificationTypeId')?.setValue(null);
          this.finalCustomerForm.get('firstName')?.setValidators(Validators.required);
          this.finalCustomerForm.get('lastName')?.setValidators(Validators.required);
        }
        this.finalCustomerForm.get('businessName')?.updateValueAndValidity();
        this.finalCustomerForm.get('firstName')?.updateValueAndValidity();
        this.finalCustomerForm.get('lastName')?.updateValueAndValidity();
      }
    );
  }

  finalCustomerCustom() {
    if (this.custom) {
      this.custom = false;
      this.finalCustomerForm.valueChanges.subscribe(
        () => {
          if (!this.custom) {
            this.finalCustomerForm.reset();
            this.finalCustomerForm.clearValidators();
          }
        }
      )
    } else {
      this.custom = true;
    }
  }

  saveFinalCustomer() {
    if (this.finalCustomerForm.invalid) {
      for (const field in this.finalCustomerForm.controls) {
        if (this.finalCustomerForm.controls[field as keyof typeof this.finalCustomerForm.controls].invalid) {
          const fieldName = this.fieldNames[field as keyof typeof this.fieldNames];
          Swal.fire({
            title: 'Error',
            html: `Por favor, completa el campo <b>${fieldName}</b>`,
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
    } else {
      const finalCustomer: FinalCutomerCreate = {
        personType: this.finalCustomerForm.value.personType ?? 0,
        identificationTypeId: this.finalCustomerForm.value.identificationTypeId ?? '',
        identification: this.finalCustomerForm.value.identification,
        identificationDv: this.finalCustomerForm.value.identificationDv ?? 0,
        regimeType: this.finalCustomerForm.value.regimeType ?? null,
        taxResponsible: this.finalCustomerForm.value.taxResponsible ?? null,
        tax: this.finalCustomerForm.value.tax ?? null,
        businessName: this.finalCustomerForm.value.businessName,
        firstName: this.finalCustomerForm.value.firstName,
        secondName: this.finalCustomerForm.value.secondName,
        lastName: this.finalCustomerForm.value.lastName,
        phoneNumber: this.finalCustomerForm.value.phoneNumber,
        countryId: this.finalCustomerForm.value.countryId,
        departmentId: this.finalCustomerForm.value.departmentId,
        cityId: this.finalCustomerForm.value.cityId,
        address: this.finalCustomerForm.value.address,
        email: this.finalCustomerForm.value.email,
      };
      this.finalCustomer.addFinalCustomer(finalCustomer).subscribe({
        next: finalCustomers => {
          Swal.fire('Guardado', 'Cliente Final Creado correctamente', 'success').then(() => {
            this.finalCustomerForm.reset({
              personType: null,
            });
            this.submitted = false;
            this.unitDialog = false;
          });
          this.ngOnInit();
        },
        error: (message) => {
          Swal.fire('Error', message.name, 'error');
        }
      });
    }
    this.unitDialog = false;
  }

  get salesDetail(): FormArray {
    return this.saleForm.get('salesDetail') as FormArray;
  }

  initSaleForm() {
    this.saleForm = this.fb.group({
      name: [`Venta`],
      identification: [''],
      customerId: [''],
      salesDetail: this.fb.array([]),
      paymentMethodId: null,
    });
  }

  createSale() {
    const identification = this.saleForm.get('identification')?.value;

    if (identification) {
      this.finalCustomer.getByIdentification(identification).subscribe(
        res => {
          if (res) {
            this.nameCustomer = res.fullName || res.businessName || 'Consumidor Final';
            this.saleForm.patchValue({
              customerId: res.id,
              name: `Venta de ${identification}`,
              paymentMethod: null
            });

            this.submitSale();
          }
        },
        () => {
          Swal.fire({
            title: 'Error',
            html: `No existe un cliente con la identificación <b>${identification}</b>`,
            icon: 'error',
            customClass: {
              popup: 'swal2-popup',
            }
          }).then(() => {
            this.openNew();
          });
        }
      );
    } else {
      this.saleForm.patchValue({
        name: `Venta sin identificación`,
        identification: null,
        customerId: null,
        paymentMethodId: null,
        salesDetail: []
      });
      this.submitSale();
    }
  }

  submitSale() {
    const data = this.saleForm.value;
    this.salesService.createSale(data).subscribe(
      res => {
        this.idSale = res.id;
        this.linkClientDialog = false;
        Swal.fire({
          title: 'Inicio de Venta',
          text: 'Venta Creada con éxito',
          icon: 'success',
          customClass: {
            popup: 'swal2-popup',
          }
        });
        this.saleForm.get('identification')?.disable();
        this.paymentDialog = false;
      },
      () => {
        this.linkClientDialog = false;
        Swal.fire({
          title: 'Error',
          text: 'Es necesario hacer apertura de caja.',
          icon: 'error',
          customClass: {
            popup: 'swal2-popup',
          }
        }).then(() => {
          this.router.navigate(['/home/cash']);
        });
      }
    );
  }

  validateQuantity(event: any, availableQuantity: number) {
    const inputValue = parseInt(event.target.value);

    if (inputValue > availableQuantity) {
      Swal.fire('Error', 'No hay suficiente stock disponible', 'error');
      event.target.value = availableQuantity;
    }
  }

  addSaleDetail(product: any) {
    const idSale = this.idSale;

    if (idSale !== '') {
      const availableQuantity = product.actualQuantity;
      const existingProductIndex = this.salesDetail.controls.findIndex((detail) => detail.value.stocktakingBranchId === product.id);
      if (existingProductIndex >= 0) {
        const existingProduct = this.salesDetail.at(existingProductIndex) as FormGroup;
        const newQuantity = existingProduct.controls['quantity'].value + 1;

        if (newQuantity > availableQuantity) {
          Swal.fire('Error', 'No hay suficiente stock disponible', 'error');
        } else {
          existingProduct.controls['quantity'].setValue(newQuantity);
        }
      } else {
        if (availableQuantity <= 0) {
          Swal.fire('Error', 'No hay stock disponible para agregar este producto', 'error');
          return;
        }

        const detail = this.fb.group({
          stocktakingBranchId: [product.id, Validators.required || product.stocktakingBranch.id],
          quantity: [1, Validators.required || product.quantity],
          price: [product.price, Validators.required || product.unitPrice],
          name: [product.ingredient.name, Validators.required || product.stocktakingBranch.ingredient.name],
          description: [product.ingredient.description, Validators.required || product.stocktakingBranch.ingredient.description],
          sku: [product.ingredient.sku, Validators.required || product.stocktakingBranch.ingredient.sku],
          actualQuantity: [product.actualQuantity]
        });
        this.salesDetail.push(detail);
        detail.valueChanges.subscribe(() => {
          this.calculateTaxes();
        });
      }
      this.calculateTaxes();
    } else {
      this.linkClientDialog = true;
    }
  }

  incrementSaleDetail(index: number) {
    const existingProduct = this.salesDetail.at(index) as FormGroup;
    const availableQuantity = existingProduct.controls['actualQuantity'].value;
    const currentQuantity = existingProduct.controls['quantity'].value;
    const newQuantity = currentQuantity + 1;

    if (newQuantity > availableQuantity) {
      Swal.fire('Error', 'No hay suficiente stock disponible', 'error');
      this.calculateTaxes();
    } else {
      existingProduct.controls['quantity'].setValue(newQuantity);
    }
    this.calculateTaxes();
  }

  decrementSaleDetail(index: number) {
    const existingProduct = this.salesDetail.at(index) as FormGroup;
    const currentQuantity = existingProduct.controls['quantity'].value;
    const newQuantity = currentQuantity - 1;

    if (newQuantity <= 0) {
      this.salesDetail.removeAt(index);
      this.calculateTaxes();
    } else {
      existingProduct.controls['quantity'].setValue(newQuantity);
    }
    this.calculateTaxes();
  }

  removeSaleDetail(index: number) {
    this.calculateTaxes();
    this.salesDetail.removeAt(index);
  }

  openCharge() {
    this.submitted = false;
    this.paymentDialog = true;

    this.payMethod.getPaymentMethods().subscribe(
      res => {
        if (res) {
          this.paymentMethod = res;
        }
      });
  }

  reload() {
    this.idSale = '';
    this.salesService.clearSaleId();
    this.nameCustomer = '';
    this.totalIva = 0;
    this.totalIC = 0;
    this.calculateTaxes();
    this.saleForm.reset();
    this.selectedPaymentMethod = '';
    this.payment = 0;
    this.ngOnInit();
  }

  deleteDetails(saleDelete: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.salesService.getSaleById(saleDelete).subscribe(res => {
        this.salesDetailsds = res.sale.salesDetail.map((detail: any) => detail.id);
        if (this.salesDetailsds.length > 0) {
          const deletePromises = this.salesDetailsds.map((ids: any) => {
            return new Promise((resolve, reject) => {
              this.salesService.deleteSaleDetail(ids).subscribe(
                res => {
                  resolve(true);
                }, (error: HttpErrorResponse) => {
                  if (error.status === 200) {
                    resolve(true);
                  } else {
                    reject(error);
                  }
                }
              );
            });
          });
          Promise.all(deletePromises).then(() => {
            resolve();
          }).catch(error => {
            reject(error);
          });
        } else {
          resolve();
        }
      });
    });
  }


  validatePayment() {
    if (this.payment < this.subTotal) {
      this.showError('El monto pagado es menor al total de la venta.');
      return false;
    }
    if (!this.selectedPaymentMethod) {
      this.showError('Por favor, seleccione un método de pago.');
      return false;
    }
    return true;
  }

  showError(message: any) {
    this.paymentDialog = false;
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      customClass: {
        popup: 'swal2-popup',
      }
    }).then(() => {
      this.paymentDialog = true;
    });
  }

  handleSaleConfirmation(billingType: string) {
    if (this.saleForm.valid && this.idSale) {
      this.deleteDetails(this.idSale).then(() => {
        const saleDetails = this.saleForm.value.salesDetail.map((detail: any) => ({
          stocktakingBranchId: detail.stocktakingBranchId,
          quantity: detail.quantity
        }));

        const addDetailsRequests = saleDetails.map((detail: any) =>
          this.salesService.addSaleDetails(this.idSale, detail)
        );

        forkJoin(addDetailsRequests).subscribe(
          () => {
            const saleConfirmationData = {
              status: 'PAID',
              paymentMethodId: this.selectedPaymentMethod,
              customerId: this.saleForm.get('customerId')?.value,
              billingType,
              received: this.payment,
              change: this.change,
              printerSize: this.printSize
            };

            this.salesService.updateStatusSale(this.idSale, saleConfirmationData).subscribe(
              () => {
                this.paymentDialog = false;
                Swal.fire({
                  title: 'Confirmación',
                  text: 'Venta confirmada con éxito, ¿Desea imprimir la factura?',
                  icon: 'success',
                  showCancelButton: true,
                  confirmButtonText: 'Si',
                  cancelButtonText: 'No'
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.handleInvoicePrinting();
                  } else {
                    this.reload();
                    Swal.fire({
                      title: 'Confirmación',
                      text: 'La venta ha sido guardada',
                      icon: 'success',
                    })
                  }
                });
              },
            );
          },
          error => {
            this.paymentDialog = false;
            this.payment = 0;
            this.showError(`Error al agregar los detalles de venta: ${error}`);
          }
        );
      }).catch(error => {
        this.showError(`Error al eliminar los detalles de venta: ${error}`);
      });
    } else {
      this.showError('Por favor, complete todos los campos requeridos.');
    }
  }

  handleInvoicePrinting() {
    const x = this.idSale;
    this.salesService.invoiceBody(this.idSale).subscribe(res => {
      if (res) {
        let invoice = res.invoiceBody;
        let printCompleted = false;
        let slowConnection = false;

        const timeout = setTimeout(() => {
          if (!printCompleted) {
            slowConnection = true;
            Swal.fire('Conexión lenta', 'La impresión está tardando más de lo esperado. Intente más tarde.', 'warning');
          }
        }, 10000);

        this.printService.printTicket(invoice).subscribe(
          () => {
            clearTimeout(timeout);
            if (!slowConnection) {
              printCompleted = true;
              Swal.fire('Imprimiendo', 'Imprimiendo factura', 'success');
            }
          },
          error => {
            clearTimeout(timeout);
            if (!slowConnection) {
              printCompleted = true;
              Swal.fire('Error de impresión', 'Revise la conexión de su impresora', 'error');
              this.downloadPdf(x);
            }
          }
        );
      }
      this.reload();
    });
  }

  confirmLocalSale() {
    if (this.validatePayment()) {
      this.handleSaleConfirmation('POS');
    }
  }

  confirmDianSale() {
    if (this.validatePayment()) {
      this.handleSaleConfirmation('FAC');
    }
  }

  downloadPdf(idSale: string) {
    this.salesService.downloadInvoicePdf(idSale).subscribe(
      res => {
        if (res) {
          const file = new Blob([res], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL);
        } else {
          Swal.fire('Error', 'No se pudo descargar el PDF', 'error');
        }
      }
    )
  }

  getPaymentIcon(paymentMethodName: string): string {
    switch (paymentMethodName.toLowerCase()) {
      case 'efectivo':
        return '../../../../assets/modules/images/pay-method/Efectivo.png';
      case 'tarjeta débito':
        return '../../../../assets/modules/images/pay-method/Debito.png';
      case 'tarjeta crédito':
        return '../../../../assets/modules/images/pay-method/Credito.png';
      case 'transferencia débito bancaria':
        return '../../../../assets/modules/images/pay-method/Transferencia.png';
      case 'consignación bancaria':
        return '../../../../assets/modules/images/pay-method/Consignacion.png';
      case 'otro**':
        return '../../../../assets/modules/images/pay-method/Otro.png';
      default:
        return '../../../../assets/modules/images/pay-method/Otro.png';
    }
  }

  setPaymentMethod(method: string) {
    this.selectedPaymentMethod = method;
  }

  cancelarVenta() {
    this.cancelDialog = true;
  }

  confirmCancel() {
    const saleConfirmationData = {
      status: 'REJECTED',
      customerId: this.saleForm.get('customerId')?.value,
      billingType: 'POS',
    };
    this.salesService.updateStatusSale(this.idSale, saleConfirmationData).subscribe(
      () => {
        this.cancelDialog = false;
        Swal.fire('Confirmación', 'Venta cancelada con éxito', 'warning').then(() => {
          this.idSale = '';
          this.nameCustomer = '';
          this.salesService.clearSaleId();
          this.saleForm.reset();
          this.calculateTaxes();
          this.ngOnInit();
        });
      }
    );
  }

  saveSale() {
    this.saveDialog = true;
  }

  confirmSave() {
    if (this.saleForm.valid && this.idSale) {
      this.salesService.getSaleById(this.idSale).subscribe(
        (existingDetails: any[]) => {
          const saleDetails = this.saleForm.value.salesDetail.map((detail: any) => ({
            stocktakingBranchId: detail.stocktakingBranchId,
            quantity: detail.quantity
          }));

          const newDetails = saleDetails.filter((newDetail: any) => {
            const existingDetail = existingDetails.find(
              (ed) => ed.stocktakingBranchId === newDetail.stocktakingBranchId
            );

            if (existingDetail) {
              const quantityDifference = newDetail.quantity - existingDetail.quantity;
              if (quantityDifference > 0) {
                newDetail.quantity = quantityDifference;
                return true;
              } else {
                return false;
              }
            }

            return true;
          });

          if (newDetails.length > 0) {
            newDetails.forEach((detail: any) => {
              this.salesService.addSaleDetails(this.idSale, detail).subscribe(
                res => {
                  Swal.fire('Guardado', 'Detalle de venta agregado correctamente', 'success');
                },
                error => {
                  Swal.fire({
                    title: 'Error',
                    text: `Error al agregar el detalle de venta ${error}`,
                    icon: 'error',
                    customClass: {
                      popup: 'swal2-popup',
                    }
                  });
                }
              );
            });
          } else {
            Swal.fire('Info', 'No hay detalles nuevos para agregar', 'info');
          }
          this.paymentDialog = false;
          this.payment = 0;
        },
        error => {
          Swal.fire({
            title: 'Error',
            text: `Error al obtener los detalles de la venta ${error}`,
            icon: 'error',
            customClass: {
              popup: 'swal2-popup',
            }
          });
        }
      );
    } else {
      this.paymentDialog = false;
    }
  }

  saveSaleDetails() {
    if (this.saleForm.valid && this.idSale !== '') {
      this.deleteDetails(this.idSale).then(() => {
        const saleDetails = this.saleForm.value.salesDetail.map((detail: any) => ({
          stocktakingBranchId: detail.stocktakingBranchId,
          quantity: detail.quantity
        }));

        const requests = saleDetails.map((detail: any) =>
          this.salesService.addSaleDetails(this.idSale, detail)
        );

        forkJoin(requests).subscribe(
          res => {
            Swal.fire('Guardado', 'Venta Guardada Correctamente', 'success');
          },
          error => {
            Swal.fire({
              title: 'Error',
              text: `Error al agregar el detalle de venta: ${error}`,
              icon: 'error',
              customClass: {
                popup: 'swal2-popup',
              }
            });
          },
          () => {
            this.saveDialog = false;
            this.idSale = '';
            this.salesService.clearSaleId();
            this.nameCustomer = '';
            this.calculateTaxes();
            this.ngOnInit();
          }
        );
      }).catch(error => {
        Swal.fire({
          title: 'Error',
          text: `Error al eliminar los detalles de venta: ${error}`,
          icon: 'error',
          customClass: {
            popup: 'swal2-popup',
          }
        });
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, complete el formulario de venta antes de guardar los detalles.',
        icon: 'warning',
        customClass: {
          popup: 'swal2-popup',
        }
      });
    }
  }


  hidePaymentDialog() {
    this.paymentDialog = false;
    this.submitted = false;
    this.selectedPaymentMethod = '';
  }

  loadSale() {
    this.uploadDialog = true;
  }

  loadSaleForEdit() {
    if (!this.saleIdEdit) {
      this.salesService.validateSaleByCustomer(this.customerIdtoLoad).subscribe(
        sales => {
          if (sales && sales.length === 1) {
            this.salesService.getSaleById(sales[0].id).subscribe(
              sale => {
                if (sale && sale.sale) {
                  this.idSale = sale.sale.id;
                  this.nameCustomer = sale.sale.finalCustomer.fullName;
                  this.saleForm.patchValue({
                    identification: sale.sale.finalCustomer.identification || 222222222222,
                    customerId: sale.sale.finalCustomer.id,
                    name: sale.sale.name || 'Consumidor Final',
                  });
                  this.saleForm.get('identification')?.disable();
                  this.salesDetail.clear();
                  sale.sale.salesDetail.forEach((detail: any) => {
                    const detailGroup = this.fb.group({
                      stocktakingBranchId: [detail.stocktakingBranch.id],
                      quantity: [detail.quantity],
                      price: [detail.unitPrice],
                      name: [detail.stocktakingBranch.ingredient.name],
                      description: [detail.stocktakingBranch.ingredient.description],
                      sku: [detail.stocktakingBranch.ingredient.sku],
                      actualQuantity: [200]
                    });
                    this.salesDetail.push(detailGroup);
                  });
                  this.salesService.clearSaleId();
                  this.calculateTaxes();
                  this.uploadDialog = false;
                  Swal.fire('Exitoso', 'Venta cargada con éxito', 'success');
                  this.customerIdtoLoad = '';
                }
              }
            );
          } else if (sales && sales.length > 1) {
            this.uploadDialog = false;
            Swal.fire('Error', 'El cliente tiene varias ventas pendientes', 'error').then(() => this.router.navigate(['/home/sales/list']));
          } else {
            this.uploadDialog = false;
            Swal.fire('Error', 'No hay ventas pendientes de este cliente', 'error').then(() => this.uploadDialog = true);
          }
        }
      )
    } else {
      this.salesService.getSaleById(this.saleIdEdit).subscribe(
        sale => {
          if (sale && sale.sale) {
            this.idSale = sale.sale.id;
            this.nameCustomer = sale.sale.finalCustomer.fullName;
            this.saleForm.patchValue({
              identification: sale.sale.finalCustomer.identification,
              customerId: sale.sale.finalCustomer.id,
              name: sale.sale.name,
            });
            this.saleForm.get('identification')?.disable();

            this.salesDetail.clear();

            sale.sale.salesDetail.forEach((detail: any) => {
              const detailGroup = this.fb.group({
                stocktakingBranchId: [detail.stocktakingBranch.id],
                quantity: [detail.quantity],
                price: [detail.unitPrice],
                name: [detail.stocktakingBranch.ingredient.name],
                description: [detail.stocktakingBranch.ingredient.description],
                sku: [detail.stocktakingBranch.ingredient.sku],
                actualQuantity: [200]
              });
              this.salesDetail.push(detailGroup);
            });
            this.salesService.clearSaleId();
            this.calculateTaxes();
            this.uploadDialog = false;
            Swal.fire('Exitoso', 'Venta cargada con éxito', 'success');
            this.customerIdtoLoad = '';
          } else {
            Swal.fire('Error', 'No hay ventas pendientes de este cliente', 'error');
          }
        },
        error => {
          Swal.fire('Error', 'Error al obtener la venta', 'error');
        }
      );
    }
  }

  openLinkClient() {
    this.linkClientDialog = true;
  }

  get subTotal(): number {
    return this.total - (this.totalIC + this.totalIva)
  }

  get total(): number {
    return this.salesDetail.controls.reduce((sum, detail) => {
      return sum + (detail.value.quantity * detail.value.price);
    }, 0);
  }

  restrictInputPrice(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
    if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
    if (inputElement.value.length > 15) {
      event.preventDefault();
    }
  }

  get change(): number {
    return (this.total - this.payment) * -1;
  }

  get cantProducts(): number {
    return this.salesDetail.controls.reduce((cant, detail) => {
      return cant + (detail.value.quantity);
    }, 0)
  }

  getTaxesTotal(): Observable<{ ivaTotal: number, icTotal: number }> {
    const taxObservables = this.salesDetail.controls.map(detail =>
      this.productService.validateTax(detail.value.stocktakingBranchId).pipe(
        map(taxes => {
          if (taxes) {
            const ivaTax = taxes.find((tax: any) => tax.tax.name === 'IVA');
            const icTax = taxes.find((tax: any) => tax.tax.name === 'IC');
            return {
              ivaPercentage: ivaTax ? ivaTax.tax.percentage : 0,
              icPercentage: icTax ? icTax.tax.percentage : 0
            };
          } else {
            return { ivaPercentage: 0, icPercentage: 0 };
          }
        })
      )
    );

    return forkJoin(taxObservables).pipe(
      map(taxDetails => {
        let ivaTotal = 0;
        let icTotal = 0;

        this.salesDetail.controls.forEach((detail, index) => {
          const ivaPercentage = taxDetails[index].ivaPercentage;
          const icPercentage = taxDetails[index].icPercentage;
          const productSubtotal = detail.value.quantity * detail.value.price;

          if (ivaPercentage > 0) {
            const ivaAmount = (productSubtotal * ivaPercentage / 100) / (1 + ivaPercentage / 100);
            ivaTotal += parseFloat(ivaAmount.toFixed());
          }

          if (icPercentage > 0) {
            const icAmount = (productSubtotal * icPercentage / 100) / (1 + icPercentage / 100);
            icTotal += parseFloat(icAmount.toFixed());
          }
        });

        return { ivaTotal, icTotal };
      })
    );
  }

  calculateTaxes() {
    this.getTaxesTotal().subscribe(({ ivaTotal, icTotal }) => {
      if (this.idSale !== '') {
        this.totalIva = ivaTotal;
        this.totalIC = icTotal;
      } else {
        this.totalIva = 0;
        this.totalIC = 0;
      }
    });
  }

  calcularDigitoVerificacion(myNit: string): number {
    let vpri: number[] = Array(16).fill(0);
    let x = 0;
    let y = 0;

    vpri[1] = 3;
    vpri[2] = 7;
    vpri[3] = 13;
    vpri[4] = 17;
    vpri[5] = 19;
    vpri[6] = 23;
    vpri[7] = 29;
    vpri[8] = 37;
    vpri[9] = 41;
    vpri[10] = 43;
    vpri[11] = 47;
    vpri[12] = 53;
    vpri[13] = 59;
    vpri[14] = 67;
    vpri[15] = 71;

    let z = myNit.length;

    for (let i = 0; i < z; i++) {
      y = parseInt(myNit.charAt(i), 10);
      x += y * vpri[z - i];
    }

    y = x % 11;

    return (y > 1) ? 11 - y : y;
  }

  calcular(): void {
    const identification = this.finalCustomerForm.get('identification')?.value || '';
    if (identification) {
      this.digitoVerificacion = this.calcularDigitoVerificacion(identification.toString());
      this.finalCustomerForm.get('identificationDv')?.setValue(this.digitoVerificacion);
    } else {
      this.finalCustomerForm.get('identificationDv')?.setValue(null);
    }
  }

  preventEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  actualStock() {
    this.stock = this.products.filter(p => p.actualQuantity <= p.minQuantity);

    if (this.stock.length > 0) {
      this.showAlertForProducts(0);
    }
  }

  showAlertForProducts(index: number) {
    if (index < this.stock.length) {
      const p = this.stock[index];

      Swal.fire({
        title: 'Alerta',
        html: `El producto <b>${p.ingredient.name}</b> se está terminando, actualmente hay <b>${p.actualQuantity}</b> existentes.`,
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.showAlertForProducts(index + 1);
      });
    }
  }

  isAdmin(): boolean {
    if (this.loginUser()?.roles?.some(role => role.slug === 'admin')) return true;
    return false;
  }

}
