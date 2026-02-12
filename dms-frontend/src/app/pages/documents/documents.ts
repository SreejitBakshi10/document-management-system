import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, DatePipe } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DocumentService } from '../../services/document';
import { DeleteDialog } from '../../components/delete-dialog/delete-dialog';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    DatePipe,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './documents.html'
})
export class Documents implements OnInit {

  displayedColumns = [
    'title',
    'tags',
    'version',
    'owner',
    'created',
    'download',
    'shared',
    'share',
    'delete'
  ];

  documents: any[] = [];

  search = '';
  tags = '';

  selectedTags: string[] = [];
  allTags: string[] = [];

  loading = false;
  initialized = false;

  shareEmail: { [key: string]: string } = {};
  shareAccess: { [key: string]: string } = {};

  currentUserId = '';

  constructor(
    private documentService: DocumentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.decodeToken();
    this.loadDocuments();
  }

  decodeToken() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = user.id;
  }

  loadDocuments() {
    this.loading = true;

    this.documentService.getDocuments(
      this.search,
      this.selectedTags.join(',')
    )
      .subscribe({
        next: (data) => {
          this.documents = [...(data || [])]; // force new reference
          this.extractTags(data);
          this.loading = false;

          this.cdr.detectChanges(); // 🔥 force refresh
        },
        error: () => {
          this.documents = [];
          this.loading = false;

          this.cdr.detectChanges(); // 🔥 force refresh
          this.snackBar.open('Failed to load documents', 'Close', { duration: 3000 });
        }
      });
  }


  extractTags(docs: any[]) {

    const tagSet = new Set<string>();

    docs.forEach(doc => {
      doc.tags?.forEach((tag: string) => tagSet.add(tag));
    });

    this.allTags = Array.from(tagSet).sort();
  }

  resetFilters() {
    this.search = '';
    this.selectedTags = [];
    this.loadDocuments();
  }

  downloadFile(doc: any) {
    this.documentService.downloadDocument(doc._id)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.title;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.snackBar.open('Download failed', 'Close', { duration: 3000 });
        }
      });
  }

  share(doc: any) {
    const email = this.shareEmail[doc._id];
    const access = this.shareAccess[doc._id];

    if (!email || !access) return;

    this.documentService
      .shareDocument(doc._id, email, access)
      .subscribe({
        next: () => {
          this.shareEmail[doc._id] = '';
          this.shareAccess[doc._id] = '';
          this.snackBar.open('Permission updated', 'Close', { duration: 3000 });
          this.loadDocuments();
        },
        error: () => {
          this.snackBar.open('Permission update failed', 'Close', { duration: 3000 });
        }
      });
  }

  openDeleteDialog(doc: any) {
    const dialogRef = this.dialog.open(DeleteDialog, {
      data: { title: doc.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.documentService.deleteDocument(doc._id)
          .subscribe({
            next: () => {
              this.snackBar.open('Document deleted', 'Close', { duration: 3000 });
              this.loadDocuments();
            },
            error: () => {
              this.snackBar.open('Delete failed', 'Close', { duration: 3000 });
            }
          });
      }
    });
  }

  canEdit(doc: any): boolean {
    if (doc.owner?._id === this.currentUserId) return true;

    return !!doc.permissions?.find(
      (p: any) =>
        p.user?._id === this.currentUserId &&
        p.access === 'edit'
    );
  }

  canShare(doc: any): boolean {
    return this.canEdit(doc);
  }

  canSeeSharingInfo(doc: any): boolean {
    return this.canEdit(doc);
  }

  isOwner(doc: any): boolean {
    return doc.owner?._id === this.currentUserId;
  }
}
