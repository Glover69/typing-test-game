import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { ButtonComponent } from '../components/button.component';
import { ToastService } from '../services/toast.service';
import { ToastComponent } from '../components/toast/toast.component';
import { RouterOutlet } from '@angular/router';
import { AppTheme, Toast } from '../models/data.models';
import gsap from 'gsap';
import { Subscription } from 'rxjs';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ToastComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit, OnDestroy {
  toastMessage: string = '';
  toastHeader: string = '';
  selectedTheme!: AppTheme; // This will hold the theme class name
  private themeSubscription!: Subscription;

  textAnimationComplete: boolean = false;


  constructor(private toastService: ToastService, public themeService: ThemeService) {}


  ngOnInit(): void{

    this.themeSubscription = this.themeService.currentThemeClassName$.subscribe(themeClass => {
      this.selectedTheme = themeClass;
      console.log('Current theme class in AppComponent:', this.selectedTheme);
    });

    this.toastService.toast$.subscribe((toast: Toast) => {
      this.toastMessage = `${toast.message}`;
      this.toastHeader = `${toast.header}`;
      // Automatically hide the snackbar after 5 seconds
      setTimeout(() => {
        // this.animateOut();
        (this.toastHeader = ''), (this.toastMessage = '');
      }, 3500);
    });
  }

  // Example method to change theme from a component
  changeTheme(themeClassName: string): void {
    this.themeService.setTheme(themeClassName);
  }

  ngAfterViewInit(): void {
    const textElement = document.querySelector('.main-txt');
    const buttonHolder = document.querySelector('.button-holder');
    const animationContainer = document.querySelector('.entire-component') as HTMLElement; // Your main section


    if (textElement) {
      const originalText = 'SpeedType';
      console.log(originalText)
      textElement.textContent = ''; // Clear original text

      // Split text into characters and wrap each in a span
      originalText.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        charSpan.style.display = 'inline-block'; // Necessary for individual transforms if needed
        charSpan.style.opacity = '0'; // Start hidden
        textElement.appendChild(charSpan);
      });

      // Animate characters one by one
      gsap.to(textElement.children, {
        opacity: 1,
        y: 0, // Optional: if you want them to slide in from a y-offset
        stagger: 0.07, // Time between each character animation
        duration: 0.5, // Duration of each character's animation
        ease: 'power3.out',
        delay: 1, // Initial delay before the animation starts
        afterComplete: () => {
          // After all characters are animated, you can do something here if needed
          console.log('Text animation completed');
          // this.textAnimationComplete = true; // Set flag to true when animation is complete
        }
      });
    }

    gsap.fromTo(buttonHolder, {
      y: 50,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      ease: 'power4',
      duration: 1.5,
      delay: 2 // Delay to sync with text animation
    });

    // Create and animate meteors
    if (animationContainer) {
      const numMeteors = 150; // Adjust number of meteors
      const containerWidth = animationContainer.offsetWidth;
      const containerHeight = animationContainer.offsetHeight;

      console.log('Container dimensions:', containerWidth, containerHeight);

      for (let i = 0; i < numMeteors; i++) {
        const meteor = document.createElement('div');
        meteor.style.position = 'absolute';
        meteor.style.width = `${Math.random() * 3 + 1}px`; // Random width (1px to 4px)
        meteor.style.height = `32px`; // Square meteors
        meteor.style.backgroundColor = 'var(--color-accent)'; // Use theme accent or fallback
        meteor.style.borderRadius = '50%';
        meteor.style.transformOrigin = 'center center'; // Ensure rotation is around the center
        meteor.style.rotate = `${Math.random() * 360}deg`; // Random rotation
        meteor.style.opacity = '0'; // Start invisible
        animationContainer.appendChild(meteor);

        // Function to set random animation properties
        const animateMeteor = () => {
          // Random start (edges) and end positions
          const startX = Math.random() * containerWidth;
          const startY = Math.random() < 0.5 ? -20 : containerHeight + 20; // Start from top or bottom edge
          const endX = Math.random() * containerWidth;
          const endY = startY > 0 ? -20 : containerHeight + 20; // End at opposite edge

          gsap.fromTo(meteor,
            { x: startX, y: startY, opacity: 0, scale: Math.random() * 0.4 + 0.6 },
            {
              x: endX,
              y: endY,
              opacity: Math.random() * 0.3 + 0.7, // Random opacity (0.3 to 0.8)
              scale: Math.random() * 0.3 + 0.8,
              duration: Math.random() * 5 + 4, // Random duration (3s to 8s)
              delay: Math.random() * 6, // Random initial delay
              ease: 'linear',
              onComplete: animateMeteor, // Loop the animation by calling itself
            }
          );
        };
        animateMeteor(); // Start the animation for this meteor
      }
    }
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}
