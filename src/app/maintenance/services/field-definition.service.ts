import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FieldDefinition } from '../models/field-definition.model';

@Injectable({
  providedIn: 'root'
})
export class FieldDefinitionService {
  private baseUrl = `${environment.apiUrl}/system-config/field-definitions`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las definiciones de campos activas
   */
  getAllActive(): Observable<FieldDefinition[]> {
    return this.http.get<FieldDefinition[]>(this.baseUrl);
  }

  /**
   * Obtiene definiciones de campos por categoría
   */
  getByCategory(category: string): Observable<FieldDefinition[]> {
    return this.http.get<FieldDefinition[]>(`${this.baseUrl}/category/${category}`);
  }

  /**
   * Obtiene definiciones de campos por tipo de dato
   */
  getByDataType(dataType: string): Observable<FieldDefinition[]> {
    return this.http.get<FieldDefinition[]>(`${this.baseUrl}/data-type/${dataType}`);
  }

  /**
   * Obtiene una definición de campo por ID
   */
  getById(id: number): Observable<FieldDefinition> {
    return this.http.get<FieldDefinition>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene una definición de campo por código
   */
  getByFieldCode(fieldCode: string): Observable<FieldDefinition> {
    return this.http.get<FieldDefinition>(`${this.baseUrl}/code/${fieldCode}`);
  }

  /**
   * Cuenta el total de campos activos
   */
  countActiveFields(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }
}
