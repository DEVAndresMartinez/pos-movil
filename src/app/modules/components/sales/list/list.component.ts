import { Component, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { AuthService } from 'src/app/modules/service/auth.service';
import { PrintService } from 'src/app/modules/service/print.service';
import { SalesService } from 'src/app/modules/service/sales.service';
import { UsersService } from 'src/app/modules/service/users.service';
import Swal from 'sweetalert2';

@Component({
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class ListComponent implements OnInit {

  globalFilter: any;
  sales: any[] = [];
  status = [
    {
      "value": "",
      "name": "Todas las ventas"
    },
    {
      "value": "CREATED",
      "name": "Pendientes"
    },
    {
      "value": "PAID",
      "name": "Cobradas"
    },
    {
      "value": "REJECTED",
      "name": "Rechazadas"
    }
  ]
  filterSales: any[] = [];
  selectedStatus: string = '';
  cols: any[] = [];
  rowsPerPageOptions = [5, 10, 20];
  permissions: string[] = [];
  loading = true;
  printSaleDialog: boolean = false;
  envelopeDialog: boolean = false;
  dianDialog: boolean = false;
  selectedSale: any;
  cancelDialog: boolean = false;
  recjectedSale: any;
  idSale: string = '';
  saleForm!: FormGroup;

  private authService = inject(AuthService);
  public loginUser = computed(() => this.authService.currentUser());


  constructor(
    private saleService: SalesService,
    private usersService: UsersService,
    private printService: PrintService,
    private fb: FormBuilder,
    private router: Router
  ) { }
  ngOnInit(): void {
    const userId = this.loginUser()?.id;
    if (userId) {
      this.usersService.getUserById(userId).subscribe((user) => {
        if (user && Array.isArray(user.roles)) {
          this.permissions = user.roles.flatMap((role: any) => Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.toString()) : []) || [];
          this.saleService.getSales().subscribe(sales => {
            this.sales = sales;
          });
          this.loading = false;
        };
      });
    };
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onStatusChange(table: Table, event: any) {
    if (event.value) {
      table.filter(event.value, 'status', 'equals');
    } else {
      table.clear();
    }
  }

  openPrintDialog(sale: any) {
    this.selectedSale = sale;
    this.printSaleDialog = true;
  }

  printSale() {
    let slowConnection = false;

    this.saleService.invoiceBody(this.selectedSale.id).subscribe(res => {
      if (res) {
        let invoice = res.invoiceBody;
        let printCompleted = false;

        const timeout = setTimeout(() => {
          if (!printCompleted) {
            slowConnection = true;
            Swal.fire('Conexión lenta', 'La impresión está tardando más de lo esperado. Intente más tarde.', 'warning');
          }
        }, 10000);

        this.printService.printTicket(invoice).subscribe(
          response => {
            clearTimeout(timeout);
            if (!slowConnection) {
              printCompleted = true;
              Swal.fire('Imprimiendo', 'Imprimiendo factura', 'success');
              this.ngOnInit();
            }
          },
          error => {
            clearTimeout(timeout);
            if (!slowConnection) {
              printCompleted = true;
              Swal.fire('Error de impresión', 'Revise la conexión de su impresora', 'error');
            }
          }
        );
      }
    });

    this.printSaleDialog = false;
  }



  openEnvelopeDialog(sale: any) {
    this.selectedSale = sale;
    this.envelopeDialog = true;
  }

  envelopeSale() {
    this.envelopeDialog = false;
  }

  openDianDialog(sale: any) {
    this.selectedSale = sale;
    this.dianDialog = true;
  }

  dianSale() {
    const saleConfirmationData = {
      status: 'PAID',
      paymentMethodId: this.selectedSale.paymentMethod,
      customerId: this.selectedSale.finalCustomer.id,
      billingType: 'FAC'
    };
    this.dianDialog = false;
  }

  initSaleForm() {
    this.saleForm = this.fb.group({
      name: [`Venta`],
      identification: [''],
      customerId: [''],
      salesDetail: this.fb.array([]),
      paymentMethodId: null
    });
  }

  openCancelDialog(sale: any) {
    this.cancelDialog = true;
    this.recjectedSale = sale;
  }

  editSales() {
    this.initSaleForm();
    const saleConfirmationData = {
      status: 'REJECTED',
      billingType: 'POS',
    };
    this.saleService.updateStatusSale(this.recjectedSale.id, saleConfirmationData).subscribe(
      () => {
        this.cancelDialog = false;
        Swal.fire('Confirmación', 'Venta cancelada con éxito', 'warning').then(
          () => this.ngOnInit()
        );
      }
    );
  }

  downloadPdf(sale: any) {
    this.saleService.downloadInvoicePdf(sale.id).subscribe(
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

  upSale(sale: any) {
    const saleId = sale.id;
    this.saleService.setSaleId(saleId);
    this.router.navigate(['/home/pos']);
  }

  isAdmin(): boolean {
    if (this.loginUser()?.roles?.some(role => role.slug === 'admin')) return true;
    return false;
  }
}
