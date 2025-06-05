import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ButtonComponent } from "../button.component";
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-file-input',
    imports: [CommonModule, ButtonComponent],
    standalone: true,
    template: `
        <div class="file-drop border border-dashed border-[#E0E2E7] cursor-pointer gap-2 rounded-lg bg-[#F9F9FC] flex flex-col items-center justify-center px-4 py-5" [class.dragover]="dragOver" (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)" (drop)="onDrop($event)">
            <input type="file" [attr.accept]="accept" [attr.multiple]="multiple ? '' : null" (change)="onFileChange($event)" #fileInput hidden/>

            @if (files.length === 0) {
             <div class="flex flex-col items-center justify-center gap-2">
                <div class="icon w-12 h-12 bg-primary-purple rounded-lg flex items-center justify-center">
                    <img src="/icons/picture.svg" alt="" srcset="">
                    
                </div>

                <span class="text-custom-gray G-Light tracking-tight">Drag and drop image here, or click add image</span>
             </div>
            }@else {
                <div class="multiple-previews flex flex-wrap gap-3">
                    @for (preview of imagePreviews; track $index) {
                        <div class="icon relative group w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                        <img class="object-cover w-full h-full" [src]="preview" alt="" srcset="">
                        <button
                                type="button"
                                (click)="removeFile($index); $event.stopPropagation()"
                                class="absolute top-1 z-[1000] right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove image"
                            >&times;</button>
                        </div>
                    }
                  
                </div>
            }

            <app-button (click)="fileInput.click(); $event.stopPropagation()" label="Add Image" variant="secondary"></app-button>
        </div>
    `,
    styles: [`
        .file-drop {
            transition: border-color 0.2s;
        }
        .file-drop.dragover {
           @apply bg-secondary-purple border border-primary-purple
        }
    `],
     providers: [

      ]
})
export class FileInputComponent {
    @Input() accept: string = '';
    @Input() multiple: boolean = true;
    @Output() filesChange = new EventEmitter<File[]>();

    files: File[] = [];
    imagePreviews: string[] = []; 
    dragOver = false;

    onFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            this.addFiles(input.files);
            input.value = '';
        }
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        this.dragOver = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        this.dragOver = false;
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        this.dragOver = false;
        if (event.dataTransfer?.files) {
            this.addFiles(event.dataTransfer.files);
        }
    }

    private addFiles(fileList: FileList) {
        const newFiles = Array.from(fileList);
        if (!this.multiple) {
            this.files = [newFiles[0]];
            this.imagePreviews = [];
        } else {
            this.files = [...this.files, ...newFiles];
        }
        this.generatePreviews();
        this.filesChange.emit(this.files);
    }

    removeFile(index: number) {
        if (index >= 0 && index < this.files.length) {
            this.files.splice(index, 1);
            this.imagePreviews.splice(index, 1);
            this.filesChange.emit(this.files); // Emit updated list
        }
    }

    // private generatePreviews() {
    //     this.imagePreviews = [];
    //     for (const file of this.files) {
    //         const reader = new FileReader();
    //         reader.onload = (e: any) => {
    //             this.imagePreviews.push(e.target.result);
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // }

    private generatePreviews() {
        // If not multiple, previews array should match files array (max 1)
        if (!this.multiple) {
            this.imagePreviews = []; // Clear first
            if (this.files.length > 0) {
                this.readAndAddPreview(this.files[0]);
            }
        } else {
             // For multiple, ensure previews match files
             this.imagePreviews = []; // Clear and rebuild
             this.files.forEach(file => this.readAndAddPreview(file));
        }
    }

    private readAndAddPreview(file: File) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
   }
}