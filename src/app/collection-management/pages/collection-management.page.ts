import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
} from 'lucide-angular';

import { SystemConfigService } from '../services/system-config.service';
import { ManagementService, CreateManagementRequest, StartCallRequest, EndCallRequest, RegisterPaymentRequest } from '../services/management.service';
import { ThemeService } from '../../shared/services/theme.service';
import { ManagementClassification } from '../models/system-config.model';
import { CustomerData } from '../models/customer.model';
import { ManagementForm, ValidationErrors } from '../models/management.model';
import { Tenant } from '../../maintenance/models/tenant.model';
import { Portfolio } from '../../maintenance/models/portfolio.model';
import { ClassificationService } from '../../maintenance/services/classification.service';
import { ApiSystemConfigService } from '../services/api-system-config.service';
import { DynamicFieldRendererComponent } from '../components/dynamic-field-renderer/dynamic-field-renderer.component';
import { MetadataSchema, FieldConfig } from '../../maintenance/models/field-config.model';

@Component({
  selector: 'app-collection-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    DynamicFieldRendererComponent
  ],
  template: `
    <div class="h-[100dvh] bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-gray-950 dark:to-black flex flex-col overflow-hidden transition-colors duration-300">
      <!-- Notificación de éxito -->
      @if (showSuccess()) {
        <div class="fixed top-4 right-4 z-50 animate-[slideInRight_0.5s_ease-out]">
          <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
            <lucide-angular name="check-circle" [size]="24"></lucide-angular>
            <div>
              <div class="font-bold">¡Gestión Guardada!</div>
              <div class="text-sm opacity-90">Los datos se registraron correctamente</div>
            </div>
          </div>
        </div>
      }

      <!-- Header Principal - ULTRA COMPACTO -->
      <div class="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 text-white shadow-md relative overflow-hidden">
        <div class="relative px-3 py-1">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div>
                <div class="flex items-center gap-1.5">
                  <div class="bg-blue-500 dark:bg-blue-600 p-1 rounded">
                    <lucide-angular name="activity" [size]="14"></lucide-angular>
                  </div>
                  <div>
                    <h1 class="text-sm font-bold">Gestión de Cobranza</h1>
                    <p class="text-[9px] text-blue-200 dark:text-blue-300 flex items-center gap-0.5">
                      <lucide-angular name="bar-chart-3" [size]="8"></lucide-angular>
                      {{ campaign().nombre }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="h-6 w-px bg-white/20"></div>
              <div class="text-xs">
                <div class="text-blue-200 dark:text-blue-300 text-[9px]">Asesor</div>
                <div class="font-semibold text-white text-xs">María González Castro</div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <!-- Botón de Dark Mode -->
              <button
                (click)="toggleDarkMode()"
                [class]="'flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-300 group border ' +
                  (themeService.isDarkMode()
                    ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/40'
                    : 'bg-blue-500/90 hover:bg-blue-600 border-blue-600')"
                [attr.aria-label]="themeService.isDarkMode() ? 'Activar modo claro' : 'Activar modo oscuro'"
                title="Cambiar tema"
              >
                @if (themeService.isDarkMode()) {
                  <lucide-angular name="sun" [size]="16" class="text-yellow-300 group-hover:rotate-45 transition-transform duration-300"></lucide-angular>
                  <span class="text-[10px] text-yellow-300 font-semibold">OSCURO</span>
                } @else {
                  <lucide-angular name="moon" [size]="16" class="text-white group-hover:rotate-12 transition-transform duration-300"></lucide-angular>
                  <span class="text-[10px] text-white font-semibold">CLARO</span>
                }
              </button>

              <div class="h-6 w-px bg-white/20"></div>

              <div class="text-right">
                <div class="text-blue-200 dark:text-blue-300 text-[9px]">Estado</div>
                <div [class]="'font-semibold text-xs transition-all duration-300 ' + (callActive() ? 'text-green-400 animate-pulse' : 'text-slate-300 dark:text-slate-200')">
                  {{ callActive() ? '● EN LLAMADA' : '○ DISPONIBLE' }}
                </div>
              </div>
              <div [class]="'px-3 py-1 rounded font-mono text-base font-bold transition-all duration-300 ' + (callActive() ? 'bg-gradient-to-r from-red-600 to-red-700 animate-pulse' : 'bg-slate-800/50 dark:bg-gray-900/80')">
                {{ formatTime(callDuration()) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TEMPORAL: Filtros de Tenant y Portfolio - ABSOLUTE POSITION FLOTANTE para fácil eliminación -->
      @if (tenants.length > 0 || portfolios.length > 0) {
        <div class="fixed top-16 left-4 z-50 flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/40 border-2 border-yellow-500 dark:border-yellow-600 px-3 py-2 rounded-lg shadow-xl text-[10px]">
          <span class="text-yellow-800 dark:text-yellow-200 font-bold">⚠️ TEMP - Testing Only:</span>

          @if (tenants.length > 0) {
            <select
              [(ngModel)]="selectedTenantId"
              (change)="onTenantChange()"
              class="text-[10px] font-semibold text-gray-900 dark:text-white bg-white dark:bg-slate-800 border border-gray-400 dark:border-gray-600 rounded px-2 py-1 cursor-pointer shadow-sm">
              <option *ngFor="let tenant of tenants" [ngValue]="tenant.id">
                Cliente: {{ tenant.tenantName }}
              </option>
            </select>
          }

          @if (portfolios.length > 0) {
            <select
              [(ngModel)]="selectedPortfolioId"
              (change)="onPortfolioChange()"
              class="text-[10px] font-semibold text-gray-900 dark:text-white bg-white dark:bg-slate-800 border border-gray-400 dark:border-gray-600 rounded px-2 py-1 cursor-pointer shadow-sm">
              <option [ngValue]="undefined">Cartera: Todas</option>
              <option *ngFor="let portfolio of portfolios" [ngValue]="portfolio.id">
                Cartera: {{ portfolio.portfolioName }}
              </option>
            </select>
          }
        </div>
      }

      <!-- Barra de Info Cliente - ULTRA COMPACTA -->
      <div class="bg-white dark:bg-slate-900 border-b border-blue-400 dark:border-slate-700 shadow-sm relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-50 dark:from-blue-950/50 to-transparent opacity-50"></div>
        <div class="relative px-3 py-1">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 text-xs">
              <div>
                <div class="text-[9px] text-gray-500 dark:text-white uppercase font-semibold flex items-center gap-0.5">
                  <lucide-angular name="users" [size]="8"></lucide-angular>
                  Cliente
                </div>
                <div class="text-xs font-bold text-gray-900 dark:text-white">{{ customerData().nombre_completo }}</div>
              </div>
              <div class="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
              <div>
                <div class="text-[9px] text-gray-500 dark:text-white">Documento</div>
                <div class="font-semibold text-gray-800 dark:text-white text-[10px]">{{ customerData().tipo_documento }}: {{ customerData().numero_documento }}</div>
              </div>
              <div class="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
              <div>
                <div class="text-[9px] text-gray-500 dark:text-white">ID Cliente</div>
                <div class="font-semibold text-gray-800 dark:text-white font-mono text-[10px]">{{ customerData().id_cliente }}</div>
              </div>
              <div class="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
              <div>
                <div class="text-[9px] text-gray-500 dark:text-white">Cuenta</div>
                <div class="font-semibold text-gray-800 dark:text-white text-[10px]">{{ customerData().cuenta.numero_cuenta }}</div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <div class="text-right bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded border border-red-200 dark:border-red-900/50">
                <div class="text-[9px] text-red-600 dark:text-red-200 font-semibold flex items-center justify-end gap-0.5">
                  <lucide-angular name="dollar-sign" [size]="8"></lucide-angular>
                  Deuda
                </div>
                <div class="text-sm font-bold text-red-600 dark:text-red-100">S/ {{ customerData().deuda.saldo_total.toFixed(2) }}</div>
              </div>
              <div class="text-right bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded border border-orange-200 dark:border-orange-900/50">
                <div class="text-[9px] text-orange-600 dark:text-orange-200 font-semibold flex items-center justify-end gap-0.5">
                  <lucide-angular name="clock" [size]="8"></lucide-angular>
                  Mora
                </div>
                <div class="text-sm font-bold text-orange-600 dark:text-orange-100">{{ customerData().deuda.dias_mora }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido Principal -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Panel Izquierdo - COMPACTO -->
        <div class="w-80 bg-white dark:bg-slate-900 border-r dark:border-slate-800 shadow-lg overflow-hidden flex flex-col transition-colors duration-300">
          <!-- Tabs compactos -->
          <div class="flex border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            @for (tab of tabs; track tab.id) {
              <button
                (click)="activeTab.set(tab.id)"
                [class]="'flex-1 px-2 py-1.5 text-xs font-semibold transition-all duration-300 relative group ' +
                  (activeTab() === tab.id ? 'text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/50' : 'text-gray-700 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-200 hover:bg-gray-50 dark:hover:bg-gray-800')"
              >
                <div class="flex items-center justify-center gap-1">
                  <lucide-angular [name]="tab.icon" [size]="12"></lucide-angular>
                  {{ tab.label }}
                </div>
                @if (activeTab() === tab.id) {
                  <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                }
              </button>
            }
          </div>

          <!-- Contenido de tabs -->
          <div class="flex-1 overflow-y-auto p-2">
            <div>
              @if (activeTab() === 'cliente') {
                <div class="space-y-2">
                  <div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-2">
                    <div class="text-[10px] font-bold text-blue-800 dark:text-blue-100 mb-1 flex items-center gap-1">
                      <lucide-angular name="user" [size]="10"></lucide-angular>
                      Datos Personales
                    </div>
                    <div class="space-y-1 text-[10px]">
                      <div class="flex justify-between">
                        <span class="text-blue-700 dark:text-blue-200">Edad:</span>
                        <span class="font-bold text-blue-900 dark:text-white">{{ customerData().edad }} años</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-blue-700 dark:text-blue-200">F. Nac:</span>
                        <span class="font-bold text-blue-900 dark:text-white">{{ customerData().fecha_nacimiento }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-lg p-2">
                    <div class="text-[10px] font-bold text-green-800 dark:text-green-100 mb-1 flex items-center gap-1">
                      <lucide-angular name="phone-call" [size]="10"></lucide-angular>
                      Contacto
                    </div>
                    <div class="space-y-1 text-[10px]">
                      <div class="bg-white dark:bg-gray-800/50 rounded p-1">
                        <div class="text-green-700 dark:text-green-200">Tel. Principal</div>
                        <div class="font-bold text-green-900 dark:text-white">{{ customerData().contacto.telefono_principal }}</div>
                      </div>
                      <div class="bg-white dark:bg-gray-800/50 rounded p-1">
                        <div class="text-green-700 dark:text-green-200">Tel. Alt.</div>
                        <div class="font-bold text-green-900 dark:text-white">{{ customerData().contacto.telefono_alternativo }}</div>
                      </div>
                      <div class="bg-white dark:bg-gray-800/50 rounded p-1">
                        <div class="text-green-700 dark:text-green-200">Email</div>
                        <div class="font-bold text-green-900 dark:text-white break-all">{{ customerData().contacto.email }}</div>
                      </div>
                      <div class="bg-white dark:bg-gray-800/50 rounded p-1">
                        <div class="text-green-700 dark:text-green-200">Dirección</div>
                        <div class="font-semibold text-green-900 dark:text-white leading-snug">{{ customerData().contacto.direccion }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              }

              @if (activeTab() === 'cuenta') {
                <div class="space-y-2">
                  <div class="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                    <div class="text-[10px] font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-1">
                      <lucide-angular name="building" [size]="10"></lucide-angular>
                      Info. Producto
                    </div>
                    <div class="space-y-1 text-[10px]">
                      <div class="flex justify-between">
                        <span class="text-slate-600 dark:text-slate-200">Producto:</span>
                        <span class="font-bold text-slate-900 dark:text-white">{{ customerData().cuenta.tipo_producto }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600 dark:text-slate-200">F. Desemb.:</span>
                        <span class="font-bold text-slate-900 dark:text-white">{{ customerData().cuenta.fecha_desembolso }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600 dark:text-slate-200">Monto:</span>
                        <span class="font-bold text-slate-900 dark:text-white">S/ {{ customerData().cuenta.monto_original.toFixed(2) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600 dark:text-slate-200">Plazo:</span>
                        <span class="font-bold text-slate-900 dark:text-white">{{ customerData().cuenta.plazo_meses }}m</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600 dark:text-slate-200">Tasa:</span>
                        <span class="font-bold text-slate-900 dark:text-white">{{ customerData().cuenta.tasa_interes }}%</span>
                      </div>
                    </div>
                  </div>

                  <div class="bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-900/50 rounded-lg p-2">
                    <div class="text-[10px] font-bold text-red-800 dark:text-red-100 mb-1 flex items-center gap-1">
                      <lucide-angular name="alert-circle" [size]="10"></lucide-angular>
                      Detalle Deuda
                    </div>
                    <div class="space-y-1 text-[10px]">
                      <div class="flex justify-between bg-white dark:bg-gray-800/50 rounded px-1">
                        <span class="text-red-700 dark:text-red-200">Capital:</span>
                        <span class="font-bold text-red-900 dark:text-white">S/ {{ customerData().deuda.saldo_capital.toFixed(2) }}</span>
                      </div>
                      <div class="flex justify-between bg-white dark:bg-gray-800/50 rounded px-1">
                        <span class="text-red-700 dark:text-red-200">Intereses:</span>
                        <span class="font-bold text-red-900 dark:text-white">S/ {{ customerData().deuda.intereses_vencidos.toFixed(2) }}</span>
                      </div>
                      <div class="flex justify-between bg-white rounded px-1">
                        <span class="text-red-700">Moras:</span>
                        <span class="font-bold text-red-900">S/ {{ customerData().deuda.mora_acumulada.toFixed(2) }}</span>
                      </div>
                      <div class="flex justify-between bg-white rounded px-1">
                        <span class="text-red-700">G. Cobr.:</span>
                        <span class="font-bold text-red-900">S/ {{ customerData().deuda.gastos_cobranza.toFixed(2) }}</span>
                      </div>
                      <div class="h-px bg-red-300 my-1"></div>
                      <div class="flex justify-between bg-red-200 rounded px-1 py-0.5">
                        <span class="font-bold text-red-900">Total:</span>
                        <span class="font-bold text-red-900">S/ {{ customerData().deuda.saldo_total.toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              }

              @if (activeTab() === 'historial') {
                <div class="space-y-2">
                  @if (historialGestiones().length === 0) {
                    <p class="text-sm text-gray-500 dark:text-gray-100">Sin gestiones previas</p>
                  } @else {
                    @for (gestion of historialGestiones(); track $index) {
                      <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                        <div class="flex justify-between items-start mb-1">
                          <div class="text-[9px] font-bold text-gray-700 dark:text-gray-100 flex items-center gap-1">
                            <lucide-angular name="clock" [size]="8"></lucide-angular>
                            {{ gestion.fecha }}
                          </div>
                          <div class="text-[9px] text-gray-500 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 px-1 rounded">{{ gestion.asesor }}</div>
                        </div>
                        <div class="space-y-1 text-[10px]">
                          <div class="font-bold text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded inline-block">{{ gestion.resultado }}</div>
                          <div class="font-semibold text-green-700 dark:text-green-200 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded inline-block ml-1">{{ gestion.gestion }}</div>
                          <div class="text-[9px] text-gray-600 dark:text-gray-100 italic mt-1 bg-white dark:bg-gray-900 p-1 rounded leading-tight">{{ gestion.observacion }}</div>
                          <div class="text-[9px] text-gray-500 dark:text-gray-100">Duración: {{ gestion.duracion }}</div>
                        </div>
                      </div>
                    }
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Panel Central - ULTRA COMPACTO -->
        <div class="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-900 transition-colors duration-300">
          <div class="p-3 space-y-2">
            <!-- Control de Llamada - COMPACTO -->
            <div [class]="'bg-white dark:bg-gray-800 rounded-lg shadow-md border p-2 transition-colors duration-300 ' + (callActive() ? 'border-green-400 dark:border-green-500' : 'border-gray-200 dark:border-gray-700')">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2 text-xs">
                  <div [class]="'p-1 rounded transition-all duration-300 ' + (callActive() ? 'bg-green-100 dark:bg-green-900/30 animate-pulse' : 'bg-blue-100 dark:bg-blue-900/30')">
                    <lucide-angular name="phone-call" [size]="14" [class]="callActive() ? 'text-green-700 dark:text-green-200' : 'text-blue-700 dark:text-blue-200'"></lucide-angular>
                  </div>
                  Control de Llamada
                </h3>
                <div class="flex gap-2">
                  <button
                    (click)="startCall()"
                    [disabled]="callActive()"
                    class="px-4 py-1.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white dark:text-white disabled:text-gray-200 rounded-lg font-bold flex items-center gap-2 transition-all duration-300 text-xs shadow-md hover:shadow-lg"
                  >
                    <lucide-angular name="phone" [size]="14"></lucide-angular>
                    Iniciar
                  </button>
                  <button
                    (click)="endCall()"
                    [disabled]="!callActive()"
                    class="px-4 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white dark:text-white disabled:text-gray-200 rounded-lg font-bold flex items-center gap-2 transition-all duration-300 text-xs shadow-md hover:shadow-lg"
                  >
                    <lucide-angular name="phone-off" [size]="14"></lucide-angular>
                    Finalizar
                  </button>
                </div>
              </div>
            </div>

            @if (!usesHierarchicalClassifications()) {
            <!-- Resultado de Contacto - COMPACTO -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-2 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-300">
              <label class="block font-bold text-gray-800 dark:text-white mb-1 text-[11px] flex items-center gap-1">
                <div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                Resultado de Contacto *
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="managementForm.resultadoContacto"
                  (ngModelChange)="onContactResultChange()"
                  [class]="'w-full p-2 pr-8 border rounded-lg font-semibold text-gray-700 dark:text-white appearance-none cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 hover:border-blue-400 dark:hover:border-blue-600 text-xs ' +
                    (errors().resultadoContacto ? 'border-red-500 bg-red-50 dark:bg-red-950/30 dark:border-red-600' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900') + ' ' +
                    (managementForm.resultadoContacto ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600' : '')"
                >
                  <option value="">-- Seleccionar resultado --</option>
                  @for (tip of contactClassifications(); track tip.id) {
                    <option [value]="tip.id">[{{ tip.codigo }}] {{ tip.label }}</option>
                  }
                </select>
                <lucide-angular name="chevron-down" [size]="16" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></lucide-angular>
              </div>
              @if (errors().resultadoContacto) {
                <div class="text-red-600 text-[10px] mt-1 flex items-center gap-1">
                  <lucide-angular name="alert-circle" [size]="12"></lucide-angular>
                  Requerido
                </div>
              }
            </div>
            }

            <!-- Tipo de Gestión - SISTEMA DINÁMICO (N NIVELES) -->
            @if (usesHierarchicalClassifications()) {
              @for (level of hierarchyLevels(); track $index) {
                @if (shouldShowLevel($index)) {
                  <div class="bg-green-50 dark:bg-green-950/30 rounded-lg shadow-md border border-green-300 dark:border-green-900/50 p-2 mb-2 animate-[fadeIn_0.3s_ease-in]">
                    <label class="block font-bold text-gray-800 dark:text-white mb-1 text-[11px] flex items-center gap-1">
                      <div [class]="'w-1.5 h-1.5 rounded-full ' +
                        ($index === 0 ? 'bg-red-500' :
                         $index === 1 ? 'bg-blue-500' :
                         $index === 2 ? 'bg-purple-500' :
                         $index === 3 ? 'bg-orange-500' :
                         'bg-green-500')"></div>
                      {{ getDynamicLevelLabel($index) }}{{ $index === 0 ? ' *' : '' }}
                    </label>
                    <div class="relative">
                      <select
                        [ngModel]="selectedClassifications()[$index]"
                        (ngModelChange)="onClassificationLevelChange($index, $event)"
                        [class]="'w-full p-2 pr-8 border rounded-lg font-semibold text-gray-700 dark:text-white appearance-none cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 hover:border-green-500 text-xs ' +
                          (errors().tipoGestion && $index === 0 ? 'border-red-500 bg-red-50 dark:bg-red-950/30' : 'border-green-300 dark:border-green-700 bg-white dark:bg-gray-900') + ' ' +
                          (selectedClassifications()[$index] ? 'bg-green-100 dark:bg-green-950/30 border-green-500 dark:border-green-600' : '')"
                      >
                        <option value="">-- Seleccionar --</option>
                        @for (option of level; track option.id) {
                          <option [value]="option.id">[{{ option.codigo }}] {{ option.label }}</option>
                        }
                      </select>
                      <lucide-angular name="chevron-down" [size]="16" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></lucide-angular>
                    </div>
                    @if (errors().tipoGestion && $index === 0) {
                      <div class="text-red-600 dark:text-red-400 text-[10px] mt-1 flex items-center gap-1">
                        <lucide-angular name="alert-circle" [size]="12"></lucide-angular>
                        Requerido
                      </div>
                    }
                  </div>
                }
              }
            }

            <!-- Sección de Pago - COMPACTA -->
            @if (showPaymentSection()) {
              <div class="bg-green-50 border border-green-400 rounded-lg shadow-md p-2">
                <h3 class="font-bold text-gray-800 mb-2 flex items-center gap-2 text-[11px]">
                  <div class="p-1 bg-green-500 rounded">
                    <lucide-angular name="credit-card" [size]="12" class="text-white"></lucide-angular>
                  </div>
                  Registro de Pago
                </h3>

                <div class="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      Método *
                    </label>
                    <div class="relative">
                      <select
                        [(ngModel)]="managementForm.metodoPago"
                        [class]="'w-full p-1.5 pr-6 border rounded font-semibold text-gray-700 appearance-none cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-200 text-[10px] ' +
                          (errors().metodoPago ? 'border-red-500 bg-red-50' : 'border-green-400 bg-white')"
                      >
                        <option value="">-- Método --</option>
                        @for (metodo of paymentMethods(); track metodo.id) {
                          <option [value]="metodo.id">{{ metodo.icono }} [{{ metodo.codigo }}] {{ metodo.label }}</option>
                        }
                      </select>
                      <lucide-angular name="chevron-down" [size]="12" class="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></lucide-angular>
                    </div>
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      Monto (S/) *
                    </label>
                    <input
                      type="number"
                      [(ngModel)]="managementForm.montoPago"
                      placeholder="0.00"
                      step="0.01"
                      [class]="'w-full p-1.5 border rounded font-bold text-xs text-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-200 ' +
                        (errors().montoPago ? 'border-red-500 bg-red-50' : 'border-green-400 bg-white')"
                    />
                  </div>
                </div>

                <div class="bg-white rounded p-1.5 border border-green-300">
                  <div class="flex items-center justify-between text-[10px]">
                    <span class="text-gray-700 font-semibold">Deuda:</span>
                    <span class="font-bold text-red-600">S/ {{ customerData().deuda.saldo_total.toFixed(2) }}</span>
                  </div>
                  @if (managementForm.montoPago) {
                    <div class="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-green-200">
                      <span class="text-gray-700 font-semibold">Restante:</span>
                      <span class="font-bold text-orange-600">S/ {{ calculateRemaining() }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Sección de Cronograma - NUEVA -->
            @if (showScheduleSection()) {
              <div class="bg-purple-50 border border-purple-400 rounded-lg shadow-md p-2">
                <h3 class="font-bold text-gray-800 mb-2 flex items-center gap-2 text-[11px]">
                  <div class="p-1 bg-purple-500 rounded">
                    <lucide-angular name="calendar" [size]="12" class="text-white"></lucide-angular>
                  </div>
                  Cronograma de Pago
                </h3>

                <div class="grid grid-cols-3 gap-2 mb-2">
                  <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1">Tipo</label>
                    <select
                      [(ngModel)]="scheduleForm.tipoCronograma"
                      class="w-full p-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-200"
                    >
                      <option value="">Seleccionar...</option>
                      @for (tipo of scheduleTypes(); track tipo.id) {
                        <option [value]="tipo.id">{{ tipo.label }}</option>
                      }
                    </select>
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1">Cuotas</label>
                    <input
                      type="number"
                      [(ngModel)]="scheduleForm.numeroCuotas"
                      min="2"
                      max="48"
                      placeholder="# cuotas"
                      class="w-full p-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-200"
                    />
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1">Periodicidad</label>
                    <select
                      [(ngModel)]="scheduleForm.periodicidad"
                      class="w-full p-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-200"
                    >
                      <option value="">Seleccionar...</option>
                      @for (p of periodicities(); track p.id) {
                        <option [value]="p.id">{{ p.label }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1">Monto por Cuota</label>
                    <input
                      type="number"
                      [(ngModel)]="scheduleForm.montoCuota"
                      min="50"
                      step="0.01"
                      placeholder="S/ 0.00"
                      class="w-full p-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-200"
                    />
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1">Primera Cuota</label>
                    <input
                      type="date"
                      [(ngModel)]="scheduleForm.fechaPrimeraCuota"
                      class="w-full p-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-200"
                    />
                  </div>
                </div>

                <div class="flex gap-2 mb-2">
                  <button
                    (click)="generateSchedule()"
                    class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-3 rounded text-xs font-bold transition-all duration-300"
                  >
                    Generar Cronograma
                  </button>
                  <button
                    (click)="toggleScheduleDetail()"
                    class="px-3 bg-purple-100 hover:bg-purple-200 text-purple-700 py-1.5 rounded text-xs font-bold transition-all duration-300"
                  >
                    {{ showScheduleDetail() ? 'Ocultar' : 'Ver' }} Detalle
                  </button>
                </div>
              </div>
            }

            <!-- Sección de Campos Dinámicos - NUEVA -->
            @if (isLoadingDynamicFields()) {
              <div class="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-lg shadow-md p-3">
                <div class="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <lucide-angular name="clock" [size]="16" class="animate-spin"></lucide-angular>
                  <span class="text-xs">Cargando campos adicionales...</span>
                </div>
              </div>
            }
            
            @if (!isLoadingDynamicFields() && isLeafClassification() && dynamicFields().length === 0) {
              <div class="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-3">
                <div class="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                  <lucide-angular name="alert-circle" [size]="16"></lucide-angular>
                  <span class="text-xs">Esta clasificación no tiene campos adicionales configurados</span>
                </div>
              </div>
            }

            <!-- Componente de Campos Dinámicos -->
            @if (!isLoadingDynamicFields() && isLeafClassification() && dynamicFieldsSchema()) {
              <app-dynamic-field-renderer
                [schema]="dynamicFieldsSchema()"
                (dataChange)="onDynamicFieldsChange($event)"
              />
            }

            <!-- Observaciones - COMPACTAS -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-2 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300">
              <label class="block font-bold text-gray-800 dark:text-white mb-1 text-[11px] flex items-center gap-1">
                <lucide-angular name="message-square" [size]="12" class="text-purple-600 dark:text-purple-200"></lucide-angular>
                Observaciones
              </label>
              <textarea
                [(ngModel)]="managementForm.observaciones"
                placeholder="Detalles de la conversación..."
                rows="2"
                class="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded focus:border-purple-500 dark:focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 resize-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs placeholder:text-gray-400 dark:placeholder:text-gray-500"
              ></textarea>
            </div>

            <!-- Notas Privadas - COMPACTAS -->
            <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-900/50 rounded-lg p-2">
              <label class="block font-bold text-gray-800 dark:text-white mb-1 text-[11px] flex items-center gap-1">
                <div class="p-0.5 bg-amber-400 dark:bg-amber-600 rounded">
                  <lucide-angular name="message-square" [size]="10" class="text-white"></lucide-angular>
                </div>
                Notas Privadas
              </label>
              <textarea
                [(ngModel)]="managementForm.notasPrivadas"
                placeholder="Notas internas..."
                rows="2"
                class="w-full p-1.5 border border-amber-300 dark:border-amber-800 rounded focus:border-amber-500 dark:focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs placeholder:text-gray-400 dark:placeholder:text-gray-500"
              ></textarea>
            </div>

            <!-- Botones de Acción - COMPACTOS -->
            <div class="flex gap-2 pt-2">
              <button
                (click)="saveManagement()"
                [disabled]="saving() || !isFormValid()"
                class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white dark:text-white disabled:text-gray-200 py-2 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                @if (saving()) {
                  <lucide-angular name="clock" [size]="14" class="animate-spin"></lucide-angular>
                  Guardando...
                } @else {
                  <lucide-angular name="save" [size]="14"></lucide-angular>
                  Guardar Gestión
                }
              </button>
              <button
                class="px-6 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white dark:text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <lucide-angular name="x" [size]="14"></lucide-angular>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class CollectionManagementPage implements OnInit, OnDestroy {
  protected callActive = signal(false);
  protected callDuration = signal(0);
  protected saving = signal(false);
  protected showScheduleDetail = signal(false);
  protected errors = signal<ValidationErrors>({});
  protected showSuccess = signal(false);
  protected animateEntry = signal(true);
  protected activeTab = signal('cliente');
  protected historialGestiones = signal<Array<{
    fecha: string;
    asesor: string;
    resultado: string;
    gestion: string;
    observacion: string;
    duracion: string;
  }>>([]);

  selectedTenantId?: number;
  selectedPortfolioId?: number;
  tenants: Tenant[] = [];
  portfolios: Portfolio[] = [];

  campaign = computed(() => this.systemConfigService.getCampaign());
  contactClassifications = computed(() => this.systemConfigService.getContactClassifications());
  managementClassifications = computed(() => this.systemConfigService.getManagementClassifications());

  managementClassificationsHierarchical = computed(() => {
    const all: any[] = this.managementClassifications() as any[];
    const byId = new Map<string, any>();
    const children = new Map<string, any[]>();

    all.forEach((item: any) => {
      const itemId = String(item.id);
      byId.set(itemId, item);
      children.set(itemId, []);
    });

    all.forEach((item: any) => {
      if (item.parentId) {
        const parentIdStr = String(item.parentId);
        const childList = children.get(parentIdStr);
        if (childList) {
          childList.push(item);
        }
      }
    });

    const flatten = (items: any[], level: number = 0): any[] => {
      const flattened: any[] = [];
      items.forEach((item: any) => {
        flattened.push({
          ...item,
          indentLevel: level,
          displayLabel: '  '.repeat(level) + (level > 0 ? '└─ ' : '') + `[${item.codigo}] ${item.label}`
        });
        const itemIdStr = String(item.id);
        const itemChildren = children.get(itemIdStr) || [];
        if (itemChildren.length > 0) {
          flattened.push(...flatten(itemChildren, level + 1));
        }
      });
      return flattened;
    };

    const roots = all.filter((item: any) => !item.parentId);
    return flatten(roots, 0);
  });

  paymentMethods = computed(() => this.systemConfigService.getPaymentMethods());
  scheduleTypes = computed(() => this.systemConfigService.getScheduleConfig().tipos_cronograma);
  periodicities = computed(() => this.systemConfigService.getScheduleConfig().periodicidades);

  tabs = [
    { id: 'cliente', label: 'Cliente', icon: 'user' },
    { id: 'cuenta', label: 'Cuenta', icon: 'wallet' },
    { id: 'historial', label: 'Historial', icon: 'history' }
  ];

  managementForm: ManagementForm = {
    resultadoContacto: '',
    tipoGestion: '',
    clasificacionNivel1: '',
    clasificacionNivel2: '',
    clasificacionNivel3: '',
    motivoNoPago: '',
    metodoPago: '',
    montoPago: '',
    fechaCompromiso: '',
    horaCompromiso: '',
    ultimos4Tarjeta: '',
    bancoSeleccionado: '',
    observaciones: '',
    notasPrivadas: ''
  };

  selectedClassifications = signal<string[]>([]);
  dynamicFields = signal<any[]>([]);
  dynamicFieldValues = signal<any>({});
  isLoadingDynamicFields = signal(false);
  isLeafClassification = signal(false);
  dynamicFieldsSchema = signal<MetadataSchema | null>(null);

  // Computed para determinar si el formulario es válido y completo para habilitar el botón guardar
  isFormValid = computed(() => {
    // 1. Verificar clasificación seleccionada
    if (this.usesHierarchicalClassifications()) {
      // Sistema jerárquico: verificar que se haya llegado a una clasificación "hoja"
      const selected = this.selectedClassifications();
      if (selected.length === 0 || !selected[selected.length - 1]) {
        return false; // No hay clasificación seleccionada o la última está vacía
      }

      // Verificar que sea una clasificación hoja (sin hijos)
      if (!this.isLeafClassification()) {
        return false; // Aún hay más niveles por seleccionar
      }
    } else {
      // Sistema simple: verificar resultado de contacto
      if (!this.managementForm.resultadoContacto) {
        return false;
      }
    }

    // 2. Verificar campos de pago si son requeridos
    if (this.showPaymentSection()) {
      if (!this.managementForm.metodoPago || !this.managementForm.montoPago) {
        return false;
      }
    }

    // 3. Verificar campos dinámicos requeridos
    const schema = this.dynamicFieldsSchema();
    if (schema && schema.fields && schema.fields.length > 0) {
      const dynamicValues = this.dynamicFieldValues();

      for (const field of schema.fields) {
        if (field.required) {
          const value = dynamicValues[field.id];

          // Campo vacío
          if (value === undefined || value === null || value === '') {
            return false;
          }

          // Tabla sin filas
          if (field.type === 'table' && (!Array.isArray(value) || value.length === 0)) {
            return false;
          }
        }
      }
    }

    // Todo válido
    return true;
  });

  hierarchyLevels = computed(() => {
    const all = this.managementClassifications();
    const selected = this.selectedClassifications();
    const levels: any[][] = [];

    console.log('🔍 hierarchyLevels - Total classifications:', all.length);
    console.log('🔍 hierarchyLevels - Selected classifications:', selected);

    const roots = all.filter(c => c.hierarchyLevel === 1 || !c.parentId);
    console.log('🔍 hierarchyLevels - Roots found:', roots.length, roots.map(r => `${r.codigo} (id:${r.id})`));

    if (roots.length > 0) {
      levels.push(roots);
    }

    for (let i = 0; i < selected.length; i++) {
      const parentId = selected[i];
      console.log(`🔍 hierarchyLevels - Level ${i + 1}: Looking for children of parentId=${parentId}`);

      if (parentId) {
        const children = all.filter(c => c.parentId && Number(c.parentId) === Number(parentId));
        console.log(`🔍 hierarchyLevels - Found ${children.length} children:`, children.map(c => `${c.codigo} (id:${c.id})`));

        if (children.length > 0) {
          levels.push(children);
        } else {
          break;
        }
      }
    }

    console.log('🔍 hierarchyLevels - Total levels:', levels.length);
    return levels;
  });

  scheduleForm = {
    numeroCuotas: '',
    montoCuota: '',
    periodicidad: '',
    fechaPrimeraCuota: '',
    tipoCronograma: '',
    montoInicial: ''
  };

  customerData = signal<CustomerData>({
    id_cliente: 'CLI-2025-0087453',
    nombre_completo: 'GARCÍA RODRIGUEZ, CARMEN ROSA',
    tipo_documento: 'DNI',
    numero_documento: '45621378',
    fecha_nacimiento: '15/03/1985',
    edad: 40,
    contacto: {
      telefono_principal: '+51 987 654 321',
      telefono_alternativo: '+51 945 123 456',
      telefono_trabajo: '+51 01 4567890',
      email: 'carmen.garcia@email.com',
      direccion: 'Av. Los Álamos 458, Dpto 302, San Borja, Lima',
    },
    cuenta: {
      numero_cuenta: '****5678',
      tipo_producto: 'Préstamo Personal',
      fecha_desembolso: '15/01/2024',
      monto_original: 15000.00,
      plazo_meses: 24,
      tasa_interes: 18.5,
    },
    deuda: {
      saldo_capital: 8750.50,
      intereses_vencidos: 456.78,
      mora_acumulada: 234.50,
      gastos_cobranza: 120.00,
      saldo_total: 9561.78,
      dias_mora: 45,
      fecha_ultimo_pago: '15/10/2024',
      monto_ultimo_pago: 458.33,
    }
  });

  private callTimer?: number;
  private managementId?: string;
  private callStartTime?: string;

  constructor(
    private systemConfigService: SystemConfigService,
    private managementService: ManagementService,
    public themeService: ThemeService,
    private classificationService: ClassificationService,
    private apiSystemConfigService: ApiSystemConfigService
  ) {}

  ngOnInit() {
    this.loadTenants();
    this.loadManagementHistory();
  }

  loadTenants() {
    this.classificationService.getAllTenants().subscribe({
      next: (data) => {
        this.tenants = data;
        if (data.length > 0) {
          this.selectedTenantId = data[1].id;
          this.onTenantChange();
        }
      },
      error: (error) => {
        console.error('❌ Error loading tenants:', error);
      }
    });
  }

  onTenantChange() {
    this.selectedPortfolioId = undefined;
    this.portfolios = [];

    if (this.selectedTenantId) {
      this.loadPortfolios();
      this.reloadClassifications();
    }
  }

  loadPortfolios() {
    if (!this.selectedTenantId) return;

    this.classificationService.getPortfoliosByTenant(this.selectedTenantId).subscribe({
      next: (data) => {
        this.portfolios = data;
      },
      error: (error) => {
        console.error('❌ Error loading portfolios:', error);
      }
    });
  }

  onPortfolioChange() {
    this.reloadClassifications();
  }

  reloadClassifications() {
    if (!this.selectedTenantId) return;

    this.apiSystemConfigService.setTenantAndPortfolio(
      this.selectedTenantId,
      this.selectedPortfolioId
    );
  }

  private loadManagementHistory() {
    const customerId = this.customerData().id_cliente;

    this.managementService.getManagementsByCustomer(customerId).subscribe({
      next: (managements) => {
        console.log('✅ Historial de gestiones cargado:', managements);
        if (managements.length > 0) {
          console.log('📋 Primer management:', managements[0]);
          console.log('📋 Clasificación:', managements[0].classificationDescription);
          console.log('📋 Tipificación:', managements[0].typificationDescription);
        }

        const historial = managements.map(m => {
          console.log(`Mapeando gestión: clasificación=${m.classificationCode}, tipificación=${m.typificationCode}`);
          return {
            fecha: this.formatDateTime(m.managementDate),
            asesor: m.advisorId,
            resultado: m.classificationDescription || m.classificationCode || '-',
            gestion: m.typificationDescription || m.typificationCode || '-',
            observacion: m.observations || 'Sin observaciones',
            duracion: m.callDetail ? this.calculateCallDuration(m.callDetail) : '00:00:00'
          };
        });

        this.historialGestiones.set(historial);
      },
      error: (error) => {
        console.error('❌ Error al cargar historial de gestiones:', error);
      }
    });
  }

  private formatDateTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  private calculateCallDuration(callDetail: any): string {
    if (!callDetail.durationSeconds) {
      return '00:00:00';
    }
    return this.formatTime(callDetail.durationSeconds);
  }

  ngOnDestroy() {
    if (this.callTimer) {
      clearInterval(this.callTimer);
    }
  }

  toggleCall() {
    if (this.callActive()) {
      this.endCall();
    } else {
      this.startCall();
    }
  }

  startCall() {
    this.callActive.set(true);
    this.callDuration.set(0);
    this.callStartTime = new Date().toISOString();

    this.callTimer = window.setInterval(() => {
      this.callDuration.update(duration => duration + 1);
    }, 1000);
  }

  endCall() {
    if (!this.managementForm.resultadoContacto) {
      alert('⚠️ Debe seleccionar un resultado de contacto antes de finalizar');
      return;
    }
    this.callActive.set(false);
    if (this.callTimer) {
      clearInterval(this.callTimer);
    }
  }

  formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  onContactResultChange() {
    this.managementForm.tipoGestion = '';
    this.managementForm.motivoNoPago = '';
  }

  onManagementTypeChange() {
  }

  showManagementType(): boolean {
    return this.managementForm.resultadoContacto === 'CPC' || this.managementForm.resultadoContacto === 'CTT';
  }

  usesHierarchicalClassifications(): boolean {
    const levels = this.hierarchyLevels();
    return levels.length > 0 && levels[0].length > 0;
  }

  getClassificationsForLevel(levelIndex: number): any[] {
    const levels = this.hierarchyLevels();
    return levels[levelIndex] || [];
  }

  onClassificationLevelChange(levelIndex: number, value: string) {
    console.log(`🔄 Level ${levelIndex + 1} changed to:`, value);

    const newSelections = [...this.selectedClassifications()];
    newSelections[levelIndex] = value;

    this.selectedClassifications.set(newSelections.slice(0, levelIndex + 1));

    console.log(`✅ Updated selectedClassifications:`, this.selectedClassifications());

    if (levelIndex === 0) {
      this.managementForm.clasificacionNivel1 = value;
      this.managementForm.clasificacionNivel2 = '';
      this.managementForm.clasificacionNivel3 = '';
    } else if (levelIndex === 1) {
      this.managementForm.clasificacionNivel2 = value;
      this.managementForm.clasificacionNivel3 = '';
    } else if (levelIndex === 2) {
      this.managementForm.clasificacionNivel3 = value;
    }

    if (value) {
      this.managementForm.tipoGestion = value;
      this.loadDynamicFields(Number(value));
    } else {
      const lastValid = this.selectedClassifications().filter(v => v).pop();
      this.managementForm.tipoGestion = lastValid || '';
      this.dynamicFields.set([]);
      this.dynamicFieldValues.set({});
      this.isLeafClassification.set(false);
    }
  }

  private loadDynamicFields(classificationId: number) {
    console.log(`📋 Cargando campos dinámicos para clasificación ${classificationId}`);

    this.isLoadingDynamicFields.set(true);
    this.apiSystemConfigService.getClassificationFields(classificationId).subscribe({
      next: (response) => {
        console.log(`✅ Respuesta de campos dinámicos:`, response);

        this.isLeafClassification.set(response.isLeaf);
        this.dynamicFields.set(response.fields || []);

        // Convertir campos del backend al formato MetadataSchema
        // Los tipos ya vienen en lowercase desde el backend, no necesitan conversión
        const fieldConfigs: FieldConfig[] = (response.fields || []).map((field: any) => ({
          id: field.fieldCode,
          label: field.fieldName,
          type: field.fieldType.toLowerCase(), // Asegurar lowercase por compatibilidad
          required: field.isRequired || false,
          placeholder: field.description || '',
          helpText: field.description,
          displayOrder: field.displayOrder || 0,
          // Para campos tipo tabla, incluir columnas
          columns: field.fieldType.toLowerCase() === 'table' && field.columns ? field.columns.map((col: any) => ({
            id: col.id || col.fieldCode,
            label: col.label || col.fieldName,
            type: (col.type || col.fieldType).toLowerCase(), // Asegurar lowercase
            required: col.required || col.isRequired || false
          })) : undefined,
          allowAddRow: field.fieldType.toLowerCase() === 'table',
          allowDeleteRow: field.fieldType.toLowerCase() === 'table',
          minRows: field.minRows || 0,
          maxRows: field.maxRows
        }));

        const schema: MetadataSchema = {
          fields: fieldConfigs
        };

        this.dynamicFieldsSchema.set(schema);
        this.isLoadingDynamicFields.set(false);

        console.log(`📝 Schema convertido con ${fieldConfigs.length} campos`);
      },
      error: (error) => {
        console.error(`❌ Error cargando campos dinámicos:`, error);
        this.isLoadingDynamicFields.set(false);
        this.isLeafClassification.set(false);
        this.dynamicFields.set([]);
        this.dynamicFieldsSchema.set(null);
      }
    });
  }

  /**
   * Maneja cambios en los campos dinámicos del componente
   */
  onDynamicFieldsChange(data: any) {
    this.dynamicFieldValues.set(data);
    console.log('📝 Valores de campos dinámicos actualizados:', data);
  }

  getDynamicLevelLabel(levelIndex: number): string {
    if (levelIndex === 0) {
      const level1 = this.hierarchyLevels()[0] || [];
      if (level1.length === 0) return 'Nivel 1';
      const codes = level1.map((c: any) => c.codigo);
      if (codes.includes('RP') || codes.includes('CSA')) {
        return 'Tipo de Resultado';
      }
      return 'Categoría Principal';
    }

    const parentIndex = levelIndex - 1;
    const parentId = this.selectedClassifications()[parentIndex];

    if (!parentId) return `Nivel ${levelIndex + 1}`;

    const parent = this.managementClassifications().find(c => c.id === Number(parentId));
    if (!parent) return `Nivel ${levelIndex + 1}`;

    if (levelIndex === 1) {
      const labelMap: Record<string, string> = {
        'RP': 'Intención de Pago',
        'CSA': 'Motivo de No Atención',
        'SC': 'Razón de No Contacto',
        'GA': 'Tipo de Gestión'
      };
      return labelMap[parent.codigo] || `Detalle de ${parent.label}`;
    }

    return `Detalle de ${parent.label}`;
  }

  shouldShowLevel(levelIndex: number): boolean {
    if (levelIndex === 0) {
      return this.usesHierarchicalClassifications();
    }

    const previousLevel = levelIndex - 1;
    const previousValue = this.selectedClassifications()[previousLevel];

    if (!previousValue) return false;

    const options = this.getClassificationsForLevel(levelIndex);
    return options.length > 0;
  }

  showPaymentSection(): boolean {
    const selectedManagement = this.systemConfigService.getManagementClassificationById(this.managementForm.tipoGestion);
    return selectedManagement?.requiere_pago || false;
  }

  showScheduleSection(): boolean {
    const selectedManagement = this.systemConfigService.getManagementClassificationById(this.managementForm.tipoGestion);
    return selectedManagement?.requiere_cronograma || false;
  }

  generateSchedule() {
    console.log('Generando cronograma...', this.scheduleForm);
  }

  toggleScheduleDetail() {
    this.showScheduleDetail.update(show => !show);
  }

  saveManagement() {
    if (!this.validateForm()) {
      return;
    }

    this.saving.set(true);

    let contactClassification: any;
    let managementClassification: any;

    if (this.usesHierarchicalClassifications()) {
      // Sistema jerárquico: obtener clasificación (categoría) y tipificación (hoja)
      const selected = this.selectedClassifications();
      const allClassifications = this.managementClassifications();

      // TIPIFICACIÓN: La hoja/leaf (última selección)
      const lastSelectedId = selected[selected.length - 1];
      managementClassification = allClassifications.find((c: any) => c.id.toString() === lastSelectedId);
      console.log('🏷️  Tipificación (hoja/leaf):', managementClassification);

      // CLASIFICACIÓN: La categoría padre de la tipificación
      // Si la tipificación tiene parent_id, buscar ese parent como clasificación
      // Si es root (sin parent), usar el mismo como clasificación
      if (managementClassification?.parentId) {
        const parentId = managementClassification.parentId;
        contactClassification = allClassifications.find((c: any) => c.id.toString() === parentId.toString());
        console.log('📁 Clasificación (categoría):', contactClassification);
      } else {
        // Si no tiene padre, usar la misma como clasificación
        contactClassification = managementClassification;
        console.log('📁 Clasificación (sin padre, usar misma):', contactClassification);
      }
    } else {
      // Sistema simple
      contactClassification = this.contactClassifications().find((c: any) => c.id === this.managementForm.resultadoContacto);
      managementClassification = this.managementClassifications().find((g: any) => g.id === this.managementForm.tipoGestion);
    }

    const request: CreateManagementRequest = {
      customerId: this.customerData().id_cliente,
      advisorId: 'ADV-001',
      campaignId: this.campaign().id,

      // Clasificación: Categoría/grupo al que pertenece la tipificación
      classificationCode: contactClassification?.codigo || '',
      classificationDescription: contactClassification?.label || '',

      // Tipificación: Código específico/hoja (último nivel en jerarquía)
      typificationCode: managementClassification?.codigo || '',
      typificationDescription: managementClassification?.label || '',
      typificationRequiresPayment: managementClassification?.requiere_pago,
      typificationRequiresSchedule: (managementClassification as ManagementClassification)?.requiere_cronograma,

      observations: this.managementForm.observaciones,
      dynamicFields: this.dynamicFieldValues() // Incluir campos dinámicos
    };

    console.log('📤 Enviando request con campos dinámicos:', request);

    this.managementService.createManagement(request).subscribe({
      next: (response) => {
        console.log('✅ Gestión creada exitosamente:', response);
        this.managementId = response.managementId;

        if (this.callStartTime && this.callActive()) {
          this.registerCallToBackend(response.managementId);
        }

        if (this.showPaymentSection() && this.managementForm.montoPago) {
          this.registerPaymentToBackend(response.managementId);
        }

        this.onSaveSuccess(contactClassification?.label || '', managementClassification?.label || '-');
      },
      error: (error) => {
        console.error('❌ Error al guardar gestión:', error);
        this.saving.set(false);
        alert('⚠️ Error al guardar la gestión. Por favor intente nuevamente.');
      }
    });
  }

  private registerCallToBackend(managementId: string) {
    if (!this.callStartTime) return;

    const startCallRequest: StartCallRequest = {
      phoneNumber: this.customerData().contacto.telefono_principal,
      startTime: this.callStartTime
    };

    this.managementService.startCall(managementId, startCallRequest).subscribe({
      next: (response) => {
        console.log('✅ Llamada registrada:', response);

        if (!this.callActive()) {
          const endCallRequest: EndCallRequest = {
            endTime: new Date().toISOString()
          };
          this.managementService.endCall(managementId, endCallRequest).subscribe({
            next: () => console.log('✅ Llamada finalizada'),
            error: (err) => console.error('❌ Error al finalizar llamada:', err)
          });
        }
      },
      error: (error) => {
        console.error('❌ Error al registrar llamada:', error);
      }
    });
  }

  private registerPaymentToBackend(managementId: string) {
    if (!this.managementForm.montoPago || !this.managementForm.metodoPago) return;

    const paymentRequest: RegisterPaymentRequest = {
      amount: parseFloat(this.managementForm.montoPago),
      scheduledDate: new Date().toISOString().split('T')[0],
      paymentMethodType: this.managementForm.metodoPago,
      paymentMethodDetails: this.managementForm.ultimos4Tarjeta || undefined,
      voucherNumber: undefined,
      bankName: this.managementForm.bancoSeleccionado || undefined
    };

    this.managementService.registerPayment(managementId, paymentRequest).subscribe({
      next: (response) => {
        console.log('✅ Pago registrado:', response);
      },
      error: (error) => {
        console.error('❌ Error al registrar pago:', error);
      }
    });
  }

  private onSaveSuccess(resultadoCodigo: string, gestionCodigo: string) {
    this.saving.set(false);
    this.showSuccess.set(true);

    this.loadManagementHistory();

    this.managementForm = {
      resultadoContacto: '',
      tipoGestion: '',
      clasificacionNivel1: '',
      clasificacionNivel2: '',
      clasificacionNivel3: '',
      motivoNoPago: '',
      metodoPago: '',
      montoPago: '',
      fechaCompromiso: '',
      horaCompromiso: '',
      ultimos4Tarjeta: '',
      bancoSeleccionado: '',
      observaciones: '',
      notasPrivadas: ''
    };

    this.callDuration.set(0);
    this.callStartTime = undefined;

    this.activeTab.set('historial');

    setTimeout(() => this.showSuccess.set(false), 3000);
  }

  private validateForm(): boolean {
    const newErrors: ValidationErrors = {};

    // 1. Validar clasificación (sistema jerárquico o simple)
    if (this.usesHierarchicalClassifications()) {
      // Sistema jerárquico: verificar que se haya seleccionado clasificación hoja
      const selected = this.selectedClassifications();
      if (selected.length === 0 || !selected[selected.length - 1]) {
        newErrors['classification'] = 'Debe seleccionar una clasificación';
      } else if (!this.isLeafClassification()) {
        newErrors['classification'] = 'Debe completar todos los niveles de clasificación';
      }
    } else {
      // Sistema simple: verificar resultado de contacto
      if (!this.managementForm.resultadoContacto) {
        newErrors['resultadoContacto'] = 'Requerido';
      }

      if (this.showManagementType() && !this.managementForm.tipoGestion) {
        newErrors['tipoGestion'] = 'Requerido';
      }
    }

    // 2. Validar campos de pago si son requeridos
    if (this.showPaymentSection()) {
      if (!this.managementForm.metodoPago) {
        newErrors['metodoPago'] = 'Requerido';
      }
      if (!this.managementForm.montoPago) {
        newErrors['montoPago'] = 'Requerido';
      }
    }

    // 3. Validar campos dinámicos requeridos
    const schema = this.dynamicFieldsSchema();
    if (schema && schema.fields && schema.fields.length > 0) {
      const dynamicValues = this.dynamicFieldValues();

      for (const field of schema.fields) {
        if (field.required) {
          const value = dynamicValues[field.id];

          // Verificar si el campo está vacío
          if (value === undefined || value === null || value === '') {
            newErrors[`dynamic_${field.id}`] = `${field.label} es requerido`;
          }

          // Para campos tipo tabla, verificar que tenga al menos una fila
          if (field.type === 'table' && (!Array.isArray(value) || value.length === 0)) {
            newErrors[`dynamic_${field.id}`] = `${field.label} debe tener al menos una fila`;
          }
        }
      }
    }

    this.errors.set(newErrors);

    if (Object.keys(newErrors).length > 0) {
      console.warn('⚠️ Errores de validación:', newErrors);
      alert('Por favor complete todos los campos requeridos');
      return false;
    }

    return true;
  }

  calculateRemaining(): string {
    if (!this.managementForm.montoPago) return '0.00';
    const monto = parseFloat(this.managementForm.montoPago);
    const restante = this.customerData().deuda.saldo_total - monto;
    return restante.toFixed(2);
  }

  toggleDarkMode() {
    console.log('🎨 Toggle dark mode clicked!');
    this.themeService.toggleTheme();
  }

  getContactClassificationLabel(id: string): string {
    const classification = this.contactClassifications().find(c => c.id === id);
    if (!classification) return id;

    const label = classification.label || classification.codigo;
    return `[${classification.codigo}] ${label}`;
  }

  getManagementClassificationLabel(id: string): string {
    const classification = this.managementClassifications().find(g => g.id === id);
    if (!classification) return id;

    const label = classification.label || classification.codigo;
    return `[${classification.codigo}] ${label}`;
  }

  getTableRows(fieldCode: string): any[] {
    const data = this.dynamicFieldValues()[fieldCode];
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  }

  addTableRow(fieldCode: string, columns: any[]) {
    if (!Array.isArray(columns)) {
      console.error('❌ addTableRow: columns no es un array válido', columns);
      return;
    }

    const currentValues = { ...this.dynamicFieldValues() };
    
    if (!Array.isArray(currentValues[fieldCode])) {
      currentValues[fieldCode] = [];
    }

    const newRow = this.createEmptyTableRow(columns);
    (currentValues[fieldCode] as any[]).push(newRow);

    this.dynamicFieldValues.set(currentValues);
  }

  removeTableRow(fieldCode: string, rowIndex: number) {
    const currentValues = { ...this.dynamicFieldValues() };
    
    if (Array.isArray(currentValues[fieldCode])) {
      (currentValues[fieldCode] as any[]).splice(rowIndex, 1);
      this.dynamicFieldValues.set(currentValues);
    }
  }

  private createEmptyTableRow(columns: any[]): any {
    const row: any = {};
    
    columns.forEach(column => {
      if (column.type === 'auto-number') {
        row[column.id] = null;
      } else if (column.type === 'number' || column.type === 'currency') {
        row[column.id] = column.defaultValue || 0;
      } else if (column.type === 'date') {
        row[column.id] = column.defaultValue || '';
      } else {
        row[column.id] = column.defaultValue || '';
      }
    });
    
    return row;
  }
}