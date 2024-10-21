import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RolesListComponent } from './rolesList.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: RolesListComponent }
	])],
	exports: [RouterModule]
})
export class RolesListRoutingModule { }
