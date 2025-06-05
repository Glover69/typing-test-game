import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-button',
  imports: [LottieComponent, CommonModule],
  standalone: true,
  template: `
    <button class="disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
      [ngClass]="{
        'bg-accent text-bg-primary': variant === 'primary',
        'bg-secondary-purple': variant === 'secondary',
        'bg-white text-custom-gray border border-custom-gray': variant === 'tertiary',
        'px-4 py-2 flex items-center gap-2 justify-center rounded-lg': true
      }"
      [disabled]="disabled || externalLoading"
      (click)="handleClick()"
      [type]="type"
    >
      @if (externalLoading) {
      <ng-lottie [options]="lottieConfig" width="20px"> </ng-lottie>
      }@else if(hasIcon){
       <img class="w-4" [src]="iconPath" alt="">
      }
      <span
        [ngClass]="{
          'text-bg-primary': variant === 'primary',
          'text-primary-purple': variant === 'secondary',
          'text-custom-gray': variant === 'tertiary'
        }"
        class="G-Regular text-sm"
        >{{ label }}</span
      >
    </button>
  `,
  styles: [
    `

    `,
  ],
})
export class ButtonComponent {
  @Input() hasIcon: boolean = false;
  @Input() iconPath: string = '';
  @Input() variant: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Input() isLoadingKey: string = '';
  isLoadingChange: { [key: string]: boolean } = {};
  @Input() disabled: any;
  @Input() label: string = 'Label';
  @Input() type: string = 'submit';
  @Input() clickFunction?: () => Promise<any> | void;

  // External loading flag for use with (ngSubmit)
  @Input() externalLoading: boolean = false;

  lottieConfig = {
    path: '/lottie/loader-2.json', // Relative path to the animation file
    autoplay: true, // Autoplay the animation
    loop: true, // Loop the animation
  };

  constructor() {}

  handleClick() {
    if (this.clickFunction) {
      // Set loading true before calling the function
      this.setLoading(true);
      const result = this.clickFunction();
      if (result && result.finally) {
        result.finally(() => this.setLoading(false));
      } else {
        this.setLoading(false);
      }
    }
  }

  setLoading(loading: boolean) {
    this.isLoadingChange[this.isLoadingKey] = loading;
  }
}
