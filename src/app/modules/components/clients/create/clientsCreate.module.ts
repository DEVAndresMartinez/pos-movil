import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ClientsCreateComponent } from './clientsCreate.component';
import { ClientsCreateRoutingModule } from './clientsCreate-routing.module';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { PasswordModule } from 'primeng/password';
import { NewPasswordComponent } from '../../auth/newpassword/newpassword.component';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';

@NgModule({
	imports: [
		MultiSelectModule,
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		ClientsCreateRoutingModule,
		ButtonModule,
		RippleModule,
		InputTextModule,
		DropdownModule,
		FileUploadModule,
		InputTextareaModule,
		InputGroupModule,
        InputGroupAddonModule,
		TableModule,
		MenuModule,
		DialogModule,  
		PasswordModule,
		TooltipModule,
		CalendarModule,
	],
	declarations: [ClientsCreateComponent,NewPasswordComponent]
})
export class ClientsCreateModule { }
