import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'list', data: { breadcrumb: 'Lista de ventas' }, loadChildren: () => import('./list/list.module').then(m => m.SaleListModule) },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class SalesRoutingModule {}