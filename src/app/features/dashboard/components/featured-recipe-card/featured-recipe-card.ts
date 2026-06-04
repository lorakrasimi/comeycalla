import {Component, Input} from '@angular/core';
import {Recipe} from '../../../../core/models/recipe.model';
import {RouterLink} from '@angular/router';
import {UiButton} from '../../../../shared/ui/ui-button/ui-button';
import {UiChip} from '../../../../shared/ui/ui-chip/ui-chip';

@Component({
  selector: 'app-featured-recipe-card',
  imports: [
    RouterLink,
    UiButton,
    UiChip
  ],
  templateUrl: './featured-recipe-card.html',
  styleUrl: './featured-recipe-card.scss',
})
export class FeaturedRecipeCard  {
  @Input() recipe!: Recipe | undefined;

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'img/generic-recipe-img.jpg';
  }
}
