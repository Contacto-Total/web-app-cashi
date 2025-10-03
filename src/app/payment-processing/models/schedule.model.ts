// Domain Models para Cronogramas de Pago
export interface ScheduleInstallment {
  numero: number;
  fecha: Date;
  monto: number;
  fechaFormateada: string;
  estado?: 'pendiente' | 'pagado' | 'vencido';
  fecha_pago?: Date;
  monto_pagado?: number;
}

export interface PaymentSchedule {
  id?: string;
  cliente_id: string;
  numero_cuotas: number;
  monto_cuota: number;
  periodicidad: string;
  fecha_primera_cuota: Date;
  tipo_cronograma: string;
  monto_inicial?: number;
  cronograma_detalle: ScheduleInstallment[];
  fecha_creacion: Date;
  estado: 'activo' | 'completado' | 'cancelado';
  total_programado: number;
  total_pagado: number;
}

export interface ScheduleFormData {
  numeroCuotas: string;
  montoCuota: string;
  periodicidad: string;
  fechaPrimeraCuota: string;
  tipoCronograma: string;
  montoInicial: string;
}

export interface ScheduleValidationErrors {
  numeroCuotas?: string;
  montoCuota?: string;
  periodicidad?: string;
  fechaPrimeraCuota?: string;
  tipoCronograma?: string;
  montoInicial?: string;
}