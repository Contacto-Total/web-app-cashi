import { Component, OnInit, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { HeaderConfigurationService } from '../../services/header-configuration.service';
import { FieldDefinitionService } from '../../services/field-definition.service';
import { TypificationService } from '../../services/typification.service';
import { PortfolioService } from '../../services/portfolio.service';
import {
  HeaderConfiguration,
  HeaderConfigurationItem,
  DataType,
  LoadType
} from '../../models/header-configuration.model';
import { FieldDefinition } from '../../models/field-definition.model';
import { Tenant } from '../../models/tenant.model';
import { Portfolio } from '../../models/portfolio.model';
import { SubPortfolio } from '../../models/portfolio.model';

@Component({
  selector: 'app-header-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="h-[calc(100dvh-56px)] bg-slate-950 overflow-hidden flex flex-col">
      <div class="flex-1 overflow-y-auto">
        <div class="p-3 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <lucide-angular name="table-2" [size]="16" class="text-white"></lucide-angular>
          </div>
          <div>
            <h1 class="text-lg font-bold text-white">Configuración de Cabeceras</h1>
            <p class="text-xs text-gray-400">Define las cabeceras personalizadas por subcartera</p>
          </div>
        </div>
      </div>

      <!-- Filtros en Cascada -->
      <div class="mb-2">
        <div class="bg-slate-900 rounded-lg p-2 shadow-sm border border-slate-800">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
            <!-- Proveedor -->
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">
                <lucide-angular name="building-2" [size]="16" class="inline mr-1"></lucide-angular>
                Proveedor
              </label>
              <select [(ngModel)]="selectedTenantId"
                      (ngModelChange)="onTenantChange()"
                      class="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option [value]="0">Seleccione un proveedor...</option>
                @for (tenant of tenants(); track tenant.id) {
                  <option [value]="tenant.id">{{ tenant.tenantName }}</option>
                }
              </select>
            </div>

            <!-- Cartera -->
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">
                <lucide-angular name="folder" [size]="16" class="inline mr-1"></lucide-angular>
                Cartera
              </label>
              <select [(ngModel)]="selectedPortfolioId"
                      (ngModelChange)="onPortfolioChange()"
                      [disabled]="selectedTenantId === 0"
                      class="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <option [value]="0">Seleccione una cartera...</option>
                @for (portfolio of portfolios(); track portfolio.id) {
                  <option [value]="portfolio.id">{{ portfolio.portfolioName }}</option>
                }
              </select>
            </div>

            <!-- Subcartera -->
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">
                <lucide-angular name="folder-tree" [size]="16" class="inline mr-1"></lucide-angular>
                Subcartera
              </label>
              <select [(ngModel)]="selectedSubPortfolioId"
                      (ngModelChange)="onSubPortfolioChange()"
                      [disabled]="selectedPortfolioId === 0"
                      class="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <option [value]="0">Seleccione una subcartera...</option>
                @for (subPortfolio of subPortfolios(); track subPortfolio.id) {
                  <option [value]="subPortfolio.id">{{ subPortfolio.subPortfolioName }}</option>
                }
              </select>
            </div>

            <!-- Tipo de Carga -->
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">
                <lucide-angular name="database" [size]="16" class="inline mr-1"></lucide-angular>
                Tipo de Carga
              </label>
              <select [(ngModel)]="selectedLoadType"
                      (ngModelChange)="onLoadTypeChange()"
                      [disabled]="selectedSubPortfolioId === 0"
                      class="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="ACTUALIZACION">Carga Diaria</option>
                <option value="INICIAL">Carga Inicial del Mes</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      @if (selectedSubPortfolioId > 0) {
        <!-- Panel de Acciones -->
        <div class="mb-2">
          <div class="bg-slate-900 rounded-lg shadow-sm border border-slate-800 overflow-hidden">
            <!-- Contenido del Panel -->
            <div class="p-3">
              <!-- Primera fila: Botones principales y contador -->
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <button (click)="openManualDialog()"
                        class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all cursor-pointer">
                  <lucide-angular name="plus" [size]="16"></lucide-angular>
                  <span>Agregar</span>
                </button>

                <!-- Dropdown para descargar plantillas -->
                <div class="relative">
                  <button (click)="toggleDownloadMenu()"
                          #downloadButton
                          class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all cursor-pointer">
                    <lucide-angular name="file-text" [size]="16"></lucide-angular>
                    <span class="hidden sm:inline">Descargar Plantilla</span>
                    <span class="sm:hidden">Plantilla</span>
                    <lucide-angular [name]="downloadMenuOpen() ? 'chevron-up' : 'chevron-down'" [size]="14"></lucide-angular>
                  </button>
                </div>

                <!-- Selector de Separador -->
                <select [(ngModel)]="csvSeparator"
                        class="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                  <option value=";">Separador: Punto y coma (;)</option>
                  <option value=",">Separador: Coma (,)</option>
                  <option value="|">Separador: Pipe (|)</option>
                  <option value="	">Separador: Tabulación (Tab)</option>
                </select>

                <!-- Botón Importar Configuración -->
                <label class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all cursor-pointer">
                  <lucide-angular name="folder-open" [size]="16"></lucide-angular>
                  <span class="hidden sm:inline">Importar CSV/Excel</span>
                  <span class="sm:hidden">Importar</span>
                  <input type="file"
                         accept=".csv,.xlsx,.xls"
                         (change)="onFileSelected($event)"
                         class="hidden">
                </label>

                <!-- Contador de cabeceras -->
                @if (previewHeaders().length > 0) {
                  <div class="ml-auto flex items-center gap-2 px-3 py-1.5">
                    <lucide-angular name="table-2" [size]="14" class="text-indigo-400"></lucide-angular>
                    <span class="text-sm font-semibold text-indigo-400">{{ previewHeaders().length }}</span>
                    <span class="text-xs text-indigo-400">cabecera(s)</span>
                  </div>
                }
              </div>

              <!-- Menú dropdown con posición fixed para evitar overflow hidden del contenedor -->
              @if (downloadMenuOpen()) {
                <div class="fixed inset-0 z-[9998]" (click)="downloadMenuOpen.set(false)"></div>
                <div class="fixed w-56 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-[9999]"
                     [style.top.px]="dropdownPosition().top"
                     [style.left.px]="dropdownPosition().left">
                  <button (click)="downloadCSVTemplate()"
                          class="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors text-left text-gray-300 cursor-pointer">
                    <lucide-angular name="file-text" [size]="16" class="text-gray-400"></lucide-angular>
                    <span class="text-sm font-medium">Descargar CSV</span>
                  </button>
                  <button (click)="downloadExcelTemplate()"
                          class="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors text-left text-gray-300 cursor-pointer">
                    <lucide-angular name="table-2" [size]="16" class="text-green-400"></lucide-angular>
                    <span class="text-sm font-medium">Descargar Excel (.xlsx)</span>
                  </button>
                </div>
              }

              <!-- Segunda fila: Botones de acción cuando hay cabeceras -->
              @if (previewHeaders().length > 0) {
                <div class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-700">
                  <button (click)="clearAll()"
                          class="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-gray-300 rounded-lg text-sm hover:bg-slate-700 hover:text-white transition-all cursor-pointer">
                    <lucide-angular name="trash-2" [size]="14"></lucide-angular>
                    <span>Limpiar</span>
                  </button>

                  <button (click)="confirmConfiguration()"
                          class="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all cursor-pointer">
                    <lucide-angular name="save" [size]="16"></lucide-angular>
                    <span>Guardar</span>
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Tabla de Previsualización -->
        <div>
          <div class="bg-slate-900 rounded-lg shadow-sm border border-slate-800 overflow-hidden">
            @if (previewHeaders().length === 0) {
              <div class="p-6 text-center">
                <div class="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
                  <lucide-angular name="table-2" [size]="24" class="text-gray-600"></lucide-angular>
                </div>
                <p class="text-sm text-gray-400">No hay cabeceras configuradas</p>
              </div>
            } @else {
              <div class="overflow-x-auto max-h-[calc(100dvh-340px)] overflow-y-auto">
                <table class="w-full">
                  <thead class="bg-slate-800 border-b border-slate-700 sticky top-0">
                    <tr>
                      <th class="px-2 py-1.5 text-left text-xs font-semibold text-gray-400">Nombre</th>
                      <th class="px-2 py-1.5 text-left text-xs font-semibold text-gray-400">Tipo</th>
                      <th class="px-2 py-1.5 text-left text-xs font-semibold text-gray-400">Etiqueta</th>
                      <th class="px-2 py-1.5 text-left text-xs font-semibold text-gray-400">Campo Catálogo</th>
                      <th class="px-2 py-1.5 text-left text-xs font-semibold text-gray-400">Formato</th>
                      <th class="px-2 py-1.5 text-center text-xs font-semibold text-gray-400">Req.</th>
                      <th class="px-2 py-1.5 text-left text-xs font-semibold text-gray-400">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800">
                    @for (header of previewHeaders(); track $index) {
                      <tr class="hover:bg-slate-800 transition-colors">
                        <td class="px-2 py-1.5">
                          <span class="font-mono text-xs font-semibold text-indigo-400">{{ header.headerName }}</span>
                        </td>
                        <td class="px-2 py-1.5">
                          <span [class]="getDataTypeBadgeClass(header.dataType)"
                                class="inline-flex px-1.5 py-0.5 rounded text-xs font-medium">
                            {{ header.dataType }}
                          </span>
                        </td>
                        <td class="px-2 py-1.5">
                          <span class="text-xs text-white">{{ header.displayLabel }}</span>
                        </td>
                        <td class="px-2 py-1.5">
                          @if (header.fieldDefinitionId === 0) {
                            <span class="text-xs text-amber-400 italic">Sin asociar</span>
                          } @else {
                            <span class="font-mono text-xs text-gray-400">{{ getFieldCodeById(header.fieldDefinitionId) }}</span>
                          }
                        </td>
                        <td class="px-2 py-1.5">
                          <span class="text-xs text-gray-400">{{ header.format || '-' }}</span>
                        </td>
                        <td class="px-2 py-1.5 text-center">
                          @if (header.required) {
                            <lucide-angular name="check-circle" [size]="14" class="text-green-400 inline"></lucide-angular>
                          } @else {
                            <lucide-angular name="circle" [size]="14" class="text-gray-600 inline"></lucide-angular>
                          }
                        </td>
                        <td class="px-2 py-1.5">
                          <div class="flex items-center gap-1">
                            <button (click)="editPreviewHeader($index)"
                                    class="p-1 text-blue-400 hover:bg-slate-800 rounded transition-colors"
                                    title="Editar">
                              <lucide-angular name="edit" [size]="14"></lucide-angular>
                            </button>
                            <button (click)="removePreviewHeader($index)"
                                    class="p-1 text-red-400 hover:bg-slate-800 rounded transition-colors"
                                    title="Eliminar">
                              <lucide-angular name="trash-2" [size]="14"></lucide-angular>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      }

      <!-- Dialog Agregar/Editar Manual -->
      @if (showManualDialog()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-800">
            <!-- Dialog Header -->
            <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 text-white">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <lucide-angular name="plus-circle" [size]="20"></lucide-angular>
                  </div>
                  <div>
                    <h2 class="text-xl font-bold">{{ editingIndex() !== null ? 'Editar' : 'Agregar' }} Cabecera</h2>
                    <p class="text-indigo-100 text-sm">Complete la información de la cabecera</p>
                  </div>
                </div>
                <button (click)="closeManualDialog()" class="text-white/80 hover:text-white">
                  <lucide-angular name="x" [size]="20"></lucide-angular>
                </button>
              </div>
            </div>

            <!-- Dialog Body -->
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div class="space-y-4">
                <!-- Campo Base de Datos (Dropdown del Catálogo) -->
                <div>
                  <label class="block text-sm font-semibold text-gray-300 mb-2">
                    <lucide-angular name="book-open" [size]="16" class="inline mr-1"></lucide-angular>
                    Campo Base de Datos (Opcional)
                  </label>
                  <select [(ngModel)]="formData.fieldDefinitionId"
                          (ngModelChange)="onFieldDefinitionSelect()"
                          class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option [value]="0">Sin asociar - Campo personalizado</option>
                    @for (field of availableFieldDefinitions(); track field.id) {
                      <option [value]="field.id">
                        {{ field.fieldName }} ({{ field.fieldCode }})
                      </option>
                    }
                  </select>
                  <p class="text-xs text-gray-400 mt-1">
                    Seleccione un campo del catálogo o deje "Sin asociar" para crear un campo personalizado.
                  </p>
                </div>

                <!-- Información del Catálogo (Solo Lectura) -->
                @if (getSelectedFieldDefinition(); as selectedField) {
                  <div class="bg-slate-800/50 rounded-lg p-4 space-y-2 border border-slate-700/50">
                    <p class="text-xs font-semibold text-gray-400 mb-2">📋 Información del Catálogo</p>

                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-400">Tipo de Dato:</span>
                      <span [class]="getDataTypeBadgeClass(selectedField.dataType)"
                            class="inline-flex px-2 py-0.5 rounded text-xs font-medium">
                        {{ selectedField.dataType }}
                      </span>
                    </div>

                    @if (selectedField.description) {
                      <div class="text-xs text-gray-400">
                        <span class="font-semibold">Descripción:</span> {{ selectedField.description }}
                      </div>
                    }

                    @if (selectedField.format) {
                      <div class="text-xs text-gray-400">
                        <span class="font-semibold">Formato del Sistema:</span>
                        <code class="text-cyan-400">{{ selectedField.format }}</code>
                      </div>
                    }
                  </div>
                }

                <!-- Selector de Tipo de Dato (para campos personalizados) -->
                @if (formData.fieldDefinitionId === 0) {
                  <div>
                    <label class="block text-sm font-semibold text-gray-300 mb-2">
                      <lucide-angular name="type" [size]="16" class="inline mr-1"></lucide-angular>
                      Tipo de Dato *
                    </label>
                    <select [(ngModel)]="formData.dataType"
                            class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="TEXTO">TEXTO</option>
                      <option value="NUMERICO">NUMERICO</option>
                      <option value="FECHA">FECHA</option>
                    </select>
                    <p class="text-xs text-gray-400 mt-1">
                      Seleccione el tipo de dato para este campo personalizado.
                    </p>
                  </div>
                }

                <!-- Campo Sistema (Input Texto Libre) -->
                <div>
                  <label class="block text-sm font-semibold text-gray-300 mb-2">
                    <lucide-angular name="settings" [size]="16" class="inline mr-1"></lucide-angular>
                    Campo Sistema *
                  </label>
                  <input type="text"
                         [(ngModel)]="formData.headerName"
                         placeholder="Ej: DNI, Saldo Vencido, Teléfono Principal"
                         class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <p class="text-xs text-gray-400 mt-1">
                    Nombre de la cabecera tal como viene del proveedor.
                  </p>
                </div>

                <!-- Etiqueta Visual (Input Texto) -->
                <div>
                  <label class="block text-sm font-semibold text-gray-300 mb-2">
                    <lucide-angular name="eye" [size]="16" class="inline mr-1"></lucide-angular>
                    Etiqueta Visual *
                  </label>
                  <input type="text"
                         [(ngModel)]="formData.displayLabel"
                         placeholder="Ej: Número de Documento, Saldo Pendiente"
                         class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <p class="text-xs text-gray-400 mt-1">
                    Texto que se mostrará en la interfaz de usuario.
                  </p>
                </div>

                <!-- Formato (Input Texto Opcional) -->
                <div>
                  <label class="block text-sm font-semibold text-gray-300 mb-2">
                    <lucide-angular name="file-text" [size]="16" class="inline mr-1"></lucide-angular>
                    Formato
                  </label>
                  <input type="text"
                         [(ngModel)]="formData.format"
                         placeholder="Ej: dd/MM/yyyy, decimal(18,2)"
                         class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <p class="text-xs text-gray-400 mt-1">
                    Formato específico para esta subcartera (opcional, puede diferir del formato del sistema).
                  </p>
                </div>

                <!-- Obligatorio -->
                <div class="flex items-center gap-3">
                  <input type="checkbox"
                         [(ngModel)]="formData.required"
                         id="required"
                         class="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-700 rounded focus:ring-indigo-500">
                  <label for="required" class="text-sm text-gray-300">
                    Campo obligatorio
                  </label>
                </div>
              </div>
            </div>

            <!-- Dialog Footer -->
            <div class="border-t border-slate-800 p-4 flex justify-end gap-3 bg-slate-950">
              <button (click)="closeManualDialog()"
                      class="px-5 py-2 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
                Cancelar
              </button>
              <button (click)="saveManualHeader()"
                      [disabled]="!canSaveManualHeader()"
                      class="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {{ editingIndex() !== null ? 'Actualizar' : 'Agregar' }}
              </button>
            </div>
          </div>
        </div>
      }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class HeaderConfigurationComponent implements OnInit {
  @ViewChild('downloadButton', { read: ElementRef }) downloadButton?: ElementRef;

  tenants = signal<Tenant[]>([]);
  portfolios = signal<Portfolio[]>([]);
  subPortfolios = signal<SubPortfolio[]>([]);
  fieldDefinitions = signal<FieldDefinition[]>([]);
  previewHeaders = signal<HeaderConfigurationItem[]>([]);
  showManualDialog = signal(false);
  editingIndex = signal<number | null>(null);
  downloadMenuOpen = signal(false);
  dropdownPosition = signal<{ top: number; left: number }>({ top: 120, left: 100 });
  headersAreSaved = signal(false); // Indica si hay cabeceras guardadas en BD

  // Computed signal para mostrar solo campos disponibles (no usados)
  availableFieldDefinitions = computed(() => {
    const usedIds = this.previewHeaders().map(h => h.fieldDefinitionId);
    const currentId = this.formData.fieldDefinitionId;
    const editIdx = this.editingIndex();

    return this.fieldDefinitions().filter(f => {
      // Si estamos editando, permitir el campo actual
      if (editIdx !== null && f.id === currentId) {
        return true;
      }
      // Si no está en uso, mostrar
      return !usedIds.includes(f.id);
    });
  });

  selectedTenantId = 0;
  selectedPortfolioId = 0;
  selectedSubPortfolioId = 0;
  selectedLoadType: LoadType = 'ACTUALIZACION';
  csvSeparator = ';';

  formData = {
    fieldDefinitionId: 0,
    headerName: '',
    dataType: 'TEXTO' as DataType,
    displayLabel: '',
    format: '',
    required: false
  };

  constructor(
    private headerConfigService: HeaderConfigurationService,
    private fieldDefinitionService: FieldDefinitionService,
    private typificationService: TypificationService,
    private portfolioService: PortfolioService
  ) {}

  ngOnInit() {
    this.loadTenants();
    this.loadFieldDefinitions();
  }

  loadFieldDefinitions() {
    this.fieldDefinitionService.getAllActive().subscribe({
      next: (definitions) => {
        this.fieldDefinitions.set(definitions);
      },
      error: (error) => {
        console.error('Error al cargar definiciones de campos:', error);
      }
    });
  }

  loadTenants() {
    this.typificationService.getAllTenants().subscribe({
      next: (tenants) => {
        this.tenants.set(tenants);
      },
      error: (error) => {
        console.error('Error loading tenants:', error);
      }
    });
  }

  onTenantChange() {
    this.selectedPortfolioId = 0;
    this.selectedSubPortfolioId = 0;
    this.portfolios.set([]);
    this.subPortfolios.set([]);
    this.previewHeaders.set([]);

    if (this.selectedTenantId > 0) {
      this.loadPortfolios();
    }
  }

  onPortfolioChange() {
    this.selectedSubPortfolioId = 0;
    this.subPortfolios.set([]);
    this.previewHeaders.set([]);

    if (this.selectedPortfolioId > 0) {
      this.loadSubPortfolios();
    }
  }

  onSubPortfolioChange() {
    this.previewHeaders.set([]);
    this.headersAreSaved.set(false);
    if (this.selectedSubPortfolioId > 0) {
      this.loadExistingHeaders();
    }
  }

  onLoadTypeChange() {
    this.previewHeaders.set([]);
    this.headersAreSaved.set(false);
    if (this.selectedSubPortfolioId > 0) {
      this.loadExistingHeaders();
    }
  }

  loadPortfolios() {
    this.portfolioService.getPortfoliosByTenant(this.selectedTenantId).subscribe({
      next: (portfolios) => {
        this.portfolios.set(portfolios);
      },
      error: (error) => {
        console.error('Error loading portfolios:', error);
      }
    });
  }

  loadSubPortfolios() {
    this.portfolioService.getSubPortfoliosByPortfolio(this.selectedPortfolioId).subscribe({
      next: (subPortfolios) => {
        this.subPortfolios.set(subPortfolios);
      },
      error: (error) => {
        console.error('Error loading subportfolios:', error);
      }
    });
  }

  loadExistingHeaders() {
    this.headerConfigService.getBySubPortfolioAndLoadType(this.selectedSubPortfolioId, this.selectedLoadType).subscribe({
      next: (headers) => {
        const items: HeaderConfigurationItem[] = headers.map(h => ({
          fieldDefinitionId: h.fieldDefinitionId,
          headerName: h.headerName,
          dataType: h.dataType,
          displayLabel: h.displayLabel,
          format: h.format,
          required: h.required
        }));
        this.previewHeaders.set(items);
        this.headersAreSaved.set(headers.length > 0);
      },
      error: (error) => {
        console.error('Error loading headers:', error);
        this.headersAreSaved.set(false);
      }
    });
  }

  openManualDialog() {
    this.editingIndex.set(null);
    this.formData = {
      fieldDefinitionId: 0,
      headerName: '',
      dataType: 'TEXTO',
      displayLabel: '',
      format: '',
      required: false
    };
    this.showManualDialog.set(true);
  }

  onFieldDefinitionSelect() {
    const selectedId = this.formData.fieldDefinitionId;
    if (selectedId === 0) {
      // Si se des-selecciona, solo heredar el tipo de dato como TEXTO
      this.formData.dataType = 'TEXTO';
      return;
    }

    const selectedField = this.fieldDefinitions().find(f => f.id === selectedId);
    if (selectedField) {
      // Heredar solo el tipo de dato del catálogo
      this.formData.dataType = selectedField.dataType;
    }
  }

  getSelectedFieldDefinition() {
    const selectedId = this.formData.fieldDefinitionId;
    if (selectedId === 0) return null;
    return this.fieldDefinitions().find(f => f.id === selectedId);
  }

  closeManualDialog() {
    this.showManualDialog.set(false);
    this.editingIndex.set(null);
  }

  canSaveManualHeader(): boolean {
    // Validar campos básicos
    if (!this.formData.headerName.trim() || !this.formData.displayLabel.trim()) {
      return false;
    }

    // Si no hay campo de BD seleccionado (campo personalizado), debe tener tipo de dato
    if (this.formData.fieldDefinitionId === 0) {
      return !!this.formData.dataType && ['TEXTO', 'NUMERICO', 'FECHA'].includes(this.formData.dataType);
    }

    // Si hay campo de BD seleccionado, está válido
    return true;
  }

  saveManualHeader() {
    if (!this.canSaveManualHeader()) return;

    const newHeader: HeaderConfigurationItem = {
      fieldDefinitionId: this.formData.fieldDefinitionId,
      headerName: this.formData.headerName.trim(),
      dataType: this.formData.dataType,
      displayLabel: this.formData.displayLabel.trim(),
      format: this.formData.format?.trim() || undefined,
      required: this.formData.required
    };

    const currentHeaders = [...this.previewHeaders()];
    const editIdx = this.editingIndex();

    if (editIdx !== null) {
      // Editando
      currentHeaders[editIdx] = newHeader;
    } else {
      // Agregando nuevo
      currentHeaders.push(newHeader);
    }

    this.previewHeaders.set(currentHeaders);
    this.closeManualDialog();
  }

  editPreviewHeader(index: number) {
    const header = this.previewHeaders()[index];
    this.editingIndex.set(index);
    this.formData = {
      fieldDefinitionId: header.fieldDefinitionId,
      headerName: header.headerName,
      dataType: header.dataType,
      displayLabel: header.displayLabel,
      format: header.format || '',
      required: header.required || false
    };
    this.showManualDialog.set(true);
  }

  removePreviewHeader(index: number) {
    const currentHeaders = [...this.previewHeaders()];
    currentHeaders.splice(index, 1);
    this.previewHeaders.set(currentHeaders);
  }

  clearAll() {
    if (confirm('¿Está seguro de limpiar todas las cabeceras? Esta acción no se puede deshacer.')) {
      this.previewHeaders.set([]);
    }
  }

  confirmConfiguration() {
    if (this.previewHeaders().length === 0) {
      alert('No hay cabeceras para confirmar');
      return;
    }

    if (!confirm(`¿Confirmar la configuración de ${this.previewHeaders().length} cabeceras?`)) {
      return;
    }

    const request = {
      subPortfolioId: this.selectedSubPortfolioId,
      loadType: this.selectedLoadType,
      headers: this.previewHeaders()
    };

    // Primero eliminamos las configuraciones existentes
    this.headerConfigService.deleteAllBySubPortfolioAndLoadType(this.selectedSubPortfolioId, this.selectedLoadType).subscribe({
      next: () => {
        // Luego creamos las nuevas
        this.headerConfigService.createBulk(request).subscribe({
          next: () => {
            alert('Configuración guardada exitosamente');
            this.loadExistingHeaders();
          },
          error: (error) => {
            console.error('Error saving configuration:', error);
            alert('Error al guardar la configuración: ' + (error.error?.message || error.message));
          }
        });
      },
      error: (error) => {
        console.error('Error deleting old configuration:', error);
        alert('Error al eliminar configuración anterior');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (isExcel) {
      this.parseExcel(file);
    } else {
      // Asumimos que es CSV
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const csv = e.target.result;
        this.parseCSV(csv);
      };
      reader.readAsText(file);
    }

    event.target.value = ''; // Reset input
  }

  /**
   * Parsea un archivo Excel (.xlsx o .xls)
   */
  parseExcel(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        // Cargar librería XLSX de forma dinámica desde CDN
        if (!(window as any).XLSX) {
          alert('Cargando soporte para Excel... intente nuevamente en unos segundos.');
          this.loadXLSXLibrary().then(() => {
            this.parseExcel(file); // Reintentar después de cargar la librería
          });
          return;
        }

        const XLSX = (window as any).XLSX;
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Leer la primera hoja
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convertir a CSV usando el separador seleccionado
        const csvData = XLSX.utils.sheet_to_csv(worksheet, {
          FS: this.csvSeparator
        });

        this.parseCSV(csvData);
      } catch (error) {
        console.error('Error al procesar Excel:', error);
        alert('Error al procesar el archivo Excel. Verifique que el formato sea correcto.');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  /**
   * Carga la librería XLSX desde CDN si no está disponible
   */
  private loadXLSXLibrary(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).XLSX) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar la librería XLSX'));
      document.head.appendChild(script);
    });
  }

  /**
   * Parsea una línea CSV respetando comillas dobles
   * Los separadores dentro de comillas no se consideran delimitadores
   * Ejemplo: "DECIMAL(10,2)" se mantiene como un solo campo aunque contenga coma
   */
  private parseCsvLine(line: string, separator: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        // Toggle estado de comillas
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        // Si es el separador y no estamos dentro de comillas, guardamos el campo
        result.push(current.trim());
        current = '';
      } else {
        // Cualquier otro carácter se agrega al campo actual
        current += char;
      }
    }

    // Agregar el último campo
    result.push(current.trim());

    // Limpiar comillas dobles al inicio y final de cada campo
    return result.map(field => {
      if (field.startsWith('"') && field.endsWith('"')) {
        return field.slice(1, -1);
      }
      return field;
    });
  }

  parseCSV(csv: string) {
    const lines = csv.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      alert('El archivo CSV está vacío o no tiene datos');
      return;
    }

    const headers: HeaderConfigurationItem[] = [];

    // Saltar la primera línea (cabecera del CSV)
    for (let i = 1; i < lines.length; i++) {
      const columns = this.parseCsvLine(lines[i], this.csvSeparator);

      if (columns.length < 3) continue;

      // Formato: codigoCampo, nombreCabecera, etiquetaVisual, formato (opcional), tipoDato (opcional)
      const [fieldCode, headerName, displayLabel, format, tipoDato] = columns;

      if (!headerName || !displayLabel) continue;

      // Si fieldCode está vacío, es un campo personalizado (no mapeado a BD)
      if (!fieldCode || fieldCode.trim() === '') {
        // Campo personalizado - requiere tipoDato
        if (!tipoDato || !['TEXTO', 'NUMERICO', 'FECHA'].includes(tipoDato.toUpperCase())) {
          alert(`Campo personalizado en línea ${i + 1} requiere un tipo de dato válido (TEXTO, NUMERICO, FECHA)`);
          return;
        }

        headers.push({
          fieldDefinitionId: 0, // Sin asociar a BD
          headerName: headerName.trim(),
          dataType: tipoDato.toUpperCase() as DataType,
          displayLabel: displayLabel.trim(),
          format: format?.trim() || undefined,
          required: false // Campos personalizados no son requeridos por defecto
        });
      } else {
        // Campo asociado a BD - buscar en catálogo
        const fieldDef = this.fieldDefinitions().find(f => f.fieldCode === fieldCode.trim());
        if (!fieldDef) {
          alert(`Código de campo no encontrado en línea ${i + 1}: ${fieldCode}. Revise el catálogo de campos.`);
          return;
        }

        headers.push({
          fieldDefinitionId: fieldDef.id,
          headerName: headerName.trim(),
          dataType: fieldDef.dataType,
          displayLabel: displayLabel.trim(),
          format: format?.trim() || undefined,
          required: true // Campos que mapean a base de datos son requeridos por defecto
        });
      }
    }

    if (headers.length === 0) {
      alert('No se encontraron cabeceras válidas en el archivo CSV');
      return;
    }

    this.previewHeaders.set(headers);
    alert(`Se importaron ${headers.length} cabeceras exitosamente`);
  }

  toggleDownloadMenu() {
    this.downloadMenuOpen.update(v => !v);

    if (this.downloadMenuOpen() && this.downloadButton) {
      const rect = this.downloadButton.nativeElement.getBoundingClientRect();
      this.dropdownPosition.set({
        top: rect.bottom + 8,
        left: rect.left
      });
    }
  }

  /**
   * Escapa un valor para CSV: si contiene el separador, comillas o saltos de línea,
   * lo envuelve en comillas dobles y escapa las comillas internas
   */
  private escapeCsvValue(value: string, separator: string): string {
    if (!value) return '';

    // Si el valor contiene el separador, comillas o saltos de línea, debe estar entre comillas
    if (value.includes(separator) || value.includes('"') || value.includes('\n') || value.includes('\r')) {
      // Escapar comillas dobles duplicándolas
      const escaped = value.replace(/"/g, '""');
      return `"${escaped}"`;
    }

    return value;
  }

  /**
   * Crea una fila CSV escapando correctamente los valores
   */
  private createCsvRow(values: string[], separator: string): string {
    return values.map(v => this.escapeCsvValue(v, separator)).join(separator);
  }

  downloadCSVTemplate() {
    this.downloadMenuOpen.set(false);

    // Crear el contenido del CSV con el separador seleccionado
    const sep = this.csvSeparator;

    // Crear las filas usando el método helper que escapa correctamente
    const rows = [
      ['codigoCampo', 'nombreCabecera', 'etiquetaVisual', 'formato', 'tipoDato'],
      ['documento', 'DNI', 'Número de Documento', '', ''],
      ['nombre_completo', 'NOMBRE', 'Nombre del Cliente', '', ''],
      ['telefono_principal', 'TELEFONO', 'Teléfono Principal', '', ''],
      ['email', 'CORREO', 'Correo Electrónico', '', ''],
      ['direccion', 'DIRECCION', 'Dirección Completa', '', ''],
      ['distrito', 'DISTRITO', 'Distrito', '', ''],
      ['provincia', 'PROVINCIA', 'Provincia', '', ''],
      ['numero_contrato', 'NRO_CONTRATO', 'Número de Contrato', '', ''],
      ['tipo_producto', 'PRODUCTO', 'Tipo de Producto', '', ''],
      ['estado_cuenta', 'ESTADO', 'Estado de Cuenta', '', ''],
      ['monto_capital', 'MONTO_CAPITAL', 'Monto Capital (S/.)', 'decimal(18,2)', ''],
      ['monto_interes', 'INTERES', 'Interés (S/.)', 'decimal(18,2)', ''],
      ['saldo_pendiente', 'SALDO', 'Saldo Pendiente (S/.)', 'decimal(18,2)', ''],
      ['monto_mora', 'MORA', 'Monto Mora (S/.)', 'decimal(18,2)', ''],
      ['dias_mora', 'DIAS_MORA', 'Días de Mora', '', ''],
      ['monto_minimo_pagar', 'PAGO_MINIMO', 'Monto Mínimo a Pagar (S/.)', 'decimal(18,2)', ''],
      ['fecha_vencimiento', 'FEC_VENC', 'Fecha de Vencimiento', 'dd/MM/yyyy', ''],
      ['fecha_desembolso', 'FEC_DESEMB', 'Fecha de Desembolso', 'dd/MM/yyyy', ''],
      ['fecha_proximo_vencimiento', 'FEC_PROX_VENC', 'Fecha Próximo Vencimiento', 'dd/MM/yyyy', ''],
      ['fecha_corte', 'FEC_CORTE', 'Fecha de Corte', 'dd/MM/yyyy', ''],
      ['', 'CAMPO_PERSONALIZADO', 'Ejemplo Campo Extra', '', 'TEXTO']
    ];

    const csvContent = rows.map(row => this.createCsvRow(row, sep)).join('\n');

    // Crear el blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const separatorName = this.csvSeparator === ',' ? 'coma' :
                         this.csvSeparator === ';' ? 'punto-coma' :
                         this.csvSeparator === '|' ? 'pipe' : 'tab';

    link.setAttribute('href', url);
    link.setAttribute('download', `header-configuration-template-${separatorName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('Modelo CSV descargado exitosamente');
  }

  async downloadExcelTemplate() {
    this.downloadMenuOpen.set(false);

    // Cargar librería XLSX si no está disponible
    if (!(window as any).XLSX) {
      try {
        await this.loadXLSXLibrary();
      } catch (error) {
        alert('No se pudo cargar el soporte para Excel. Intente de nuevo.');
        return;
      }
    }

    const XLSX = (window as any).XLSX;

    // Datos de ejemplo para la plantilla
    const data = [
      ['codigoCampo', 'nombreCabecera', 'etiquetaVisual', 'formato', 'tipoDato'],
      ['documento', 'DNI', 'Número de Documento', '', ''],
      ['nombre_completo', 'NOMBRE', 'Nombre del Cliente', '', ''],
      ['telefono_principal', 'TELEFONO', 'Teléfono Principal', '', ''],
      ['email', 'CORREO', 'Correo Electrónico', '', ''],
      ['direccion', 'DIRECCION', 'Dirección Completa', '', ''],
      ['distrito', 'DISTRITO', 'Distrito', '', ''],
      ['provincia', 'PROVINCIA', 'Provincia', '', ''],
      ['numero_contrato', 'NRO_CONTRATO', 'Número de Contrato', '', ''],
      ['tipo_producto', 'PRODUCTO', 'Tipo de Producto', '', ''],
      ['estado_cuenta', 'ESTADO', 'Estado de Cuenta', '', ''],
      ['monto_capital', 'MONTO_CAPITAL', 'Monto Capital (S/.)', 'decimal(18,2)', ''],
      ['monto_interes', 'INTERES', 'Interés (S/.)', 'decimal(18,2)', ''],
      ['saldo_pendiente', 'SALDO', 'Saldo Pendiente (S/.)', 'decimal(18,2)', ''],
      ['monto_mora', 'MORA', 'Monto Mora (S/.)', 'decimal(18,2)', ''],
      ['dias_mora', 'DIAS_MORA', 'Días de Mora', '', ''],
      ['monto_minimo_pagar', 'PAGO_MINIMO', 'Monto Mínimo a Pagar (S/.)', 'decimal(18,2)', ''],
      ['fecha_vencimiento', 'FEC_VENC', 'Fecha de Vencimiento', 'dd/MM/yyyy', ''],
      ['fecha_desembolso', 'FEC_DESEMB', 'Fecha de Desembolso', 'dd/MM/yyyy', ''],
      ['fecha_proximo_vencimiento', 'FEC_PROX_VENC', 'Fecha Próximo Vencimiento', 'dd/MM/yyyy', ''],
      ['fecha_corte', 'FEC_CORTE', 'Fecha de Corte', 'dd/MM/yyyy', ''],
      ['', 'CAMPO_PERSONALIZADO', 'Ejemplo Campo Extra', '', 'TEXTO']
    ];

    // Crear workbook y worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Aplicar anchos de columna para mejor formato
    ws['!cols'] = [
      { wch: 25 }, // codigoCampo
      { wch: 20 }, // nombreCabecera
      { wch: 30 }, // etiquetaVisual
      { wch: 20 }, // formato
      { wch: 15 }  // tipoDato
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Configuración Cabeceras');

    // Descargar el archivo
    XLSX.writeFile(wb, 'header-configuration-template.xlsx');

    alert('Modelo Excel descargado exitosamente');
  }

  getDataTypeBadgeClass(dataType: DataType): string {
    switch (dataType) {
      case 'TEXTO':
        return 'bg-blue-900/30 text-blue-400';
      case 'NUMERICO':
        return 'bg-emerald-900/30 text-emerald-400';
      case 'FECHA':
        return 'bg-amber-900/30 text-amber-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  }

  getFieldCodeById(fieldDefinitionId: number): string {
    const field = this.fieldDefinitions().find(f => f.id === fieldDefinitionId);
    return field ? field.fieldCode : '-';
  }
}
