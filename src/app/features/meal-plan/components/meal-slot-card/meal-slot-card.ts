import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MealSlot} from '../../../../core/models/meal-plan.model';
import {UiButton} from '../../../../shared/ui/ui-button/ui-button';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-meal-slot-card',
  imports: [
    UiButton,
    RouterLink
  ],
  templateUrl: './meal-slot-card.html',
  styleUrl: './meal-slot-card.scss',
})
export class MealSlotCard {
  @Input({required: true}) slot!: MealSlot;
  @Output() replace = new EventEmitter<MealSlot>();

  protected onReplace(): void {
    this.replace.emit(this.slot);
  }

  protected getMealTypeTranslation(i: string): string {
    switch (i) {
      case 'breakfast':
        return "DESAYUNO"
      case 'lunch':
        return "COMIDA"
      case 'dinner':
        return "CENA"
      default:
        return "tipo de comida"
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'img/generic-recipe-img.jpg';
  }
}
