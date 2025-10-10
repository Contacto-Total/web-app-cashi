// Domain Models para Gestión de Cobranza
export interface ManagementForm {
  resultadoContacto: string;
  tipoGestion: string;
  // Campos para compatibilidad con sistema jerárquico (legacy)
  clasificacionNivel1?: string;
  clasificacionNivel2?: string;
  clasificacionNivel3?: string;
  motivoNoPago: string;
  metodoPago: string;
  montoPago: string;
  fechaCompromiso: string;
  horaCompromiso: string;
  ultimos4Tarjeta: string;
  bancoSeleccionado: string;
  observaciones: string;
  notasPrivadas: string;
}

export interface CallSession {
  id?: string;
  cliente_id: string;
  agente_id: string;
  fecha_inicio: Date;
  fecha_fin?: Date;
  duracion_segundos: number;
  estado: 'activa' | 'finalizada';
}

export interface ManagementRecord {
  id?: string;
  cliente_id: string;
  agente_id: string;
  fecha: Date;
  resultado_contacto: string;
  tipo_gestion?: string;
  motivo_no_pago?: string;
  monto_compromiso?: number;
  fecha_compromiso?: Date;
  metodo_pago?: string;
  observaciones: string;
  notas_privadas?: string;
  duracion_llamada: number;
  campana_id: string;
}

export interface ValidationErrors {
  resultadoContacto?: string;
  tipoGestion?: string;
  metodoPago?: string;
  montoPago?: string;
  fechaCompromiso?: string;
  motivoNoPago?: string;
  [key: string]: string | undefined;
}