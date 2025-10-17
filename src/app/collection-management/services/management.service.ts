import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentSchedule } from '../models/payment-schedule.model';

export interface ManagementResource {
  id: number;
  managementId: string;
  customerId: string;
  advisorId: string;
  campaignId: string;
  managementDate: string;

  // Clasificación: Categoría/grupo al que pertenece la tipificación
  classificationCode: string;
  classificationDescription: string;

  // Tipificación: Código específico/hoja (último nivel en jerarquía)
  typificationCode: string;
  typificationDescription: string;
  typificationRequiresPayment?: boolean;
  typificationRequiresSchedule?: boolean;

  callDetail?: CallDetailResource;
  paymentDetail?: PaymentDetailResource;
  observations?: string;
  createdAt: string;
  updatedAt: string;
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
  campaignId: string;

  // Clasificación: Categoría/grupo al que pertenece la tipificación
  classificationCode: string;
  classificationDescription: string;

  // Tipificación: Código específico/hoja (último nivel en jerarquía)
  typificationCode: string;
  typificationDescription: string;
  typificationRequiresPayment?: boolean;
  typificationRequiresSchedule?: boolean;
  observations?: string;
  dynamicFields?: { [key: string]: any }; // Campos dinámicos configurados por clasificación
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

  getManagementsByCampaign(campaignId: string): Observable<ManagementResource[]> {
    return this.http.get<ManagementResource[]>(`${this.baseUrl}/campaign/${campaignId}`);
  }

  getActiveSchedulesByCustomer(customerId: string): Observable<PaymentSchedule[]> {
    console.log('[SCHEDULE] Fetching active schedules for customer:', customerId);
    return this.http.get<PaymentSchedule[]>(`${this.scheduleUrl}/customer/${customerId}/active`);
  }

  startCall(managementId: string, request: StartCallRequest): Observable<ManagementResource> {
    return this.http.post<ManagementResource>(`${this.baseUrl}/${managementId}/call/start`, request);
  }

  endCall(managementId: string, request: EndCallRequest): Observable<ManagementResource> {
    return this.http.post<ManagementResource>(`${this.baseUrl}/${managementId}/call/end`, request);
  }

  registerPayment(managementId: string, request: RegisterPaymentRequest): Observable<ManagementResource> {
    return this.http.post<ManagementResource>(`${this.baseUrl}/${managementId}/payment`, request);
  }
}
