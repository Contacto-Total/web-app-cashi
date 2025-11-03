import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RolAsignacionRequest {
  tipoAsignacion: 'INQUILINO' | 'CARTERA' | 'SUBCARTERA';
  tenantId: number;
  portfolioId?: number;
  subPortfolioId?: number;
}

export interface RolAsignacionResponse {
  idAsignacion: number;
  tipoAsignacion: string;
  tenantId: number;
  portfolioId?: number;
  subPortfolioId?: number;
}

export interface RolRequest {
  nombreRol: string;
  descripcion?: string;
  activo: boolean;
  permisoIds: number[];
  asignaciones: RolAsignacionRequest[];
}

export interface RolResponse {
  idRol: number;
  nombreRol: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion: string;
  permisoIds: number[];
  asignaciones: RolAsignacionResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/roles';

  obtenerTodos(): Observable<RolResponse[]> {
    return this.http.get<RolResponse[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<RolResponse> {
    return this.http.get<RolResponse>(`${this.apiUrl}/${id}`);
  }

  crear(request: RolRequest): Observable<RolResponse> {
    return this.http.post<RolResponse>(this.apiUrl, request);
  }

  actualizar(id: number, request: RolRequest): Observable<RolResponse> {
    return this.http.put<RolResponse>(`${this.apiUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`);
  }
}
