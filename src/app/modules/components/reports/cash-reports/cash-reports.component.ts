import { ChangeDetectorRef, Component, computed, inject, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { forkJoin, map } from 'rxjs';
import { AuthService } from 'src/app/modules/service/auth.service';
import { CashService } from 'src/app/modules/service/cash.service';
import { ReportService } from 'src/app/modules/service/report.service';
import { UsersService } from 'src/app/modules/service/users.service';

@Component({
  selector: 'app-cash-reports',
  templateUrl: './cash-reports.component.html',
  styleUrl: './cash-reports.component.scss'
})
export class CashReportsComponent implements OnInit {

  loading: boolean = true;
  items: MenuItem[] = [];
  cash: any[] = [];
  cashTable: any[] = [];
  cashCopyFilter: any[] = [];
  filteredCashTable: any[] = [];
  dateRange: Date[] | undefined;
  selectedTimeRange: number | undefined;
  usersName: any[] = [];
  
  timeRangeOptions = [
    { label: 'Seleccionar', value: 10000 },
    { label: '4 Horas', value: 4 },
    { label: '8 Horas', value: 8 },
    { label: '12 Horas', value: 12 }
  ];

  permissions: string[] = [];
  cols: any[] = [];
  rowsPerPageOptions = [5, 10, 20];

  private authService = inject(AuthService);
  public loginUser = computed(() => this.authService.currentUser());

  constructor(
    private cashService: CashService,
    private userService: UsersService,
    private reportServie: ReportService,
    private messageService: MessageService,
    private cd: ChangeDetectorRef
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
    this.cd.detectChanges();
    const userId = this.loginUser()?.id;
    if (userId) {
      this.userService.getProfileById(userId).subscribe((user) => {
        if (user && Array.isArray(user.roles)) {
          this.permissions = user.roles.flatMap((role: any) => Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.toString()) : []) || [];
          this.cashService.getAllCash().subscribe(cash => {
            this.cash = cash;
            const cashRequests = this.cash.map(cashItem =>
              this.userService.getUserById(cashItem.userId).pipe(
                map(user => ({
                  createdAt: ((cashItem.createdAt).substring(0,10) + ' / ' + (cashItem.createdAt).substring(11,19)),
                  closingDate: ((cashItem.closingDate).substring(0, 10) + ' / ' + (cashItem.closingDate).substring(11,19)),
                  openingBalance: cashItem.openingBalance,
                  closingBalance: cashItem.closingBalance ? cashItem.closingBalance : NaN,
                  userName: user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Desconocido'
                }))
              )
            );

            forkJoin(cashRequests).subscribe(results => {
              const newCashData = results;
              this.cashTable = newCashData;
              this.cashCopyFilter = newCashData;
            });
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
      this.filteredCashTable = table.filteredValue || [...this.cashTable];
    }, 1000);
  }

  filterByDateRange() {
    if (this.dateRange && this.dateRange.length === 2) {
      const [startDate, endDate] = this.dateRange;
      
      this.cashTable = this.cashTable.filter(item => {
        const date = new Date(item.createdAt);
        return date >= startDate && date <= endDate;
      });
    } else {
      this.cashTable = [...this.cashCopyFilter];

    }
  }
  
  filterByTimeRange() {
    if (this.selectedTimeRange) {
      const hours = this.selectedTimeRange;
      const timeLimit = hours * 60 * 60 * 1000;

      this.cashTable = this.cashCopyFilter.filter(item => {
        const openingDate = new Date(item.createdAt);
        const closingDate = new Date(item.closingDate);
        const timeDifference = closingDate.getTime() - openingDate.getTime();
        return timeDifference <= timeLimit;
      });
    } else {
      this.cashTable = [...this.cashCopyFilter];
    }
  }

  exportXlsx() {
    const dataToDownload = this.filteredCashTable.length > 0 ? this.filteredCashTable : this.cashTable;
    this.reportServie.reportCashXlsx(dataToDownload, `Reporte de Turnos ${this.getCurrentDateTimeFormatted}`);
    this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Reporte generado exitosamente' });
  }
  
  exportPdf() {
    const dataToDownload = this.filteredCashTable.length > 0 ? this.filteredCashTable : this.cashTable;
    this.reportServie.reportCashPdf(dataToDownload, `Reporte de Turnos ${this.getCurrentDateTimeFormatted}`);
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
