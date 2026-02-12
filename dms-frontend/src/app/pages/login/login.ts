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
  selector: 'app-login',
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
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';
  loading = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  login() {

    if (!this.email || !this.password) {
      this.snackBar.open('Email and password required', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    this.auth.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.auth.saveSession(res.token, res.user);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Invalid credentials', 'Close', { duration: 3000 });
      }
    });
  }
}