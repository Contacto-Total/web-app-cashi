import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FolderInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  hasSubfolders: boolean;
}

export interface PathValidation {
  valid: boolean;
  exists: boolean;
  isDirectory: boolean;
  canRead: boolean;
  canWrite: boolean;
  path: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileSystemService {
  private baseUrl = `${environment.apiUrl}/file-system`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene las unidades de disco disponibles (C:, D:, G:, etc.)
   */
  getDrives(): Observable<FolderInfo[]> {
    return this.http.get<FolderInfo[]>(`${this.baseUrl}/drives`);
  }

  /**
   * Lista las carpetas dentro de una ruta específica
   */
  browseFolders(path: string): Observable<FolderInfo[]> {
    const params = new HttpParams().set('path', path);
    return this.http.get<FolderInfo[]>(`${this.baseUrl}/browse`, { params });
  }

  /**
   * Valida si una ruta existe y es accesible
   */
  validatePath(path: string): Observable<PathValidation> {
    const params = new HttpParams().set('path', path);
    return this.http.get<PathValidation>(`${this.baseUrl}/validate`, { params });
  }
}
