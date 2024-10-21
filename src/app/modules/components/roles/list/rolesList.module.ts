import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { RolesListComponent } from './rolesList.component';
import { RolesListRoutingModule } from './rolesList-routing.module';
import { MenuModule } from 'primeng/menu';

@NgModule({
	imports: [
		CommonModule,
		RolesListRoutingModule,
		RippleModule,
		ButtonModule,
		InputTextModule,
		TableModule,
		ProgressBarModule,
		MenuModule,
	],
	declarations: [RolesListComponent]
})
export class RolesListModule { }