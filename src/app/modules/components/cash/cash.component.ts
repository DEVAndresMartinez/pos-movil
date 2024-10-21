import { Component, computed, inject, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { UsersService } from '../../service/users.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CashService } from '../../service/cash.service';
import Swal from 'sweetalert2';
import { catchError } from 'rxjs';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cash',
  templateUrl: './cash.component.html',
  styleUrl: './cash.component.scss',
})
export class CashComponent implements OnInit {

  cashOpenForm!: FormGroup;
  cashCloseForm!: FormGroup;
  idOpen: string = '';

  cols: any[] = [];
  rowsPerPageOptions = [5, 10, 20];
  permissions: string[] = [];
  loading = true;
  startCashDialog: boolean = false;
  endCashDialog: boolean = false;
  statusCash: boolean = false;
  cash: any[] = [];
  openingBalance: any;
  selectedDate: Date | null = null;
  cashFilter: any[] = [];
  cashClose: any[] = [];
  previewCash: any;
  previewCashDialog: boolean = false;

  private authService = inject(AuthService);
  public loginUser = computed(() => this.authService.currentUser());

  constructor(
    private cashService: CashService,
    private messageService: MessageService,
    private usersService: UsersService,
    private router: Router,
    private fb: FormBuilder,
    private currencyPipe: CurrencyPipe
  ) { }

  ngOnInit(): void {
    this.initOpen();
    this.initClose();
    const userId = this.loginUser()?.id;
    if (userId) {
      this.usersService.getUserById(userId).subscribe((user) => {
        if (user && Array.isArray(user.roles)) {
          this.permissions = user.roles.flatMap((role: any) => Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.toString()) : []) || [];
          this.cashService.getAllCash().subscribe(cash => {
            this.cash = cash;
            this.cashFilter = cash;
            const openCash = cash.find((c: any) => c.status === 'OPEN');
            if (openCash !== null) {
              this.idOpen = openCash ? openCash.id : null;
            }
            this.statusCash = !!openCash;
          });
          this.loading = false;
        };
      });
    };
  }

  initOpen() {
    this.cashOpenForm = this.fb.group({
      openingBalance: new FormControl<string>('', { validators: [Validators.required, Validators.min(0)] })
    })
  }

  initClose() {
    this.cashCloseForm = this.fb.group({
      closingBalance: new FormControl<string>('', { validators: [Validators.required, Validators.min(0)] }),
      observations: new FormControl<string>('')
    })
  }

  get openingBalances() {
    const formattedValue = this.cashOpenForm.get('openingBalance')?.value;
    return formattedValue ? parseFloat(formattedValue.replace(/,/g, '')) : 0;
  }

  get closingBalances() {
    const formattedValue = this.cashCloseForm.get('closingBalance')?.value;
    return formattedValue ? parseFloat(formattedValue.replace(/,/g, '')) : 0;
  }

  openStartDialog() {
    this.btnActive = false;
    this.startCashDialog = true;
  }

  openEndDialog() {
    this.btnActive = false;
    this.endCashDialog = true;
  }

  closeStartDialog() {
    this.startCashDialog = false;
    this.btnActive = true;
  }

  closeEndDialog() {
    this.endCashDialog = false;
    this.btnActive = true;
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

  openCash() {
    this.btnActive = false;
    if (this.cashOpenForm.valid) {
      this.cashService.openCash(this.openingBalances).subscribe(
        () => {
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Turno iniciado con éxito' });
          setTimeout(() => {
            this.router.navigate(['/home/pos'])
          }, 1000);
        }
      )
      this.statusCash = true;
    } else {
      this.startCashDialog = false;
      Swal.fire('Algo salio mal', 'erifique todos los campos del formulario.', 'error').then(() => {
      this.startCashDialog = true;
        this.btnActive = true;
        this.ngOnInit();
      })
    }
  }

  btnActive: boolean = true;

  closeCash() {
    this.btnActive = false;
    if (this.cashCloseForm.valid) {
      const closingBalance = this.closingBalances;
      const observations = this.cashCloseForm.get('observations')?.value;
      this.cashService.getPreCloseCash(this.idOpen).subscribe(
        data => {
          if (data.TotalCashSalesMoreOpeningBalance !== closingBalance) {
            const formattedTotalCashSalesMoreOpeningBalance = this.currencyPipe.transform(data.TotalCashSalesMoreOpeningBalance, 'COP', 'symbol-narrow', '1.0-0');
            this.endCashDialog = false;
            this.btnActive = false;
            Swal.fire({
              title: 'Error',
              html: `El valor esperado en la caja es de <b> ${formattedTotalCashSalesMoreOpeningBalance} </b>`,
              icon: 'error',
            }).then(() => {
              this.btnActive = true;
              this.endCashDialog = true;
            });
          } else if (data.TotalCashSalesMoreOpeningBalance === closingBalance) {
            this.cashService.closeCash(closingBalance, observations, this.idOpen)
              .pipe(
                catchError(error => {
                  if (error.error?.message === 'Error finding cash closing') {
                    this.endCashDialog = false;
                    Swal.fire('Error', 'Por favor, cierre todas las ventas antes de cerrar el turno.', 'error').then(() => {
                      this.router.navigate(['/home/sales/list']);
                    });
                  } else {
                    console.error('An error occurred:', error);
                  }
                  throw error;
                })
              )
              .subscribe(
                response => {
                  this.btnActive = false;
                  this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Turno cerrado con éxito' });
                  this.ngOnInit();
                  this.endCashDialog = false
                  this.btnActive = true;
                }
              );
          }
        })
    } else {
      this.btnActive = false;
      this.endCashDialog = false;
      Swal.fire('Error', 'Por favor, verifique todos los campos del formulario.', 'error').then(() => {
        this.btnActive = true;
        this.endCashDialog = true;
      });
    }
  }

  downloadCash(cash: any) {
    if (cash.status === 'OPEN') {
      Swal.fire('Acción inválida', 'El turno debe estar cerrado antes de descargar el reporte.', 'warning')
    } else {
      this.cashService.downloadCash(cash.id).subscribe(
        (blob) => {
          if (blob && blob.size > 0) {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Turno del ${cash.openingDate}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Reporte generado con éxito' });
          } else {
            console.error('Error: El archivo descargado está vacío o no es válido.');
          }
        },
        (error) => {
          Swal.fire('Algo salió mal', 'Error al generar el reporte, intente nuevamente o contacte a soporte.', 'error')
        }
      );
    }
  }

  onDateSelect(event: any) {
    this.selectedDate = event;
    if (this.selectedDate) {
      const selectedDateStr = this.formatDate(this.selectedDate);
      this.cashFilter = this.cash.filter(cash => {
        if (cash.openingDate) {
          const openingDate = new Date(cash.openingDate);
          const openingStr = this.formatDate(openingDate);
          return openingStr === selectedDateStr;
        }
        return false;
      });
    } else {
      this.cashFilter = this.cash;
    }
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  openPreview(cash: any) {
    this.previewCashDialog = true;
    if (cash.status === 'OPEN') {
      this.cashService.getPreCloseCash(cash.id).subscribe(
        data => {
          this.previewCash = data;
        }
      )
    } else {
      this.previewCash = cash;
    }
  }

  isAdmin(): boolean {
    if (this.loginUser()?.roles?.some(role => role.slug === 'admin')) return true;
    return false;
  }
}
