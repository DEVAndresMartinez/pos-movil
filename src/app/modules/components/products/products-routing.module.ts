import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'inventory', data: { breadcrumb: 'Lista de Productos' }, loadChildren: () => import('./inventory/inventory.module').then(m => m.InventoryModule) },
        { path: 'create', data: { breadcrumb: 'Crear'}, loadChildren: () => import('./create/products-create.module').then(m => m.ProductsCreateModule) },
        { path: 'edit/:id', data: { breadcrumb: 'Editar' }, loadChildren: () => import('./create/products-create.module').then(m => m.ProductsCreateModule) },
        { path: 'view/:id', data: { breadcrumb: 'Ver' }, loadChildren: () => import('./create/products-create.module').then(m => m.ProductsCreateModule) },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class ProductsRoutingModule {}