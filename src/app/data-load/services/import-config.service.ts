import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImportConfig {
  id?: number;
  watchDirectory: string;
  filePattern: string;
  subPortfolioId: number;
  scheduledTime: string; // Hora programada en formato HH:mm:ss (ej: "02:00:00")
  active: boolean;
  processedDirectory: string;
  errorDirectory: string;
  moveAfterProcess: boolean;
  lastCheckAt?: string;
}

export interface ImportHistoryItem {
  id: number;
  fileName: string;
  filePath: string;
  processedAt: string;
  status: 'EXITOSO' | 'EXITOSO_CON_ERRORES' | 'ERROR';
  recordsProcessed: number;
  errorMessage?: string;
}

export interface FilePreview {
  name: string;
  size: string;
  modifiedDate: string;
  processed: boolean;
}

export interface HeaderValidationResult {
  valid: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImportConfigService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/import-config';

  getConfig(): Observable<ImportConfig> {
    return this.http.get<ImportConfig>(this.apiUrl);
  }

  saveConfig(config: Omit<ImportConfig, 'id' | 'lastCheckAt'>): Observable<ImportConfig> {
    return this.http.post<ImportConfig>(this.apiUrl, config);
  }

  getHistory(subPortfolioId?: number): Observable<ImportHistoryItem[]> {
    if (subPortfolioId) {
      return this.http.get<ImportHistoryItem[]>(`${this.apiUrl}/history`, {
        params: { subPortfolioId: subPortfolioId.toString() }
      });
    }
    return this.http.get<ImportHistoryItem[]>(`${this.apiUrl}/history`);
  }

  scanFolder(watchDirectory: string, filePattern: string): Observable<FilePreview[]> {
    return this.http.get<FilePreview[]>(`${this.apiUrl}/scan`, {
      params: { watchDirectory, filePattern }
    });
  }

  toggleMonitoring(active: boolean): Observable<ImportConfig> {
    return this.http.post<ImportConfig>(`${this.apiUrl}/toggle`, null, {
      params: { active: active.toString() }
    });
  }

  validateHeaders(filePath: string, subPortfolioId: number, loadType: string): Observable<HeaderValidationResult> {
    return this.http.post<HeaderValidationResult>(`${this.apiUrl}/validate-headers`, {
      filePath,
      subPortfolioId,
      loadType
    });
  }

  triggerManualImport(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/trigger-import`, {});
  }
}
