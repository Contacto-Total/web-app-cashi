// Modelos para configuración de campos dinámicos

export type FieldType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'textarea'
  | 'table'
  | 'auto-number';

export interface SelectOption {
  value: string;
  label: string;
}

export interface TableColumn {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: SelectOption[]; // Para columnas de tipo select
  defaultValue?: any;
}

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

export interface MetadataSchema {
  fields: FieldConfig[];
}

export interface DynamicFieldData {
  [fieldId: string]: any;
}
