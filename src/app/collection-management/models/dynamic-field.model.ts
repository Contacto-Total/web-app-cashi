/**
 * Modelo de campo dinámico para formularios de clasificación
 * Los campos se configuran en el backend por clasificación
 *
 * IMPORTANTE - SINCRONIZACIÓN CON BACKEND:
 * Estos tipos deben coincidir EXACTAMENTE con los typeCode sedeados en:
 * @backend com.cashi.shared.domain.model.entities.FieldTypeCatalog (campo: typeCode)
 * @backend com.cashi.systemconfiguration.infrastructure.persistence.DataSeeder.seedFieldTypes()
 *
 * FORMATO ESTANDARIZADO: lowercase (minúsculas) en frontend y backend
 * Al agregar/modificar tipos, actualizar también:
 * 1. Backend: DataSeeder.seedFieldTypes() - agregar nuevo tipo al seeder
 * 2. Backend: FieldTypeCatalog entity - verificar que la entidad soporte el nuevo tipo
 * 3. Frontend: DynamicFieldRendererComponent - implementar renderizado del tipo
 * 4. Frontend: field-config.model.ts - agregar el tipo si es necesario
 */
export type FieldType =
  | 'text'          // Campo de texto simple
  | 'textarea'      // Área de texto multilínea
  | 'number'        // Campo numérico entero
  | 'decimal'       // Campo numérico con decimales
  | 'date'          // Selector de fecha
  | 'datetime'      // Selector de fecha y hora
  | 'checkbox'      // Casilla de verificación (boolean)
  | 'select'        // Lista desplegable
  | 'multiselect'   // Selección múltiple
  | 'email'         // Dirección de correo
  | 'phone'         // Número telefónico
  | 'url'           // Dirección web
  | 'currency'      // Valor monetario
  | 'json'          // Datos estructurados JSON
  | 'table'         // Tabla dinámica con columnas configurables
  | 'auto-number';  // Autonumérico (solo para columnas de tabla)

export interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  email?: boolean;
  url?: boolean;
  custom?: string; // JSON con validación personalizada
}

export interface ConditionalLogic {
  showIf?: {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value: any;
  };
  requiredIf?: {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value: any;
  };
}

/**
 * Estructura de un campo de clasificación
 *
 * @backend Esta interface mapea con:
 * @backend com.cashi.systemconfiguration.interfaces.rest.controllers.ClassificationManagementController.ClassificationFieldResource
 *
 * El backend parsea el JSON del campo esquema_metadatos de la tabla catalogo_clasificaciones
 * y lo convierte en esta estructura para enviarlo al frontend.
 */
export interface ClassificationField {
  id: number;
  fieldCode: string;
  fieldName: string;
  fieldType: FieldType;
  fieldCategory?: string;
  description?: string;
  defaultValue?: string;
  validationRules?: string; // JSON string
  isRequired: boolean;
  isVisible: boolean;
  displayOrder: number;
  conditionalLogic?: string; // JSON string
  minRows?: number;
  columns?: []
}

export interface ClassificationFieldsResponse {
  classificationId: number;
  isLeaf: boolean; // true si la clasificación es hoja (sin hijos)
  fields: ClassificationField[];
}

/**
 * Valores de campos dinámicos en el formulario
 */
export interface DynamicFieldValues {
  [fieldCode: string]: any;
}

/**
 * Campo de cronograma de pagos
 */
export interface PaymentScheduleItem {
  installmentNumber: number;
  dueDate: string; // ISO date
  amount: number;
  description?: string;
}

export interface PaymentSchedule {
  totalAmount: number;
  numberOfInstallments: number;
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'CUSTOM';
  firstPaymentDate: string; // ISO date
  installments: PaymentScheduleItem[];
}

