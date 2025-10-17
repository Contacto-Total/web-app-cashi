import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interfaz que representa la configuración de outputs guardada en backend
 *
 * MAPEO CON BACKEND:
 * → Entidad: CustomerOutputConfig.java
 * → Tabla BD: customer_output_config
 * → Endpoints:
 *   - POST /api/v1/customer-outputs/config
 *   - GET /api/v1/customer-outputs/config?tenantId=X&portfolioId=Y
 */
export interface CustomerOutputConfigResponse {
  id: number;
  tenantId: number;
  portfolioId?: number;
  fieldsConfig: string;  // JSON serializado
}

/**
 * Request para guardar configuración
 */
export interface SaveCustomerOutputConfigRequest {
  tenantId: number;
  portfolioId?: number;
  fieldsConfig: string;  // JSON serializado
}

/**
 * Servicio para gestionar la configuración de outputs del cliente
 *
 * FLUJO DE USO:
 * 1. Pantalla mantenimiento: saveConfiguration() → Guarda config en BD
 * 2. Pantalla gestión: getConfiguration() → Carga config para mostrar campos
 */
@Injectable({
  providedIn: 'root'
})
export class CustomerOutputConfigService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/customer-outputs`;

  /**
   * Guarda o actualiza configuración de outputs
   *
   * BACKEND:
   * POST /api/v1/customer-outputs/config
   * Controller: CustomerOutputConfigController.saveConfiguration()
   *
   * LÓGICA:
   * - Si existe config para tenant+portfolio → actualiza
   * - Si no existe → crea nueva
   */
  saveConfiguration(request: SaveCustomerOutputConfigRequest): Observable<CustomerOutputConfigResponse> {
    return this.http.post<CustomerOutputConfigResponse>(`${this.apiUrl}/config`, request);
  }

  /**
   * Obtiene configuración de outputs para tenant y portfolio
   *
   * BACKEND:
   * GET /api/v1/customer-outputs/config?tenantId=X&portfolioId=Y
   * Controller: CustomerOutputConfigController.getConfiguration()
   *
   * LÓGICA DE BÚSQUEDA:
   * 1. Si portfolioId != null → busca configuración específica del portfolio
   * 2. Si no encuentra específica → busca configuración general del tenant
   * 3. Si no encuentra ninguna → 404 (usar valores por defecto en frontend)
   */
  getConfiguration(tenantId: number, portfolioId?: number): Observable<CustomerOutputConfigResponse> {
    const params: any = { tenantId };
    if (portfolioId !== undefined && portfolioId !== null) {
      params.portfolioId = portfolioId;
    }

    return this.http.get<CustomerOutputConfigResponse>(`${this.apiUrl}/config`, { params });
  }
}
