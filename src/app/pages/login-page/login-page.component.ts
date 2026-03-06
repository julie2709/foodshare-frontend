import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthShellComponent } from '../../shared/auth-shell/auth-shell.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthShellComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  model = {
    email: '',
    password: '',
    remember: true,
  };

  onSubmit(): void {
    // TODO: brancher ton auth service
    console.log('LOGIN', this.model);
  }

  continueWithGoogle(): void {
    // TODO: OAuth Google
    console.log('GOOGLE LOGIN');
  }
}
