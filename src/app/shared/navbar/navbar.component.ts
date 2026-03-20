import { Component, HostListener, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NgIf, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser$ = this.authService.currentUser$;
  isAuthenticated$ = this.authService.isAuthenticated$;

  isDropdownOpen = false;

  toggleDropdown(event?: Event): void {
    event?.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  onLogout(): void {
    this.authService.logout();
    this.closeDropdown();
    this.router.navigate(['/']);
  }

  isAdmin(user: { roles?: string[] } | null): boolean {
    return !!user?.roles?.includes('ROLE_ADMIN');
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeDropdown();
  }
}