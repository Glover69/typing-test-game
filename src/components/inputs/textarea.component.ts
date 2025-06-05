import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  imports: [CommonModule],
  standalone: true,
  template: `
    <div class="input-group flex flex-col items-start w-full">
      @if (isLabel) {
        <span class="text-sm G-Light text-main-black tracking-tight">{{ label }}</span>
      }

      <textarea [rows]="5"
           [attr.minlength]="minLength"
           class="focus:outline-none resize-none rounded-lg border border-gray-200 bg-white py-2 px-3 w-full placeholder:text-[#A1A1AA] placeholder:text-sm G-Light"
           [placeholder]="placeholder"
           [value]="value"
           (input)="onInput($event)"
           (blur)="onTouched()">
      </textarea>
      </div>
  `,
  styles: [
    `
    .input-group{
      @apply gap-1
    }

    .input {
      @apply border flex items-center border-gray-200 rounded-lg px-3 py-2;
    }
    `
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true
    }
  ]
})
export class TextareaComponent {
  @Input() label: string = 'Label';
  @Input() placeholder: string = 'Enter value';
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
