import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TypificationService } from '../../services/typification.service';
import { Tenant } from '../../models/tenant.model';

@Component({
  selector: 'app-tenant-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-slate-950 p-6">
      <!-- Header -->
      <div class="max-w-7xl mx-auto mb-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <lucide-angular name="building-2" [size]="24" class="text-white"></lucide-angular>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-white">Gestión de Proveedores</h1>
                <p class="text-sm text-gray-400">Administra los clientes y proveedores del sistema</p>
              </div>
            </div>
          </div>

          <button (click)="openCreateDialog()"
                  class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
            <lucide-angular name="plus" [size]="18"></lucide-angular>
            <span>Nuevo Proveedor</span>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="max-w-7xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Total Proveedores</p>
              <p class="text-3xl font-bold text-white">{{ tenants().length }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center">
              <lucide-angular name="building-2" [size]="24" class="text-blue-400"></lucide-angular>
            </div>
          </div>
        </div>

        <div class="bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Activos</p>
              <p class="text-3xl font-bold text-green-400">{{ getActiveTenants() }}</p>
            </div>
            <div class="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center">
              <lucide-angular name="check-circle" [size]="24" class="text-green-400"></lucide-angular>
            </div>
          </div>
        </div>

        <div class="bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Inactivos</p>
              <p class="text-3xl font-bold text-gray-500">{{ getInactiveTenants() }}</p>
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
                     (ngModelChange)="filterTenants()"
                     placeholder="Buscar por código, nombre o razón social..."
                     class="w-full pl-12 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
        </div>
      </div>

      <!-- Tenants Table -->
      <div class="max-w-7xl mx-auto">
        <div class="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden">
          @if (loading()) {
            <div class="p-12 text-center">
              <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p class="mt-4 text-gray-400">Cargando proveedores...</p>
            </div>
          } @else if (filteredTenants().length === 0) {
            <div class="p-12 text-center">
              <div class="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <lucide-angular name="building-2" [size]="32" class="text-gray-600"></lucide-angular>
              </div>
              <p class="text-gray-300 mb-2">No se encontraron proveedores</p>
              <p class="text-sm text-gray-500">
                @if (searchTerm) {
                  Intenta con otro término de búsqueda
                } @else {
                  Comienza creando tu primer proveedor
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
                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Razón Social</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                  @for (tenant of filteredTenants(); track tenant.id) {
                    <tr class="hover:bg-slate-800 transition-colors">
                      <td class="px-6 py-3">
                        <span class="font-mono text-sm font-semibold text-white">{{ tenant.tenantCode }}</span>
                      </td>
                      <td class="px-6 py-3">
                        <span class="font-medium text-white">{{ tenant.tenantName }}</span>
                      </td>
                      <td class="px-6 py-3">
                        <span class="text-sm text-gray-400">{{ tenant.businessName || '-' }}</span>
                      </td>
                      <td class="px-6 py-3">
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox"
                                 [checked]="tenant.isActive"
                                 (change)="toggleTenantStatus(tenant)"
                                 class="sr-only peer">
                          <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </td>
                      <td class="px-6 py-3">
                        <div class="flex items-center gap-2">
                          <button (click)="editTenant(tenant)"
                                  class="p-2 text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                  title="Editar">
                            <lucide-angular name="edit" [size]="16"></lucide-angular>
                          </button>
                          <button (click)="deleteTenant(tenant)"
                                  [disabled]="tenant.hasPortfolios"
                                  [class]="tenant.hasPortfolios ? 'text-gray-600 cursor-not-allowed' : 'text-red-400 hover:bg-slate-800 cursor-pointer'"
                                  class="p-2 rounded-lg transition-colors disabled:opacity-50"
                                  [title]="tenant.hasPortfolios ? 'No se puede eliminar: tiene carteras asociadas' : 'Eliminar'">
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

      <!-- Create/Edit Dialog -->
      @if (showDialog()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-800">
            <!-- Dialog Header -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <lucide-angular name="building-2" [size]="20"></lucide-angular>
                  </div>
                  <div>
                    <h2 class="text-xl font-bold">{{ editingTenant() ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h2>
                    <p class="text-blue-100 text-sm">Complete la información del proveedor</p>
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
                <!-- Código -->
                <div>
                  <label class="block text-sm font-semibold text-gray-300 mb-2">
                    Código del Proveedor *
                  </label>
                  <input type="text"
                         [(ngModel)]="formData.tenantCode"
                         [disabled]="editingTenant() !== null"
                         maxlength="3"
                         placeholder="Ej: F01, ABC"
                         [class]="getCodeErrorMessage() ? 'w-full px-4 py-2.5 bg-slate-800 border-2 border-red-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-slate-950 disabled:text-gray-600 uppercase' : 'w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-950 disabled:text-gray-600 uppercase'">
                  @if (getCodeErrorMessage()) {
                    <p class="text-xs text-red-400 mt-1 font-semibold">{{ getCodeErrorMessage() }}</p>
                  } @else {
                    <p class="text-xs text-gray-500 mt-1">Código único alfanumérico de máximo 3 caracteres (no se puede cambiar después de crear)</p>
                  }
                </div>

                <!-- Nombre -->
                <div>
                  <label class="block text-sm font-semibold text-gray-300 mb-2">
                    Nombre del Proveedor *
                  </label>
                  <input type="text"
                         [(ngModel)]="formData.tenantName"
                         placeholder="Ej: Financiera XYZ"
                         [class]="getNameErrorMessage() ? 'w-full px-4 py-2.5 bg-slate-800 border-2 border-red-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500' : 'w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'">
                  @if (getNameErrorMessage()) {
                    <p class="text-xs text-red-400 mt-1 font-semibold">{{ getNameErrorMessage() }}</p>
                  }
                </div>

                <!-- Razón Social -->
                <div>
                  <label class="block text-sm font-semibold text-gray-300 mb-2">
                    Razón Social
                  </label>
                  <input type="text"
                         [(ngModel)]="formData.businessName"
                         placeholder="Ej: Financiera XYZ S.A.C."
                         [class]="getBusinessNameErrorMessage() ? 'w-full px-4 py-2.5 bg-slate-800 border-2 border-red-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500' : 'w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'">
                  @if (getBusinessNameErrorMessage()) {
                    <p class="text-xs text-red-400 mt-1 font-semibold">{{ getBusinessNameErrorMessage() }}</p>
                  } @else {
                    <p class="text-xs text-gray-500 mt-1">Nombre legal de la empresa (opcional)</p>
                  }
                </div>
              </div>
            </div>

            <!-- Dialog Footer -->
            <div class="border-t border-slate-800 p-4 flex justify-end gap-3 bg-slate-950">
              <button (click)="closeDialog()"
                      class="px-5 py-2 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
                Cancelar
              </button>
              <button (click)="saveTenant()"
                      [disabled]="!canSave()"
                      class="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {{ editingTenant() ? 'Guardar Cambios' : 'Crear Proveedor' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TenantMaintenanceComponent implements OnInit {
  tenants = signal<Tenant[]>([]);
  filteredTenants = signal<Tenant[]>([]);
  loading = signal(true);
  showDialog = signal(false);
  editingTenant = signal<Tenant | null>(null);
  searchTerm = '';

  formData = {
    tenantCode: '',
    tenantName: '',
    businessName: ''
  };

  constructor(private typificationService: TypificationService) {}

  ngOnInit() {
    this.loadTenants();
  }

  loadTenants() {
    this.loading.set(true);
    this.typificationService.getAllTenants().subscribe({
      next: (tenants) => {
        this.tenants.set(tenants);
        this.filteredTenants.set(tenants);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading tenants:', error);
        this.loading.set(false);
      }
    });
  }

  filterTenants() {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredTenants.set(this.tenants());
      return;
    }

    const filtered = this.tenants().filter(t =>
      t.tenantCode.toLowerCase().includes(term) ||
      t.tenantName.toLowerCase().includes(term) ||
      (t.businessName && t.businessName.toLowerCase().includes(term))
    );
    this.filteredTenants.set(filtered);
  }

  getActiveTenants(): number {
    return this.tenants().filter(t => t.isActive).length;
  }

  getInactiveTenants(): number {
    return this.tenants().filter(t => !t.isActive).length;
  }

  openCreateDialog() {
    this.editingTenant.set(null);
    this.formData = {
      tenantCode: '',
      tenantName: '',
      businessName: ''
    };
    this.showDialog.set(true);
  }

  editTenant(tenant: Tenant) {
    this.editingTenant.set(tenant);
    this.formData = {
      tenantCode: tenant.tenantCode,
      tenantName: tenant.tenantName,
      businessName: tenant.businessName || ''
    };
    this.showDialog.set(true);
  }

  closeDialog() {
    this.showDialog.set(false);
    this.editingTenant.set(null);
  }

  canSave(): boolean {
    if (!this.formData.tenantCode.trim() || !this.formData.tenantName.trim()) {
      return false;
    }

    // Validar duplicados
    if (this.getCodeErrorMessage() || this.getNameErrorMessage() || this.getBusinessNameErrorMessage()) {
      return false;
    }

    return true;
  }

  getCodeErrorMessage(): string {
    if (!this.formData.tenantCode.trim()) {
      return '';
    }

    if (!this.editingTenant()) {
      const codeExists = this.tenants().some(
        t => t.tenantCode.toLowerCase() === this.formData.tenantCode.trim().toLowerCase()
      );
      if (codeExists) {
        return 'Este código ya está en uso';
      }
    }

    return '';
  }

  getNameErrorMessage(): string {
    if (!this.formData.tenantName.trim()) {
      return '';
    }

    const editing = this.editingTenant();
    const nameExists = this.tenants().some(
      t => (!editing || t.id !== editing.id) && t.tenantName.toLowerCase() === this.formData.tenantName.trim().toLowerCase()
    );

    if (nameExists) {
      return 'Este nombre ya está en uso';
    }

    return '';
  }

  getBusinessNameErrorMessage(): string {
    if (!this.formData.businessName?.trim()) {
      return '';
    }

    const editing = this.editingTenant();
    const businessNameExists = this.tenants().some(
      t => (!editing || t.id !== editing.id) && t.businessName && t.businessName.toLowerCase() === this.formData.businessName.trim().toLowerCase()
    );

    if (businessNameExists) {
      return 'Esta razón social ya está en uso';
    }

    return '';
  }

  saveTenant() {
    if (!this.canSave()) return;

    const editing = this.editingTenant();
    if (editing) {
      // Update
      this.typificationService.updateTenant(editing.id, this.formData).subscribe({
        next: () => {
          this.loadTenants();
          this.closeDialog();
        },
        error: (error) => {
          console.error('Error updating tenant:', error);
          alert('Error al actualizar el proveedor');
        }
      });
    } else {
      // Create
      this.typificationService.createTenant(this.formData).subscribe({
        next: () => {
          this.loadTenants();
          this.closeDialog();
        },
        error: (error) => {
          console.error('Error creating tenant:', error);
          alert('Error al crear el proveedor. Verifique que el código no esté duplicado.');
        }
      });
    }
  }

  toggleTenantStatus(tenant: Tenant) {
    const newStatus = !tenant.isActive;
    const action = newStatus ? 'activar' : 'desactivar';

    if (confirm(`¿Está seguro de ${action} el proveedor "${tenant.tenantName}"?`)) {
      this.typificationService.updateTenant(tenant.id, {
        ...tenant,
        isActive: newStatus
      }).subscribe({
        next: () => {
          this.loadTenants();
        },
        error: (error) => {
          console.error('Error updating tenant status:', error);
          alert('Error al cambiar el estado del proveedor');
        }
      });
    }
  }

  deleteTenant(tenant: Tenant) {
    if (tenant.hasPortfolios) {
      alert('No se puede eliminar este proveedor porque tiene carteras asociadas.');
      return;
    }

    if (confirm(`¿Está seguro de eliminar el proveedor "${tenant.tenantName}"? Esta acción no se puede deshacer.`)) {
      this.typificationService.deleteTenant(tenant.id).subscribe({
        next: () => {
          this.loadTenants();
          alert('Proveedor eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error deleting tenant:', error);
          alert('Error al eliminar el proveedor');
        }
      });
    }
  }
}
