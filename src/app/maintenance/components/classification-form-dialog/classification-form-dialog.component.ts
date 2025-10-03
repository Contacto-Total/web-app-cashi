import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ClassificationService } from '../../services/classification.service';
import {
  ClassificationCatalog,
  TenantClassificationConfig,
  ClassificationType,
  CreateClassificationCommand,
  UpdateClassificationCommand,
  UpdateClassificationConfigCommand
} from '../../models/classification.model';

interface DialogData {
  mode: 'create' | 'edit';
  classification?: ClassificationCatalog;
  config?: TenantClassificationConfig;
  classificationType?: ClassificationType;
  parentClassification?: ClassificationCatalog;
  tenantId: number;
  portfolioId?: number;
}

@Component({
  selector: 'app-classification-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  templateUrl: './classification-form-dialog.component.html',
  styleUrls: ['./classification-form-dialog.component.scss']
})
export class ClassificationFormDialogComponent implements OnInit {
  catalogForm: FormGroup;
  configForm: FormGroup;
  classificationTypes = Object.values(ClassificationType);
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    private classificationService: ClassificationService,
    private dialogRef: MatDialogRef<ClassificationFormDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.catalogForm = this.createCatalogForm();
    this.configForm = this.createConfigForm();
  }

  ngOnInit() {
    if (this.isEditMode && this.data.classification) {
      this.populateCatalogForm(this.data.classification);
    }
    if (this.data.config) {
      this.populateConfigForm(this.data.config);
    }
  }

  createCatalogForm(): FormGroup {
    return this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      classificationType: [this.data.classificationType || '', Validators.required],
      description: [''],
      displayOrder: [0],
      iconName: [''],
      colorHex: [''],
      isActive: [true]
    });
  }

  createConfigForm(): FormGroup {
    return this.fb.group({
      isEnabled: [false],
      customName: [''],
      customIcon: [''],
      customColor: [''],
      displayOrder: [0],
      requiresComment: [false],
      minCommentLength: [null],
      maxCommentLength: [null],
      validationRules: ['']
    });
  }

  populateCatalogForm(classification: ClassificationCatalog) {
    this.catalogForm.patchValue({
      code: classification.code,
      name: classification.name,
      classificationType: classification.classificationType,
      description: classification.description,
      displayOrder: classification.displayOrder,
      iconName: classification.iconName,
      colorHex: classification.colorHex,
      isActive: classification.isActive
    });

    if (this.isEditMode) {
      this.catalogForm.get('code')?.disable();
      this.catalogForm.get('classificationType')?.disable();
    }
  }

  populateConfigForm(config: TenantClassificationConfig) {
    this.configForm.patchValue({
      isEnabled: config.isEnabled,
      customName: config.customName,
      customIcon: config.customIcon,
      customColor: config.customColor,
      displayOrder: config.displayOrder,
      requiresComment: config.requiresComment,
      minCommentLength: config.minCommentLength,
      maxCommentLength: config.maxCommentLength,
      validationRules: config.validationRules
    });
  }

  onSave() {
    if (this.catalogForm.invalid) {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.isEditMode) {
      this.updateClassification();
    } else {
      this.createClassification();
    }
  }

  createClassification() {
    const command: CreateClassificationCommand = {
      code: this.catalogForm.value.code,
      name: this.catalogForm.value.name,
      classificationType: this.catalogForm.value.classificationType,
      parentClassificationId: this.data.parentClassification?.id,
      description: this.catalogForm.value.description,
      displayOrder: this.catalogForm.value.displayOrder,
      iconName: this.catalogForm.value.iconName,
      colorHex: this.catalogForm.value.colorHex,
      isSystem: false
    };

    this.classificationService.createClassification(command).subscribe({
      next: (created) => {
        this.snackBar.open('Tipificación creada exitosamente', 'Cerrar', { duration: 2000 });

        // If config form has values, update config
        if (this.hasConfigChanges()) {
          this.updateConfig(created.id);
        } else {
          this.dialogRef.close(true);
        }
      },
      error: (error) => {
        this.snackBar.open('Error al crear tipificación', 'Cerrar', { duration: 3000 });
        console.error(error);
      }
    });
  }

  updateClassification() {
    if (!this.data.classification) return;

    const command: UpdateClassificationCommand = {
      name: this.catalogForm.value.name,
      description: this.catalogForm.value.description,
      displayOrder: this.catalogForm.value.displayOrder,
      iconName: this.catalogForm.value.iconName,
      colorHex: this.catalogForm.value.colorHex,
      isActive: this.catalogForm.value.isActive
    };

    this.classificationService.updateClassification(this.data.classification.id, command).subscribe({
      next: () => {
        this.snackBar.open('Tipificación actualizada exitosamente', 'Cerrar', { duration: 2000 });

        // Update config if there are changes
        if (this.hasConfigChanges()) {
          this.updateConfig(this.data.classification!.id);
        } else {
          this.dialogRef.close(true);
        }
      },
      error: (error) => {
        this.snackBar.open('Error al actualizar tipificación', 'Cerrar', { duration: 3000 });
        console.error(error);
      }
    });
  }

  hasConfigChanges(): boolean {
    const formValue = this.configForm.value;
    return formValue.isEnabled ||
           formValue.customName ||
           formValue.customIcon ||
           formValue.customColor ||
           formValue.requiresComment;
  }

  updateConfig(classificationId: number) {
    const command: UpdateClassificationConfigCommand = this.configForm.value;

    this.classificationService.updateTenantClassificationConfig(
      this.data.tenantId,
      classificationId,
      command,
      this.data.portfolioId
    ).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.snackBar.open('Error al actualizar configuración', 'Cerrar', { duration: 3000 });
        console.error(error);
        this.dialogRef.close(true); // Close anyway since catalog was saved
      }
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  getTypeLabel(type: ClassificationType): string {
    const labels: Record<ClassificationType, string> = {
      [ClassificationType.CONTACT_RESULT]: 'Resultado de Contacto',
      [ClassificationType.MANAGEMENT_TYPE]: 'Tipo de Gestión',
      [ClassificationType.PAYMENT_TYPE]: 'Tipo de Pago',
      [ClassificationType.COMPLAINT_TYPE]: 'Tipo de Reclamo',
      [ClassificationType.CUSTOM]: 'Personalizado'
    };
    return labels[type];
  }

  get dialogTitle(): string {
    if (this.isEditMode) {
      return 'Editar Tipificación';
    }
    if (this.data.parentClassification) {
      return `Nueva Tipificación - Nivel ${this.data.parentClassification.hierarchyLevel + 1}`;
    }
    return 'Nueva Tipificación - Nivel 1';
  }
}
