import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CashRoutingModule } from './cash-routing.module';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CashComponent } from './cash.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    CashRoutingModule,
    RippleModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    TableModule,
    CalendarModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    SharedModule
  ],
  declarations: [CashComponent],
  providers: [MessageService, CurrencyPipe]
})
export class CashModule { }
