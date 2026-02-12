import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  name = '';
  email = '';
  password = '';
  loading = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  register() {

    if (!this.name || !this.email || !this.password) {
      this.snackBar.open('All fields are required', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    this.auth.register({
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Registration successful', 'Close', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Registration failed', 'Close', { duration: 3000 });
      }
    });
  }
}