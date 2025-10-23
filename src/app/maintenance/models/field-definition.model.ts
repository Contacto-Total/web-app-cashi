export interface FieldDefinition {
  id: number;
  fieldCode: string;
  fieldName: string;
  description?: string;
  dataType: DataType;
  format?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DataType = 'TEXTO' | 'NUMERICO' | 'FECHA';
