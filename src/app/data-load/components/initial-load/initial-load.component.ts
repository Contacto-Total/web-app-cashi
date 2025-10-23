import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { HeaderConfigurationService } from '../../../maintenance/services/header-configuration.service';
import { PortfolioService } from '../../../maintenance/services/portfolio.service';
import { TenantService } from '../../../maintenance/services/tenant.service';
import { HeaderConfiguration } from '../../../maintenance/models/header-configuration.model';
import { SubPortfolio, Portfolio } from '../../../maintenance/models/portfolio.model';
import { Tenant } from '../../../maintenance/models/tenant.model';

@Component({
  selector: 'app-initial-load',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 bg-blue-600 rounded-lg">
              <lucide-angular name="folder" [size]="24" class="text-white"></lucide-angular>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-white">Carga Inicial de Mes</h1>
              <p class="text-gray-400 text-sm mt-1">Importación masiva de datos al inicio del mes</p>
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
                      class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                      class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
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
                      class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <option [value]="0">Seleccione una subcartera...</option>
                @for (sp of subPortfolios(); track sp.id) {
                  <option [value]="sp.id">{{ sp.subPortfolioCode }} - {{ sp.subPortfolioName }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        @if (selectedSubPortfolioId > 0 && headersAreSaved()) {
          <!-- Área de carga de datos -->
          <div class="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <!-- Header y Botones de acción -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 class="text-xl font-bold text-white">Importación de Datos</h2>
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
                    accept=".xlsx,.xls"
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
                    <lucide-angular name="table" [size]="16" class="text-blue-400"></lucide-angular>
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
                          <div class="flex flex-col gap-0.5">
                            <span class="font-semibold">{{ header.headerName }}</span>
                            <span class="text-[10px] text-blue-400 font-normal">{{ header.dataType }}{{ header.format ? ' (' + header.format + ')' : '' }}</span>
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
                    @if (validData().length > 0) {
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
                    @if (validData().length > 0) {
                      <button
                        (click)="confirmImport()"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm">
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
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class InitialLoadComponent implements OnInit {
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

  constructor(
    private tenantService: TenantService,
    private portfolioService: PortfolioService,
    private headerConfigService: HeaderConfigurationService
  ) {}

  ngOnInit() {
    this.loadTenants();
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
    // Initial load usa INICIAL
    this.headerConfigService.getBySubPortfolioAndLoadType(subPortfolioId, 'INICIAL').subscribe({
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
            missingHeaders.push(header);
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

  formatDateByPattern(date: Date, pattern: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    let formatted = pattern;
    formatted = formatted.replace(/yyyy/g, String(year));
    formatted = formatted.replace(/yy/g, String(year).slice(-2));
    formatted = formatted.replace(/MM/g, month);
    formatted = formatted.replace(/dd/g, day);

    return formatted;
  }

  clearImportedData() {
    this.importedData.set([]);
    this.validData.set([]);
    this.invalidData.set([]);
  }

  confirmImport() {
    const dataToImport = this.validData();

    if (dataToImport.length === 0) {
      alert('No hay datos válidos para importar');
      return;
    }

    console.log('Datos transformados listos para importar:', dataToImport);
    console.log('Subcartera ID:', this.selectedSubPortfolioId);

    // Initial load usa INICIAL
    this.headerConfigService.importData(this.selectedSubPortfolioId, 'INICIAL', dataToImport).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        alert(`✅ Se importaron ${dataToImport.length} filas de datos exitosamente a la tabla dinámica.`);
        this.clearImportedData();
      },
      error: (error) => {
        console.error('Error al importar datos:', error);
        alert(`❌ Error al importar datos: ${error.error?.message || error.message}\n\nRevise la consola para más detalles.`);
      }
    });
  }
}
