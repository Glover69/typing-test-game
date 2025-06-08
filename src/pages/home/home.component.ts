import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ButtonComponent } from '../../components/button.component';
import { InputRegularComponent } from '../../components/inputs/input-regular.component';
import { AppTheme, LobbyData, Player, Toast } from '../../models/data.models';
import { LobbyService } from '../../services/lobby.service';
import { ThemeService } from '../../services/theme.service';
import { ToastService } from '../../services/toast.service';
import gsap from 'gsap';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonComponent, InputRegularComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  isLocalMode: boolean = true; // Default to local mode
  selectedTheme!: AppTheme; // This will hold the theme class name
  private themeSubscription!: Subscription;
  isMultiplayerMode: boolean = false
  lobbyCodeForJoining = ''
  currentPlayer: Player | null = null;
  isGameStarted: boolean = false;
  
  // Inputs for creating lobby
  wordCount: number = 10; // Default word count
  timeLimit: number = 0; // Default time limit in seconds
  playerName = '';
  time = [15, 30, 60, 120]

  multiplayerStatus: any = ''
  currentLobby: LobbyData | null = null;
  private subscriptions: Subscription = new Subscription();

  textAnimationComplete: boolean = false;

  private mainTimeline: gsap.core.Timeline | null = null;
  private meteorElements: HTMLElement[] = [];
  private meteorTweens: gsap.core.Tween[] = [];


  constructor(private toastService: ToastService, private router: Router, private renderer: Renderer2, public themeService: ThemeService, private lobbyService: LobbyService) {}


  ngOnInit(): void{
    this.webSocketConnections();

    // Subscribe to theme changes
    this.themeSubscription = this.themeService.currentThemeClassName$.subscribe(themeClass => {
      this.selectedTheme = themeClass;
      console.log('Current theme class in AppComponent:', this.selectedTheme);
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

    this.mainTimeline = gsap.timeline();

    
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
        this.renderer.appendChild(textElement, charSpan); // Use Renderer2
      });

      // Animate characters one by one
      this.mainTimeline.to(textElement.children, {
        opacity: 1,
        y: 0,
        stagger: 0.07,
        duration: 0.5,
        ease: 'power3.out',
        onComplete: () => {
          console.log('Text animation completed');
          // this.textAnimationComplete = true;
        }
      }, 1); // Start at 1 second mark in the timeline
    }

    if (buttonHolder) {
      this.mainTimeline.fromTo(buttonHolder,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, ease: 'power4', duration: 1, delay: 0.5 } // Relative delay
      , ">-0.2"); // Start slightly overlapping with text animation end
    }

    // Create and animate meteors
    if (animationContainer) {
      const numMeteors = 150; // Adjust number of meteors
      const containerWidth = animationContainer.offsetWidth;
      const containerHeight = animationContainer.offsetHeight;
      this.meteorElements = []; // Clear previous meteors if any
      this.meteorTweens = [];

      console.log('Container dimensions:', containerWidth, containerHeight);

      for (let i = 0; i < numMeteors; i++) {
        const meteor = this.renderer.createElement('div');
        this.renderer.setStyle(meteor, 'position', 'absolute');
        this.renderer.setStyle(meteor, 'width', `${Math.random() * 3 + 1}px`);
        this.renderer.setStyle(meteor, 'height', `32px`);
        this.renderer.setStyle(meteor, 'backgroundColor', 'var(--color-accent, white)');
        this.renderer.setStyle(meteor, 'borderRadius', '50%');
        this.renderer.setStyle(meteor, 'opacity', '0');
        this.renderer.setStyle(meteor, 'transformOrigin', 'center center');
        this.renderer.setStyle(meteor, 'rotate', `${Math.random() * 360}deg`);
        this.renderer.appendChild(animationContainer, meteor);
        this.meteorElements.push(meteor);

        // Function to set random animation properties
        const animateMeteor = (m: HTMLElement) => {
          const startX = Math.random() * containerWidth;
          const startY = Math.random() < 0.5 ? -42 : containerHeight + 10;
          const endX = Math.random() * containerWidth;
          const endY = startY < 0 ? containerHeight + 10 : -42;

          const tween = gsap.fromTo(m,
            { x: startX, y: startY, opacity: 0, scale: Math.random() * 0.4 + 0.6 },
            {
              x: endX, y: endY, opacity: Math.random() * 0.3 + 0.7, scale: Math.random() * 0.3 + 0.8,
              duration: Math.random() * 5 + 4, delay: Math.random() * 6, ease: 'none',
              onComplete: () => animateMeteor(m) // Pass meteor to loop
            }
          );
          this.meteorTweens.push(tween);
        };
        animateMeteor(meteor); // Start the animation for this meteor
      }
    }
  }

  navigateToGame(): void {
    if (this.mainTimeline) {
      // 1. Handle Meteors: Fade out and stop animations
      this.meteorTweens.forEach(tween => tween.kill()); // Stop future animations
      gsap.to(this.meteorElements, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          this.meteorElements.forEach(m => m.remove()); // Remove from DOM
          this.meteorElements = [];
          this.meteorTweens = [];
        }
      });

      // 2. Reverse the main timeline (text and buttons)
      this.mainTimeline.eventCallback("onReverseComplete", () => {
        console.log("Main timeline reverse complete. Navigating...");
        this.router.navigate(['/game']);
        this.mainTimeline?.eventCallback("onReverseComplete", null); // Clean up callback
      });
      this.mainTimeline.reverse();
    } else {
      // Fallback if timeline wasn't created
      this.router.navigate(['/game']);
    }
  }


  webSocketConnections(){
    // Web socket connections
    this.subscriptions.add(
      this.lobbyService.onLobbyCreated().subscribe(
        (lobby) => {
        console.log('Component: Lobby created with code:', lobby.code);
        this.currentLobby = lobby;
        this.toastService.showToast('Lobby Created', `Your lobby code was created successfully!`);
        }
    ));

    this.subscriptions.add(
      this.lobbyService.onJoinedLobby().subscribe(
        (lobbyData) => {
          console.log('Component: Successfully joined lobby:', lobbyData);
          this.currentLobby = lobbyData;
          this.toastService.showToast('Lobby Joined', `You joined lobby ${this.currentLobby.code} succesfully!`);
          this.currentPlayer = this.currentLobby.players.find(player => player.name === this.playerName) || null;
        }
      )
    );
    this.subscriptions.add(
      this.lobbyService.onPlayerReady().subscribe(
        (lobbyData) => {
          console.log('Component: Player ready status confirmed:', lobbyData);
          this.currentLobby = lobbyData;
          this.currentPlayer = this.currentLobby.players.find(player => player.name === this.playerName) || null;
          this.toastService.showToast('Ready Status', `${this.currentPlayer?.name} is now ready!`);
          // Update UI to reflect player ready status
        }
      )

    );

    this.subscriptions.add(
      this.lobbyService.onGameStarted().subscribe(
        (lobbyData) => {
          console.log('Component: Game started:', lobbyData);
          this.currentLobby = lobbyData;
          this.toastService.showToast('Game Started', `The game has started!`);
          // Navigate to the game page or update UI accordingly
          this.isGameStarted = true;
          this.router.navigate(['/game']);
        }
      )
    );


    this.subscriptions.add(
      this.lobbyService.onPlayerJoined().subscribe(
        (playerJoinInfo) => {
          console.log('Component: A new player joined:', playerJoinInfo);
          this.toastService.showToast('New Player!', `${playerJoinInfo.playerName} has joined the lobby!`);

          if (this.currentLobby) {
            // Update the player list in the current lobby
            this.currentLobby.players = playerJoinInfo.players;
          }
          // Update UI
        }
      )
    );

    this.subscriptions.add(
      this.lobbyService.onLobbyError().subscribe(
        (errorMsg) => {
          // this.errorMessage = errorMsg;
          console.error('Component: Lobby error:', errorMsg);
          this.toastService.showToast('Lobby Error', errorMsg);
          // Display error to user
        }
      )
    );
  }

  toggleMultiplayerDialog(){
    this.isMultiplayerMode = !this.isMultiplayerMode
  }

  toggleMultiplayerStatus(status: 'join-game' | 'create-game') {
    this.multiplayerStatus = status;
    this.lobbyCodeForJoining = ''; // Reset lobby code for joining
    this.playerName = ''; // Reset player name
    this.lobbyCodeForJoining = ''; // Reset lobby code after creating a lobby
  }


  createLobby() {
    console.log('Burger')
    if(this.playerName === '' || !this.wordCount || !this.timeLimit){
      this.toastService.showToast('Error', 'Please fill in all fields before creating a lobby.');
    }

    const data = {
      playerName: this.playerName.trim(),
      wordCount: this.wordCount,
      timeLimit: this.timeLimit
    }


    console.log('Creating lobby with data: ', data);
    // Call the lobby service to create a lobby
    this.lobbyService.createLobby(data)
  }

  joinLobby(){
    const data = {
      code: this.lobbyCodeForJoining.trim(),
      playerName: this.playerName.trim()
    }

    if(data.playerName && data.code){
      console.log('Joining lobby with data: ', data);
      this.lobbyService.joinLobby(data);
    }else{
      console.log("misssing player name or lobby code");
    }
  }

  changeTime(time: number){
    this.timeLimit = time
  }

  startGame(code: string, timeLimit: number, wordCount: number ): void {
    const data = {
      code: code,
      timeLimit: timeLimit,
      wordCount: wordCount
    }
    console.log('Starting game with data: ', data);
    this.lobbyService.startGame(data)
  }

  readyUp(isReady: boolean, code: string, playerName: string): void {
    const data = {
      code: code,
      playerName: playerName,
      isReady: isReady
    }

    console.log(data, this.currentLobby)
    this.lobbyService.readyUp(data)
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }

    this.subscriptions.unsubscribe(); // Unsubscribe from all subscriptions

  }
}
