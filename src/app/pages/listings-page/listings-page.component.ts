import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ListingService } from '../../core/services/listing.service';
import { Listing } from '../../shared/models/listing.model';

type SortMode = 'recent' | 'expiry';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-listings-page',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './listings-page.component.html',
  styleUrl: './listings-page.component.scss',
})
export class ListingsPageComponent implements OnInit {
  quick = {
    q: '',
    category: '',
    city: '',
  };

  filters = {
    q: '',
    category: '',
    city: '',
    sort: 'recent' as SortMode,
    onlyAvailable: false,
  };

  listings: Listing[] = [];
  filteredListings: Listing[] = [];
  filteredAll: Listing[] = [];

  page = 1;
  pageSize = 6;
  totalPages = 1;
  pages: number[] = [];

  loading = false;
  errorMessage = '';

  constructor(
    private listingService: ListingService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.readQueryParams();
    this.loadListings();
  }

  onSearch(): void {
    this.page = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    const filtered = this.getFilteredListings(this.listings);
    const sorted = this.sortListings(filtered, this.filters.sort);

    this.filteredAll = sorted;
    this.updatePagination(sorted.length);
    this.filteredListings = this.slicePage(sorted);
  }

  resetFilters(): void {
    this.filters = {
      q: '',
      category: '',
      city: '',
      sort: 'recent',
      onlyAvailable: false,
    };

    this.page = 1;
    this.applyFilters();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.filteredListings = this.slicePage(this.filteredAll);
  }

  private loadListings(): void {
    this.loading = true;
    this.errorMessage = '';

    this.listingService.getAll().subscribe({
      next: (data) => {
        this.listings = data;
        this.loading = false;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des dons :', err);
        this.loading = false;
        this.errorMessage = 'Erreur lors du chargement des dons.';
      }
    });
  }

  private readQueryParams(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.quick.q = params.get('q') ?? params.get('search') ?? '';
      this.quick.category = params.get('category') ?? '';
      this.quick.city = params.get('city') ?? '';

      this.page = 1;
      this.applyFilters();
    });
  }

  getListingImage(item: Listing): string | null {
    const photo = item.photos?.[0];

    if (!photo) {
      return null;
    }

    if (photo.publicUrl) {
      return photo.publicUrl;
    }
     // reconstruire l'URL proprement à partir de l'apiUrl
    const baseUrl = environment.apiUrl.replace('/api', '');

    return `${baseUrl}/${photo.url.replace(/^\/+/, '')}`;
      
    }

  hasImage(item: Listing): boolean {
    return !!item.photos?.length;
  }

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

  formatExpiry(expiryDate: string | null): string {
    if (!expiryDate) return 'Non précisée';

    const date = new Date(expiryDate);
    if (isNaN(date.getTime())) return 'Non précisée';

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short'
    }).format(date);
  }

  private getFilteredListings(list: Listing[]): Listing[] {
    const quickQ = this.normalize(this.quick.q);
    const quickCity = this.normalize(this.quick.city);
    const quickCategory = this.normalize(this.quick.category);

    const advQ = this.normalize(this.filters.q);
    const advCity = this.normalize(this.filters.city);
    const advCategory = this.normalize(this.filters.category);

    return list.filter((item) => {
      const matchesQuickQuery =
        !quickQ ||
        this.normalize(item.title).includes(quickQ) ||
        this.normalize(item.category).includes(quickQ);

      const matchesQuickCity =
        !quickCity || this.normalize(item.city ?? '').includes(quickCity);

      const matchesQuickCategory =
        !quickCategory || this.normalize(item.category) === quickCategory;

      const matchesAdvQuery =
        !advQ ||
        this.normalize(item.title).includes(advQ) ||
        this.normalize(item.category).includes(advQ);

      const matchesAdvCity =
        !advCity || this.normalize(item.city ?? '').includes(advCity);

      const matchesAdvCategory =
        !advCategory || this.normalize(item.category) === advCategory;

      const matchesAvailability =
        !this.filters.onlyAvailable || item.status === 'DISPONIBLE';

      return (
        matchesQuickQuery &&
        matchesQuickCity &&
        matchesQuickCategory &&
        matchesAdvQuery &&
        matchesAdvCity &&
        matchesAdvCategory &&
        matchesAvailability
      );
    });
  }

  private updatePagination(totalItems: number): void {
    this.totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.page = Math.min(Math.max(this.page, 1), this.totalPages);
  }

  private slicePage(list: Listing[]): Listing[] {
    const start = (this.page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  private sortListings(list: Listing[], mode: SortMode): Listing[] {
    const copy = [...list];

    switch (mode) {
      case 'recent':
        copy.sort((a, b) => {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();
          return bTime - aTime;
        });
        return copy;

      case 'expiry':
        copy.sort((a, b) => {
          const aTime = a.expiryDate ? new Date(a.expiryDate).getTime() : Number.POSITIVE_INFINITY;
          const bTime = b.expiryDate ? new Date(b.expiryDate).getTime() : Number.POSITIVE_INFINITY;
          return aTime - bTime;
        });
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
}