import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashReportsRoutingModule } from './cash-reports-routing.module';
import { CashReportsComponent } from './cash-reports.component';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CashReportsRoutingModule,
    ToastModule,
    TableModule,
    ButtonModule,
    SplitButtonModule,
    InputTextModule,
    CalendarModule,
    DropdownModule
  ],
  declarations: [CashReportsComponent],
  providers: [MessageService]

})
export class CashReportsModule { }
