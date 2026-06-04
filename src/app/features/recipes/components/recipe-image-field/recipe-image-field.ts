import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {UiButton} from '../../../../shared/ui/ui-button/ui-button';

@Component({
  selector: 'app-recipe-image-field',
  standalone: true,
  templateUrl: './recipe-image-field.html',
  styleUrl: './recipe-image-field.scss',
  imports: [
    UiButton
  ]
})
export class RecipeImageField {
  @Input() imageUrl: string | null = null;
  @Input() label = 'Imagen de la receta';

  @Output() imageSelected = new EventEmitter<File>();
  @Output() imageRemoved = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  isPreviewOpen = false;

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.imageSelected.emit(file);
    input.value = '';
  }

  openPreview(): void {
    if (!this.imageUrl) {
      return;
    }

    this.isPreviewOpen = true;
  }

  closePreview(): void {
    this.isPreviewOpen = false;
  }

  triggerFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  removeImage(): void {
    this.imageRemoved.emit();
    this.closePreview();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'img/generic-recipe-img.jpg';
  }
}
