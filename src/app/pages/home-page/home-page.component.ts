import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ListingService } from '../../core/services/listing.service';
import { RecipeService } from '../../core/services/recipe.service';

import { Listing } from '../../shared/models/listing.model';
import { Recipe } from '../../shared/models/recipe.model';

import { environment } from '../../../environments/environment';

interface HomeRecipeCardViewModel {
  id: number;
  title: string;
  image: string | null;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  q = '';
  category = '';
  city = '';

  // ================= DONNÉES DYNAMIQUES DE LA HOME =================
  recentListings: Listing[] = [];
  recipes: HomeRecipeCardViewModel[] = [];

  // ================= ÉTAT UI =================
  loadingListings = false;
  loadingRecipes = false;

  listingsError = '';
  recipesError = '';

  constructor(
    private router: Router,
    private listingService: ListingService,
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    this.loadRecentListings();
    this.loadRecentRecipes();
  }

  onSearch(): void {
    this.router.navigate(['/dons'], {
      queryParams: {
        q: this.q,
        category: this.category,
        city: this.city
      }
    });
  }

  // ================= DONS RÉCENTS =================
  private loadRecentListings(): void {
    this.loadingListings = true;
    this.listingsError = '';

    this.listingService.getAll().subscribe({
      next: (data: Listing[]) => {
        // On prend les 8 premiers dons pour garder le même esprit que ta home d'origine
        this.recentListings = data.slice(0, 8);
        this.loadingListings = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des dons récents :', err);
        this.loadingListings = false;
        this.listingsError = 'Impossible de charger les dons récents.';
      }
    });
  }

  // ================= RECETTES =================
  private loadRecentRecipes(): void {
    this.loadingRecipes = true;
    this.recipesError = '';

    this.recipeService.getAll().subscribe({
      next: (data: Recipe[]) => {
        // On garde 4 recettes sur la home
        this.recipes = data.slice(0, 4).map((item) => ({
          id: item.id,
          title: item.title,
          image:
            item.photos?.[0]?.publicUrl ||
            this.toAbsoluteImageUrl(item.photos?.[0]?.url) ||
            null
        }));

        this.loadingRecipes = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des recettes :', err);
        this.loadingRecipes = false;
        this.recipesError = 'Impossible de charger les recettes.';
      }
    });
  }

  // ================= IMAGE D'UN DON =================
  getListingImage(item: Listing): string | null {
    const photo = item.photos?.[0];

    if (!photo) {
      return null;
    }

    if (photo.publicUrl) {
      return photo.publicUrl;
    }

    if (photo.url?.startsWith('http://') || photo.url?.startsWith('https://')) {
      return photo.url;
    }

    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}/${photo.url.replace(/^\/+/, '')}`;
  }

  // ================= IMAGE D'UNE RECETTE =================
  private toAbsoluteImageUrl(relativeUrl?: string | null): string | null {
    if (!relativeUrl) return null;

    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }

    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}/${relativeUrl.replace(/^\/+/, '')}`;
  }

  // ================= AFFICHAGE DU STATUT =================
  getDisplayStatus(status: Listing['status']): string {
    switch (status) {
      case 'DISPONIBLE':
        return 'Disponible';
      case 'RESERVEE':
        return 'Réservée';
      case 'DONNEE':
        return 'Donnée';
      default:
        return status;
    }
  }

  // ================= FORMAT DE DATE =================
  formatExpiry(expiryDate: string | null): string {
    if (!expiryDate) return 'Non précisée';

    const date = new Date(expiryDate);
    if (isNaN(date.getTime())) return 'Non précisée';

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short'
    }).format(date);
  }
}