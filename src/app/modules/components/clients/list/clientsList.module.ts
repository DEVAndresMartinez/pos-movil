import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ClientsListComponent } from './clientsList.component';
import { ClientsListRoutingModule } from './clientsList-routing.module';
import { MenuModule } from 'primeng/menu';

@NgModule({
	imports: [
		CommonModule,
		ClientsListRoutingModule,
		MenuModule,
		RippleModule,
		ButtonModule,
		InputTextModule,
		TableModule,
		ProgressBarModule
	],
	declarations: [ClientsListComponent]
})
export class ClientsListModule { }