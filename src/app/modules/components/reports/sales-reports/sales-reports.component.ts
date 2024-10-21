import { Component, computed, inject, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { AuthService } from 'src/app/modules/service/auth.service';
import { ReportService } from 'src/app/modules/service/report.service';
import { SalesService } from 'src/app/modules/service/sales.service';
import { UsersService } from 'src/app/modules/service/users.service';

@Component({
  selector: 'app-sales-reports',
  templateUrl: './sales-reports.component.html',
  styleUrl: './sales-reports.component.scss'
})
export class SalesReportsComponent implements OnInit {

  loading: boolean = true;
  items: MenuItem[] = [];
  sales: any[] = [];
  salesTable: any[] = [];

  selectedDate: Date | null = null;
  statusDian = [
    { label: 'Todos', value: "" },
    { label: 'Aceptado', value: "ACCEPTED" },
    { label: 'Cancelado', value: "REJECTED" },
    { label: 'Sin Validar', value: 'UNVALIDATED'}
  ];

  selectedStatusDian: string = '';

  permissions: string[] = [];
  cols: any[] = [];
  rowsPerPageOptions = [5, 10, 20];

  private authService = inject(AuthService);
  public loginUser = computed(() => this.authService.currentUser());

  constructor(
    private salesService: SalesService,
    private userService: UsersService,
    private reportServie: ReportService,
    private messageService: MessageService,
  ) {

    this.items = [
      {
        label: 'Reporte Excel',
        icon: 'pi pi-file-excel',
        command: () => this.exportXlsx()
      },
      {
        label: 'Reporte PDF',
        icon: 'pi pi-file-pdf',
        command: () => this.exportPdf()
      }
    ]

  }

  ngOnInit(): void {
    const userId = this.loginUser()?.id;
    if (userId) {
      this.userService.getUserById(userId).subscribe((user) => {
        if (user && Array.isArray(user.roles)) {
          this.permissions = user.roles.flatMap((role: any) => Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.toString()) : []) || [];
          this.salesService.getSales().subscribe(sales => {
            this.sales = sales.map(sale => ({
              invoiceSequence: sale.invoiceSequence,
              statusDian: sale.pendingInvoicesVerified.map((s: any) => s.status).join(', ') || 'UNVALIDATED',
              idClient: sale.finalCustomer.identification,
              nameClient: sale.finalCustomer.fullName,
              statusSale: sale.status,
              paymentMethod: sale.paymentMethod?.name,
              billingType: sale.billingType,
              updatedAt: (sale.updatedAt).substring(0, 10),
              totalSale: sale.totalSale,
            }));
            this.salesTable = this.sales;
            this.loading = false;
          });
        }
      });
    }
  }
  
  onGlobalFilter(table: Table, event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(filterValue, 'contains');
    setTimeout(() => {
      this.salesTable = table.filteredValue || [...this.sales];
    }, 500);
  }
  
  filterByDate() {
    if (this.selectedDate) {
      const selectedDateString = this.selectedDate.toISOString().substring(0, 10);
      this.salesTable = this.sales.filter(sale => sale.updatedAt === selectedDateString);
    } else {
      this.salesTable = [...this.sales];
    }
  }

  dianFilter() {
    if (this.selectedStatusDian) {
      this.salesTable = this.sales.filter(sale => sale.statusDian === this.selectedStatusDian);
    } else {
      this.salesTable = [...this.sales];
    }
  }

  exportXlsx() {
    const dataToDownload = this.salesTable.length > 0 ? this.salesTable : this.sales;
    this.reportServie.reportSalesXlsx(dataToDownload, `Reporte de Ventas ${this.getCurrentDateTimeFormatted}`);
    this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Reporte generado exitosamente' });
  }


  exportPdf() {
    const dataToDownload = this.salesTable.length > 0 ? this.salesTable : this.sales;
    this.reportServie.reportSalesPdf(dataToDownload, `Reporte de Ventas ${this.getCurrentDateTimeFormatted}`);
    this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Reporte generado exitosamente' });
  }



  get getCurrentDateTimeFormatted(): string {
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}  ${hours}${minutes}${seconds}`;
  }

}
