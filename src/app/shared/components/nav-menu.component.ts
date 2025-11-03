import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  template: `
    <nav class="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-14">
          <!-- Logo y nombre -->
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <lucide-angular name="wallet" [size]="18" class="text-white"></lucide-angular>
              </div>
              <span class="text-xl font-bold text-white">
                CASHI
              </span>
            </div>

            <!-- Enlaces principales -->
            <div class="hidden md:flex items-center gap-1">
              <a routerLink="/collection-management"
                 routerLinkActive="bg-blue-600 text-white"
                 class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-300 hover:bg-slate-800 hover:text-white transition-all font-medium text-sm">
                <lucide-angular name="briefcase" [size]="16"></lucide-angular>
                <span>Cobranza</span>
              </a>
              <a routerLink="/customers"
                 routerLinkActive="bg-blue-600 text-white"
                 class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-300 hover:bg-slate-800 hover:text-white transition-all font-medium text-sm">
                <lucide-angular name="users" [size]="16"></lucide-angular>
                <span>Clientes</span>
              </a>
            </div>
          </div>

          <!-- Usuario y acciones (lado derecho) -->
          <div class="flex items-center gap-2">
            <!-- Menú Carga de Datos -->
            <div class="relative">
              <button (click)="toggleDataLoadMenu()"
                      [class]="dataLoadMenuOpen() ? 'bg-slate-800 text-white' : 'text-gray-300 hover:bg-slate-800 hover:text-white'"
                      class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-medium text-sm">
                <lucide-angular name="folder-open" [size]="16"></lucide-angular>
                <span>Carga de Datos</span>
                <lucide-angular [name]="dataLoadMenuOpen() ? 'chevron-up' : 'chevron-down'" [size]="14"></lucide-angular>
              </button>

              @if (dataLoadMenuOpen()) {
                <div class="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-50">
                  <!-- Carga Inicial -->
                  <a routerLink="/data-load/initial"
                     (click)="closeMenus()"
                     class="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors group">
                    <lucide-angular name="folder" [size]="16" class="text-gray-400 group-hover:text-blue-400"></lucide-angular>
                    <span class="text-gray-300 group-hover:text-white font-medium text-sm">Carga Inicial de Mes</span>
                  </a>

                  <!-- Carga Diaria -->
                  <a routerLink="/data-load/daily"
                     (click)="closeMenus()"
                     class="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors group">
                    <lucide-angular name="folder-tree" [size]="16" class="text-gray-400 group-hover:text-green-400"></lucide-angular>
                    <span class="text-gray-300 group-hover:text-white font-medium text-sm">Carga Diaria</span>
                  </a>
                </div>
              }
            </div>

            <!-- Menú Mantenimiento -->
            <div class="relative">
              <button (click)="toggleConfigMenu()"
                      [class]="configMenuOpen() ? 'bg-slate-800 text-white' : 'text-gray-300 hover:bg-slate-800 hover:text-white'"
                      class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-medium text-sm">
                <lucide-angular name="settings" [size]="16"></lucide-angular>
                <span>Mantenimiento</span>
                <lucide-angular [name]="configMenuOpen() ? 'chevron-up' : 'chevron-down'" [size]="14"></lucide-angular>
              </button>

              @if (configMenuOpen()) {
                <div class="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-50">
                  <!-- Proveedores -->
                  <a routerLink="/maintenance/tenants"
                     (click)="closeMenus()"
                     class="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors group">
                    <lucide-angular name="building-2" [size]="16" class="text-gray-400 group-hover:text-blue-400"></lucide-angular>
                    <span class="text-gray-300 group-hover:text-white font-medium text-sm">Proveedores</span>
                  </a>

                  <!-- Carteras -->
                  <a routerLink="/maintenance/portfolios"
                     (click)="closeMenus()"
                     class="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors group">
                    <lucide-angular name="folder" [size]="16" class="text-gray-400 group-hover:text-purple-400"></lucide-angular>
                    <span class="text-gray-300 group-hover:text-white font-medium text-sm">Carteras</span>
                  </a>

                  <!-- Subcarteras -->
                  <a routerLink="/maintenance/subportfolios"
                     (click)="closeMenus()"
                     class="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors group">
                    <lucide-angular name="folder-tree" [size]="16" class="text-gray-400 group-hover:text-emerald-400"></lucide-angular>
                    <span class="text-gray-300 group-hover:text-white font-medium text-sm">Subcarteras</span>
                  </a>

                  <!-- Configuración de Cabeceras -->
                  <a routerLink="/maintenance/header-configuration"
                     (click)="closeMenus()"
                     class="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors group">
                    <lucide-angular name="table-2" [size]="16" class="text-gray-400 group-hover:text-indigo-400"></lucide-angular>
                    <span class="text-gray-300 group-hover:text-white font-medium text-sm">Config. Cabeceras</span>
                  </a>

                  <!-- Roles -->
                  <a routerLink="/maintenance/roles"
                     (click)="closeMenus()"
                     class="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors group">
                    <lucide-angular name="shield-check" [size]="16" class="text-gray-400 group-hover:text-purple-400"></lucide-angular>
                    <span class="text-gray-300 group-hover:text-white font-medium text-sm">Roles</span>
                  </a>

                  <!-- Usuarios -->
                  <a routerLink="/maintenance/users"
                     (click)="closeMenus()"
                     class="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors group">
                    <lucide-angular name="users" [size]="16" class="text-gray-400 group-hover:text-blue-400"></lucide-angular>
                    <span class="text-gray-300 group-hover:text-white font-medium text-sm">Usuarios</span>
                  </a>

                  <!-- Blacklist -->
                  <a routerLink="/maintenance/blacklist"
                     (click)="closeMenus()"
                     class="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors group">
                    <lucide-angular name="shield-ban" [size]="16" class="text-gray-400 group-hover:text-red-400"></lucide-angular>
                    <span class="text-gray-300 group-hover:text-white font-medium text-sm">Blacklist</span>
                  </a>
                </div>
              }
            </div>
            <button class="p-2 text-gray-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer">
              <lucide-angular name="bell" [size]="18"></lucide-angular>
            </button>

            <!-- Menú de Perfil -->
            <div class="relative">
              <button (click)="toggleProfileMenu()"
                      [class]="profileMenuOpen() ? 'bg-slate-800 text-white' : 'text-gray-400 hover:bg-slate-800 hover:text-white'"
                      class="p-2 rounded-lg transition-colors cursor-pointer">
                <lucide-angular name="user" [size]="18"></lucide-angular>
              </button>

              @if (profileMenuOpen()) {
                <div class="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-50">
                  <!-- Cambiar tema -->
                  <button (click)="toggleTheme()"
                          class="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700 transition-colors group cursor-pointer">
                    <div class="flex items-center gap-2">
                      @if (themeService.isDarkMode()) {
                        <lucide-angular name="sun" [size]="16" class="text-gray-400 group-hover:text-yellow-400"></lucide-angular>
                        <span class="text-gray-300 group-hover:text-white font-medium text-sm">Tema Claro</span>
                      } @else {
                        <lucide-angular name="moon" [size]="16" class="text-gray-400 group-hover:text-blue-400"></lucide-angular>
                        <span class="text-gray-300 group-hover:text-white font-medium text-sm">Tema Oscuro</span>
                      }
                    </div>
                    <div class="text-xs text-gray-500 group-hover:text-gray-400">
                      {{ themeService.isDarkMode() ? '☀️' : '🌙' }}
                    </div>
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Overlay para cerrar menú al hacer click fuera -->
    @if (configMenuOpen() || dataLoadMenuOpen() || profileMenuOpen()) {
      <div (click)="closeMenus()" class="fixed inset-0 z-40"></div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class NavMenuComponent {
  configMenuOpen = signal(false);
  dataLoadMenuOpen = signal(false);
  profileMenuOpen = signal(false);

  constructor(public themeService: ThemeService) {}

  toggleConfigMenu() {
    this.configMenuOpen.update(v => !v);
    this.dataLoadMenuOpen.set(false);
    this.profileMenuOpen.set(false);
  }

  toggleDataLoadMenu() {
    this.dataLoadMenuOpen.update(v => !v);
    this.configMenuOpen.set(false);
    this.profileMenuOpen.set(false);
  }

  toggleProfileMenu() {
    this.profileMenuOpen.update(v => !v);
    this.configMenuOpen.set(false);
    this.dataLoadMenuOpen.set(false);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.closeMenus();
  }

  closeMenus() {
    this.configMenuOpen.set(false);
    this.dataLoadMenuOpen.set(false);
    this.profileMenuOpen.set(false);
  }
}
