import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ClientsCreateComponent } from './clientsCreate.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: ClientsCreateComponent }
	])],
	exports: [RouterModule]
})
export class ClientsCreateRoutingModule { }
