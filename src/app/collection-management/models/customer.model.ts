// Domain Models para Cliente
export interface CustomerContact {
  telefono_principal: string;
  telefono_alternativo?: string;
  telefono_trabajo?: string;
  email: string;
  direccion: string;
}

export interface CustomerAccount {
  numero_cuenta: string;
  tipo_producto: string;
  fecha_desembolso: string;
  monto_original: number;
  plazo_meses: number;
  tasa_interes: number;
}

export interface CustomerDebt {
  saldo_capital: number;
  intereses_vencidos: number;
  mora_acumulada: number;
  gastos_cobranza: number;
  saldo_total: number;
  dias_mora: number;
  fecha_ultimo_pago: string;
  monto_ultimo_pago: number;
}

export interface CustomerData {
  id_cliente: string;
  nombre_completo: string;
  tipo_documento: string;
  numero_documento: string;
  fecha_nacimiento: string;
  edad: number;
  contacto: CustomerContact;
  cuenta: CustomerAccount;
  deuda: CustomerDebt;
}

export interface CallHistory {
  fecha: string;
  hora: string;
  duracion: string;
  resultado: string;
  tipificacion: string;
  observaciones: string;
  agente: string;
}

export interface PaymentHistory {
  fecha: string;
  monto: number;
  metodo: string;
  estado: string;
  referencia: string;
}