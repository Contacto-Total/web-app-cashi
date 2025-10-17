import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ClassificationCatalog,
  TenantClassificationConfig,
  CreateClassificationCommand,
  UpdateClassificationCommand,
  UpdateClassificationConfigCommand,
  ClassificationType
} from '../models/classification.model';
import { Portfolio } from '../models/portfolio.model';
import { Tenant } from '../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class ClassificationService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Catalog Management
  getAllClassifications(): Observable<ClassificationCatalog[]> {
    return this.http.get<ClassificationCatalog[]>(`${this.baseUrl}/classifications`);
  }

  getClassificationsByType(type: ClassificationType): Observable<ClassificationCatalog[]> {
    return this.http.get<ClassificationCatalog[]>(`${this.baseUrl}/classifications/type/${type}`);
  }

  getClassificationsByLevel(level: number): Observable<ClassificationCatalog[]> {
    return this.http.get<ClassificationCatalog[]>(`${this.baseUrl}/classifications/level/${level}`);
  }

  getClassificationsByParent(parentId: number): Observable<ClassificationCatalog[]> {
    return this.http.get<ClassificationCatalog[]>(`${this.baseUrl}/classifications/${parentId}/children`);
  }

  getClassificationById(id: number): Observable<ClassificationCatalog> {
    return this.http.get<ClassificationCatalog>(`${this.baseUrl}/classifications/${id}`);
  }

  createClassification(command: CreateClassificationCommand): Observable<ClassificationCatalog> {
    return this.http.post<ClassificationCatalog>(`${this.baseUrl}/classifications`, command);
  }

  updateClassification(id: number, command: UpdateClassificationCommand): Observable<ClassificationCatalog> {
    return this.http.put<ClassificationCatalog>(`${this.baseUrl}/classifications/${id}`, command);
  }

  deleteClassification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/classifications/${id}`);
  }

  updateDisplayOrder(updates: Array<{id: number, displayOrder: number}>): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/classifications/display-order`, updates);
  }

  // Tenant Configuration Management
  getTenantClassifications(tenantId: number, portfolioId?: number, includeDisabled?: boolean): Observable<TenantClassificationConfig[]> {
    let params = new HttpParams();
    if (portfolioId) {
      params = params.set('portfolioId', portfolioId.toString());
    }
    if (includeDisabled) {
      params = params.set('includeDisabled', 'true');
    }
    return this.http.get<TenantClassificationConfig[]>(
      `${this.baseUrl}/tenants/${tenantId}/classifications`,
      { params }
    );
  }

  getTenantClassificationsByType(
    tenantId: number,
    type: ClassificationType,
    portfolioId?: number
  ): Observable<TenantClassificationConfig[]> {
    let params = new HttpParams();
    if (portfolioId) {
      params = params.set('portfolioId', portfolioId.toString());
    }
    return this.http.get<TenantClassificationConfig[]>(
      `${this.baseUrl}/tenants/${tenantId}/classifications/type/${type}`,
      { params }
    );
  }

  getTenantClassificationsByLevel(
    tenantId: number,
    level: number,
    portfolioId?: number
  ): Observable<TenantClassificationConfig[]> {
    let params = new HttpParams();
    if (portfolioId) {
      params = params.set('portfolioId', portfolioId.toString());
    }
    return this.http.get<TenantClassificationConfig[]>(
      `${this.baseUrl}/tenants/${tenantId}/classifications/level/${level}`,
      { params }
    );
  }

  getEnabledClassifications(
    tenantId: number,
    portfolioId?: number
  ): Observable<TenantClassificationConfig[]> {
    let params = new HttpParams();
    if (portfolioId) {
      params = params.set('portfolioId', portfolioId.toString());
    }
    return this.http.get<TenantClassificationConfig[]>(
      `${this.baseUrl}/tenants/${tenantId}/classifications/enabled`,
      { params }
    );
  }

  updateTenantClassificationConfig(
    tenantId: number,
    classificationId: number,
    command: UpdateClassificationConfigCommand,
    portfolioId?: number
  ): Observable<TenantClassificationConfig> {
    let params = new HttpParams();
    if (portfolioId) {
      params = params.set('portfolioId', portfolioId.toString());
    }
    return this.http.put<TenantClassificationConfig>(
      `${this.baseUrl}/tenants/${tenantId}/classifications/${classificationId}/config`,
      command,
      { params }
    );
  }

  enableClassification(
    tenantId: number,
    classificationId: number,
    portfolioId?: number
  ): Observable<TenantClassificationConfig> {
    let params = new HttpParams();
    if (portfolioId) {
      params = params.set('portfolioId', portfolioId.toString());
    }
    return this.http.post<TenantClassificationConfig>(
      `${this.baseUrl}/tenants/${tenantId}/classifications/${classificationId}/enable`,
      {},
      { params }
    );
  }

  disableClassification(
    tenantId: number,
    classificationId: number,
    portfolioId?: number
  ): Observable<TenantClassificationConfig> {
    let params = new HttpParams();
    if (portfolioId) {
      params = params.set('portfolioId', portfolioId.toString());
    }
    return this.http.post<TenantClassificationConfig>(
      `${this.baseUrl}/tenants/${tenantId}/classifications/${classificationId}/disable`,
      {},
      { params }
    );
  }

  // Tenant Management
  getAllTenants(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(`${this.baseUrl}/system-config/tenants`);
  }

  // Portfolio Management
  getPortfoliosByTenant(tenantId: number): Observable<Portfolio[]> {
    return this.http.get<Portfolio[]>(`${this.baseUrl}/system-config/tenants/${tenantId}/portfolios`);
  }

  createPortfolio(data: {
    tenantId: number;
    portfolioCode: string;
    portfolioName: string;
    portfolioType?: string;
    parentPortfolioId?: number;
    description?: string;
  }): Observable<Portfolio> {
    return this.http.post<Portfolio>(`${this.baseUrl}/system-config/portfolios`, data);
  }

  // Helper method to build tree structure
  buildClassificationTree(classifications: ClassificationCatalog[]): any[] {
    const map = new Map<number, any>();
    const roots: any[] = [];

    // Create nodes
    classifications.forEach(classification => {
      map.set(classification.id, {
        classification,
        children: [],
        level: classification.hierarchyLevel
      });
    });

    // Build tree
    classifications.forEach(classification => {
      const node = map.get(classification.id);
      if (classification.parentClassificationId) {
        const parent = map.get(classification.parentClassificationId);
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
          const orderA = a.classification.displayOrder || 0;
          const orderB = b.classification.displayOrder || 0;
          return orderA - orderB;
        });
        node.children.forEach((child: any) => sortChildren(child));
      }
    };

    roots.forEach(root => sortChildren(root));
    return roots;
  }
}
