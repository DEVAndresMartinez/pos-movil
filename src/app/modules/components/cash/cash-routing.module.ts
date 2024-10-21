import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CashComponent } from './cash.component';

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: CashComponent }
  ])],
  exports: [RouterModule]
})
export class CashRoutingModule { }
