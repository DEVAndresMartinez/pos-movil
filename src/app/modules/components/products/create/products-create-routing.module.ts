import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductsCreateComponent } from './products-create.component';

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: ProductsCreateComponent }
  ])],
  exports: [RouterModule]
})
export class ProductsCreateRoutingModule { }
