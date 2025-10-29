import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentSchedule } from '../models/payment-schedule.model';

export interface ManagementResource {
  id: number;
  customerId: string;
  advisorId: string;

  // Multi-tenant fields
  tenantId: number;
  tenantName: string;
  portfolioId: number;
  portfolioName: string;
  subPortfolioId?: number;
  subPortfolioName?: string;

  // Contact info
  phone: string;

  // Hierarchical categorization
  level1Id: number;
  level1Name: string;
  level2Id?: number;
  level2Name?: string;
  level3Id?: number;
  level3Name?: string;

  observations?: string;
  typificationRequiresPayment?: boolean;
  typificationRequiresSchedule?: boolean;
}

export interface CallDetailResource {
  phoneNumber: string;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
}

export interface PaymentDetailResource {
  amount: number;
  scheduledDate: string;
  paymentMethodType: string;
  paymentMethodDetails?: string;
  voucherNumber?: string;
  bankName?: string;
}


export interface CreateManagementRequest {
  customerId: string;
  advisorId: string;

  // Multi-tenant fields
  tenantId: number;
  portfolioId: number;
  subPortfolioId?: number | null;

  // Contact info
  phone: string;

  // Hierarchical categorization (3 levels)
  level1Id: number;
  level1Name: string;
  level2Id?: number | null;
  level2Name?: string | null;
  level3Id?: number | null;
  level3Name?: string | null;

  observations?: string;
}

export interface StartCallRequest {
  phoneNumber: string;
  startTime: string;
}

export interface EndCallRequest {
  endTime: string;
}

export interface RegisterPaymentRequest {
  amount: number;
  scheduledDate: string;
  paymentMethodType: string;
  paymentMethodDetails?: string;
  voucherNumber?: string;
  bankName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ManagementService {
  private readonly baseUrl = `${environment.apiUrl}/managements`;
  private readonly scheduleUrl = `${environment.apiUrl}/payment-schedules`;

  constructor(private http: HttpClient) {}

  createManagement(request: CreateManagementRequest): Observable<ManagementResource> {
    return this.http.post<ManagementResource>(this.baseUrl, request);
  }

  getManagementById(managementId: string): Observable<ManagementResource> {
    return this.http.get<ManagementResource>(`${this.baseUrl}/${managementId}`);
  }

  getManagementsByCustomer(customerId: string): Observable<ManagementResource[]> {
    return this.http.get<ManagementResource[]>(`${this.baseUrl}/customer/${customerId}`);
  }

  getManagementsByAdvisor(advisorId: string): Observable<ManagementResource[]> {
    return this.http.get<ManagementResource[]>(`${this.baseUrl}/advisor/${advisorId}`);
  }

  getActiveSchedulesByCustomer(customerId: string): Observable<PaymentSchedule[]> {
    console.log('[SCHEDULE] Fetching active schedules for customer:', customerId);
    return this.http.get<PaymentSchedule[]>(`${this.scheduleUrl}/customer/${customerId}/active`);
  }

  startCall(managementId: number, request: StartCallRequest): Observable<ManagementResource> {
    return this.http.post<ManagementResource>(`${this.baseUrl}/${managementId}/call/start`, request);
  }

  endCall(managementId: number, request: EndCallRequest): Observable<ManagementResource> {
    return this.http.post<ManagementResource>(`${this.baseUrl}/${managementId}/call/end`, request);
  }

  registerPayment(managementId: string, request: RegisterPaymentRequest): Observable<ManagementResource> {
    return this.http.post<ManagementResource>(`${this.baseUrl}/${managementId}/payment`, request);
  }
}
