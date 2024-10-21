import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActionsComponent } from './actions.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: ActionsComponent }
	])],
	exports: [RouterModule]
})
export class ActionsRoutingModule { }
