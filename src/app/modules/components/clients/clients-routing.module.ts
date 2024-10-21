import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'list', data: {breadcrumb: 'Lista'}, loadChildren: () => import('./list/clientsList.module').then(m => m.ClientsListModule) },
        { path: 'create', data: {breadcrumb: 'Crear'}, loadChildren: () => import('./create/clientsCreate.module').then(m => m.ClientsCreateModule) },
        { path: 'edit/:id', data: {breadcrumb: 'Editar'}, loadChildren: () => import('./create/clientsCreate.module').then(m => m.ClientsCreateModule) },
        { path: 'view/:id', data: {breadcrumb: 'Ver'}, loadChildren: () => import('./create/clientsCreate.module').then(m => m.ClientsCreateModule) },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class ClientsRoutingModule { }
