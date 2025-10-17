import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CustomerDisplayConfig {
  title: string;
  sections: DisplaySection[];
}

export interface DisplaySection {
  sectionTitle: string;
  colorClass?: string;
  fields: DisplayField[];
}

export interface DisplayField {
  field: string;
  label: string;
  displayOrder: number;
  format?: 'currency' | 'number' | 'date' | 'text';
  highlight?: boolean;
}

export interface CustomerData {
  id: number;
  tenantId: number;
  customerId: string;
  documentCode: string;
  fullName: string;
  status: string;
  contactInfo?: ContactInfo;
  accountInfo?: AccountInfo;
  debtInfo?: DebtInfo;
}

export interface ContactInfo {
  id: number;
  mobilePhone?: string;
  primaryPhone?: string;
  alternativePhone?: string;
  workPhone?: string;
  email?: string;
  address?: string;
}

export interface AccountInfo {
  id: number;
  accountNumber: string;
  productType: string;
  disbursementDate?: string;
  originalAmount?: number;
  termMonths?: number;
  interestRate?: number;
}

export interface DebtInfo {
  id: number;
  currentDebt?: number;
  capitalBalance?: number;
  overdueInterest?: number;
  accumulatedLateFees?: number;
  collectionFees?: number;
  totalBalance?: number;
  daysOverdue?: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

export interface ImportResponse {
  success: boolean;
  importedCount?: number;
  hasErrors?: boolean;
  errors?: string[];
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerDisplayService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/customers`;

  /**
   * Obtiene los datos de un cliente por su ID
   */
  getCustomerById(customerId: string): Observable<CustomerData> {
    return this.http.get<CustomerData>(`${this.apiUrl}/${customerId}`);
  }

  /**
   * Obtiene los datos de un cliente por su código de documento
   */
  getCustomerByDocumentCode(tenantId: number, documentCode: string): Observable<CustomerData> {
    return this.http.get<CustomerData>(`${this.apiUrl}/by-document`, {
      params: { tenantId: tenantId.toString(), documentCode }
    });
  }

  /**
   * Obtiene la configuración de visualización del tenant
   */
  getDisplayConfig(tenantCode: string): Observable<CustomerDisplayConfig> {
    return this.http.get<CustomerDisplayConfig>(`${this.apiUrl}/display-config/${tenantCode}`);
  }

  /**
   * Importa clientes desde un archivo Excel/CSV
   */
  importCustomers(file: File, tenantId: number, tenantCode: string): Observable<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenantId', tenantId.toString());
    formData.append('tenantCode', tenantCode);

    return this.http.post<ImportResponse>(`${this.apiUrl}/import`, formData);
  }

  /**
   * Formatea un valor según su tipo
   */
  formatValue(value: any, format?: string): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: 'PEN'
        }).format(value);

      case 'number':
        return new Intl.NumberFormat('es-PE').format(value);

      case 'date':
        if (typeof value === 'string') {
          const date = new Date(value);
          return new Intl.DateTimeFormat('es-PE').format(date);
        }
        return value.toString();

      default:
        return value.toString();
    }
  }

  /**
   * Obtiene el valor de un campo anidado usando notación de punto
   */
  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
}
