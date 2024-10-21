import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StocktakingReportsRoutingModule } from './stocktaking-reports-routing.module';
import { StocktakingReportsComponent } from './stocktaking-reports.component';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    StocktakingReportsRoutingModule,
    ToastModule,
    TableModule,
    ButtonModule,
    SplitButtonModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    CheckboxModule,
    TooltipModule
  ],
  declarations: [StocktakingReportsComponent],
  providers: [MessageService]
})
export class StocktakingReportsModule { }
