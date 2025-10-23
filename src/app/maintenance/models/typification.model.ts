export enum ClassificationType {
  CONTACT_RESULT = 'CONTACT_RESULT',
  MANAGEMENT_TYPE = 'MANAGEMENT_TYPE',
  PAYMENT_TYPE = 'PAYMENT_TYPE',
  COMPLAINT_TYPE = 'COMPLAINT_TYPE',
  PAYMENT_SCHEDULE = 'PAYMENT_SCHEDULE',
  CUSTOM = 'CUSTOM'
}

export interface TypificationCatalog {
  id: number;
  code: string;
  name: string;
  classificationType: ClassificationType;
  parentTypificationId?: number;
  hierarchyLevel: number;
  hierarchyPath: string;
  description?: string;
  displayOrder?: number;
  iconName?: string;
  colorHex?: string;
  isSystem: boolean;
  metadataSchema?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Campos del tipo de clasificación
  suggestsFullAmount?: boolean | null;
  allowsInstallmentSelection?: boolean | null;
  requiresManualAmount?: boolean | null;
}

export interface TenantTypificationConfig {
  id: number;
  tenantId: number;
  portfolioId?: number;
  typificationId: number;
  typification: TypificationCatalog;
  isEnabled: boolean;
  customName?: string;
  customIcon?: string;
  customColor?: string;
  displayOrder?: number;
  requiresComment: boolean;
  minCommentLength?: number;
  maxCommentLength?: number;
  validationRules?: string;
  effectiveName: string;
  effectiveIcon?: string;
  effectiveColor?: string;
}

export interface CreateTypificationCommand {
  code: string;
  name: string;
  classificationType: ClassificationType;
  parentTypificationId?: number;
  description?: string;
  displayOrder?: number;
  iconName?: string;
  colorHex?: string;
  isSystem?: boolean;
  metadataSchema?: string;
}

export interface UpdateTypificationCommand {
  name?: string;
  description?: string;
  displayOrder?: number;
  iconName?: string;
  colorHex?: string;
  isActive?: boolean;
  metadataSchema?: string;
}

export interface UpdateTypificationConfigCommand {
  isEnabled?: boolean;
  customName?: string;
  customIcon?: string;
  customColor?: string;
  displayOrder?: number;
  requiresComment?: boolean;
  minCommentLength?: number;
  maxCommentLength?: number;
  validationRules?: string;
}

export interface TypificationTreeNode {
  typification: TypificationCatalog;
  config?: TenantTypificationConfig;
  children: TypificationTreeNode[];
  level: number;
}
