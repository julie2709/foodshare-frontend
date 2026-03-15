import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RecipeService } from '../../core/services/recipe.service';
import { Recipe } from '../../shared/models/recipe.model';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recipe-detail-page.component.html',
  styleUrl: './recipe-detail-page.component.scss'
})
export class RecipeDetailPageComponent implements OnInit {
  recipe: Recipe | null = null;

  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    this.loadRecipe();
  }

  private loadRecipe(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || isNaN(id)) {
      this.errorMessage = 'Recette introuvable.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.recipeService.getById(id).subscribe({
      next: (data) => {
        this.recipe = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement de la recette.';
        this.loading = false;
      }
    });
  }

  getRecipeImage(): string {
    const photo = this.recipe?.photos?.[0];

    if (!photo?.url) {
      return 'assets/recipes/receipe1.jpg';
    }

    if (photo.publicUrl) {
      return photo.publicUrl;
    }

    if (photo.url.startsWith('http://') || photo.url.startsWith('https://')) {
      return photo.url;
    }

    return `https://127.0.0.1:8000/${photo.url.replace(/^\/+/, '')}`;
  }

  getIngredientsList(): string[] {
    if (!this.recipe?.ingredients) return [];

    return this.recipe.ingredients
      .split(/,|\n|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

// getStepsList(): string[] {
//   if (!this.recipe?.steps) return [];

//   return this.recipe.steps
//     .split(/,|\n|;/)   // séparation par virgule, retour ligne ou ;
//     .map((item) => item.trim())
//     .filter(Boolean);
  // }
  getStepsList(): string[] {
  if (!this.recipe?.steps) return [];

  return this.recipe.steps
    .split(/\.|,|\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

  getTagsList(): string[] {
    if (!this.recipe?.tags) return [];

    return this.recipe.tags
      .split(/,|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  formatCreatedAt(date: string | undefined): string {
    if (!date) return 'Non précisée';

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return date;

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(parsed);
  }
}