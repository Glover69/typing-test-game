import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { ButtonComponent } from '../components/button.component';
import { ToastService } from '../services/toast.service';
import { ToastComponent } from '../components/toast/toast.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AppTheme, LobbyData, Toast } from '../models/data.models';
import gsap from 'gsap';
import { Subscription } from 'rxjs';
import { ThemeService } from '../services/theme.service';
import { InputRegularComponent } from '../components/inputs/input-regular.component';
import { LobbyService } from '../services/lobby.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastComponent, FormsModule, RouterOutlet, ButtonComponent, InputRegularComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  toastMessage: string = '';
  toastHeader: string = '';
  selectedTheme!: AppTheme; // This will hold the theme class name
  private themeSubscription!: Subscription;
  isMultiplayerMode: boolean = false
  lobbyCodeForJoining = ''
  
  playerName = '';
  multiplayerStatus: any = ''
  currentLobby: LobbyData | null = null;
  private subscriptions: Subscription = new Subscription();

  textAnimationComplete: boolean = false;


  constructor(private toastService: ToastService, public themeService: ThemeService, private lobbyService: LobbyService) {}


  ngOnInit(): void{
    this.animateThis();

    // Subscribe to theme changes

    this.themeSubscription = this.themeService.currentThemeClassName$.subscribe(themeClass => {
      this.selectedTheme = themeClass;
      // console.log('Current theme class in AppComponent:', this.selectedTheme);
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

  animateThis(){
    const element = document.querySelector('.animate-this')

    gsap.fromTo(element, {
      opacity: 0,
      y: 70
    }, {
      opacity: 1,
      y: 0,
      ease: 'power3.out',
      duration: 1.5,
      delay: 3.5,
      onComplete: () => {
        console.log('Animation complete bottom');
        // You can perform any additional actions here after the animation completes
      }
    });
  }



}
