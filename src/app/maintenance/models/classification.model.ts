export enum ClassificationType {
  CONTACT_RESULT = 'CONTACT_RESULT',
  MANAGEMENT_TYPE = 'MANAGEMENT_TYPE',
  PAYMENT_TYPE = 'PAYMENT_TYPE',
  COMPLAINT_TYPE = 'COMPLAINT_TYPE',
  CUSTOM = 'CUSTOM'
}

export interface ClassificationCatalog {
  id: number;
  code: string;
  name: string;
  classificationType: ClassificationType;
  parentClassificationId?: number;
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
}

export interface TenantClassificationConfig {
  id: number;
  tenantId: number;
  portfolioId?: number;
  classificationId: number;
  classification: ClassificationCatalog;
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

export interface CreateClassificationCommand {
  code: string;
  name: string;
  classificationType: ClassificationType;
  parentClassificationId?: number;
  description?: string;
  displayOrder?: number;
  iconName?: string;
  colorHex?: string;
  isSystem?: boolean;
  metadataSchema?: string;
}

export interface UpdateClassificationCommand {
  name?: string;
  description?: string;
  displayOrder?: number;
  iconName?: string;
  colorHex?: string;
  isActive?: boolean;
  metadataSchema?: string;
}

export interface UpdateClassificationConfigCommand {
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

export interface ClassificationTreeNode {
  classification: ClassificationCatalog;
  config?: TenantClassificationConfig;
  children: ClassificationTreeNode[];
  level: number;
}
