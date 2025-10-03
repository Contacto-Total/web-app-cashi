// Domain Models para el Sistema de Cobranza
export interface Campaign {
  id: string;
  nombre: string;
  tipo: string;
}

export interface ContactClassification {
  id: string;
  codigo: string;
  label: string;
}

export interface ManagementClassification {
  id: string;
  codigo: string;
  label: string;
  requiere_pago?: boolean;
  requiere_fecha?: boolean;
  requiere_cronograma?: boolean;
  requiere_cuotas?: boolean;
  requiere_monto_inicial?: boolean;
  requiere_periodicidad?: boolean;
  requiere_autorizacion?: boolean;
  requiere_seguimiento?: boolean;
}

export interface PaymentNoReason {
  id: string;
  label: string;
}

export interface Typifications {
  contacto: ContactClassification[];
  gestion: ManagementClassification[];
  motivo_no_pago: PaymentNoReason[];
}

export interface PaymentMethod {
  id: string;
  codigo: string;
  label: string;
  icono: string;
  requiere_ultimos4?: boolean;
  requiere_banco?: boolean;
  requiere_agencia?: boolean;
  requiere_autorizacion?: boolean;
  requiere_telefono?: boolean;
  requiere_email?: boolean;
}

export interface Periodicity {
  id: string;
  label: string;
  dias: number;
}

export interface ScheduleType {
  id: string;
  label: string;
  descripcion: string;
}

export interface ScheduleValidations {
  numero_cuotas_max: number;
  numero_cuotas_min: number;
  monto_minimo_cuota: number;
  porcentaje_quita_max: number;
  dias_gracia_max: number;
}

export interface ScheduleRequiredFields {
  requiere_cronograma: string[];
  requiere_cuotas: string[];
  requiere_monto_inicial: string[];
  requiere_periodicidad: string[];
  requiere_autorizacion: string[];
}

export interface ScheduleConfig {
  periodicidades: Periodicity[];
  tipos_cronograma: ScheduleType[];
  campos_requeridos: ScheduleRequiredFields;
  validaciones: ScheduleValidations;
}

export interface SystemConfig {
  campana: Campaign;
  tipificaciones: Typifications;
  metodos_pago: PaymentMethod[];
  bancos: string[];
  cronograma_config: ScheduleConfig;
}