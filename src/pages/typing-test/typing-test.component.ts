import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  CharacterStatus,
  TypingSessionData,
  LobbyData,
  Toast,
  EachSecond,
  AppTheme,
  LeaderboardUpdateData,
  PlayerLeaderboardEntry,
} from '../../models/data.models';
import { LobbyService } from '../../services/lobby.service';
import { TextProviderService } from '../../services/text-provider.service';
import { ToastService } from '../../services/toast.service';
import { ButtonComponent } from '../../components/button.component';
import { InputRegularComponent } from '../../components/inputs/input-regular.component';
import gsap from 'gsap';
import { ThemeService } from '../../services/theme.service';
import { ActivatedRoute, Router } from '@angular/router';
import { generatePlayerColor, styleMultiplayerCursor } from '../../utils/utils';

type WordTracking = {
  wordIndex: number;
  offsetTop: number;
};

@Component({
  selector: 'app-typing-test',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './typing-test.component.html',
  styleUrl: './typing-test.component.css',
})
export class TypingTestComponent implements AfterViewInit {
  @ViewChild('inputRef') inputElement!: ElementRef<HTMLInputElement>; // Get reference to input

  title = 'typing-test-game';
  // themes = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
  time = [15, 30, 60, 120];
  // selectedTheme = this.themes[0];
  allWords: CharacterStatus[] = [];
  oneWord: CharacterStatus[][] = [];
  typingSession: TypingSessionData = {
    timeSelected: this.time[0], // Initialize with the default time
    allSeconds: [],
  };

  arrayForTracking: WordTracking[] = [];
  @ViewChildren('word') words!: QueryList<ElementRef<HTMLSpanElement>>;

  // for timer
  timerID: any;
  timeLeft: number = 0;
  selectedTime: number = 0;
  isTimerActive: boolean = false;
  hasTypingStarted: boolean = false;

  // for results

  correctCharacterCount = 0;
  totalAttemptedCharacters = 0;
  calculatedWPM: number = 0;
  calculatedAccuracy: number = 0;
  showResults: boolean = false;

  // For scroll position calculations
  cursorRect: number = 0;
  wrapperRect: number = 0;
  distanceViaRect: number = 0;
  lastValidCursorTop: number | null = null;
  absoluteCursorTop: number = 0;
  verticalScrollPosition: number = 0;
  lineHeight: number = 0;

  isMultiplayerMode: boolean = false;
  playerName = '';

  private lobbyCode: string | null = null;

  // lobbyData!: LobbyData;

  lobbyCodeForJoining = '';

  multiplayerStatus: any = '';
  currentLobby: LobbyData | null = null;

  previousAbsoluteCursorTop: number | null = null; // Stores the absolute top position from the PREVIOUS calculation
  countdownDisplay: number = 0; // For countdown display

  selectedTheme!: AppTheme; // This will hold the theme class name
  private themeSubscription!: Subscription;
  private subscriptions: Subscription = new Subscription();

  initialOffsetTopValue: number = 0;
  private isScrolling = false; // purely internal state
  myPlayerID: any = ''; // Player ID for multiplayer tracking

  currentWordIndex = 0;
  currentCharIndex = 0; // Tracks position within the *displayed* word for status updates
  currentGlobalIndex = 0;
  isWordFinished = false; // Flag to check if current word typing is done

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private textProvider: TextProviderService,
    public themeService: ThemeService,
    private toastService: ToastService,
    private lobbyService: LobbyService
  ) {}

  ngOnInit(): void {
    this.websocketConnections();

    const parsedData = JSON.parse(localStorage.getItem('status') || '{}');
    this.myPlayerID = parsedData.id || ''; // Get player ID from local storage
    console.log('My Player ID:', this.myPlayerID);

    // get route from url
    this.lobbyCode = this.route.snapshot.paramMap.get('lobbyCode');

    const navigation = this.router.getCurrentNavigation();

    const lobbyData = navigation?.extras?.state;
    if (lobbyData) {
      // Fresh navigation with state data
      this.isMultiplayerMode = lobbyData['isMultiplayer'] || false;
      this.currentLobby = lobbyData['lobbyData'] as LobbyData;
      // this.playerName = lobbyData['playerName'] || '';

      console.log('Navigation state data:', lobbyData);
    } else {
      // Fallback: page refresh or direct navigation
      this.isMultiplayerMode =
        this.lobbyCode !== 'local' && this.lobbyCode !== null;

      if (this.isMultiplayerMode) {
        // Try to get from service
        this.currentLobby = this.lobbyService.getCurrentGameSession();

        if (!this.currentLobby) {
          // No lobby data available, redirect to home
          console.error('No lobby data found, redirecting to home');
          this.router.navigate(['/']);
          return;
        }
      }
    }

    // Initialize the appropriate game mode
    if (this.isMultiplayerMode && this.currentLobby) {
      this.setupMultiplayerGame();
    } else {
      this.setupLocalGame();
    }

    // this.generateWords();

    // Subscribe to theme changes
    this.themeSubscription = this.themeService.currentThemeClassName$.subscribe(
      (themeClass) => {
        this.selectedTheme = themeClass;
      }
    );
  }

  // websocketConnections(){
  //   this.subscriptions.add(
  //     this.lobbyService.onLeaderboardUpdate().subscribe({
  //       next: (leaderboard: any) => {
  //         const parsedLeaderboard = JSON.parse(leaderboard);
  //         console.log('Received leaderboard update:', parsedLeaderboard);
  //         parsedLeaderboard.forEach((player: any) => {
  //           if (player.playerId !== this.myPlayerID) {
  //             const targetChar = document.querySelector(`[data-char-index="${player.cursorIndex}"]`) as HTMLElement;
  //             console.log('Found element:', targetChar);
  //             if (targetChar) {
  //               this.renderMultiplayerCursor(targetChar, player);
  //             }
  //           }
  //         });
  //       }
  //     })
  //   )
  // }

  websocketConnections() {
    // Or ngOnInit, or wherever you set up subscriptions
    this.subscriptions.add(
      this.lobbyService.onLeaderboardUpdate().subscribe({
        next: (updateData: LeaderboardUpdateData) => {
          // updateData is { leaderboard: [...], timeLeft: ... }
          console.log('Component: Received leaderboard update:', updateData);

          const leaderboardArray: PlayerLeaderboardEntry[] =
            updateData.leaderboard;
          const timeLeft: number = updateData.timeLeft;

          // You can now use timeLeft to update a timer display, for example
          // this.gameTimeLeft = timeLeft;

          leaderboardArray.forEach((player: PlayerLeaderboardEntry) => {
            // Ensure myPlayerID is correctly set in your component.
            // It should be the ID of the current client's player.
            if (player.id !== this.myPlayerID) {
              // Compare with player.id from the leaderboard entry
              const targetChar = document.querySelector(
                `[data-char-index="${player.cursorIndex}"]`
              ) as HTMLElement;
              // console.log(`Processing player ${player.name} (ID: ${player.id}), cursor: ${player.cursorIndex}. Found element:`, targetChar);
              if (targetChar) {
                this.renderMultiplayerCursor(targetChar, player); // Pass the player object
              }
            } else {
              // This is the current player, you might want to update their own WPM/accuracy display
              // console.log(`My stats: WPM=${player.wpm}, Accuracy=${player.accuracy}`);
              // this.myWpm = player.wpm;
              // this.myAccuracy = player.accuracy;
            }
          });
        },
        error: (err) => {
          console.error('Error receiving leaderboard update:', err);
        },
      })
    );
  }

  renderMultiplayerCursor(
    targetEl: HTMLElement,
    playerData: PlayerLeaderboardEntry
  ) {
    let cursorEl = document.getElementById(`cursor-${playerData.name}`);
    if (!cursorEl) {
      const playerColor = generatePlayerColor(playerData.name);

      cursorEl = document.createElement('div');
      cursorEl.id = `cursor-${playerData.name}`;
      cursorEl.className = 'multiplayer-cursor';
      cursorEl.innerHTML = `<span class="player-name-tag">${playerData.name}</span>`;

      // Apply the generated color
      cursorEl.style.backgroundColor = playerColor;
      cursorEl.style.borderColor = playerColor;

      styleMultiplayerCursor(cursorEl, playerColor);
      document.body.appendChild(cursorEl);
    }

    const rect = targetEl.getBoundingClientRect();
    cursorEl.style.position = 'absolute';
    cursorEl.style.left = `${rect.left}px`;
    cursorEl.style.top = `${rect.top - 20}px`;
  }

  changeTheme(themeClassName: string): void {
    this.themeService.setTheme(themeClassName);
  }

  private setupMultiplayerGame(): void {
    console.log('Setting up multiplayer game with lobby:', this.currentLobby);

    this.changeTime(this.currentLobby?.timeLimit); // Default to first time if not provided
    // this.selectedTime = this.currentLobby?.timeLimit;

    if (this.currentLobby?.words && this.currentLobby.words.length > 0) {
      // Use the words provided by the server
      this.useProvidedWords(this.currentLobby.words);

      if (this.currentLobby) {
        // Calculate delay until countdown should begin
        const now = Date.now();
        const delay = this.currentLobby?.countdownStartTime - now;

        // Wait until the exact moment
        setTimeout(() => {
          this.startCountdown(this.currentLobby?.timeLimit); // Begins the visible 3..2..1 countdown
        }, delay);
      }
    } else {
      console.error('No words provided in lobby data');
    }
  }

  private setupLocalGame(): void {
    console.log('Setting up local game');
    // Your existing word generation logic
    this.generateWords();
  }

  startCountdown(duration: number | undefined) {
    let count = 3;
    const interval = setInterval(() => {
      this.countdownDisplay = count;
      console.log(this.countdownDisplay);
      count--;
      if (count < 0) {
        clearInterval(interval);
        // this.beginTypingPhase(); // Game begins!
        this.startTimer();
      }
    }, 1000);
  }

  private useProvidedWords(words: string[]): void {
    console.log('Using provided words:', words);
    let globalIndex = 0; // Initialize global index for each character

    // Clear existing words
    this.oneWord = [];

    // Convert words to your CharacterStatus format
    words.forEach((word) => {
      let aWord: CharacterStatus[] = [];
      word.split('').forEach((char) => {
        const item: CharacterStatus = {
          char: char,
          status: 'untyped',
          globalIndex: globalIndex,
        };
        aWord.push(item);
        globalIndex++;
      });

      // Add space after each word (except maybe the last one)
      aWord.push({ char: ' ', status: 'untyped', globalIndex: globalIndex });
      globalIndex++; // INCREMENT for the space character
      this.oneWord.push(aWord);
    });

    // Set first character as active
    if (this.oneWord.length > 0 && this.oneWord[0].length > 0) {
      this.oneWord[0][0].status = 'active';
      this.currentGlobalIndex = this.oneWord[0][0].globalIndex;
    }

    // Defer animation until after Angular has processed DOM changes
    setTimeout(() => {
      this.animateThis();
      // Also, re-focus after DOM is likely settled from generateWords
      this.inputElement?.nativeElement.focus({ preventScroll: true });
      // Re-populate word tracking array as words have changed
      if (this.words && this.words.length) {
        // Check if words QueryList is available
        this.createWordArray();
        if (this.arrayForTracking.length > 0) {
          this.initialOffsetTopValue = this.arrayForTracking[0].offsetTop;
        }
      }
    }, 0);

    // // Update UI
    // this.updateWordsDisplay();
  }

  animateThis() {
    const element = document.querySelectorAll('.animate-this');
    console.log('Elements found by animateThis:', element); // For debugging

    if (element.length > 0) {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 70,
        },
        {
          opacity: 1,
          y: 0,
          ease: 'power3.out',
          duration: 1,
          delay: 0.1, // Reduced delay slightly, ensure it's for animation, not DOM readiness
          stagger: 0.1, // Optional: if you want a slight stagger between multiple .animate-this blocks
          onComplete: () => {
            console.log('Animation complete for .animate-this elements');
          },
        }
      );
    } else {
      console.warn('.animate-this elements not found for animation.');
    }
  }

  ngAfterViewInit(): void {
    this.inputElement?.nativeElement.focus();

    // this.animateThis()
    this.createWordArray();
    console.log('All words for tracking in DOM: ', this.arrayForTracking);
    this.initialOffsetTopValue = this.arrayForTracking[0].offsetTop;
  }

  changeTime(time: any) {
    this.timeLeft = time;
    this.selectedTime = time;
    this.typingSession.timeSelected = this.timeLeft;
    this.inputElement?.nativeElement.focus(); // Keep focus on input after time change
  }

  resetTimer() {
    // reset time and set variable to false
    this.stopTimer();
    this.timeLeft = this.time[0];
    this.selectedTime = this.timeLeft;
    this.hasTypingStarted = false;
  }

  stopTimer() {
    if (this.timerID) {
      clearInterval(this.timerID);
      this.timerID = null;
      this.isTimerActive = false;
    }
  }

  getCharacterAndAttemptsCount() {
    this.oneWord.forEach((wordArray) => {
      wordArray.forEach((char) => {
        if (char.status === 'correct') {
          this.correctCharacterCount++;
          this.totalAttemptedCharacters++;
        } else if (char.status === 'incorrect') {
          this.totalAttemptedCharacters++;
        }
      });
    });
  }

  calculateWPM(): number {
    let wpm = 0;
    switch (this.selectedTime) {
      case 15: {
        wpm = this.correctCharacterCount / 5 / 0.25;
        break;
      }

      case 30: {
        wpm = this.correctCharacterCount / 5 / 0.5;
        break;
      }

      case 60: {
        wpm = this.correctCharacterCount / 5 / 1;
        break;
      }

      case 120: {
        wpm = this.correctCharacterCount / 5 / 2;
        break;
      }

      default: {
        console.log('Invalid time selection for WPM calculation');
        wpm = 0; // Default to 0 if time is invalid
        break;
      }
    }
    this.calculatedWPM = wpm;
    return wpm;
  }

  calculateAccuracy(): number {
    if (this.totalAttemptedCharacters === 0) {
      this.calculatedAccuracy = 0; // Avoid division by zero
    } else {
      this.calculatedAccuracy =
        (this.correctCharacterCount / this.totalAttemptedCharacters) * 100;
    }
    return this.calculatedAccuracy;
  }

  handleTimeUp() {
    // calculate WPM and accuracy
    console.log('Time up nigga!');

    if (this.correctCharacterCount > 0) {
      this.calculateWPM();
    }

    if (this.totalAttemptedCharacters > 0) {
      this.calculateAccuracy();
    } else {
      this.calculatedAccuracy = 0;
    }

    console.log('WPM: ', this.calculatedWPM);

    console.log('Accuracy: ', this.calculatedAccuracy);
    this.showResults = true;

    console.log('Results: ', this.typingSession);

    // Disable input to prevent any further typing
    if (this.inputElement && this.inputElement.nativeElement) {
      this.inputElement.nativeElement.disabled = true;
    }
  }

  startTimer() {
    if (this.isTimerActive) {
      return;
    }

    this.isTimerActive = true;

    this.timerID = setInterval(() => {
      const eachSecond: EachSecond = {
        second: this.timeLeft,
        wpm: this.calculateWPM(),
        accuracy: this.calculateAccuracy(),
      };

      this.typingSession.allSeconds?.push(eachSecond);

      const newTime = this.timeLeft--;
      if (this.isMultiplayerMode) {
        this.updateProgress();
      }

      if (this.timeLeft <= 0) {
        this.stopTimer();
        this.handleTimeUp();
      }
    }, 1000);
  }

  @HostListener('window:resize')
  createWordArray() {
    console.log('Hello!');
    let count = 0;
    this.words.forEach((word) => {
      const object = {
        wordIndex: count,
        offsetTop: word.nativeElement.offsetTop,
      };

      this.arrayForTracking.push(object);
      count++;
    });
  }

  @HostListener('document:keydown', ['$event']) // Listen for keydown events globally
  handleKeyboardEvents(event: KeyboardEvent) {
    event.preventDefault(); // Prevent all default behaviors immediately

    if (event.key === 'Backspace') {
      this.processWords(event.key);
    } else if (event.key.length === 1) {
      // Only process printable characters
      this.processWords(event.key);
    }

    // Focus management - simplified
    if (document.activeElement !== this.inputElement?.nativeElement) {
      this.inputElement?.nativeElement.focus({ preventScroll: true });
    }
  }

  generateWords() {
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.currentGlobalIndex = 0;

    this.isWordFinished = false;

    // this.changeTime(this.time[0])
    this.resetTimer();

    if (this.inputElement && this.inputElement.nativeElement) {
      this.inputElement.nativeElement.disabled = false;
    }

    this.showResults = false;
    this.calculatedWPM = 0;
    this.calculatedAccuracy = 0;
    this.correctCharacterCount = 0; // Ensure this is reset
    this.totalAttemptedCharacters = 0; // Ensure this is reset

    this.oneWord = []; // Clear existing words before generating new ones
    // Generate random words from our pool of words
    const allWords = this.textProvider.getRandomWords(100);
    let globalIndex = 0; // Initialize global index for each character

    // For each word, split into characters
    allWords.forEach((word) => {
      let aWord: CharacterStatus[] = [];
      word.split('').map((char) => {
        // Create an object using the type and push to the aWord array
        const item: CharacterStatus = {
          char: char,
          status: 'untyped',
          globalIndex: globalIndex,
        };

        globalIndex++;

        aWord.push(item);
      });

      // Add a space character object to the end of the current word's array
      aWord.push({ char: ' ', status: 'untyped', globalIndex: globalIndex });

      if (this.oneWord.length > 0 && this.oneWord[0].length > 0) {
        this.oneWord[0][0].status = 'active';
        this.currentGlobalIndex = this.oneWord[0][0].globalIndex;
      }

      // Push each word's splitted objects as well into the oneWord array,
      // so that you have each word as an array of its characters splitted into objects
      this.oneWord.push(aWord);
      // console.log('Some word bi: ', aWord)
    });

    console.log('All words: ', this.oneWord);

    // Defer animation until after Angular has processed DOM changes
    setTimeout(() => {
      this.animateThis();
      // Also, re-focus after DOM is likely settled from generateWords
      this.inputElement?.nativeElement.focus({ preventScroll: true });
      // Re-populate word tracking array as words have changed
      if (this.words && this.words.length) {
        // Check if words QueryList is available
        this.createWordArray();
        if (this.arrayForTracking.length > 0) {
          this.initialOffsetTopValue = this.arrayForTracking[0].offsetTop;
        }
      }
    }, 0);
  }

  // Handles character input from the hidden text input
  // onInput(event: Event): void {
  //   const inputEvent = event as InputEvent;
  //   const value = (inputEvent.target as HTMLInputElement).value;
  //   console.log(value);

  //   this.processWords(value.slice(-1)); // Pass the last typed character

  //   // Clear the input field after processing the character
  //   (inputEvent.target as HTMLInputElement).value = '';
  // }

  // processWords(typedCharacter: string) {
  //   // Initially check whether hasTypingStarted is false.
  //   // If it is, make it true to start

  //   if (!this.hasTypingStarted) {
  //     this.hasTypingStarted = true;
  //     this.startTimer();
  //   }

  //   // Establish both the current word and current characters
  //   let currentWord = this.oneWord[this.currentWordIndex];
  //   let currentChar = currentWord[this.currentCharIndex];
  //   this.currentGlobalIndex = currentChar.globalIndex;

  //   // We wanna handle backspace to move the index back because
  //   // the user is clearing a character(s)
  //   if (typedCharacter !== 'Backspace') {
  //     // We pass it to the core logic
  //     this.processAWord(typedCharacter, currentChar, currentWord);
  //   } else {
  //     // IF backspace is pressed, move the index back by 1
  //     // and then set the status back to untyped so they can
  //     // type that character again

  //     // You also can't move back to a previous word
  //     // so at index = 0, nothing happens
  //     if (this.currentCharIndex !== 0) {
  //       currentChar.status = 'untyped';
  //       this.currentCharIndex--;
  //       currentChar = currentWord[this.currentCharIndex];
  //       currentChar.status = 'active';
  //       this.currentGlobalIndex = currentChar.globalIndex;
  //     }
  //   }
  // }

  processWords(typedCharacter: string) {
    if (!this.hasTypingStarted && typedCharacter !== 'Backspace') {
      this.hasTypingStarted = true;
      this.startTimer();
    }

    let currentWord = this.oneWord[this.currentWordIndex];
    let currentChar = currentWord[this.currentCharIndex];

    if (typedCharacter === 'Backspace') {
      this.handleBackspace(currentWord);
    } else {
      this.processAWord(typedCharacter, currentChar, currentWord);
    }

    // Update multiplayer progress less frequently to avoid lag
    if (this.isMultiplayerMode && this.currentGlobalIndex % 5 === 0) {
      this.updateProgress();
    }
  }

  private handleBackspace(currentWord: CharacterStatus[]) {
    if (this.currentCharIndex > 0) {
      // Clear current character status
      currentWord[this.currentCharIndex].status = 'untyped';

      // Move back one character
      this.currentCharIndex--;
      currentWord[this.currentCharIndex].status = 'active';
      this.currentGlobalIndex = currentWord[this.currentCharIndex].globalIndex;

      // Update counters if needed
      if (currentWord[this.currentCharIndex + 1].status === 'correct') {
        this.correctCharacterCount--;
      }
      this.totalAttemptedCharacters--;
    }
  }

  // Core logic for processing the words and their characters
  processAWord(
    typedCharacter: string,
    currentChar: CharacterStatus,
    currentWord: CharacterStatus[]
  ) {
    const divElement: HTMLDivElement = document.getElementById(
      'words-wrapper'
    ) as HTMLDivElement;

    this.currentGlobalIndex = currentChar.globalIndex;

    // We check whether they're equal
    // (user input and desired character)
    if (typedCharacter === currentChar.char) {
      currentChar.status = 'correct';
      this.correctCharacterCount++;
      this.totalAttemptedCharacters++;
    } else {
      currentChar.status = 'incorrect';
      this.totalAttemptedCharacters++;
    }

    // After that we increase the count and then check if
    // the index for the current character is more than the words length
    this.currentCharIndex++;
    if (this.currentCharIndex < currentWord.length) {
      // if not, the next character is active
      currentWord[this.currentCharIndex].status = 'active';
      this.currentGlobalIndex = currentWord[this.currentCharIndex].globalIndex;
    } else {
      // If it is, reset the character count and move to the next word
      this.currentCharIndex = 0;
      this.currentWordIndex++;

      // UPDATE: Set currentGlobalIndex to the first character of the next word
      if (this.currentWordIndex < this.oneWord.length) {
        this.oneWord[this.currentWordIndex][0].status = 'active';
        this.currentGlobalIndex =
          this.oneWord[this.currentWordIndex][0].globalIndex;
      }
    }

    // Only handle scrolling when moving to a new word (much less frequent)
    if (this.currentCharIndex === 0 && this.currentWordIndex > 0) {
      this.handleScrolling();
    }

    // // Calculate & scroll
    // const wordElement = divElement.querySelector(
    //   `.word-track-${this.currentWordIndex}`
    // ) as HTMLElement | null;

    // if (wordElement) {
    //   const currentOffSetTopValue = Math.round(wordElement.offsetTop);
    //   console.log('Initial offset top value: ', this.initialOffsetTopValue);
    //   console.log('Current offset top value: ', currentOffSetTopValue);

    //   if (
    //     !this.isScrolling &&
    //     this.initialOffsetTopValue !== currentOffSetTopValue
    //   ) {
    //     console.log('Time to scroll nigga!');
    //     this.isScrolling = true;

    //     requestAnimationFrame(() => {
    //       wordElement.scrollIntoView({
    //         behavior: 'smooth',
    //         block: 'start',
    //       });

    //       this.initialOffsetTopValue = wordElement.offsetTop;
    //       console.log('New value for initial: ', this.initialOffsetTopValue);
    //       setTimeout(() => {
    //         this.isScrolling = false;
    //       }, 200);
    //     });
    //   }
    // }
  }

  // Separate scrolling logic to avoid running it on every character
  private handleScrolling() {
    const divElement: HTMLDivElement = document.getElementById(
      'words-wrapper'
    ) as HTMLDivElement;
    const wordElement = divElement?.querySelector(
      `.word-track-${this.currentWordIndex}`
    ) as HTMLElement | null;

    if (wordElement && !this.isScrolling) {
      const currentOffSetTopValue = Math.round(wordElement.offsetTop);

      if (this.initialOffsetTopValue !== currentOffSetTopValue) {
        this.isScrolling = true;

        // Use setTimeout instead of requestAnimationFrame for immediate execution
        setTimeout(() => {
          wordElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
          this.initialOffsetTopValue = wordElement.offsetTop;

          setTimeout(() => {
            this.isScrolling = false;
          }, 200);
        }, 0);
      }
    }
  }

  toggleMultiplayerDialog() {
    this.isMultiplayerMode = !this.isMultiplayerMode;
  }

  toggleMultiplayerStatus(status: 'join-game' | 'create-game') {
    this.multiplayerStatus = status;
    this.lobbyCodeForJoining = ''; // Reset lobby code for joining
    this.playerName = ''; // Reset player name
    this.lobbyCodeForJoining = ''; // Reset lobby code after creating a lobby
  }

  updateProgress() {
    let status: { status: string; name: string };
    const statusString = localStorage.getItem('status');

    if (this.currentLobby?.code && this.currentLobby.players && statusString) {
      status = JSON.parse(statusString);

      console.log(`Current lobby: ${this.currentLobby}`);
      const data = {
        code: this.currentLobby.code,
        id:
          this.currentLobby.players.find(
            (player) => player.name === status.name
          )?.id || '',
        playerName: status.name,
        cursorIndex: this.currentGlobalIndex,

        // Make a change here to rather wpm and accuracy so we
        // send the calculated data rather to the server

        correctCharacters: this.correctCharacterCount,
        totalTypedCharacters: this.totalAttemptedCharacters,
      };

      console.log('Updating progress with data:', data);
      this.lobbyService.playerProgressUpdate(data);
    } else {
      console.log('No lobby code or players found, cannot update progress');
      this.toastService.showToast(
        'Error',
        'Cannot update progress, no lobby data available.'
      );
      return;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
