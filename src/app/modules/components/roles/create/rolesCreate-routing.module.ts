import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RolesCreateComponent } from './rolesCreate.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: RolesCreateComponent }
	])],
	exports: [RouterModule]
})
export class RolesCreateRoutingModule { }
