import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaymentResource {
  id: number;
  paymentId: string;
  customerId: string;
  managementId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  statusDescription: string;
  transactionId?: string;
  voucherNumber?: string;
  bankName?: string;
  confirmedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentScheduleResource {
  id: number;
  scheduleId: string;
  customerId: string;
  managementId: string;
  totalAmount: number;
  numberOfInstallments: number;
  startDate: string;
  isActive: boolean;
  paidAmount: number;
  pendingAmount: number;
  paidInstallments: number;
  pendingInstallments: number;
  installments: InstallmentResource[];
  createdAt: string;
  updatedAt: string;
}

export interface InstallmentResource {
  id: number;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  statusDescription: string;
}

export interface CreatePaymentRequest {
  customerId: string;
  managementId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  voucherNumber?: string;
  bankName?: string;
  notes?: string;
}

export interface CreatePaymentScheduleRequest {
  customerId: string;
  managementId: string;
  totalAmount: number;
  numberOfInstallments: number;
  startDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly baseUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  createPayment(request: CreatePaymentRequest): Observable<PaymentResource> {
    return this.http.post<PaymentResource>(this.baseUrl, request);
  }

  getPaymentById(paymentId: string): Observable<PaymentResource> {
    return this.http.get<PaymentResource>(`${this.baseUrl}/${paymentId}`);
  }

  getPaymentsByCustomer(customerId: string): Observable<PaymentResource[]> {
    return this.http.get<PaymentResource[]>(`${this.baseUrl}/customer/${customerId}`);
  }

  getPendingPayments(customerId: string): Observable<PaymentResource[]> {
    return this.http.get<PaymentResource[]>(`${this.baseUrl}/customer/${customerId}/pending`);
  }

  confirmPayment(paymentId: string, transactionId: string): Observable<PaymentResource> {
    return this.http.post<PaymentResource>(`${this.baseUrl}/${paymentId}/confirm`, { transactionId });
  }

  cancelPayment(paymentId: string): Observable<PaymentResource> {
    return this.http.post<PaymentResource>(`${this.baseUrl}/${paymentId}/cancel`, {});
  }

  // Payment Schedules
  createPaymentSchedule(request: CreatePaymentScheduleRequest): Observable<PaymentScheduleResource> {
    return this.http.post<PaymentScheduleResource>(`${this.baseUrl}/schedules`, request);
  }

  getPaymentScheduleById(scheduleId: string): Observable<PaymentScheduleResource> {
    return this.http.get<PaymentScheduleResource>(`${this.baseUrl}/schedules/${scheduleId}`);
  }

  getPaymentSchedulesByCustomer(customerId: string): Observable<PaymentScheduleResource[]> {
    return this.http.get<PaymentScheduleResource[]>(`${this.baseUrl}/schedules/customer/${customerId}`);
  }

  recordInstallmentPayment(scheduleId: string, installmentNumber: number, paidDate: string): Observable<PaymentScheduleResource> {
    return this.http.post<PaymentScheduleResource>(`${this.baseUrl}/schedules/${scheduleId}/installments`, {
      installmentNumber,
      paidDate
    });
  }

  cancelPaymentSchedule(scheduleId: string): Observable<PaymentScheduleResource> {
    return this.http.post<PaymentScheduleResource>(`${this.baseUrl}/schedules/${scheduleId}/cancel`, {});
  }
}
