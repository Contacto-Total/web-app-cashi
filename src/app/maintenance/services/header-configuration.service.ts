import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  HeaderConfiguration,
  CreateHeaderConfigurationRequest,
  UpdateHeaderConfigurationRequest,
  BulkCreateHeaderConfigurationRequest,
  LoadType
} from '../models/header-configuration.model';

@Injectable({
  providedIn: 'root'
})
export class HeaderConfigurationService {
  private baseUrl = `${environment.apiUrl}/system-config/header-configurations`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las configuraciones de cabeceras de una subcartera
   */
  getBySubPortfolio(subPortfolioId: number): Observable<HeaderConfiguration[]> {
    return this.http.get<HeaderConfiguration[]>(`${this.baseUrl}/subportfolio/${subPortfolioId}`);
  }

  /**
   * Obtiene todas las configuraciones de cabeceras de una subcartera filtradas por tipo de carga
   */
  getBySubPortfolioAndLoadType(subPortfolioId: number, loadType: LoadType): Observable<HeaderConfiguration[]> {
    return this.http.get<HeaderConfiguration[]>(`${this.baseUrl}/subportfolio/${subPortfolioId}/load-type/${loadType}`);
  }

  /**
   * Obtiene una configuración específica por ID
   */
  getById(id: number): Observable<HeaderConfiguration> {
    return this.http.get<HeaderConfiguration>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea una nueva configuración de cabecera
   */
  create(request: CreateHeaderConfigurationRequest): Observable<HeaderConfiguration> {
    return this.http.post<HeaderConfiguration>(this.baseUrl, request);
  }

  /**
   * Crea múltiples configuraciones en lote (para importar CSV)
   */
  createBulk(request: BulkCreateHeaderConfigurationRequest): Observable<HeaderConfiguration[]> {
    return this.http.post<HeaderConfiguration[]>(`${this.baseUrl}/bulk`, request);
  }

  /**
   * Actualiza una configuración existente
   */
  update(id: number, request: UpdateHeaderConfigurationRequest): Observable<HeaderConfiguration> {
    return this.http.put<HeaderConfiguration>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * Elimina una configuración
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Elimina todas las configuraciones de una subcartera y tipo de carga específicos
   */
  deleteAllBySubPortfolioAndLoadType(subPortfolioId: number, loadType: LoadType): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/subportfolio/${subPortfolioId}/load-type/${loadType}`);
  }

  /**
   * Cuenta cuántas configuraciones tiene una subcartera
   */
  countBySubPortfolio(subPortfolioId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/subportfolio/${subPortfolioId}/count`);
  }

  /**
   * Importa datos masivos a la tabla dinámica de una subcartera
   */
  importData(subPortfolioId: number, loadType: LoadType, data: any[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/subportfolio/${subPortfolioId}/import-data`, {
      subPortfolioId,
      loadType,
      data
    });
  }
}
