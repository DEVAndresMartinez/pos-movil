import { Component, computed, inject, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { AuthService } from 'src/app/modules/service/auth.service';
import { ProductsService } from 'src/app/modules/service/products.service';
import { ReportService } from 'src/app/modules/service/report.service';
import { UsersService } from 'src/app/modules/service/users.service';

@Component({
  selector: 'app-stocktaking-reports',
  templateUrl: './stocktaking-reports.component.html',
  styleUrl: './stocktaking-reports.component.scss'
})
export class StocktakingReportsComponent implements OnInit {

  loading: boolean = true;
  items: MenuItem[] = [];
  stocktacking: any[] = [];
  stocktackingFilter: any[] = [];
  minStockStatus: boolean = false;

  filter: string = '';

  permissions: string[] = [];
  cols: any[] = [];
  rowsPerPageOptions = [5, 10, 20];

  private authService = inject(AuthService);
  public loginUser = computed(() => this.authService.currentUser());

  constructor(
    private productsService: ProductsService,
    private messageService: MessageService,
    private usersService: UsersService,
    private reportServie: ReportService,
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
      this.usersService.getUserById(userId).subscribe((user) => {
        if (user && Array.isArray(user.roles)) {
          this.permissions = user.roles.flatMap((role: any) => Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.toString()) : []) || [];
          this.productsService.getProducts().subscribe(stock => {
            this.stocktacking = stock.map(stock => ({
              nameStock: stock.ingredient.name,
              skuStock: stock.ingredient.sku,
              undStock: stock.ingredient.unit.name,
              minQuantity: stock.minQuantity,
              actualQuantity: stock.actualQuantity,
              price: stock.price
            }));
            this.stocktackingFilter = this.stocktacking;
            this.loading = false;
          });
        }
      })
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(filterValue, 'contains');
    setTimeout(() => {
      this.stocktackingFilter = table.filteredValue || [...this.stocktacking];
    }, 500);
  }

  minStockFilter() {
    if (this.minStockStatus) {
      this.stocktacking = this.stocktacking.filter(stock => 
        stock.actualQuantity <= stock.minQuantity
      );
    } else {
      this.stocktacking = [...this.stocktackingFilter];
    }
  }




  exportXlsx() {
    if (this.filter !== '') {
      if (this.stocktackingFilter.length === 0) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se ecnontrarón registros' });
      } else {
        this.reportServie.reportStockXlsx(this.stocktackingFilter, `Reporte de Inventario ${this.getCurrentDateTimeFormatted}`);
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Reporte generado exitosamente' });
      }
    } else {
      this.reportServie.reportStockXlsx(this.stocktacking, `Reporte de Inventario ${this.getCurrentDateTimeFormatted}`);
      this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Reporte generado exitosamente' });
    }
  }

  exportPdf() {
    if (this.filter !== '') {
      if (this.stocktackingFilter.length === 0) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se ecnontrarón registros' });
      } else {
        this.reportServie.reportStockPdf(this.stocktackingFilter, `Reporte de Inventario ${this.getCurrentDateTimeFormatted}`);
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Reporte generado exitosamente' });
      }
    } else {
      this.reportServie.reportStockPdf(this.stocktacking, `Reporte de Inventario ${this.getCurrentDateTimeFormatted}`);
      this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Reporte generado exitosamente' });
    }
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
