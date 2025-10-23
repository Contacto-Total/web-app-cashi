import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { PortfolioService } from '../../services/portfolio.service';
import { TypificationService } from '../../services/typification.service';
import { Portfolio, SubPortfolio, CreateSubPortfolioRequest, UpdateSubPortfolioRequest } from '../../models/portfolio.model';
import { Tenant } from '../../models/tenant.model';

@Component({
  selector: 'app-subportfolio-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-slate-950 p-6">
      <!-- Header -->
      <div class="max-w-7xl mx-auto mb-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                <lucide-angular name="folder-tree" [size]="24" class="text-white"></lucide-angular>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-white">Gestión de Subcarteras</h1>
                <p class="text-sm text-gray-400">Administra las subcarteras dentro de cada cartera</p>
              </div>
            </div>
          </div>

          <button (click)="openCreateDialog()"
                  [disabled]="selectedPortfolioId === 0"
                  class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer">
            <lucide-angular name="plus" [size]="18"></lucide-angular>
            <span>Nueva Subcartera</span>
          </button>
        </div>
      </div>

      <!-- Tenant and Portfolio Selector -->
      <div class="max-w-7xl mx-auto mb-6">
        <div class="bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-800">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Proveedor Selector -->
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">
                Seleccionar Proveedor
              </label>
              <select [(ngModel)]="selectedTenantId"
                      (ngModelChange)="onTenantChange()"
                      class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option [value]="0">Seleccione un proveedor...</option>
                @for (tenant of tenants(); track tenant.id) {
                  <option [value]="tenant.id">{{ tenant.tenantName }} ({{ tenant.tenantCode }})</option>
                }
              </select>
            </div>

            <!-- Cartera Selector -->
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">
                Seleccionar Cartera
              </label>
              <select [(ngModel)]="selectedPortfolioId"
                      (ngModelChange)="onPortfolioChange()"
                      [disabled]="selectedTenantId === 0"
                      class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <option [value]="0">Seleccione una cartera...</option>
                @for (portfolio of portfolios(); track portfolio.id) {
                  <option [value]="portfolio.id">{{ portfolio.portfolioName }} ({{ portfolio.portfolioCode }})</option>
                }
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      @if (selectedPortfolioId > 0) {
        <div class="max-w-7xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-800">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-400 mb-1">Total Subcarteras</p>
                <p class="text-3xl font-bold text-white">{{ subPortfolios().length }}</p>
              </div>
              <div class="w-12 h-12 bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <lucide-angular name="folder-tree" [size]="24" class="text-emerald-400"></lucide-angular>
              </div>
            </div>
          </div>

          <div class="bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-800">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-400 mb-1">Activas</p>
                <p class="text-3xl font-bold text-green-400">{{ getActiveSubPortfolios() }}</p>
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
                <p class="text-3xl font-bold text-gray-500">{{ getInactiveSubPortfolios() }}</p>
              </div>
              <div class="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                <lucide-angular name="x-circle" [size]="24" class="text-gray-500"></lucide-angular>
              </div>
            </div>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="max-w-7xl mx-auto mb-6">
          <div class="bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-800">
            <div class="flex items-center gap-4">
              <div class="flex-1 relative">
                <lucide-angular name="search" [size]="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></lucide-angular>
                <input type="text"
                       [(ngModel)]="searchTerm"
                       (ngModelChange)="filterSubPortfolios()"
                       placeholder="Buscar por código o nombre..."
                       class="w-full pl-12 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              </div>
            </div>
          </div>
        </div>

        <!-- SubPortfolios Table -->
        <div class="max-w-7xl mx-auto">
          <div class="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden">
            @if (loading()) {
              <div class="p-12 text-center">
                <div class="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="mt-4 text-gray-400">Cargando subcarteras...</p>
              </div>
            } @else if (filteredSubPortfolios().length === 0) {
              <div class="p-12 text-center">
                <div class="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <lucide-angular name="folder-tree" [size]="32" class="text-gray-600"></lucide-angular>
                </div>
                <p class="text-gray-300 mb-2">No se encontraron subcarteras</p>
                <p class="text-sm text-gray-500">
                  @if (searchTerm) {
                    Intenta con otro término de búsqueda
                  } @else {
                    Comienza creando tu primera subcartera
                  }
                </p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-slate-800 border-b border-slate-700">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Código</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Descripción</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Cartera</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800">
                    @for (subPortfolio of filteredSubPortfolios(); track subPortfolio.id) {
                      <tr class="hover:bg-slate-800 transition-colors">
                        <td class="px-6 py-3">
                          <span class="font-mono text-sm font-semibold text-white">{{ subPortfolio.subPortfolioCode }}</span>
                        </td>
                        <td class="px-6 py-3">
                          <span class="font-medium text-white">{{ subPortfolio.subPortfolioName }}</span>
                        </td>
                        <td class="px-6 py-3">
                          <span class="text-sm text-gray-400">{{ subPortfolio.description || '-' }}</span>
                        </td>
                        <td class="px-6 py-3">
                          <span class="text-sm text-gray-400">{{ subPortfolio.portfolioName }}</span>
                        </td>
                        <td class="px-6 py-3">
                          <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox"
                                   [checked]="subPortfolio.isActive"
                                   (change)="toggleSubPortfolioStatus(subPortfolio)"
                                   class="sr-only peer">
                            <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                        </td>
                        <td class="px-6 py-3">
                          <div class="flex items-center gap-2">
                            <button (click)="editSubPortfolio(subPortfolio)"
                                    class="p-2 text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                    title="Editar">
                              <lucide-angular name="edit" [size]="16"></lucide-angular>
                            </button>
                            <button (click)="deleteSubPortfolio(subPortfolio)"
                                    class="p-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                    title="Eliminar">
                              <lucide-angular name="trash-2" [size]="16"></lucide-angular>
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
    </div>

    <!-- Create/Edit Dialog -->
    @if (showDialog()) {
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-800">
          <!-- Dialog Header -->
          <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 p-5 text-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <lucide-angular name="folder-tree" [size]="20"></lucide-angular>
                </div>
                <div>
                  <h2 class="text-xl font-bold">{{ editingSubPortfolio() ? 'Editar Subcartera' : 'Nueva Subcartera' }}</h2>
                  <p class="text-emerald-100 text-sm">Complete la información de la subcartera</p>
                </div>
              </div>
              <button (click)="closeDialog()" class="text-white/80 hover:text-white">
                <lucide-angular name="x" [size]="20"></lucide-angular>
              </button>
            </div>
          </div>

          <!-- Dialog Body -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div class="space-y-4">
              <!-- Cartera (solo al crear) -->
              @if (editingSubPortfolio() === null) {
                <div>
                  <label class="block text-sm font-semibold text-gray-300 mb-2">
                    Cartera
                  </label>
                  <select [(ngModel)]="selectedPortfolioIdForForm"
                          disabled
                          class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 opacity-70 cursor-not-allowed">
                    @for (portfolio of portfolios(); track portfolio.id) {
                      <option [value]="portfolio.id">{{ portfolio.portfolioName }} ({{ portfolio.portfolioCode }})</option>
                    }
                  </select>
                  <p class="text-xs text-gray-500 mt-1">La subcartera se creará para la cartera seleccionada</p>
                </div>
              }

              <!-- Código -->
              <div>
                <label class="block text-sm font-semibold text-gray-300 mb-2">
                  Código de la Subcartera *
                </label>
                <input type="text"
                       [(ngModel)]="formData.subPortfolioCode"
                       [disabled]="editingSubPortfolio() !== null"
                       maxlength="3"
                       placeholder="Ej: S01, ABC"
                       [class]="getCodeErrorMessage() ? 'w-full px-4 py-2.5 bg-slate-800 border-2 border-red-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-slate-950 disabled:text-gray-600 uppercase' : 'w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-950 disabled:text-gray-600 uppercase'">
                @if (getCodeErrorMessage()) {
                  <p class="text-xs text-red-400 mt-1 font-semibold">{{ getCodeErrorMessage() }}</p>
                } @else {
                  <p class="text-xs text-gray-500 mt-1">Código único alfanumérico de máximo 3 caracteres (no se puede cambiar después de crear)</p>
                }
              </div>

              <!-- Nombre -->
              <div>
                <label class="block text-sm font-semibold text-gray-300 mb-2">
                  Nombre de la Subcartera *
                </label>
                <input type="text"
                       [(ngModel)]="formData.subPortfolioName"
                       placeholder="Ej: TC Clásica, Lima"
                       [class]="getNameErrorMessage() ? 'w-full px-4 py-2.5 bg-slate-800 border-2 border-red-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500' : 'w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500'">
                @if (getNameErrorMessage()) {
                  <p class="text-xs text-red-400 mt-1 font-semibold">{{ getNameErrorMessage() }}</p>
                }
              </div>

              <!-- Descripción -->
              <div>
                <label class="block text-sm font-semibold text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea [(ngModel)]="formData.description"
                          placeholder="Descripción de la subcartera..."
                          rows="3"
                          class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
                <p class="text-xs text-gray-500 mt-1">Información adicional sobre la subcartera (opcional)</p>
              </div>
            </div>
          </div>

          <!-- Dialog Footer -->
          <div class="border-t border-slate-800 p-4 flex justify-end gap-3 bg-slate-950">
            <button (click)="closeDialog()"
                    class="px-5 py-2 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
              Cancelar
            </button>
            <button (click)="saveSubPortfolio()"
                    [disabled]="!canSave()"
                    class="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {{ editingSubPortfolio() ? 'Guardar Cambios' : 'Crear Subcartera' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SubPortfolioMaintenanceComponent implements OnInit {
  tenants = signal<Tenant[]>([]);
  portfolios = signal<Portfolio[]>([]);
  subPortfolios = signal<SubPortfolio[]>([]);
  filteredSubPortfolios = signal<SubPortfolio[]>([]);
  loading = signal(false);
  showDialog = signal(false);
  editingSubPortfolio = signal<SubPortfolio | null>(null);
  selectedTenantId = 0;
  selectedPortfolioId = 0;
  selectedPortfolioIdForForm = 0;
  searchTerm = '';

  formData = {
    subPortfolioCode: '',
    subPortfolioName: '',
    description: ''
  };

  constructor(
    private portfolioService: PortfolioService,
    private typificationService: TypificationService
  ) {}

  ngOnInit() {
    this.loadTenants();
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
    this.selectedPortfolioIdForForm = 0;
    this.portfolios.set([]);
    this.subPortfolios.set([]);
    this.filteredSubPortfolios.set([]);

    if (this.selectedTenantId > 0) {
      this.loadPortfolios();
    }
  }

  onPortfolioChange() {
    this.subPortfolios.set([]);
    this.filteredSubPortfolios.set([]);

    if (this.selectedPortfolioId > 0) {
      this.loadSubPortfolios();
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
    this.loading.set(true);
    this.portfolioService.getSubPortfoliosByPortfolio(this.selectedPortfolioId).subscribe({
      next: (subPortfolios) => {
        this.subPortfolios.set(subPortfolios);
        this.filteredSubPortfolios.set(subPortfolios);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading subportfolios:', error);
        this.loading.set(false);
      }
    });
  }

  filterSubPortfolios() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredSubPortfolios.set(this.subPortfolios());
      return;
    }

    const filtered = this.subPortfolios().filter(sp =>
      sp.subPortfolioCode.toLowerCase().includes(term) ||
      sp.subPortfolioName.toLowerCase().includes(term)
    );
    this.filteredSubPortfolios.set(filtered);
  }

  getActiveSubPortfolios(): number {
    return this.subPortfolios().filter(sp => sp.isActive).length;
  }

  getInactiveSubPortfolios(): number {
    return this.subPortfolios().filter(sp => !sp.isActive).length;
  }

  openCreateDialog() {
    if (this.selectedPortfolioId === 0) {
      alert('Por favor seleccione una cartera primero');
      return;
    }
    this.editingSubPortfolio.set(null);
    this.selectedPortfolioIdForForm = this.selectedPortfolioId;
    this.formData = {
      subPortfolioCode: '',
      subPortfolioName: '',
      description: ''
    };
    this.showDialog.set(true);
  }

  editSubPortfolio(subPortfolio: SubPortfolio) {
    this.editingSubPortfolio.set(subPortfolio);
    this.formData = {
      subPortfolioCode: subPortfolio.subPortfolioCode,
      subPortfolioName: subPortfolio.subPortfolioName,
      description: subPortfolio.description || ''
    };
    this.showDialog.set(true);
  }

  closeDialog() {
    this.showDialog.set(false);
    this.editingSubPortfolio.set(null);
  }

  isCodeDuplicated(): boolean {
    const editing = this.editingSubPortfolio();
    if (!this.formData.subPortfolioCode.trim() || editing) {
      return false;
    }

    // Filtrar subcarteras del portfolio seleccionado
    const subPortfoliosInPortfolio = this.subPortfolios().filter(
      sp => sp.portfolioId === this.selectedPortfolioIdForForm
    );

    return subPortfoliosInPortfolio.some(
      sp => sp.subPortfolioCode.toLowerCase() === this.formData.subPortfolioCode.trim().toLowerCase()
    );
  }

  getCodeErrorMessage(): string {
    if (!this.formData.subPortfolioCode.trim()) {
      return '';
    }

    if (this.isCodeDuplicated()) {
      return 'Este código ya está en uso en esta cartera';
    }

    return '';
  }

  isNameDuplicated(): boolean {
    if (!this.formData.subPortfolioName.trim()) {
      return false;
    }

    // Filtrar subcarteras del portfolio seleccionado
    const subPortfoliosInPortfolio = this.subPortfolios().filter(
      sp => sp.portfolioId === this.selectedPortfolioIdForForm
    );

    const editing = this.editingSubPortfolio();
    if (editing) {
      return subPortfoliosInPortfolio.some(
        sp => sp.id !== editing.id && sp.subPortfolioName.toLowerCase() === this.formData.subPortfolioName.trim().toLowerCase()
      );
    } else {
      return subPortfoliosInPortfolio.some(
        sp => sp.subPortfolioName.toLowerCase() === this.formData.subPortfolioName.trim().toLowerCase()
      );
    }
  }

  getNameErrorMessage(): string {
    if (!this.formData.subPortfolioName.trim()) {
      return '';
    }

    if (this.isNameDuplicated()) {
      return 'Este nombre ya está en uso en esta cartera';
    }

    return '';
  }

  canSave(): boolean {
    const editing = this.editingSubPortfolio();
    if (!this.formData.subPortfolioCode.trim() || !this.formData.subPortfolioName.trim()) {
      return false;
    }

    // Validar duplicados
    if (this.getCodeErrorMessage() || this.getNameErrorMessage()) {
      return false;
    }

    if (!editing && this.selectedPortfolioIdForForm <= 0) {
      return false;
    }

    return true;
  }

  saveSubPortfolio() {
    if (!this.canSave()) return;

    const editing = this.editingSubPortfolio();
    if (editing) {
      // Update
      const request: UpdateSubPortfolioRequest = {
        subPortfolioName: this.formData.subPortfolioName,
        description: this.formData.description || undefined
      };

      this.portfolioService.updateSubPortfolio(editing.id, request).subscribe({
        next: () => {
          this.loadSubPortfolios();
          this.closeDialog();
        },
        error: (error) => {
          console.error('Error updating subportfolio:', error);
          alert('Error al actualizar la subcartera');
        }
      });
    } else {
      // Create
      const request: CreateSubPortfolioRequest = {
        portfolioId: this.selectedPortfolioIdForForm,
        subPortfolioCode: this.formData.subPortfolioCode,
        subPortfolioName: this.formData.subPortfolioName,
        description: this.formData.description || undefined
      };

      this.portfolioService.createSubPortfolio(request).subscribe({
        next: () => {
          this.loadSubPortfolios();
          this.closeDialog();
        },
        error: (error) => {
          console.error('Error creating subportfolio:', error);
          alert('Error al crear la subcartera. Verifique que el código no esté duplicado.');
        }
      });
    }
  }

  toggleSubPortfolioStatus(subPortfolio: SubPortfolio) {
    const newStatus = !subPortfolio.isActive;
    const action = newStatus ? 'activar' : 'desactivar';

    if (confirm(`¿Está seguro de ${action} la subcartera "${subPortfolio.subPortfolioName}"?`)) {
      this.portfolioService.toggleSubPortfolioStatus(subPortfolio.id, newStatus).subscribe({
        next: () => {
          this.loadSubPortfolios();
        },
        error: (error) => {
          console.error('Error updating subportfolio status:', error);
          alert('Error al cambiar el estado de la subcartera');
        }
      });
    }
  }

  deleteSubPortfolio(subPortfolio: SubPortfolio) {
    if (confirm(`¿Está seguro de eliminar la subcartera "${subPortfolio.subPortfolioName}"? Esta acción no se puede deshacer.`)) {
      this.portfolioService.deleteSubPortfolio(subPortfolio.id).subscribe({
        next: () => {
          this.loadSubPortfolios();
          alert('Subcartera eliminada exitosamente');
        },
        error: (error) => {
          console.error('Error deleting subportfolio:', error);
          alert('Error al eliminar la subcartera');
        }
      });
    }
  }
}
