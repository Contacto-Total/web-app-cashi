import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CustomerResource {
  id: number;
  customerId: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  accountNumber: string;
  birthDate: string;
  age: number;
  contactInfo: ContactInfoResource;
  accountInfo: AccountInfoResource;
  debtInfo: DebtInfoResource;
}

export interface ContactInfoResource {
  primaryPhone: string;
  alternativePhone?: string;
  workPhone?: string;
  email?: string;
  address?: string;
}

export interface AccountInfoResource {
  accountNumber: string;
  productType: string;
  disbursementDate: string;
  originalAmount: number;
  termMonths: number;
  interestRate: number;
}

export interface DebtInfoResource {
  capitalBalance: number;
  overdueInterest: number;
  accumulatedLateFees: number;
  collectionFees: number;
  totalBalance: number;
  daysOverdue: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly baseUrl = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  getAllCustomers(): Observable<CustomerResource[]> {
    return this.http.get<CustomerResource[]>(this.baseUrl);
  }

  getCustomerById(customerId: string): Observable<CustomerResource> {
    return this.http.get<CustomerResource>(`${this.baseUrl}/${customerId}`);
  }

  getCustomerByDocument(documentNumber: string): Observable<CustomerResource> {
    return this.http.get<CustomerResource>(`${this.baseUrl}/document/${documentNumber}`);
  }

  searchCustomers(query: string): Observable<CustomerResource[]> {
    return this.http.get<CustomerResource[]>(`${this.baseUrl}/search`, {
      params: { query }
    });
  }
}
