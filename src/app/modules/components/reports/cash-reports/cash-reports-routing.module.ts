import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CashReportsComponent } from './cash-reports.component';



@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: CashReportsComponent }
  ])],
  exports: [RouterModule]
})
export class CashReportsRoutingModule { }
