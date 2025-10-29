import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { BlacklistService } from '../../services/blacklist.service';
import { TypificationService } from '../../services/typification.service';
import { PortfolioService } from '../../services/portfolio.service';
import { Blacklist } from '../../models/blacklist.model';
import { Tenant } from '../../models/tenant.model';
import { Portfolio, SubPortfolio } from '../../models/portfolio.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-blacklist-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  styles: [`
    @keyframes slideIn {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
  `],
  template: `
    <div class="min-h-screen bg-slate-950 p-6">
      <!-- Header -->
      <div class="max-w-7xl mx-auto mb-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
            <lucide-angular name="shield-ban" [size]="24" class="text-white"></lucide-angular>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-white">Gestión de Blacklist</h1>
            <p class="text-sm text-gray-400">Bloqueo de clientes por proveedor, cartera y subcartera</p>
          </div>
        </div>
      </div>

      <!-- Formulario de añadir blacklist -->
      <div class="max-w-7xl mx-auto mb-6">
        <div class="bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-800">
          <div class="grid grid-cols-6 gap-4">
            <!-- Proveedor -->
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Proveedor</label>
              <select [(ngModel)]="selectedTenantId"
                      (ngModelChange)="onTenantChange()"
                      class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option [value]="null">Seleccionar</option>
                @for (tenant of tenants(); track tenant.id) {
                  <option [value]="tenant.id">{{ tenant.tenantName }}</option>
                }
              </select>
            </div>

            <!-- Cartera -->
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Cartera</label>
              <select [(ngModel)]="selectedPortfolioId"
                      (ngModelChange)="onPortfolioChange()"
                      [disabled]="!selectedTenantId"
                      class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50">
                <option [value]="null">Seleccionar</option>
                @for (portfolio of portfolios(); track portfolio.id) {
                  <option [value]="portfolio.id">{{ portfolio.portfolioName }}</option>
                }
              </select>
            </div>

            <!-- Subcartera -->
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Subcartera</label>
              <select [(ngModel)]="selectedSubPortfolioId"
                      [disabled]="!selectedPortfolioId"
                      class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50">
                <option [value]="null">Seleccionar</option>
                @for (subPortfolio of subPortfolios(); track subPortfolio.id) {
                  <option [value]="subPortfolio.id">{{ subPortfolio.subPortfolioName }}</option>
                }
              </select>
            </div>

            <!-- Documento -->
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Documento</label>
              <input type="text"
                     [(ngModel)]="document"
                     placeholder="Ingrese el documento"
                     class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500">
            </div>

            <!-- Fecha Fin -->
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">Fecha Fin</label>
              <input type="date"
                     [(ngModel)]="endDate"
                     [min]="getTomorrowDate()"
                     class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
            </div>

            <!-- Botón Añadir -->
            <div class="flex items-end">
              <button (click)="addToBlacklist()"
                      [disabled]="!canAddBlacklist()"
                      class="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                Añadir
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Blacklists Table -->
      <div class="max-w-7xl mx-auto">
        <div class="bg-slate-900 rounded-xl shadow-sm border border-slate-800">
          @if (loading()) {
            <div class="p-12 text-center">
              <div class="inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <p class="mt-4 text-gray-400">Cargando bloqueos...</p>
            </div>
          } @else if (filteredBlacklists().length === 0) {
            <div class="p-12 text-center">
              <lucide-angular name="shield-ban" [size]="48" class="mx-auto text-gray-600 mb-4"></lucide-angular>
              <p class="text-gray-400 text-lg mb-2">No hay bloqueos registrados</p>
              <p class="text-gray-500 text-sm">Usa el formulario de arriba para añadir un nuevo bloqueo</p>
            </div>
          } @else {
            <div class="overflow-x-auto rounded-xl pb-3">
              <table class="w-full">
                <thead class="bg-slate-800/50">
                  <tr class="border-b border-slate-700">
                    <th class="px-2 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider relative">
                      <div class="flex items-center gap-2">
                        <span>Proveedor</span>
                        <button (click)="toggleFilterPopover('tenant')"
                                class="p-1 hover:bg-slate-700 rounded transition-colors"
                                [class.text-red-400]="filterTenantId">
                          <lucide-angular name="filter" [size]="14"></lucide-angular>
                        </button>
                      </div>
                      @if (openFilterPopover === 'tenant') {
                        <div class="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-2 z-50 w-48">
                          <select [(ngModel)]="filterTenantId"
                                  (ngModelChange)="onFilterTenantChange()"
                                  class="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option [ngValue]="null">Todos</option>
                            @for (tenant of availableTenants(); track tenant.id) {
                              <option [ngValue]="tenant.id">{{ tenant.name }}</option>
                            }
                          </select>
                        </div>
                      }
                    </th>
                    <th class="px-2 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider relative">
                      <div class="flex items-center gap-2">
                        <span>Cartera</span>
                        <button (click)="toggleFilterPopover('portfolio')"
                                class="p-1 hover:bg-slate-700 rounded transition-colors"
                                [class.text-red-400]="filterPortfolioId">
                          <lucide-angular name="filter" [size]="14"></lucide-angular>
                        </button>
                      </div>
                      @if (openFilterPopover === 'portfolio') {
                        <div class="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-2 z-50 w-48">
                          <select [(ngModel)]="filterPortfolioId"
                                  (ngModelChange)="onFilterPortfolioChange()"
                                  class="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option [ngValue]="null">Todas</option>
                            @for (portfolio of getFilteredPortfolios(); track portfolio.id) {
                              <option [ngValue]="portfolio.id">{{ portfolio.name }}</option>
                            }
                          </select>
                        </div>
                      }
                    </th>
                    <th class="px-2 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider relative">
                      <div class="flex items-center gap-2">
                        <span>Subcartera</span>
                        <button (click)="toggleFilterPopover('subportfolio')"
                                class="p-1 hover:bg-slate-700 rounded transition-colors"
                                [class.text-red-400]="filterSubPortfolioId">
                          <lucide-angular name="filter" [size]="14"></lucide-angular>
                        </button>
                      </div>
                      @if (openFilterPopover === 'subportfolio') {
                        <div class="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-2 z-50 w-48">
                          <select [(ngModel)]="filterSubPortfolioId"
                                  (ngModelChange)="applyFilters()"
                                  class="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option [ngValue]="null">Todas</option>
                            @for (subPortfolio of getFilteredSubPortfolios(); track subPortfolio.id) {
                              <option [ngValue]="subPortfolio.id">{{ subPortfolio.name }}</option>
                            }
                          </select>
                        </div>
                      }
                    </th>
                    <th class="px-2 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider relative">
                      <div class="flex items-center gap-2">
                        <span>Documento</span>
                        <button (click)="toggleFilterPopover('document')"
                                class="p-1 hover:bg-slate-700 rounded transition-colors"
                                [class.text-red-400]="searchTerm">
                          <lucide-angular name="filter" [size]="14"></lucide-angular>
                        </button>
                      </div>
                      @if (openFilterPopover === 'document') {
                        <div class="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-2 z-50 w-48">
                          <div class="relative">
                            <lucide-angular name="search" [size]="14" class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"></lucide-angular>
                            <input type="text"
                                   [(ngModel)]="searchTerm"
                                   (ngModelChange)="applyFilters()"
                                   placeholder="Buscar..."
                                   class="w-full pl-8 pr-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500">
                          </div>
                        </div>
                      }
                    </th>
                    <th class="px-2 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                    <th class="px-2 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Teléfono</th>
                    <th class="px-2 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha Inicio</th>
                    <th class="px-2 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha Fin</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                  @for (blacklist of filteredBlacklists(); track blacklist.id) {
                    <tr class="hover:bg-slate-800/50 transition-colors">
                      <td class="px-2 py-3">
                        <div class="text-xs font-medium text-white">{{ blacklist.tenantName }}</div>
                      </td>
                      <td class="px-2 py-3">
                        <div class="text-xs text-gray-300">{{ blacklist.portfolioName || '-' }}</div>
                      </td>
                      <td class="px-2 py-3">
                        <div class="text-xs text-gray-300">{{ blacklist.subPortfolioName || '-' }}</div>
                      </td>
                      <td class="px-2 py-3">
                        <div class="text-xs text-gray-300">{{ blacklist.document || '-' }}</div>
                      </td>
                      <td class="px-2 py-3">
                        <div class="text-xs text-gray-300">{{ blacklist.email || '-' }}</div>
                      </td>
                      <td class="px-2 py-3">
                        <div class="text-xs text-gray-300">{{ blacklist.phone || '-' }}</div>
                      </td>
                      <td class="px-2 py-3">
                        <div class="text-xs text-gray-300">{{ formatDate(blacklist.startDate) }}</div>
                      </td>
                      <td class="px-2 py-3">
                        <div class="text-xs text-gray-300">{{ formatDate(blacklist.endDate) }}</div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Overlay para cerrar popovers -->
    @if (openFilterPopover) {
      <div class="fixed inset-0 z-40" (click)="openFilterPopover = null"></div>
    }

    <!-- Toast de error -->
    @if (errorMessage()) {
      <div class="fixed top-4 right-4 z-50 animate-slide-in">
        <div class="bg-red-900 border border-red-700 rounded-lg shadow-2xl p-4 max-w-md">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
              <lucide-angular name="alert-circle" [size]="20" class="text-red-400"></lucide-angular>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-white mb-1">Error</h3>
              <p class="text-sm text-red-200">{{ errorMessage() }}</p>
            </div>
            <button (click)="errorMessage.set(null)"
                    class="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors">
              <lucide-angular name="x" [size]="18"></lucide-angular>
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Popup de confirmación -->
    @if (showConfirmDialog()) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-slate-900 rounded-xl shadow-2xl border border-slate-800 max-w-md w-full">
          <div class="p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center">
                <lucide-angular name="shield-ban" [size]="24" class="text-red-400"></lucide-angular>
              </div>
              <h3 class="text-lg font-bold text-white">Confirmar Bloqueo</h3>
            </div>
            <p class="text-gray-300 mb-4">¿Está seguro de añadir este cliente a la blacklist?</p>
            <div class="bg-slate-800 rounded-lg p-3 mb-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Documento:</span>
                <span class="text-white font-semibold">{{ document }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Proveedor:</span>
                <span class="text-white">{{ getSelectedTenantName() }}</span>
              </div>
              @if (selectedPortfolioId) {
                <div class="flex justify-between">
                  <span class="text-gray-400">Cartera:</span>
                  <span class="text-white">{{ getSelectedPortfolioName() }}</span>
                </div>
              }
              @if (selectedSubPortfolioId) {
                <div class="flex justify-between">
                  <span class="text-gray-400">Subcartera:</span>
                  <span class="text-white">{{ getSelectedSubPortfolioName() }}</span>
                </div>
              }
              <div class="flex justify-between">
                <span class="text-gray-400">Email:</span>
                <span class="text-white">{{ customerEmail || 'No disponible' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Teléfono:</span>
                <span class="text-white">{{ customerPhone || 'No disponible' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Fecha Fin:</span>
                <span class="text-white">{{ formatDate(endDate) }}</span>
              </div>
            </div>
            <div class="flex gap-3">
              <button (click)="closeConfirmDialog()"
                      class="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors">
                Cancelar
              </button>
              <button (click)="confirmAddBlacklist()"
                      class="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class BlacklistMaintenanceComponent implements OnInit {
  blacklists = signal<Blacklist[]>([]);
  filteredBlacklists = signal<Blacklist[]>([]);
  tenants = signal<Tenant[]>([]);

  // Listas para el formulario de añadir (con cascada)
  portfolios = signal<Portfolio[]>([]);
  subPortfolios = signal<SubPortfolio[]>([]);

  // Listas derivadas de los blacklists existentes para filtros
  availableTenants = signal<{id: number, name: string}[]>([]);
  availablePortfolios = signal<{id: number, name: string}[]>([]);
  availableSubPortfolios = signal<{id: number, name: string}[]>([]);

  loading = signal(false);
  showConfirmDialog = signal(false);
  openFilterPopover: string | null = null;
  errorMessage = signal<string | null>(null);

  // Variables para añadir blacklist
  selectedTenantId: number | null = null;
  selectedPortfolioId: number | null = null;
  selectedSubPortfolioId: number | null = null;
  document = '';
  endDate = '';
  customerId: number | null = null;
  customerEmail = '';
  customerPhone = '';

  // Variables para filtros de tabla
  filterTenantId: number | null = null;
  filterPortfolioId: number | null = null;
  filterSubPortfolioId: number | null = null;
  searchTerm = '';

  constructor(
    private blacklistService: BlacklistService,
    private typificationService: TypificationService,
    private portfolioService: PortfolioService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadTenants();
    this.loadBlacklists();
  }

  loadTenants() {
    this.typificationService.getAllTenants().subscribe({
      next: (data) => {
        this.tenants.set(data);
      },
      error: (error) => console.error('Error loading tenants:', error)
    });
  }

  loadBlacklists() {
    this.loading.set(true);
    this.blacklistService.getAllBlacklists().subscribe({
      next: (data) => {
        this.blacklists.set(data);
        this.calculateAvailableFilters();
        this.applyFilters();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading blacklists:', error);
        this.loading.set(false);
      }
    });
  }

  calculateAvailableFilters() {
    const blacklists = this.blacklists();

    // Obtener tenants únicos
    const tenantsMap = new Map<number, string>();
    blacklists.forEach(b => {
      if (b.tenantId && b.tenantName) {
        tenantsMap.set(b.tenantId, b.tenantName);
      }
    });
    this.availableTenants.set(
      Array.from(tenantsMap.entries()).map(([id, name]) => ({ id, name }))
    );

    // Obtener carteras únicas
    const portfoliosMap = new Map<number, string>();
    blacklists.forEach(b => {
      if (b.portfolioId && b.portfolioName) {
        portfoliosMap.set(b.portfolioId, b.portfolioName);
      }
    });
    this.availablePortfolios.set(
      Array.from(portfoliosMap.entries()).map(([id, name]) => ({ id, name }))
    );

    // Obtener subcarteras únicas
    const subPortfoliosMap = new Map<number, string>();
    blacklists.forEach(b => {
      if (b.subPortfolioId && b.subPortfolioName) {
        subPortfoliosMap.set(b.subPortfolioId, b.subPortfolioName);
      }
    });
    this.availableSubPortfolios.set(
      Array.from(subPortfoliosMap.entries()).map(([id, name]) => ({ id, name }))
    );
  }

  onTenantChange() {
    this.selectedPortfolioId = null;
    this.selectedSubPortfolioId = null;
    this.portfolios.set([]);
    this.subPortfolios.set([]);

    if (this.selectedTenantId) {
      this.typificationService.getPortfoliosByTenant(this.selectedTenantId).subscribe({
        next: (data) => this.portfolios.set(data),
        error: (error) => console.error('Error loading portfolios:', error)
      });
    }
  }

  onPortfolioChange() {
    this.selectedSubPortfolioId = null;
    this.subPortfolios.set([]);

    if (this.selectedPortfolioId) {
      this.portfolioService.getSubPortfoliosByPortfolio(this.selectedPortfolioId).subscribe({
        next: (data) => this.subPortfolios.set(data),
        error: (error) => console.error('Error loading subportfolios:', error)
      });
    }
  }

  onFilterTenantChange() {
    this.filterPortfolioId = null;
    this.filterSubPortfolioId = null;
    this.applyFilters();
  }

  onFilterPortfolioChange() {
    this.filterSubPortfolioId = null;
    this.applyFilters();
  }

  getFilteredPortfolios() {
    if (!this.filterTenantId) {
      return this.availablePortfolios();
    }
    // Filtrar carteras que pertenecen al tenant seleccionado
    return this.availablePortfolios().filter(p => {
      return this.blacklists().some(b =>
        b.tenantId === this.filterTenantId && b.portfolioId === p.id
      );
    });
  }

  getFilteredSubPortfolios() {
    if (!this.filterPortfolioId) {
      return this.availableSubPortfolios();
    }
    // Filtrar subcarteras que pertenecen a la cartera seleccionada
    return this.availableSubPortfolios().filter(sp => {
      return this.blacklists().some(b =>
        b.portfolioId === this.filterPortfolioId && b.subPortfolioId === sp.id
      );
    });
  }

  applyFilters() {
    let filtered = this.blacklists();

    if (this.filterTenantId) {
      filtered = filtered.filter(b => b.tenantId == this.filterTenantId);
    }

    if (this.filterPortfolioId) {
      filtered = filtered.filter(b => b.portfolioId == this.filterPortfolioId);
    }

    if (this.filterSubPortfolioId) {
      filtered = filtered.filter(b => b.subPortfolioId == this.filterSubPortfolioId);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(b => b.document?.toLowerCase().includes(term));
    }

    this.filteredBlacklists.set(filtered);
  }

  canAddBlacklist(): boolean {
    return !!(this.selectedTenantId && this.document && this.endDate);
  }

  addToBlacklist() {
    if (!this.canAddBlacklist()) return;

    // Validar que la fecha de fin sea mayor al día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDateObj = new Date(this.endDate);
    endDateObj.setHours(0, 0, 0, 0);

    if (endDateObj <= today) {
      this.showError('La fecha de fin debe ser mayor al día actual');
      return;
    }

    // Buscar información de contacto del cliente
    const params: any = {
      document: this.document,
      tenantId: this.selectedTenantId
    };

    if (this.selectedPortfolioId) {
      params.portfolioId = this.selectedPortfolioId;
    }

    if (this.selectedSubPortfolioId) {
      params.subPortfolioId = this.selectedSubPortfolioId;
    }

    this.http.get<{customerId: string, email: string, phone: string}>(`${environment.apiUrl}/customers/blacklist-contact-info`, { params })
      .subscribe({
        next: (contactInfo) => {
          this.customerId = contactInfo.customerId ? parseInt(contactInfo.customerId) : null;
          this.customerEmail = contactInfo.email || '';
          this.customerPhone = contactInfo.phone || '';
          this.showConfirmDialog.set(true);
        },
        error: (error) => {
          console.error('Error al obtener información de contacto:', error);
          if (error.status === 404) {
            this.showError('Cliente no encontrado en el contexto seleccionado (proveedor/cartera/subcartera)');
          } else {
            this.showError('Error al buscar el cliente. Por favor, intente nuevamente.');
          }
        }
      });
  }

  showError(message: string) {
    this.errorMessage.set(message);
    setTimeout(() => {
      this.errorMessage.set(null);
    }, 4000);
  }

  closeConfirmDialog() {
    this.showConfirmDialog.set(false);
  }

  getSelectedTenantName(): string {
    const tenant = this.tenants().find(t => t.id == this.selectedTenantId);
    return tenant?.tenantName || '';
  }

  getSelectedPortfolioName(): string {
    const portfolio = this.portfolios().find(p => p.id == this.selectedPortfolioId);
    return portfolio?.portfolioName || '';
  }

  getSelectedSubPortfolioName(): string {
    const subPortfolio = this.subPortfolios().find(s => s.id == this.selectedSubPortfolioId);
    return subPortfolio?.subPortfolioName || '';
  }

  confirmAddBlacklist() {
    const tenant = this.tenants().find(t => t.id == this.selectedTenantId);
    const portfolio = this.portfolios().find(p => p.id == this.selectedPortfolioId);
    const subPortfolio = this.subPortfolios().find(s => s.id == this.selectedSubPortfolioId);

    const blacklist: Blacklist = {
      customerId: this.customerId || undefined,
      tenantId: this.selectedTenantId!,
      tenantName: tenant?.tenantName || '',
      portfolioId: this.selectedPortfolioId || undefined,
      portfolioName: portfolio?.portfolioName || undefined,
      subPortfolioId: this.selectedSubPortfolioId || undefined,
      subPortfolioName: subPortfolio?.subPortfolioName || undefined,
      document: this.document,
      email: this.customerEmail,
      phone: this.customerPhone,
      startDate: new Date().toISOString().split('T')[0],
      endDate: this.endDate
    };

    this.blacklistService.createBlacklist(blacklist).subscribe({
      next: () => {
        this.loadBlacklists();
        this.closeConfirmDialog();
        this.resetForm();
      },
      error: (error) => console.error('Error creating blacklist:', error)
    });
  }

  resetForm() {
    this.selectedTenantId = null;
    this.selectedPortfolioId = null;
    this.selectedSubPortfolioId = null;
    this.document = '';
    this.endDate = '';
    this.customerId = null;
    this.customerEmail = '';
    this.customerPhone = '';
    this.portfolios.set([]);
    this.subPortfolios.set([]);
  }

  deleteBlacklist(blacklist: Blacklist) {
    if (confirm(`¿Estás seguro de eliminar este bloqueo?`)) {
      this.blacklistService.deleteBlacklist(blacklist.id!).subscribe({
        next: () => this.loadBlacklists(),
        error: (error) => console.error('Error deleting blacklist:', error)
      });
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  toggleFilterPopover(filterName: string) {
    if (this.openFilterPopover === filterName) {
      this.openFilterPopover = null;
    } else {
      this.openFilterPopover = filterName;
    }
  }
}
