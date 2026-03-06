import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type SortMode = 'popular' | 'recent' | 'replies';

interface ForumCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface ForumTopic {
  id: number;
  title: string;
  categoryId: string;
  categoryName: string;

  author: string;
  authorAvatar: string;
  timeAgo: string;

  replies: number;
  related: number;
  lastActivity: string;

  // Tri “popularité”
  score: number;
  createdAt: Date;
}

@Component({
  selector: 'app-forums-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forums-page.component.html',
  styleUrl: './forums-page.component.scss'
})
export class ForumsPageComponent implements OnInit {

  /* ================= UI STATE ================= */
  selectedCategoryId: string = 'all';
  sort: SortMode = 'popular';

  /* ================= STATS ================= */
  stats = {
    topics: 189,
    replies: 835,
  };

  /* ================= DATA ================= */
  categories: ForumCategory[] = [];
  topics: ForumTopic[] = [];

  private filteredAll: ForumTopic[] = [];
  pagedTopics: ForumTopic[] = [];

  /* ================= PAGINATION ================= */
  currentPage = 1;
  pageSize = 5; // maquette ~ 4/5 sujets visibles
  totalPages = 1;
  pages: number[] = [];

  ngOnInit(): void {
    this.categories = this.buildMockCategories();
    this.topics = this.buildMockTopics();
    this.applyFilters();
  }

  /* ================= ACTIONS ================= */

  selectCategory(id: string): void {
    this.selectedCategoryId = id;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    // 1) Filter by category
    let data = [...this.topics];
    if (this.selectedCategoryId !== 'all') {
      data = data.filter((t) => t.categoryId === this.selectedCategoryId);
    }

    // 2) Sort
    data = this.sortTopics(data, this.sort);

    // 3) Pagination
    this.filteredAll = data;
    this.updatePagination(this.filteredAll.length);
    this.pagedTopics = this.slicePage(this.filteredAll);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.currentPage) return;
    this.currentPage = p;
    this.pagedTopics = this.slicePage(this.filteredAll);
  }

  /* ================= HELPERS ================= */

  private updatePagination(totalItems: number): void {
    this.totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.currentPage = Math.min(Math.max(this.currentPage, 1), this.totalPages);
  }

  private slicePage(list: ForumTopic[]): ForumTopic[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  private sortTopics(list: ForumTopic[], mode: SortMode): ForumTopic[] {
    const copy = [...list];

    switch (mode) {
      case 'recent':
        copy.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return copy;

      case 'replies':
        copy.sort((a, b) => b.replies - a.replies);
        return copy;

      case 'popular':
      default:
        copy.sort((a, b) => b.score - a.score);
        return copy;
    }
  }

  /* ================= MOCK DATA ================= */

  private buildMockCategories(): ForumCategory[] {
    return [
      { id: 'anti', name: 'Conseils anti-gaspi', icon: '💡', count: 25 },
      { id: 'recipes', name: 'Recettes', icon: '🥗', count: 18 },
      { id: 'questions', name: 'Questions générales', icon: '💬', count: 34 },
      { id: 'help', name: 'Échanges et entraide', icon: '🤝', count: 12 },
      { id: 'misc', name: 'Divers', icon: '🟢', count: 8 },
    ];
  }

  private buildMockTopics(): ForumTopic[] {
    const now = new Date();
    const daysAgo = (n: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - n);
      return d;
    };

    return [
      {
        id: 1,
        title: 'Comment conserver les légumes plus longtemps ?',
        categoryId: 'anti',
        categoryName: 'Conseils anti-gaspi',
        author: 'marie_b',
        authorAvatar: 'assets/avatars/a1.jpg',
        timeAgo: 'il y a 2 jours',
        replies: 3,
        related: 2,
        lastActivity: 'à l’instant',
        score: 92,
        createdAt: daysAgo(2),
      },
      {
        id: 2,
        title: 'Idées de recettes simples avec des restes',
        categoryId: 'recipes',
        categoryName: 'Recettes',
        author: 'alex92',
        authorAvatar: 'assets/avatars/a2.jpg',
        timeAgo: 'il y a 4 jours',
        replies: 12,
        related: 12,
        lastActivity: 'il y a 5 jours',
        score: 120,
        createdAt: daysAgo(4),
      },
      {
        id: 3,
        title: 'Liste des aliments consommables après la DLC',
        categoryId: 'anti',
        categoryName: 'Conseils anti-gaspi',
        author: 'dav94',
        authorAvatar: 'assets/avatars/a3.jpg',
        timeAgo: 'il y a 1 jour',
        replies: 5,
        related: 3,
        lastActivity: 'il y a 6 jours',
        score: 110,
        createdAt: daysAgo(1),
      },
      {
        id: 4,
        title: 'Où déposer des aliments dans un frigo solidaire à Bordeaux ?',
        categoryId: 'help',
        categoryName: 'Échanges et entraide',
        author: 'luc_33',
        authorAvatar: 'assets/avatars/a4.jpg',
        timeAgo: 'il y a 7 heures',
        replies: 1,
        related: 1,
        lastActivity: 'il y a 1 heure',
        score: 70,
        createdAt: daysAgo(0),
      },
      {
        id: 5,
        title: 'Vos meilleures astuces pour cuisiner les fanes ?',
        categoryId: 'anti',
        categoryName: 'Conseils anti-gaspi',
        author: 'emma',
        authorAvatar: 'assets/avatars/a5.jpg',
        timeAgo: 'il y a 3 jours',
        replies: 8,
        related: 2,
        lastActivity: 'il y a 2 jours',
        score: 88,
        createdAt: daysAgo(3),
      },
      {
        id: 6,
        title: 'Quel plat faire avec des tomates très mûres ?',
        categoryId: 'questions',
        categoryName: 'Questions générales',
        author: 'nico',
        authorAvatar: 'assets/avatars/a6.jpg',
        timeAgo: 'il y a 2 jours',
        replies: 4,
        related: 2,
        lastActivity: 'il y a 1 jour',
        score: 65,
        createdAt: daysAgo(2),
      },
    ];
  }
}
