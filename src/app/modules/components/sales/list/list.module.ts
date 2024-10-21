import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ListRoutingModule } from "./list-routing.module";
import { ListComponent } from "./list.component";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { ToolbarModule } from "primeng/toolbar";
import { RippleModule } from "primeng/ripple";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { InputGroupModule } from "primeng/inputgroup";
import { TooltipModule } from "primeng/tooltip";
import { DialogModule } from "primeng/dialog";

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ListRoutingModule,
        TableModule,
        ToastModule,
        ToolbarModule,
        RippleModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        ButtonModule,
        InputGroupModule,
        TooltipModule,
        DialogModule
        
    ],
    declarations: [ListComponent]
})
export class SaleListModule {}