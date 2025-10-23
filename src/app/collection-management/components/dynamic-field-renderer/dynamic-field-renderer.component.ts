import { Component, effect, input, output, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  FieldConfig,
  MetadataSchema,
  DynamicFieldData
} from '../../../maintenance/models/field-config.model';
import { ManagementClassification } from '../../models/system-config.model';

@Component({
  selector: 'app-dynamic-field-renderer',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    @if (schema() && schema()!.fields && schema()!.fields.length > 0) {
      <div class="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-lg shadow-md p-3">
        <!-- Header -->
        <div class="flex items-center gap-2 text-purple-800 dark:text-purple-200 mb-3 pb-2 border-b border-purple-200 dark:border-purple-800">
          <lucide-angular name="settings" [size]="14"></lucide-angular>
          <h3 class="font-bold text-xs uppercase tracking-wide">Campos Adicionales</h3>
        </div>

        <!-- Dynamic Fields in Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          @for (field of schema()!.fields; track field.id) {
            <div [class.md:col-span-2]="field.type === 'table' || field.type === 'textarea'">
              <label class="text-[11px] font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-1">
                {{ field.label }}
                @if (field.required) {
                  <span class="text-red-500 text-xs">*</span>
                }
              </label>

              @if (field.helpText) {
                <p class="text-[9px] text-gray-500 dark:text-gray-400 mb-1 italic">{{ field.helpText }}</p>
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
                  class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
              }

              <!-- Number Input -->
              @if (field.type === 'number') {
                <input
                  type="number"
                  [ngModel]="fieldData()[field.id]"
                  (ngModelChange)="updateFieldValue(field.id, $event)"
                  [placeholder]="field.placeholder || ''"
                  [required]="field.required ?? false"
                  [min]="field.min ?? null"
                  [max]="field.max ?? null"
                  class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
              }

              <!-- Currency Input -->
              @if (field.type === 'currency') {
                <div class="relative">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 dark:text-gray-400 font-semibold">S/</span>
                  <input
                    type="number"
                    [ngModel]="fieldData()[field.id]"
                    (ngModelChange)="updateFieldValue(field.id, $event)"
                    [placeholder]="field.placeholder || '0.00'"
                    [required]="field.required ?? false"
                    [min]="field.min || 0"
                    step="0.01"
                    class="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              }

              <!-- Date Input -->
              @if (field.type === 'date') {
                <input
                  type="date"
                  [(ngModel)]="fieldData()[field.id]"
                  [required]="field.required ?? false"
                  class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
              }

              <!-- DateTime Input -->
              @if (field.type === 'datetime') {
                <input
                  type="datetime-local"
                  [(ngModel)]="fieldData()[field.id]"
                  [required]="field.required ?? false"
                  class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
              }

              <!-- Select Input -->
              @if (field.type === 'select') {
                <select
                  [(ngModel)]="fieldData()[field.id]"
                  [required]="field.required ?? false"
                  class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
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
                  rows="2"
                  class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                ></textarea>
              }

              <!-- Checkbox Input -->
              @if (field.type === 'checkbox') {
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="fieldData()[field.id]"
                    [required]="field.required ?? false"
                    class="w-4 h-4 text-purple-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 cursor-pointer"
                  />
                  <span class="text-xs text-gray-700 dark:text-gray-300">{{ field.placeholder || 'Marcar si aplica' }}</span>
                </div>
              }

              <!-- Phone Input -->
              @if (field.type === 'phone') {
                <div class="relative">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 dark:text-gray-400 font-semibold">📱</span>
                  <input
                    type="tel"
                    [(ngModel)]="fieldData()[field.id]"
                    [placeholder]="field.placeholder || '999 999 999'"
                    [required]="field.required ?? false"
                    pattern="[0-9]{9}"
                    maxlength="9"
                    class="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              }

              <!-- Time Input -->
              @if (field.type === 'time') {
                <input
                  type="time"
                  [(ngModel)]="fieldData()[field.id]"
                  [required]="field.required ?? false"
                  class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
              }

              <!-- Email Input -->
              @if (field.type === 'email') {
                <input
                  type="email"
                  [(ngModel)]="fieldData()[field.id]"
                  [placeholder]="field.placeholder || 'ejemplo@correo.com'"
                  [required]="field.required ?? false"
                  class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
              }

              <!-- URL Input -->
              @if (field.type === 'url') {
                <input
                  type="url"
                  [(ngModel)]="fieldData()[field.id]"
                  [placeholder]="field.placeholder || 'https://ejemplo.com'"
                  [required]="field.required ?? false"
                  class="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                />
              }

            <!-- Table/Cronograma Input -->
            @if (field.type === 'table') {
              <div class="rounded-lg border border-purple-200 dark:border-purple-800/50 overflow-hidden shadow-sm">
                <!-- Table Header -->
                <div class="overflow-x-auto">
                  <table class="w-full border-collapse">
                    <thead>
                      <tr class="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
                        @for (column of field.columns; track column.id) {
                          <th class="px-3 py-2 text-left text-[10px] font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wide border-b-2 border-purple-300 dark:border-purple-700">
                            {{ column.label }}
                            @if (column.required) {
                              <span class="text-red-500 ml-0.5">*</span>
                            }
                          </th>
                        }
                        @if (field.allowDeleteRow) {
                          <th class="px-3 py-2 text-center text-[10px] font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wide border-b-2 border-purple-300 dark:border-purple-700 w-16">
                            <lucide-angular name="trash-2" [size]="12"></lucide-angular>
                          </th>
                        }
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-slate-800">
                      @for (row of getTableRows(field.id); track $index; let rowIdx = $index) {
                        <tr class="border-b border-purple-100 dark:border-purple-900/30 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors">
                          @for (column of field.columns; track column.id) {
                            <td class="px-3 py-2">
                              <!-- Auto-number column -->
                              @if (column.type === 'auto-number') {
                                <div class="flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                                  {{ rowIdx + 1 }}
                                </div>
                              }
                              <!-- Text column -->
                              @else if (column.type === 'text') {
                                <input
                                  type="text"
                                  [(ngModel)]="row[column.id]"
                                  [required]="column.required ?? false"
                                  class="w-full px-2 py-1 text-[11px] border border-purple-200 dark:border-purple-800 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                                />
                              }
                              <!-- Number column -->
                              @else if (column.type === 'number') {
                                <input
                                  type="number"
                                  [(ngModel)]="row[column.id]"
                                  [required]="column.required ?? false"
                                  class="w-full px-2 py-1 text-[11px] border border-purple-200 dark:border-purple-800 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                                />
                              }
                              <!-- Currency column -->
                              @else if (column.type === 'currency') {
                                <div class="relative">
                                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-purple-600 dark:text-purple-400 font-semibold">S/</span>
                                  <input
                                    type="number"
                                    [(ngModel)]="row[column.id]"
                                    [required]="column.required ?? false"
                                    step="0.01"
                                    class="w-full pl-6 pr-2 py-1 text-[11px] border border-purple-200 dark:border-purple-800 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                                  />
                                </div>
                              }
                              <!-- Date column -->
                              @else if (column.type === 'date') {
                                <input
                                  type="date"
                                  [(ngModel)]="row[column.id]"
                                  [required]="column.required ?? false"
                                  [min]="getMinDate(column)"
                                  [max]="getMaxDate(column)"
                                  class="w-full px-2 py-1 text-[11px] border border-purple-200 dark:border-purple-800 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                                />
                              }
                              <!-- Time column -->
                              @else if (column.type === 'time') {
                                <input
                                  type="time"
                                  [(ngModel)]="row[column.id]"
                                  [required]="column.required ?? false"
                                  class="w-full px-2 py-1 text-[11px] border border-purple-200 dark:border-purple-800 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                                />
                              }
                              <!-- Phone column -->
                              @else if (column.type === 'phone') {
                                <input
                                  type="tel"
                                  [(ngModel)]="row[column.id]"
                                  [required]="column.required ?? false"
                                  pattern="[0-9]{9}"
                                  maxlength="9"
                                  placeholder="999999999"
                                  class="w-full px-2 py-1 text-[11px] border border-purple-200 dark:border-purple-800 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                                />
                              }
                              <!-- Select column -->
                              @else if (column.type === 'select') {
                                <select
                                  [(ngModel)]="row[column.id]"
                                  [required]="column.required ?? false"
                                  class="w-full px-2 py-1 text-[11px] border border-purple-200 dark:border-purple-800 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                                >
                                  <option value="">Seleccionar...</option>
                                  @for (option of column.options; track option.value || option) {
                                    <option [value]="option.value || option">
                                      {{ option.label || option }}
                                    </option>
                                  }
                                </select>
                              }
                            </td>
                          }
                          @if (field.allowDeleteRow) {
                            <td class="px-3 py-2 text-center">
                              <button
                                type="button"
                                (click)="removeTableRow(field.id, rowIdx)"
                                class="inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                title="Eliminar fila"
                              >
                                <lucide-angular name="x" [size]="14"></lucide-angular>
                              </button>
                            </td>
                          }
                        </tr>
                      }
                      @if (getTableRows(field.id).length === 0) {
                        <tr>
                          <td [attr.colspan]="field.columns!.length + (field.allowDeleteRow ? 1 : 0)" class="px-4 py-12 text-center">
                            <div class="flex flex-col items-center gap-2">
                              <div class="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <lucide-angular name="table-2" [size]="24" class="text-purple-400 dark:text-purple-500"></lucide-angular>
                              </div>
                              <p class="text-[11px] text-gray-500 dark:text-gray-400 font-medium">No hay registros en la tabla</p>
                              <p class="text-[10px] text-gray-400 dark:text-gray-500">Haz clic en "Agregar Fila" para comenzar</p>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- Add Row Button -->
                @if (field.allowAddRow && (!field.maxRows || getTableRows(field.id).length < field.maxRows)) {
                  <div class="border-t border-purple-300 dark:border-purple-700 p-2  from-purple-100/70 to-white dark:from-purple-950/40 dark:to-purple-800/60">
                    <button
                      type="button"
                      (click)="addTableRow(field.id, field.columns || [])"
                      class="w-full py-1.5 px-3 border border-dashed border-purple-400 dark:border-purple-600 rounded-lg 
                            text-purple-900/50  dark:text-purple-300 
                            hover:bg-purple-100 dark:hover:bg-purple-900/50 
                            hover:border-purple-600 dark:hover:border-purple-400 
                            transition-all flex items-center justify-center gap-2 text-[11px] font-semibold"
                    >
                      <lucide-angular name="plus-circle" [size]="14"></lucide-angular>
                      Agregar Fila
                    </button>
                  </div>
                }
              </div>
            }
            </div>
          }
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
export class DynamicFieldRendererComponent {
  schema = input<MetadataSchema | null>(null);
  externalUpdates = input<DynamicFieldData>({});
  selectedClassification = input<ManagementClassification | null>(null);

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

    // Watch for external updates and apply them
    // Usamos untracked() para leer fieldData sin crear dependencia circular
    effect(() => {
      const updates = this.externalUpdates();

      if (updates && Object.keys(updates).length > 0) {
        console.log('[DynamicField] Received external updates:', updates);

        // Leer el estado actual SIN crear dependencia en este effect
        const currentData = untracked(() => ({ ...this.fieldData() }));

        // Solo actualizar si hay cambios reales
        let hasChanges = false;
        Object.keys(updates).forEach(key => {
          if (updates[key] !== undefined && updates[key] !== null && currentData[key] !== updates[key]) {
            currentData[key] = updates[key];
            hasChanges = true;
          }
        });

        // Solo actualizar el signal si realmente hubo cambios
        if (hasChanges) {
          console.log('[DynamicField] Applying updates to fieldData');
          this.fieldData.set(currentData);
        } else {
          console.log('[DynamicField] No changes detected, skipping update');
        }
      }
    });

    // Watch for changes in fields that control table row counts (linked tables)
    effect(() => {
      const data = this.fieldData();
      const currentSchema = this.schema();

      if (!currentSchema?.fields) {
        return;
      }

      // Find all table fields that have linkedToField property
      const linkedTables = currentSchema.fields.filter(
        field => field.type === 'table' && (field as any).linkedToField
      );

      linkedTables.forEach(tableField => {
        const linkedFieldId = (tableField as any).linkedToField;
        const linkedFieldValue = data[linkedFieldId];

        console.log(`🔗 Sincronización número→tabla: "${linkedFieldId}"=${linkedFieldValue} → tabla="${tableField.id}"`);

        if (linkedFieldValue && typeof linkedFieldValue === 'number' && linkedFieldValue > 0) {
          const currentRows = this.getTableRows(tableField.id);
          const targetRows = Math.floor(linkedFieldValue);

          console.log(`   Filas actuales: ${currentRows.length}, Filas objetivo: ${targetRows}`);

          if (currentRows.length !== targetRows) {
            console.log(`   ✅ Ajustando tabla de ${currentRows.length} a ${targetRows} filas`);
            this.adjustTableRows(tableField.id, targetRows, tableField.columns || []);
          }
        }
      });
    });

    // Emit data changes
    effect(() => {
      this.dataChange.emit(this.fieldData());
    });
  }

  updateFieldValue(fieldId: string, value: any) {
    const currentData = { ...this.fieldData() };

    // Convert string numbers to actual numbers
    if (typeof value === 'string' && value !== '' && !isNaN(Number(value))) {
      currentData[fieldId] = Number(value);
    } else {
      currentData[fieldId] = value;
    }

    this.fieldData.set(currentData);

    // Check if this field controls any table rows (linked tables)
    this.checkLinkedTables(fieldId, currentData);
  }

  checkLinkedTables(changedFieldId: string, currentData: DynamicFieldData) {
    const currentSchema = this.schema();

    if (!currentSchema?.fields) {
      return;
    }

    // Find table fields that are linked to the changed field
    const linkedTables = currentSchema.fields.filter(
      field => field.type === 'table' && (field as any).linkedToField === changedFieldId
    );

    linkedTables.forEach(tableField => {
      const linkedFieldValue = currentData[changedFieldId];

      if (linkedFieldValue && typeof linkedFieldValue === 'number' && linkedFieldValue > 0) {
        const currentRows = this.getTableRows(tableField.id);
        const targetRows = Math.floor(linkedFieldValue);

        if (currentRows.length !== targetRows) {
          this.adjustTableRows(tableField.id, targetRows, tableField.columns || []);
        }
      }
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

    const newRowCount = (currentData[fieldId] as any[]).length;
    console.log(`➕ Tabla→Número: Agregada fila, total=${newRowCount}`);

    this.fieldData.set(currentData);

    // Sincronización inversa: actualizar el campo linkedToField si existe
    this.updateLinkedFieldFromTable(fieldId, newRowCount);
  }

  removeTableRow(fieldId: string, rowIndex: number) {
    const currentData = { ...this.fieldData() };
    if (Array.isArray(currentData[fieldId])) {
      const currentRowCount = (currentData[fieldId] as any[]).length;
      const typification = this.selectedClassification();

      // Validar mínimo de filas según clasificación
      if (typification?.codigo === 'PF') {
        // Pago Fraccionado: mínimo 2 filas
        if (currentRowCount <= 2) {
          alert('Los Pagos Fraccionados requieren mínimo 2 cuotas. No se puede eliminar más filas.');
          return;
        }
      } else if (typification?.codigo === 'CF') {
        // Convenio Formal: mínimo 1 fila
        if (currentRowCount <= 1) {
          alert('Los Convenios requieren mínimo 1 cuota. No se puede eliminar esta fila.');
          return;
        }
      }

      (currentData[fieldId] as any[]).splice(rowIndex, 1);

      const newRowCount = (currentData[fieldId] as any[]).length;
      console.log(`➖ Tabla→Número: Eliminada fila, total=${newRowCount}`);

      this.fieldData.set(currentData);

      // Sincronización inversa: actualizar el campo linkedToField si existe
      this.updateLinkedFieldFromTable(fieldId, newRowCount);
    }
  }

  /**
   * Actualiza el campo vinculado (linkedToField) cuando cambian las filas de una tabla
   */
  private updateLinkedFieldFromTable(tableFieldId: string, rowCount: number) {
    const currentSchema = this.schema();
    console.log(`🔍 updateLinkedFieldFromTable: tableFieldId="${tableFieldId}", rowCount=${rowCount}`);

    if (!currentSchema?.fields) {
      console.log(`   ❌ No hay schema o fields`);
      return;
    }

    // Buscar el campo de tabla para obtener su linkedToField
    const tableField = currentSchema.fields.find(f => f.id === tableFieldId);
    console.log(`   Campo tabla encontrado:`, tableField);

    if (!tableField || tableField.type !== 'table') {
      console.log(`   ❌ Campo no encontrado o no es tabla`);
      return;
    }

    const linkedFieldId = (tableField as any).linkedToField;
    console.log(`   linkedToField="${linkedFieldId}"`);

    if (!linkedFieldId) {
      console.log(`   ❌ No hay linkedToField definido`);
      return;
    }

    // Actualizar el valor del campo vinculado
    const currentData = { ...this.fieldData() };
    const currentValue = currentData[linkedFieldId];
    console.log(`   Valor actual del campo vinculado: ${currentValue}`);

    if (currentValue !== rowCount) {
      currentData[linkedFieldId] = rowCount;
      this.fieldData.set(currentData);
      console.log(`   ✅ Campo "${linkedFieldId}" actualizado: ${currentValue} → ${rowCount}`);
    } else {
      console.log(`   ⚠️ El valor ya es ${rowCount}, no se actualiza`);
    }
  }

  adjustTableRows(fieldId: string, targetCount: number, columns: any[]) {
    const currentData = { ...this.fieldData() };
    if (!Array.isArray(currentData[fieldId])) {
      currentData[fieldId] = [];
    }

    const currentRows = currentData[fieldId] as any[];
    const currentCount = currentRows.length;

    if (targetCount > currentCount) {
      // Add rows
      for (let i = currentCount; i < targetCount; i++) {
        currentRows.push(this.createEmptyTableRow(columns));
      }
    } else if (targetCount < currentCount) {
      // Remove rows
      currentRows.splice(targetCount);
    }

    this.fieldData.set(currentData);
  }

  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getEndOfMonthDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    // Último día del mes actual
    const lastDay = new Date(year, month + 1, 0).getDate();
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(lastDay).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  }

  getMinDate(column: any): string | undefined {
    const minDate = column.minDate;
    if (minDate === 'today') {
      return this.getTodayDate();
    }
    return minDate;
  }

  getMaxDate(column: any): string | undefined {
    const typification = this.selectedClassification();

    // Para Pago Fraccionado (PF), limitar fechas al mes actual
    if (typification?.codigo === 'PF') {
      return this.getEndOfMonthDate();
    }

    // Para Convenios (CF) y otros, sin límite de fecha máxima
    return column.maxDate;
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
