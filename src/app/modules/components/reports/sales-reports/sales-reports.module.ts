import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesReportsRoutingModule } from './sales-reports-routing.module';
import { SalesReportsComponent } from './sales-reports.component';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SplitButtonModule } from 'primeng/splitbutton';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SalesReportsRoutingModule,
    ToastModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SplitButtonModule,
    CalendarModule,
    DropdownModule
  ],
  declarations: [SalesReportsComponent],
  providers: [MessageService]
})
export class SalesReportsModule { }
