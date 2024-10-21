import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ClientsListComponent } from './clientsList.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: ClientsListComponent }
	])],
	exports: [RouterModule]
})
export class ClientsListRoutingModule { }
