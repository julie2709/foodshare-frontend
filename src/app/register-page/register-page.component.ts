import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthShellComponent } from '../shared/auth-shell/auth-shell.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthShellComponent],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
})
export class RegisterPageComponent {
  model = {
    name: '',
    email: '',
    password: '',
    confirm: '',
  };

  onSubmit(): void {
    // TODO: validations (password === confirm)
    console.log('REGISTER', this.model);
  }
}
