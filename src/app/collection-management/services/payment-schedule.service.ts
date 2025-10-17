import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaymentScheduleResource {
  scheduleId: string;
  customerId: string;
  managementId: string;
  totalAmount: number;
  numberOfInstallments: number;
  startDate: string;
  isActive: boolean;
  installments: InstallmentResource[];
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

export interface InstallmentStatusHistoryResource {
  id: number;
  installmentId: number;
  managementId: string;
  status: string;
  statusDescription: string;
  changeDate: string;
  actualPaymentDate?: string;
  amountPaid?: number;
  observations?: string;
  registeredBy: string;
}

export interface UpdateInstallmentStatusRequest {
  status: string; // "COMPLETADO", "VENCIDO", "CANCELADO"
  paymentDate?: string;
  amountPaid?: number;
  observations?: string;
  registeredBy: string;
}

export interface CreatePaymentScheduleRequest {
  customerId: string;
  managementId: string;
  scheduleType: string; // "FINANCIERA" o "CONFIANZA"
  negotiatedAmount: number | null;
  installments: InstallmentRequest[];
}

export interface InstallmentRequest {
  installmentNumber: number;
  amount: number;
  dueDate: string; // formato: "YYYY-MM-DD"
}

@Injectable({
  providedIn: 'root'
})
export class PaymentScheduleService {
  private readonly baseUrl = `${environment.apiUrl}/payment-schedules`;

  constructor(private http: HttpClient) {}

  /**
   * Crea un nuevo cronograma de pagos
   */
  createPaymentSchedule(request: CreatePaymentScheduleRequest): Observable<PaymentScheduleResource> {
    return this.http.post<PaymentScheduleResource>(`${environment.apiUrl}/payments/schedules`, request);
  }

  /**
   * Obtiene el cronograma de pagos asociado a una gestión
   */
  getPaymentScheduleByManagementId(managementId: string): Observable<PaymentScheduleResource> {
    return this.http.get<PaymentScheduleResource>(`${this.baseUrl}/management/${managementId}`);
  }

  /**
   * Actualiza el estado de una cuota (crea un nuevo registro en el historial)
   */
  updateInstallmentStatus(
    installmentId: number,
    request: UpdateInstallmentStatusRequest
  ): Observable<InstallmentStatusHistoryResource> {
    return this.http.post<InstallmentStatusHistoryResource>(
      `${this.baseUrl}/installments/${installmentId}/status`,
      request
    );
  }

  /**
   * Obtiene el historial completo de estados de una cuota
   */
  getInstallmentHistory(installmentId: number): Observable<InstallmentStatusHistoryResource[]> {
    return this.http.get<InstallmentStatusHistoryResource[]>(
      `${this.baseUrl}/installments/${installmentId}/history`
    );
  }

  /**
   * Obtiene el último estado de cada cuota de una gestión
   */
  getLatestStatusByManagement(managementId: string): Observable<InstallmentStatusHistoryResource[]> {
    return this.http.get<InstallmentStatusHistoryResource[]>(
      `${this.baseUrl}/management/${managementId}/latest-status`
    );
  }
}
