import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UsersCreateComponent } from './usersCreate.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: UsersCreateComponent }
	])],
	exports: [RouterModule]
})
export class UsersCreateRoutingModule { }
