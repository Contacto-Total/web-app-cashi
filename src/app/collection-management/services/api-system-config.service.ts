import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap, catchError, of } from 'rxjs';

export interface ContactClassificationResource {
  id: number;
  code: string;
  label: string; // Cambiado de 'description' a 'label' para coincidir con el backend
  isSuccessful: boolean;
}

export interface ManagementClassificationResource {
  id: number;
  code: string;
  label: string;
  requiresPayment: boolean;
  requiresSchedule: boolean;
  requiresFollowUp: boolean;
  parentId?: number;
  hierarchyLevel?: number;
}

export interface CampaignResource {
  id: number;
  campaignId: string;
  name: string;
  campaignType: string;
  isActive: boolean;
}

export interface TenantClassificationConfigResource {
  id: number;
  tenantId: number;
  portfolioId?: number;
  classificationId: number;
  classificationCode: string;
  classificationName: string;
  classificationType: string;
  isEnabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiSystemConfigService {
  private readonly baseUrl = `${environment.apiUrl}/system-config`;
  private readonly classificationsUrl = `${environment.apiUrl}/classifications`;

  // Signals para datos reactivos
  contactClassifications = signal<ContactClassificationResource[]>([]);
  managementClassifications = signal<ManagementClassificationResource[]>([]);
  campaigns = signal<CampaignResource[]>([]);
  tenantClassifications = signal<TenantClassificationConfigResource[]>([]);

  // Estado de carga
  isLoading = signal(false);
  isLoaded = signal(false);

  // Configuración de tenant/portfolio
  private currentTenantId = 1;
  private currentPortfolioId?: number;

  constructor(private http: HttpClient) {
    // Cargar datos inmediatamente al crear el servicio
    this.loadAllData();
  }

  /**
   * Configura el tenant y portfolio actual
   */
  setTenantAndPortfolio(tenantId: number, portfolioId?: number) {
    this.currentTenantId = tenantId;
    this.currentPortfolioId = portfolioId;
    this.loadTenantClassifications();
  }

  /**
   * Carga todos los datos del backend
   * Se ejecuta en segundo plano sin bloquear la UI
   */
  private loadAllData(): void {
    // No mostramos loader porque usamos datos estáticos inicialmente
    this.isLoading.set(true);

    // Cargar en paralelo
    Promise.all([
      this.loadContactClassifications(),
      this.loadManagementClassifications(),
      this.loadActiveCampaigns(),
      this.loadTenantClassifications()
    ]).finally(() => {
      this.isLoading.set(false);
      this.isLoaded.set(true);
    });
  }

  /**
   * Carga clasificaciones habilitadas para el tenant/portfolio actual
   */
  private loadTenantClassifications(): Promise<void> {
    return new Promise((resolve) => {
      let url = `${this.classificationsUrl}/tenants/${this.currentTenantId}/classifications/enabled`;
      if (this.currentPortfolioId) {
        url += `?portfolioId=${this.currentPortfolioId}`;
      }

      this.http.get<TenantClassificationConfigResource[]>(url)
        .pipe(
          tap(data => {
            this.tenantClassifications.set(data);
            console.log('✅ Clasificaciones del tenant cargadas desde API:', data.length);
          }),
          catchError(error => {
            console.warn('⚠️ Error cargando clasificaciones del tenant, usando fallback', error);
            return of([]);
          })
        )
        .subscribe(() => resolve());
    });
  }

  /**
   * Carga tipificaciones de contacto desde el backend
   */
  private loadContactClassifications(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<ContactClassificationResource[]>(`${this.baseUrl}/contact-classifications`)
        .pipe(
          tap(data => {
            this.contactClassifications.set(data);
            console.log('✅ Tipificaciones de contacto cargadas desde API:', data.length);
          }),
          catchError(error => {
            console.warn('⚠️ Error cargando tipificaciones de contacto, usando fallback', error);
            return of([]);
          })
        )
        .subscribe(() => resolve());
    });
  }

  /**
   * Carga tipificaciones de gestión desde el backend
   */
  private loadManagementClassifications(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<ManagementClassificationResource[]>(`${this.baseUrl}/management-classifications`)
        .pipe(
          tap(data => {
            this.managementClassifications.set(data);
            console.log('✅ Tipificaciones de gestión cargadas desde API:', data.length);
          }),
          catchError(error => {
            console.warn('⚠️ Error cargando tipificaciones de gestión, usando fallback', error);
            return of([]);
          })
        )
        .subscribe(() => resolve());
    });
  }

  /**
   * Carga campañas activas desde el backend
   */
  private loadActiveCampaigns(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<CampaignResource[]>(`${this.baseUrl}/campaigns/active`)
        .pipe(
          tap(data => {
            this.campaigns.set(data);
            console.log('✅ Campañas activas cargadas desde API:', data.length);
          }),
          catchError(error => {
            console.warn('⚠️ Error cargando campañas, usando fallback', error);
            return of([]);
          })
        )
        .subscribe(() => resolve());
    });
  }

  /**
   * Fuerza la recarga de todos los datos
   */
  refresh(): void {
    this.loadAllData();
  }

  /**
   * Convierte las tipificaciones de contacto del backend al formato del frontend
   */
  getContactClassificationsForUI() {
    return this.contactClassifications().map(item => ({
      id: item.code,
      codigo: item.code,
      label: item.label, // Ahora coincide con la interfaz
      isSuccessful: item.isSuccessful
    }));
  }

  /**
   * Convierte las tipificaciones de gestión del backend al formato del frontend
   */
  getManagementClassificationsForUI() {
    return this.managementClassifications().map(item => ({
      id: item.code,
      codigo: item.code,
      label: item.label,
      requiere_pago: item.requiresPayment,
      requiere_fecha: item.requiresSchedule,
      requiere_seguimiento: item.requiresFollowUp,
      parentId: item.parentId,
      hierarchyLevel: item.hierarchyLevel
    }));
  }

  /**
   * Obtiene la campaña activa principal
   */
  getActiveCampaign() {
    const campaigns = this.campaigns();
    return campaigns.length > 0 ? {
      id: campaigns[0].campaignId,
      nombre: campaigns[0].name,
      tipo: campaigns[0].campaignType
    } : null;
  }
}
