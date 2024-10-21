import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsRoutingModule } from './reports-routing.module';
import { SalesReportsModule } from './sales-reports/sales-reports.module';
import { CashReportsModule } from './cash-reports/cash-reports.module';



@NgModule({
  imports: [
    CommonModule,
    ReportsRoutingModule,
    SalesReportsModule,
    CashReportsModule
  ],
  declarations: []
})
export class ReportsModule { }
