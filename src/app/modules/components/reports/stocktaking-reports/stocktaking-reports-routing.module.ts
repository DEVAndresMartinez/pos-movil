import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StocktakingReportsComponent } from './stocktaking-reports.component';



@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: StocktakingReportsComponent }
  ])],
  exports: [RouterModule]
})
export class StocktakingReportsRoutingModule { }
