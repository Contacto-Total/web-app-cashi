import { Component, EventEmitter, Output, signal, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ClassificationType } from '../../models/classification.model';

interface CategoryForm {
  code: string;
  name: string;
  description: string;
}

interface ClassificationTypeExample {
  type: ClassificationType;
  code: string;
  name: string;
  count: number;
}

@Component({
  selector: 'app-category-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
         (click)="onCancel()">

      <!-- Dialog -->
      <div class="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto transition-all duration-300 transform"
           (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 text-white px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
          <div>
            <h2 class="text-xl font-bold">Nueva Categoría de Clasificación</h2>
            <p class="text-sm text-purple-100 dark:text-purple-200">
              Crea un nuevo tipo de clasificación personalizado
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
          <!-- Warning Notice -->
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <div class="flex items-start gap-3">
              <lucide-angular name="alert-circle" [size]="20" class="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"></lucide-angular>
              <div class="text-sm text-yellow-800 dark:text-yellow-200">
                <p class="font-bold mb-1">⚠️ Advertencia Importante</p>
                <p>Las categorías son tipos de clasificación a nivel de sistema. Una vez creadas, no se pueden eliminar fácilmente ya que pueden estar siendo usadas por múltiples tipificaciones.</p>
              </div>
            </div>
          </div>

          <!-- Code -->
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Código de Categoría <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="form.code"
              placeholder="Ej: CUSTOM_TYPE, NEW_CATEGORY"
              maxlength="50"
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 uppercase text-sm font-mono"
              [class.border-red-500]="errors()['code']"
            />
            @if (errors()['code']) {
              <p class="text-red-500 text-xs mt-1">{{ errors()['code'] }}</p>
            }
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <lucide-angular name="info" [size]="12"></lucide-angular>
              Usa MAYÚSCULAS y guiones bajos (snake_case). Ejemplo: PAYMENT_METHOD, CALL_RESULT
            </p>
          </div>

          <!-- Name -->
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Nombre Descriptivo <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="form.name"
              placeholder="Ej: Método de Pago, Resultado de Llamada"
              maxlength="100"
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm"
              [class.border-red-500]="errors()['name']"
            />
            @if (errors()['name']) {
              <p class="text-red-500 text-xs mt-1">{{ errors()['name'] }}</p>
            }
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <lucide-angular name="info" [size]="12"></lucide-angular>
              Este será el nombre que verán los usuarios en la interfaz
            </p>
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
              placeholder="Describe el propósito de esta categoría y cuándo debe ser usada..."
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm"
            ></textarea>
          </div>

          <!-- Examples - Clasificaciones Existentes -->
          @if (typeExamples().length > 0) {
            <div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
              <div class="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-3">
                <lucide-angular name="settings" [size]="16"></lucide-angular>
                <span class="font-bold text-sm">Tipos de Clasificación en el Sistema:</span>
              </div>
              <div class="grid grid-cols-1 gap-2 text-xs">
                @for (example of typeExamples(); track example.type) {
                  <div class="bg-white dark:bg-slate-800 p-3 rounded border"
                       [class.border-blue-200]="example.count > 0"
                       [class.dark:border-blue-900]="example.count > 0"
                       [class.border-gray-200]="example.count === 0"
                       [class.dark:border-gray-700]="example.count === 0"
                       [class.opacity-60]="example.count === 0">
                    <div class="flex items-start justify-between mb-1">
                      <div class="flex-1">
                        <p class="font-mono font-bold mb-1"
                           [class.text-blue-700]="example.count > 0"
                           [class.dark:text-blue-300]="example.count > 0"
                           [class.text-gray-500]="example.count === 0"
                           [class.dark:text-gray-500]="example.count === 0">
                          {{ example.type }}
                        </p>
                        <p class="text-gray-600 dark:text-gray-400 font-medium">{{ getTypeLabel(example.type) }}</p>
                      </div>
                      <span class="px-2 py-1 rounded text-xs font-semibold"
                            [class.bg-blue-100]="example.count > 0"
                            [class.dark:bg-blue-900/50]="example.count > 0"
                            [class.text-blue-700]="example.count > 0"
                            [class.dark:text-blue-300]="example.count > 0"
                            [class.bg-gray-100]="example.count === 0"
                            [class.dark:bg-gray-700]="example.count === 0"
                            [class.text-gray-500]="example.count === 0"
                            [class.dark:text-gray-400]="example.count === 0">
                        {{ example.count }} {{ example.count === 1 ? 'clasificación' : 'clasificaciones' }}
                      </span>
                    </div>
                    @if (example.count > 0) {
                      <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p class="text-gray-500 dark:text-gray-400 text-xs mb-1">Ejemplo:</p>
                        <div class="flex items-center gap-2">
                          <span class="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">{{ example.code }}</span>
                          <span class="text-gray-600 dark:text-gray-400">{{ example.name }}</span>
                        </div>
                      </div>
                    } @else {
                      <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p class="text-gray-400 dark:text-gray-500 text-xs italic">No hay clasificaciones de este tipo aún</p>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          } @else {
            <div class="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4">
              <div class="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <lucide-angular name="info" [size]="16"></lucide-angular>
                <span class="text-sm">No hay clasificaciones existentes para mostrar como ejemplo.</span>
              </div>
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
            class="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm">
            @if (saving()) {
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creando...
            } @else {
              <lucide-angular name="save" [size]="18"></lucide-angular>
              Crear Categoría
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class CategoryFormDialogComponent implements OnInit, OnChanges {
  @Input() classifications: any[] = [];
  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  form: CategoryForm = {
    code: '',
    name: '',
    description: ''
  };

  saving = signal(false);
  errors = signal<Record<string, string>>({});
  typeExamples = signal<ClassificationTypeExample[]>([]);

  ngOnInit() {
    this.buildTypeExamples();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['classifications'] && changes['classifications'].currentValue) {
      this.buildTypeExamples();
    }
  }

  buildTypeExamples() {
    const typeMap = new Map<ClassificationType, { codes: string[], names: string[], count: number }>();

    // Inicializar todos los tipos posibles con 0 clasificaciones
    Object.values(ClassificationType).forEach(type => {
      typeMap.set(type, { codes: [], names: [], count: 0 });
    });

    // Agrupar clasificaciones existentes por tipo
    this.classifications.forEach(classification => {
      const type = classification.classificationType;
      if (typeMap.has(type)) {
        const typeData = typeMap.get(type)!;
        typeData.count++;
        if (typeData.codes.length < 1) { // Guardar solo 1 ejemplo
          typeData.codes.push(classification.code);
          typeData.names.push(classification.name);
        }
      }
    });

    // Convertir a array de ejemplos (incluir todos los tipos, tengan o no datos)
    const examples: ClassificationTypeExample[] = [];
    typeMap.forEach((data, type) => {
      examples.push({
        type,
        code: data.codes[0] || '-',
        name: data.names[0] || 'Sin ejemplos disponibles',
        count: data.count
      });
    });

    this.typeExamples.set(examples);
  }

  getTypeLabel(type: ClassificationType): string {
    const labels: Record<ClassificationType, string> = {
      [ClassificationType.CONTACT_RESULT]: 'Resultado de Contacto',
      [ClassificationType.MANAGEMENT_TYPE]: 'Tipo de Gestión',
      [ClassificationType.PAYMENT_TYPE]: 'Tipo de Pago',
      [ClassificationType.COMPLAINT_TYPE]: 'Tipo de Reclamo',
      [ClassificationType.PAYMENT_SCHEDULE]: 'Cronograma de Pagos',
      [ClassificationType.CUSTOM]: 'Personalizado'
    };
    return labels[type];
  }

  validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!this.form.code.trim()) {
      newErrors['code'] = 'El código es requerido';
    } else if (!/^[A-Z_]+$/.test(this.form.code.trim())) {
      newErrors['code'] = 'El código debe contener solo MAYÚSCULAS y guiones bajos';
    }

    if (!this.form.name.trim()) {
      newErrors['name'] = 'El nombre es requerido';
    }

    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  onSave() {
    if (!this.validate()) return;

    this.saving.set(true);

    // Simulación de guardado - En producción esto llamaría al backend
    setTimeout(() => {
      this.saving.set(false);
      alert(`⚠️ Funcionalidad pendiente:\n\nPara crear categorías dinámicamente, necesitas:\n\n1. Backend: Crear tabla 'classification_types' en la BD\n2. Backend: API REST para CRUD de tipos\n3. Frontend: Actualizar enum ClassificationType dinámicamente\n\nPor ahora, las categorías son enums fijos en el código.\n\nCategoría a crear:\nCódigo: ${this.form.code}\nNombre: ${this.form.name}`);
      this.save.emit(this.form.name);
    }, 1000);
  }

  onCancel() {
    this.cancel.emit();
  }
}
