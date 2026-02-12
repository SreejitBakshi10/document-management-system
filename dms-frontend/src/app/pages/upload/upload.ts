import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DocumentService } from '../../services/document';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './upload.html'
})
export class Upload implements OnInit {

  // Create
  title = '';
  tags = '';
  createFile: File | null = null;
  updateFile: File | null = null;


  // Update
  selectedDocumentId = '';
  editableDocuments: any[] = [];

  loadingEditable = true;
  loading = false;
  currentUserId = '';

  constructor(
    private documentService: DocumentService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.decodeToken();
    this.loadEditableDocuments();
  }

  decodeToken() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = user.id;
  }

  loadEditableDocuments() {

    this.loadingEditable = true;

    this.documentService.getDocuments()
      .subscribe((docs: any[]) => {

        this.editableDocuments = docs.filter(doc => {

          if (doc.owner?._id === this.currentUserId) {
            return true;
          }

          const permission = doc.permissions?.find(
            (p: any) =>
              p.user?._id === this.currentUserId &&
              p.access === 'edit'
          );

          return !!permission;
        });

        this.loadingEditable = false;

        this.cdr.detectChanges(); // 🔥 force refresh
      });
  }


  onCreateFileSelected(event: any) {
    this.createFile = event.target.files[0];
  }

  onUpdateFileSelected(event: any) {
    this.updateFile = event.target.files[0];
  }

  upload() {
    if (!this.createFile || !this.title) {
      this.snackBar.open('Title and file required', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    this.documentService
      .uploadDocument(this.title, this.tags, this.createFile)
      .subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Document uploaded successfully', 'Close', { duration: 3000 });
          this.reset();
          this.loadEditableDocuments();
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Upload failed', 'Close', { duration: 3000 });
        }
      });
  }

  updateVersion() {
    if (!this.updateFile || !this.selectedDocumentId) {
      this.snackBar.open('Select document and file', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    this.documentService
      .updateDocument(this.selectedDocumentId, this.updateFile)
      .subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('New version uploaded successfully', 'Close', { duration: 3000 });
          this.reset();
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Version update failed', 'Close', { duration: 3000 });
        }
      });
  }

  reset() {
    this.title = '';
    this.tags = '';
    this.createFile = null;
    this.updateFile = null;
    this.selectedDocumentId = '';
  }
}