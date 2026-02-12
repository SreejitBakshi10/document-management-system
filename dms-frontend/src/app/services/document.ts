import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private apiUrl = `${environment.apiBaseUrl}/documents`;

  constructor(private http: HttpClient) { }

  getDocuments(search?: string, tags?: string): Observable<any> {
    console.log(this.apiUrl);
    let query = '';

    if (search) {
      query += `search=${search}`;
    }

    if (tags) {
      query += query ? `&tags=${tags}` : `tags=${tags}`;
    }

    const url = query ? `${this.apiUrl}?${query}` : this.apiUrl;

    return this.http.get<any>(url);
  }

  downloadDocument(id: string) {
    return this.http.get(
      `${this.apiUrl}/${id}/download`,
      { responseType: 'blob' }
    );
  }

  shareDocument(id: string, email: string, access: string) {
    return this.http.put(
      `${this.apiUrl}/${id}/share`,
      { email, access }
    );
  }

  uploadDocument(title: string, tags: string, file: File) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('tags', tags);
    formData.append('file', file);

    return this.http.post(
      `${this.apiUrl}/upload`,
      formData
    );
  }

  updateDocument(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.put(
      `${this.apiUrl}/${id}`,
      formData
    );
  }

  deleteDocument(id: string) {
  return this.http.delete(
    `${this.apiUrl}/${id}`
  );
}
}