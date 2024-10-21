import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppLayoutComponent } from './layout/app.layout.component';
import { isAuthenticatedGuard, isNotAuthenticatedGuard } from './modules/components/auth/guards';

const routes: Routes = [
    { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
    {
        path: 'home', component: AppLayoutComponent,
        canActivate: [isAuthenticatedGuard],
        children: [
            { path: '', loadChildren: () => import('./modules/components/dashboards/dashboards.module').then(m => m.DashboardsModule) },
            { path: 'clients', data: { breadcrumb: 'Clientes' }, loadChildren: () => import('./modules/components/clients/clients.module').then(m => m.ClientsModule) },
            { path: 'users', data: { breadcrumb: 'Usuarios' }, loadChildren: () => import('./modules/components/users/users.module').then(m => m.UsersModule) },
            { path: 'roles', data: { breadcrumb: 'Roles' }, loadChildren: () => import('./modules/components/roles/roles.module').then(m => m.RolesModule) },
            { path: 'profile', data: { breadcrumb: 'Perfil' }, loadChildren: () => import('./modules/components/profile/profile.module').then(m => m.ProfileModule) },
            { path: 'units', data: { breadcrumb: 'Unidades' }, loadChildren: () => import('./modules/components/units/units.module').then(m => m.UnitsModule) },
            { path: 'ingredients', data: { breadcrumb: 'Ingredientes' }, loadChildren: () => import('./modules/components/ingredients/ingredients.module').then(m => m.IngredientsModule) },
            { path: 'products', data: { breadcrumb: 'Productos' }, loadChildren: () => import('./modules/components/products/products.module').then(m => m.ProductsModule) },
            { path: 'sales', data: { breadcrumb: 'Ventas' }, loadChildren: () => import('./modules/components/sales/sales.module').then(m => m.SalesModule) },
            { path: 'pos', data: { breadcrumb: 'POS' }, loadChildren: () => import('./modules/components/app-pos/app-pos.module').then(m => m.AppPosModule) },
            { path: 'cash', data: { breadcrumb: 'Historico de Turnos' }, loadChildren: () => import('./modules/components/cash/cash.module').then(m => m.CashModule)},
            { path: 'reports', data: { breadcrumb: 'Reportes' }, loadChildren: () => import('./modules/components/reports/reports.module').then(m => m.ReportsModule) }
        ]

    },
    { path: 'auth', canActivate: [isNotAuthenticatedGuard], data: { breadcrumb: 'Auth' }, loadChildren: () => import('./modules/components/auth/auth.module').then(m => m.AuthModule) },
    { path: 'notfound', loadChildren: () => import('./modules/components/notfound/notfound.module').then(m => m.NotfoundModule) },
    // { path: '**', redirectTo: '/notfound' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: false })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
