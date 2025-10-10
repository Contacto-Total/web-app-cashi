import { Component, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  FieldConfig,
  FieldType,
  MetadataSchema,
  SelectOption,
  TableColumn
} from '../../models/field-config.model';

@Component({
  selector: 'app-field-config-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <lucide-angular name="settings" [size]="24" class="text-blue-600"></lucide-angular>
              Configurar Campos Personalizados
            </h2>
            <button
              type="button"
              (click)="handleCancel()"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <lucide-angular name="x" [size]="24"></lucide-angular>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            <!-- Lista de campos configurados -->
            <div class="space-y-3">
              @for (field of fields(); track field.id; let idx = $index) {
                <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 space-y-3">
                      <div class="grid grid-cols-2 gap-3">
                        <!-- ID del campo -->
                        <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            ID del Campo
                          </label>
                          <input
                            type="text"
                            [(ngModel)]="field.id"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="payment_schedule"
                          />
                        </div>

                        <!-- Label -->
                        <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Etiqueta
                          </label>
                          <input
                            type="text"
                            [(ngModel)]="field.label"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Cronograma de Pago"
                          />
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-3">
                        <!-- Tipo de campo -->
                        <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tipo de Campo
                          </label>
                          <select
                            [(ngModel)]="field.type"
                            (ngModelChange)="onFieldTypeChange(field)"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="text">Texto</option>
                            <option value="number">Número</option>
                            <option value="currency">Moneda</option>
                            <option value="date">Fecha</option>
                            <option value="datetime">Fecha y Hora</option>
                            <option value="select">Lista Desplegable</option>
                            <option value="textarea">Área de Texto</option>
                            <option value="checkbox">Casilla de Verificación</option>
                            <option value="table">Tabla/Cronograma</option>
                          </select>
                        </div>

                        <!-- Requerido -->
                        <div class="flex items-center pt-6">
                          <label class="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              [(ngModel)]="field.required"
                              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Campo Requerido
                            </span>
                          </label>
                        </div>
                      </div>

                      <!-- Configuración de tabla/cronograma -->
                      @if (field.type === 'table') {
                        <div class="mt-4 p-4 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                          <div class="flex items-center justify-between mb-3">
                            <h4 class="font-medium text-gray-900 dark:text-white">Columnas de la Tabla</h4>
                            <button
                              type="button"
                              (click)="addColumn(field)"
                              class="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              + Agregar Columna
                            </button>
                          </div>

                          @for (column of field.columns; track column.id; let colIdx = $index) {
                            <div class="grid grid-cols-3 gap-2 mb-2">
                              <input
                                type="text"
                                [(ngModel)]="column.id"
                                class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="ID"
                              />
                              <input
                                type="text"
                                [(ngModel)]="column.label"
                                class="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Etiqueta"
                              />
                              <div class="flex gap-1">
                                <select
                                  [(ngModel)]="column.type"
                                  class="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                  <option value="auto-number">Auto-Número</option>
                                  <option value="text">Texto</option>
                                  <option value="number">Número</option>
                                  <option value="currency">Moneda</option>
                                  <option value="date">Fecha</option>
                                </select>
                                <button
                                  type="button"
                                  (click)="removeColumn(field, colIdx)"
                                  class="px-2 text-red-600 hover:text-red-800"
                                >
                                  <lucide-angular name="trash-2" [size]="16"></lucide-angular>
                                </button>
                              </div>
                            </div>
                          }
                        </div>
                      }

                      <!-- Texto de ayuda -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Texto de Ayuda (opcional)
                        </label>
                        <input
                          type="text"
                          [(ngModel)]="field.helpText"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="Instrucciones para el usuario..."
                        />
                      </div>
                    </div>

                    <!-- Botón eliminar campo -->
                    <button
                      type="button"
                      (click)="removeField(idx)"
                      class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <lucide-angular name="trash-2" [size]="20"></lucide-angular>
                    </button>
                  </div>
                </div>
              }

              @if (fields().length === 0) {
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                  <lucide-angular name="file-question" [size]="48" class="mx-auto mb-2 opacity-50"></lucide-angular>
                  <p>No hay campos configurados</p>
                  <p class="text-sm">Haz clic en "Agregar Campo" para empezar</p>
                </div>
              }
            </div>

            <!-- Botón agregar campo -->
            <button
              type="button"
              (click)="addField()"
              class="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
            >
              <lucide-angular name="plus" [size]="20"></lucide-angular>
              Agregar Campo
            </button>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              (click)="handleCancel()"
              class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="handleSave()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <lucide-angular name="save" [size]="20"></lucide-angular>
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class FieldConfigDialogComponent {
  isOpen = input.required<boolean>();
  existingSchema = input<MetadataSchema | null>(null);

  save = output<MetadataSchema>();
  cancel = output<void>();

  fields = signal<FieldConfig[]>([]);

  constructor() {
    effect(() => {
      const schema = this.existingSchema();
      if (schema && schema.fields) {
        this.fields.set(JSON.parse(JSON.stringify(schema.fields)));
      } else {
        this.fields.set([]);
      }
    });
  }

  addField() {
    const newField: FieldConfig = {
      id: `field_${Date.now()}`,
      label: 'Nuevo Campo',
      type: 'text',
      required: false,
      displayOrder: this.fields().length
    };
    this.fields.update(fields => [...fields, newField]);
  }

  removeField(index: number) {
    this.fields.update(fields => fields.filter((_, i) => i !== index));
  }

  onFieldTypeChange(field: FieldConfig) {
    if (field.type === 'table') {
      if (!field.columns || field.columns.length === 0) {
        field.columns = [
          { id: 'cuota', label: 'Cuota', type: 'auto-number', required: true },
          { id: 'fecha', label: 'Fecha', type: 'date', required: true },
          { id: 'monto', label: 'Monto', type: 'currency', required: true }
        ];
      }
      field.allowAddRow = true;
      field.allowDeleteRow = true;
    }
  }

  addColumn(field: FieldConfig) {
    if (!field.columns) {
      field.columns = [];
    }
    const newColumn: TableColumn = {
      id: `column_${Date.now()}`,
      label: 'Nueva Columna',
      type: 'text'
    };
    field.columns.push(newColumn);
    this.fields.set([...this.fields()]);
  }

  removeColumn(field: FieldConfig, columnIndex: number) {
    if (field.columns) {
      field.columns.splice(columnIndex, 1);
      this.fields.set([...this.fields()]);
    }
  }

  handleSave() {
    const schema: MetadataSchema = {
      fields: this.fields()
    };
    this.save.emit(schema);
  }

  handleCancel() {
    this.cancel.emit();
  }
}
