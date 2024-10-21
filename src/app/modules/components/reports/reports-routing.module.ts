import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';



@NgModule({
  imports: [RouterModule.forChild([
    { path: 'stocktaking', data: { breadcrumb: 'Reporte de Stock' }, loadChildren: () => import('./stocktaking-reports/stocktaking-reports.module').then(m => m.StocktakingReportsModule) },
    { path: 'sales', data: { breadcrumb: 'Reporte de Ventas' }, loadChildren: () => import('./sales-reports/sales-reports.module').then(m => m.SalesReportsModule ) },
    { path: 'cash', data: { breadcrumb: 'Reporte de Turnos' }, loadChildren: () => import('./cash-reports/cash-reports.module').then(m => m.CashReportsModule) },
    { path: '**', redirectTo: '/notfound' }
  ])],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
