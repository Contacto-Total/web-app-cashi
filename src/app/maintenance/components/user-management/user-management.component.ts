import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { UsuarioService, UsuarioRequest, UsuarioResponse } from '../../services/usuario.service';
import { RolService, RolResponse } from '../../services/rol.service';
import { TenantService } from '../../services/tenant.service';
import { PortfolioService } from '../../services/portfolio.service';
import { Tenant } from '../../models/tenant.model';
import { Portfolio } from '../../models/portfolio.model';
import { SubPortfolio } from '../../models/portfolio.model';

// Interfaces
interface User {
  id?: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  nombreCompleto: string;
  nombreUsuario: string;
  generatedPassword?: string;
  roleIds: number[];
  activo: boolean;
}

interface RoleAssignment {
  type: 'INQUILINO' | 'CARTERA' | 'SUBCARTERA';
  tenantId: number;
  portfolioId?: number;
  subPortfolioId?: number;
}

interface Role {
  id: number;
  name: string;
  description: string;
  assignments?: RoleAssignment[]; // Asignaciones del rol (cuando venga del backend)
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="h-[calc(100dvh-56px)] bg-slate-950 overflow-hidden flex flex-col">
      <div class="flex-1 overflow-y-auto">
        <div class="p-3 max-w-[1800px] mx-auto">
          <!-- Header -->
          <div class="mb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <lucide-angular name="users" [size]="16" class="text-white"></lucide-angular>
              </div>
              <div>
                <h1 class="text-lg font-bold text-white">Gestión de Usuarios</h1>
                <p class="text-xs text-gray-400">Crea y administra usuarios del sistema</p>
              </div>
            </div>
          </div>

          <!-- Grid de 3 Columnas -->
          <div class="grid grid-cols-12 gap-3">
            <!-- Columna 1: Lista de Usuarios (25%) -->
            <div class="col-span-3 bg-slate-900 rounded-lg border border-slate-800 shadow-sm flex flex-col max-h-[calc(100vh-140px)]">
              <div class="p-3 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
                <div class="flex items-center gap-2">
                  <lucide-angular name="list" [size]="16" class="text-blue-400"></lucide-angular>
                  <h2 class="text-sm font-bold text-white">Usuarios</h2>
                  <span class="text-xs text-gray-400">({{ users().length }})</span>
                </div>
                <button (click)="createNewUser()"
                        class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1">
                  <lucide-angular name="plus" [size]="12"></lucide-angular>
                  Nuevo
                </button>
              </div>

              <!-- Búsqueda y Filtro -->
              <div class="p-2 border-b border-slate-800">
                <div class="flex gap-1.5">
                  <!-- Input de búsqueda -->
                  <div class="relative flex-1">
                    <lucide-angular name="search" [size]="14" class="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-500"></lucide-angular>
                    <input type="text"
                           [(ngModel)]="searchTerm"
                           placeholder="Buscar usuario..."
                           class="w-full pl-9 pr-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  </div>

                  <!-- Botón de filtro -->
                  <div class="relative">
                    <button (click)="toggleFilterDropdown()"
                            [class]="activeFilter() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'"
                            class="p-1.5 rounded transition-colors">
                      <lucide-angular name="filter" [size]="14" class="text-white"></lucide-angular>
                    </button>

                    <!-- Dropdown de filtros -->
                    @if (showFilterDropdown()) {
                      <div class="absolute right-0 top-full mt-1 w-72 bg-slate-800 border border-slate-700 rounded shadow-lg z-50">
                        <div class="p-2 border-b border-slate-700 flex items-center justify-between">
                          <span class="text-xs font-semibold text-white">Filtrar por asignación</span>
                          @if (activeFilter()) {
                            <button (click)="clearFilter()"
                                    class="text-xs text-blue-400 hover:text-blue-300">
                              Limpiar
                            </button>
                          }
                        </div>

                        @if (!filterType()) {
                          <!-- Selección de tipo de filtro -->
                          <div class="p-2">
                            <p class="text-xs text-gray-400 mb-2">¿Qué desea filtrar?</p>
                            <div class="space-y-1">
                              <button (click)="setFilterType('INQUILINO')"
                                      class="w-full flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-blue-500/50 rounded text-xs text-white transition-colors">
                                <lucide-angular name="building" [size]="14" class="text-blue-400"></lucide-angular>
                                <span>Proveedor</span>
                              </button>
                              <button (click)="setFilterType('CARTERA')"
                                      class="w-full flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-purple-500/50 rounded text-xs text-white transition-colors">
                                <lucide-angular name="briefcase" [size]="14" class="text-purple-400"></lucide-angular>
                                <span>Cartera</span>
                              </button>
                              <button (click)="setFilterType('SUBCARTERA')"
                                      class="w-full flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-green-500/50 rounded text-xs text-white transition-colors">
                                <lucide-angular name="folder" [size]="14" class="text-green-400"></lucide-angular>
                                <span>Subcartera</span>
                              </button>
                            </div>
                          </div>
                        } @else {
                          <!-- Lista de opciones según el tipo -->
                          <div class="p-2 max-h-96 overflow-y-auto">
                            <div class="flex items-center justify-between mb-2">
                              <button (click)="filterType.set(null)"
                                      class="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                                <lucide-angular name="arrow-left" [size]="12"></lucide-angular>
                                <span>Volver</span>
                              </button>
                            </div>

                            @if (filterType() === 'INQUILINO') {
                              <!-- Proveedores -->
                              @for (tenant of tenants(); track tenant.id) {
                                <button (click)="setFilter('INQUILINO', tenant.id, tenant.tenantName)"
                                        [class]="isFilterActive('INQUILINO', tenant.id) ? 'bg-blue-900/40 border-blue-500' : 'bg-slate-700/50 border-slate-600 hover:border-blue-500/50'"
                                        class="w-full text-left px-2 py-1.5 rounded border text-xs text-white mb-1 transition-colors">
                                  {{ tenant.tenantName }}
                                </button>
                              }
                            } @else if (filterType() === 'CARTERA') {
                              <!-- Carteras con jerarquía -->
                              @for (portfolio of allPortfolios(); track portfolio.id) {
                                <button (click)="setFilter('CARTERA', portfolio.id, getPortfolioDisplayName(portfolio.id))"
                                        [class]="isFilterActive('CARTERA', portfolio.id) ? 'bg-blue-900/40 border-blue-500' : 'bg-slate-700/50 border-slate-600 hover:border-blue-500/50'"
                                        class="w-full text-left px-2 py-1.5 rounded border text-xs text-white mb-1 transition-colors">
                                  {{ getPortfolioDisplayName(portfolio.id) }}
                                </button>
                              }
                            } @else if (filterType() === 'SUBCARTERA') {
                              <!-- Subcarteras con jerarquía -->
                              @for (subPortfolio of allSubPortfolios(); track subPortfolio.id) {
                                <button (click)="setFilter('SUBCARTERA', subPortfolio.id, getSubPortfolioDisplayName(subPortfolio.id))"
                                        [class]="isFilterActive('SUBCARTERA', subPortfolio.id) ? 'bg-blue-900/40 border-blue-500' : 'bg-slate-700/50 border-slate-600 hover:border-blue-500/50'"
                                        class="w-full text-left px-2 py-1.5 rounded border text-xs text-white mb-1 transition-colors">
                                  {{ getSubPortfolioDisplayName(subPortfolio.id) }}
                                </button>
                              }
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>

                <!-- Filtro activo (chip) -->
                @if (activeFilter()) {
                  <div class="mt-1.5 flex items-center gap-1">
                    <div class="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/40 border border-blue-500 rounded text-xs text-white">
                      @if (activeFilter()!.type === 'INQUILINO') {
                        <lucide-angular name="building" [size]="10" class="text-blue-400"></lucide-angular>
                      } @else if (activeFilter()!.type === 'CARTERA') {
                        <lucide-angular name="briefcase" [size]="10" class="text-purple-400"></lucide-angular>
                      } @else {
                        <lucide-angular name="folder" [size]="10" class="text-green-400"></lucide-angular>
                      }
                      <span>{{ activeFilter()!.name }}</span>
                      <button (click)="clearFilter()" class="ml-1 hover:text-red-400">
                        <lucide-angular name="x" [size]="10"></lucide-angular>
                      </button>
                    </div>
                  </div>
                }
              </div>

              <div class="p-2 space-y-1 overflow-y-auto flex-1">
                @if (filteredUsers().length === 0 && users().length > 0) {
                  <div class="text-center py-8">
                    <lucide-angular name="search-x" [size]="28" class="text-gray-600 mx-auto mb-2"></lucide-angular>
                    <p class="text-xs text-gray-400">Sin resultados</p>
                    <p class="text-xs text-gray-500">Intenta otra búsqueda</p>
                  </div>
                } @else if (users().length === 0) {
                  <div class="text-center py-8">
                    <lucide-angular name="user-x" [size]="28" class="text-gray-600 mx-auto mb-2"></lucide-angular>
                    <p class="text-xs text-gray-400">Sin usuarios</p>
                    <p class="text-xs text-gray-500">Crea uno nuevo</p>
                  </div>
                } @else {
                  @for (user of filteredUsers(); track user.id) {
                    <div (click)="selectUser(user)"
                         [class]="selectedUser()?.id === user.id ? 'bg-blue-900/40 border-blue-500' : 'bg-slate-800 border-slate-700 hover:border-blue-500/50'"
                         class="p-2 rounded border cursor-pointer transition-all">
                      <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-1">
                            <lucide-angular name="user" [size]="12" class="text-blue-400 flex-shrink-0"></lucide-angular>
                            <h3 class="text-xs font-semibold text-white truncate">{{ user.nombreCompleto }}</h3>
                          </div>
                          <div class="mt-0.5 text-xs text-gray-500 truncate">
                            {{ user.nombreUsuario }}
                          </div>
                          <div class="mt-0.5 flex items-center gap-1">
                            <span [class]="user.activo ? 'text-green-400' : 'text-red-400'" class="text-xs">
                              {{ user.activo ? 'Activo' : 'Inactivo' }}
                            </span>
                            <span class="text-gray-500">•</span>
                            <span class="text-xs text-gray-500">{{ user.roleIds.length }} roles</span>
                          </div>
                        </div>
                        <button (click)="deleteUser(user); $event.stopPropagation()"
                                class="p-0.5 text-gray-400 hover:text-red-400 rounded transition-colors flex-shrink-0">
                          <lucide-angular name="trash-2" [size]="12"></lucide-angular>
                        </button>
                      </div>
                    </div>
                  }
                }
              </div>
            </div>

            <!-- Columna 2: Formulario de Usuario (40%) -->
            <div class="col-span-5 bg-slate-900 rounded-lg border border-slate-800 shadow-sm flex flex-col max-h-[calc(100vh-140px)]">
              <div class="p-3 border-b border-slate-800 flex-shrink-0">
                <div class="flex items-center gap-2">
                  <lucide-angular name="user-cog" [size]="16" class="text-blue-400"></lucide-angular>
                  <h2 class="text-sm font-bold text-white">
                    {{ selectedUser()?.id ? 'Editar Usuario' : selectedUser() ? 'Nuevo Usuario' : 'Información' }}
                  </h2>
                </div>
              </div>

              <div class="p-3 space-y-3 overflow-y-auto flex-1">
                @if (selectedUser()) {
                  <!-- Información Personal -->
                  <div class="space-y-2">
                    <div class="grid grid-cols-2 gap-2">
                      <div>
                        <label class="block text-xs font-semibold text-gray-300 mb-1">
                          Primer Nombre <span class="text-red-400">*</span>
                        </label>
                        <input type="text"
                               [(ngModel)]="selectedUser()!.primerNombre"
                               (ngModelChange)="updateNombreCompleto()"
                               placeholder="Ej: Juan"
                               class="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      </div>

                      <div>
                        <label class="block text-xs font-semibold text-gray-300 mb-1">Segundo Nombre</label>
                        <input type="text"
                               [(ngModel)]="selectedUser()!.segundoNombre"
                               (ngModelChange)="updateNombreCompleto()"
                               placeholder="Ej: Carlos"
                               class="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                      <div>
                        <label class="block text-xs font-semibold text-gray-300 mb-1">
                          Primer Apellido <span class="text-red-400">*</span>
                        </label>
                        <input type="text"
                               [(ngModel)]="selectedUser()!.primerApellido"
                               (ngModelChange)="updateNombreCompleto()"
                               placeholder="Ej: García"
                               class="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      </div>

                      <div>
                        <label class="block text-xs font-semibold text-gray-300 mb-1">Segundo Apellido</label>
                        <input type="text"
                               [(ngModel)]="selectedUser()!.segundoApellido"
                               (ngModelChange)="updateNombreCompleto()"
                               placeholder="Ej: López"
                               class="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      </div>
                    </div>

                    <div>
                      <label class="block text-xs font-semibold text-gray-300 mb-1">Nombre Completo</label>
                      <input type="text"
                             [value]="selectedUser()!.nombreCompleto"
                             readonly
                             class="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-gray-400 text-sm cursor-not-allowed">
                    </div>
                  </div>

                  <!-- Credenciales -->
                  <div class="space-y-2 pt-2 border-t border-slate-800">
                    <div>
                      <label class="block text-xs font-semibold text-gray-300 mb-1">
                        Nombre de Usuario <span class="text-red-400">*</span>
                      </label>
                      <input type="text"
                             [(ngModel)]="selectedUser()!.nombreUsuario"
                             placeholder="Ej: jgarcia"
                             class="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <p class="mt-1 text-xs text-gray-500">Usuario único para iniciar sesión</p>
                    </div>

                    @if (!selectedUser()!.id) {
                      <div class="bg-blue-900/20 border border-blue-700/50 rounded p-2 flex items-start gap-2">
                        <lucide-angular name="info" [size]="14" class="text-blue-400 flex-shrink-0 mt-0.5"></lucide-angular>
                        <div class="text-xs text-blue-300">
                          La contraseña se generará automáticamente al crear el usuario
                        </div>
                      </div>
                    }

                    <div class="flex items-center gap-2">
                      <input type="checkbox"
                             [(ngModel)]="selectedUser()!.activo"
                             id="userActive"
                             class="w-3.5 h-3.5 text-blue-600 bg-slate-800 border-slate-700 rounded focus:ring-blue-500">
                      <label for="userActive" class="text-xs text-gray-300 cursor-pointer">Usuario activo</label>
                    </div>
                  </div>
                } @else {
                  <div class="text-center py-12">
                    <lucide-angular name="user-circle" [size]="32" class="text-gray-600 mx-auto mb-2"></lucide-angular>
                    <p class="text-sm text-gray-400">Selecciona o crea un usuario</p>
                  </div>
                }
              </div>
            </div>

            <!-- Columna 3: Asignación de Roles (35%) -->
            <div class="col-span-4 bg-slate-900 rounded-lg border border-slate-800 shadow-sm flex flex-col max-h-[calc(100vh-140px)]">
              <div class="p-3 border-b border-slate-800 flex-shrink-0">
                <div class="flex items-center gap-2">
                  <lucide-angular name="shield-check" [size]="16" class="text-purple-400"></lucide-angular>
                  <h2 class="text-sm font-bold text-white">Roles Asignados</h2>
                  <span class="text-xs text-gray-400">({{ selectedUser() ? selectedUser()!.roleIds.length : 0 }})</span>
                </div>
              </div>

              <div class="p-3 overflow-y-auto flex-1">
                @if (selectedUser()) {
                  <div class="space-y-1.5">
                    @if (availableRoles().length === 0) {
                      <div class="text-center py-8">
                        <lucide-angular name="shield-off" [size]="28" class="text-gray-600 mx-auto mb-2"></lucide-angular>
                        <p class="text-xs text-gray-400">Sin roles disponibles</p>
                        <p class="text-xs text-gray-500">Crea roles primero</p>
                      </div>
                    } @else {
                      @for (role of availableRoles(); track role.id) {
                        <label class="flex items-start gap-2 p-2 bg-slate-800 hover:bg-slate-700/50 border border-slate-700 rounded cursor-pointer group">
                          <input type="checkbox"
                                 [checked]="isRoleAssigned(role.id)"
                                 (change)="toggleRole(role.id)"
                                 class="mt-0.5 w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500">
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1.5">
                              <lucide-angular name="shield-check" [size]="12" class="text-purple-400"></lucide-angular>
                              <h3 class="text-xs font-semibold text-white group-hover:text-purple-300">{{ role.name }}</h3>
                            </div>
                            <p class="text-xs text-gray-500 leading-tight mt-0.5">{{ role.description }}</p>
                          </div>
                        </label>
                      }
                    }
                  </div>
                } @else {
                  <div class="text-center py-12">
                    <lucide-angular name="shield" [size]="32" class="text-gray-600 mx-auto mb-2"></lucide-angular>
                    <p class="text-xs text-gray-400">Selecciona un usuario para asignar roles</p>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          @if (selectedUser()) {
            <div class="mt-3 flex justify-end gap-2">
              <button (click)="cancelEdit()"
                      class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-semibold transition-colors">
                Cancelar
              </button>
              <button (click)="saveUser()"
                      [disabled]="!isUserValid()"
                      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded text-sm font-semibold transition-colors flex items-center gap-1.5">
                <lucide-angular name="save" [size]="16"></lucide-angular>
                Guardar
              </button>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Modal de Contraseña Generada -->
    @if (showPasswordModal()) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-slate-800 rounded-lg border border-slate-700 shadow-2xl max-w-md w-full">
          <div class="p-4 border-b border-slate-700 flex items-center gap-2">
            <lucide-angular name="key" [size]="20" class="text-green-400"></lucide-angular>
            <h3 class="text-base font-bold text-white">Usuario Creado Exitosamente</h3>
          </div>

          <div class="p-4 space-y-3">
            <p class="text-sm text-gray-300">
              El usuario <strong class="text-white">{{ generatedUserInfo()?.nombreUsuario }}</strong> ha sido creado.
            </p>

            <div class="bg-amber-900/20 border border-amber-700/50 rounded p-3 flex items-start gap-2">
              <lucide-angular name="alert-triangle" [size]="16" class="text-amber-400 flex-shrink-0 mt-0.5"></lucide-angular>
              <div class="text-xs text-amber-300">
                <strong>Importante:</strong> Copia esta contraseña ahora. No se volverá a mostrar.
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-300 mb-1">Contraseña Temporal</label>
              <div class="flex gap-2">
                <input type="text"
                       [value]="generatedUserInfo()?.password"
                       readonly
                       class="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white font-mono text-sm">
                <button (click)="copyPassword()"
                        class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors flex items-center gap-1.5">
                  <lucide-angular [name]="passwordCopied() ? 'check' : 'copy'" [size]="14"></lucide-angular>
                  {{ passwordCopied() ? 'Copiado' : 'Copiar' }}
                </button>
              </div>
            </div>

            <p class="text-xs text-gray-400">
              Proporciona esta contraseña al usuario. Deberá cambiarla en su primer inicio de sesión.
            </p>
          </div>

          <div class="p-4 border-t border-slate-700 flex justify-end">
            <button (click)="closePasswordModal()"
                    [disabled]="!passwordCopied()"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded text-sm font-semibold transition-colors">
              {{ passwordCopied() ? 'Cerrar' : 'Copiar antes de cerrar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class UserManagementComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolService);
  private tenantService = inject(TenantService);
  private portfolioService = inject(PortfolioService);

  users = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  originalUser = signal<User | null>(null);
  availableRoles = signal<Role[]>([]);
  showPasswordModal = signal(false);
  generatedUserInfo = signal<{ nombreUsuario: string; password: string } | null>(null);
  passwordCopied = signal(false);

  // Datos para filtros
  tenants = signal<Tenant[]>([]);
  allPortfolios = signal<Portfolio[]>([]);
  allSubPortfolios = signal<SubPortfolio[]>([]);

  // Búsqueda y filtro único
  searchTerm = signal('');
  showFilterDropdown = signal(false);
  filterType = signal<'INQUILINO' | 'CARTERA' | 'SUBCARTERA' | null>(null);
  activeFilter = signal<{ type: 'INQUILINO' | 'CARTERA' | 'SUBCARTERA', id: number, name: string } | null>(null);

  // Computed para usuarios filtrados
  filteredUsers = computed(() => {
    let filtered = this.users();

    // Búsqueda por texto
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(u =>
        u.nombreCompleto.toLowerCase().includes(search) ||
        u.nombreUsuario.toLowerCase().includes(search)
      );
    }

    // Filtrar por asignación activa
    const filter = this.activeFilter();
    if (filter) {
      filtered = filtered.filter(user => {
        // Obtener todos los roles del usuario
        const userRoles = this.availableRoles().filter(r => user.roleIds.includes(r.id));

        // Verificar si algún rol tiene asignaciones que coincidan con el filtro
        return userRoles.some(role => {
          if (!role.assignments || role.assignments.length === 0) return false;

          return role.assignments.some(assignment => {
            // Filtro por INQUILINO (tenant)
            if (filter.type === 'INQUILINO') {
              return assignment.type === 'INQUILINO' && assignment.tenantId === filter.id;
            }

            // Filtro por CARTERA (portfolio)
            if (filter.type === 'CARTERA') {
              return (assignment.type === 'CARTERA' && assignment.portfolioId === filter.id) ||
                     (assignment.type === 'INQUILINO' && assignment.tenantId === this.getTenantIdForPortfolio(filter.id));
            }

            // Filtro por SUBCARTERA (subportfolio)
            if (filter.type === 'SUBCARTERA') {
              const portfolioId = this.getPortfolioIdForSubPortfolio(filter.id);
              const tenantId = portfolioId ? this.getTenantIdForPortfolio(portfolioId) : null;

              return (assignment.type === 'SUBCARTERA' && assignment.subPortfolioId === filter.id) ||
                     (assignment.type === 'CARTERA' && assignment.portfolioId === portfolioId) ||
                     (assignment.type === 'INQUILINO' && assignment.tenantId === tenantId);
            }

            return false;
          });
        });
      });
    }

    return filtered;
  });

  // Computed para detectar cambios
  hasChanges = computed(() => {
    const current = this.selectedUser();
    const original = this.originalUser();

    if (!current || !original) return false;

    return JSON.stringify(current) !== JSON.stringify(original);
  });

  ngOnInit() {
    this.loadData();
    this.loadTenantsAndFilters();
  }

  loadData() {
    // Cargar roles desde el backend
    this.rolService.obtenerTodos().subscribe({
      next: (roles) => {
        this.availableRoles.set(roles.map(r => ({
          id: r.idRol,
          name: r.nombreRol,
          description: r.descripcion || '',
          assignments: r.asignaciones.map(a => ({
            type: a.tipoAsignacion as 'INQUILINO' | 'CARTERA' | 'SUBCARTERA',
            tenantId: a.tenantId,
            portfolioId: a.portfolioId,
            subPortfolioId: a.subPortfolioId
          }))
        })));
      },
      error: (err) => console.error('Error al cargar roles:', err)
    });

    // Cargar usuarios desde el backend
    this.usuarioService.obtenerTodos().subscribe({
      next: (usuarios) => {
        this.users.set(usuarios.map(u => this.mapUsuarioResponseToUser(u)));
      },
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  loadTenantsAndFilters() {
    // Cargar todos los tenants
    this.tenantService.getAllTenants().subscribe({
      next: (tenants) => {
        this.tenants.set(tenants);

        // Cargar portfolios para cada tenant
        tenants.forEach(tenant => {
          this.portfolioService.getPortfoliosByTenant(tenant.id).subscribe({
            next: (portfolios) => {
              const portfoliosWithTenant = portfolios.map(p => ({ ...p, tenantId: tenant.id }));
              this.allPortfolios.set([...this.allPortfolios(), ...portfoliosWithTenant]);

              // Cargar subportfolios para cada portfolio
              portfolios.forEach(portfolio => {
                this.portfolioService.getSubPortfoliosByPortfolio(portfolio.id).subscribe({
                  next: (subPortfolios) => {
                    this.allSubPortfolios.set([...this.allSubPortfolios(), ...subPortfolios]);
                  },
                  error: (err) => console.error(`Error al cargar subportfolios para portfolio ${portfolio.id}:`, err)
                });
              });
            },
            error: (err) => console.error(`Error al cargar portfolios para tenant ${tenant.id}:`, err)
          });
        });
      },
      error: (err) => console.error('Error al cargar tenants:', err)
    });
  }

  private mapUsuarioResponseToUser(response: UsuarioResponse): User {
    return {
      id: response.idUsuario,
      primerNombre: response.primerNombre || '',
      segundoNombre: response.segundoNombre,
      primerApellido: response.primerApellido || '',
      segundoApellido: response.segundoApellido,
      nombreCompleto: response.nombreCompleto,
      nombreUsuario: response.nombreUsuario,
      roleIds: response.roleIds,
      activo: response.activo
    };
  }

  createNewUser() {
    const newUser: User = {
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      nombreCompleto: '',
      nombreUsuario: '',
      roleIds: [],
      activo: true
    };
    this.selectedUser.set(newUser);
    this.originalUser.set(null); // Nuevo usuario, no hay original
  }

  selectUser(user: User) {
    const userCopy = { ...user, roleIds: [...user.roleIds] };
    this.selectedUser.set(userCopy);
    this.originalUser.set(JSON.parse(JSON.stringify(user))); // Deep copy para comparación
  }

  deleteUser(user: User) {
    if (!user.id) return;

    if (confirm(`¿Estás seguro de eliminar el usuario "${user.nombreCompleto}"?`)) {
      this.usuarioService.eliminar(user.id).subscribe({
        next: () => {
          const currentUsers = this.users();
          this.users.set(currentUsers.filter(u => u.id !== user.id));
          if (this.selectedUser()?.id === user.id) {
            this.selectedUser.set(null);
          }
          alert('Usuario eliminado correctamente');
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          alert('Error al eliminar usuario: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  updateNombreCompleto() {
    const user = this.selectedUser();
    if (!user) return;

    const parts = [
      user.primerNombre?.trim(),
      user.segundoNombre?.trim(),
      user.primerApellido?.trim(),
      user.segundoApellido?.trim()
    ].filter(part => part && part.length > 0);

    user.nombreCompleto = parts.join(' ');
    this.selectedUser.set({ ...user });
  }

  isRoleAssigned(roleId: number): boolean {
    return this.selectedUser()?.roleIds.includes(roleId) || false;
  }

  toggleRole(roleId: number) {
    const user = this.selectedUser();
    if (!user) return;

    const index = user.roleIds.indexOf(roleId);
    if (index > -1) {
      user.roleIds.splice(index, 1);
    } else {
      user.roleIds.push(roleId);
    }
    this.selectedUser.set({ ...user });
  }

  isUserValid(): boolean {
    const user = this.selectedUser();
    const isValid = !!(user &&
      user.primerNombre.trim() &&
      user.primerApellido.trim() &&
      user.nombreUsuario.trim());

    // Si es un usuario nuevo, solo validar campos requeridos
    if (!user?.id) return isValid;

    // Si es un usuario existente, validar que haya cambios
    return isValid && this.hasChanges();
  }

  generatePassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  saveUser() {
    const user = this.selectedUser();
    if (!user || !this.isUserValid()) return;

    const request: UsuarioRequest = {
      primerNombre: user.primerNombre,
      segundoNombre: user.segundoNombre,
      primerApellido: user.primerApellido,
      segundoApellido: user.segundoApellido,
      nombreUsuario: user.nombreUsuario,
      activo: user.activo,
      roleIds: user.roleIds
    };

    if (user.id) {
      // Editar existente
      this.usuarioService.actualizar(user.id, request).subscribe({
        next: (response) => {
          const currentUsers = this.users();
          const index = currentUsers.findIndex(u => u.id === user.id);
          if (index > -1) {
            currentUsers[index] = this.mapUsuarioResponseToUser(response);
            this.users.set([...currentUsers]);
          }
          this.selectedUser.set(null);
          alert('Usuario actualizado correctamente');
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          alert('Error al actualizar usuario: ' + (err.error?.message || err.message));
        }
      });
    } else {
      // Crear nuevo
      this.usuarioService.crear(request).subscribe({
        next: (response) => {
          const newUser = this.mapUsuarioResponseToUser(response);
          this.users.set([...this.users(), newUser]);

          // Mostrar modal con contraseña generada por el backend
          if (response.generatedPassword) {
            this.generatedUserInfo.set({
              nombreUsuario: newUser.nombreUsuario,
              password: response.generatedPassword
            });
            this.showPasswordModal.set(true);
            this.passwordCopied.set(false);
          }
          this.selectedUser.set(null);
        },
        error: (err) => {
          console.error('Error al crear usuario:', err);
          alert('Error al crear usuario: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  copyPassword() {
    const password = this.generatedUserInfo()?.password;
    if (password) {
      navigator.clipboard.writeText(password).then(() => {
        this.passwordCopied.set(true);
      });
    }
  }

  closePasswordModal() {
    if (this.passwordCopied()) {
      this.showPasswordModal.set(false);
      this.generatedUserInfo.set(null);
      this.passwordCopied.set(false);
    }
  }

  cancelEdit() {
    this.selectedUser.set(null);
  }

  // Métodos para el filtro único
  toggleFilterDropdown() {
    const newState = !this.showFilterDropdown();
    this.showFilterDropdown.set(newState);
    // Si se está abriendo el dropdown, resetear el tipo de filtro
    if (newState) {
      this.filterType.set(null);
    }
  }

  setFilterType(type: 'INQUILINO' | 'CARTERA' | 'SUBCARTERA') {
    this.filterType.set(type);
  }

  setFilter(type: 'INQUILINO' | 'CARTERA' | 'SUBCARTERA', id: number, name: string) {
    this.activeFilter.set({ type, id, name });
    this.showFilterDropdown.set(false);
    this.filterType.set(null);
  }

  clearFilter() {
    this.activeFilter.set(null);
    this.filterType.set(null);
    this.showFilterDropdown.set(false);
  }

  isFilterActive(type: 'INQUILINO' | 'CARTERA' | 'SUBCARTERA', id: number): boolean {
    const filter = this.activeFilter();
    return filter?.type === type && filter?.id === id;
  }

  // Métodos para obtener nombres con jerarquía completa
  getPortfolioDisplayName(portfolioId: number): string {
    const portfolio = this.allPortfolios().find(p => p.id === portfolioId);
    if (!portfolio) return '';

    const tenant = this.tenants().find(t => t.id === portfolio.tenantId);
    if (!tenant) return portfolio.portfolioName;

    return `${tenant.tenantName} - ${portfolio.portfolioName}`;
  }

  getSubPortfolioDisplayName(subPortfolioId: number): string {
    const subPortfolio = this.allSubPortfolios().find(sp => sp.id === subPortfolioId);
    if (!subPortfolio) return '';

    const portfolio = this.allPortfolios().find(p => p.id === subPortfolio.portfolioId);
    if (!portfolio) return subPortfolio.subPortfolioName;

    const tenant = this.tenants().find(t => t.id === portfolio.tenantId);
    if (!tenant) return `${portfolio.portfolioName} - ${subPortfolio.subPortfolioName}`;

    return `${tenant.tenantName} - ${portfolio.portfolioName} - ${subPortfolio.subPortfolioName}`;
  }

  // Métodos auxiliares para obtener IDs de la jerarquía
  getTenantIdForPortfolio(portfolioId: number): number | null {
    const portfolio = this.allPortfolios().find(p => p.id === portfolioId);
    return portfolio?.tenantId || null;
  }

  getPortfolioIdForSubPortfolio(subPortfolioId: number): number | null {
    const subPortfolio = this.allSubPortfolios().find(sp => sp.id === subPortfolioId);
    return subPortfolio?.portfolioId || null;
  }
}
