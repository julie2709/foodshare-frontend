import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

type Difficulty = 'Facile' | 'Moyen' | 'Difficile';
type Category = 'plat' | 'salade' | 'dessert' | 'soupe' | 'snack';
type SortMode = 'recent' | 'timeAsc' | 'timeDesc' | 'title';

interface Recipe {
  id: number;
  title: string;
  image: string;
  category: Category;
  timeMin: number;
  difficulty: Difficulty;
  createdAt: Date;        // pour "Plus récent"
  ingredients: string[];  // pour recherche
}

@Component({
  selector: 'app-recipes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipes-page.component.html',
  styleUrl: './recipes-page.component.scss'
})
export class RecipesPageComponent implements OnInit { /* =======================================================
     UI FILTERS
     ======================================================= */
  filters = {
    q: '',
    category: '' as '' | Category,
    time: '' as '' | '15' | '30' | '45' | '60', // seuil max
    difficulty: '' as '' | Difficulty,
    sort: 'recent' as SortMode,
  };

  /* =======================================================
     DATA
     ======================================================= */
  recipes: Recipe[] = [];
  private filteredAll: Recipe[] = []; // liste filtrée complète (utile pour pagination)
  pagedRecipes: Recipe[] = [];        // liste affichée

  /* =======================================================
     COUNT + PAGINATION
     ======================================================= */
  totalFiltered = 0;

  page = 1;
  pageSize = 6; // correspond bien à la maquette (2x2 sur desktop)
  totalPages = 1;
  pages: number[] = [];

  /* =======================================================
     LIFECYCLE
     ======================================================= */
  ngOnInit(): void {
    this.recipes = this.buildMockRecipes();
    this.applyFilters();
  }

  /* =======================================================
     UX: optionnel (filtrer au fil de la frappe)
     - On garde simple : on applique direct.
     - Si tu veux un vrai debounce, je te le fais ensuite.
     ======================================================= */
  onTyping(): void {
    this.page = 1;
    this.applyFilters();
  }

  /* =======================================================
     FILTER / SORT / PAGINATION
     ======================================================= */
  applyFilters(): void {
    const q = this.normalize(this.filters.q);
    const cat = this.filters.category;
    const diff = this.filters.difficulty;
    const timeMax = this.filters.time ? Number(this.filters.time) : null;

    // 1) Filter
    let data = this.recipes.filter((r) => {
      const matchesQuery =
        !q ||
        this.normalize(r.title).includes(q) ||
        r.ingredients.some((ing) => this.normalize(ing).includes(q));

      const matchesCategory = !cat || r.category === cat;
      const matchesDifficulty = !diff || r.difficulty === diff;
      const matchesTime = !timeMax || r.timeMin <= timeMax;

      return matchesQuery && matchesCategory && matchesDifficulty && matchesTime;
    });

    // 2) Sort
    data = this.sortRecipes(data, this.filters.sort);

    // 3) Keep total + update pagination + slice
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

  /* =======================================================
     HELPERS
     ======================================================= */
  private updatePagination(totalItems: number): void {
    this.totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.page = Math.min(Math.max(this.page, 1), this.totalPages);
  }

  private slicePage(list: Recipe[]): Recipe[] {
    const start = (this.page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  private sortRecipes(list: Recipe[], mode: SortMode): Recipe[] {
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

  private normalize(value: string): string {
    return (value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /* =======================================================
     MOCK DATA (MAQUETTE)
     - Images : adapte les paths selon tes assets
     ======================================================= */
  private buildMockRecipes(): Recipe[] {
    const now = new Date();
    const daysAgo = (n: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - n);
      return d;
    };

    return [
      {
        id: 1,
        title: 'Gratin de légumes',
        image: 'assets/recipes/receipe1.jpg',
        category: 'plat',
        timeMin: 30,
        difficulty: 'Facile',
        createdAt: daysAgo(1),
        ingredients: ['courgette', 'pomme de terre', 'crème', 'fromage'],
      },
      {
        id: 2,
        title: 'Salade de riz',
        image: 'assets/recipes/receipe2.jpg',
        category: 'salade',
        timeMin: 30,
        difficulty: 'Facile',
        createdAt: daysAgo(0),
        ingredients: ['riz', 'tomate', 'maïs', 'thon'],
      },
      {
        id: 3,
        title: 'Tarte aux tomates',
        image: 'assets/recipes/receipe3.jpg',
        category: 'plat',
        timeMin: 45,
        difficulty: 'Moyen',
        createdAt: daysAgo(2),
        ingredients: ['tomate', 'pâte', 'moutarde', 'herbes'],
      },
      {
        id: 4,
        title: 'Curry de pois chiches',
        image: 'assets/recipes/salade1.jpg',
        category: 'plat',
        timeMin: 40,
        difficulty: 'Moyen',
        createdAt: daysAgo(3),
        ingredients: ['pois chiches', 'lait de coco', 'curry', 'oignon'],
      },
      {
        id: 5,
        title: 'Soupe de légumes',
        image: 'assets/recipes/salade2.jpg',
        category: 'soupe',
        timeMin: 25,
        difficulty: 'Facile',
        createdAt: daysAgo(4),
        ingredients: ['carotte', 'poireau', 'pomme de terre'],
      },
      {
        id: 6,
        title: 'Pancakes',
        image: 'assets/recipes/salade3.jpg',
        category: 'dessert',
        timeMin: 20,
        difficulty: 'Facile',
        createdAt: daysAgo(2),
        ingredients: ['farine', 'lait', 'oeuf', 'sucre'],
      },
      {
        id: 7,
        title: 'Salade de fruits',
        image: 'assets/recipes/curry.jpg',
        category: 'dessert',
        timeMin: 15,
        difficulty: 'Facile',
        createdAt: daysAgo(5),
        ingredients: ['fraise', 'banane', 'pomme', 'orange'],
      },
      {
        id: 8,
        title: 'Wraps rapides',
        image: 'assets/recipes/salade-riz.jpg',
        category: 'snack',
        timeMin: 15,
        difficulty: 'Facile',
        createdAt: daysAgo(1),
        ingredients: ['tortilla', 'salade', 'fromage', 'jambon'],
      },
    ];
  }
}