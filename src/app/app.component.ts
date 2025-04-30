import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextProviderService } from '../services/text-provider.service';
import { CharacterStatus } from '../models/data.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit {
  @ViewChild('inputRef') inputElement!: ElementRef<HTMLInputElement>; // Get reference to input

  title = 'typing-test-game';
  themes = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
  selectedTheme = this.themes[0];
  allWords: CharacterStatus[] = [];
  oneWord: CharacterStatus[][] = [];

  // For scroll position calculations 
  cursorRect: number = 0
  wrapperRect: number = 0
  distanceViaRect: number = 0
  lastValidCursorTop: number | null = null;
  absoluteCursorTop: number = 0
  verticalScrollPosition: number = 0;

  

  currentWordIndex = 0;
  currentCharIndex = 0; // Tracks position within the *displayed* word for status updates
  isWordFinished = false; // Flag to check if current word typing is done

  constructor(private textProvider: TextProviderService) {}

  onThemeChange(theme: string) {
    this.selectedTheme = theme;
    this.inputElement?.nativeElement.focus(); // Keep focus on input after theme change
  }

  ngOnInit(): void {
    this.generateWords();
    console.log(this.oneWord);
  }


  ngAfterViewInit(): void {
    this.inputElement?.nativeElement.focus();

    const divElement: HTMLDivElement = document.getElementById('words-wrapper') as HTMLDivElement;

    const spanCursor = divElement.querySelector('.cursor') as HTMLElement | null;
    this.verticalScrollPosition = divElement.scrollTop;
    console.log('Scroll Position at component initialization: ', this.verticalScrollPosition)

    this.getCalculations();
  }


  getCalculations(){
    const divElement: HTMLDivElement = document.getElementById('words-wrapper') as HTMLDivElement;
    const spanCursor = divElement.querySelector('.cursor') as HTMLElement | null;

    if(spanCursor){
      this.cursorRect = Math.round(spanCursor.getBoundingClientRect().top)
      this.wrapperRect = Math.round(divElement.getBoundingClientRect().top)
      this.distanceViaRect = this.cursorRect - this.wrapperRect;
      this.lastValidCursorTop = this.distanceViaRect;
      console.log(`Cursor position updated: ${this.lastValidCursorTop}`);
    }

  }

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
    });
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
    console.log('Scroll position before letter press: ', this.verticalScrollPosition)

    const divElement: HTMLDivElement = document.getElementById(
      'words-wrapper'
    ) as HTMLDivElement;
    // Establish both the current word and current characters
    let currentWord = this.oneWord[this.currentWordIndex];
    let currentChar = currentWord[this.currentCharIndex];

    // We wanna handle backspace to move the index back because
    // the user is clearing a character(s)
    if (typedCharacter !== 'Backspace') {
      // We pass it to the core logic
      this.processAWord(typedCharacter, currentChar, currentWord);

      // Optionally update lastValidCursorTop on backspace too
      // const cursorRect = Math.round(spanCursor.getBoundingClientRect().top)
      // const wrapperRect = Math.round(divElement.getBoundingClientRect().top)
      // console.log(`Both cursorRect and wrapperRect: ${cursorRect} & ${wrapperRect}`)
      // const distanceViaRect: number | null = cursorRect - wrapperRect;
      this.getCalculations();
      this.absoluteCursorTop = this.verticalScrollPosition + this.distanceViaRect;

      console.log('Absolute Cursor Top: ', this.absoluteCursorTop)

      if(this.lastValidCursorTop !== null && this.absoluteCursorTop > this.lastValidCursorTop){
        this.verticalScrollPosition = this.absoluteCursorTop
        console.log(`New line! last vaid cursor top and current are: ${this.lastValidCursorTop} and ${this.absoluteCursorTop}`)
        divElement.scrollTo({ top: this.absoluteCursorTop, behavior: 'smooth' });

        this.lastValidCursorTop = this.absoluteCursorTop
        console.log('New distance value: ', this.lastValidCursorTop)
      }else{
        console.log('Same old distance: ', this.lastValidCursorTop)
        console.log('Scroll Position now: ', this.verticalScrollPosition)

      }

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
      // Defer DOM check even for backspace if needed for consistency or future features
    //   setTimeout(() => {
    //     const spanCursor = divElement.querySelector('.cursor') as HTMLElement | null;
    //     if (spanCursor) {
    //         // Optionally update lastValidCursorTop on backspace too
    //         const cursorRect = spanCursor.getBoundingClientRect();
    //         const wrapperRect = divElement.getBoundingClientRect();
    //         const distanceViaRect = cursorRect.top - wrapperRect.top;
    //         console.log(distanceViaRect)
    //         this.lastValidCursorTop = distanceViaRect; // Update on backspace if cursor visible
    //         console.log(`Cursor position updated after backspace: ${this.lastValidCursorTop}`);
    //     } else {
    //         console.warn('Cursor not found after backspace.');
    //     }
    // }, 0);
    }
  }

  // Core logic for processing the words and their characters
  processAWord(
    typedCharacter: string,
    currentChar: CharacterStatus,
    currentWord: CharacterStatus[]
  ) {
    // We check whether they're equal
    // (user input and desired character)
    if (typedCharacter === currentChar.char) {
      currentChar.status = 'correct';
      // console.log(currentChar);
    } else {
      currentChar.status = 'incorrect';
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
  }
}
