import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthShellComponent } from '../../shared/auth-shell/auth-shell.component';
import { AuthService } from '../../core/services/auth.service';
import { LoginPayload } from '../../shared/models/auth.model';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthShellComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  model = {
    email: '',
    password: '',
    remember: true,
  };

  loading = false;
  errorMessage = '';

  onSubmit(): void {
    if (!this.model.email || !this.model.password) {
      this.errorMessage = 'Veuillez renseigner votre email et votre mot de passe.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload: LoginPayload = {
      email: this.model.email.trim(),
      password: this.model.password,
    };

    this.authService.login(payload).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        console.error('Erreur de connexion :', error);

        this.errorMessage =
          error?.error?.message ||
          'Connexion impossible. Vérifiez vos identifiants puis réessayez.';

        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  continueWithGoogle(): void {
    console.log('GOOGLE LOGIN');
  }
}