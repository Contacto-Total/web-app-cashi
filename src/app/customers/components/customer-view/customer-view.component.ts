import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CustomerService, CustomerResource } from '../../services/customer.service';

@Component({
  selector: 'app-customer-view',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div [class]="customer() ? 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col overflow-hidden' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col'" [style.height]="customer() ? 'calc(100vh - 56px)' : 'auto'" [style.min-height]="!customer() ? 'calc(100vh - 56px)' : 'auto'">

      @if (!customer()) {
        <!-- Search Screen -->
        <div class="flex-1 flex items-center justify-center p-6">
          <div class="max-w-xl w-full">
            <div class="text-center mb-6">
              <div class="inline-flex p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg">
                <lucide-angular name="search" [size]="40" class="text-white"></lucide-angular>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buscar Cliente</h1>
              <p class="text-gray-600 dark:text-gray-400 text-sm">Selecciona el criterio de búsqueda e ingresa el valor</p>
            </div>

            <div class="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl p-6 shadow-2xl">
              <!-- Dropdown de criterios -->
              <div class="mb-3">
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Buscar por:</label>
                <select [(ngModel)]="searchCriteria"
                        class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  @for (option of searchCriteriaOptions; track option.value) {
                    <option [value]="option.value">{{ option.label }}</option>
                  }
                </select>
              </div>

              <!-- Input y botón de búsqueda -->
              <div class="flex gap-3">
                <input type="text"
                       [(ngModel)]="searchDocument"
                       (keyup.enter)="searchCustomer()"
                       [placeholder]="'Ingrese ' + getSelectedCriteriaLabel().toLowerCase()"
                       class="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button (click)="searchCustomer()"
                        [disabled]="loading()"
                        class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:shadow-blue-600/50 transition-all font-semibold cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (loading()) {
                    <lucide-angular name="loader" [size]="18" class="animate-spin"></lucide-angular>
                  } @else {
                    <lucide-angular name="search" [size]="18"></lucide-angular>
                  }
                  <span>{{ loading() ? 'Buscando...' : 'Buscar' }}</span>
                </button>
              </div>

              @if (searchPerformed() && !customer() && !loading() && !showMultipleResults()) {
                <div class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700/50 rounded-lg flex items-center gap-2">
                  <lucide-angular name="alert-circle" [size]="16" class="text-red-600 dark:text-red-400"></lucide-angular>
                  <p class="text-red-600 dark:text-red-400 text-sm">Cliente no encontrado: <strong>{{ searchDocument }}</strong></p>
                </div>
              }

              @if (showMultipleResults() && searchResults().length > 0) {
                <div class="mt-4">
                  <div class="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700/50 rounded-lg flex items-center gap-2">
                    <lucide-angular name="info" [size]="16" class="text-blue-600 dark:text-blue-400"></lucide-angular>
                    <p class="text-blue-600 dark:text-blue-400 text-sm font-semibold">Se encontraron {{ searchResults().length }} clientes en diferentes subcarteras. Seleccione uno:</p>
                  </div>
                  <div class="space-y-2 max-h-80 overflow-y-auto">
                    @for (result of searchResults(); track result.id) {
                      <button (click)="selectCustomerFromResults(result)"
                              class="w-full px-4 py-3 bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-2 border-gray-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg text-left transition-all cursor-pointer">
                        <div class="flex items-center justify-between gap-3">
                          <div class="flex-1">
                            <div class="font-bold text-gray-900 dark:text-white mb-1">{{ result.fullName }}</div>
                            <div class="text-xs text-gray-600 dark:text-gray-400">
                              <span class="font-semibold">Doc:</span> {{ result.documentNumber }}
                              @if (result.identificationCode) {
                                <span class="ml-2"><span class="font-semibold">Código:</span> {{ result.identificationCode }}</span>
                              }
                            </div>
                          </div>
                          <div class="flex flex-col items-end gap-1">
                            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-600/50 rounded-md">
                              <lucide-angular name="folder-tree" [size]="12" class="text-purple-600 dark:text-purple-400"></lucide-angular>
                              <span class="text-xs font-semibold text-purple-700 dark:text-purple-300">{{ result.subPortfolioName || 'Subcartera ' + result.subPortfolioId }}</span>
                            </div>
                            @if (result.portfolioName) {
                              <div class="text-[10px] text-gray-500 dark:text-gray-400">
                                <lucide-angular name="folder" [size]="10" class="inline mr-1"></lucide-angular>
                                {{ result.portfolioName }}
                              </div>
                            }
                          </div>
                        </div>
                      </button>
                    }
                  </div>
                </div>
              }

              @if (recentCustomers().length > 0 && !showMultipleResults()) {
                <div class="mt-4 pt-4 border-t border-gray-300 dark:border-slate-700">
                  <p class="text-xs text-gray-600 dark:text-gray-500 mb-2">Clientes recientes:</p>
                  <div class="flex flex-col gap-2 max-h-40 overflow-y-auto">
                    @for (customer of recentCustomers(); track customer.document) {
                      <button (click)="quickSearch(customer.document)"
                              class="px-3 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 rounded text-xs transition-colors cursor-pointer text-left">
                        <div class="font-semibold">{{ customer.document }}</div>
                        <div class="text-[10px] text-gray-500 dark:text-gray-400">{{ customer.fullName }}</div>
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <!-- Customer Profile View - Compact Layout -->
        <div class="flex-1 flex overflow-hidden">

          <!-- Compact Sidebar with Age-based Avatar -->
          <div class="w-72 bg-white dark:bg-slate-900 border-r border-gray-300 dark:border-slate-700 flex flex-col p-2">
            <!-- Avatar con gradiente según edad -->
            <div class="text-center mb-2">
              <div [class]="getAvatarClass()" class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <lucide-angular [name]="getAgeIcon()" [size]="48" class="text-white"></lucide-angular>
              </div>
              <h2 class="text-base font-bold text-gray-900 dark:text-white mb-1 leading-tight">{{ getFieldValue('nombre_completo') || 'N/A' }}</h2>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">{{ customer()!.documentNumber }}</p>

              <!-- Código de Identificación con badge -->
              @if (getFieldValue('codigo_identificacion')) {
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-600/50 rounded-lg mt-2">
                  <lucide-angular name="file-text" [size]="12" class="text-indigo-600 dark:text-indigo-400"></lucide-angular>
                  <span class="text-xs font-mono text-indigo-700 dark:text-indigo-300">{{ getFieldValue('codigo_identificacion') }}</span>
                </div>
              }
            </div>

            <!-- Quick Stats con iconos y colores -->
            <div class="space-y-2 mb-2">
              <div class="flex items-center gap-2 p-2.5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border border-blue-200 dark:border-blue-600/30 rounded-lg">
                <div class="p-1.5 bg-blue-200 dark:bg-blue-600/30 rounded">
                  <lucide-angular name="calendar" [size]="14" class="text-blue-600 dark:text-blue-400"></lucide-angular>
                </div>
                <div class="flex-1">
                  <p class="text-[10px] text-gray-600 dark:text-gray-400 leading-none">Edad</p>
                  <p class="text-sm text-gray-900 dark:text-white font-bold">{{ getFieldValue('edad') || 'N/A' }} años</p>
                </div>
                <span [class]="getAgeBadgeClass()" class="text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  {{ getAgeCategory() }}
                </span>
              </div>

              <div class="flex items-center gap-2 p-2.5 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 border border-purple-200 dark:border-purple-600/30 rounded-lg">
                <div class="p-1.5 bg-purple-200 dark:bg-purple-600/30 rounded">
                  <lucide-angular name="user" [size]="14" class="text-purple-600 dark:text-purple-400"></lucide-angular>
                </div>
                <div class="flex-1">
                  <p class="text-[10px] text-gray-600 dark:text-gray-400 leading-none">Estado Civil</p>
                  <p class="text-sm text-gray-900 dark:text-white font-semibold">{{ getFieldValue('estado_civil') || 'N/A' }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2 p-2.5 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 border border-orange-200 dark:border-orange-600/30 rounded-lg">
                <div class="p-1.5 bg-orange-200 dark:bg-orange-600/30 rounded">
                  <lucide-angular name="briefcase" [size]="14" class="text-orange-600 dark:text-orange-400"></lucide-angular>
                </div>
                <div class="flex-1">
                  <p class="text-[10px] text-gray-600 dark:text-gray-400 leading-none">Ocupación</p>
                  <p class="text-xs text-gray-900 dark:text-white font-semibold leading-tight">{{ getFieldValue('ocupacion') || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <button (click)="clearCustomer()"
                    class="w-full px-3 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-blue-600/50">
              <lucide-angular name="search" [size]="16"></lucide-angular>
              <span>Buscar Otro Cliente</span>
            </button>
          </div>

          <!-- Main Content - Compact Table View -->
          <div class="flex-1 flex flex-col overflow-hidden">

            <!-- Tabs con colores -->
            <div class="bg-white dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-700 px-4 flex items-center gap-1 shadow-sm">
              <button (click)="activeTab.set('personal')"
                      [class]="activeTab() === 'personal' ? 'border-b-2 border-blue-500 text-blue-700 dark:text-white bg-blue-100 dark:bg-blue-900/20' : 'text-gray-600 dark:text-gray-400'"
                      class="px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer hover:text-blue-700 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-t-lg">
                <div class="flex items-center gap-1.5">
                  <lucide-angular name="user" [size]="14"></lucide-angular>
                  <span>Personal</span>
                </div>
              </button>
              <button (click)="activeTab.set('contacto')"
                      [class]="activeTab() === 'contacto' ? 'border-b-2 border-green-500 text-green-700 dark:text-white bg-green-100 dark:bg-green-900/20' : 'text-gray-600 dark:text-gray-400'"
                      class="px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer hover:text-green-700 dark:hover:text-white hover:bg-green-50 dark:hover:bg-green-900/30 rounded-t-lg">
                <div class="flex items-center gap-1.5">
                  <lucide-angular name="phone" [size]="14"></lucide-angular>
                  <span>Contacto</span>
                </div>
              </button>
              <button (click)="activeTab.set('ubicacion')"
                      [class]="activeTab() === 'ubicacion' ? 'border-b-2 border-purple-500 text-purple-700 dark:text-white bg-purple-100 dark:bg-purple-900/20' : 'text-gray-600 dark:text-gray-400'"
                      class="px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer hover:text-purple-700 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-t-lg">
                <div class="flex items-center gap-1.5">
                  <lucide-angular name="map-pin" [size]="14"></lucide-angular>
                  <span>Ubicación</span>
                </div>
              </button>
              <button (click)="activeTab.set('referencias')"
                      [class]="activeTab() === 'referencias' ? 'border-b-2 border-indigo-500 text-indigo-700 dark:text-white bg-indigo-100 dark:bg-indigo-900/20' : 'text-gray-600 dark:text-gray-400'"
                      class="px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer hover:text-indigo-700 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-t-lg">
                <div class="flex items-center gap-1.5">
                  <lucide-angular name="users" [size]="14"></lucide-angular>
                  <span>Referencias</span>
                </div>
              </button>
            </div>

            <!-- Content Area - Mini Secciones -->
            <div class="flex-1 overflow-y-auto p-1 bg-gray-50 dark:bg-slate-900/50">
              <div class="max-w-6xl">

                <!-- Personal Tab con Mini Secciones -->
                @if (activeTab() === 'personal') {
                  <div class="space-y-2">

                    <!-- Sección: Identificación -->
                    <div class="bg-white dark:bg-slate-800/50 rounded-lg p-1.5 border border-indigo-200 dark:border-indigo-600/20">
                      <div class="flex items-center gap-1 mb-1.5">
                        <div class="p-0.5 bg-indigo-100 dark:bg-indigo-600/20 rounded">
                          <lucide-angular name="file-text" [size]="10" class="text-indigo-600 dark:text-indigo-400"></lucide-angular>
                        </div>
                        <h3 class="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">Identificación</h3>
                      </div>
                      <div class="grid grid-cols-2 gap-1.5">
                        @for (field of getFieldsBySection('personal', ['codigo_identificacion', 'documento']); track field.fieldCode) {
                          <div class="bg-gray-50 dark:bg-slate-900/50 rounded p-1.5 border border-gray-200 dark:border-slate-700/50">
                            <p class="text-[9px] text-gray-600 dark:text-gray-400 font-semibold uppercase mb-0.5 leading-none">{{ field.fieldName }}</p>
                            <p class="text-xs text-gray-900 dark:text-white font-medium">{{ field.value || 'N/A' }}</p>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Sección: Información Personal -->
                    <div class="bg-white dark:bg-slate-800/50 rounded-lg p-1.5 border border-cyan-200 dark:border-cyan-600/20">
                      <div class="flex items-center gap-1 mb-1.5">
                        <div class="p-0.5 bg-cyan-100 dark:bg-cyan-600/20 rounded">
                          <lucide-angular name="user" [size]="10" class="text-cyan-600 dark:text-cyan-400"></lucide-angular>
                        </div>
                        <h3 class="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide">Información Personal</h3>
                      </div>
                      <div class="grid grid-cols-3 gap-1.5">
                        @for (field of getFieldsBySection('personal', ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'nombre_completo']); track field.fieldCode) {
                          <div class="bg-gray-50 dark:bg-slate-900/50 rounded p-1.5 border border-gray-200 dark:border-slate-700/50">
                            <p class="text-[9px] text-gray-600 dark:text-gray-400 font-semibold uppercase mb-0.5 leading-none">{{ field.fieldName }}</p>
                            <p class="text-xs text-gray-900 dark:text-white font-medium">{{ field.value || 'N/A' }}</p>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Sección: Datos Demográficos -->
                    <div class="bg-white dark:bg-slate-800/50 rounded-lg p-1.5 border border-green-200 dark:border-green-600/20">
                      <div class="flex items-center gap-1 mb-1.5">
                        <div class="p-0.5 bg-green-100 dark:bg-green-600/20 rounded">
                          <lucide-angular name="calendar" [size]="10" class="text-green-600 dark:text-green-400"></lucide-angular>
                        </div>
                        <h3 class="text-[10px] font-bold text-green-700 dark:text-green-300 uppercase tracking-wide">Datos Demográficos</h3>
                      </div>
                      <div class="grid grid-cols-3 gap-1.5">
                        @for (field of getFieldsBySection('personal', ['fecha_nacimiento', 'edad', 'estado_civil']); track field.fieldCode) {
                          <div class="bg-gray-50 dark:bg-slate-900/50 rounded p-1.5 border border-gray-200 dark:border-slate-700/50">
                            <p class="text-[9px] text-gray-600 dark:text-gray-400 font-semibold uppercase mb-0.5 leading-none">{{ field.fieldName }}</p>
                            <p class="text-xs text-gray-900 dark:text-white font-medium">{{ field.value || 'N/A' }}</p>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Sección: Información Laboral -->
                    <div class="bg-white dark:bg-slate-800/50 rounded-lg p-2 border border-orange-200 dark:border-orange-600/20">
                      <div class="flex items-center gap-1 mb-1.5">
                        <div class="p-0.5 bg-orange-100 dark:bg-orange-600/20 rounded">
                          <lucide-angular name="briefcase" [size]="10" class="text-orange-600 dark:text-orange-400"></lucide-angular>
                        </div>
                        <h3 class="text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide">Información Laboral</h3>
                      </div>
                      <div class="grid grid-cols-2 gap-1.5">
                        @for (field of getFieldsBySection('personal', ['ocupacion', 'tipo_cliente']); track field.fieldCode) {
                          <div class="bg-gray-50 dark:bg-slate-900/50 rounded p-1.5 border border-gray-200 dark:border-slate-700/50">
                            <p class="text-[9px] text-gray-600 dark:text-gray-400 font-semibold uppercase mb-0.5 leading-none">{{ field.fieldName }}</p>
                            <p class="text-xs text-gray-900 dark:text-white font-medium">{{ field.value || 'N/A' }}</p>
                          </div>
                        }
                      </div>
                    </div>

                  </div>
                }

                <!-- Contacto Tab con Mini Secciones -->
                @if (activeTab() === 'contacto') {
                  <div class="space-y-2">

                    <!-- Sección: Teléfonos -->
                    <div class="bg-white dark:bg-slate-800/50 rounded-lg p-2 border border-green-200 dark:border-green-600/20">
                      <div class="flex items-center gap-1 mb-1.5">
                        <div class="p-0.5 bg-green-100 dark:bg-green-600/20 rounded">
                          <lucide-angular name="phone" [size]="10" class="text-green-600 dark:text-green-400"></lucide-angular>
                        </div>
                        <h3 class="text-[10px] font-bold text-green-700 dark:text-green-300 uppercase tracking-wide">Teléfonos</h3>
                      </div>
                      @if (getPhoneContactMethods().length > 0) {
                        <div class="grid grid-cols-3 gap-1.5">
                          @for (contact of getPhoneContactMethods(); track contact.id) {
                            <div class="bg-gray-50 dark:bg-slate-900/50 rounded p-1.5 border border-gray-200 dark:border-slate-700/50">
                              <p class="text-[9px] text-gray-600 dark:text-gray-400 font-semibold uppercase mb-0.5 leading-none">{{ getContactLabel(contact.subtype) }}</p>
                              <p class="text-xs text-gray-900 dark:text-white font-medium">{{ contact.value }}</p>
                            </div>
                          }
                        </div>
                      } @else {
                        <div class="text-xs text-gray-500 dark:text-gray-400 italic">No hay teléfonos registrados</div>
                      }
                    </div>

                    <!-- Sección: Correo Electrónico -->
                    <div class="bg-white dark:bg-slate-800/50 rounded-lg p-2 border border-purple-200 dark:border-purple-600/20">
                      <div class="flex items-center gap-1 mb-1.5">
                        <div class="p-0.5 bg-purple-100 dark:bg-purple-600/20 rounded">
                          <lucide-angular name="mail" [size]="10" class="text-purple-600 dark:text-purple-400"></lucide-angular>
                        </div>
                        <h3 class="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Correo Electrónico</h3>
                      </div>
                      @if (getEmailContactMethods().length > 0) {
                        <div class="grid grid-cols-1 gap-1.5">
                          @for (contact of getEmailContactMethods(); track contact.id) {
                            <div class="bg-gray-50 dark:bg-slate-900/50 rounded p-1.5 border border-gray-200 dark:border-slate-700/50">
                              <p class="text-[9px] text-gray-600 dark:text-gray-400 font-semibold uppercase mb-0.5 leading-none">{{ contact.label || 'Email' }}</p>
                              <p class="text-xs text-gray-900 dark:text-white font-medium">{{ contact.value }}</p>
                            </div>
                          }
                        </div>
                      } @else {
                        <div class="text-xs text-gray-500 dark:text-gray-400 italic">No hay emails registrados</div>
                      }
                    </div>

                  </div>
                }

                <!-- Ubicación Tab con Mini Secciones -->
                @if (activeTab() === 'ubicacion') {
                  <div class="space-y-2">

                    <!-- Sección: Dirección -->
                    <div class="bg-white dark:bg-slate-800/50 rounded-lg p-2 border border-purple-200 dark:border-purple-600/20">
                      <div class="flex items-center gap-1 mb-1.5">
                        <div class="p-0.5 bg-purple-100 dark:bg-purple-600/20 rounded">
                          <lucide-angular name="home" [size]="10" class="text-purple-600 dark:text-purple-400"></lucide-angular>
                        </div>
                        <h3 class="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Dirección</h3>
                      </div>
                      <div class="grid grid-cols-1 gap-1.5">
                        @for (field of getFieldsBySection('ubicacion', ['direccion']); track field.fieldCode) {
                          <div class="bg-gray-50 dark:bg-slate-900/50 rounded p-1.5 border border-gray-200 dark:border-slate-700/50">
                            <p class="text-[9px] text-gray-600 dark:text-gray-400 font-semibold uppercase mb-0.5 leading-none">{{ field.fieldName }}</p>
                            <p class="text-xs text-gray-900 dark:text-white font-medium">{{ field.value || 'N/A' }}</p>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Sección: Ubicación Geográfica -->
                    <div class="bg-white dark:bg-slate-800/50 rounded-lg p-2 border border-blue-200 dark:border-blue-600/20">
                      <div class="flex items-center gap-1 mb-1.5">
                        <div class="p-0.5 bg-blue-100 dark:bg-blue-600/20 rounded">
                          <lucide-angular name="map-pin" [size]="10" class="text-blue-600 dark:text-blue-400"></lucide-angular>
                        </div>
                        <h3 class="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Ubicación Geográfica</h3>
                      </div>
                      <div class="grid grid-cols-3 gap-1.5">
                        @for (field of getFieldsBySection('ubicacion', ['distrito', 'provincia', 'departamento']); track field.fieldCode) {
                          <div class="bg-gray-50 dark:bg-slate-900/50 rounded p-1.5 border border-gray-200 dark:border-slate-700/50">
                            <p class="text-[9px] text-gray-600 dark:text-gray-400 font-semibold uppercase mb-0.5 leading-none">{{ field.fieldName }}</p>
                            <p class="text-xs text-gray-900 dark:text-white font-medium">{{ field.value || 'N/A' }}</p>
                          </div>
                        }
                      </div>
                    </div>

                  </div>
                }

                <!-- Referencias Tab con Mini Secciones -->
                @if (activeTab() === 'referencias') {
                  <div class="space-y-2">

                    <!-- Sección: Referencias Personales -->
                    <div class="bg-white dark:bg-slate-800/50 rounded-lg p-2 border border-indigo-200 dark:border-indigo-600/20">
                      <div class="flex items-center gap-1 mb-1.5">
                        <div class="p-0.5 bg-indigo-100 dark:bg-indigo-600/20 rounded">
                          <lucide-angular name="users" [size]="10" class="text-indigo-600 dark:text-indigo-400"></lucide-angular>
                        </div>
                        <h3 class="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">Referencia Personal</h3>
                      </div>
                      <div class="grid grid-cols-1 gap-1.5">
                        @for (field of getFieldsBySection('referencias', ['referencia_personal']); track field.fieldCode) {
                          <div class="bg-gray-50 dark:bg-slate-900/50 rounded p-1.5 border border-gray-200 dark:border-slate-700/50">
                            <p class="text-[9px] text-gray-600 dark:text-gray-400 font-semibold uppercase mb-0.5 leading-none">{{ field.fieldName }}</p>
                            <p class="text-xs text-gray-900 dark:text-white font-medium">{{ field.value || 'N/A' }}</p>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Sección: Teléfonos de Referencia -->
                    <div class="bg-white dark:bg-slate-800/50 rounded-lg p-2 border border-blue-200 dark:border-blue-600/20">
                      <div class="flex items-center gap-1 mb-1.5">
                        <div class="p-0.5 bg-blue-100 dark:bg-blue-600/20 rounded">
                          <lucide-angular name="phone" [size]="10" class="text-blue-600 dark:text-blue-400"></lucide-angular>
                        </div>
                        <h3 class="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Teléfonos de Referencia</h3>
                      </div>
                      @if (getReferenceContactMethods().length > 0) {
                        <div class="grid grid-cols-2 gap-1.5">
                          @for (contact of getReferenceContactMethods(); track contact.id) {
                            <div class="bg-gray-50 dark:bg-slate-900/50 rounded p-1.5 border border-gray-200 dark:border-slate-700/50">
                              <p class="text-[9px] text-gray-600 dark:text-gray-400 font-semibold uppercase mb-0.5 leading-none">{{ getContactLabel(contact.subtype) }}</p>
                              <p class="text-xs text-gray-900 dark:text-white font-medium">{{ contact.value }}</p>
                            </div>
                          }
                        </div>
                      } @else {
                        <div class="text-xs text-gray-500 dark:text-gray-400 italic">No hay teléfonos de referencia registrados</div>
                      }
                    </div>

                  </div>
                }

              </div>
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
export class CustomerViewComponent implements OnInit {
  private customerService = inject(CustomerService);

  customer = signal<CustomerResource | null>(null);
  activeTab = signal<'personal' | 'contacto' | 'ubicacion' | 'referencias'>('personal');
  searchDocument = '';
  searchCriteria = 'codigo_identificacion'; // Criterio de búsqueda por defecto
  searchPerformed = signal(false);
  loading = signal(false);
  recentCustomers = signal<{document: string, fullName: string}[]>([]);
  searchResults = signal<CustomerResource[]>([]);
  showMultipleResults = signal(false);

  // TODO: Obtener este valor del contexto del usuario/sesión
  private subPortfolioId = 1; // Por ahora hardcodeado, debe venir de la sesión
  private tenantId = 1; // Por ahora hardcodeado, debe venir de la sesión

  // Opciones de criterios de búsqueda
  searchCriteriaOptions = [
    { value: 'codigo_identificacion', label: 'Código de Identificación', icon: 'file-text' },
    { value: 'documento', label: 'Documento', icon: 'id-card' },
    { value: 'numero_cuenta', label: 'Número de Cuenta', icon: 'credit-card' },
    { value: 'telefono_principal', label: 'Teléfono Principal', icon: 'phone' }
  ];

  ngOnInit() {
    // Cargar clientes recientes al iniciar
    this.loadRecentCustomers();
  }

  loadRecentCustomers() {
    this.customerService.getRecentCustomers().subscribe({
      next: (customers) => {
        this.recentCustomers.set(customers);
      },
      error: (error) => {
        console.error('Error cargando clientes recientes:', error);
      }
    });
  }

  searchCustomer() {
    if (!this.searchDocument.trim()) {
      alert('Por favor ingrese un valor de búsqueda');
      return;
    }

    this.loading.set(true);
    this.searchPerformed.set(true);
    this.showMultipleResults.set(false);
    this.searchResults.set([]);

    this.customerService.searchCustomersByCriteria(this.tenantId, this.searchCriteria, this.searchDocument).subscribe({
      next: (data) => {
        console.log('Resultados encontrados:', data);
        if (data.length === 0) {
          // No se encontró ningún resultado
          this.customer.set(null);
          this.searchResults.set([]);
          this.showMultipleResults.set(false);
        } else if (data.length === 1) {
          // Un solo resultado, mostrarlo directamente
          this.customer.set(data[0]);
          this.searchResults.set([]);
          this.showMultipleResults.set(false);
        } else {
          // Múltiples resultados, mostrar lista de selección
          this.customer.set(null);
          this.searchResults.set(data);
          this.showMultipleResults.set(true);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error buscando cliente:', error);
        this.customer.set(null);
        this.searchResults.set([]);
        this.showMultipleResults.set(false);
        this.loading.set(false);
      }
    });
  }

  selectCustomerFromResults(selectedCustomer: CustomerResource) {
    this.customer.set(selectedCustomer);
    this.showMultipleResults.set(false);
    this.searchResults.set([]);
  }

  getSelectedCriteriaLabel(): string {
    const selected = this.searchCriteriaOptions.find(opt => opt.value === this.searchCriteria);
    return selected ? selected.label : 'Buscar por';
  }

  quickSearch(document: string) {
    this.searchDocument = document;
    this.searchCustomer();
  }

  clearCustomer() {
    this.customer.set(null);
    this.searchDocument = '';
    this.searchPerformed.set(false);
    this.showMultipleResults.set(false);
    this.searchResults.set([]);
    this.activeTab.set('personal');
  }

  // Obtener icono según la edad
  getAgeIcon(): string {
    const edad = Number(this.getFieldValue('edad')) || 0;
    if (edad < 30) return 'smile';
    if (edad < 50) return 'user';
    return 'glasses';
  }

  // Obtener clase del avatar según edad
  getAvatarClass(): string {
    const edad = Number(this.getFieldValue('edad')) || 0;
    if (edad < 30) return 'bg-gradient-to-br from-green-500 to-emerald-600 border-4 border-green-400/30';
    if (edad < 50) return 'bg-gradient-to-br from-blue-500 to-blue-700 border-4 border-blue-400/30';
    return 'bg-gradient-to-br from-purple-500 to-purple-700 border-4 border-purple-400/30';
  }

  // Obtener categoría de edad
  getAgeCategory(): string {
    const edad = Number(this.getFieldValue('edad')) || 0;
    if (edad < 30) return 'Joven';
    if (edad < 50) return 'Adulto';
    return 'Senior';
  }

  // Obtener clase del badge de edad
  getAgeBadgeClass(): string {
    const edad = Number(this.getFieldValue('edad')) || 0;
    if (edad < 30) return 'bg-green-600/30 text-green-300 border border-green-500/50';
    if (edad < 50) return 'bg-blue-600/30 text-blue-300 border border-blue-500/50';
    return 'bg-purple-600/30 text-purple-300 border border-purple-500/50';
  }

  getFieldValue(fieldCode: string): string | number | null {
    const customerData = this.customer();
    if (!customerData) return null;

    // Mapeo completo de fieldCode a propiedades de CustomerResource
    const fieldMapping: any = {
      // Identificación
      'codigo_identificacion': customerData.identificationCode || customerData.customerId,
      'documento': customerData.documentNumber,
      'tipo_documento': customerData.documentType,
      // Nombres
      'nombre_completo': customerData.fullName,
      'primer_nombre': customerData.firstName,
      'segundo_nombre': customerData.secondName,
      'primer_apellido': customerData.firstLastName,
      'segundo_apellido': customerData.secondLastName,
      // Datos personales
      'edad': customerData.age,
      'fecha_nacimiento': customerData.birthDate,
      'estado_civil': customerData.maritalStatus,
      'ocupacion': customerData.occupation,
      'tipo_cliente': customerData.customerType,
      // Ubicación
      'direccion': customerData.address,
      'distrito': customerData.district,
      'provincia': customerData.province,
      'departamento': customerData.department,
      // Referencias
      'referencia_personal': customerData.personalReference
    };

    return fieldMapping[fieldCode] || null;
  }

  getFieldsByCategory(category: 'personal' | 'contacto' | 'ubicacion' | 'referencias'): any[] {
    // Por ahora retornar array vacío, CustomerResource tiene campos limitados
    return [];
  }

  getFieldsBySection(category: 'personal' | 'contacto' | 'ubicacion' | 'referencias', fieldCodes: string[]): any[] {
    const customerData = this.customer();
    if (!customerData) return [];

    // Definición completa de todos los campos disponibles
    const fieldDefinitions: any = {
      // Identificación
      'codigo_identificacion': { name: 'Código de Identificación', value: customerData.identificationCode, type: 'TEXTO' },
      'documento': { name: 'Documento', value: customerData.documentNumber, type: 'TEXTO' },
      'tipo_documento': { name: 'Tipo de Documento', value: customerData.documentType, type: 'TEXTO' },

      // Nombres
      'nombre_completo': { name: 'Nombre Completo', value: customerData.fullName, type: 'TEXTO' },
      'primer_nombre': { name: 'Primer Nombre', value: customerData.firstName, type: 'TEXTO' },
      'segundo_nombre': { name: 'Segundo Nombre', value: customerData.secondName, type: 'TEXTO' },
      'primer_apellido': { name: 'Primer Apellido', value: customerData.firstLastName, type: 'TEXTO' },
      'segundo_apellido': { name: 'Segundo Apellido', value: customerData.secondLastName, type: 'TEXTO' },

      // Datos personales
      'edad': { name: 'Edad', value: customerData.age, type: 'NUMERICO' },
      'fecha_nacimiento': { name: 'Fecha de Nacimiento', value: customerData.birthDate, type: 'FECHA' },
      'estado_civil': { name: 'Estado Civil', value: customerData.maritalStatus, type: 'TEXTO' },
      'ocupacion': { name: 'Ocupación', value: customerData.occupation, type: 'TEXTO' },
      'tipo_cliente': { name: 'Tipo de Cliente', value: customerData.customerType, type: 'TEXTO' },

      // Ubicación
      'direccion': { name: 'Dirección', value: customerData.address, type: 'TEXTO' },
      'distrito': { name: 'Distrito', value: customerData.district, type: 'TEXTO' },
      'provincia': { name: 'Provincia', value: customerData.province, type: 'TEXTO' },
      'departamento': { name: 'Departamento', value: customerData.department, type: 'TEXTO' },

      // Referencias
      'referencia_personal': { name: 'Referencia Personal', value: customerData.personalReference, type: 'TEXTO' }
    };

    // Crear array de campos basado en fieldCodes solicitados
    const fields: any[] = [];

    for (const fieldCode of fieldCodes) {
      const fieldDef = fieldDefinitions[fieldCode];
      if (fieldDef && fieldDef.value !== null && fieldDef.value !== undefined) {
        fields.push({
          fieldCode: fieldCode,
          fieldName: fieldDef.name,
          value: fieldDef.value,
          dataType: fieldDef.type
        });
      }
    }

    return fields;
  }

  /**
   * Obtiene los métodos de contacto de tipo teléfono
   */
  getPhoneContactMethods() {
    const customerData = this.customer();
    if (!customerData || !customerData.contactMethods) return [];

    // Filtrar solo teléfonos personales (excluir teléfonos de referencia)
    const phones = customerData.contactMethods.filter(cm =>
      cm.contactType === 'telefono' &&
      !cm.subtype.startsWith('telefono_referencia')
    );

    // Ordenar: telefono_principal primero, luego los demás
    const phonePriority: { [key: string]: number } = {
      'telefono_principal': 1,
      'telefono_secundario': 2,
      'telefono_trabajo': 3
    };

    return phones.sort((a, b) => {
      const priorityA = phonePriority[a.subtype] || 999;
      const priorityB = phonePriority[b.subtype] || 999;
      return priorityA - priorityB;
    });
  }

  /**
   * Obtiene los métodos de contacto de tipo email
   */
  getEmailContactMethods() {
    const customerData = this.customer();
    if (!customerData || !customerData.contactMethods) return [];

    return customerData.contactMethods.filter(cm => cm.contactType === 'email');
  }

  /**
   * Convierte el código de subtipo a una etiqueta legible
   */
  getContactLabel(subtype: string): string {
    const labels: { [key: string]: string } = {
      'telefono_principal': 'Teléfono Principal',
      'telefono_secundario': 'Teléfono Secundario',
      'telefono_trabajo': 'Teléfono de Trabajo',
      'telefono_referencia_1': 'Teléfono Referencia 1',
      'telefono_referencia_2': 'Teléfono Referencia 2',
      'email': 'Correo Electrónico'
    };

    return labels[subtype] || subtype;
  }

  /**
   * Obtiene los métodos de contacto de tipo teléfono de referencia
   */
  getReferenceContactMethods() {
    const customerData = this.customer();
    if (!customerData || !customerData.contactMethods) return [];

    // Filtrar solo teléfonos de referencia
    const referencePhones = customerData.contactMethods.filter(cm =>
      cm.contactType === 'telefono' &&
      cm.subtype.startsWith('telefono_referencia')
    );

    // Ordenar por número de referencia
    return referencePhones.sort((a, b) => {
      const numA = a.subtype.includes('1') ? 1 : 2;
      const numB = b.subtype.includes('1') ? 1 : 2;
      return numA - numB;
    });
  }
}
