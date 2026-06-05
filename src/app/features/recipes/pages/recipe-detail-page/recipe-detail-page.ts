import {CommonModule} from '@angular/common';
import {Component, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {finalize} from 'rxjs';
import {Location} from '@angular/common';

import {RecipesApi} from '../../services/recipes-api';

import {UiButton} from '../../../../shared/ui/ui-button/ui-button';
import {UiLoader} from '../../../../shared/ui/ui-loader/ui-loader';
import {UiChip} from '../../../../shared/ui/ui-chip/ui-chip';
import {RecipeDetail} from '../../../../core/models/recipe-detail.model';
import {ConfirmDialog} from '../../../../shared/ui/ui-confirm-dialog/ui-confirm-dialog';

@Component({
  selector: 'app-recipe-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    UiButton,
    UiLoader,
    UiChip,
    ConfirmDialog,
  ],
  templateUrl: './recipe-detail-page.html',
  styleUrl: './recipe-detail-page.scss'
})
export class RecipeDetailPage implements OnInit {
  protected readonly loading = signal(true);
  protected readonly recipe = signal<RecipeDetail | null>(null);

  private recipeId!: number;
  protected showConfirm = false;

  constructor(
    private route: ActivatedRoute,
    private recipesApi: RecipesApi,
    private router: Router,
    private location: Location
  ) {
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.router.navigate(['/recipes']);
      return;
    }

    this.recipeId = Number(idParam);
    this.loadRecipe();
  }

  onDeleteClick() {
    this.showConfirm = true;
  }

  protected deleteRecipe(): void {
    this.showConfirm = false;

    this.recipesApi.deleteRecipe(this.recipeId).subscribe({
      next: () => {
        this.router.navigate(['/recipes']);
      },
      error: (error) => {
        console.error('Error deleting recipe', error);
      }
    });
  }

  private loadRecipe(): void {
    this.loading.set(true);

    this.recipesApi.getRecipeById(this.recipeId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (recipe) => {
          this.recipe.set(this.mapRecipe(recipe));
        },
        error: (error) => {
          this.router.navigate(['/recipes']);
        }
      });
  }

  private mapRecipe(recipe: any): RecipeDetail {
    return {
      id: recipe.id,
      title: recipe.title ?? recipe.name ?? '',
      description: recipe.description ?? '',
      category: recipe.category ?? recipe.nationality ?? '',
      tags: recipe.tags ?? [],
      img: recipe.img ?? null,
      cookingTime: recipe.cookingTime ?? recipe.time ?? null,
      servings: recipe.servings ?? null,
      difficulty: recipe.difficulty ?? null,
      ingredients: (recipe.ingredients ?? []).map((ingredient: any) =>
        typeof ingredient === 'string' ? ingredient : ingredient.name
      ),
      steps: (recipe.steps ?? []).map((step: any) =>
        typeof step === 'string' ? step : step.description
      )
    };
  }

  goBack() {
    this.router.navigate(['/recipes']);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'img/generic-recipe-img.jpg';
  }
}
