import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PermisoResponse {
  idPermiso: number;
  codigoPermiso: string;
  nombrePermiso: string;
  descripcion: string;
  categoria: string;
  activo: boolean;
  ordenVisualizacion: number;
}

export interface PermisosAgrupadosResponse {
  [categoria: string]: PermisoResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class PermisoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/permisos';

  obtenerTodos(): Observable<PermisoResponse[]> {
    return this.http.get<PermisoResponse[]>(this.apiUrl);
  }

  obtenerAgrupados(): Observable<PermisosAgrupadosResponse> {
    return this.http.get<PermisosAgrupadosResponse>(`${this.apiUrl}/agrupados`);
  }

  obtenerPorCategoria(categoria: string): Observable<PermisoResponse[]> {
    return this.http.get<PermisoResponse[]>(`${this.apiUrl}/categoria/${categoria}`);
  }
}
