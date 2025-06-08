import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CharacterStatus, TypingSessionData, LobbyData, Toast, EachSecond, AppTheme } from '../../models/data.models';
import { LobbyService } from '../../services/lobby.service';
import { TextProviderService } from '../../services/text-provider.service';
import { ToastService } from '../../services/toast.service';
import { ButtonComponent } from '../../components/button.component';
import { InputRegularComponent } from '../../components/inputs/input-regular.component';
import gsap from 'gsap';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-typing-test',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputRegularComponent, ButtonComponent],
  templateUrl: './typing-test.component.html',
  styleUrl: './typing-test.component.css'
})
export class TypingTestComponent implements AfterViewInit{
  @ViewChild('inputRef') inputElement!: ElementRef<HTMLInputElement>; // Get reference to input

  title = 'typing-test-game';
  // themes = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
  time = [15, 30, 60, 120]
  // selectedTheme = this.themes[0];
  allWords: CharacterStatus[] = [];
  oneWord: CharacterStatus[][] = [];
  typingSession: TypingSessionData = {
    timeSelected: this.time[0], // Initialize with the default time
    allSeconds: []
  };

  // for timer
  timerID: any;
  timeLeft: number = 0
  selectedTime: number = 0
  isTimerActive: boolean = false
  hasTypingStarted: boolean = false;

  // for results

  correctCharacterCount = 0
  totalAttemptedCharacters = 0
  calculatedWPM: number = 0
  calculatedAccuracy: number = 0
  showResults: boolean = false;

  // For scroll position calculations 
  cursorRect: number = 0
  wrapperRect: number = 0
  distanceViaRect: number = 0
  lastValidCursorTop: number | null = null;
  absoluteCursorTop: number = 0
  verticalScrollPosition: number = 0;
  lineHeight: number = 0

  isMultiplayerMode: boolean = false
  playerName = '';
  
  // lobbyData!: LobbyData;

  lobbyCodeForJoining = ''

  multiplayerStatus: any = ''
  currentLobby: LobbyData | null = null;

  previousAbsoluteCursorTop: number | null = null; // Stores the absolute top position from the PREVIOUS calculation


  selectedTheme!: AppTheme; // This will hold the theme class name
  private themeSubscription!: Subscription;
  private subscriptions: Subscription = new Subscription();


  currentWordIndex = 0;
  currentCharIndex = 0; // Tracks position within the *displayed* word for status updates
  isWordFinished = false; // Flag to check if current word typing is done

  constructor(private textProvider: TextProviderService, private themeService: ThemeService, private toastService: ToastService, private lobbyService: LobbyService) {}


  ngOnInit(): void {
    this.generateWords();

    // Subscribe to theme changes
    this.themeSubscription = this.themeService.currentThemeClassName$.subscribe(themeClass => {
      this.selectedTheme = themeClass;
      // console.log('Current theme class in AppComponent:', this.selectedTheme);
    });

    // this.subscriptions.add(
    //   this.lobbyService.onLobbyCreated().subscribe(
    //     (lobby) => {
    //     console.log('Component: Lobby created with code:', lobby.code);
    //     this.currentLobby = lobby;
    //     this.toastService.showToast('Lobby Created', `Your lobby code was created successfully!`);
    //     }
    // ));

    // this.subscriptions.add(
    //   this.lobbyService.onJoinedLobby().subscribe(
    //     (lobbyData) => {
    //       console.log('Component: Successfully joined lobby:', lobbyData);
    //       this.currentLobby = lobbyData;
    //       this.toastService.showToast('Lobby Joined', `You joined lobby ${this.currentLobby.code} succesfully!`);
    //     }
    //   )
    // );

    // this.subscriptions.add(
    //   this.lobbyService.onPlayerJoined().subscribe(
    //     (playerJoinInfo) => {
    //       console.log('Component: A new player joined:', playerJoinInfo);
    //       this.toastService.showToast('New Player!', `${playerJoinInfo.playerName} has joined the lobby!`);

    //       if (this.currentLobby) {
    //         // Update the player list in the current lobby
    //         this.currentLobby.players = playerJoinInfo.players;
    //       }
    //       // Update UI
    //     }
    //   )
    // );

    // this.subscriptions.add(
    //   this.lobbyService.onLobbyError().subscribe(
    //     (errorMsg) => {
    //       // this.errorMessage = errorMsg;
    //       console.error('Component: Lobby error:', errorMsg);
    //       // Display error to user
    //     }
    //   )
    // );
  }


  animateThis(){
    const element = document.querySelectorAll('.animate-this')

    gsap.fromTo(element, {
      opacity: 0,
      y: 70
    }, {
      opacity: 1,
      y: 0,
      ease: 'power3.out',
      duration: 1,
      delay: 0.5,
      onComplete: () => {
        console.log('Animation complete');
        console.log(this.showResults)
        // You can perform any additional actions here after the animation completes
      }
    });

  }

  ngAfterViewInit(): void {
    this.inputElement?.nativeElement.focus();
    setTimeout(() => {
      this.calculateAndStoreInitialPosition()
      console.log('Position: ' ,this.verticalScrollPosition)

    }, 0)

    this.animateThis()

    // console.log('Position: ' ,this.verticalScrollPosition)

    // const divElement: HTMLDivElement = document.getElementById('words-wrapper') as HTMLDivElement;

    // this.verticalScrollPosition = divElement.scrollTop;
    // console.log('Scroll Position at component initialization: ', this.verticalScrollPosition)

    // const spanCursor = divElement.querySelector('.cursor') as HTMLElement | null;

    // if(spanCursor){
    //   this.cursorRect = Math.round(spanCursor.getBoundingClientRect().top)
    //   this.wrapperRect = Math.round(divElement.getBoundingClientRect().top)
    //   this.distanceViaRect = this.cursorRect - this.wrapperRect;
    //   this.absoluteCursorTop = this.verticalScrollPosition + this.distanceViaRect
    //   localStorage.setItem('previousAbsoluteCursorTop', this.absoluteCursorTop.toString())
    //   console.log(`Cursor position updated: ${this.absoluteCursorTop}`); 
    // }
    
  }

calculateAndStoreInitialPosition() {
    const divElement: HTMLDivElement = document.getElementById('words-wrapper') as HTMLDivElement;
    if (!divElement) return;
    const spanCursor = divElement.querySelector('.cursor') as HTMLElement | null;

    if (spanCursor) {
        const currentScrollTop = divElement.scrollTop; // Should be 0 initially, but read just in case
        const cursorRect = spanCursor.getBoundingClientRect();
        const wrapperRect = divElement.getBoundingClientRect();

        // Calculate initial absolute top
        const currentRelativeTop = Math.round(cursorRect.top - wrapperRect.top);
        const initialAbsoluteTop = currentScrollTop + currentRelativeTop;

        // Store it as the "previous" value for the first comparison later
        this.previousAbsoluteCursorTop = initialAbsoluteTop;
        // Store line height as well
        this.lineHeight = Math.round(cursorRect.height);

        console.log(`Initial Position Calculated -> Absolute Top: ${this.previousAbsoluteCursorTop}, Line Height: ${this.lineHeight}`);
    } else {
        console.warn("Could not find initial cursor to calculate position.");
    }
}

changeTime(time: any){
  this.timeLeft = time
  this.selectedTime = time
  this.typingSession.timeSelected = this.timeLeft
  this.inputElement?.nativeElement.focus(); // Keep focus on input after time change
}

restartGame(){
  this.animateThis()
  this.oneWord.splice(0, 99)
  this.generateWords();
}

resetTimer(){
  // reset time and set variable to false
  this.stopTimer();
  this.timeLeft = this.time[0]
  this.selectedTime = this.timeLeft
  this.hasTypingStarted = false
}

stopTimer(){
  if(this.timerID){
    clearInterval(this.timerID)
    this.timerID = null
    this.isTimerActive = false
  }
}

getCharacterAndAttemptsCount(){
  this.oneWord.forEach(wordArray => {
    wordArray.forEach(char => {
      if(char.status === 'correct'){
        this.correctCharacterCount++
        this.totalAttemptedCharacters++
      }else if(char.status === 'incorrect'){
        this.totalAttemptedCharacters++
      }
    })
  });
}

calculateWPM(): number {
  let wpm = 0;
  switch(this.selectedTime){
    case 15: {
      wpm = (this.correctCharacterCount / 5) / 0.25
      break;
    }

    case 30: {
      wpm = (this.correctCharacterCount / 5) / 0.5
      break;
    }

    case 60: {
      wpm = (this.correctCharacterCount / 5) / 1
      break;
    }

    case 120: {
      wpm = (this.correctCharacterCount / 5) / 2
      break;
    }

    default: {
      console.log("Invalid time selection for WPM calculation");
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
    this.calculatedAccuracy = (this.correctCharacterCount / this.totalAttemptedCharacters) * 100;
  }
  return this.calculatedAccuracy;
}

handleTimeUp(){
  // calculate WPM and accuracy
  console.log('Time up nigga!')
  // this.getCharacterAndAttemptsCount();

  if(this.correctCharacterCount > 0){
    this.calculateWPM()
  }

  // let accuracy = 0
  if(this.totalAttemptedCharacters > 0){
     this.calculateAccuracy()
  }else{
   this.calculatedAccuracy = 0
  }

  console.log('WPM: ', this.calculatedWPM)

  console.log('Accuracy: ', this.calculatedAccuracy)
  this.showResults = true;

  console.log('Results: ', this.typingSession)

  // Disable input to prevent any further typing
  if(this.inputElement && this.inputElement.nativeElement){
    this.inputElement.nativeElement.disabled = true;
  }
}

startTimer(){
  if(this.isTimerActive){
    return;
  }

  this.isTimerActive = true
  // this.timeLeft = 15

  this.timerID = setInterval(() => {

    const eachSecond: EachSecond = {
      second: this.timeLeft,
      wpm: this.calculateWPM(),
      accuracy: this.calculateAccuracy()
    }

    this.typingSession.allSeconds?.push(eachSecond)


    console.log('Each Second: ', eachSecond);
    const newTime = this.timeLeft--


    if(this.timeLeft <= 0){
      this.stopTimer();
      this.handleTimeUp();
    }
  }, 1000)
}


  // getCalculations(){
  //   const divElement: HTMLDivElement = document.getElementById('words-wrapper') as HTMLDivElement;
  //   const spanCursor = divElement.querySelector('.cursor') as HTMLElement | null;


  //   if(spanCursor){
  //     this.cursorRect = Math.round(spanCursor.getBoundingClientRect().top)
  //     this.wrapperRect = Math.round(divElement.getBoundingClientRect().top)
  //     this.lineHeight = Math.round(spanCursor.getBoundingClientRect().height)
  //     console.log('Line height: ', this.lineHeight)
  //     this.distanceViaRect = this.cursorRect - this.wrapperRect;
  //     this.absoluteCursorTop = this.verticalScrollPosition + this.distanceViaRect

  //     // this.lastValidCursorTop = this.distanceViaRect;
  //     console.log(`Cursor position updated: ${this.absoluteCursorTop}`);
  //   }


  // }

  // @HostListener('document:scroll', ['$event'])
  // handleScroll(){
  //   console.log('Position: ' ,this.verticalScrollPosition)
  // }

  @HostListener('document:keydown', ['$event']) // Listen for keydown events globally
  handleKeyboardEvents(event: KeyboardEvent) {
    // Prevent default space behavior (scrolling)
    if (event.key === ' ') {
      event.preventDefault();
      this.processWords(event.key); // Pass space key to handler
    }
    // Optionally handle backspace or other keys if needed
    else if (event.key === 'Backspace') {
      this.processWords(event.key);
    }

    // Ensure input stays focused
    this.inputElement?.nativeElement.focus();
  }

  generateWords() {
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.isWordFinished = false;

    // this.changeTime(this.time[0])
    this.resetTimer();

    if(this.inputElement && this.inputElement.nativeElement){
      this.inputElement.nativeElement.disabled = false;
    }

    this.showResults = false
    this.calculatedWPM = 0
    this.calculatedAccuracy = 0
    this.correctCharacterCount = 0; // Ensure this is reset
    this.totalAttemptedCharacters = 0; // Ensure this is reset


    // this.typingSession.timeSelected = this.timeLeft
    // console.log('Time selected: ', this.typingSession.timeSelected)


    // Generate random words from our pool of words
    const allWords = this.textProvider.getRandomWords(100);

    // For each word, split into characters
    allWords.forEach((word) => {
      let aWord: CharacterStatus[] = [];
      word.split('').map((char) => {
        // Create an object using the type and push to the aWord array
        const item: CharacterStatus = {
          char: char,
          status: 'untyped',
        };

        aWord.push(item);
      });

      // Add a space character object to the end of the current word's array
      aWord.push({ char: ' ', status: 'untyped' });

      if (this.oneWord.length > 0 && this.oneWord[0].length > 0) {
        this.oneWord[0][0].status = 'active';
      }

      // Push each word's splitted objects as well into the oneWord array,
      // so that you have each word as an array of its characters splitted into objects
      this.oneWord.push(aWord);
      // console.log('Some word bi: ', aWord)
    });

    // console.log(this.oneWord)
  }

  // Handles character input from the hidden text input
  onInput(event: Event): void {
    const inputEvent = event as InputEvent;
    const value = (inputEvent.target as HTMLInputElement).value;
    console.log(value);

    this.processWords(value.slice(-1)); // Pass the last typed character

    // Clear the input field after processing the character
    (inputEvent.target as HTMLInputElement).value = '';
  }


  processWords(typedCharacter: string) {
    // Initially check whether hasTypingStarted is false. 
    // If it is, make it true to start

    if(!this.hasTypingStarted){
      this.hasTypingStarted = true
      this.startTimer()
    }
    // console.log('Scroll position before letter press: ', this.verticalScrollPosition)

    // const divElement: HTMLDivElement = document.getElementById(
    //   'words-wrapper'
    // ) as HTMLDivElement;

    // const scrollTopBeforeUpdate = divElement.scrollTop;
    // console.log('Scroll position at start of processWords: ', scrollTopBeforeUpdate);

    // Establish both the current word and current characters
    let currentWord = this.oneWord[this.currentWordIndex];
    let currentChar = currentWord[this.currentCharIndex];

    // We wanna handle backspace to move the index back because
    // the user is clearing a character(s)
    if (typedCharacter !== 'Backspace') {
      // We pass it to the core logic
      this.processAWord(typedCharacter, currentChar, currentWord);

    } else {
      // IF backspace is pressed, move the index back by 1
      // and then set the status back to untyped so they can
      // type that character again

      // You also can't move back to a previous word
      // so at index = 0, nothing happens
      if (this.currentCharIndex !== 0) {
        this.currentCharIndex--;
        currentChar = currentWord[this.currentCharIndex];
        // console.log(`Backspace so index goes to ${this.currentCharIndex}`);
        // console.log('After backspace: ', currentChar);

        currentChar.status = 'active';
      }
    }
  }

  // Core logic for processing the words and their characters
  processAWord(
    typedCharacter: string,
    currentChar: CharacterStatus,
    currentWord: CharacterStatus[]
  ) {
    // console.log('Scroll position before letter press: ', this.verticalScrollPosition)

    const divElement: HTMLDivElement = document.getElementById(
      'words-wrapper'
    ) as HTMLDivElement;

    const scrollTopBeforeUpdate = divElement.scrollTop;
    console.log('Scroll position at start of processWords: ', scrollTopBeforeUpdate);
    
    // We check whether they're equal
    // (user input and desired character)
    if (typedCharacter === currentChar.char) {
      currentChar.status = 'correct';
      this.correctCharacterCount++; // Add this
      this.totalAttemptedCharacters++; // Add this
      // console.log(currentChar);
    } else {
      currentChar.status = 'incorrect';
      this.totalAttemptedCharacters++; // Add this

      // console.log(currentChar);
    }

    // After that we increase the count and then check if
    // the index for the current character is more than the words length
    this.currentCharIndex++;
    if (this.currentCharIndex < currentWord.length) {
      // if not, the next character is active
      currentWord[this.currentCharIndex].status = 'active';
    } else {
      // If it is, reset the character count and move to the next word
      this.currentCharIndex = 0;
      this.currentWordIndex++;
    }


    // setTimeout(() => {
    //   const spanCursor = divElement.querySelector('.cursor') as HTMLElement | null;

    //   if(spanCursor){
    //     // Get current measurements
    //     const currentScrollTop = scrollTopBeforeUpdate;
    //     const cursorRect = spanCursor.getBoundingClientRect();
    //     const wrapperRect = divElement.getBoundingClientRect();

    //     // update line height again (might change depending on character)
    //     this.lineHeight = Math.round(cursorRect.height);

    //     // Calculate current relative top
    //     const currentRelativeTop = Math.round(cursorRect.top - wrapperRect.top);

    //     // Calculate current absolute top
    //     const currentAbsoluteTop = currentScrollTop + currentRelativeTop;

    //     console.log(`Current State -> ScrollTop: ${currentScrollTop}, RelativeTop: ${currentRelativeTop}, AbsoluteTop: ${currentAbsoluteTop}, LineHeight: ${this.lineHeight}`);

    //     if (this.previousAbsoluteCursorTop !== null && this.lineHeight > 0) {
    //         // Check if the absolute position increased significantly (more than half a line)
    //         // const threshold = this.previousAbsoluteCursorTop + (this.lineHeight * 0.5);
    //         if (currentAbsoluteTop > this.previousAbsoluteCursorTop) {
    //             console.log(`%cNew line detected! Prev Abs Top: ${this.previousAbsoluteCursorTop}, Curr Abs Top: ${currentAbsoluteTop}`, 'color: green; font-weight: bold;');

    //             // --- Trigger Scroll Logic ---
    //             const newScrollTop = currentScrollTop + this.lineHeight; // Scroll down by one line height
    //             console.log(`Calculated new scroll target: ${newScrollTop}`);

    //             // Cap scroll amount at the maximum possible scroll position
    //             const maxScrollTop = divElement.scrollHeight - divElement.clientHeight;
    //             console.log(`${divElement.scrollHeight} - ${divElement.clientHeight}`)
    //             const cappedScrollTop = Math.min(newScrollTop, maxScrollTop);

    //             if (cappedScrollTop > currentScrollTop) { // Ensure we are actually scrolling down
    //                  console.log(`Scrolling to: ${cappedScrollTop}`);
    //                  divElement.scrollTo({ top: cappedScrollTop });
    //             } else {
    //                  console.log('Scroll target not greater than current scroll position or max scroll reached.');
    //             }
    //         } else {
    //             console.log('Same line detected (Absolute position change within threshold).');
    //         }
    //     }else {
    //       console.log('First calculation or invalid line height, cannot compare.');
    //     }

    //     this.previousAbsoluteCursorTop = currentAbsoluteTop;
        
    //   }else {
    //     console.warn("Could not find .cursor element after update.");
    //   }


    //   // const retrievedValue = localStorage.getItem('previousAbsoluteCursorTop')
    //   // let convertedValue: number | null = null;

    //   // if(retrievedValue !== null){
    //   //   convertedValue = parseInt(retrievedValue, 10);
    //   // }

    //   // if(convertedValue !== null && !isNaN(convertedValue) && this.absoluteCursorTop !== null){
    //   //   console.log(`Comparing current relative top (${this.absoluteCursorTop}) with stored relative top (${convertedValue})`);

    //   //   if(this.absoluteCursorTop > convertedValue){
    //   //     console.log(`%cNew line detected! Stored: ${convertedValue}, Current: ${this.absoluteCursorTop}`, 'color: blue; font-weight: bold;');

    //   //     // Read current scroll position
    //   //     const currentScrollTop = divElement.scrollTop;
    //   //     console.log(`Current scroll top before calculating new target: ${currentScrollTop}`);

    //   //     // calculate new target scroll position
    //   //     const newScrollTop = currentScrollTop + this.lineHeight;
    //   //     console.log(`Calculated new scroll target: ${newScrollTop} (current: ${currentScrollTop} + lineHeight: ${this.lineHeight})`);

    //   //     divElement.scrollTo({ top: newScrollTop, behavior: 'smooth' });
  
    //   //     localStorage.setItem('previousAbsoluteCursorTop', this.absoluteCursorTop.toString())
    //   //     console.log(`Stored new relative position: ${this.absoluteCursorTop}`);

    //   //   }else{
    //   //     console.log('Same old distance: ', this.absoluteCursorTop)
    //   //     console.log('Scroll Position now: ', this.verticalScrollPosition)
    //   //   }
    //   // }
    // }, 0)
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


  // createLobby() {
  //   if (this.playerName.trim()) {
  //     this.lobbyService.createLobby(this.playerName.trim());
  //   } else {
  //     console.log("Please enter a player name.");
  //   }
  // }

  // joinLobby(){
  //   const data = {
  //     code: this.lobbyCodeForJoining.trim(),
  //     playerName: this.playerName.trim()
  //   }

  //   if(data.playerName && data.code){
  //     console.log('Joining lobby with data: ', data);
  //     this.lobbyService.joinLobby(data);
  //   }else{
  //     console.log("misssing player name or lobby code");
  //   }

  // }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Unsubscribe from all subscriptions
  }
}
