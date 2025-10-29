import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CustomerStaticData {
  id: number;
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: string;
  age: number;
  gender: string;
  civilStatus: string;
  occupation: string;
  monthlyIncome: number;
  address: string;
  district: string;
  city: string;
  department: string;
  phone: string;
  alternativePhone?: string;
  workPhone?: string;
  email: string;
  alternativeEmail?: string;
  employmentStatus: string;
  companyName?: string;
  companyPhone?: string;
  companyAddress?: string;
  referenceContact1?: string;
  referencePhone1?: string;
  referenceContact2?: string;
  referencePhone2?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerField {
  fieldCode: string;
  fieldName: string;
  value: string | number | null;
  dataType: string;
  category: string;
  icon?: string;
  color?: string;
}

export interface CustomerDetail {
  documento: string;
  campos: CustomerField[];
}

export interface ContactMethodResource {
  id: number;
  contactType: string;
  subtype: string;
  value: string;
  label: string;
  importDate: string | null;
  status: string;
}

export interface CustomerResource {
  id: number;
  customerId: string;
  identificationCode: string;
  accountNumber?: string;
  // Información financiera/deuda
  overdueDays?: number | null;
  overdueAmount?: number | null;
  principalAmount?: number | null;
  documentNumber: string;
  fullName: string;
  documentType: string;
  birthDate: string | null;
  age: number | null;
  // Nombres
  firstName?: string;
  secondName?: string;
  firstLastName?: string;
  secondLastName?: string;
  // Datos personales
  maritalStatus?: string;
  occupation?: string;
  customerType?: string;
  // Ubicación
  address?: string;
  district?: string;
  province?: string;
  department?: string;
  // Referencias
  personalReference?: string;
  // Estado
  status?: string;
  importDate?: string;
  // Métodos de contacto
  contactMethods?: ContactMethodResource[];
  // Información de subcartera
  subPortfolioId?: number;
  subPortfolioName?: string;
  subPortfolioCode?: string;
  portfolioName?: string;
  tenantName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  getAllCustomers(): Observable<CustomerStaticData[]> {
    return this.http.get<CustomerStaticData[]>(this.apiUrl);
  }

  getCustomerById(id: number): Observable<CustomerStaticData> {
    return this.http.get<CustomerStaticData>(`${this.apiUrl}/${id}`);
  }

  getCustomerByDocument(documentNumber: string): Observable<CustomerStaticData> {
    return this.http.get<CustomerStaticData>(`${this.apiUrl}/document/${documentNumber}`);
  }

  searchCustomers(searchTerm: string): Observable<CustomerStaticData[]> {
    return this.http.get<CustomerStaticData[]>(`${this.apiUrl}/search`, {
      params: { q: searchTerm }
    });
  }

  filterCustomers(filters: {
    documentType?: string;
    employmentStatus?: string;
    minAge?: number;
    maxAge?: number;
  }): Observable<CustomerStaticData[]> {
    return this.http.get<CustomerStaticData[]>(`${this.apiUrl}/filter`, {
      params: { ...filters } as any
    });
  }

  createCustomer(customer: Partial<CustomerStaticData>): Observable<CustomerStaticData> {
    return this.http.post<CustomerStaticData>(this.apiUrl, customer);
  }

  updateCustomer(id: number, customer: Partial<CustomerStaticData>): Observable<CustomerStaticData> {
    return this.http.put<CustomerStaticData>(`${this.apiUrl}/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCustomerDetail(document: string, subPortfolioId: number): Observable<CustomerDetail> {
    return this.http.get<CustomerDetail>(`${this.apiUrl}/detail/${document}`, {
      params: { subPortfolioId: subPortfolioId.toString() }
    });
  }

  searchCustomerByCriteria(tenantId: number, searchBy: string, value: string): Observable<CustomerResource> {
    return this.http.get<CustomerResource>(`${this.apiUrl}/search-by`, {
      params: {
        tenantId: tenantId.toString(),
        searchBy: searchBy,
        value: value
      }
    });
  }

  searchCustomersByCriteria(tenantId: number, searchBy: string, value: string): Observable<CustomerResource[]> {
    return this.http.get<CustomerResource[]>(`${this.apiUrl}/search-by-multi`, {
      params: {
        tenantId: tenantId.toString(),
        searchBy: searchBy,
        value: value
      }
    });
  }

  searchCustomersAcrossAllTenants(searchBy: string, value: string): Observable<CustomerResource[]> {
    return this.http.get<CustomerResource[]>(`${this.apiUrl}/search-all-tenants`, {
      params: {
        searchBy: searchBy,
        value: value
      }
    });
  }

  getRecentCustomers(): Observable<{document: string, fullName: string, tenantName: string, portfolioName: string, subPortfolioName: string}[]> {
    return this.http.get<{document: string, fullName: string, tenantName: string, portfolioName: string, subPortfolioName: string}[]>(`${this.apiUrl}/recent`);
  }

  registerCustomerAccess(customerId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${customerId}/access`, {});
  }
}
