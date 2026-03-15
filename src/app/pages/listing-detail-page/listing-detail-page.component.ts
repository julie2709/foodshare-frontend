import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ListingService } from '../../core/services/listing.service';
import { Listing } from '../../shared/models/listing.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-listing-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listing-detail-page.component.html',
  styleUrls: ['./listing-detail-page.component.scss']
})
export class ListingDetailPageComponent implements OnInit {
  // ================= DON PRINCIPAL =================
  listing: Listing | null = null;

  // ================= AUTRES DONS =================
  relatedListings: Listing[] = [];

  // ================= ÉTAT UI =================
  loading = true;
  errorMessage = '';

  // ================= INTERACTIONS =================
  actionsMenuOpen = false;
  requestSent = false;

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService
  ) {}

  ngOnInit(): void {
    this.loadListing();
  }

  // ================= CHARGEMENT DU DON =================
  private loadListing(): void {
    this.loading = true;
    this.errorMessage = '';

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.loading = false;
      this.errorMessage = 'Identifiant du don invalide.';
      return;
    }

    this.listingService.getById(id).subscribe({
      next: (data: Listing) => {
        this.listing = data;
        this.loading = false;
        this.loadRelatedListings(data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement du don :', err);
        this.loading = false;
        this.errorMessage = 'Impossible de charger le détail du don.';
      }
    });
  }

  // ================= AUTRES DONS =================
  private loadRelatedListings(current: Listing): void {
    this.listingService.getAll().subscribe({
      next: (data: Listing[]) => {
        this.relatedListings = data
          .filter((item) => item.id !== current.id)
          .filter((item) => {
            const sameCategory = this.normalize(item.category) === this.normalize(current.category);
            const sameCity = this.normalize(item.city ?? '') === this.normalize(current.city ?? '');
            return sameCategory || sameCity;
          })
          .slice(0, 3);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des dons liés :', err);
      }
    });
  }

  // ================= IMAGES =================
  getListingImage(item: Listing | null): string | null {
    if (!item) return null;

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

  getListingGallery(item: Listing | null): string[] {
    if (!item?.photos?.length) return [];

    const baseUrl = environment.apiUrl.replace('/api', '');

    return item.photos
      .map((photo) => {
        if (photo.publicUrl) return photo.publicUrl;
        if (photo.url?.startsWith('http://') || photo.url?.startsWith('https://')) {
          return photo.url;
        }
        if (photo.url) {
          return `${baseUrl}/${photo.url.replace(/^\/+/, '')}`;
        }
        return null;
      })
      .filter((url): url is string => !!url);
  }

  // ================= AFFICHAGE DES CHAMPS =================
  getDisplayStatus(status: Listing['status'] | undefined): string {
    switch (status) {
      case 'DISPONIBLE':
        return 'Disponible';
      case 'RESERVEE':
        return 'Réservée';
      case 'DONNEE':
        return 'Donnée';
      default:
        return 'Non précisé';
    }
  }

  getStatusClass(status: Listing['status'] | undefined): string {
    switch (status) {
      case 'DISPONIBLE':
        return 'status-chip status-chip--success';
      case 'RESERVEE':
        return 'status-chip status-chip--warning';
      case 'DONNEE':
        return 'status-chip status-chip--neutral';
      default:
        return 'status-chip';
    }
  }

  getDisplayCategory(category: string | null | undefined): string {
    return category?.trim() || 'Non précisée';
  }

  getDisplayQuantity(quantity: string | null | undefined): string {
    return quantity?.trim() || 'Non précisée';
  }

  getDisplayCity(city: string | null | undefined): string {
    return city?.trim() || 'Ville non précisée';
  }

  getDisplayPostalCode(postalCode: string | null | undefined): string {
    return postalCode?.trim() || 'Non précisé';
  }

  getDisplayDescription(description: string | null | undefined): string {
    return description?.trim() || 'Aucune description fournie.';
  }

  getDisplayPickupInfo(pickupInfo: string | null | undefined): string {
    return pickupInfo?.trim() || 'Aucune information de récupération précisée.';
  }

  formatExpiry(expiryDate: string | null | undefined): string {
    if (!expiryDate) return 'Non précisée';

    const date = new Date(expiryDate);
    if (isNaN(date.getTime())) return 'Non précisée';

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  formatCreatedAt(createdAt: string | null | undefined): string {
    if (!createdAt) return 'Non précisée';

    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return createdAt;

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  getLocation(item: Listing | null): string {
    if (!item) return 'Non précisée';

    const city = this.getDisplayCity(item.city);
    const postalCode = item.postalCode ? ` (${item.postalCode})` : '';
    return `${city}${postalCode}`;
  }

  // ================= PUBLISHER =================
  getPublisherName(item: Listing | null): string {
    if (!item?.user) {
      return 'Membre FoodShare';
    }

    // Si plus tard user contient firstName / name / email, on pourra affiner ici
    return 'Membre FoodShare';
  }

  getPublisherSubtitle(item: Listing | null): string {
    return `Publié le ${this.formatCreatedAt(item?.createdAt)}`;
  }

  // ================= ACTIONS =================
  toggleActionsMenu(): void {
    this.actionsMenuOpen = !this.actionsMenuOpen;
  }

  sendRequest(): void {
    this.requestSent = true;
  }

  contactDonor(): void {
    alert('Fonctionnalité de contact à brancher prochainement.');
  }

  reportListing(): void {
    alert('Signalement enregistré.');
    this.actionsMenuOpen = false;
  }

  editListing(): void {
    alert('Modification à brancher prochainement.');
    this.actionsMenuOpen = false;
  }

  deleteListing(): void {
    alert('Suppression à brancher prochainement.');
    this.actionsMenuOpen = false;
  }

  @HostListener('document:click')
  closeMenuOnOutsideClick(): void {
    if (this.actionsMenuOpen) {
      this.actionsMenuOpen = false;
    }
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  private normalize(value: string): string {
    return (value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}