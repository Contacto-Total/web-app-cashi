import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  sizeFormatted: string;
  modifiedTime: string;
  webViewLink: string;
  iconLink: string;
  thumbnailLink: string;
  fileExtension: string;
  fileType: string;
}

export interface ServiceStatus {
  initialized: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/google-drive';

  getStatus(): Observable<ServiceStatus> {
    return this.http.get<ServiceStatus>(`${this.apiUrl}/status`);
  }

  listFiles(): Observable<GoogleDriveFile[]> {
    return this.http.get<GoogleDriveFile[]>(`${this.apiUrl}/files`);
  }

  searchFiles(query: string): Observable<GoogleDriveFile[]> {
    return this.http.get<GoogleDriveFile[]>(`${this.apiUrl}/files/search`, {
      params: { query }
    });
  }

  getFileMetadata(fileId: string): Observable<GoogleDriveFile> {
    return this.http.get<GoogleDriveFile>(`${this.apiUrl}/files/${fileId}`);
  }

  downloadFile(fileId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/files/${fileId}/download`, {
      responseType: 'blob'
    });
  }

  exportFile(fileId: string, mimeType: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/files/${fileId}/export`, {
      params: { mimeType },
      responseType: 'blob'
    });
  }

  getFileIcon(fileType: string): string {
    switch (fileType) {
      case 'folder': return 'folder';
      case 'document': return 'file-text';
      case 'spreadsheet': return 'table';
      case 'presentation': return 'presentation';
      case 'pdf': return 'file-text';
      case 'image': return 'image';
      case 'video': return 'video';
      case 'audio': return 'music';
      case 'archive': return 'archive';
      default: return 'file';
    }
  }
}
