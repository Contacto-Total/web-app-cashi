import { Injectable } from '@angular/core';
import { SystemConfig } from '../models/system-config.model';
import { ApiSystemConfigService } from './api-system-config.service';

@Injectable({
  providedIn: 'root'
})
export class SystemConfigService {
  constructor(private apiService: ApiSystemConfigService) {}
  private readonly systemConfig: SystemConfig = {
    campana: {
      id: 'CAMP-001',
      nombre: 'Cartera Vencida Q3 2025',
      tipo: 'Cobranza Temprana'
    },
    
    tipificaciones: {
      contacto: [
        { id: 'CPC', codigo: 'CPC', label: 'Contacto con Cliente' },
        { id: 'CTT', codigo: 'CTT', label: 'Contacto con Tercero' },
        { id: 'NCL', codigo: 'NCL', label: 'No Contesta' },
        { id: 'BZN', codigo: 'BZN', label: 'Buzón de Voz' },
        { id: 'OCP', codigo: 'OCP', label: 'Ocupado' },
        { id: 'FTN', codigo: 'FTN', label: 'Fuera de Tono' },
        { id: 'NEQ', codigo: 'NEQ', label: 'Número Equivocado' },
        { id: 'TEL', codigo: 'TEL', label: 'Teléfono Inválido' },
        { id: 'CLG', codigo: 'CLG', label: 'Cliente Colgó' },
        { id: 'RCH', codigo: 'RCH', label: 'Rechazó Llamada' },
      ],
      
      gestion: [
        { id: 'ACP', codigo: 'ACP', label: 'Acepta Compromiso de Pago', requiere_pago: true, requiere_fecha: true },
        { id: 'PGR', codigo: 'PGR', label: 'Pago Realizado - Completo', requiere_pago: true },
        { id: 'PGP', codigo: 'PGP', label: 'Pago Parcial Realizado', requiere_pago: true },
        { id: 'PGT', codigo: 'PGT', label: 'Pago Total de Deuda', requiere_pago: true },
        { id: 'PPR', codigo: 'PPR', label: 'Pago Programado', requiere_pago: true, requiere_fecha: true },
        { id: 'SRP', codigo: 'SRP', label: 'Solicita Refinanciamiento', requiere_seguimiento: true },
        { id: 'SQA', codigo: 'SQA', label: 'Solicita Quita o Descuento', requiere_seguimiento: true },
        { id: 'SCN', codigo: 'SCN', label: 'Solicita Congelamiento', requiere_seguimiento: true },
        { id: 'SPL', codigo: 'SPL', label: 'Solicita Ampliación de Plazo', requiere_seguimiento: true },
        { id: 'DPD', codigo: 'DPD', label: 'Disputa de Deuda', requiere_seguimiento: true },
        { id: 'NRD', codigo: 'NRD', label: 'No Reconoce Deuda', requiere_seguimiento: true },
        { id: 'DIF', codigo: 'DIF', label: 'Dificultad Financiera Temporal', requiere_seguimiento: true },
        { id: 'DSE', codigo: 'DSE', label: 'Desempleo', requiere_seguimiento: true },
        { id: 'ENF', codigo: 'ENF', label: 'Enfermedad/Incapacidad', requiere_seguimiento: true },
        { id: 'FLC', codigo: 'FLC', label: 'Fallecimiento del Titular', requiere_seguimiento: true },
        { id: 'RCL', codigo: 'RCL', label: 'Reclamo Registrado', requiere_seguimiento: true },
        { id: 'FRD', codigo: 'FRD', label: 'Reporte de Fraude', requiere_seguimiento: true },
        { id: 'NCB', codigo: 'NCB', label: 'Sin Capacidad de Pago', requiere_seguimiento: true },
        { id: 'VJE', codigo: 'VJE', label: 'Viaje/Fuera del País', requiere_fecha: true },
        { id: 'SLL', codigo: 'SLL', label: 'Solicita Llamar Después', requiere_fecha: true },
        { id: 'NIN', codigo: 'NIN', label: 'No está Interesado' },
        { id: 'AGR', codigo: 'AGR', label: 'Cliente Agresivo/Hostil' },
        { id: 'NBL', codigo: 'NBL', label: 'No Desea Ser Contactado' },
        { id: 'LGL', codigo: 'LGL', label: 'Amenaza Legal' },
        
        // TIPIFICACIONES PARA CONVENIOS Y CRONOGRAMAS
        { id: 'CNV', codigo: 'CNV', label: 'Acepta Convenio de Pago', requiere_cronograma: true, requiere_fecha: true },
        { id: 'CRO', codigo: 'CRO', label: 'Solicita Cronograma de Pagos', requiere_cronograma: true, requiere_cuotas: true },
        { id: 'CPP', codigo: 'CPP', label: 'Convenio con Pago Parcial Inicial', requiere_cronograma: true, requiere_monto_inicial: true },
        { id: 'CTT', codigo: 'CTT', label: 'Convenio a Plazo Total', requiere_cronograma: true, requiere_periodicidad: true },
        { id: 'CCG', codigo: 'CCG', label: 'Convenio con Congelamiento', requiere_cronograma: true, requiere_fecha: true },
        { id: 'CRF', codigo: 'CRF', label: 'Convenio con Refinanciamiento', requiere_cronograma: true, requiere_seguimiento: true },
        { id: 'CQT', codigo: 'CQT', label: 'Convenio con Quita/Descuento', requiere_cronograma: true, requiere_pago: true },
        { id: 'CAP', codigo: 'CAP', label: 'Convenio Aprobado por Supervisor', requiere_cronograma: true, requiere_autorizacion: true },
        { id: 'CRC', codigo: 'CRC', label: 'Cliente Rechaza Convenio Propuesto', requiere_seguimiento: true },
        { id: 'CEV', codigo: 'CEV', label: 'Convenio en Evaluación', requiere_seguimiento: true, requiere_fecha: true },
      ],
      
      motivo_no_pago: [
        { id: 'FRE', label: 'Falta de Recursos Económicos' },
        { id: 'DSP', label: 'Desempleo Reciente' },
        { id: 'RDS', label: 'Reducción de Salario' },
        { id: 'EMR', label: 'Emergencia Médica' },
        { id: 'GSF', label: 'Gastos Familiares Imprevistos' },
        { id: 'OGS', label: 'Otros Gastos Prioritarios' },
        { id: 'NGC', label: 'Negocio/Comercio en Crisis' },
        { id: 'DCP', label: 'Desconoce el Cargo/Producto' },
        { id: 'IFC', label: 'Inconformidad con Servicio' },
        { id: 'FCC', label: 'Fraude o Cargo no Reconocido' },
        { id: 'OLV', label: 'Olvido de Fecha de Pago' },
        { id: 'PRG', label: 'Problemas con Método de Pago' },
        { id: 'BNK', label: 'Problemas Bancarios' },
        { id: 'OTR', label: 'Otro Motivo' },
      ],
    },
    
    metodos_pago: [
      { id: 'TDC', codigo: 'TDC', label: 'Tarjeta de Crédito', icono: '💳', requiere_ultimos4: true },
      { id: 'TDD', codigo: 'TDD', label: 'Tarjeta de Débito', icono: '💳', requiere_ultimos4: true },
      { id: 'TRF', codigo: 'TRF', label: 'Transferencia Bancaria', icono: '🏦', requiere_banco: true },
      { id: 'DEP', codigo: 'DEP', label: 'Depósito en Cuenta', icono: '🏦', requiere_banco: true },
      { id: 'EFE', codigo: 'EFE', label: 'Efectivo en Agencia', icono: '💵', requiere_agencia: true },
      { id: 'CAU', codigo: 'CAU', label: 'Cargo Automático', icono: '🔄', requiere_autorizacion: true },
      { id: 'YPE', codigo: 'YPE', label: 'Yape', icono: '📱', requiere_telefono: true },
      { id: 'PLN', codigo: 'PLN', label: 'Plin', icono: '📱', requiere_telefono: true },
      { id: 'TNK', codigo: 'TNK', label: 'Tunki', icono: '📱', requiere_telefono: true },
      { id: 'PGW', codigo: 'PGW', label: 'Pasarela Web/Link de Pago', icono: '🌐', requiere_email: true },
    ],
    
    bancos: [
      'BCP - Banco de Crédito del Perú',
      'BBVA',
      'Interbank',
      'Scotiabank',
      'BanBif',
      'Banco Pichincha',
      'Banco Falabella',
      'Banco Ripley',
      'Banco Azteca',
      'Otros',
    ],

    cronograma_config: {
      periodicidades: [
        { id: 'SEM', label: 'Semanal', dias: 7 },
        { id: 'QUI', label: 'Quincenal', dias: 15 },
        { id: 'MEN', label: 'Mensual', dias: 30 },
        { id: 'BIM', label: 'Bimestral', dias: 60 },
        { id: 'TRI', label: 'Trimestral', dias: 90 },
      ],
      
      tipos_cronograma: [
        { id: 'FIJ', label: 'Cuotas Fijas', descripcion: 'Mismo monto cada cuota' },
        { id: 'DEC', label: 'Decreciente', descripcion: 'Cuotas van disminuyendo' },
        { id: 'ESC', label: 'Escalonado', descripcion: 'Cuotas aumentan gradualmente' },
        { id: 'PER', label: 'Personalizado', descripcion: 'Montos específicos por cuota' },
      ],
      
      campos_requeridos: {
        requiere_cronograma: ['numero_cuotas', 'periodicidad', 'fecha_primera_cuota'],
        requiere_cuotas: ['numero_cuotas', 'monto_cuota'],
        requiere_monto_inicial: ['monto_inicial', 'fecha_pago_inicial'],
        requiere_periodicidad: ['periodicidad', 'dia_pago'],
        requiere_autorizacion: ['supervisor_id', 'codigo_autorizacion'],
      },
      
      validaciones: {
        numero_cuotas_max: 48,
        numero_cuotas_min: 2,
        monto_minimo_cuota: 50.00,
        porcentaje_quita_max: 30,
        dias_gracia_max: 90,
      }
    },
  };

  getSystemConfig(): SystemConfig {
    return this.systemConfig;
  }

  getCampaign() {
    // Usar campaña activa del API si está disponible, sino usar fallback estático
    const activeCampaign = this.apiService.getActiveCampaign();
    return activeCampaign || this.systemConfig.campana;
  }

  getContactClassifications() {
    // Primero intentar usar clasificaciones habilitadas del tenant
    const tenantData = this.apiService.tenantClassifications();
    console.log('🔍 DEBUG: tenantData.length =', tenantData.length);

    if (tenantData.length > 0) {
      const contactClassifications = tenantData
        .filter(c => c.classification.classificationType === 'CONTACT_RESULT' && c.isEnabled)
        .map(c => ({
          id: c.classification.id, // Usar ID numérico para comparaciones
          codigo: c.classification.code,
          label: c.customName || c.classification.name
        }));

      console.log('✅ Contact classifications from tenant config:', contactClassifications.length);
      if (contactClassifications.length > 0) {
        return contactClassifications;
      }
    }

    // Si no hay configuraciones de tenant, usar API general o fallback
    const apiData = this.apiService.getContactClassificationsForUI();
    console.log('🔍 DEBUG: apiData.length =', apiData.length);
    console.log('🔍 DEBUG: fallback.length =', this.systemConfig.tipificaciones.contacto.length);

    const result = apiData.length > 0 ? apiData : this.systemConfig.tipificaciones.contacto;
    console.log('✅ Returning contact classifications:', result.length, result);
    return result;
  }

  getManagementClassifications() {
    // Primero intentar usar clasificaciones habilitadas del tenant
    const tenantData = this.apiService.tenantClassifications();
    console.log('🔍 Total tenant classifications:', tenantData.length);

    if (tenantData.length > 0) {
      // Debug: mostrar tipos disponibles
      const types = [...new Set(tenantData.map(c => c.classification.classificationType))];
      console.log('🔍 Available classification types:', types);

      // Mapear TODAS las clasificaciones habilitadas (el backend ya filtró por tenant/portfolio)
      // No filtrar por tipo - el tenant decide qué clasificaciones habilitar
      const managementClassifications = tenantData
        .filter(c => c.isEnabled)
        .map(c => ({
          id: c.classification.id, // Usar ID numérico para comparaciones
          codigo: c.classification.code,
          label: c.customName || c.classification.name,
          requiere_pago: false, // TODO: Agregar esta info al backend o parsear metadataSchema
          requiere_cronograma: false,
          parentId: c.classification.parentClassificationId,
          hierarchyLevel: c.classification.hierarchyLevel
        }));

      console.log('✅ Management classifications from tenant config:', managementClassifications.length);
      console.log('📊 Hierarchy levels found:', [...new Set(managementClassifications.map(c => c.hierarchyLevel))].sort());

      if (managementClassifications.length > 0) {
        return managementClassifications;
      }
    }

    // Si no hay configuraciones de tenant, usar API general
    const apiData = this.apiService.getManagementClassificationsForUI();
    return apiData.length > 0 ? apiData : this.systemConfig.tipificaciones.gestion;
  }

  getPaymentNoReasons() {
    return this.systemConfig.tipificaciones.motivo_no_pago;
  }

  getPaymentMethods() {
    return this.systemConfig.metodos_pago;
  }

  getBanks() {
    return this.systemConfig.bancos;
  }

  getScheduleConfig() {
    return this.systemConfig.cronograma_config;
  }

  getManagementClassificationById(id: string) {
    return this.systemConfig.tipificaciones.gestion.find(g => g.id === id);
  }
}