import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { RecipeService } from '../../core/services/recipe.service';
import { Recipe } from '../../shared/models/recipe.model';
import { environment } from '../../../environments/environment';

type Difficulty = 'Facile' | 'Moyen' | 'Difficile';
type Category = 'plat' | 'salade' | 'dessert' | 'soupe' | 'snack';
type SortMode = 'recent' | 'timeAsc' | 'timeDesc' | 'title';

interface RecipeCardViewModel {
  id: number;
  title: string;

  // URL finale de l'image affichée dans la carte
  // null = aucune image disponible
  image: string | null;

  category: Category | '';
  timeMin: number;
  difficulty: Difficulty | '';
  createdAt: Date;
  ingredients: string[];
  tags: string[];
}

@Component({
  selector: 'app-recipes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recipes-page.component.html',
  styleUrl: './recipes-page.component.scss'
})
export class RecipesPageComponent implements OnInit {
  filters = {
    q: '',
    category: '' as '' | Category,
    time: '' as '' | '15' | '30' | '45' | '60',
    difficulty: '' as '' | Difficulty,
    sort: 'recent' as SortMode,
  };

  // ================= DONNÉES POUR L'AFFICHAGE =================
  recipes: RecipeCardViewModel[] = [];
  private filteredAll: RecipeCardViewModel[] = [];
  pagedRecipes: RecipeCardViewModel[] = [];

  totalFiltered = 0;

  // ================= PAGINATION =================
  page = 1;
  pageSize = 6;
  totalPages = 1;
  pages: number[] = [];

  // ================= ÉTAT UI =================
  loading = false;
  errorMessage = '';

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  onTyping(): void {
    this.page = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    const q = this.normalize(this.filters.q);
    const cat = this.filters.category;
    const diff = this.filters.difficulty;
    const timeMax = this.filters.time ? Number(this.filters.time) : null;

    let data = this.recipes.filter((r) => {
      const matchesQuery =
        !q ||
        this.normalize(r.title).includes(q) ||
        r.ingredients.some((ing) => this.normalize(ing).includes(q)) ||
        r.tags.some((tag) => this.normalize(tag).includes(q));

      const matchesCategory = !cat || r.category === cat;
      const matchesDifficulty = !diff || r.difficulty === diff;
      const matchesTime = !timeMax || r.timeMin <= timeMax;

      return matchesQuery && matchesCategory && matchesDifficulty && matchesTime;
    });

    data = this.sortRecipes(data, this.filters.sort);

    this.filteredAll = data;
    this.totalFiltered = data.length;

    this.updatePagination(this.totalFiltered);
    this.pagedRecipes = this.slicePage(this.filteredAll);
  }

  resetFilters(): void {
    this.filters = {
      q: '',
      category: '',
      time: '',
      difficulty: '',
      sort: 'recent',
    };

    this.page = 1;
    this.applyFilters();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.pagedRecipes = this.slicePage(this.filteredAll);
  }

  // ================= CHARGEMENT API =================
  private loadRecipes(): void {
    this.loading = true;
    this.errorMessage = '';

    this.recipeService.getAll().subscribe({
      next: (data: Recipe[]) => {
        // Transformation des données API en données prêtes pour l'affichage
        this.recipes = data.map((item) => this.mapApiRecipeToViewModel(item));

        this.loading = false;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des recettes :', err);
        this.loading = false;
        this.errorMessage = 'Erreur lors du chargement des recettes.';
      }
    });
  }

  // ================= MAPPING API -> UI =================
  private mapApiRecipeToViewModel(item: Recipe): RecipeCardViewModel {
    const image =
      item.photos?.[0]?.publicUrl ||
      this.toAbsoluteImageUrl(item.photos?.[0]?.url) ||
      null;

    return {
      id: item.id,
      title: item.title,
      image,
      category: this.inferCategory(item),
      timeMin: item.timeMinutes ?? 0,
      difficulty: this.mapDifficulty(item.difficulty),
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      ingredients: this.parseIngredients(item.ingredients),
      tags: this.parseTags(item.tags)
    };
  }

  // ================= AIDE À LA CATÉGORISATION =================
  private inferCategory(item: Recipe): Category | '' {
    const normalizedTags = this.normalize(item.tags ?? '');
    const normalizedTitle = this.normalize(item.title);

    if (normalizedTags.includes('salade') || normalizedTitle.includes('salade')) {
      return 'salade';
    }

    if (
      normalizedTags.includes('dessert') ||
      normalizedTitle.includes('tarte') ||
      normalizedTitle.includes('gateau')
    ) {
      return 'dessert';
    }

    if (normalizedTags.includes('soupe') || normalizedTitle.includes('soupe')) {
      return 'soupe';
    }

    if (
      normalizedTags.includes('snack') ||
      normalizedTitle.includes('wrap') ||
      normalizedTitle.includes('sandwich')
    ) {
      return 'snack';
    }

    return 'plat';
  }

  private mapDifficulty(value: string | null): Difficulty | '' {
    if (value === 'Facile' || value === 'Moyen' || value === 'Difficile') {
      return value;
    }

    return '';
  }

  // ================= PARSING DES CHAMPS TEXTE =================
  private parseIngredients(value: string): string[] {
    return value
      .split(/,|\n|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private parseTags(value: string | null): string[] {
    if (!value) return [];

    return value
      .split(/,|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  // ================= GESTION DES URLS D'IMAGES =================
  private toAbsoluteImageUrl(relativeUrl?: string | null): string | null {
    if (!relativeUrl) return null;

    // Si l'URL est déjà absolue, on la retourne directement
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }

    // On part de environment.apiUrl = https://127.0.0.1:8000/api
    // et on enlève /api pour obtenir la base du serveur de fichiers
    const baseUrl = environment.apiUrl.replace('/api', '');

    return `${baseUrl}/${relativeUrl.replace(/^\/+/, '')}`;
  }

  // ================= PAGINATION =================
  private updatePagination(totalItems: number): void {
    this.totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.page = Math.min(Math.max(this.page, 1), this.totalPages);
  }

  private slicePage(list: RecipeCardViewModel[]): RecipeCardViewModel[] {
    const start = (this.page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  // ================= TRI =================
  private sortRecipes(list: RecipeCardViewModel[], mode: SortMode): RecipeCardViewModel[] {
    const copy = [...list];

    switch (mode) {
      case 'recent':
        copy.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return copy;

      case 'timeAsc':
        copy.sort((a, b) => a.timeMin - b.timeMin);
        return copy;

      case 'timeDesc':
        copy.sort((a, b) => b.timeMin - a.timeMin);
        return copy;

      case 'title':
        copy.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
        return copy;

      default:
        return copy;
    }
  }

  // ================= NORMALISATION POUR LA RECHERCHE =================
  private normalize(value: string): string {
    return (value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}