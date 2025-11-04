import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  TypificationCatalog,
  TenantTypificationConfig,
  CreateTypificationCommand,
  UpdateTypificationCommand,
  UpdateTypificationConfigCommand,
  ClassificationType
} from '../models/typification.model';
import { Portfolio } from '../models/portfolio.model';
import { Tenant } from '../models/tenant.model';

export interface CsvMappingResource {
  id: number;
  csvColumnName: string;
  targetField: string;
  dataType: string;
  columnOrder: number;
}

@Injectable({
  providedIn: 'root'
})
export class TypificationService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Catalog Management
  getAllClassifications(): Observable<TypificationCatalog[]> {
    return this.http.get<TypificationCatalog[]>(`${this.baseUrl}/typifications`);
  }

  getTypificationsByType(type: ClassificationType): Observable<TypificationCatalog[]> {
    return this.http.get<TypificationCatalog[]>(`${this.baseUrl}/typifications/type/${type}`);
  }

  getTypificationsByLevel(level: number): Observable<TypificationCatalog[]> {
    return this.http.get<TypificationCatalog[]>(`${this.baseUrl}/typifications/level/${level}`);
  }

  getTypificationsByParent(parentId: number): Observable<TypificationCatalog[]> {
    return this.http.get<TypificationCatalog[]>(`${this.baseUrl}/typifications/${parentId}/children`);
  }

  getClassificationById(id: number): Observable<TypificationCatalog> {
    return this.http.get<TypificationCatalog>(`${this.baseUrl}/typifications/${id}`);
  }

  createTypification(command: CreateTypificationCommand): Observable<TypificationCatalog> {
    return this.http.post<TypificationCatalog>(`${this.baseUrl}/typifications`, command);
  }

  updateTypification(id: number, command: UpdateTypificationCommand): Observable<TypificationCatalog> {
    return this.http.put<TypificationCatalog>(`${this.baseUrl}/typifications/${id}`, command);
  }

  deleteTypification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/typifications/${id}`);
  }

  updateDisplayOrder(updates: Array<{id: number, displayOrder: number}>): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/typifications/display-order`, updates);
  }

  // Tenant Configuration Management
  getTenantClassifications(tenantId: number, portfolioId?: number, includeDisabled?: boolean): Observable<TenantTypificationConfig[]> {
    let params = new HttpParams();
    if (portfolioId) {
      params = params.set('portfolioId', portfolioId.toString());
    }
    if (includeDisabled) {
      params = params.set('includeDisabled', 'true');
    }
    return this.http.get<TenantTypificationConfig[]>(
      `${this.baseUrl}/tenants/${tenantId}/typifications`,
      { params }
    );
  }

  getTenantClassificationsByType(
    tenantId: number,
    type: ClassificationType,
    portfolioId?: number
  ): Observable<TenantTypificationConfig[]> {
    let params = new HttpParams();
    if (portfolioId) {
      params = params.set('portfolioId', portfolioId.toString());
    }
    return this.http.get<TenantTypificationConfig[]>(
      `${this.baseUrl}/tenants/${tenantId}/typifications/type/${type}`,
      { params }
    );
  }

  getTenantClassificationsByLevel(
    tenantId: number,
    level: number,
    portfolioId?: number
  ): Observable<TenantTypificationConfig[]> {
    let params = new HttpParams();
    if (portfolioId) {
      params = params.set('portfolioId', portfolioId.toString());
    }
    return this.http.get<TenantTypificationConfig[]>(
      `${this.baseUrl}/tenants/${tenantId}/typifications/level/${level}`,
      { params }
    );
  }

  getEnabledClassifications(
    tenantId: number,
    portfolioId?: number
  ): Observable<TenantTypificationConfig[]> {
    let params = new HttpParams();
    if (portfolioId) {
      params = params.set('portfolioId', portfolioId.toString());
    }
    return this.http.get<TenantTypificationConfig[]>(
      `${this.baseUrl}/tenants/${tenantId}/typifications/enabled`,
      { params }
    );
  }

  updateTenantTypificationConfig(
    tenantId: number,
    typificationId: number,
    command: UpdateTypificationConfigCommand,
    portfolioId?: number
  ): Observable<TenantTypificationConfig> {
    let params = new HttpParams();
    if (portfolioId) {
      params = params.set('portfolioId', portfolioId.toString());
    }
    return this.http.put<TenantTypificationConfig>(
      `${this.baseUrl}/tenants/${tenantId}/typifications/${typificationId}/config`,
      command,
      { params }
    );
  }

  enableClassification(
    tenantId: number,
    typificationId: number,
    portfolioId?: number
  ): Observable<TenantTypificationConfig> {
    let params = new HttpParams();
    if (portfolioId) {
      params = params.set('portfolioId', portfolioId.toString());
    }
    return this.http.post<TenantTypificationConfig>(
      `${this.baseUrl}/tenants/${tenantId}/typifications/${typificationId}/enable`,
      {},
      { params }
    );
  }

  disableClassification(
    tenantId: number,
    typificationId: number,
    portfolioId?: number
  ): Observable<TenantTypificationConfig> {
    let params = new HttpParams();
    if (portfolioId) {
      params = params.set('portfolioId', portfolioId.toString());
    }
    return this.http.post<TenantTypificationConfig>(
      `${this.baseUrl}/tenants/${tenantId}/typifications/${typificationId}/disable`,
      {},
      { params }
    );
  }

  // Tenant Management
  getAllTenants(): Observable<Tenant[]> {
    return this.http.get<any[]>(`${this.baseUrl}/system-config/tenants`).pipe(
      map(tenants => tenants.map(t => ({
        ...t,
        isActive: t.isActive === 1 || t.isActive === true
      })))
    );
  }

  createTenant(data: {
    tenantCode: string;
    tenantName: string;
    businessName?: string;
    taxId?: string;
    countryCode?: string;
    timezone?: string;
    maxUsers?: number;
    maxConcurrentSessions?: number;
    subscriptionTier?: string;
  }): Observable<Tenant> {
    return this.http.post<any>(`${this.baseUrl}/system-config/tenants`, data).pipe(
      map(t => ({
        ...t,
        isActive: t.isActive === 1 || t.isActive === true
      }))
    );
  }

  updateTenant(tenantId: number, data: {
    tenantName?: string;
    businessName?: string;
    taxId?: string;
    countryCode?: string;
    timezone?: string;
    maxUsers?: number;
    maxConcurrentSessions?: number;
    subscriptionTier?: string;
    isActive?: boolean;
  }): Observable<Tenant> {
    // Transform isActive boolean to Integer for backend
    const payload = {
      ...data,
      isActive: data.isActive !== undefined ? (data.isActive ? 1 : 0) : undefined
    };
    return this.http.put<any>(`${this.baseUrl}/system-config/tenants/${tenantId}`, payload).pipe(
      map(t => ({
        ...t,
        isActive: t.isActive === 1 || t.isActive === true
      }))
    );
  }

  deleteTenant(tenantId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/system-config/tenants/${tenantId}`);
  }

  // Portfolio Management
  getPortfoliosByTenant(tenantId: number): Observable<Portfolio[]> {
    return this.http.get<Portfolio[]>(`${this.baseUrl}/system-config/tenants/${tenantId}/portfolios`);
  }

  createPortfolio(data: {
    tenantId: number;
    portfolioCode: string;
    portfolioName: string;
    parentPortfolioId?: number;
    description?: string;
  }): Observable<Portfolio> {
    return this.http.post<Portfolio>(`${this.baseUrl}/system-config/portfolios`, data);
  }

  updatePortfolio(portfolioId: number, data: {
    portfolioName?: string;
    description?: string;
    isActive?: boolean;
  }): Observable<Portfolio> {
    return this.http.put<Portfolio>(`${this.baseUrl}/system-config/portfolios/${portfolioId}`, data);
  }

  deletePortfolio(portfolioId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/system-config/portfolios/${portfolioId}`);
  }

  // SubPortfolio Management
  getSubPortfoliosByPortfolio(portfolioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/system-config/portfolios/${portfolioId}/subportfolios`);
  }

  // CSV Column Mapping Management
  saveCsvMappings(portfolioId: number, csvHeaders: string[]): Observable<CsvMappingResource[]> {
    return this.http.post<CsvMappingResource[]>(
      `${this.baseUrl}/portfolios/${portfolioId}/csv-mappings`,
      { csvHeaders }
    );
  }

  getCsvMappings(portfolioId: number): Observable<CsvMappingResource[]> {
    return this.http.get<CsvMappingResource[]>(
      `${this.baseUrl}/portfolios/${portfolioId}/csv-mappings`
    );
  }

  deleteCsvMappings(portfolioId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/portfolios/${portfolioId}/csv-mappings`
    );
  }

  // Helper method to build tree structure
  buildClassificationTree(typifications: TypificationCatalog[]): any[] {
    const map = new Map<number, any>();
    const roots: any[] = [];

    // Create nodes
    typifications.forEach(typification => {
      map.set(typification.id, {
        typification,
        children: [],
        level: typification.hierarchyLevel
      });
    });

    // Build tree
    typifications.forEach(typification => {
      const node = map.get(typification.id);
      if (typification.parentTypificationId) {
        const parent = map.get(typification.parentTypificationId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    // Sort children by displayOrder
    const sortChildren = (node: any) => {
      if (node.children.length > 0) {
        node.children.sort((a: any, b: any) => {
          const orderA = a.typification.displayOrder || 0;
          const orderB = b.typification.displayOrder || 0;
          return orderA - orderB;
        });
        node.children.forEach((child: any) => sortChildren(child));
      }
    };

    roots.forEach(root => sortChildren(root));
    return roots;
  }
}
