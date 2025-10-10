import { Component, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  FieldConfig,
  MetadataSchema,
  DynamicFieldData
} from '../../../maintenance/models/field-config.model';

@Component({
  selector: 'app-dynamic-field-renderer',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    @if (schema() && schema()!.fields && schema()!.fields.length > 0) {
      <div class="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-lg p-4 space-y-4">
        <!-- Header -->
        <div class="flex items-center gap-2 text-purple-800 dark:text-purple-200 mb-2">
          <lucide-angular name="settings" [size]="20"></lucide-angular>
          <h3 class="font-bold text-lg">Campos Adicionales</h3>
        </div>

        <!-- Dynamic Fields -->
        @for (field of schema()!.fields; track field.id) {
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200">
              {{ field.label }}
              @if (field.required) {
                <span class="text-red-500">*</span>
              }
            </label>

            @if (field.helpText) {
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ field.helpText }}</p>
            }

            <!-- Text Input -->
            @if (field.type === 'text') {
              <input
                type="text"
                [(ngModel)]="fieldData()[field.id]"
                [placeholder]="field.placeholder || ''"
                [required]="field.required ?? false"
                [minlength]="field.minLength ?? null"
                [maxlength]="field.maxLength ?? null"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm"
              />
            }

            <!-- Number Input -->
            @if (field.type === 'number') {
              <input
                type="number"
                [(ngModel)]="fieldData()[field.id]"
                [placeholder]="field.placeholder || ''"
                [required]="field.required ?? false"
                [min]="field.min ?? null"
                [max]="field.max ?? null"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm"
              />
            }

            <!-- Currency Input -->
            @if (field.type === 'currency') {
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                <input
                  type="number"
                  [(ngModel)]="fieldData()[field.id]"
                  [placeholder]="field.placeholder || '0.00'"
                  [required]="field.required ?? false"
                  [min]="field.min || 0"
                  step="0.01"
                  class="w-full pl-8 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm"
                />
              </div>
            }

            <!-- Date Input -->
            @if (field.type === 'date') {
              <input
                type="date"
                [(ngModel)]="fieldData()[field.id]"
                [required]="field.required ?? false"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm"
              />
            }

            <!-- DateTime Input -->
            @if (field.type === 'datetime') {
              <input
                type="datetime-local"
                [(ngModel)]="fieldData()[field.id]"
                [required]="field.required ?? false"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm"
              />
            }

            <!-- Select Input -->
            @if (field.type === 'select') {
              <select
                [(ngModel)]="fieldData()[field.id]"
                [required]="field.required ?? false"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="">-- Seleccionar --</option>
                @for (option of field.options; track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
            }

            <!-- Textarea Input -->
            @if (field.type === 'textarea') {
              <textarea
                [(ngModel)]="fieldData()[field.id]"
                [placeholder]="field.placeholder || ''"
                [required]="field.required ?? false"
                [minlength]="field.minLength ?? null"
                [maxlength]="field.maxLength ?? null"
                rows="3"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm"
              ></textarea>
            }

            <!-- Checkbox Input -->
            @if (field.type === 'checkbox') {
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  [(ngModel)]="fieldData()[field.id]"
                  [required]="field.required ?? false"
                  class="w-5 h-5 text-purple-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 cursor-pointer"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ field.placeholder || 'Marcar si aplica' }}</span>
              </div>
            }

            <!-- Table/Cronograma Input -->
            @if (field.type === 'table') {
              <div class="bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                <!-- Table Header -->
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-gray-100 dark:bg-slate-700">
                      <tr>
                        @for (column of field.columns; track column.id) {
                          <th class="px-4 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                            {{ column.label }}
                            @if (column.required) {
                              <span class="text-red-500">*</span>
                            }
                          </th>
                        }
                        @if (field.allowDeleteRow) {
                          <th class="px-4 py-2 text-center text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider w-16">
                            Acciones
                          </th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of getTableRows(field.id); track $index; let rowIdx = $index) {
                        <tr class="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                          @for (column of field.columns; track column.id) {
                            <td class="px-4 py-2">
                              <!-- Auto-number column -->
                              @if (column.type === 'auto-number') {
                                <div class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  {{ rowIdx + 1 }}
                                </div>
                              }
                              <!-- Text column -->
                              @else if (column.type === 'text') {
                                <input
                                  type="text"
                                  [(ngModel)]="row[column.id]"
                                  [required]="column.required ?? false"
                                  class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                />
                              }
                              <!-- Number column -->
                              @else if (column.type === 'number') {
                                <input
                                  type="number"
                                  [(ngModel)]="row[column.id]"
                                  [required]="column.required ?? false"
                                  class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                />
                              }
                              <!-- Currency column -->
                              @else if (column.type === 'currency') {
                                <div class="relative">
                                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">$</span>
                                  <input
                                    type="number"
                                    [(ngModel)]="row[column.id]"
                                    [required]="column.required ?? false"
                                    step="0.01"
                                    class="w-full pl-6 pr-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                  />
                                </div>
                              }
                              <!-- Date column -->
                              @else if (column.type === 'date') {
                                <input
                                  type="date"
                                  [(ngModel)]="row[column.id]"
                                  [required]="column.required ?? false"
                                  class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                                />
                              }
                            </td>
                          }
                          @if (field.allowDeleteRow) {
                            <td class="px-4 py-2 text-center">
                              <button
                                type="button"
                                (click)="removeTableRow(field.id, rowIdx)"
                                class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <lucide-angular name="trash-2" [size]="16"></lucide-angular>
                              </button>
                            </td>
                          }
                        </tr>
                      }
                      @if (getTableRows(field.id).length === 0) {
                        <tr>
                          <td [attr.colspan]="field.columns!.length + (field.allowDeleteRow ? 1 : 0)" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            No hay filas. Haz clic en "Agregar Fila" para empezar.
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- Add Row Button -->
                @if (field.allowAddRow && (!field.maxRows || getTableRows(field.id).length < field.maxRows)) {
                  <div class="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-slate-700/50">
                    <button
                      type="button"
                      (click)="addTableRow(field.id, field.columns || [])"
                      class="w-full py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-purple-500 hover:text-purple-500 dark:hover:border-purple-400 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <lucide-angular name="plus" [size]="16"></lucide-angular>
                      Agregar Fila
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class DynamicFieldRendererComponent {
  schema = input<MetadataSchema | null>(null);

  // Field data with two-way binding
  fieldData = signal<DynamicFieldData>({});

  // Output when data changes
  dataChange = output<DynamicFieldData>();

  constructor() {
    // Initialize field data when schema changes
    effect(() => {
      const currentSchema = this.schema();
      if (currentSchema && currentSchema.fields) {
        const initialData: DynamicFieldData = {};

        currentSchema.fields.forEach(field => {
          if (field.type === 'table') {
            // Initialize table with empty array or minRows
            const minRows = field.minRows || 0;
            initialData[field.id] = Array.from({ length: minRows }, () => this.createEmptyTableRow(field.columns || []));
          } else if (field.type === 'checkbox') {
            initialData[field.id] = false;
          } else {
            initialData[field.id] = '';
          }
        });

        this.fieldData.set(initialData);
      }
    });

    // Emit data changes
    effect(() => {
      this.dataChange.emit(this.fieldData());
    });
  }

  getTableRows(fieldId: string): any[] {
    const data = this.fieldData()[fieldId];
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  }

  addTableRow(fieldId: string, columns: any[]) {
    const currentData = { ...this.fieldData() };
    if (!Array.isArray(currentData[fieldId])) {
      currentData[fieldId] = [];
    }

    const newRow = this.createEmptyTableRow(columns);
    (currentData[fieldId] as any[]).push(newRow);

    this.fieldData.set(currentData);
  }

  removeTableRow(fieldId: string, rowIndex: number) {
    const currentData = { ...this.fieldData() };
    if (Array.isArray(currentData[fieldId])) {
      (currentData[fieldId] as any[]).splice(rowIndex, 1);
      this.fieldData.set(currentData);
    }
  }

  private createEmptyTableRow(columns: any[]): any {
    const row: any = {};
    columns.forEach(column => {
      if (column.type === 'auto-number') {
        // Auto-number is handled by index, no need to store
        row[column.id] = null;
      } else if (column.type === 'number' || column.type === 'currency') {
        row[column.id] = column.defaultValue || 0;
      } else if (column.type === 'date') {
        row[column.id] = column.defaultValue || '';
      } else {
        row[column.id] = column.defaultValue || '';
      }
    });
    return row;
  }

  // Public method to get current field data
  getData(): DynamicFieldData {
    return this.fieldData();
  }

  // Public method to set field data (for loading existing data)
  setData(data: DynamicFieldData) {
    this.fieldData.set(data);
  }
}
