import { Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
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
  selector: 'app-classification-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
         (click)="onCancel()">

      <!-- Dialog -->
      <div class="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto transition-all duration-300 transform"
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
        <div class="p-6 space-y-6">
          <!-- Code and Name -->
          <div class="grid grid-cols-2 gap-4">
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
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-sm"
                [class.border-red-500]="errors()['code']"
              />
              @if (errors()['code']) {
                <p class="text-red-500 text-xs mt-1">{{ errors()['code'] }}</p>
              }
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                Nombre <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="form.name"
                placeholder="Ej: Contacto con Cliente, Promesa de Pago"
                maxlength="255"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm"
                [class.border-red-500]="errors()['name']"
              />
              @if (errors()['name']) {
                <p class="text-red-500 text-xs mt-1">{{ errors()['name'] }}</p>
              }
            </div>
          </div>

          <!-- Classification Type -->
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Tipo de Clasificación <span class="text-red-500">*</span>
            </label>
            <select
              [(ngModel)]="form.classificationType"
              [disabled]="isEditMode || !!defaultType"
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-sm"
              [class.border-red-500]="errors()['classificationType']">
              <option value="">-- Seleccionar --</option>
              <option [value]="ClassificationType.CONTACT_RESULT">Resultado de Contacto</option>
              <option [value]="ClassificationType.MANAGEMENT_TYPE">Tipo de Gestión</option>
              <option [value]="ClassificationType.PAYMENT_TYPE">Tipo de Pago</option>
              <option [value]="ClassificationType.COMPLAINT_TYPE">Tipo de Reclamo</option>
              <option [value]="ClassificationType.CUSTOM">Personalizado</option>
            </select>
            @if (errors()['classificationType']) {
              <p class="text-red-500 text-xs mt-1">{{ errors()['classificationType'] }}</p>
            }
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Descripción
              <span class="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">(Opcional)</span>
            </label>
            <textarea
              [(ngModel)]="form.description"
              rows="3"
              placeholder="Descripción detallada de la tipificación..."
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm"
            ></textarea>
          </div>

          <!-- Color Selector -->
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
              Color de Identificación
              <span class="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">(Selecciona el color que representará esta tipificación)</span>
            </label>
            <div class="space-y-3">
              <!-- Preset Colors -->
              <div class="grid grid-cols-8 gap-2">
                @for (color of presetColors; track color.hex) {
                  <button
                    type="button"
                    (click)="form.colorHex = color.hex"
                    [class]="'w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center ' +
                             (form.colorHex === color.hex ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-gray-900 dark:ring-white' : 'border-gray-300 dark:border-gray-600')"
                    [style.background-color]="color.hex"
                    [title]="color.name">
                    @if (form.colorHex === color.hex) {
                      <lucide-angular name="check" [size]="20" class="text-white drop-shadow-lg"></lucide-angular>
                    }
                  </button>
                }
              </div>

              <!-- Custom Color Picker -->
              <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <label class="text-sm font-semibold text-gray-700 dark:text-gray-200">Color personalizado:</label>
                <input
                  type="color"
                  [(ngModel)]="form.colorHex"
                  class="h-12 w-24 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
                <div class="flex-1 flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                    [style.background-color]="form.colorHex">
                  </div>
                  <span class="text-sm font-mono font-bold text-gray-700 dark:text-gray-300">{{ form.colorHex }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Icon Selector -->
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
              Icono Visual
              <span class="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">(Opcional - Selecciona un icono representativo)</span>
            </label>
            <div class="space-y-3">
              <!-- Common Icons -->
              <div class="grid grid-cols-10 gap-2">
                @for (icon of commonIcons; track icon.name) {
                  <button
                    type="button"
                    (click)="form.iconName = icon.name"
                    [class]="'p-3 rounded-lg border-2 transition-all hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center ' +
                             (form.iconName === icon.name ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-gray-300 dark:border-gray-600')"
                    [title]="icon.label">
                    <lucide-angular [name]="icon.name" [size]="20" class="text-gray-700 dark:text-gray-200"></lucide-angular>
                  </button>
                }
              </div>

              <!-- Selected Icon Preview -->
              @if (form.iconName) {
                <div class="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                  <lucide-angular [name]="form.iconName" [size]="28" class="text-blue-600 dark:text-blue-400"></lucide-angular>
                  <span class="text-sm font-semibold text-blue-800 dark:text-blue-200">Icono seleccionado: {{ form.iconName }}</span>
                  <button
                    type="button"
                    (click)="form.iconName = ''"
                    class="ml-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">
                    <lucide-angular name="x" [size]="18"></lucide-angular>
                  </button>
                </div>
              } @else {
                <p class="text-xs text-gray-500 dark:text-gray-400">No has seleccionado ningún icono</p>
              }
            </div>
          </div>

          <!-- Display Order -->
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Orden de Visualización
              <span class="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">(Menor número aparece primero)</span>
            </label>
            <input
              type="number"
              [(ngModel)]="form.displayOrder"
              min="0"
              step="10"
              placeholder="0, 10, 20, 30..."
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <lucide-angular name="lightbulb" [size]="12"></lucide-angular>
              Tip: Usa múltiplos de 10 (10, 20, 30...) para facilitar inserciones futuras
            </p>
          </div>

          <!-- Is Active -->
          @if (isEditMode) {
            <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <input
                type="checkbox"
                id="isActive"
                [(ngModel)]="form.isActive"
                class="w-5 h-5 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label for="isActive" class="text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer flex-1">
                Tipificación Activa
                <span class="block text-xs font-normal text-gray-500 dark:text-gray-400 mt-0.5">Desmarca para desactivar temporalmente esta tipificación</span>
              </label>
            </div>
          }

          @if (parentClassification) {
            <div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
              <div class="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-1">
                <lucide-angular name="git-branch" [size]="16"></lucide-angular>
                <span class="font-bold">Tipificación Hijo</span>
              </div>
              <p class="text-sm text-blue-700 dark:text-blue-300">
                <span class="font-semibold">Padre:</span> {{ parentClassification.name }} <span class="text-xs opacity-75">({{ parentClassification.code }})</span>
              </p>
              <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Esta tipificación será nivel {{ parentClassification.hierarchyLevel + 1 }} en la jerarquía
              </p>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-gray-50 dark:bg-slate-800 px-6 py-4 flex justify-end gap-3 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
          <button
            (click)="onCancel()"
            class="px-6 py-2.5 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 font-semibold transition-colors flex items-center gap-2 text-sm">
            <lucide-angular name="x" [size]="18"></lucide-angular>
            Cancelar
          </button>
          <button
            (click)="onSave()"
            [disabled]="saving()"
            class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm">
            @if (saving()) {
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Guardando...
            } @else {
              <lucide-angular name="save" [size]="18"></lucide-angular>
              Guardar
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class ClassificationFormDialogComponent implements OnInit {
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

  presetColors = [
    { hex: '#3B82F6', name: 'Azul' },
    { hex: '#10B981', name: 'Verde' },
    { hex: '#EF4444', name: 'Rojo' },
    { hex: '#F59E0B', name: 'Naranja' },
    { hex: '#8B5CF6', name: 'Violeta' },
    { hex: '#EC4899', name: 'Rosa' },
    { hex: '#6366F1', name: 'Índigo' },
    { hex: '#14B8A6', name: 'Turquesa' },
    { hex: '#F97316', name: 'Naranja Oscuro' },
    { hex: '#06B6D4', name: 'Cyan' },
    { hex: '#84CC16', name: 'Lima' },
    { hex: '#A855F7', name: 'Púrpura' },
    { hex: '#64748B', name: 'Gris' },
    { hex: '#0EA5E9', name: 'Azul Cielo' },
    { hex: '#22C55E', name: 'Verde Claro' },
    { hex: '#DC2626', name: 'Rojo Oscuro' }
  ];

  commonIcons = [
    { name: 'phone', label: 'Teléfono' },
    { name: 'phone-call', label: 'Llamada' },
    { name: 'check-circle', label: 'Éxito' },
    { name: 'x-circle', label: 'Error' },
    { name: 'alert-circle', label: 'Alerta' },
    { name: 'user', label: 'Usuario' },
    { name: 'users', label: 'Usuarios' },
    { name: 'credit-card', label: 'Tarjeta' },
    { name: 'dollar-sign', label: 'Dinero' },
    { name: 'calendar', label: 'Calendario' },
    { name: 'clock', label: 'Reloj' },
    { name: 'mail', label: 'Correo' },
    { name: 'message-square', label: 'Mensaje' },
    { name: 'file-text', label: 'Documento' },
    { name: 'home', label: 'Casa' },
    { name: 'briefcase', label: 'Maletín' },
    { name: 'trending-up', label: 'Tendencia' },
    { name: 'thumbs-up', label: 'Me gusta' },
    { name: 'thumbs-down', label: 'No me gusta' },
    { name: 'star', label: 'Estrella' }
  ];

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
