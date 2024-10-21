import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { UsersListComponent } from './usersList.component';
import { UsersListRoutingModule } from './usersList-routing.module';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';

@NgModule({
	imports: [
		CommonModule,
		UsersListRoutingModule,
		MenuModule,
		RippleModule,
		ButtonModule,
		InputTextModule,
		TableModule,
		ProgressBarModule,
		DialogModule
	],
	declarations: [UsersListComponent]
})
export class UsersListModule { }