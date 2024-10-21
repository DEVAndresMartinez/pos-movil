import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCurrencyFormatter]'
})
export class CurrencyFormatterDirective {

  private el: HTMLInputElement;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    this.el = this.elementRef.nativeElement;
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    const rawValue = value.replace(/[^0-9.]/g, '');
    this.el.value = this.formatNumber(rawValue);
  }

  @HostListener('blur')
  onBlur() {
    const rawValue = this.el.value.replace(/[^0-9.]/g, '');
    this.el.value = this.formatNumber(rawValue);
  }

  @HostListener('focus')
  onFocus() {
    this.el.value = this.removeFormatting(this.el.value);
  }

  private formatNumber(value: string): string {
    if (!value) return '';

    const [integerPart, decimalPart] = value.split('.');

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }

  private removeFormatting(value: string): string {
    return value.replace(/,/g, '');
  }
}
