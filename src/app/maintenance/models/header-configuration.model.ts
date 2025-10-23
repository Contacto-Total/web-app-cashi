export interface HeaderConfiguration {
  id: number;
  subPortfolioId: number;
  fieldDefinitionId: number;
  headerName: string;
  dataType: DataType;
  displayLabel: string;
  format?: string;
  required: boolean;
  loadType: LoadType;
  createdAt?: string;
  updatedAt?: string;
}

export type DataType = 'TEXTO' | 'NUMERICO' | 'FECHA';
export type LoadType = 'INICIAL' | 'ACTUALIZACION';

export interface CreateHeaderConfigurationRequest {
  subPortfolioId: number;
  fieldDefinitionId: number;
  headerName: string;
  dataType: DataType;
  displayLabel: string;
  format?: string;
  required?: boolean;
  loadType: LoadType;
}

export interface UpdateHeaderConfigurationRequest {
  dataType?: DataType;
  displayLabel?: string;
  format?: string;
  required?: boolean;
  loadType?: LoadType;
}

export interface BulkCreateHeaderConfigurationRequest {
  subPortfolioId: number;
  loadType: LoadType;
  headers: HeaderConfigurationItem[];
}

export interface HeaderConfigurationItem {
  fieldDefinitionId: number;
  headerName: string;
  dataType: DataType;
  displayLabel: string;
  format?: string;
  required?: boolean;
}
