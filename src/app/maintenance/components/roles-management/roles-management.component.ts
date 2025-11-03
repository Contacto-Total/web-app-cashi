import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TenantService } from '../../services/tenant.service';
import { PortfolioService } from '../../services/portfolio.service';
import { Tenant } from '../../models/tenant.model';
import { Portfolio } from '../../models/portfolio.model';
import { SubPortfolio } from '../../models/portfolio.model';
import { RolService, RolRequest, RolResponse } from '../../services/rol.service';
import { PermisoService, PermisoResponse } from '../../services/permiso.service';

// Interfaces
interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
}

interface RoleAssignment {
  type: 'INQUILINO' | 'CARTERA' | 'SUBCARTERA';
  tenantId: number;
  portfolioId?: number;
  subPortfolioId?: number;
}

interface Role {
  id?: number;
  name: string;
  description: string;
  permissions: number[]; // IDs de permisos asignados
  assignments: RoleAssignment[]; // Asignaciones múltiples
  active: boolean;
}

@Component({
  selector: 'app-roles-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="h-[calc(100dvh-56px)] bg-slate-950 overflow-hidden flex flex-col">
      <div class="flex-1 overflow-y-auto">
        <div class="p-3 max-w-[1800px] mx-auto">
          <!-- Header -->
          <div class="mb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                <lucide-angular name="shield-check" [size]="16" class="text-white"></lucide-angular>
              </div>
              <div>
                <h1 class="text-lg font-bold text-white">Gestión de Roles</h1>
                <p class="text-xs text-gray-400">Define roles, permisos y asignaciones múltiples</p>
              </div>
            </div>
          </div>

          <!-- Grid de 3 Columnas -->
          <div class="grid grid-cols-12 gap-3">
            <!-- Columna 1: Lista de Roles (25%) -->
            <div class="col-span-3 bg-slate-900 rounded-lg border border-slate-800 shadow-sm flex flex-col max-h-[calc(100vh-140px)]">
              <div class="p-3 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
                <div class="flex items-center gap-2">
                  <lucide-angular name="list" [size]="16" class="text-purple-400"></lucide-angular>
                  <h2 class="text-sm font-bold text-white">Roles</h2>
                  <span class="text-xs text-gray-400">({{ roles().length }})</span>
                </div>
                <button (click)="createNewRole()"
                        class="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1">
                  <lucide-angular name="plus" [size]="12"></lucide-angular>
                  Nuevo
                </button>
              </div>

              <div class="p-2 space-y-1 overflow-y-auto flex-1">
                @if (roles().length === 0) {
                  <div class="text-center py-8">
                    <lucide-angular name="shield-off" [size]="28" class="text-gray-600 mx-auto mb-2"></lucide-angular>
                    <p class="text-xs text-gray-400">Sin roles</p>
                    <p class="text-xs text-gray-500">Crea uno nuevo</p>
                  </div>
                } @else {
                  @for (role of roles(); track role.id) {
                    <div (click)="selectRole(role)"
                         [class]="selectedRole()?.id === role.id ? 'bg-purple-900/40 border-purple-500' : 'bg-slate-800 border-slate-700 hover:border-purple-500/50'"
                         class="p-2 rounded border cursor-pointer transition-all">
                      <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-1">
                            <lucide-angular name="shield-check" [size]="12" class="text-purple-400 flex-shrink-0"></lucide-angular>
                            <h3 class="text-xs font-semibold text-white truncate">{{ role.name }}</h3>
                          </div>
                          <div class="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                            <span>{{ role.permissions.length }} permisos</span>
                            <span>•</span>
                            <span>{{ countSubPortfoliosForRole(role) }} subcarteras</span>
                          </div>
                        </div>
                        <button (click)="deleteRole(role); $event.stopPropagation()"
                                class="p-0.5 text-gray-400 hover:text-red-400 rounded transition-colors flex-shrink-0">
                          <lucide-angular name="trash-2" [size]="12"></lucide-angular>
                        </button>
                      </div>
                    </div>
                  }
                }
              </div>
            </div>

            <!-- Columna 2: Asignaciones (35%) -->
            <div class="col-span-4 bg-slate-900 rounded-lg border border-slate-800 shadow-sm flex flex-col max-h-[calc(100vh-140px)]">
              <div class="p-3 border-b border-slate-800 flex-shrink-0">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <lucide-angular name="map-pin" [size]="16" class="text-green-400"></lucide-angular>
                    <h2 class="text-sm font-bold text-white">Asignaciones</h2>
                    <span class="text-xs text-gray-400">({{ selectedRole() ? selectedRole()!.assignments.length : 0 }})</span>
                  </div>
                  @if (selectedRole()) {
                    <button (click)="toggleExpandAll()"
                            [title]="isAnyExpanded() ? 'Colapsar todo' : 'Expandir todo'"
                            class="p-1 text-xs text-gray-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
                      <lucide-angular [name]="isAnyExpanded() ? 'chevron-up' : 'chevron-down'" [size]="12"></lucide-angular>
                    </button>
                  }
                </div>
              </div>

              <div class="p-3 overflow-y-auto flex-1">
                @if (selectedRole()) {
                  <div class="space-y-1">
                    @for (tenant of tenants(); track tenant.id) {
                      <div class="border border-slate-700 rounded overflow-hidden">
                        <!-- Tenant Level -->
                        <div class="bg-slate-800 p-2">
                          <label class="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox"
                                   [checked]="isTenantAssigned(tenant.id)"
                                   (change)="toggleTenantAssignment(tenant.id)"
                                   class="w-3.5 h-3.5 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500">
                            <lucide-angular name="building-2" [size]="12" class="text-blue-400"></lucide-angular>
                            <span class="text-xs font-semibold text-white group-hover:text-purple-300 flex-1">
                              {{ tenant.tenantName }}
                            </span>
                            @if (getPortfoliosByTenant(tenant.id).length > 0) {
                              <button (click)="toggleTenantExpand(tenant.id); $event.stopPropagation()"
                                      class="p-0.5 hover:bg-slate-700 rounded">
                                <lucide-angular [name]="isTenantExpanded(tenant.id) ? 'chevron-down' : 'chevron-right'"
                                                [size]="12"
                                                class="text-gray-400"></lucide-angular>
                              </button>
                            }
                          </label>
                        </div>

                        <!-- Portfolios (if expanded) -->
                        @if (isTenantExpanded(tenant.id)) {
                          <div class="bg-slate-800/50 pl-4">
                            @if (getPortfoliosByTenant(tenant.id).length === 0) {
                              <div class="p-2 text-xs text-gray-500 italic">
                                Sin carteras
                              </div>
                            }
                            @for (portfolio of getPortfoliosByTenant(tenant.id); track portfolio.id) {
                              <div class="border-t border-slate-700/50">
                                <!-- Portfolio Level -->
                                <div class="p-1.5">
                                  <label class="flex items-center gap-1.5 cursor-pointer group">
                                    <input type="checkbox"
                                           [checked]="isPortfolioAssigned(portfolio.id)"
                                           (change)="togglePortfolioAssignment(tenant.id, portfolio.id)"
                                           class="w-3 h-3 text-green-600 bg-slate-700 border-slate-600 rounded focus:ring-green-500">
                                    <lucide-angular name="folder" [size]="11" class="text-green-400"></lucide-angular>
                                    <span class="text-xs font-medium text-gray-300 group-hover:text-purple-300 flex-1">
                                      {{ portfolio.portfolioName }}
                                    </span>
                                    @if (getSubPortfoliosByPortfolio(portfolio.id).length > 0) {
                                      <button (click)="togglePortfolioExpand(portfolio.id); $event.stopPropagation()"
                                              class="p-0.5 hover:bg-slate-700 rounded">
                                        <lucide-angular [name]="isPortfolioExpanded(portfolio.id) ? 'chevron-down' : 'chevron-right'"
                                                        [size]="11"
                                                        class="text-gray-400"></lucide-angular>
                                      </button>
                                    }
                                  </label>
                                </div>

                                <!-- SubPortfolios (if expanded) -->
                                @if (isPortfolioExpanded(portfolio.id)) {
                                  <div class="pl-3 pb-1">
                                    @if (getSubPortfoliosByPortfolio(portfolio.id).length === 0) {
                                      <div class="p-1 text-xs text-gray-500 italic">
                                        Sin subcarteras
                                      </div>
                                    }
                                    @for (subPortfolio of getSubPortfoliosByPortfolio(portfolio.id); track subPortfolio.id) {
                                      <div class="p-1">
                                        <label class="flex items-center gap-1.5 cursor-pointer group">
                                          <input type="checkbox"
                                                 [checked]="isSubPortfolioAssigned(subPortfolio.id)"
                                                 (change)="toggleSubPortfolioAssignment(tenant.id, portfolio.id, subPortfolio.id)"
                                                 class="w-3 h-3 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500">
                                          <lucide-angular name="folder-tree" [size]="10" class="text-purple-400"></lucide-angular>
                                          <span class="text-xs text-gray-400 group-hover:text-purple-300">
                                            {{ subPortfolio.subPortfolioName }}
                                          </span>
                                        </label>
                                      </div>
                                    }
                                  </div>
                                }
                              </div>
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
                } @else {
                  <div class="text-center py-12">
                    <lucide-angular name="map" [size]="32" class="text-gray-600 mx-auto mb-2"></lucide-angular>
                    <p class="text-xs text-gray-400">Selecciona un rol para asignar</p>
                  </div>
                }
              </div>
            </div>

            <!-- Columna 3: Editor de Rol + Permisos (40%) -->
            <div class="col-span-5 bg-slate-900 rounded-lg border border-slate-800 shadow-sm flex flex-col max-h-[calc(100vh-140px)]">
              <div class="p-3 border-b border-slate-800 flex-shrink-0">
                <div class="flex items-center gap-2">
                  <lucide-angular name="edit" [size]="16" class="text-purple-400"></lucide-angular>
                  <h2 class="text-sm font-bold text-white">
                    {{ selectedRole()?.id ? 'Editar Rol' : selectedRole() ? 'Nuevo Rol' : 'Información' }}
                  </h2>
                </div>
              </div>

              <div class="p-3 space-y-3 overflow-y-auto flex-1">
                @if (selectedRole()) {
                  <!-- Información Básica -->
                  <div class="space-y-2">
                    <div>
                      <label class="block text-xs font-semibold text-gray-300 mb-1">Nombre del Rol</label>
                      <input type="text"
                             [(ngModel)]="selectedRole()!.name"
                             placeholder="Ej: Asesor de Cobranza"
                             class="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500">
                    </div>

                    <div>
                      <label class="block text-xs font-semibold text-gray-300 mb-1">Descripción</label>
                      <textarea [(ngModel)]="selectedRole()!.description"
                                rows="2"
                                placeholder="Describe las responsabilidades..."
                                class="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"></textarea>
                    </div>

                    <div class="flex items-center gap-2">
                      <input type="checkbox"
                             [(ngModel)]="selectedRole()!.active"
                             id="roleActive"
                             class="w-3.5 h-3.5 text-purple-600 bg-slate-800 border-slate-700 rounded focus:ring-purple-500">
                      <label for="roleActive" class="text-xs text-gray-300 cursor-pointer">Rol activo</label>
                    </div>
                  </div>

                  <!-- Permisos -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-xs font-semibold text-purple-300">Permisos</label>
                      <span class="text-xs text-gray-400">{{ selectedRole()!.permissions.length }} seleccionados</span>
                    </div>

                    <div class="space-y-1.5">
                      @for (category of permissionCategories(); track category) {
                        <div class="bg-slate-800 rounded border border-slate-700 p-2">
                          <div class="flex items-center gap-1.5 mb-1.5">
                            <lucide-angular name="package" [size]="12" class="text-purple-400"></lucide-angular>
                            <h4 class="text-xs font-semibold text-white">{{ category }}</h4>
                          </div>
                          <div class="space-y-0.5 ml-4">
                            @for (permission of getPermissionsByCategory(category); track permission.id) {
                              <label class="flex items-start gap-1.5 p-1 hover:bg-slate-700/50 rounded cursor-pointer group">
                                <input type="checkbox"
                                       [checked]="isPermissionSelected(permission.id)"
                                       (change)="togglePermission(permission.id)"
                                       class="mt-0.5 w-3.5 h-3.5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500">
                                <div class="flex-1 min-w-0">
                                  <div class="text-xs font-medium text-gray-300 group-hover:text-white truncate">
                                    {{ permission.name }}
                                  </div>
                                  <div class="text-xs text-gray-500 leading-tight">
                                    {{ permission.description }}
                                  </div>
                                </div>
                              </label>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                } @else {
                  <div class="text-center py-12">
                    <lucide-angular name="hand-metal" [size]="32" class="text-gray-600 mx-auto mb-2"></lucide-angular>
                    <p class="text-sm text-gray-400">Selecciona o crea un rol</p>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          @if (selectedRole()) {
            <div class="mt-3 flex justify-end gap-2">
              <button (click)="cancelEdit()"
                      class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-semibold transition-colors">
                Cancelar
              </button>
              <button (click)="saveRole()"
                      [disabled]="!isRoleValid()"
                      class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded text-sm font-semibold transition-colors flex items-center gap-1.5">
                <lucide-angular name="save" [size]="16"></lucide-angular>
                Guardar
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class RolesManagementComponent implements OnInit {
  // Dropdowns
  tenants = signal<Tenant[]>([]);
  allPortfolios = signal<Portfolio[]>([]);
  allSubPortfolios = signal<SubPortfolio[]>([]);

  // Expansión de árbol
  expandedTenants = signal<number[]>([]);
  expandedPortfolios = signal<number[]>([]);

  // Roles y permisos
  roles = signal<Role[]>([]);
  selectedRole = signal<Role | null>(null);

  // Permisos disponibles (se cargan del backend)
  availablePermissions = signal<Permission[]>([]);

  permissionCategories = computed(() => {
    const categories = new Set(this.availablePermissions().map(p => p.category));
    return Array.from(categories);
  });

  private tenantService = inject(TenantService);
  private portfolioService = inject(PortfolioService);
  private rolService = inject(RolService);
  private permisoService = inject(PermisoService);

  ngOnInit() {
    this.loadAllData();
    this.loadRolesFromBackend();
    this.loadPermissionsFromBackend();
  }

  loadAllData() {
    // Cargar todos los tenants
    this.tenantService.getAllTenants().subscribe({
      next: (tenants) => {
        this.tenants.set(tenants);

        // Cargar portfolios para cada tenant
        tenants.forEach(tenant => {
          this.portfolioService.getPortfoliosByTenant(tenant.id).subscribe({
            next: (portfolios) => {
              // Asegurar que cada portfolio tenga el tenantId correcto
              const portfoliosWithTenant = portfolios.map(p => ({ ...p, tenantId: tenant.id }));
              this.allPortfolios.set([...this.allPortfolios(), ...portfoliosWithTenant]);

              // Cargar subportfolios para cada portfolio
              portfolios.forEach(portfolio => {
                this.portfolioService.getSubPortfoliosByPortfolio(portfolio.id).subscribe({
                  next: (subPortfolios) => {
                    this.allSubPortfolios.set([...this.allSubPortfolios(), ...subPortfolios]);
                  },
                  error: (err) => console.error(`Error loading subportfolios for portfolio ${portfolio.id}:`, err)
                });
              });
            },
            error: (err) => console.error(`Error loading portfolios for tenant ${tenant.id}:`, err)
          });
        });
      },
      error: (err) => console.error('Error loading tenants:', err)
    });
  }

  loadRolesFromBackend() {
    this.rolService.obtenerTodos().subscribe({
      next: (roles) => {
        this.roles.set(roles.map(r => ({
          id: r.idRol,
          name: r.nombreRol,
          description: r.descripcion || '',
          permissions: r.permisoIds,
          assignments: r.asignaciones.map(a => ({
            type: a.tipoAsignacion as 'INQUILINO' | 'CARTERA' | 'SUBCARTERA',
            tenantId: a.tenantId,
            portfolioId: a.portfolioId,
            subPortfolioId: a.subPortfolioId
          })),
          active: r.activo
        })));
      },
      error: (err) => console.error('Error al cargar roles:', err)
    });
  }

  loadPermissionsFromBackend() {
    this.permisoService.obtenerTodos().subscribe({
      next: (permisos) => {
        this.availablePermissions.set(permisos.map(p => ({
          id: p.idPermiso,
          code: p.codigoPermiso,
          name: p.nombrePermiso,
          description: p.descripcion || '',
          category: p.categoria
        })));
      },
      error: (err) => console.error('Error al cargar permisos:', err)
    });
  }

  getPortfoliosByTenant(tenantId: number): Portfolio[] {
    return this.allPortfolios().filter(p => p.tenantId === tenantId);
  }

  getSubPortfoliosByPortfolio(portfolioId: number): SubPortfolio[] {
    return this.allSubPortfolios().filter(sp => sp.portfolioId === portfolioId);
  }

  // Calcular el número real de subcarteras cubiertas por las asignaciones de un rol
  countSubPortfoliosForRole(role: Role): number {
    const subPortfolioIds = new Set<number>();

    role.assignments.forEach(assignment => {
      if (assignment.type === 'INQUILINO') {
        // Contar todas las subcarteras de este tenant
        const portfolios = this.allPortfolios().filter(p => p.tenantId === assignment.tenantId);
        portfolios.forEach(portfolio => {
          const subPortfolios = this.allSubPortfolios().filter(sp => sp.portfolioId === portfolio.id);
          subPortfolios.forEach(sp => subPortfolioIds.add(sp.id));
        });
      } else if (assignment.type === 'CARTERA' && assignment.portfolioId) {
        // Contar todas las subcarteras de este portfolio
        const subPortfolios = this.allSubPortfolios().filter(sp => sp.portfolioId === assignment.portfolioId);
        subPortfolios.forEach(sp => subPortfolioIds.add(sp.id));
      } else if (assignment.type === 'SUBCARTERA' && assignment.subPortfolioId) {
        // Contar solo esta subcartera
        subPortfolioIds.add(assignment.subPortfolioId);
      }
    });

    return subPortfolioIds.size;
  }

  // Expansión de árbol
  toggleTenantExpand(tenantId: number) {
    const expanded = this.expandedTenants();
    if (expanded.includes(tenantId)) {
      this.expandedTenants.set(expanded.filter(id => id !== tenantId));
    } else {
      this.expandedTenants.set([...expanded, tenantId]);
    }
  }

  isTenantExpanded(tenantId: number): boolean {
    return this.expandedTenants().includes(tenantId);
  }

  togglePortfolioExpand(portfolioId: number) {
    const expanded = this.expandedPortfolios();
    if (expanded.includes(portfolioId)) {
      this.expandedPortfolios.set(expanded.filter(id => id !== portfolioId));
    } else {
      this.expandedPortfolios.set([...expanded, portfolioId]);
    }
  }

  isPortfolioExpanded(portfolioId: number): boolean {
    return this.expandedPortfolios().includes(portfolioId);
  }

  // Verificar asignaciones (con herencia visual)
  isTenantAssigned(tenantId: number): boolean {
    const role = this.selectedRole();
    if (!role) return false;
    return role.assignments.some(a => a.type === 'INQUILINO' && a.tenantId === tenantId);
  }

  isPortfolioAssigned(portfolioId: number): boolean {
    const role = this.selectedRole();
    if (!role) return false;

    // Buscar el portfolio para obtener su tenantId
    const portfolio = this.allPortfolios().find(p => p.id === portfolioId);
    if (!portfolio) return false;

    // Está marcado si: hay asignación de TENANT o asignación directa de PORTFOLIO
    return role.assignments.some(a =>
      (a.type === 'INQUILINO' && a.tenantId === portfolio.tenantId) ||
      (a.type === 'CARTERA' && a.portfolioId === portfolioId)
    );
  }

  isSubPortfolioAssigned(subPortfolioId: number): boolean {
    const role = this.selectedRole();
    if (!role) return false;

    // Buscar el subportfolio para obtener su portfolioId
    const subPortfolio = this.allSubPortfolios().find(sp => sp.id === subPortfolioId);
    if (!subPortfolio) return false;

    // Buscar el portfolio para obtener su tenantId
    const portfolio = this.allPortfolios().find(p => p.id === subPortfolio.portfolioId);
    if (!portfolio) return false;

    // Está marcado si: hay asignación de TENANT, PORTFOLIO o SUBPORTFOLIO
    return role.assignments.some(a =>
      (a.type === 'INQUILINO' && a.tenantId === portfolio.tenantId) ||
      (a.type === 'CARTERA' && a.portfolioId === subPortfolio.portfolioId) ||
      (a.type === 'SUBCARTERA' && a.subPortfolioId === subPortfolioId)
    );
  }

  // Toggle asignaciones
  toggleTenantAssignment(tenantId: number) {
    const role = this.selectedRole();
    if (!role) return;

    if (this.isTenantAssigned(tenantId)) {
      // Desmarcar tenant y todas sus carteras/subcarteras
      role.assignments = role.assignments.filter(a => a.tenantId !== tenantId);
    } else {
      // Marcar tenant (esto implica todas las carteras y subcarteras)
      role.assignments.push({ type: 'INQUILINO', tenantId });

      // Remover asignaciones específicas de portfolios/subportfolios de este tenant
      role.assignments = role.assignments.filter(a =>
        !(a.tenantId === tenantId && (a.type === 'CARTERA' || a.type === 'SUBCARTERA'))
      );
    }

    this.selectedRole.set({ ...role });
  }

  togglePortfolioAssignment(tenantId: number, portfolioId: number) {
    const role = this.selectedRole();
    if (!role) return;

    const isTenantAssigned = this.isTenantAssigned(tenantId);
    const isCurrentlyAssigned = this.isPortfolioAssigned(portfolioId);

    if (isCurrentlyAssigned) {
      // Desmarcar portfolio
      if (isTenantAssigned) {
        // Si el tenant está asignado, necesitamos convertir a asignaciones específicas
        // Eliminar asignación de TENANT
        role.assignments = role.assignments.filter(a =>
          !(a.type === 'INQUILINO' && a.tenantId === tenantId)
        );

        // Añadir asignaciones de PORTFOLIO para todos los portfolios del tenant EXCEPTO este
        const portfoliosOfTenant = this.getPortfoliosByTenant(tenantId);
        portfoliosOfTenant.forEach(p => {
          if (p.id !== portfolioId) {
            role.assignments.push({ type: 'CARTERA', tenantId, portfolioId: p.id });
          }
        });
      } else {
        // Solo eliminar la asignación de PORTFOLIO específica
        role.assignments = role.assignments.filter(a =>
          !(a.type === 'CARTERA' && a.portfolioId === portfolioId)
        );
      }

      // Eliminar todas las asignaciones de subportfolios de este portfolio
      role.assignments = role.assignments.filter(a =>
        !(a.type === 'SUBCARTERA' && a.portfolioId === portfolioId)
      );
    } else {
      // Marcar portfolio
      role.assignments.push({ type: 'CARTERA', tenantId, portfolioId });

      // Remover asignaciones específicas de subportfolios de este portfolio
      role.assignments = role.assignments.filter(a =>
        !(a.type === 'SUBCARTERA' && a.portfolioId === portfolioId)
      );

      // Verificar si ahora todos los portfolios del tenant están asignados
      const portfoliosOfTenant = this.getPortfoliosByTenant(tenantId);
      const allPortfoliosAssigned = portfoliosOfTenant.every(p =>
        role.assignments.some(a => a.type === 'CARTERA' && a.portfolioId === p.id)
      );

      if (allPortfoliosAssigned && portfoliosOfTenant.length > 0) {
        // Consolidar en una asignación de TENANT
        role.assignments = role.assignments.filter(a =>
          !(a.type === 'CARTERA' && a.tenantId === tenantId)
        );
        role.assignments.push({ type: 'INQUILINO', tenantId });
      }
    }

    this.selectedRole.set({ ...role });
  }

  toggleSubPortfolioAssignment(tenantId: number, portfolioId: number, subPortfolioId: number) {
    const role = this.selectedRole();
    if (!role) return;

    const isTenantAssigned = this.isTenantAssigned(tenantId);
    const isPortfolioAssigned = this.isPortfolioAssigned(portfolioId);
    const isCurrentlyAssigned = this.isSubPortfolioAssigned(subPortfolioId);

    if (isCurrentlyAssigned) {
      // Desmarcar subcartera
      if (isTenantAssigned) {
        // Convertir asignación de TENANT a PORTFOLIO específicos
        role.assignments = role.assignments.filter(a =>
          !(a.type === 'INQUILINO' && a.tenantId === tenantId)
        );

        const portfoliosOfTenant = this.getPortfoliosByTenant(tenantId);
        portfoliosOfTenant.forEach(p => {
          if (p.id === portfolioId) {
            // Para este portfolio, añadir todas las subcarteras EXCEPTO la desmarcada
            const subPortfoliosOfPortfolio = this.getSubPortfoliosByPortfolio(p.id);
            subPortfoliosOfPortfolio.forEach(sp => {
              if (sp.id !== subPortfolioId) {
                role.assignments.push({ type: 'SUBCARTERA', tenantId, portfolioId: p.id, subPortfolioId: sp.id });
              }
            });
          } else {
            // Para otros portfolios, mantener asignación de PORTFOLIO
            role.assignments.push({ type: 'CARTERA', tenantId, portfolioId: p.id });
          }
        });
      } else if (isPortfolioAssigned && !role.assignments.some(a => a.type === 'SUBCARTERA' && a.portfolioId === portfolioId)) {
        // Si el portfolio está asignado (no como subportfolios individuales), convertir a asignaciones específicas
        role.assignments = role.assignments.filter(a =>
          !(a.type === 'CARTERA' && a.portfolioId === portfolioId)
        );

        const subPortfoliosOfPortfolio = this.getSubPortfoliosByPortfolio(portfolioId);
        subPortfoliosOfPortfolio.forEach(sp => {
          if (sp.id !== subPortfolioId) {
            role.assignments.push({ type: 'SUBCARTERA', tenantId, portfolioId, subPortfolioId: sp.id });
          }
        });
      } else {
        // Solo eliminar la asignación de SUBPORTFOLIO específica
        role.assignments = role.assignments.filter(a =>
          !(a.type === 'SUBCARTERA' && a.subPortfolioId === subPortfolioId)
        );
      }
    } else {
      // Marcar subcartera
      role.assignments.push({ type: 'SUBCARTERA', tenantId, portfolioId, subPortfolioId });

      // Verificar si ahora todas las subcarteras del portfolio están asignadas
      const subPortfoliosOfPortfolio = this.getSubPortfoliosByPortfolio(portfolioId);
      const allSubPortfoliosAssigned = subPortfoliosOfPortfolio.every(sp =>
        role.assignments.some(a => a.type === 'SUBCARTERA' && a.subPortfolioId === sp.id)
      );

      if (allSubPortfoliosAssigned && subPortfoliosOfPortfolio.length > 0) {
        // Consolidar en una asignación de PORTFOLIO
        role.assignments = role.assignments.filter(a =>
          !(a.type === 'SUBCARTERA' && a.portfolioId === portfolioId)
        );
        role.assignments.push({ type: 'CARTERA', tenantId, portfolioId });

        // Verificar si ahora todos los portfolios del tenant están asignados
        const portfoliosOfTenant = this.getPortfoliosByTenant(tenantId);
        const allPortfoliosAssigned = portfoliosOfTenant.every(p =>
          role.assignments.some(a => a.type === 'CARTERA' && a.portfolioId === p.id)
        );

        if (allPortfoliosAssigned && portfoliosOfTenant.length > 0) {
          // Consolidar en una asignación de TENANT
          role.assignments = role.assignments.filter(a =>
            !(a.type === 'CARTERA' && a.tenantId === tenantId)
          );
          role.assignments.push({ type: 'INQUILINO', tenantId });
        }
      }
    }

    this.selectedRole.set({ ...role });
  }

  createNewRole() {
    const newRole: Role = {
      name: '',
      description: '',
      permissions: [],
      assignments: [],
      active: true
    };
    this.selectedRole.set(newRole);
    // Nuevo rol: todo colapsado
    this.expandedTenants.set([]);
    this.expandedPortfolios.set([]);
  }

  selectRole(role: Role) {
    this.selectedRole.set({ ...role });
    // Rol existente: expandir solo las ramas que tienen asignaciones
    this.expandOnlyAssignedBranches();
  }

  isAnyExpanded(): boolean {
    return this.expandedTenants().length > 0 || this.expandedPortfolios().length > 0;
  }

  toggleExpandAll() {
    if (this.isAnyExpanded()) {
      // Colapsar todo
      this.expandedTenants.set([]);
      this.expandedPortfolios.set([]);
    } else {
      // Expandir todo
      const tenantIds = this.tenants().map(t => t.id);
      this.expandedTenants.set(tenantIds);

      const portfolioIds = this.allPortfolios().map(p => p.id);
      this.expandedPortfolios.set(portfolioIds);
    }
  }

  expandOnlyAssignedBranches() {
    const role = this.selectedRole();
    if (!role || role.assignments.length === 0) {
      // No expandir nada si no hay asignaciones
      this.expandedTenants.set([]);
      this.expandedPortfolios.set([]);
      return;
    }

    const tenantsToExpand: number[] = [];
    const portfoliosToExpand: number[] = [];

    role.assignments.forEach(assignment => {
      // Expandir tenant si tiene asignaciones directas de TENANT, PORTFOLIO o SUBPORTFOLIO
      if (assignment.type === 'INQUILINO' || assignment.type === 'CARTERA' || assignment.type === 'SUBCARTERA') {
        if (!tenantsToExpand.includes(assignment.tenantId)) {
          tenantsToExpand.push(assignment.tenantId);
        }
      }

      // Expandir portfolio si tiene asignaciones de PORTFOLIO o SUBPORTFOLIO
      if ((assignment.type === 'CARTERA' || assignment.type === 'SUBCARTERA') && assignment.portfolioId) {
        if (!portfoliosToExpand.includes(assignment.portfolioId)) {
          portfoliosToExpand.push(assignment.portfolioId);
        }
      }
    });

    this.expandedTenants.set(tenantsToExpand);
    this.expandedPortfolios.set(portfoliosToExpand);
  }

  deleteRole(role: Role) {
    if (!role.id) return;

    if (confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) {
      this.rolService.eliminar(role.id).subscribe({
        next: () => {
          const currentRoles = this.roles();
          this.roles.set(currentRoles.filter(r => r.id !== role.id));
          if (this.selectedRole()?.id === role.id) {
            this.selectedRole.set(null);
          }
          alert('Rol eliminado correctamente');
        },
        error: (err) => {
          console.error('Error al eliminar rol:', err);
          alert('Error al eliminar rol: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  getPermissionsByCategory(category: string): Permission[] {
    return this.availablePermissions().filter(p => p.category === category);
  }

  isPermissionSelected(permissionId: number): boolean {
    return this.selectedRole()?.permissions.includes(permissionId) || false;
  }

  togglePermission(permissionId: number) {
    const role = this.selectedRole();
    if (!role) return;

    const index = role.permissions.indexOf(permissionId);
    if (index > -1) {
      role.permissions.splice(index, 1);
    } else {
      role.permissions.push(permissionId);
    }
    this.selectedRole.set({ ...role });
  }

  isRoleValid(): boolean {
    const role = this.selectedRole();
    return !!(role && role.name.trim() && role.description.trim());
  }

  saveRole() {
    const role = this.selectedRole();
    if (!role || !this.isRoleValid()) return;

    const request: RolRequest = {
      nombreRol: role.name,
      descripcion: role.description,
      activo: role.active,
      permisoIds: role.permissions,
      asignaciones: role.assignments.map(a => ({
        tipoAsignacion: a.type,
        tenantId: a.tenantId,
        portfolioId: a.portfolioId,
        subPortfolioId: a.subPortfolioId
      }))
    };

    if (role.id) {
      // Editar existente
      this.rolService.actualizar(role.id, request).subscribe({
        next: (response) => {
          const currentRoles = this.roles();
          const index = currentRoles.findIndex(r => r.id === role.id);
          if (index > -1) {
            currentRoles[index] = {
              id: response.idRol,
              name: response.nombreRol,
              description: response.descripcion || '',
              permissions: response.permisoIds,
              assignments: response.asignaciones.map(a => ({
                type: a.tipoAsignacion as 'INQUILINO' | 'CARTERA' | 'SUBCARTERA',
                tenantId: a.tenantId,
                portfolioId: a.portfolioId,
                subPortfolioId: a.subPortfolioId
              })),
              active: response.activo
            };
            this.roles.set([...currentRoles]);
          }
          this.selectedRole.set(null);
          alert('Rol actualizado correctamente');
        },
        error: (err) => {
          console.error('Error al actualizar rol:', err);
          alert('Error al actualizar rol: ' + (err.error?.message || err.message));
        }
      });
    } else {
      // Crear nuevo
      this.rolService.crear(request).subscribe({
        next: (response) => {
          const newRole: Role = {
            id: response.idRol,
            name: response.nombreRol,
            description: response.descripcion || '',
            permissions: response.permisoIds,
            assignments: response.asignaciones.map(a => ({
              type: a.tipoAsignacion as 'INQUILINO' | 'CARTERA' | 'SUBCARTERA',
              tenantId: a.tenantId,
              portfolioId: a.portfolioId,
              subPortfolioId: a.subPortfolioId
            })),
            active: response.activo
          };
          this.roles.set([...this.roles(), newRole]);
          this.selectedRole.set(null);
          alert('Rol creado correctamente');
        },
        error: (err) => {
          console.error('Error al crear rol:', err);
          alert('Error al crear rol: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  cancelEdit() {
    this.selectedRole.set(null);
  }
}
