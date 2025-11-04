import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { HeaderConfigurationService } from '../../../maintenance/services/header-configuration.service';
import { PortfolioService } from '../../../maintenance/services/portfolio.service';
import { TenantService } from '../../../maintenance/services/tenant.service';
import { ImportConfigService } from '../../services/import-config.service';
import { HeaderConfiguration } from '../../../maintenance/models/header-configuration.model';
import { SubPortfolio, Portfolio } from '../../../maintenance/models/portfolio.model';
import { Tenant } from '../../../maintenance/models/tenant.model';
import { FolderBrowserModalComponent } from '../folder-browser-modal/folder-browser-modal.component';

@Component({
  selector: 'app-daily-load',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, FolderBrowserModalComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 bg-green-600 rounded-lg">
              <lucide-angular name="folder-tree" [size]="24" class="text-white"></lucide-angular>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-white">Carga Diaria</h1>
              <p class="text-gray-400 text-sm mt-1">Actualización diaria de datos</p>
            </div>
          </div>
        </div>

        <!-- Selectores en Cascada -->
        <div class="bg-slate-900 rounded-lg p-3 shadow-sm border border-slate-800 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <!-- Proveedor -->
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1.5">
                <lucide-angular name="building-2" [size]="16" class="inline mr-1"></lucide-angular>
                Proveedor
              </label>
              <select [(ngModel)]="selectedTenantId"
                      (ngModelChange)="onTenantChange($event)"
                      class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option [value]="0">Seleccione un proveedor...</option>
                @for (tenant of tenants(); track tenant.id) {
                  <option [value]="tenant.id">{{ tenant.tenantCode }} - {{ tenant.tenantName }}</option>
                }
              </select>
            </div>

            <!-- Cartera -->
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1.5">
                <lucide-angular name="folder" [size]="16" class="inline mr-1"></lucide-angular>
                Cartera
              </label>
              <select [(ngModel)]="selectedPortfolioId"
                      (ngModelChange)="onPortfolioChange($event)"
                      [disabled]="selectedTenantId === 0"
                      class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <option [value]="0">Seleccione una cartera...</option>
                @for (portfolio of portfolios(); track portfolio.id) {
                  <option [value]="portfolio.id">{{ portfolio.portfolioCode }} - {{ portfolio.portfolioName }}</option>
                }
              </select>
            </div>

            <!-- Subcartera -->
            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1.5">
                <lucide-angular name="folder-tree" [size]="16" class="inline mr-1"></lucide-angular>
                Subcartera
              </label>
              <select [(ngModel)]="selectedSubPortfolioId"
                      (ngModelChange)="onSubPortfolioChange($event)"
                      [disabled]="selectedPortfolioId === 0"
                      class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <option [value]="0">Seleccione una subcartera...</option>
                @for (sp of subPortfolios(); track sp.id) {
                  <option [value]="sp.id">{{ sp.subPortfolioCode }} - {{ sp.subPortfolioName }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        @if (selectedSubPortfolioId > 0 && headersAreSaved()) {

          <!-- Sección de Automatización de Cargas -->
          <div class="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4">
            <!-- Encabezado Maestro -->
            <button (click)="showAutoImportSection = !showAutoImportSection"
                    class="w-full flex items-center justify-between text-left">
              <div class="flex items-center gap-2">
                <lucide-angular [name]="showAutoImportSection ? 'chevron-down' : 'chevron-right'"
                                [size]="18"
                                class="text-purple-400">
                </lucide-angular>
                <lucide-angular name="zap" [size]="18" class="text-purple-400"></lucide-angular>
                <h3 class="text-base font-bold text-white">Automatización de Cargas</h3>
                @if (autoImportConfig.active) {
                  <span class="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded animate-pulse">
                    Activo
                  </span>
                } @else {
                  <span class="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">
                    Inactivo
                  </span>
                }
                @if (autoImportHistory().length > 0) {
                  <span class="text-xs px-2 py-0.5 bg-slate-700 text-gray-300 rounded">
                    {{ autoImportHistory().length }} cargas
                  </span>
                }
              </div>
              <span class="text-xs text-gray-400">{{ showAutoImportSection ? 'Ocultar' : 'Mostrar' }}</span>
            </button>

            <!-- Grid de 2 columnas: Configuración Automática + Historial -->
            @if (showAutoImportSection) {
              <div class="mt-4 pt-4 border-t border-slate-700">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

                  <!-- Configuración Automática -->
                  <div class="bg-slate-900/50 border border-slate-600 rounded-lg p-4 h-full">
                <!-- Título de la sección -->
                <div class="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
                  <lucide-angular name="settings" [size]="16" class="text-blue-400"></lucide-angular>
                  <h4 class="text-sm font-bold text-white">Configuración</h4>
                  <span class="text-xs px-2 py-0.5 rounded"
                        [class]="autoImportConfig.active ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'">
                    {{ autoImportConfig.active ? 'Activa' : 'Inactiva' }}
                  </span>
                </div>

                <!-- Contenido de configuración -->
                <div class="space-y-3">
                  <p class="text-xs text-gray-400">
                    Configura el sistema para procesar automáticamente archivos que coincidan con un patrón
                  </p>

                <div class="grid grid-cols-2 gap-3">
                  <!-- Patrón de archivo -->
                  <div>
                    <label class="block text-xs font-semibold text-gray-300 mb-1">
                      Patrón de archivo
                    </label>
                    <input type="text"
                           [(ngModel)]="autoImportConfig.filePattern"
                           placeholder="Ej: Cartera_CONTACTO_TOTAL"
                           class="w-full px-2 py-1.5 bg-slate-900 border border-slate-600 rounded text-white text-xs placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <p class="text-xs text-gray-500 mt-0.5">Archivos que contengan este texto</p>
                  </div>

                  <!-- Hora Programada -->
                  <div>
                    <label class="block text-xs font-semibold text-gray-300 mb-1">
                      Hora de carga diaria
                    </label>
                    <input type="time"
                           [(ngModel)]="scheduledTimeInput"
                           class="w-full px-2 py-1.5 bg-slate-900 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <p class="text-xs text-gray-500 mt-0.5">Hora exacta para ejecutar (ej: 02:00)</p>
                  </div>
                </div>

                <!-- Directorio -->
                <div>
                  <label class="block text-xs font-semibold text-gray-300 mb-1">
                    Carpeta a monitorear
                  </label>
                  <div class="flex gap-2">
                    <input type="text"
                           [(ngModel)]="autoImportConfig.watchDirectory"
                           placeholder="Ej: G:\\Mi unidad\\Cashi\\Cargas Diarias"
                           class="flex-1 px-2 py-1.5 bg-slate-900 border border-slate-600 rounded text-white text-xs placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <button (click)="showFolderBrowser.set(true)"
                            class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors">
                      <lucide-angular name="folder-search" [size]="12"></lucide-angular>
                      Explorar
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 mt-0.5">Explora las carpetas del servidor o escribe la ruta manualmente</p>
                </div>

                <!-- Archivo a procesar -->
                @if (autoImportConfig.watchDirectory && autoImportConfig.filePattern) {
                  <div class="p-2 bg-slate-900/50 border border-slate-600 rounded">
                    <div class="flex items-center justify-between">
                      <p class="text-xs font-semibold text-gray-300">Próximo archivo:</p>
                      <button (click)="scanFolder()"
                              class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs flex items-center gap-1 transition-colors">
                        <lucide-angular name="search" [size]="10"></lucide-angular>
                        Buscar
                      </button>
                    </div>

                    @if (scanningFolder()) {
                      <div class="flex items-center gap-2 mt-2 p-2 bg-slate-800 rounded">
                        <div class="animate-spin w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <span class="text-xs text-gray-400">Buscando...</span>
                      </div>
                    } @else if (foundFiles().length > 0) {
                      <div class="mt-2 space-y-1.5 max-h-60 overflow-y-auto pr-1">
                        @for (file of foundFiles(); track file.name) {
                          <div class="flex items-center justify-between p-2 rounded"
                               [class]="file.processed ? 'bg-gray-900/30 border border-gray-700/40' : 'bg-blue-900/20 border border-blue-700/50'">
                            <div class="flex items-center gap-2 flex-1 min-w-0">
                              <lucide-angular [name]="file.processed ? 'check-circle' : 'file-text'"
                                              [size]="12"
                                              [class]="file.processed ? 'text-gray-400' : 'text-blue-400'"
                                              class="flex-shrink-0">
                              </lucide-angular>
                              <span class="text-xs font-semibold truncate"
                                    [class]="file.processed ? 'text-gray-400' : 'text-white'">
                                {{ file.name }}
                              </span>
                              @if (!file.processed) {
                                <span class="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">PRÓXIMO</span>
                              } @else {
                                <span class="px-1.5 py-0.5 bg-gray-600 text-gray-300 text-[10px] font-bold rounded">PROCESADO</span>
                              }
                            </div>
                            <span class="text-xs ml-2"
                                  [class]="file.processed ? 'text-gray-500' : 'text-gray-400'">
                              {{ file.size }}
                            </span>
                          </div>
                        }
                      </div>
                    } @else {
                      <p class="text-xs text-gray-500 mt-2">Click "Buscar" para verificar</p>
                    }
                  </div>
                }

                <!-- Botones -->
                <div class="flex items-center justify-between pt-2">
                  <div class="flex items-center gap-2">
                    <input type="checkbox"
                           [(ngModel)]="autoImportConfig.active"
                           id="autoActive"
                           class="w-3.5 h-3.5 text-blue-600 bg-slate-900 border-slate-600 rounded focus:ring-blue-500">
                    <label for="autoActive" class="text-xs text-gray-300 cursor-pointer">
                      Activar procesamiento automático
                    </label>
                  </div>
                  <div class="flex gap-2">
                    <button (click)="triggerManualImport()"
                            [disabled]="!autoImportConfig.watchDirectory || !autoImportConfig.filePattern"
                            class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                      <lucide-angular name="play" [size]="12"></lucide-angular>
                      Importar Ahora
                    </button>
                    <button (click)="saveAutoConfig()"
                            class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors">
                      Guardar
                    </button>
                  </div>
                </div>
                </div>
                  </div>

                  <!-- Historial de Cargas Automáticas -->
                  @if (autoImportConfig.active || autoImportHistory().length > 0) {
                    <div class="bg-slate-900/50 border border-slate-600 rounded-lg p-4 h-full">
                      <!-- Título de la sección -->
                      <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                        <div class="flex items-center gap-2">
                          <lucide-angular name="history" [size]="16" class="text-green-400"></lucide-angular>
                          <h4 class="text-sm font-bold text-white">Historial</h4>
                          @if (autoImportHistory().length > 0) {
                            <span class="text-xs px-2 py-0.5 bg-slate-700 text-gray-300 rounded">
                              {{ autoImportHistory().length }}
                            </span>
                          }
                          @if (autoImportConfig.active) {
                            <span class="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded animate-pulse">
                              Monitoreando
                            </span>
                          }
                        </div>
                        <button (click)="refreshHistory()"
                                class="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs flex items-center gap-1 transition-colors">
                          <lucide-angular name="refresh-cw" [size]="12"></lucide-angular>
                          Actualizar
                        </button>
                      </div>

                      <!-- Contenido del historial -->
                      <div>
                        @if (autoImportHistory().length === 0) {
                          <div class="text-center py-6 text-gray-500">
                            <lucide-angular name="inbox" [size]="24" class="mx-auto mb-2 text-gray-600"></lucide-angular>
                            <p class="text-xs">No hay cargas automáticas registradas aún</p>
                            @if (autoImportConfig.active) {
                              <p class="text-xs mt-1">El sistema está monitoreando la carpeta configurada</p>
                            }
                          </div>
                        } @else {
                          <div class="space-y-2 max-h-96 overflow-y-auto pr-2">
                            @for (item of autoImportHistory(); track item.id) {
                              <div [class]="item.status === 'EXITOSO' || item.status === 'EXITOSO_CON_ERRORES' ? 'bg-green-900/10 border-green-700/30' : 'bg-red-900/10 border-red-700/30'"
                                   class="border rounded-lg p-3">
                                <div class="flex items-start gap-2">
                                  <lucide-angular [name]="item.status === 'EXITOSO' || item.status === 'EXITOSO_CON_ERRORES' ? 'check-circle' : 'x-circle'"
                                                  [size]="14"
                                                  [class]="item.status === 'EXITOSO' || item.status === 'EXITOSO_CON_ERRORES' ? 'text-green-400' : 'text-red-400'"
                                                  class="flex-shrink-0 mt-0.5">
                                  </lucide-angular>
                                  <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between gap-2">
                                      <span class="text-xs font-semibold text-white truncate">{{ item.fileName }}</span>
                                      <span class="text-xs text-gray-400 whitespace-nowrap">{{ formatHistoryDate(item.processedAt) }}</span>
                                    </div>
                                    @if (item.status === 'EXITOSO') {
                                      <p class="text-xs text-green-400 mt-1">
                                        ✅ {{ item.recordsProcessed }} registros importados exitosamente
                                      </p>
                                    } @else if (item.status === 'EXITOSO_CON_ERRORES') {
                                      <p class="text-xs text-yellow-400 mt-1">
                                        ⚠️ {{ item.recordsProcessed }} registros importados con errores
                                      </p>
                                    } @else {
                                      <p class="text-xs text-red-400 mt-1">
                                        ❌ {{ item.errorMessage }}
                                      </p>
                                    }
                                    <p class="text-xs text-gray-500 mt-0.5 truncate" [title]="item.filePath">
                                      📁 {{ item.filePath }}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  }

                </div>
                <!-- Fin del Grid de 2 columnas -->
              </div>
            }
          </div>

          <!-- Área de carga de datos -->
          <div class="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <!-- Header y Botones de acción -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 class="text-xl font-bold text-white">Importación Manual</h2>
                <p class="text-gray-400 text-sm mt-1">
                  Sube un archivo Excel con los datos para esta subcartera
                </p>
              </div>
              <div class="flex flex-col sm:flex-row gap-2">
                <button
                  (click)="downloadDataTemplate()"
                  class="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium text-sm cursor-pointer">
                  <lucide-angular name="file-text" [size]="16"></lucide-angular>
                  <span>Descargar Plantilla</span>
                </button>

                <label class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium cursor-pointer text-sm">
                  <lucide-angular name="folder-open" [size]="16"></lucide-angular>
                  <span>Importar Datos</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    (change)="onDataFileSelected($event)"
                    class="hidden">
                </label>
              </div>
            </div>

            <!-- Tabla de previsualización estilo MySQL Workbench -->
            <div class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
              <div class="px-4 py-2 bg-slate-800 border-b border-slate-700">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <lucide-angular name="table" [size]="16" class="text-green-400"></lucide-angular>
                    <span class="text-sm font-semibold text-gray-300">
                      Tabla de Datos
                    </span>
                  </div>
                  @if (importedData().length > 0) {
                    <div class="flex items-center gap-4">
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500">Total:</span>
                        <span class="text-xs font-bold text-white">{{ importedData().length }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <lucide-angular name="check-circle" [size]="12" class="text-green-400"></lucide-angular>
                        <span class="text-xs font-bold text-green-400">{{ validData().length }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <lucide-angular name="x-circle" [size]="12" class="text-red-400"></lucide-angular>
                        <span class="text-xs font-bold text-red-400">{{ invalidData().length }}</span>
                      </div>
                    </div>
                  } @else {
                    <span class="text-xs text-gray-500">{{ previewHeaders().length }} columnas</span>
                  }
                </div>
              </div>
              <div class="overflow-auto" style="max-height: 500px;">
                <table class="w-full text-xs border-collapse">
                  <thead class="bg-slate-800 sticky top-0 z-10">
                    <tr>
                      <th class="px-3 py-2 text-left font-semibold text-gray-300 border-r border-slate-700 bg-slate-800" style="min-width: 50px;">#</th>
                      @if (importedData().length > 0) {
                        <th class="px-3 py-2 text-left font-semibold text-gray-300 border-r border-slate-700 bg-slate-800" style="min-width: 80px;">Estado</th>
                      }
                      @for (header of previewHeaders(); track header.id) {
                        <th class="px-3 py-2 text-left font-semibold text-gray-300 border-r border-slate-700 bg-slate-800"
                            style="min-width: 150px;"
                            [title]="header.dataType + (header.format ? ' (' + header.format + ')' : '')">
                          <div class="flex items-center gap-1.5">
                            @if (header.sourceField && header.regexPattern) {
                              <lucide-angular
                                name="sparkles"
                                [size]="12"
                                class="text-amber-400 flex-shrink-0"
                                [title]="'Campo transformado desde: ' + header.sourceField">
                              </lucide-angular>
                            }
                            <div class="flex flex-col gap-0.5">
                              <span class="font-semibold">{{ header.headerName }}</span>
                              <span class="text-[10px] text-green-400 font-normal">{{ header.dataType }}{{ header.format ? ' (' + header.format + ')' : '' }}</span>
                            </div>
                          </div>
                        </th>
                      }
                    </tr>
                  </thead>
                  <tbody>
                    @if (importedData().length === 0) {
                      <!-- Fila vacía cuando no hay datos -->
                      <tr class="border-b border-slate-700">
                        <td class="px-3 py-8 text-center text-gray-500 bg-slate-800/30" [attr.colspan]="previewHeaders().length + 1">
                          <div class="flex flex-col items-center gap-2">
                            <lucide-angular name="inbox" [size]="24" class="text-gray-600"></lucide-angular>
                            <span class="text-sm">No hay datos. Importa un archivo Excel para ver los datos aquí.</span>
                          </div>
                        </td>
                      </tr>
                    } @else {
                      <!-- Datos válidos -->
                      @for (row of validData(); track $index; let i = $index) {
                        <tr class="border-b border-slate-700 hover:bg-slate-800/50">
                          <td class="px-3 py-2 text-gray-400 border-r border-slate-700 bg-slate-800/30">{{ i + 1 }}</td>
                          <td class="px-3 py-2 border-r border-slate-700">
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-[10px]">
                              <lucide-angular name="check" [size]="10"></lucide-angular>
                              Válido
                            </span>
                          </td>
                          @for (header of previewHeaders(); track header.id) {
                            <td class="px-3 py-2 text-gray-300 border-r border-slate-700"
                                [class.text-gray-500]="!row[header.headerName]">
                              {{ row[header.headerName] || 'NULL' }}
                            </td>
                          }
                        </tr>
                      }
                      <!-- Datos inválidos -->
                      @for (row of invalidData(); track $index; let i = $index) {
                        <tr class="border-b border-slate-700 hover:bg-slate-800/50 bg-red-900/10">
                          <td class="px-3 py-2 text-gray-400 border-r border-slate-700 bg-slate-800/30">{{ validData().length + i + 1 }}</td>
                          <td class="px-3 py-2 border-r border-slate-700">
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-red-900/30 text-red-400 rounded text-[10px]"
                                  [title]="row.error">
                              <lucide-angular name="x" [size]="10"></lucide-angular>
                              Error
                            </span>
                          </td>
                          @for (header of previewHeaders(); track header.id) {
                            <td class="px-3 py-2 text-gray-300 border-r border-slate-700"
                                [class.text-gray-500]="!row.data[header.headerName]">
                              {{ row.data[header.headerName] || 'NULL' }}
                            </td>
                          }
                        </tr>
                      }
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Mensaje de error para datos inválidos y botones de acción -->
            @if (importedData().length > 0) {
              <div class="space-y-4 mt-4">
                <!-- Error Display Section - Backend Errors -->
                @if (backendErrors().length > 0) {
                  <div class="bg-red-900/30 border-2 border-red-700 rounded-xl p-4">
                    <div class="flex items-start gap-3">
                      <lucide-angular name="x-circle" [size]="24" class="text-red-500 flex-shrink-0 mt-1"></lucide-angular>
                      <div class="flex-1">
                        <h3 class="text-red-500 font-bold text-lg mb-2">Errores al Importar Datos</h3>
                        <p class="text-red-300 text-sm mb-3">
                          La importación falló debido a los siguientes errores. No se insertó ningún dato.
                        </p>
                        <div class="bg-red-950/50 rounded-lg p-3 max-h-60 overflow-y-auto">
                          @for (error of backendErrors(); track $index) {
                            <div class="text-red-200 text-xs font-mono mb-2 pb-2 border-b border-red-800/50 last:border-0">
                              {{ error }}
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }

                @if (invalidData().length > 0) {
                  <div class="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                      <lucide-angular name="alert-circle" [size]="20" class="text-red-400 mt-0.5"></lucide-angular>
                      <div class="flex-1">
                        <h3 class="text-red-400 font-semibold mb-2">Registros con Errores</h3>
                        <div class="space-y-1">
                          @for (row of invalidData(); track $index; let i = $index) {
                            <p class="text-sm text-gray-400">
                              <span class="text-red-400">Fila {{ validData().length + i + 1 }}:</span> {{ row.error }}
                            </p>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- Botones de acción -->
                <div class="flex justify-between items-center">
                  <div class="text-sm text-gray-400">
                    @if (backendErrors().length > 0) {
                      <span class="text-red-400">La importación falló. Corrija los errores e intente nuevamente.</span>
                    } @else if (validData().length > 0) {
                      <span class="text-green-400">{{ validData().length }} registro(s)</span> listo(s) para importar
                    } @else {
                      <span class="text-red-400">No hay registros válidos para importar</span>
                    }
                  </div>
                  <div class="flex gap-3">
                    <button
                      (click)="clearImportedData()"
                      class="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all font-medium text-sm">
                      Cancelar
                    </button>
                    @if (validData().length > 0 && backendErrors().length === 0) {
                      <button
                        (click)="confirmImport()"
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium text-sm">
                        Confirmar Importación
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        } @else if (selectedSubPortfolioId > 0 && !headersAreSaved()) {
          <!-- Mensaje de advertencia -->
          <div class="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
            <div class="flex items-start gap-3">
              <lucide-angular name="alert-circle" [size]="20" class="text-yellow-500 mt-0.5"></lucide-angular>
              <div>
                <h3 class="text-yellow-500 font-semibold mb-1">No hay cabeceras configuradas</h3>
                <p class="text-gray-400 text-sm">
                  Primero debes configurar las cabeceras para esta subcartera en el módulo de Mantenimiento.
                </p>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Folder Browser Modal -->
      @if (showFolderBrowser()) {
        <app-folder-browser-modal
          (folderSelected)="onFolderSelected($event)"
          (closed)="showFolderBrowser.set(false)">
        </app-folder-browser-modal>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DailyLoadComponent implements OnInit {
  tenants = signal<Tenant[]>([]);
  portfolios = signal<Portfolio[]>([]);
  subPortfolios = signal<SubPortfolio[]>([]);

  selectedTenantId = 0;
  selectedPortfolioId = 0;
  selectedSubPortfolioId = 0;

  previewHeaders = signal<HeaderConfiguration[]>([]);
  headersAreSaved = signal(false);

  importedData = signal<any[]>([]);
  validData = signal<any[]>([]);
  invalidData = signal<{error: string, data: any}[]>([]);
  backendErrors = signal<string[]>([]);

  // Auto import section (controls both config and history)
  showAutoImportSection = false;
  autoImportConfig = {
    watchDirectory: '',
    filePattern: '',
    active: false
  };
  scheduledTimeInput = '02:00'; // Input de hora en formato HH:mm

  autoImportHistory = signal<{
    id: number;
    fileName: string;
    filePath: string;
    processedAt: string;
    status: 'EXITOSO' | 'EXITOSO_CON_ERRORES' | 'ERROR';
    recordsProcessed: number;
    errorMessage?: string;
  }[]>([]);

  scanningFolder = signal(false);
  foundFiles = signal<{ name: string; size: string; modifiedDate: Date; processed: boolean }[]>([]);
  showFolderBrowser = signal(false);

  constructor(
    private tenantService: TenantService,
    private portfolioService: PortfolioService,
    private headerConfigService: HeaderConfigurationService,
    private importConfigService: ImportConfigService
  ) {}

  ngOnInit() {
    this.loadTenants();
    this.loadAutoConfig();
  }

  loadTenants() {
    this.tenantService.getAllTenants().subscribe({
      next: (data) => {
        this.tenants.set(data);
      },
      error: (error) => {
        console.error('Error cargando proveedores:', error);
        alert('Error al cargar los proveedores');
      }
    });
  }

  onTenantChange(tenantId: number) {
    this.selectedTenantId = tenantId;
    this.selectedPortfolioId = 0;
    this.selectedSubPortfolioId = 0;
    this.portfolios.set([]);
    this.subPortfolios.set([]);
    this.previewHeaders.set([]);
    this.headersAreSaved.set(false);

    if (tenantId > 0) {
      this.loadPortfoliosByTenant(tenantId);
    }
  }

  loadPortfoliosByTenant(tenantId: number) {
    this.portfolioService.getPortfoliosByTenant(tenantId).subscribe({
      next: (data) => {
        this.portfolios.set(data);
      },
      error: (error) => {
        console.error('Error cargando carteras:', error);
        alert('Error al cargar las carteras');
      }
    });
  }

  onPortfolioChange(portfolioId: number) {
    this.selectedPortfolioId = portfolioId;
    this.selectedSubPortfolioId = 0;
    this.subPortfolios.set([]);
    this.previewHeaders.set([]);
    this.headersAreSaved.set(false);

    if (portfolioId > 0) {
      this.loadSubPortfoliosByPortfolio(portfolioId);
    }
  }

  loadSubPortfoliosByPortfolio(portfolioId: number) {
    this.portfolioService.getSubPortfoliosByPortfolio(portfolioId).subscribe({
      next: (data) => {
        this.subPortfolios.set(data);
      },
      error: (error) => {
        console.error('Error cargando subcarteras:', error);
        alert('Error al cargar las subcarteras');
      }
    });
  }

  onSubPortfolioChange(subPortfolioId: number) {
    if (subPortfolioId > 0) {
      this.loadHeadersForSubPortfolio(subPortfolioId);
    } else {
      this.previewHeaders.set([]);
      this.headersAreSaved.set(false);
    }
  }

  loadHeadersForSubPortfolio(subPortfolioId: number) {
    // Daily load usa ACTUALIZACION
    this.headerConfigService.getBySubPortfolioAndLoadType(subPortfolioId, 'ACTUALIZACION').subscribe({
      next: (headers) => {
        this.previewHeaders.set(headers);
        this.headersAreSaved.set(headers.length > 0);
      },
      error: (error) => {
        console.error('Error cargando cabeceras:', error);
        this.previewHeaders.set([]);
        this.headersAreSaved.set(false);
      }
    });
  }

  async downloadDataTemplate() {
    if (this.previewHeaders().length === 0) {
      alert('No hay cabeceras configuradas para generar la plantilla de datos');
      return;
    }

    const XLSX = (window as any).XLSX;
    const headers = this.previewHeaders().map(h => h.headerName);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 2, 15) }));
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    const subPortfolio = this.subPortfolios().find(sp => sp.id === this.selectedSubPortfolioId);
    const fileName = `plantilla-datos-${subPortfolio?.subPortfolioCode || 'subcartera'}.xlsx`;
    XLSX.writeFile(wb, fileName);
    alert('Plantilla de datos descargada exitosamente.');
  }

  async onDataFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');

    // Para archivos CSV, usar parseo directo sin XLSX
    if (isCSV) {
      this.parseCSVFile(file);
      event.target.value = '';
      return;
    }

    // Para archivos Excel (.xlsx, .xls)
    const XLSX = (window as any).XLSX;
    const reader = new FileReader();

    reader.onload = async (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (jsonData.length === 0) {
          alert('El archivo Excel está vacío');
          return;
        }

        const excelHeaders: string[] = (jsonData[0] as any[]).map(h => String(h).toLowerCase());
        const configuredHeaders = this.previewHeaders();
        const columnMapping: { [excelIndex: number]: number } = {};
        const missingHeaders: HeaderConfiguration[] = [];

        configuredHeaders.forEach((header, configIndex) => {
          const excelIndex = excelHeaders.findIndex(
            excelH => excelH === header.headerName.toLowerCase()
          );

          if (excelIndex !== -1) {
            columnMapping[excelIndex] = configIndex;
          } else {
            // Solo considerar como faltante si NO es un campo transformado
            // Los campos transformados (con sourceField y regexPattern) se generan automáticamente
            if (!(header.sourceField && header.regexPattern)) {
              missingHeaders.push(header);
            }
          }
        });

        if (missingHeaders.length > 0) {
          const missingNames = missingHeaders.map(h => h.headerName).join(', ');
          const continuar = confirm(
            `⚠️ ADVERTENCIA: Faltan las siguientes columnas en el archivo Excel:\n\n${missingNames}\n\n` +
            `Estas columnas se guardarán como NULL.\n\n¿Desea continuar con la importación?`
          );
          if (!continuar) {
            return;
          }
        }

        const dataRows = jsonData.slice(1);

        if (dataRows.length === 0) {
          alert('El archivo Excel no contiene datos (solo cabeceras)');
          return;
        }

        const valid: any[] = [];
        const invalid: {error: string, data: any}[] = [];

        dataRows.forEach((row: any, rowIndex: number) => {
          const transformedRow: any = {};
          let rowError = '';

          configuredHeaders.forEach((header, configIndex) => {
            const excelColumnIndex = Object.keys(columnMapping).find(
              key => columnMapping[parseInt(key)] === configIndex
            );

            if (excelColumnIndex !== undefined) {
              const value = row[parseInt(excelColumnIndex)];
              if (value !== undefined && value !== null && String(value).trim() !== '') {
                try {
                  if (header.dataType === 'FECHA' && typeof value === 'number') {
                    const excelEpoch = new Date(1899, 11, 30);
                    const dateMs = excelEpoch.getTime() + value * 24 * 60 * 60 * 1000;
                    const date = new Date(dateMs);
                    const format = header.format || 'dd/MM/yyyy';
                    transformedRow[header.headerName] = this.formatDateByPattern(date, format);
                  } else if (header.dataType === 'FECHA' && value instanceof Date) {
                    const format = header.format || 'dd/MM/yyyy';
                    transformedRow[header.headerName] = this.formatDateByPattern(value, format);
                  } else {
                    transformedRow[header.headerName] = String(value).trim();
                  }
                } catch (error) {
                  rowError = `Error procesando columna ${header.headerName}`;
                  transformedRow[header.headerName] = String(value);
                }
              } else {
                transformedRow[header.headerName] = null;
              }
            } else {
              transformedRow[header.headerName] = null;
            }
          });

          // Aplicar transformaciones regex (segunda pasada)
          configuredHeaders.forEach((header) => {
            // Si este campo tiene transformación regex configurada
            if (header.sourceField && header.regexPattern) {
              try {
                // Obtener el valor del campo origen
                const sourceValue = transformedRow[header.sourceField];

                if (sourceValue) {
                  // Aplicar el regex
                  const regex = new RegExp(header.regexPattern);
                  const match = String(sourceValue).match(regex);

                  if (match) {
                    // Si hay grupos de captura, usar el primer grupo
                    // Si no hay grupos, usar el match completo
                    transformedRow[header.headerName] = match[1] || match[0];
                  } else {
                    // Si no coincide el regex, dejar null
                    transformedRow[header.headerName] = null;
                  }
                } else {
                  // Si el campo origen está vacío/null, el transformado también
                  transformedRow[header.headerName] = null;
                }
              } catch (error) {
                console.error(`Error aplicando regex en ${header.headerName}:`, error);
                transformedRow[header.headerName] = null;
              }
            }
          });

          // Validar que la fila tenga al menos un valor no nulo
          const hasData = Object.values(transformedRow).some(v => v !== null && v !== '');

          if (!hasData) {
            invalid.push({
              error: 'Fila vacía - no contiene datos',
              data: transformedRow
            });
          } else if (rowError) {
            invalid.push({
              error: rowError,
              data: transformedRow
            });
          } else {
            valid.push(transformedRow);
          }
        });

        // Actualizar los signals para mostrar la previsualización
        this.importedData.set([...valid, ...invalid.map(i => i.data)]);
        this.validData.set(valid);
        this.invalidData.set(invalid);

        console.log('Previsualización de datos:', {
          total: dataRows.length,
          válidos: valid.length,
          inválidos: invalid.length
        });

      } catch (error) {
        console.error('Error procesando el archivo:', error);
        alert('Error al procesar el archivo Excel');
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = '';
  }

  parseCSVFile(file: File) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0);

        if (lines.length === 0) {
          alert('El archivo CSV está vacío');
          return;
        }

        // Detectar separador (prioridad: punto y coma, coma, pipe, tab)
        const firstLine = lines[0];
        let separator = ';';
        if (firstLine.includes(';')) {
          separator = ';';
        } else if (firstLine.includes(',')) {
          separator = ',';
        } else if (firstLine.includes('|')) {
          separator = '|';
        } else if (firstLine.includes('\t')) {
          separator = '\t';
        }

        // Parsear cabeceras
        const csvHeaders = lines[0].split(separator).map((h: string) => h.trim().toLowerCase());
        const configuredHeaders = this.previewHeaders();
        const columnMapping: { [csvIndex: number]: number } = {};
        const missingHeaders: HeaderConfiguration[] = [];

        configuredHeaders.forEach((header, configIndex) => {
          const csvIndex = csvHeaders.findIndex(
            (csvH: string) => csvH === header.headerName.toLowerCase()
          );

          if (csvIndex !== -1) {
            columnMapping[csvIndex] = configIndex;
          } else {
            // Solo considerar como faltante si NO es un campo transformado
            // Los campos transformados (con sourceField y regexPattern) se generan automáticamente
            if (!(header.sourceField && header.regexPattern)) {
              missingHeaders.push(header);
            }
          }
        });

        if (missingHeaders.length > 0) {
          const missingNames = missingHeaders.map(h => h.headerName).join(', ');
          const continuar = confirm(
            `⚠️ ADVERTENCIA: Faltan las siguientes columnas en el archivo CSV:\n\n${missingNames}\n\n` +
            `Estas columnas se guardarán como NULL.\n\n¿Desea continuar con la importación?`
          );
          if (!continuar) {
            return;
          }
        }

        const dataLines = lines.slice(1);

        if (dataLines.length === 0) {
          alert('El archivo CSV no contiene datos (solo cabeceras)');
          return;
        }

        const valid: any[] = [];
        const invalid: {error: string, data: any}[] = [];

        dataLines.forEach((line: string, lineIndex: number) => {
          const values = line.split(separator).map((v: string) => v.trim());
          const transformedRow: any = {};
          let rowError = '';

          configuredHeaders.forEach((header, configIndex) => {
            const csvColumnIndex = Object.keys(columnMapping).find(
              key => columnMapping[parseInt(key)] === configIndex
            );

            if (csvColumnIndex !== undefined) {
              const value = values[parseInt(csvColumnIndex)];
              if (value !== undefined && value !== null && value !== '') {
                try {
                  if (header.dataType === 'FECHA') {
                    // Intentar parsear la fecha desde el string CSV
                    const dateValue = this.parseCSVDate(value, header.format || 'dd/MM/yyyy');
                    if (dateValue) {
                      transformedRow[header.headerName] = dateValue;
                    } else {
                      rowError = `Valor no es fecha válida para campo ${header.headerName}: ${value} (formato esperado: ${header.format || 'dd/MM/yyyy'})`;
                      transformedRow[header.headerName] = value;
                    }
                  } else {
                    transformedRow[header.headerName] = value;
                  }
                } catch (error) {
                  rowError = `Error procesando columna ${header.headerName}: ${error}`;
                  transformedRow[header.headerName] = value;
                }
              } else {
                transformedRow[header.headerName] = null;
              }
            } else {
              transformedRow[header.headerName] = null;
            }
          });

          // Aplicar transformaciones regex (segunda pasada)
          configuredHeaders.forEach((header) => {
            // Si este campo tiene transformación regex configurada
            if (header.sourceField && header.regexPattern) {
              try {
                // Obtener el valor del campo origen
                const sourceValue = transformedRow[header.sourceField];

                if (sourceValue) {
                  // Aplicar el regex
                  const regex = new RegExp(header.regexPattern);
                  const match = String(sourceValue).match(regex);

                  if (match) {
                    // Si hay grupos de captura, usar el primer grupo
                    // Si no hay grupos, usar el match completo
                    transformedRow[header.headerName] = match[1] || match[0];
                  } else {
                    // Si no coincide el regex, dejar null
                    transformedRow[header.headerName] = null;
                  }
                } else {
                  // Si el campo origen está vacío/null, el transformado también
                  transformedRow[header.headerName] = null;
                }
              } catch (error) {
                console.error(`Error aplicando regex en ${header.headerName}:`, error);
                transformedRow[header.headerName] = null;
              }
            }
          });

          // Validar que la fila tenga al menos un valor no nulo
          const hasData = Object.values(transformedRow).some(v => v !== null && v !== '');

          if (!hasData) {
            invalid.push({
              error: 'Fila vacía - no contiene datos',
              data: transformedRow
            });
          } else if (rowError) {
            invalid.push({
              error: rowError,
              data: transformedRow
            });
          } else {
            valid.push(transformedRow);
          }
        });

        // Actualizar los signals para mostrar la previsualización
        this.importedData.set([...valid, ...invalid.map(i => i.data)]);
        this.validData.set(valid);
        this.invalidData.set(invalid);

        console.log('Previsualización de datos CSV:', {
          total: dataLines.length,
          válidos: valid.length,
          inválidos: invalid.length
        });

      } catch (error) {
        console.error('Error procesando el archivo CSV:', error);
        alert('Error al procesar el archivo CSV');
      }
    };

    reader.readAsText(file);
  }

  parseCSVDate(value: string, format: string): string | null {
    // Intentar parsear según el formato configurado
    try {
      // Si el valor ya viene en el formato correcto, devolverlo
      const formatRegex = format
        .replace(/dd/g, '\\d{2}')
        .replace(/MM/g, '\\d{2}')
        .replace(/yyyy/g, '\\d{4}')
        .replace(/yy/g, '\\d{2}')
        .replace(/HH/g, '\\d{2}')
        .replace(/mm/g, '\\d{2}')
        .replace(/ss/g, '\\d{2}');

      const regex = new RegExp('^' + formatRegex + '$');

      if (regex.test(value.trim())) {
        return value.trim();
      }

      // Si no coincide, intentar parsear y reformatear
      // Detectar separadores comunes
      const dateParts = value.split(/[-\/\s:]/);

      if (dateParts.length < 3) {
        return null;
      }

      // Intentar diferentes formatos comunes
      let day: number, month: number, year: number;
      let hours = 0, minutes = 0, seconds = 0;

      // Formato dd/MM/yyyy o dd-MM-yyyy
      if (format.startsWith('dd')) {
        day = parseInt(dateParts[0]);
        month = parseInt(dateParts[1]);
        year = parseInt(dateParts[2]);
      }
      // Formato MM/dd/yyyy o MM-dd-yyyy
      else if (format.startsWith('MM')) {
        month = parseInt(dateParts[0]);
        day = parseInt(dateParts[1]);
        year = parseInt(dateParts[2]);
      }
      // Formato yyyy/MM/dd o yyyy-MM-dd
      else {
        year = parseInt(dateParts[0]);
        month = parseInt(dateParts[1]);
        day = parseInt(dateParts[2]);
      }

      // Parsear tiempo si existe
      if (dateParts.length > 3) {
        hours = parseInt(dateParts[3]) || 0;
        minutes = parseInt(dateParts[4]) || 0;
        seconds = parseInt(dateParts[5]) || 0;
      }

      // Validar valores
      if (isNaN(day) || isNaN(month) || isNaN(year) ||
          day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) {
        return null;
      }

      // Crear fecha y formatear según el patrón
      const date = new Date(year, month - 1, day, hours, minutes, seconds);

      if (isNaN(date.getTime())) {
        return null;
      }

      return this.formatDateByPattern(date, format);

    } catch (error) {
      console.error('Error parseando fecha:', error);
      return null;
    }
  }

  formatDateByPattern(date: Date, pattern: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    let formatted = pattern;
    formatted = formatted.replace(/yyyy/g, String(year));
    formatted = formatted.replace(/yy/g, String(year).slice(-2));
    formatted = formatted.replace(/MM/g, month);
    formatted = formatted.replace(/dd/g, day);
    formatted = formatted.replace(/HH/g, hours);
    formatted = formatted.replace(/mm/g, minutes);
    formatted = formatted.replace(/ss/g, seconds);

    return formatted;
  }

  simplifyBackendError(error: string): string {
    // Extraer número de fila
    const rowMatch = error.match(/Fila (\d+):/);
    const rowNumber = rowMatch ? rowMatch[1] : '?';

    // Detectar diferentes tipos de errores y simplificarlos

    // Error: Campo no tiene valor por defecto (campo vacío obligatorio)
    if (error.includes("doesn't have a default value")) {
      const fieldMatch = error.match(/Field '([^']+)'/);
      const fieldName = fieldMatch ? fieldMatch[1] : 'desconocido';
      return `Fila ${rowNumber}: El campo '${fieldName}' está vacío pero es obligatorio. Por favor, proporcione un valor.`;
    }

    // Error: Valor NULL no permitido
    if (error.includes("cannot be null") || error.includes("Column") && error.includes("cannot be null")) {
      const fieldMatch = error.match(/Column '([^']+)'/) || error.match(/Field '([^']+)'/);
      const fieldName = fieldMatch ? fieldMatch[1] : 'desconocido';
      return `Fila ${rowNumber}: El campo '${fieldName}' no puede estar vacío. Es un campo obligatorio.`;
    }

    // Error: Dato muy largo
    if (error.includes("Data too long") || error.includes("too long for column")) {
      const fieldMatch = error.match(/column '([^']+)'/) || error.match(/Field '([^']+)'/);
      const fieldName = fieldMatch ? fieldMatch[1] : 'desconocido';
      return `Fila ${rowNumber}: El valor del campo '${fieldName}' es demasiado largo. Reduzca el tamaño del texto.`;
    }

    // Error: Formato de fecha incorrecto
    if (error.includes("Incorrect date") || error.includes("Incorrect datetime")) {
      const fieldMatch = error.match(/column '([^']+)'/) || error.match(/Field '([^']+)'/);
      const fieldName = fieldMatch ? fieldMatch[1] : 'desconocido';
      return `Fila ${rowNumber}: El campo '${fieldName}' tiene un formato de fecha incorrecto. Verifique el formato.`;
    }

    // Error: Valor duplicado (clave única)
    if (error.includes("Duplicate entry")) {
      const valueMatch = error.match(/Duplicate entry '([^']+)'/);
      const value = valueMatch ? valueMatch[1] : 'desconocido';
      return `Fila ${rowNumber}: El valor '${value}' ya existe en la base de datos. No se permiten duplicados.`;
    }

    // Error: Tipo de dato incorrecto
    if (error.includes("Incorrect integer") || error.includes("Incorrect decimal")) {
      const fieldMatch = error.match(/column '([^']+)'/) || error.match(/Field '([^']+)'/);
      const fieldName = fieldMatch ? fieldMatch[1] : 'desconocido';
      return `Fila ${rowNumber}: El campo '${fieldName}' debe contener un número válido.`;
    }

    // Error: Referencia foránea no existe
    if (error.includes("foreign key constraint fails") || error.includes("Cannot add or update a child row")) {
      return `Fila ${rowNumber}: Hay una referencia a un dato que no existe en el sistema. Verifique los datos relacionados.`;
    }

    // Si no se puede simplificar, extraer solo la parte más relevante
    const simplifiedMatch = error.match(/Fila \d+: Error al insertar datos: (.+?)(?:\s*;|$)/);
    if (simplifiedMatch) {
      return `Fila ${rowNumber}: ${simplifiedMatch[1]}`;
    }

    // Si todo falla, retornar el error original pero más corto
    return error.length > 200 ? error.substring(0, 200) + '...' : error;
  }

  clearImportedData() {
    this.importedData.set([]);
    this.validData.set([]);
    this.invalidData.set([]);
    this.backendErrors.set([]);
  }

  confirmImport() {
    const dataToImport = this.validData();

    if (dataToImport.length === 0) {
      alert('No hay datos válidos para importar');
      return;
    }

    console.log('Datos transformados listos para importar:', dataToImport);
    console.log('Subcartera ID:', this.selectedSubPortfolioId);

    // Daily load usa ACTUALIZACION
    this.headerConfigService.importData(this.selectedSubPortfolioId, 'ACTUALIZACION', dataToImport).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response);

        // Verificar si hay errores en la respuesta del backend
        if (response.errors && response.errors.length > 0) {
          // Simplificar los errores para que sean más entendibles
          const simplifiedErrors = response.errors.map((error: string) => this.simplifyBackendError(error));
          this.backendErrors.set(simplifiedErrors);
          console.error('Errores del backend:', response.errors);
          // No limpiar los datos importados para que el usuario pueda ver qué falló
        } else {
          // Solo si no hay errores, mostrar mensaje de éxito y limpiar
          alert(`✅ Se importaron ${response.insertedRows || dataToImport.length} filas de datos exitosamente a la tabla dinámica.`);
          this.clearImportedData();
        }
      },
      error: (error) => {
        console.error('Error HTTP al importar datos:', error);

        // Si el error tiene estructura de errores del backend, mostrarlos
        if (error.error?.errors && Array.isArray(error.error.errors)) {
          const simplifiedErrors = error.error.errors.map((err: string) => this.simplifyBackendError(err));
          this.backendErrors.set(simplifiedErrors);
        } else {
          // Error genérico
          this.backendErrors.set([`Error de conexión: ${error.error?.message || error.message}`]);
        }
      }
    });
  }

  loadAutoConfig() {
    this.importConfigService.getConfig().subscribe({
      next: (config) => {
        this.autoImportConfig = {
          watchDirectory: config.watchDirectory || '',
          filePattern: config.filePattern || '',
          active: config.active || false
        };

        // Cargar scheduledTime (formato HH:mm:ss del backend)
        if (config.scheduledTime) {
          // Convertir de HH:mm:ss a HH:mm para el input type="time"
          this.scheduledTimeInput = config.scheduledTime.substring(0, 5);
        } else {
          this.scheduledTimeInput = '02:00'; // Default
        }

        if (this.autoImportConfig.active) {
          this.loadAutoImportHistory();
        }
      },
      error: (error) => {
        console.error('Error cargando configuración:', error);
      }
    });
  }

  async saveAutoConfig() {
    if (!this.selectedSubPortfolioId) {
      alert('⚠️ Debes seleccionar una Subcartera antes de configurar la importación automática');
      return;
    }
    if (!this.autoImportConfig.watchDirectory) {
      alert('Por favor ingresa la carpeta a monitorear');
      return;
    }
    if (!this.autoImportConfig.filePattern) {
      alert('Por favor ingresa el patrón de archivo');
      return;
    }

    // Si se va a activar, validar cabeceras
    if (this.autoImportConfig.active) {
      // Verificar que hay cabeceras configuradas
      if (this.previewHeaders().length === 0) {
        alert('⚠️ No hay cabeceras configuradas para esta subcartera.\n\nDebes configurar las cabeceras primero en el módulo de Mantenimiento.');
        this.autoImportConfig.active = false;
        return;
      }

      // Verificar que hay un archivo para validar
      if (this.foundFiles().length === 0) {
        const confirmar = confirm('⚠️ No has verificado qué archivos existen en la carpeta.\n\n¿Deseas activar el procesamiento automático sin validar el archivo?');
        if (!confirmar) {
          this.autoImportConfig.active = false;
          return;
        }
      } else {
        // Validar cabeceras del archivo
        const validacion = await this.validateFileHeaders(this.foundFiles()[0].name);
        if (!validacion.valido) {
          alert('❌ Error de validación de cabeceras:\n\n' + validacion.mensaje);
          this.autoImportConfig.active = false;
          return;
        }
      }
    }

    // Convertir hora de HH:mm a HH:mm:ss para el backend
    const scheduledTime = this.scheduledTimeInput ? `${this.scheduledTimeInput}:00` : '02:00:00';

    const configToSave = {
      watchDirectory: this.autoImportConfig.watchDirectory,
      filePattern: this.autoImportConfig.filePattern,
      subPortfolioId: this.selectedSubPortfolioId,
      scheduledTime: scheduledTime,
      active: this.autoImportConfig.active,
      processedDirectory: this.autoImportConfig.watchDirectory + '\\Procesados',
      errorDirectory: this.autoImportConfig.watchDirectory + '\\Errores',
      moveAfterProcess: true
    };

    this.importConfigService.saveConfig(configToSave).subscribe({
      next: (saved) => {
        const horaProgramada = saved.scheduledTime
          ? `A las ${saved.scheduledTime.substring(0, 5)} diariamente`
          : 'Sin hora programada';

        alert('✅ Configuración guardada exitosamente.\n\n' +
              `Patrón: ${saved.filePattern}\n` +
              `Carpeta: ${saved.watchDirectory}\n` +
              `Programación: ${horaProgramada}\n` +
              `Estado: ${saved.active ? 'ACTIVA - El sistema está monitoreando' : 'Inactiva'}`);

        if (saved.active) {
          this.loadAutoImportHistory();
        }
      },
      error: (error) => {
        console.error('Error guardando configuración:', error);
        alert('❌ Error al guardar la configuración: ' + (error.error?.error || error.message));
      }
    });
  }

  async validateFileHeaders(fileName: string): Promise<{valido: boolean, mensaje: string}> {
    try {
      // Construct full file path
      const filePath = `${this.autoImportConfig.watchDirectory}\\${fileName}`;

      // Determine load type based on current tab or configuration
      // For now, defaulting to ACTUALIZACION (daily load)
      const loadType = 'ACTUALIZACION';

      // Call backend validation
      const result = await this.importConfigService.validateHeaders(
        filePath,
        this.selectedSubPortfolioId,
        loadType
      ).toPromise();

      if (!result) {
        return {
          valido: false,
          mensaje: 'No se recibió respuesta del servidor'
        };
      }

      return {
        valido: result.valid,
        mensaje: result.message
      };
    } catch (error: any) {
      return {
        valido: false,
        mensaje: 'Error al validar cabeceras: ' + (error.message || error)
      };
    }
  }

  loadAutoImportHistory() {
    this.importConfigService.getHistory(this.selectedSubPortfolioId).subscribe({
      next: (history) => {
        this.autoImportHistory.set(history);
      },
      error: (error) => {
        console.error('Error cargando historial:', error);
      }
    });
  }

  refreshHistory() {
    console.log('Refrescando historial...');
    this.loadAutoImportHistory();
  }

  scanFolder() {
    if (!this.autoImportConfig.watchDirectory || !this.autoImportConfig.filePattern) {
      return;
    }

    this.scanningFolder.set(true);

    this.importConfigService.scanFolder(
      this.autoImportConfig.watchDirectory,
      this.autoImportConfig.filePattern
    ).subscribe({
      next: (files) => {
        const mappedFiles = files.map(f => ({
          name: f.name,
          size: f.size,
          modifiedDate: new Date(f.modifiedDate),
          processed: f.processed
        }));

        this.foundFiles.set(mappedFiles);
        this.scanningFolder.set(false);
      },
      error: (error) => {
        console.error('Error escaneando carpeta:', error);
        alert('❌ Error al escanear la carpeta: ' + (error.error?.error || error.message));
        this.scanningFolder.set(false);
        this.foundFiles.set([]);
      }
    });
  }

  triggerManualImport() {
    if (!this.autoImportConfig.watchDirectory || !this.autoImportConfig.filePattern) {
      alert('⚠️ Configura la carpeta y el patrón de archivo primero');
      return;
    }

    const confirmImport = confirm(
      '¿Deseas ejecutar la importación ahora?\n\n' +
      'Se procesará el próximo archivo disponible en la carpeta configurada.'
    );

    if (!confirmImport) {
      return;
    }

    // Mostrar loading
    this.backendErrors.set([]);
    console.log('🚀 Ejecutando importación manual...');

    this.importConfigService.triggerManualImport().subscribe({
      next: (result) => {
        console.log('Resultado de importación manual:', result);

        if (result.success) {
          // Importación exitosa
          if (result.hasErrors) {
            // Exitosa pero con errores
            alert(
              `⚠️ Importación completada con advertencias\n\n` +
              `Archivo: ${result.fileName}\n` +
              `Registros insertados: ${result.insertedRows}\n` +
              `Errores: ${result.errors.length}\n\n` +
              `Revisa el log rojo para ver los detalles.`
            );
            // Mostrar errores en el log rojo
            this.backendErrors.set(result.errors);
          } else {
            // Completamente exitosa
            alert(
              `✅ Importación exitosa\n\n` +
              `Archivo: ${result.fileName}\n` +
              `Registros insertados: ${result.insertedRows}`
            );
          }
          // Refrescar historial
          this.loadAutoImportHistory();
        } else {
          // Importación fallida
          if (result.duplicate) {
            alert(
              `ℹ️ Archivo duplicado\n\n` +
              `El archivo "${result.fileName}" ya fue procesado anteriormente.\n\n` +
              `El sistema detectó que el contenido es idéntico a uno ya importado.`
            );
          } else {
            alert(
              `❌ Error en la importación\n\n` +
              `${result.message}\n\n` +
              `Revisa el log rojo para ver los detalles.`
            );
            // Mostrar errores en el log rojo
            if (result.errors && result.errors.length > 0) {
              this.backendErrors.set(result.errors);
            }
          }
        }
      },
      error: (error) => {
        console.error('Error al ejecutar importación manual:', error);
        alert(
          `❌ Error al ejecutar importación\n\n` +
          `${error.error?.message || error.message}\n\n` +
          `Verifica que la configuración esté correcta.`
        );
      }
    });
  }

  formatHistoryDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / 60000);
      return `Hace ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours}h`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  onFolderSelected(path: string) {
    this.autoImportConfig.watchDirectory = path;
    this.showFolderBrowser.set(false);
    console.log('Carpeta seleccionada:', path);
  }
}
