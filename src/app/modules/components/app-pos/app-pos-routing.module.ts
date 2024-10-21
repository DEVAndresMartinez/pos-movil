import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppPosComponent } from './app-pos.component';

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: AppPosComponent }
  ])],
  exports: [RouterModule]
})
export class AppPosRoutingModule { }
