import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-logout-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './logout-dialog.html'
})
export class LogoutDialog {

  constructor(public dialogRef: MatDialogRef<LogoutDialog>) { }

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}