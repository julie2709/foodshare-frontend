import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthShellComponent } from '../shared/auth-shell/auth-shell.component';
import { AuthService } from '../core/services/auth.service';
import { RegisterPayload } from '../shared/models/auth.model';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthShellComponent, CommonModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
})
export class RegisterPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  model = {
    pseudo: '',
    email: '',
    password: '',
    confirm: '',
    postalCode: ''
  };

  loading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.model.pseudo.trim() ||
      !this.model.email.trim() ||
      !this.model.password ||
      !this.model.confirm ||
      !this.model.postalCode.trim()
    ) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    if (this.model.password !== this.model.confirm) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    const payload: RegisterPayload = {
      pseudo: this.model.pseudo.trim(),
      email: this.model.email.trim(),
      password: this.model.password,
      postalCode: this.model.postalCode.trim()
    };

    this.loading = true;

    this.authService.register(payload).subscribe({
      next: () => {
        this.successMessage = 'Compte créé avec succès. Vous pouvez maintenant vous connecter.';
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/connexion']);
        }, 1200);
      },
      error: (error) => {
        console.error('Erreur inscription :', error);

        this.errorMessage =
          error?.error?.message ||
          'Impossible de créer le compte. Vérifiez vos informations puis réessayez.';

        this.loading = false;
      }
    });
  }
}