import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RolesCreateComponent } from './rolesCreate.component';
import { RolesCreateRoutingModule } from './rolesCreate-routing.module';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MultiSelectModule } from 'primeng/multiselect';
import { MatDialogModule } from '@angular/material/dialog';
import { AccordionModule } from 'primeng/accordion';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		RolesCreateRoutingModule,
		ButtonModule,
		RippleModule,
		InputTextModule,
		DropdownModule,
		FileUploadModule,
		InputTextareaModule,
		InputGroupModule,
        InputGroupAddonModule,
		MultiSelectModule,
		ReactiveFormsModule,
		MatDialogModule,
		AccordionModule
	],
	declarations: [
		RolesCreateComponent
	]
})
export class RolesCreateModule { }
