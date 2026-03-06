import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/* =======================================================
   TYPES & MODELS
   ======================================================= */

type ListingStatus = 'Disponible' | 'Réservée' | 'Donnée';
type SortMode = 'recent' | 'expiry' | 'distance';

interface DonationListing {
  id: number;
  title: string;
  image: string;
  city: string;
  category: string;      // ex: fruits, legumes, epicerie, pain, produits_laitiers
  expiry: string;        // affichage "25 Mai" (string)
  expiryDate: Date;      // pour trier proprement
  status: ListingStatus;
  createdAt: Date;       // pour trier "Plus récent"
  distanceKm?: number;   // optionnel (mock)
}

/* =======================================================
   COMPONENT
   ======================================================= */

@Component({
  selector: 'app-listings-page',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './listings-page.component.html',
  styleUrl: './listings-page.component.scss',
})
export class ListingsPageComponent implements OnInit {
  /* =======================================================
     UI STATE
     - 2 niveaux de filtres :
       1) quick   => recherche rapide (top)
       2) filters => recherche complète (sidebar)
     ======================================================= */

  // Filtre rapide (top search)
  quick = {
    q: '',
    category: '',
    city: '',
  };

  // Filtre avancé (sidebar)
  filters = {
    q: '',
    category: '',
    city: '',
    sort: 'recent' as SortMode,
    onlyAvailable: false,
  };

  /* =======================================================
     DATA
     ======================================================= */
  listings: DonationListing[] = [];          // données brutes
  filteredListings: DonationListing[] = [];  // résultat PAGINÉ affiché

  // On conserve aussi la liste filtrée complète (utile pour count/pagination)
  private filteredAll: DonationListing[] = [];

  /* =======================================================
     PAGINATION
     ======================================================= */
  page = 1;
  pageSize = 6; // 6 = 2 lignes de 3 (desktop). Ajuste selon ton UI.
  totalPages = 1;
  pages: number[] = [];

  /* =======================================================
     LIFECYCLE
     ======================================================= */
  ngOnInit(): void {
    this.listings = this.buildMockListings();
    this.applyFilters(); // initialisation de l’affichage
  }

  /* =======================================================
     ACTIONS (triggered by UI)
     ======================================================= */

  /**
   * Soumission du filtre rapide (form top).
   * On revient en page 1 puis on calcule filtres + pagination.
   */
  onSearch(): void {
    this.page = 1;
    this.applyFilters();
  }

  /**
   * Applique l’ensemble des filtres (quick + advanced),
   * puis applique le tri et la pagination.
   */
  applyFilters(): void {
    // 1) Filtrer la liste complète
    const filtered = this.getFilteredListings(this.listings);

    // 2) Trier
    const sorted = this.sortListings(filtered, this.filters.sort);

    // 3) Conserver la liste filtrée complète (pour count)
    this.filteredAll = sorted;

    // 4) Pagination
    this.updatePagination(sorted.length);
    this.filteredListings = this.slicePage(sorted);
  }

  /**
   * Reset uniquement la sidebar (filtre avancé).
   * (Tu peux aussi ajouter resetQuick() si tu veux reset le top.)
   */
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

  /** Navigation pagination */
  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.filteredListings = this.slicePage(this.filteredAll);
  }

  /* =======================================================
     CORE LOGIC (filter / pagination)
     ======================================================= */

  /**
   * Retourne la liste filtrée (sans tri, sans pagination).
   * On combine :
   * - quick (top)
   * - filters (sidebar)
   */
  private getFilteredListings(list: DonationListing[]): DonationListing[] {
    const quickQ = this.normalize(this.quick.q);
    const quickCity = this.normalize(this.quick.city);
    const quickCategory = this.normalize(this.quick.category);

    const advQ = this.normalize(this.filters.q);
    const advCity = this.normalize(this.filters.city);
    const advCategory = this.normalize(this.filters.category);

    return list.filter((item) => {
      // ---------- QUICK FILTER ----------
      const matchesQuickQuery =
        !quickQ ||
        this.normalize(item.title).includes(quickQ) ||
        this.normalize(item.category).includes(quickQ);

      const matchesQuickCity =
        !quickCity || this.normalize(item.city).includes(quickCity);

      const matchesQuickCategory =
        !quickCategory || this.normalize(item.category) === quickCategory;

      // ---------- ADVANCED FILTER ----------
      const matchesAdvQuery =
        !advQ ||
        this.normalize(item.title).includes(advQ) ||
        this.normalize(item.category).includes(advQ);

      const matchesAdvCity =
        !advCity || this.normalize(item.city).includes(advCity);

      const matchesAdvCategory =
        !advCategory || this.normalize(item.category) === advCategory;

      const matchesAvailability =
        !this.filters.onlyAvailable || item.status === 'Disponible';

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

  /** Met à jour totalPages + pages + sécurise page courante */
  private updatePagination(totalItems: number): void {
    this.totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.page = Math.min(Math.max(this.page, 1), this.totalPages);
  }

  /** Retourne uniquement les items de la page courante */
  private slicePage(list: DonationListing[]): DonationListing[] {
    const start = (this.page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  /* =======================================================
     SORTING
     ======================================================= */

  private sortListings(list: DonationListing[], mode: SortMode): DonationListing[] {
    const copy = [...list];

    switch (mode) {
      case 'recent':
        // plus récent => createdAt desc
        copy.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return copy;

      case 'expiry':
        // expiration la plus proche => expiryDate asc
        copy.sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
        return copy;

      case 'distance':
        // distance asc (undefined => fin)
        copy.sort((a, b) => {
          const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
          const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
          return da - db;
        });
        return copy;

      default:
        return copy;
    }
  }

  /* =======================================================
     STRING NORMALIZATION
     - utile pour recherche insensible à la casse + accents
     ======================================================= */
  private normalize(value: string): string {
    return (value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /* =======================================================
     MOCK DATA (MAQUETTE)
     ======================================================= */

  private buildMockListings(): DonationListing[] {
    // util pour fabriquer des dates d’expiration
    const makeExpiry = (daysFromNow: number): { label: string; date: Date } => {
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() + daysFromNow);

      const months = [
        'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
        'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
      ];
      const label = `${d.getDate()} ${months[d.getMonth()]}`;
      return { label, date: d };
    };

    const now = new Date();
    const mkCreatedAt = (daysAgo: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      return d;
    };

    const items: Omit<DonationListing, 'expiry' | 'expiryDate'>[] = [
      { id: 1, title: 'Fraises', image: 'assets/listings/fraise-bol.jpg', city: 'lyon1', category: 'legumes', status: 'Disponible', createdAt: mkCreatedAt(1), distanceKm: 1.8 },
      { id: 2, title: 'Baguettes de pain', image: 'assets/listings/fraise-bol.jpg', city: 'Lyon', category: 'pain', status: 'Disponible', createdAt: mkCreatedAt(0), distanceKm: 3.2 },
      { id: 3, title: 'Riz en vrac', image: 'assets/listings/fraise-bol.jpg', city: 'Lille', category: 'epicerie', status: 'Disponible', createdAt: mkCreatedAt(2), distanceKm: 6.5 },
      { id: 4, title: 'Fraises fraîches', image: 'assets/listings/fraise-bol.jpg', city: 'Nice', category: 'fruits', status: 'Disponible', createdAt: mkCreatedAt(3), distanceKm: 2.1 },
      { id: 5, title: 'Yaourts à donner', image: 'assets/dons/yaourts.jpg', city: 'Valence', category: 'produits_laitiers', status: 'Réservée', createdAt: mkCreatedAt(1), distanceKm: 10.4 },
      { id: 6, title: 'Salade fraîche', image: 'assets/dons/salade.jpg', city: 'Lyon', category: 'legumes', status: 'Donnée', createdAt: mkCreatedAt(4), distanceKm: 4.9 },
      { id: 7, title: 'Tomates', image: 'assets/dons/tomates.jpg', city: 'Grenoble', category: 'legumes', status: 'Disponible', createdAt: mkCreatedAt(0), distanceKm: 7.7 },
      { id: 8, title: 'Pommes', image: 'assets/dons/pommes2.jpg', city: 'Paris', category: 'fruits', status: 'Réservée', createdAt: mkCreatedAt(5), distanceKm: 0.9 },
      { id: 9, title: 'Farine', image: 'assets/dons/farine.jpg', city: 'Marseille', category: 'epicerie', status: 'Disponible', createdAt: mkCreatedAt(2), distanceKm: 12.3 },
      { id: 10, title: 'Fromage', image:'assets/listings/fraise-bol.jpg', city: 'Toulouse', category: 'produits_laitiers', status: 'Disponible', createdAt: mkCreatedAt(6), distanceKm: 8.0 },
      { id: 11, title: 'Céréales', image: 'assets/dons/cereales.jpg', city: 'Nantes', category: 'epicerie', status: 'Disponible', createdAt: mkCreatedAt(1), distanceKm: 5.5 },
      { id: 12, title: 'Bananes', image: 'assets/dons/bananes.jpg', city: 'Bordeaux', category: 'fruits', status: 'Disponible', createdAt: mkCreatedAt(3), distanceKm: 9.6 },
    ];

    const expiries = [5, 2, 7, 3, 1, 4, 2, 6, 8, 3, 5, 2];

    return items.map((base, idx) => {
      const { label, date } = makeExpiry(expiries[idx] ?? 3);
      return { ...base, expiry: label, expiryDate: date };
    });
  }
}