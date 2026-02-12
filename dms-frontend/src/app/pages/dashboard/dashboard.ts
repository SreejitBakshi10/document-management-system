import { Component, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Required for *ngIf
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider'; // Added for styling
import { BreakpointObserver } from '@angular/cdk/layout';

import { LogoutDialog } from '../../components/logout-dialog/logout-dialog';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  
  // Reference to the sidenav to toggle it programmatically
  @ViewChild(MatSidenav) sidenav!: MatSidenav;

  userName = '';
  isMobile = true; // Default to true to prevent flicker, will update instantly

  constructor(
    private auth: Auth, 
    private dialog: MatDialog,
    private observer: BreakpointObserver
  ) {
    const user = this.auth.getUser();
    this.userName = user?.name || 'User';
  }

  ngAfterViewInit() {
    // Observer for screen width (800px is a common tablet/mobile breakpoint)
    this.observer.observe(['(max-width: 800px)']).subscribe((res) => {
      this.isMobile = res.matches;
      
      // OPTIONAL: If resizing to desktop, ensure it opens. 
      // If resizing to mobile, it will automatically close due to [opened]="!isMobile" in HTML
      if (!this.isMobile) {
        this.sidenav.open();
      } else {
        this.sidenav.close();
      }
    });
  }

  logout() {
    const dialogRef = this.dialog.open(LogoutDialog);
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.auth.logout();
    });
  }
}