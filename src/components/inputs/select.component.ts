import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-select',
  imports: [CommonModule],
  standalone: true,
  template: ` 
   <div class="input-group flex flex-col items-start w-full">
    @if (label) {
      <span class="text-sm G-Light text-main-black tracking-tight">{{ label }}</span>
    }
      <select [value]="value" (change)="onChange($event)" (blur)="onTouched()" [disabled]="disabled" class="w-full rounded-lg text-sm G-Light py-2 px-3 border border-gray-200" name="" id="">

      @if (placeholder) {
        <option class="text-regular-txt" [value]="null" disabled selected>{{ placeholder }}</option>
      }
        @for (option of options; track $index) {
            <option [value]="option">{{option}}</option>
        }
      </select>
    </div>
   `,
   styles: [
    `
    .input-group{
      @apply gap-1
    }

    select {
      @apply border border-gray-200 rounded-lg px-3 py-2;
    }
    `
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
export class SelectComponent implements ControlValueAccessor {
    @Input() label: string = 'Label';
    @Input() options: string[] = [];
    @Input() placeholder: string = ''; // Optional placeholder

    // Internal state
    value: string | null = null;
    disabled = false;

    // Placeholder functions for Angular callbacks
    private propagateChange = (_: any) => {};
    private propagateTouched = () => {};

    constructor() {}

    // --- ControlValueAccessor implementation ---

    // Called by Angular to write a value into the component
    writeValue(value: any): void {
        this.value = value ?? null;
    }

    // Registers a callback function that should be called when the control's value changes in the UI.
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    // Registers a callback function that should be called when the control receives a blur event.
    registerOnTouched(fn: any): void {
        this.propagateTouched = fn;
    }

    // Called by Angular when the control's disabled status changes.
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    // --- Internal methods ---

    // Called when the select value changes
    onChange(event: Event): void {
        const selectElement = event.target as HTMLSelectElement;
        const newValue = selectElement.value;
        this.value = newValue;
        this.propagateChange(newValue); // Notify Angular of the change
    }

     // Called when the select element loses focus
     onTouched(): void {
      this.propagateTouched(); // Notify Angular that the control was touched
  }
}