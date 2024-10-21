import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { InventoryComponent } from "./inventory.component";

@NgModule({
    imports: [ RouterModule.forChild([
        { path: '', component: InventoryComponent }
    ])],
    exports: [RouterModule]
})
export class InventoryRoutingModule { }