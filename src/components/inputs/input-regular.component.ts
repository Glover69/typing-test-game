import { CommonModule } from '@angular/common';
import { Component, forwardRef, input, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-regular',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  template: `
    <div class="input-group flex flex-col items-start gap-1 w-full">
      @if (isLabel) {
        <span class="text-sm G-Light text-accent tracking-tight">{{ label }}</span>
      }

         <input
           [attr.minlength]="minLength"
           class="focus:outline-none rounded-lg py-2 w-full placeholder:text-gray-900 placeholder:text-sm G-Light"
           [placeholder]="placeholder"
           [type]="type"
           [value]="value"
           (input)="onInput($event)"
           (blur)="onTouched()"
         />
      </div>
     
  `,
  styles: [
    `


    `
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputRegularComponent),
      multi: true
    }
  ]
})
export class InputRegularComponent implements ControlValueAccessor {
  @Input() label: string = 'Label';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() minLength?: number;
  @Input() isLabel: boolean = true;
  @Input() inputType: string = 'text';

  value: string = '';

  constructor() {}

  onChange = (item: any) => {};
  onTouched = () => {};

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

  writeValue(value: any): void {
    this.value = value || '';
  }
  
  registerOnChange(item : any): void {
    this.onChange = item;
  }
  
  registerOnTouched(item: any): void {
    this.onTouched = item;
  }
}
