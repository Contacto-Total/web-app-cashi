import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { PortfolioService } from '../../services/portfolio.service';
import { TypificationService } from '../../services/typification.service';
import { Portfolio, CreatePortfolioRequest, UpdatePortfolioRequest } from '../../models/portfolio.model';
import { Tenant } from '../../models/tenant.model';

@Component({
  selector: 'app-portfolio-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-slate-950 p-6">
      <!-- Header -->
      <div class="max-w-7xl mx-auto mb-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                <lucide-angular name="folder" [size]="24" class="text-white"></lucide-angular>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-white">Gestión de Carteras</h1>
                <p class="text-sm text-gray-400">Administra las carteras por proveedor</p>
              </div>
            </div>
          </div>

          <button (click)="openCreateDialog()"
                  [disabled]="selectedTenantId === 0"
                  class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer">
            <lucide-angular name="plus" [size]="18"></lucide-angular>
            <span>Nueva Cartera</span>
          </button>
        </div>
      </div>

      <!-- Tenant Selector -->
      <div class="max-w-7xl mx-auto mb-6">
        <div class="bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-800">
          <label class="block text-sm font-semibold text-gray-300 mb-2">
            Seleccionar Proveedor
          </label>
          <select [(ngModel)]="selectedTenantId"
                  (ngModelChange)="onTenantChange()"
                  class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option [value]="0">Seleccione un proveedor...</option>
            @for (tenant of tenants(); track tenant.id) {
              <option [value]="tenant.id">{{ tenant.tenantName }} ({{ tenant.tenantCode }})</option>
            }
          </select>
        </div>
      </div>

      <!-- Stats Cards -->
      @if (selectedTenantId > 0) {
        <div class="max-w-7xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-800">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-400 mb-1">Total Carteras</p>
                <p class="text-3xl font-bold text-white">{{ portfolios().length }}</p>
              </div>
              <div class="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center">
                <lucide-angular name="folder" [size]="24" class="text-purple-400"></lucide-angular>
              </div>
            </div>
          </div>

          <div class="bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-800">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-400 mb-1">Activas</p>
                <p class="text-3xl font-bold text-green-400">{{ getActivePortfolios() }}</p>
              </div>
              <div class="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center">
                <lucide-angular name="check-circle" [size]="24" class="text-green-400"></lucide-angular>
              </div>
            </div>
          </div>

          <div class="bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-800">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-400 mb-1">Inactivas</p>
                <p class="text-3xl font-bold text-red-400">{{ getInactivePortfolios() }}</p>
              </div>
              <div class="w-12 h-12 bg-red-900/30 rounded-lg flex items-center justify-center">
                <lucide-angular name="x-circle" [size]="24" class="text-red-400"></lucide-angular>
              </div>
            </div>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="max-w-7xl mx-auto mb-6">
          <div class="bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-800">
            <div class="relative">
              <lucide-angular name="search" [size]="18" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></lucide-angular>
              <input type="text"
                     [(ngModel)]="searchTerm"
                     placeholder="Buscar carteras por código, nombre o tipo..."
                     class="w-full pl-12 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500">
            </div>
          </div>
        </div>

        <!-- Portfolios Table -->
        <div class="max-w-7xl mx-auto">
          <div class="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-800">
                <thead class="bg-slate-800">
                  <tr>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Código
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                  @for (portfolio of filteredPortfolios(); track portfolio.id) {
                    <tr class="hover:bg-slate-800/50 transition-colors">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center gap-2">
                          <lucide-angular name="folder" [size]="16" class="text-purple-400"></lucide-angular>
                          <span class="text-sm font-medium text-white">{{ portfolio.portfolioCode }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm text-white font-medium">{{ portfolio.portfolioName }}</div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm text-gray-400 max-w-xs truncate">
                          {{ portfolio.description || 'Sin descripción' }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox"
                                 [checked]="portfolio.isActive"
                                 (change)="togglePortfolioStatus(portfolio)"
                                 class="sr-only peer">
                          <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <div class="flex items-center gap-2">
                          <button (click)="openEditDialog(portfolio)"
                                  class="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer">
                            <lucide-angular name="edit" [size]="16"></lucide-angular>
                          </button>
                          <button (click)="deletePortfolio(portfolio)"
                                  [disabled]="portfolio.hasSubPortfolios"
                                  [class]="portfolio.hasSubPortfolios ? 'text-gray-600 cursor-not-allowed' : 'text-red-400 hover:bg-red-900/30 cursor-pointer'"
                                  class="p-2 rounded-lg transition-colors disabled:opacity-50"
                                  [title]="portfolio.hasSubPortfolios ? 'No se puede eliminar: tiene subcarteras asociadas' : 'Eliminar'">
                            <lucide-angular name="trash-2" [size]="16"></lucide-angular>
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                        No se encontraron carteras
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Create/Edit Modal -->
    @if (showDialog) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-slate-900 rounded-xl shadow-xl max-w-md w-full border border-slate-800">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-slate-800">
            <h2 class="text-xl font-bold text-white">
              {{ isEditMode ? 'Editar Cartera' : 'Nueva Cartera' }}
            </h2>
            <button (click)="closeDialog()"
                    class="text-gray-400 hover:text-white transition-colors">
              <lucide-angular name="x" [size]="20"></lucide-angular>
            </button>
          </div>

          <!-- Modal Body -->
          <form (ngSubmit)="savePortfolio()" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">
                Código de Cartera *
              </label>
              <input type="text"
                     [(ngModel)]="formData.portfolioCode"
                     name="portfolioCode"
                     [disabled]="isEditMode"
                     required
                     maxlength="3"
                     placeholder="Ej: C01, ABC"
                     [class]="getCodeErrorMessage() ? 'w-full px-4 py-2.5 bg-slate-800 border-2 border-red-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-slate-950 disabled:text-gray-600 uppercase' : 'w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-950 disabled:text-gray-600 uppercase'">
              @if (getCodeErrorMessage()) {
                <p class="text-xs text-red-400 mt-1 font-semibold">{{ getCodeErrorMessage() }}</p>
              } @else {
                <p class="text-xs text-gray-500 mt-1">Código único de máximo 3 caracteres</p>
              }
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">
                Nombre de Cartera *
              </label>
              <input type="text"
                     [(ngModel)]="formData.portfolioName"
                     name="portfolioName"
                     required
                     maxlength="255"
                     placeholder="Ej: Cartera de Consumo"
                     [class]="getNameErrorMessage() ? 'w-full px-4 py-2.5 bg-slate-800 border-2 border-red-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500' : 'w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500'">
              @if (getNameErrorMessage()) {
                <p class="text-xs text-red-400 mt-1 font-semibold">{{ getNameErrorMessage() }}</p>
              }
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">
                Descripción
              </label>
              <textarea [(ngModel)]="formData.description"
                        name="description"
                        rows="3"
                        placeholder="Descripción de la cartera..."
                        class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
            </div>

            @if (isEditMode) {
              <div class="flex items-center gap-3">
                <input type="checkbox"
                       [(ngModel)]="formData.isActive"
                       name="isActive"
                       id="isActive"
                       class="w-4 h-4 text-purple-600 bg-slate-800 border-slate-700 rounded focus:ring-purple-500">
                <label for="isActive" class="text-sm text-gray-300">
                  Cartera activa
                </label>
              </div>
            }

            <!-- Modal Actions -->
            <div class="flex gap-3 pt-4">
              <button type="button"
                      (click)="closeDialog()"
                      class="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors">
                Cancelar
              </button>
              <button type="submit"
                      [disabled]="isEditMode ? (!formData.portfolioName) : (!canSave())"
                      class="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isEditMode ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: []
})
export class PortfolioMaintenanceComponent implements OnInit {
  tenants = signal<Tenant[]>([]);
  portfolios = signal<Portfolio[]>([]);
  filteredPortfolios = signal<Portfolio[]>([]);

  selectedTenantId = 0;
  searchTerm = '';
  showDialog = false;
  isEditMode = false;
  selectedPortfolio: Portfolio | null = null;

  formData = {
    portfolioCode: '',
    portfolioName: '',
    description: '',
    isActive: true
  };

  constructor(
    private portfolioService: PortfolioService,
    private typificationService: TypificationService
  ) {
    // Watch for search term changes
    this.watchSearchTerm();
  }

  ngOnInit() {
    this.loadTenants();
  }

  loadTenants() {
    this.typificationService.getAllTenants().subscribe({
      next: (tenants: Tenant[]) => {
        this.tenants.set(tenants);
      },
      error: (error: any) => {
        console.error('Error loading tenants:', error);
      }
    });
  }

  onTenantChange() {
    if (this.selectedTenantId > 0) {
      this.loadPortfolios();
    } else {
      this.portfolios.set([]);
      this.filteredPortfolios.set([]);
    }
  }

  loadPortfolios() {
    this.portfolioService.getPortfoliosByTenant(this.selectedTenantId).subscribe({
      next: (portfolios) => {
        this.portfolios.set(portfolios);
        this.filterPortfolios();
      },
      error: (error) => {
        console.error('Error loading portfolios:', error);
      }
    });
  }

  watchSearchTerm() {
    // Simple reactive search - in a real app, use RxJS debounce
    setInterval(() => {
      this.filterPortfolios();
    }, 300);
  }

  filterPortfolios() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredPortfolios.set(this.portfolios());
      return;
    }

    const filtered = this.portfolios().filter(p =>
      p.portfolioCode.toLowerCase().includes(term) ||
      p.portfolioName.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
    this.filteredPortfolios.set(filtered);
  }

  getActivePortfolios(): number {
    return this.portfolios().filter(p => p.isActive).length;
  }

  getInactivePortfolios(): number {
    return this.portfolios().filter(p => !p.isActive).length;
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.selectedPortfolio = null;
    this.formData = {
      portfolioCode: '',
      portfolioName: '',
      description: '',
      isActive: true
    };
    this.showDialog = true;
  }

  openEditDialog(portfolio: Portfolio) {
    this.isEditMode = true;
    this.selectedPortfolio = portfolio;
    this.formData = {
      portfolioCode: portfolio.portfolioCode,
      portfolioName: portfolio.portfolioName,
      description: portfolio.description || '',
      isActive: portfolio.isActive
    };
    this.showDialog = true;
  }

  closeDialog() {
    this.showDialog = false;
    this.isEditMode = false;
    this.selectedPortfolio = null;
  }

  isCodeDuplicated(): boolean {
    if (!this.formData.portfolioCode.trim() || this.isEditMode) {
      return false;
    }

    // Filtrar por tenant (solo validar dentro del mismo proveedor)
    const portfoliosInTenant = this.portfolios().filter(
      p => p.tenantId === this.selectedTenantId
    );

    return portfoliosInTenant.some(
      p => p.portfolioCode.toLowerCase() === this.formData.portfolioCode.trim().toLowerCase()
    );
  }

  isNameDuplicated(): boolean {
    if (!this.formData.portfolioName.trim()) {
      return false;
    }

    // Filtrar por tenant (solo validar dentro del mismo proveedor)
    const portfoliosInTenant = this.portfolios().filter(
      p => p.tenantId === this.selectedTenantId
    );

    if (this.isEditMode && this.selectedPortfolio) {
      return portfoliosInTenant.some(
        p => p.id !== this.selectedPortfolio!.id && p.portfolioName.toLowerCase() === this.formData.portfolioName.trim().toLowerCase()
      );
    } else {
      return portfoliosInTenant.some(
        p => p.portfolioName.toLowerCase() === this.formData.portfolioName.trim().toLowerCase()
      );
    }
  }

  getCodeErrorMessage(): string {
    if (!this.formData.portfolioCode.trim()) {
      return '';
    }

    if (this.isCodeDuplicated()) {
      return 'Este código ya está en uso en este proveedor';
    }

    return '';
  }

  getNameErrorMessage(): string {
    if (!this.formData.portfolioName.trim()) {
      return '';
    }

    if (this.isNameDuplicated()) {
      return 'Este nombre ya está en uso en este proveedor';
    }

    return '';
  }

  canSave(): boolean {
    if (!this.formData.portfolioCode.trim() || !this.formData.portfolioName.trim()) {
      return false;
    }

    if (this.isCodeDuplicated() || this.isNameDuplicated()) {
      return false;
    }

    return true;
  }

  savePortfolio() {
    if (!this.canSave() && !this.isEditMode) return;
    if (this.isEditMode && this.selectedPortfolio) {
      // Update existing portfolio
      const request: UpdatePortfolioRequest = {
        portfolioName: this.formData.portfolioName,
        description: this.formData.description || undefined,
        isActive: this.formData.isActive
      };

      this.portfolioService.updatePortfolio(this.selectedPortfolio.id, request).subscribe({
        next: () => {
          this.closeDialog();
          this.loadPortfolios();
        },
        error: (error) => {
          console.error('Error updating portfolio:', error);
          alert('Error al actualizar la cartera: ' + (error.error?.message || error.message));
        }
      });
    } else {
      // Create new portfolio
      const request: CreatePortfolioRequest = {
        tenantId: this.selectedTenantId,
        portfolioCode: this.formData.portfolioCode,
        portfolioName: this.formData.portfolioName,
        description: this.formData.description || undefined
      };

      this.portfolioService.createPortfolio(request).subscribe({
        next: () => {
          this.closeDialog();
          this.loadPortfolios();
        },
        error: (error) => {
          console.error('Error creating portfolio:', error);
          alert('Error al crear la cartera: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  togglePortfolioStatus(portfolio: Portfolio) {
    const newStatus = !portfolio.isActive;
    const request: UpdatePortfolioRequest = {
      portfolioName: portfolio.portfolioName,
      description: portfolio.description,
      isActive: newStatus
    };

    this.portfolioService.updatePortfolio(portfolio.id, request).subscribe({
      next: () => {
        this.loadPortfolios();
      },
      error: (error: any) => {
        console.error('Error toggling portfolio status:', error);
        alert('Error al cambiar el estado de la cartera: ' + (error.error?.message || error.message));
      }
    });
  }

  deletePortfolio(portfolio: Portfolio) {
    if (portfolio.hasSubPortfolios) {
      alert('No se puede eliminar esta cartera porque tiene subcarteras asociadas.');
      return;
    }

    if (!confirm(`¿Está seguro de que desea eliminar la cartera "${portfolio.portfolioName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.portfolioService.deletePortfolio(portfolio.id).subscribe({
      next: () => {
        this.loadPortfolios();
        alert('Cartera eliminada exitosamente');
      },
      error: (error) => {
        console.error('Error deleting portfolio:', error);
        alert('Error al eliminar la cartera: ' + (error.error?.message || error.message));
      }
    });
  }
}
