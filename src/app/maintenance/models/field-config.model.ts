/**
 * Modelos para configuración de campos dinámicos
 *
 * IMPORTANTE - SINCRONIZACIÓN CON BACKEND:
 * Estos tipos deben coincidir con los datos sedeados en:
 * @backend com.cashi.shared.domain.model.entities.FieldTypeCatalog
 * @backend com.cashi.systemconfiguration.infrastructure.persistence.DataSeeder.seedFieldTypes()
 *
 * Los valores en minúsculas son el formato estándar del frontend (typeCode del backend).
 * Al agregar/modificar tipos, actualizar también:
 * 1. Backend: DataSeeder.seedFieldTypes() - agregar nuevo tipo al seeder
 * 2. Backend: FieldTypeCatalog entity - verificar que la entidad soporte el nuevo tipo
 * 3. Frontend: DynamicFieldRendererComponent - implementar renderizado del nuevo tipo
 * 4. API: GET /api/v1/field-types - se actualizará automáticamente con el seeder
 */
export type FieldType =
  | 'text'         // Campo de texto simple
  | 'textarea'     // Área de texto multilínea
  | 'number'       // Número entero
  | 'decimal'      // Número con decimales
  | 'currency'     // Valor monetario
  | 'date'         // Selector de fecha
  | 'time'         // Selector de hora
  | 'datetime'     // Selector de fecha y hora
  | 'checkbox'     // Casilla de verificación
  | 'select'       // Lista desplegable
  | 'multiselect'  // Selección múltiple
  | 'email'        // Dirección de correo
  | 'phone'        // Número telefónico
  | 'url'          // Dirección web
  | 'json'         // Datos estructurados JSON
  | 'table'        // Tabla dinámica (solo campo principal)
  | 'auto-number'; // Autonumérico (solo columnas de tabla)

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Definición de columna para campos tipo tabla
 *
 * @backend Esta interface se serializa a JSON y se guarda en el campo
 * @backend esquema_metadatos.fields[].columns de la tabla catalogo_clasificaciones
 */
export interface TableColumn {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: SelectOption[]; // Para columnas de tipo select
  defaultValue?: any;
}

/**
 * Configuración completa de un campo dinámico
 *
 * @backend Esta interface se serializa a JSON y se guarda en el campo
 * @backend esquema_metadatos.fields[] de la tabla catalogo_clasificaciones
 *
 * El backend lee este JSON, lo parsea y lo retorna vía:
 * @backend ClassificationManagementController.getClassificationFields()
 */
export interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;

  // Para campos de texto/número
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;

  // Para select/multiselect
  options?: SelectOption[];

  // Para tabla
  columns?: TableColumn[];
  minRows?: number;
  maxRows?: number;
  allowAddRow?: boolean;
  allowDeleteRow?: boolean;

  // Orden de visualización
  displayOrder?: number;

  // Validaciones personalizadas
  validationRules?: string;
}

/**
 * Esquema completo de metadatos de una clasificación
 *
 * @backend Se serializa a JSON y se guarda en el campo esquema_metadatos
 * @backend de la tabla catalogo_clasificaciones
 */
export interface MetadataSchema {
  fields: FieldConfig[];
}

export interface DynamicFieldData {
  [fieldId: string]: any;
}
