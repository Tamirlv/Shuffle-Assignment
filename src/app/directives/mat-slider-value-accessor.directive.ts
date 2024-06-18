import { Directive, HostListener, ElementRef, Renderer2, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'mat-slider[formControlName], mat-slider[formControl], mat-slider[ngModel]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MatSliderValueAccessorDirective),
      multi: true,
    },
  ],
})
export class MatSliderValueAccessorDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    this.onChange((event.target as HTMLInputElement).value);
  }

  @HostListener('blur', [])
  onBlur() {
    this.onTouched();
  }

  writeValue(value: any): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
  }
}
