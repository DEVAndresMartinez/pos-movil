import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'list', data: {breadcrumb: 'Lista'}, loadChildren: () => import('./list/rolesList.module').then(m => m.RolesListModule) },
        { path: 'create', data: {breadcrumb: 'Crear'}, loadChildren: () => import('./create/rolesCreate.module').then(m => m.RolesCreateModule) },
        { path: 'edit/:id', data: {breadcrumb: 'Editar'}, loadChildren: () => import('./create/rolesCreate.module').then(m => m.RolesCreateModule) },
        { path: 'view/:id', data: {breadcrumb: 'Ver'}, loadChildren: () => import('./create/rolesCreate.module').then(m => m.RolesCreateModule) },
        { path: 'actions', data: {breadcrumb: 'Acciones'}, loadChildren: () => import('./actions/actions.module').then(m => m.ActionsModule) },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class RolesRoutingModule { }
