import { Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Save } from 'lucide-angular';
import { ClassificationService } from '../../services/classification.service';
import {
  ClassificationCatalog,
  ClassificationType,
  CreateClassificationCommand,
  UpdateClassificationCommand
} from '../../models/classification.model';

interface ClassificationForm {
  code: string;
  name: string;
  classificationType: ClassificationType | '';
  description: string;
  displayOrder: number;
  iconName: string;
  colorHex: string;
  isActive: boolean;
}

@Component({
  selector: 'app-classification-form-dialog-v2',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
         (click)="onCancel()">

      <!-- Dialog -->
      <div class="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto transition-all duration-300 transform"
           (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
          <div>
            <h2 class="text-xl font-bold">{{ getDialogTitle() }}</h2>
            <p class="text-sm text-blue-100 dark:text-blue-200">
              {{ isEditMode ? 'Modificar tipificación existente' : 'Crear nueva tipificación' }}
            </p>
          </div>
          <button
            (click)="onCancel()"
            class="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <lucide-angular name="x" [size]="24"></lucide-angular>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4">
          <!-- Code -->
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Código <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="form.code"
              [disabled]="isEditMode"
              placeholder="Ej: CPC, ACP, PPR"
              maxlength="20"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
              [class.border-red-500]="errors().code"
            />
            @if (errors().code) {
              <p class="text-red-500 text-sm mt-1">{{ errors().code }}</p>
            }
          </div>

          <!-- Name -->
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Nombre <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="form.name"
              placeholder="Ej: Contacto con Cliente, Promesa de Pago"
              maxlength="255"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              [class.border-red-500]="errors().name"
            />
            @if (errors().name) {
              <p class="text-red-500 text-sm mt-1">{{ errors().name }}</p>
            }
          </div>

          <!-- Classification Type -->
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Tipo de Clasificación <span class="text-red-500">*</span>
            </label>
            <select
              [(ngModel)]="form.classificationType"
              [disabled]="isEditMode || !!defaultType"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
              [class.border-red-500]="errors().classificationType">
              <option value="">-- Seleccionar --</option>
              <option [value]="ClassificationType.CONTACT_RESULT">Resultado de Contacto</option>
              <option [value]="ClassificationType.MANAGEMENT_TYPE">Tipo de Gestión</option>
              <option [value]="ClassificationType.PAYMENT_TYPE">Tipo de Pago</option>
              <option [value]="ClassificationType.COMPLAINT_TYPE">Tipo de Reclamo</option>
              <option [value]="ClassificationType.CUSTOM">Personalizado</option>
            </select>
            @if (errors().classificationType) {
              <p class="text-red-500 text-sm mt-1">{{ errors().classificationType }}</p>
            }
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Descripción
            </label>
            <textarea
              [(ngModel)]="form.description"
              rows="3"
              placeholder="Descripción detallada de la tipificación..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            ></textarea>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <!-- Display Order -->
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                Orden
              </label>
              <input
                type="number"
                [(ngModel)]="form.displayOrder"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <!-- Icon Name -->
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                Icono
              </label>
              <input
                type="text"
                [(ngModel)]="form.iconName"
                placeholder="phone"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <!-- Color -->
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                Color
              </label>
              <div class="flex gap-2">
                <input
                  type="color"
                  [(ngModel)]="form.colorHex"
                  class="h-10 w-16 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  [(ngModel)]="form.colorHex"
                  placeholder="#3B82F6"
                  maxlength="7"
                  class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          <!-- Is Active -->
          @if (isEditMode) {
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                [(ngModel)]="form.isActive"
                class="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label for="isActive" class="text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer">
                Activo
              </label>
            </div>
          }

          @if (parentClassification) {
            <div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-3">
              <p class="text-sm text-blue-800 dark:text-blue-200">
                <span class="font-bold">Padre:</span> {{ parentClassification.name }} ({{ parentClassification.code }})
              </p>
              <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Esta tipificación será creada como hijo de nivel {{ parentClassification.hierarchyLevel + 1 }}
              </p>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-gray-50 dark:bg-slate-800 px-6 py-4 flex justify-end gap-3 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
          <button
            (click)="onCancel()"
            class="px-6 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 font-semibold transition-colors flex items-center gap-2">
            <lucide-angular name="x" [size]="16"></lucide-angular>
            Cancelar
          </button>
          <button
            (click)="onSave()"
            [disabled]="saving()"
            class="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
            @if (saving()) {
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Guardando...
            } @else {
              <lucide-angular name="save" [size]="16"></lucide-angular>
              Guardar
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class ClassificationFormDialogV2Component implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() classification?: ClassificationCatalog;
  @Input() parentClassification?: ClassificationCatalog;
  @Input() defaultType?: ClassificationType;
  @Input() tenantId?: number;
  @Input() portfolioId?: number;
  @Output() save = new EventEmitter<ClassificationCatalog>();
  @Output() cancel = new EventEmitter<void>();

  ClassificationType = ClassificationType;
  isEditMode = false;

  form: ClassificationForm = {
    code: '',
    name: '',
    classificationType: '',
    description: '',
    displayOrder: 0,
    iconName: '',
    colorHex: '#3B82F6',
    isActive: true
  };

  saving = signal(false);
  errors = signal<Record<string, string>>({});

  constructor(private classificationService: ClassificationService) {}

  ngOnInit() {
    this.isEditMode = this.mode === 'edit';

    if (this.defaultType) {
      this.form.classificationType = this.defaultType;
    }

    if (this.isEditMode && this.classification) {
      this.form = {
        code: this.classification.code,
        name: this.classification.name,
        classificationType: this.classification.classificationType,
        description: this.classification.description || '',
        displayOrder: this.classification.displayOrder || 0,
        iconName: this.classification.iconName || '',
        colorHex: this.classification.colorHex || '#3B82F6',
        isActive: this.classification.isActive
      };
    }
  }

  validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!this.form.code.trim()) {
      newErrors['code'] = 'El código es requerido';
    }

    if (!this.form.name.trim()) {
      newErrors['name'] = 'El nombre es requerido';
    }

    if (!this.form.classificationType) {
      newErrors['classificationType'] = 'El tipo de clasificación es requerido';
    }

    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  onSave() {
    if (!this.validate()) return;

    this.saving.set(true);

    if (this.isEditMode && this.classification) {
      this.updateClassification();
    } else {
      this.createClassification();
    }
  }

  createClassification() {
    const command: CreateClassificationCommand = {
      code: this.form.code.trim(),
      name: this.form.name.trim(),
      classificationType: this.form.classificationType as ClassificationType,
      parentClassificationId: this.parentClassification?.id,
      description: this.form.description.trim() || undefined,
      displayOrder: this.form.displayOrder,
      iconName: this.form.iconName.trim() || undefined,
      colorHex: this.form.colorHex || undefined,
      isSystem: false
    };

    this.classificationService.createClassification(command).subscribe({
      next: (created) => {
        this.saving.set(false);
        this.save.emit(created);
      },
      error: (error) => {
        console.error('Error al crear tipificación:', error);
        this.saving.set(false);
        alert('Error al crear la tipificación. Verifique que el código no esté duplicado.');
      }
    });
  }

  updateClassification() {
    if (!this.classification) return;

    const command: UpdateClassificationCommand = {
      name: this.form.name.trim(),
      description: this.form.description.trim() || undefined,
      displayOrder: this.form.displayOrder,
      iconName: this.form.iconName.trim() || undefined,
      colorHex: this.form.colorHex || undefined,
      isActive: this.form.isActive
    };

    this.classificationService.updateClassification(this.classification.id, command).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.save.emit(updated);
      },
      error: (error) => {
        console.error('Error al actualizar tipificación:', error);
        this.saving.set(false);
        alert('Error al actualizar la tipificación.');
      }
    });
  }

  onCancel() {
    this.cancel.emit();
  }

  getDialogTitle(): string {
    if (this.isEditMode) {
      return 'Editar Tipificación';
    }
    if (this.parentClassification) {
      return `Nueva Tipificación - Nivel ${this.parentClassification.hierarchyLevel + 1}`;
    }
    return 'Nueva Tipificación - Nivel 1';
  }
}
