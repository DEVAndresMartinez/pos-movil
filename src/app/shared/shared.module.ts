import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyFormatterDirective } from '../currency-formatter.directive';

@NgModule({
  declarations: [CurrencyFormatterDirective],
  imports: [CommonModule],
  exports: [CurrencyFormatterDirective]
})
export class SharedModule {}
