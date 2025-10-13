import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap, catchError, of, Observable } from 'rxjs';
import { ClassificationFieldsResponse } from '../models/dynamic-field.model';

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

export interface ClassificationCatalogResource {
  id: number;
  code: string;
  name: string;
  classificationType: string;
  parentClassificationId?: number;
  hierarchyLevel: number;
  hierarchyPath: string;
  description?: string;
  displayOrder?: number;
  iconName?: string;
  colorHex?: string;
  isSystem: boolean;
  metadataSchema?: string;
  isActive: boolean;
}

export interface TenantClassificationConfigResource {
  id: number;
  tenantId: number;
  portfolioId?: number;
  classification: ClassificationCatalogResource;
  isEnabled: boolean;
  isRequired: boolean;
  customName?: string;
  customOrder?: number;
  customIcon?: string;
  customColor?: string;
  requiresComment: boolean;
  minCommentLength?: number;
  requiresAttachment: boolean;
  requiresFollowupDate: boolean;
  effectiveName: string;
  effectiveOrder?: number;
  effectiveIcon?: string;
  effectiveColor?: string;
}

/**
 * Recurso de tipo de campo
 *
 * @backend Esta interface mapea con:
 * @backend com.cashi.systemconfiguration.interfaces.rest.controllers.FieldTypeController.FieldTypeResource
 *
 * Los datos provienen de la entidad:
 * @backend com.cashi.shared.domain.model.entities.FieldTypeCatalog
 *
 * Y son sedeados automáticamente en:
 * @backend com.cashi.systemconfiguration.infrastructure.persistence.DataSeeder.seedFieldTypes()
 */
export interface FieldTypeResource {
  id: number;
  typeCode: string;        // Código único del tipo (text, number, table, etc.)
  typeName: string;        // Nombre legible (Texto, Número, Tabla, etc.)
  description?: string;    // Descripción del tipo de campo
  icon?: string;           // Nombre del icono de Lucide Angular
  availableForMainField: boolean;    // Disponible para campos principales
  availableForTableColumn: boolean;  // Disponible para columnas de tabla
  displayOrder: number;    // Orden de visualización en el UI
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
  private currentTenantId?: number;
  private currentPortfolioId?: number;

  constructor(private http: HttpClient) {
    // NO cargar datos automáticamente - esperar a que se configure el tenant
    // El componente llamará a setTenantAndPortfolio() cuando tenga el tenant correcto
  }

  /**
   * Configura el tenant y portfolio actual y recarga las clasificaciones
   */
  setTenantAndPortfolio(tenantId: number, portfolioId?: number) {
    console.log(`🔄 Cambiando contexto a tenant ${tenantId}${portfolioId ? ` portfolio ${portfolioId}` : ''}`);

    // IMPORTANTE: Limpiar clasificaciones anteriores ANTES de cambiar el contexto
    this.tenantClassifications.set([]);
    this.contactClassifications.set([]);
    this.managementClassifications.set([]);

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
      // this.loadContactClassifications(),
      // this.loadManagementClassifications(),
      // this.loadActiveCampaigns(),
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
      // Si no hay tenant configurado, no intentar cargar
      if (!this.currentTenantId) {
        console.log('⚠️ No hay tenant configurado, omitiendo carga de clasificaciones');
        resolve();
        return;
      }

      let url = `${environment.apiUrl}/tenants/${this.currentTenantId}/classifications`;
      if (this.currentPortfolioId) {
        url += `?portfolioId=${this.currentPortfolioId}`;
      }

      console.log(`🔄 Cargando clasificaciones para tenant ${this.currentTenantId}${this.currentPortfolioId ? ` y portfolio ${this.currentPortfolioId}` : ''}`);
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

  /**
   * Obtiene los campos dinámicos configurados para una clasificación específica
   * Solo las clasificaciones "hoja" (sin hijos) deberían tener campos
   */
  getClassificationFields(classificationId: number): Observable<ClassificationFieldsResponse> {
    if (!this.currentTenantId) {
      throw new Error('No hay tenant configurado');
    }

    let url = `${environment.apiUrl}/tenants/${this.currentTenantId}/classifications/${classificationId}/fields`;
    if (this.currentPortfolioId) {
      url += `?portfolioId=${this.currentPortfolioId}`;
    }

    console.log(`🔄 Cargando campos dinámicos para clasificación ${classificationId}`);
    return this.http.get<ClassificationFieldsResponse>(url).pipe(
      tap(response => {
        console.log(`✅ Campos dinámicos cargados:`, response);
        console.log(`   - Es hoja: ${response.isLeaf}`);
        console.log(`   - Cantidad de campos: ${response.fields.length}`);
      }),
      catchError(error => {
        console.error('❌ Error cargando campos dinámicos:', error);
        // Retornar respuesta vacía en caso de error
        return of({
          classificationId,
          isLeaf: false,
          fields: []
        } as ClassificationFieldsResponse);
      })
    );
  }

  /**
   * Obtiene todos los tipos de campo disponibles
   */
  getAllFieldTypes(): Observable<FieldTypeResource[]> {
    const url = `${environment.apiUrl}/field-types`;
    console.log('🔄 Cargando tipos de campo disponibles');
    return this.http.get<FieldTypeResource[]>(url).pipe(
      tap(types => console.log(`✅ Tipos de campo cargados:`, types.length)),
      catchError(error => {
        console.error('❌ Error cargando tipos de campo:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene tipos de campo disponibles para campos principales
   */
  getFieldTypesForMainFields(): Observable<FieldTypeResource[]> {
    const url = `${environment.apiUrl}/field-types/main-fields`;
    console.log('🔄 Cargando tipos de campo para campos principales');
    return this.http.get<FieldTypeResource[]>(url).pipe(
      tap(types => console.log(`✅ Tipos para campos principales:`, types.length)),
      catchError(error => {
        console.error('❌ Error cargando tipos para campos principales:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene tipos de campo disponibles para columnas de tabla
   */
  getFieldTypesForTableColumns(): Observable<FieldTypeResource[]> {
    const url = `${environment.apiUrl}/field-types/table-columns`;
    console.log('🔄 Cargando tipos de campo para columnas de tabla');
    return this.http.get<FieldTypeResource[]>(url).pipe(
      tap(types => console.log(`✅ Tipos para columnas de tabla:`, types.length)),
      catchError(error => {
        console.error('❌ Error cargando tipos para columnas de tabla:', error);
        return of([]);
      })
    );
  }
}
