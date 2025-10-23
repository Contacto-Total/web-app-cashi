import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tenant } from '../models/tenant.model';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = `${environment.apiUrl}/system-config/tenants`;

  constructor(private http: HttpClient) {}

  getAllTenants(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(this.apiUrl);
  }

  getTenantById(tenantId: number): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.apiUrl}/${tenantId}`);
  }

  createTenant(tenant: Partial<Tenant>): Observable<Tenant> {
    return this.http.post<Tenant>(this.apiUrl, tenant);
  }

  updateTenant(tenantId: number, tenant: Partial<Tenant>): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.apiUrl}/${tenantId}`, tenant);
  }

  deleteTenant(tenantId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tenantId}`);
  }
}
