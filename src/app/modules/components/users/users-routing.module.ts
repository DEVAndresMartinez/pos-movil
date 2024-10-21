import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'list', data: {breadcrumb: 'Lista'}, loadChildren: () => import('./list/usersList.module').then(m => m.UsersListModule) },
        { path: 'create', data: {breadcrumb: 'Crear'}, loadChildren: () => import('./create/usersCreate.module').then(m => m.UsersCreateModule) },
        { path: 'edit/:id', data: {breadcrumb: 'Editar'}, loadChildren: () => import('./create/usersCreate.module').then(m => m.UsersCreateModule) },
        { path: 'view/:id', data: {breadcrumb: 'Ver'}, loadChildren: () => import('./create/usersCreate.module').then(m => m.UsersCreateModule) },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class UsersRoutingModule { }
