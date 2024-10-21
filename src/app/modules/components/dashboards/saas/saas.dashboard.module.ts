import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaaSDashboardRoutingModule } from './saas.dashboard-routing.module';
import { SaaSDashboardComponent } from './saas.dashboard.component';
import { ChartModule } from 'primeng/chart';


@NgModule({
    imports: [
        CommonModule,
        SaaSDashboardRoutingModule,
        ChartModule
    ],
    declarations: [SaaSDashboardComponent]
})
export class SaaSDashboardModule { }
