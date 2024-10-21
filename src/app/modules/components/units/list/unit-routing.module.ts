import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UnitComponent } from './unit.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: UnitComponent }
	])],
	exports: [RouterModule]
})
export class UnitRoutingModule { }
