import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import gsap from 'gsap';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent implements AfterViewChecked, OnChanges {
  @Input() header: string = ''
  @Input() message: string = '';
  @Input() selectedTheme: string = ''
  private animationTriggered: boolean = false;


  constructor(private el: ElementRef){}

  ngAfterViewChecked(): void {
    if (this.message && !this.animationTriggered && this.header) {
      this.animationTriggered = true; // Ensure the animation is triggered only once
      const toastElement = this.el.nativeElement.querySelector('.toast');
      gsap.fromTo(toastElement, {
        x: 50,
        opacity: 0
      }, {
        x: 0,
        opacity: 1,
        ease: 'power4',
        duration: 0.5,
        delay: 0.15,
        onComplete: () => {
          setTimeout(() => {
            this.animateOut();
          }, 2500);
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['message'] || changes['header']) {
    //   if (!changes['message'].previousValue || !changes['header'].previousValue) {
    //     this.animationTriggered = true; // Ensure the animation is triggered only once
    //     const toastElement = this.el.nativeElement.querySelector('.toast');
    //     gsap.fromTo(toastElement, {
    //       x: 50,
    //       opacity: 0
    //     }, {
    //       x: 0,
    //       opacity: 1,
    //       ease: 'power4',
    //       duration: 0.5,
    //       delay: 0.15,
    //       onComplete: () => {
    //         setTimeout(() => {
    //           this.animateOut();
    //         }, 5000);
    //       }
    //     });
    //   }
    // }
  }

 
  

  private animateOut() {
    const toastElement = this.el.nativeElement.querySelector('.toast');
    gsap.to(toastElement, {
      x: 50,
      opacity: 0,
      ease: 'power4',
      duration: 0.5,
      onComplete: () => {
        this.animationTriggered = false;
        // this.message = '';
        // this.header = '';
      }
    });
  }
}
