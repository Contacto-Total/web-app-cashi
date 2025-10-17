export interface PaymentStatus {
  status: string;
  description: string;
}

export interface Installment {
  id: number;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: PaymentStatus;
}

export interface PaymentSchedule {
  id: number;
  scheduleId: {
    scheduleId: string;
  };
  customerId: string;
  managementId: string;
  totalAmount: number;
  numberOfInstallments: number;
  startDate: string;
  isActive: boolean;
  scheduleType: string; // "FINANCIERA" o "CONFIANZA"
  negotiatedAmount: number | null;
  installments: Installment[];
  // Computed properties from backend
  paidAmount?: number;
  pendingAmount?: number;
  paidInstallments?: number;
  pendingInstallments?: number;
  fullyPaid?: boolean;
}
