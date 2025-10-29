import { Component, OnInit, OnDestroy, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  LucideAngularModule,
} from 'lucide-angular';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

import { SystemConfigService } from '../services/system-config.service';
import { ManagementService, CreateManagementRequest, StartCallRequest, EndCallRequest, RegisterPaymentRequest } from '../services/management.service';
import { PaymentScheduleService } from '../services/payment-schedule.service';
import { ThemeService } from '../../shared/services/theme.service';
import { ManagementClassification } from '../models/system-config.model';
import { CustomerData } from '../models/customer.model';
import { ManagementForm, ValidationErrors } from '../models/management.model';
import { Tenant } from '../../maintenance/models/tenant.model';
import { Portfolio } from '../../maintenance/models/portfolio.model';
import { TypificationService } from '../../maintenance/services/typification.service';
import { ApiSystemConfigService } from '../services/api-system-config.service';
import { DynamicFieldRendererComponent } from '../components/dynamic-field-renderer/dynamic-field-renderer.component';
import { MetadataSchema, FieldConfig } from '../../maintenance/models/field-config.model';
import { CustomerOutputConfigService } from '../../maintenance/services/customer-output-config.service';
import { PaymentScheduleViewComponent } from '../components/payment-schedule-view/payment-schedule-view.component';

@Component({
  selector: 'app-collection-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    DynamicFieldRendererComponent,
    PaymentScheduleViewComponent
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
                  <!-- Grid dinámico de campos configurables -->
                  <div class="grid grid-cols-4 gap-2">
                    @for (field of customerOutputFields(); track field.id) {
                      <div
                        class="rounded-lg border p-2 transition-all"
                        [class.col-span-1]="!field.size || field.size === 'small'"
                        [class.col-span-2]="field.size === 'medium'"
                        [class.col-span-3]="field.size === 'large'"
                        [class.col-span-4]="field.size === 'full'"
                        [class.bg-cyan-50]="field.highlight && !themeService.isDarkMode()"
                        [class.dark:bg-cyan-950/30]="field.highlight && themeService.isDarkMode()"
                        [class.border-cyan-300]="field.highlight && !themeService.isDarkMode()"
                        [class.dark:border-cyan-900/50]="field.highlight && themeService.isDarkMode()"
                        [class.bg-slate-50]="!field.highlight && !themeService.isDarkMode()"
                        [class.dark:bg-slate-900/50]="!field.highlight && themeService.isDarkMode()"
                        [class.border-slate-200]="!field.highlight && !themeService.isDarkMode()"
                        [class.dark:border-slate-700]="!field.highlight && themeService.isDarkMode()"
                      >
                        <div class="flex items-start justify-between gap-2">
                          <div class="flex-1 min-w-0">
                            <div
                              class="text-[9px] font-bold uppercase tracking-wide mb-0.5 flex items-center gap-1"
                              [class.text-cyan-800]="field.highlight && !themeService.isDarkMode()"
                              [class.dark:text-cyan-100]="field.highlight && themeService.isDarkMode()"
                              [class.text-slate-600]="!field.highlight && !themeService.isDarkMode()"
                              [class.dark:text-slate-400]="!field.highlight && themeService.isDarkMode()">
                              @if (field.highlight) {
                                <lucide-angular name="star" [size]="8"></lucide-angular>
                              }
                              {{ field.label }}
                            </div>
                            <div
                              class="text-[11px] font-bold break-words"
                              [class.text-cyan-900]="field.highlight && !themeService.isDarkMode()"
                              [class.dark:text-cyan-50]="field.highlight && themeService.isDarkMode()"
                              [class.text-slate-900]="!field.highlight && !themeService.isDarkMode()"
                              [class.dark:text-white]="!field.highlight && themeService.isDarkMode()">
                              {{ formatFieldValue(getFieldValue(field.field), field.format) }}
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  </div>

                  @if (customerOutputFields().length === 0) {
                    <div class="text-center py-4 text-slate-500 dark:text-slate-400 text-xs">
                      <lucide-angular name="alert-circle" [size]="16" class="mx-auto mb-2"></lucide-angular>
                      <p>No hay campos configurados para mostrar</p>
                      <p class="text-[10px] mt-1">Configure los campos en Mantenimiento > Salidas de Cliente</p>
                    </div>
                  }
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
                    <div class="text-center py-8 space-y-3">
                      <lucide-angular name="inbox" [size]="48" class="mx-auto text-gray-300 dark:text-gray-600"></lucide-angular>
                      <div>
                        <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">Sin gestiones previas</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          No hay gestiones registradas para este cliente
                        </p>
                        <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          Cliente: {{ customerData().id_cliente }}
                        </p>
                      </div>
                      <button
                        (click)="loadManagementHistory()"
                        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors flex items-center gap-2 mx-auto">
                        <lucide-angular name="refresh-cw" [size]="14"></lucide-angular>
                        Recargar Historial
                      </button>
                    </div>
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

                          <!-- Cronograma de pagos -->
                          @if (gestion.schedule) {
                            <div class="mt-2 p-2 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded">
                              <div class="flex items-center justify-between gap-1 mb-1">
                                <div class="flex items-center gap-1">
                                  <lucide-angular name="calendar" [size]="10" class="text-purple-600 dark:text-purple-400"></lucide-angular>
                                  <span class="text-[9px] font-bold text-purple-900 dark:text-purple-200 uppercase">Cronograma</span>
                                </div>
                                <button
                                  type="button"
                                  (click)="openScheduleDetail(gestion.managementId)"
                                  class="text-[8px] px-1.5 py-0.5 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors font-bold">
                                  Ver Detalle
                                </button>
                              </div>
                              <div class="text-[9px] text-purple-800 dark:text-purple-300">
                                <div class="flex justify-between">
                                  <span>Cuotas: {{ gestion.schedule.numberOfInstallments }}</span>
                                  <span class="font-bold">S/ {{ gestion.schedule.totalAmount | number:'1.2-2' }}</span>
                                </div>
                                <div class="text-[8px] text-purple-600 dark:text-purple-400 mt-0.5">
                                  {{ gestion.schedule.installments.length }} cuota(s) registrada(s)
                                </div>
                              </div>
                            </div>
                          }
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
                #dynamicFieldRendererComponent
                [schema]="dynamicFieldsSchema()"
                [externalUpdates]="externalFieldUpdates()"
                [selectedClassification]="selectedClassification()"
                (dataChange)="onDynamicFieldsChange($event)"
              />
            }

            <!-- Schedule Helper - Payment Schedule Information -->
            @if (isLoadingSchedules()) {
              <div class="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-lg shadow-md p-3 animate-pulse">
                <div class="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
                  <lucide-angular name="clock" [size]="16" class="animate-spin"></lucide-angular>
                  <span class="text-xs font-semibold">Cargando cronogramas pendientes...</span>
                </div>
              </div>
            }

            @if (!isLoadingSchedules() && showScheduleHelper() && activeSchedules().length > 0) {
              <div class="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-2 border-purple-300 dark:border-purple-700 rounded-lg shadow-lg p-3 space-y-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="p-1.5 bg-purple-500 dark:bg-purple-600 rounded">
                      <lucide-angular name="calendar" [size]="14" class="text-white"></lucide-angular>
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-purple-900 dark:text-purple-100">Cronograma Activo Detectado</h4>
                      <p class="text-[9px] text-purple-600 dark:text-purple-300">Cliente tiene {{ activeSchedules().length }} cronograma(s) pendiente(s)</p>
                    </div>
                  </div>
                </div>

                @for (schedule of activeSchedules(); track schedule.id) {
                  <div class="bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 p-2 space-y-2">
                    <!-- Schedule Summary -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="text-xs font-bold text-purple-900 dark:text-purple-100">
                          {{ schedule.scheduleType || 'CRONOGRAMA' }}
                        </div>
                        <div class="text-[9px] px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-semibold">
                          ACTIVO
                        </div>
                      </div>
                      <div class="text-xs font-bold text-purple-900 dark:text-purple-100">
                        S/ {{ schedule.totalAmount | number:'1.2-2' }}
                      </div>
                    </div>

                    <!-- Pending Installments -->
                    <div class="space-y-1">
                      <div class="text-[9px] font-bold text-gray-600 dark:text-gray-300 uppercase">Cuotas Pendientes</div>
                      @for (installment of getPendingInstallments(schedule); track installment.id; let idx = $index) {
                        @if (idx < 3) {
                          <div class="flex items-center justify-between text-[10px] bg-gray-50 dark:bg-gray-900 p-1.5 rounded">
                            <div class="flex items-center gap-2">
                              <span class="font-semibold text-gray-700 dark:text-gray-300">Cuota #{{ installment.installmentNumber }}</span>
                              <span class="text-gray-500 dark:text-gray-400">Vence: {{ installment.dueDate }}</span>
                            </div>
                            <span class="font-bold text-purple-700 dark:text-purple-300">S/ {{ installment.amount | number:'1.2-2' }}</span>
                          </div>
                        }
                      }
                      @if (getPendingInstallments(schedule).length > 3) {
                        <div class="text-[9px] text-center text-gray-500 dark:text-gray-400 italic">
                          + {{ getPendingInstallments(schedule).length - 3 }} cuotas más
                        </div>
                      }
                    </div>

                    <!-- Quick Actions -->
                    <div class="flex gap-2 pt-1">
                      <!-- Botón Usar Próxima Cuota - Mostrar si allowsInstallmentSelection es true -->
                      @if (selectedClassification()?.allowsInstallmentSelection === true) {
                        <button
                          type="button"
                          (click)="applyNextInstallmentPayment()"
                          class="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white text-[10px] font-bold rounded transition-colors flex items-center justify-center gap-1">
                          <lucide-angular name="chevron-down" [size]="12"></lucide-angular>
                          Usar Próxima Cuota
                        </button>
                      }

                      <!-- Botón Pagar Todo - Mostrar si suggestsFullAmount es true -->
                      @if (selectedClassification()?.suggestsFullAmount === true) {
                        <button
                          type="button"
                          (click)="applyFullSchedulePayment()"
                          class="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-[10px] font-bold rounded transition-colors flex items-center justify-center gap-1">
                          <lucide-angular name="wallet" [size]="12"></lucide-angular>
                          Pagar Todo (S/ {{ calculatePendingAmount(schedule) | number:'1.2-2' }})
                        </button>
                      }
                    </div>

                    <!-- Info Note -->
                    <div class="text-[9px] text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20 p-1.5 rounded flex items-start gap-1">
                      <lucide-angular name="info" [size]="10" class="mt-0.5 flex-shrink-0"></lucide-angular>
                      <span>El pago se aplicará automáticamente a las cuotas pendientes en orden de vencimiento</span>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Observaciones - COMPACTAS -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-2 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300">
              <label class="font-bold text-gray-800 dark:text-white mb-1 text-[11px] flex items-center gap-1">
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
                [title]="'Guardando: ' + saving() + ' | Válido: ' + isFormValid()"
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

      <!-- Modal de Cronograma Detallado -->
      @if (showScheduleDetail() && scheduleManagementId()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideInUp">
            <!-- Header del modal -->
            <div class="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 text-white px-6 py-4 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <lucide-angular name="calendar" [size]="24"></lucide-angular>
                <div>
                  <h2 class="text-lg font-bold">Cronograma de Pagos</h2>
                  <p class="text-sm opacity-90">Gestión {{ scheduleManagementId() }}</p>
                </div>
              </div>
              <button
                type="button"
                (click)="closeScheduleDetail()"
                class="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <lucide-angular name="x" [size]="20"></lucide-angular>
              </button>
            </div>

            <!-- Contenido del modal -->
            <div class="flex-1 overflow-y-auto p-6">
              <app-payment-schedule-view [managementId]="scheduleManagementId()!" />
            </div>

            <!-- Footer del modal -->
            <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                type="button"
                (click)="closeScheduleDetail()"
                class="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300
                       hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      }
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
  protected scheduleManagementId = signal<string | null>(null);
  protected showOutputSelector = false; // Para el dropdown de campos del cliente
  protected errors = signal<ValidationErrors>({});
  protected showSuccess = signal(false);
  protected animateEntry = signal(true);
  protected activeTab = signal('cliente');
  protected historialGestiones = signal<Array<{
    managementId: string;
    fecha: string;
    asesor: string;
    resultado: string;
    gestion: string;
    observacion: string;
    duracion: string;
    hasSchedule: boolean;
    schedule: any;
  }>>([]);

  selectedTenantId?: number;
  selectedPortfolioId?: number;
  tenants: Tenant[] = [];
  portfolios: Portfolio[] = [];

  // Configuración de outputs del cliente
  customerOutputFields = signal<any[]>([]);

  campaign = computed(() => this.systemConfigService.getCampaign());
  contactClassifications = computed(() => this.systemConfigService.getContactClassifications());
  managementClassifications = computed(() => this.apiSystemConfigService.getManagementClassificationsForUI());

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
  externalFieldUpdates = signal<any>({}); // Para comunicar actualizaciones externas al componente hijo

  // ViewChild para acceder al componente de campos dinámicos
  @ViewChild('dynamicFieldRendererComponent') dynamicFieldRenderer?: DynamicFieldRendererComponent;

  // Payment schedule signals
  activeSchedules = signal<any[]>([]);
  isLoadingSchedules = signal(false);
  showScheduleHelper = signal(false);

  // Computed para obtener la clasificación seleccionada actual con sus propiedades de tipo
  selectedClassification = computed<ManagementClassification | null>(() => {
    const selectedIds = this.selectedClassifications();
    if (selectedIds.length === 0) return null;

    const lastSelectedId = selectedIds[selectedIds.length - 1];
    if (!lastSelectedId) return null;

    const allTypifications = this.managementClassifications();
    const found = allTypifications.find((c: any) => String(c.id) === String(lastSelectedId));

    // DEBUG: Log para verificar las propiedades
    if (found) {
      console.log('[DEBUG] Selected typification:', found);
      console.log('[DEBUG] suggestsFullAmount:', found.suggestsFullAmount);
      console.log('[DEBUG] allowsInstallmentSelection:', found.allowsInstallmentSelection);
      console.log('[DEBUG] requiresManualAmount:', found.requiresManualAmount);
    }

    return found as ManagementClassification || null;
  });

  // Computed para determinar si el formulario es válido y completo para habilitar el botón guardar
  isFormValid = computed(() => {
    // 1. Verificar clasificación seleccionada
    if (this.usesHierarchicalClassifications()) {
      // Sistema jerárquico: verificar que se haya seleccionado al menos una clasificación
      const selected = this.selectedClassifications();

      if (selected.length === 0 || !selected[selected.length - 1]) {
        return false;
      }

      // TEMPORAL: No verificar isLeaf mientras los campos dinámicos estén deshabilitados
      // Verificar que no haya más niveles disponibles (no debe haber hijos)
      const lastSelectedId = selected[selected.length - 1];
      const all: any[] = this.managementClassifications() as any[];
      const hasChildren = all.some((c: any) => c.parentId && Number(c.parentId) === Number(lastSelectedId));

      // Solo es válido si no hay hijos disponibles O si ya llegamos al último nivel
      if (hasChildren) {
        console.log('[isFormValid] Aún hay niveles por seleccionar');
        return false;
      }
    } else {
      // Sistema simple: verificar resultado de contacto
      if (!this.managementForm.resultadoContacto) {
        return false;
      }
    }

    // 2. Verificar campos de pago si son requeridos
    // NOTA: Los campos de pago ahora son campos dinámicos, validados en el paso 3
    // Ya no se usan managementForm.metodoPago ni managementForm.montoPago

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
          if (field.type === 'table') {
            if (!Array.isArray(value) || value.length === 0) {
              return false;
            }
          }
        }
      }
    }

    return true;
  });

  hierarchyLevels = computed(() => {
    const all: any[] = this.managementClassifications() as any[];
    const selected = this.selectedClassifications();
    const levels: any[][] = [];

    console.log('[hierarchyLevels] Total classifications:', all.length);
    console.log('[hierarchyLevels] Selected:', selected);

    const roots = all.filter(c => c.hierarchyLevel === 1 || !c.parentId);
    console.log('[hierarchyLevels] Nivel 1 (roots):', roots.length, roots.map((r: any) => `${r.codigo} (ID:${r.id})`));

    if (roots.length > 0) {
      levels.push(roots);
    }

    for (let i = 0; i < selected.length; i++) {
      const parentId = selected[i];
      console.log(`[hierarchyLevels] Buscando hijos del nivel ${i+1}, parentId:`, parentId);

      if (parentId) {
        const children = all.filter((c: any) => c.parentId && Number(c.parentId) === Number(parentId));
        console.log(`[hierarchyLevels] Encontrados ${children.length} hijos:`, children.map((c: any) => `${c.codigo} (ID:${c.id}, parent:${c.parentId})`));

        if (children.length > 0) {
          levels.push(children);
        } else {
          console.log(`[hierarchyLevels] No se encontraron hijos, deteniendo búsqueda`);
          break;
        }
      }
    }

    console.log('[hierarchyLevels] Total niveles construidos:', levels.length);
    return levels;
  });

  scheduleForm = {
    numeroCuotas: '',
    montoCuota: '',
    periodicidad: '',
    fechaPrimeraCuota: '',
    tipoCronograma: '',
    montoInicial: '',
    montoNegociado: '', // Para tipo Financiera
    cuotas: [] as Array<{numero: number, monto: string, fechaVencimiento: string}>
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
    private paymentScheduleService: PaymentScheduleService,
    public themeService: ThemeService,
    private classificationService: TypificationService,
    private apiSystemConfigService: ApiSystemConfigService,
    private customerOutputConfigService: CustomerOutputConfigService,
    private router: Router,
    private http: HttpClient
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
        console.error('Error loading tenants:', error);
      }
    });
  }

  onTenantChange() {
    this.selectedPortfolioId = undefined;
    this.portfolios = [];

    if (this.selectedTenantId) {
      this.loadPortfolios();
      this.reloadTypifications();
      this.loadCustomerOutputConfig();
      this.loadFirstCustomer(); // Cargar el primer cliente del tenant
    }
  }

  loadPortfolios() {
    if (!this.selectedTenantId) return;

    this.classificationService.getPortfoliosByTenant(this.selectedTenantId).subscribe({
      next: (data) => {
        this.portfolios = data;
      },
      error: (error) => {
        console.error('Error loading portfolios:', error);
      }
    });
  }

  onPortfolioChange() {
    this.reloadTypifications();
    this.loadCustomerOutputConfig();
  }

  reloadTypifications() {
    if (!this.selectedTenantId) return;

    this.apiSystemConfigService.setTenantAndPortfolio(
      this.selectedTenantId,
      this.selectedPortfolioId
    );
  }

  /**
   * Carga la configuración de outputs del cliente desde el backend
   *
   * LÓGICA:
   * 1. Llama a GET /api/v1/customer-outputs/config?tenantId=X&portfolioId=Y
   * 2. Backend SIEMPRE retorna 200 OK (nunca 404)
   * 3. Si id === null → No hay configuración guardada → Usar campos por defecto
   * 4. Si id !== null → Hay configuración guardada → Usar esos campos (incluso si fieldsConfig="[]")
   *
   * DIFERENCIA IMPORTANTE:
   * - id=null, fieldsConfig="[]": No existe config en BD → Mostrar campos DEFAULT
   * - id=123, fieldsConfig="[]": Existe config vacía → Admin configuró NO mostrar nada
   */
  loadCustomerOutputConfig() {
    if (!this.selectedTenantId) return;

    // TEMPORAL: El endpoint customer-outputs/config no existe aún
    // Usar directamente los campos por defecto
    console.log('[TEMPORAL] loadCustomerOutputConfig - endpoint no existe, usando campos por defecto');
    this.setDefaultOutputFields();
    return;

    /* COMENTADO TEMPORALMENTE - endpoint no existe
    this.customerOutputConfigService.getConfiguration(this.selectedTenantId, this.selectedPortfolioId)
      .pipe(
        catchError((error) => {
          console.error('Error cargando configuración:', error);
          this.setDefaultOutputFields();
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (!response) return; // Si hubo error, ya se manejó en catchError

          // Verificar si existe configuración en BD
          if (response.id === null) {
            // No hay configuración guardada → usar campos por defecto
            this.setDefaultOutputFields();
            return;
          }

          // Hay configuración guardada → usar esos campos (incluso si está vacío)
          try {
            const fields = JSON.parse(response.fieldsConfig);
            // Filtrar solo campos visibles y ordenar
            const visibleFields = fields
              .filter((f: any) => f.isVisible)
              .sort((a: any, b: any) => a.displayOrder - b.displayOrder);

            this.customerOutputFields.set(visibleFields);
          } catch (error) {
            console.error('Error parseando fieldsConfig:', error);
            this.setDefaultOutputFields();
          }
        }
      });
    */
  }

  /**
   * Carga el primer cliente disponible de la base de datos
   */
  loadFirstCustomer() {
    if (!this.selectedTenantId) return;

    // Llamar al endpoint del CustomerController para obtener clientes
    // GET /api/v1/customers?page=0&size=1
    this.http.get<any[]>(`${environment.apiUrl}/customers`, {
      params: {
        page: '0',
        size: '1'
      }
    }).pipe(
      catchError((error) => {
        console.error('Error cargando primer cliente:', error);
        return of([]);
      })
    ).subscribe({
      next: (customers) => {
        // El backend devuelve un array directo, no un objeto paginado
        if (customers && customers.length > 0) {
          const customer = customers[0];
          console.log('🔍 [FRONTEND] Primer cliente cargado:', customer);
          console.log('🔍 [FRONTEND] accountNumber en el customer:', customer.accountNumber);
          console.log('🔍 [FRONTEND] Campos disponibles:', Object.keys(customer));

          // Buscar teléfono principal - puede ser telefono, phone, o PHONE
          const phoneContact = customer.contactMethods?.find((c: any) =>
            c.contactType?.toLowerCase() === 'telefono' ||
            c.contactType?.toLowerCase() === 'phone'
          );

          // Buscar email
          const emailContact = customer.contactMethods?.find((c: any) =>
            c.contactType?.toLowerCase() === 'email'
          );

          const accountNumberValue = customer.accountNumber || '';
          console.log('🔍 [FRONTEND] Valor final de numero_cuenta:', accountNumberValue);

          // Mapear los datos del cliente al formato del signal
          this.customerData.set({
            id: customer.id,  // ID numérico del cliente (PK)
            id_cliente: customer.customerId || customer.identificationCode || customer.id?.toString(),
            nombre_completo: customer.fullName || '',
            tipo_documento: customer.documentType || 'DNI',
            numero_documento: customer.documentNumber || customer.document || '',
            fecha_nacimiento: customer.birthDate || '',
            edad: customer.age || 0,
            contacto: {
              telefono_principal: phoneContact?.value || '',
              telefono_alternativo: '',
              telefono_trabajo: '',
              email: emailContact?.value || '',
              direccion: customer.address || ''
            },
            cuenta: {
              numero_cuenta: accountNumberValue,
              tipo_producto: customer.subPortfolioName || '',
              fecha_desembolso: '',
              monto_original: 0,
              plazo_meses: 0,
              tasa_interes: 0
            },
            deuda: {
              saldo_capital: 0,
              intereses_vencidos: 0,
              mora_acumulada: 0,
              gastos_cobranza: 0,
              saldo_total: 0,
              dias_mora: 0,
              fecha_ultimo_pago: '',
              monto_ultimo_pago: 0
            }
          });
        } else {
          console.log('No se encontraron clientes en la base de datos');
        }
      }
    });
  }

  /**
   * Establece campos por defecto cuando no hay configuración guardada
   */
  private setDefaultOutputFields() {
    this.customerOutputFields.set([
      { id: 'numero_documento', label: 'DNI/Documento', field: 'numero_documento', category: 'personal', format: 'text', highlight: true, size: 'medium' },
      { id: 'nombre_completo', label: 'Nombre Completo', field: 'nombre_completo', category: 'personal', format: 'text', highlight: false, size: 'full' },
      { id: 'telefono_principal', label: 'Celular', field: 'contacto.telefono_principal', category: 'contact', format: 'text', highlight: false, size: 'medium' },
      { id: 'email', label: 'Email', field: 'contacto.email', category: 'contact', format: 'text', highlight: false, size: 'medium' },
      { id: 'direccion', label: 'Dirección', field: 'contacto.direccion', category: 'contact', format: 'text', highlight: false, size: 'full' },
      { id: 'edad', label: 'Edad', field: 'edad', category: 'personal', format: 'number', highlight: false, size: 'small' },
      { id: 'saldo_total', label: 'Deuda Total', field: 'deuda.saldo_total', category: 'debt', format: 'currency', highlight: true, size: 'small' },
      { id: 'dias_mora', label: 'Días de Mora', field: 'deuda.dias_mora', category: 'debt', format: 'number', highlight: true, size: 'small' },
      { id: 'numero_cuenta', label: 'Nro. Cuenta', field: 'cuenta.numero_cuenta', category: 'account', format: 'text', highlight: false, size: 'medium' },
      { id: 'tipo_producto', label: 'Producto', field: 'cuenta.tipo_producto', category: 'account', format: 'text', highlight: false, size: 'medium' }
    ]);
  }

  loadManagementHistory() {
    const customerId = this.customerData().id_cliente;
    console.log('[HISTORIAL] Cargando historial para cliente:', customerId);

    this.managementService.getManagementsByCustomer(customerId).subscribe({
      next: (managements) => {
        console.log('[HISTORIAL] Gestiones recibidas del backend:', managements);
        console.log('[HISTORIAL] Total de gestiones:', managements.length);

        // Mapear gestiones y cargar cronogramas
        const historial = managements.map(m => {
          const historyItem = {
            managementId: m.managementId,
            fecha: this.formatDateTime(m.managementDate),
            asesor: m.advisorId,
            resultado: 'Gestión realizada', // TEMPORAL: Los datos ahora están en tipificaciones_gestion
            gestion: m.typificationDescription || '-',
            observacion: m.observations || 'Sin observaciones',
            duracion: m.callDetail ? this.calculateCallDuration(m.callDetail) : '00:00:00',
            hasSchedule: m.typificationRequiresSchedule || false,
            schedule: null as any
          };

          // Cargar cronograma si existe
          if (historyItem.hasSchedule) {
            this.paymentScheduleService.getPaymentScheduleByManagementId(m.managementId).subscribe({
              next: (schedule) => {
                if (schedule) {
                  historyItem.schedule = schedule;
                }
              },
              error: () => {
                // Silenciar error si no hay cronograma
              }
            });
          }

          return historyItem;
        });

        this.historialGestiones.set(historial);
        console.log('[HISTORIAL] Historial establecido en signal:', this.historialGestiones());
      },
      error: (error) => {
        console.error('[HISTORIAL] Error al cargar historial de gestiones:', error);
        console.error('[HISTORIAL] Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
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

  protected openScheduleDetail(managementId: string) {
    this.scheduleManagementId.set(managementId);
    this.showScheduleDetail.set(true);
  }

  protected closeScheduleDetail() {
    this.showScheduleDetail.set(false);
    this.scheduleManagementId.set(null);
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

  getTypificationsForLevel(levelIndex: number): any[] {
    const levels = this.hierarchyLevels();
    return levels[levelIndex] || [];
  }

  onClassificationLevelChange(levelIndex: number, value: string) {
    const newSelections = [...this.selectedClassifications()];
    newSelections[levelIndex] = value;

    this.selectedClassifications.set(newSelections.slice(0, levelIndex + 1));

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
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > 0) {
        this.loadDynamicFields(numValue);
      } else {
        this.dynamicFields.set([]);
        this.dynamicFieldValues.set({});
        this.isLeafClassification.set(false);
      }
    } else {
      const lastValid = this.selectedClassifications().filter(v => v).pop();
      this.managementForm.tipoGestion = lastValid || '';
      this.dynamicFields.set([]);
      this.dynamicFieldValues.set({});
      this.isLeafClassification.set(false);
    }
  }

  private loadDynamicFields(typificationId: number) {
    // TEMPORAL: Endpoint no implementado aún, deshabilitar para evitar errores 500
    console.log('[TEMPORAL] loadDynamicFields deshabilitado - endpoint /tenants/.../typifications/.../fields no existe');
    this.isLoadingDynamicFields.set(false);
    this.isLeafClassification.set(false);
    this.dynamicFields.set([]);
    this.dynamicFieldsSchema.set(null);
    return;

    /* CÓDIGO ORIGINAL - Rehabilitar cuando se implemente el endpoint
    this.isLoadingDynamicFields.set(true);
    this.apiSystemConfigService.getClassificationFields(typificationId).subscribe({
      next: (response) => {
        this.isLeafClassification.set(response.isLeaf);
        this.dynamicFields.set(response.fields || []);

        // Convertir campos del backend al formato MetadataSchema
        // Los tipos ya vienen en lowercase desde el backend, no necesitan conversión
        const fieldConfigs: FieldConfig[] = (response.fields || []).map((field: any, index: number) => {
          return {
          id: field.fieldCode,
          label: field.fieldName,
          type: field.fieldType.toLowerCase(), // Asegurar lowercase por compatibilidad
          required: field.isRequired || false,
          placeholder: field.description || '',
          helpText: field.description,
          displayOrder: field.displayOrder || 0,
          // Para campos select, mapear options
          options: field.options ? field.options.map((opt: any) => {
            if (typeof opt === 'string') {
              return { value: opt, label: opt };
            }
            return { value: opt.value || opt, label: opt.label || opt };
          }) : undefined,
          min: field.validationRules?.min,
          max: field.validationRules?.max,
          minLength: field.validationRules?.minLength,
          maxLength: field.validationRules?.maxLength,
          // Para campos tipo tabla, incluir columnas
          columns: field.fieldType.toLowerCase() === 'table' && field.columns ? field.columns.map((col: any) => ({
            id: col.id || col.fieldCode,
            label: col.label || col.fieldName,
            type: (col.type || col.fieldType).toLowerCase(), // Asegurar lowercase
            required: col.required || col.isRequired || false,
            // Para columnas tipo select, mapear options
            options: col.options ? col.options.map((opt: any) => {
              if (typeof opt === 'string') {
                return { value: opt, label: opt };
              }
              return { value: opt.value || opt, label: opt.label || opt };
            }) : undefined
          })) : undefined,
          allowAddRow: field.fieldType.toLowerCase() === 'table',
          allowDeleteRow: field.fieldType.toLowerCase() === 'table',
          minRows: field.minRows || 0,
          maxRows: field.maxRows,
          // For table fields, copy linkedToField property if present
          ...(field.linkedToField && { linkedToField: field.linkedToField })
          };
        });

        const schema: MetadataSchema = {
          fields: fieldConfigs
        };

        this.dynamicFieldsSchema.set(schema);
        this.isLoadingDynamicFields.set(false);

        // Check if this is a payment typification and load schedules
        this.checkAndLoadPaymentSchedules();
      },
      error: (error) => {
        console.error('Error cargando campos dinámicos:', error);
        this.isLoadingDynamicFields.set(false);
        this.isLeafClassification.set(false);
        this.dynamicFields.set([]);
        this.dynamicFieldsSchema.set(null);
      }
    });
    */
  }

  /**
   * Checks if the current selected typification requires payment
   * and loads active schedules if needed
   */
  private checkAndLoadPaymentSchedules() {
    // Get the currently selected typification
    const selected = this.selectedClassifications();
    if (selected.length === 0) {
      this.showScheduleHelper.set(false);
      return;
    }

    const lastSelectedId = selected[selected.length - 1];
    const allTypifications = this.managementClassifications();
    const currentClass = allTypifications.find((c: any) => c.id.toString() === lastSelectedId);

    // Check if this typification requires payment (codes: PC, PT, PP, PPT)
    if (currentClass && currentClass.requiere_pago) {
      console.log('[SCHEDULE] Payment typification detected:', currentClass.codigo);
      console.log('[DEBUG-SCHEDULE] Full typification object:', currentClass);
      console.log('[DEBUG-SCHEDULE] suggestsFullAmount:', currentClass.suggestsFullAmount);
      console.log('[DEBUG-SCHEDULE] allowsInstallmentSelection:', currentClass.allowsInstallmentSelection);
      console.log('[DEBUG-SCHEDULE] requiresManualAmount:', currentClass.requiresManualAmount);
      this.loadActiveSchedules();
    } else {
      this.showScheduleHelper.set(false);
      this.activeSchedules.set([]);
    }
  }

  /**
   * Loads active payment schedules for the current customer
   */
  private loadActiveSchedules() {
    const customerId = this.customerData().id_cliente;
    console.log('[SCHEDULE] Loading active schedules for customer:', customerId);

    this.isLoadingSchedules.set(true);
    this.managementService.getActiveSchedulesByCustomer(customerId).subscribe({
      next: (schedules) => {
        console.log('[SCHEDULE] Active schedules loaded:', schedules);
        this.activeSchedules.set(schedules);
        this.showScheduleHelper.set(schedules.length > 0);
        this.isLoadingSchedules.set(false);

        // Auto-suggest payment amount from next pending installment
        if (schedules.length > 0) {
          this.suggestPaymentAmount(schedules[0]);
        }
      },
      error: (error) => {
        console.error('[SCHEDULE] Error loading schedules:', error);
        this.isLoadingSchedules.set(false);
        this.showScheduleHelper.set(false);
      }
    });
  }

  /**
   * Suggests payment amount based on next pending installment
   */
  private suggestPaymentAmount(schedule: any) {
    if (!schedule.installments || schedule.installments.length === 0) return;

    // Find first pending installment
    const pendingInstallment = schedule.installments
      .filter((inst: any) => inst.status.status === 'PENDING') // Corregido: el backend usa 'PENDING' en inglés
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

    if (pendingInstallment) {
      console.log('[SCHEDULE] Suggested payment amount:', pendingInstallment.amount);

      // Pre-fill the payment amount in managementForm if not already set
      if (!this.managementForm.montoPago) {
        this.managementForm.montoPago = pendingInstallment.amount.toFixed(2);
      }

      // Also pre-fill the dynamic fields for compatibility
      const currentValues = { ...this.dynamicFieldValues() };
      if (!currentValues['monto_pagado']) {
        currentValues['monto_pagado'] = pendingInstallment.amount;
        this.dynamicFieldValues.set(currentValues);
      }
    }
  }

  /**
   * Applies full payment from schedule
   */
  // Force recompile
  applyFullSchedulePayment() {
    const schedules = this.activeSchedules();
    if (schedules.length === 0) return;

    const schedule = schedules[0];
    const pendingAmount = this.calculatePendingAmount(schedule);

    console.log('[BUTTON] Pagar Todo clicked. Amount:', pendingAmount);

    // Buscar el campo de monto en el schema
    const schema = this.dynamicFieldsSchema();
    const montoField = schema?.fields.find(f =>
      f.type === 'currency' || f.id.toLowerCase().includes('monto')
    );

    if (montoField) {
      console.log('[BUTTON] Found monto field:', montoField.id);

      // Actualizar el signal de actualizaciones externas
      const updates: any = {};
      updates[montoField.id] = pendingAmount;

      // Si hay campo saldo_pendiente, calcularlo (será 0 porque se paga todo)
      const hasSaldoField = schema?.fields.some(f => f.id === 'saldo_pendiente');
      if (hasSaldoField) {
        updates.saldo_pendiente = 0; // Al pagar todo, el saldo pendiente es 0
        console.log('[BUTTON] Saldo pendiente será 0 (pago total)');

        // Actualizar también dynamicFieldValues para que la validación pase
        const currentValues = { ...this.dynamicFieldValues() };
        currentValues[montoField.id] = pendingAmount;
        currentValues.saldo_pendiente = 0;
        this.dynamicFieldValues.set(currentValues);
      }

      this.externalFieldUpdates.set(updates);
      console.log('[BUTTON] Updated externalFieldUpdates:', updates);

      // Limpiar después de un breve delay para permitir futuras actualizaciones
      setTimeout(() => this.externalFieldUpdates.set({}), 100);
    } else {
      console.warn('[BUTTON] No se encontró campo de monto en el schema');
    }
  }

  /**
   * Applies next installment payment
   */
  applyNextInstallmentPayment() {
    console.log('[BUTTON-PP] Usar Próxima Cuota clicked!');
    const schedules = this.activeSchedules();
    console.log('[BUTTON-PP] Active schedules:', schedules);

    if (schedules.length === 0) {
      console.warn('[BUTTON-PP] No schedules found');
      return;
    }

    const schedule = schedules[0];
    console.log('[BUTTON-PP] Using schedule:', schedule);
    console.log('[BUTTON-PP] Schedule installments:', schedule.installments);

    const pendingInstallments = schedule.installments
      .filter((inst: any) => {
        console.log('[BUTTON-PP] Checking installment:', inst, 'Status:', inst.status?.status);
        return inst.status.status === 'PENDING'; // Corregido: el backend usa 'PENDING' en inglés
      });

    console.log('[BUTTON-PP] Pending installments:', pendingInstallments);

    const pendingInstallment = pendingInstallments
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

    console.log('[BUTTON-PP] Next pending installment:', pendingInstallment);

    if (pendingInstallment) {
      console.log('[BUTTON-PP] Usar Próxima Cuota - Amount:', pendingInstallment.amount);

      // Buscar el campo de monto en el schema
      const schema = this.dynamicFieldsSchema();
      const montoField = schema?.fields.find(f =>
        f.type === 'currency' || f.id.toLowerCase().includes('monto')
      );

      if (montoField) {
        console.log('[BUTTON-PP] Found monto field:', montoField.id);

        // Actualizar el signal de actualizaciones externas
        const updates: any = {};
        updates[montoField.id] = pendingInstallment.amount;

        // Si hay campo saldo_pendiente, calcularlo
        const hasSaldoField = schema?.fields.some(f => f.id === 'saldo_pendiente');
        if (hasSaldoField) {
          const totalPendiente = this.calculatePendingAmount(schedule);
          const saldoPendiente = Math.max(0, totalPendiente - pendingInstallment.amount);
          updates.saldo_pendiente = saldoPendiente;
          console.log('[BUTTON-PP] Saldo pendiente calculado:', saldoPendiente, '= Total', totalPendiente, '- Monto', pendingInstallment.amount);

          // Actualizar también dynamicFieldValues para que la validación pase
          const currentValues = { ...this.dynamicFieldValues() };
          currentValues[montoField.id] = pendingInstallment.amount;
          currentValues.saldo_pendiente = saldoPendiente;
          this.dynamicFieldValues.set(currentValues);
        }

        this.externalFieldUpdates.set(updates);
        console.log('[BUTTON-PP] Updated externalFieldUpdates:', updates);

        // Limpiar después de un breve delay para permitir futuras actualizaciones
        setTimeout(() => this.externalFieldUpdates.set({}), 100);
      } else {
        console.warn('[BUTTON-PP] No se encontró campo de monto en el schema');
      }
    } else {
      console.warn('[BUTTON-PP] No pending installment found');
    }
  }

  /**
   * Calculates total pending amount from schedule
   */
  calculatePendingAmount(schedule: any): number {
    console.log('[CALC] Schedule:', schedule);
    console.log('[CALC] Installments:', schedule.installments);
    const pendingInstallments = schedule.installments
      .filter((inst: any) => {
        console.log('[CALC] Installment status:', inst.status, 'Status value:', inst.status?.status);
        return inst.status.status === 'PENDING'; // Corregido: el backend usa 'PENDING' en inglés
      });
    console.log('[CALC] Pending installments:', pendingInstallments);
    const total = pendingInstallments.reduce((sum: number, inst: any) => sum + inst.amount, 0);
    console.log('[CALC] Total pending amount:', total);
    return total;
  }

  /**
   * Gets pending installments from schedule
   */
  protected getPendingInstallments(schedule: any): any[] {
    if (!schedule.installments) return [];
    return schedule.installments
      .filter((inst: any) => inst.status.status === 'PENDING') // Corregido: el backend usa 'PENDING' en inglés
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  /**
   * Maneja cambios en los campos dinámicos del componente
   * Calcula saldo_pendiente en tiempo real para mostrar a la asesora
   * También se calcula en backend al guardar para histórico
   */
  onDynamicFieldsChange(data: any) {
    this.dynamicFieldValues.set(data);

    // Calcular saldo pendiente en tiempo real cuando cambia monto_pagado
    if (data.monto_pagado !== undefined && data.monto_pagado !== null) {
      this.calculateAndUpdatePendingBalance(data.monto_pagado);
    }
  }

  /**
   * Calcula y actualiza el saldo pendiente en tiempo real
   * para que la asesora pueda informar al cliente
   * Fórmula: Saldo Pendiente = (Suma de cuotas pendientes) - (Monto Pagado)
   */
  private calculateAndUpdatePendingBalance(montoPagado: number) {
    const schedules = this.activeSchedules();

    if (schedules.length === 0) {
      console.log('[SALDO] No hay cronogramas activos');
      return;
    }

    const schedule = schedules[0];
    const totalPendiente = this.calculatePendingAmount(schedule);
    const saldoPendiente = Math.max(0, totalPendiente - (montoPagado || 0));

    console.log('[SALDO] Total pendiente:', totalPendiente);
    console.log('[SALDO] Monto pagado:', montoPagado);
    console.log('[SALDO] Saldo pendiente calculado:', saldoPendiente);

    // Actualizar el campo saldo_pendiente para que la asesora lo vea
    const schema = this.dynamicFieldsSchema();
    const hasSaldoField = schema?.fields.some(f => f.id === 'saldo_pendiente');

    if (hasSaldoField) {
      console.log('[SALDO] Actualizando campo saldo_pendiente con:', saldoPendiente);

      // Actualizar tanto en el componente hijo (para mostrar) como en dynamicFieldValues (para validación)
      const updates: any = { saldo_pendiente: saldoPendiente };
      this.externalFieldUpdates.set(updates);

      // También actualizar directamente dynamicFieldValues para que la validación pase
      const currentValues = { ...this.dynamicFieldValues() };
      currentValues.saldo_pendiente = saldoPendiente;
      this.dynamicFieldValues.set(currentValues);

      setTimeout(() => this.externalFieldUpdates.set({}), 100);
    }
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

    const parent = this.managementClassifications().find(c => c.id == parentId);
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

    const options = this.getTypificationsForLevel(levelIndex);
    return options.length > 0;
  }

  showPaymentSection(): boolean {
    const selectedManagement = this.managementClassifications().find(c => c.id === this.managementForm.tipoGestion);
    return selectedManagement?.requiere_pago || false;
  }

  showScheduleSection(): boolean {
    const selectedManagement = this.managementClassifications().find(c => c.id === this.managementForm.tipoGestion);
    return selectedManagement?.requiere_cronograma || false;
  }

  onInstallmentCountChange() {
    const numInstallments = parseInt(this.scheduleForm.numeroCuotas);

    if (isNaN(numInstallments) || numInstallments < 1) {
      // If invalid number, clear installments
      this.scheduleForm.cuotas = [];
      return;
    }

    const currentLength = this.scheduleForm.cuotas.length;

    if (numInstallments > currentLength) {
      // Add missing installments
      for (let i = currentLength + 1; i <= numInstallments; i++) {
        this.scheduleForm.cuotas.push({
          numero: i,
          monto: '',
          fechaVencimiento: ''
        });
      }
    } else if (numInstallments < currentLength) {
      // Remove extra installments
      this.scheduleForm.cuotas = this.scheduleForm.cuotas.slice(0, numInstallments);
      // Renumber
      this.scheduleForm.cuotas.forEach((cuota, idx) => {
        cuota.numero = idx + 1;
      });
    }
  }

  generateSchedule() {
    const numCuotas = parseInt(this.scheduleForm.numeroCuotas);
    if (isNaN(numCuotas) || numCuotas < 1) {
      alert('Por favor ingrese un número válido de cuotas');
      return;
    }

    // Generar array de cuotas vacías
    this.scheduleForm.cuotas = [];
    for (let i = 1; i <= numCuotas; i++) {
      this.scheduleForm.cuotas.push({
        numero: i,
        monto: '',
        fechaVencimiento: ''
      });
    }
  }

  addInstallmentRow() {
    const nextNumber = this.scheduleForm.cuotas.length + 1;
    this.scheduleForm.cuotas.push({
      numero: nextNumber,
      monto: '',
      fechaVencimiento: ''
    });
    // Actualizar el número de cuotas
    this.scheduleForm.numeroCuotas = nextNumber.toString();
  }

  removeInstallmentRow(index: number) {
    if (this.scheduleForm.cuotas.length > 1) {
      this.scheduleForm.cuotas.splice(index, 1);
      // Renumerar las cuotas
      this.scheduleForm.cuotas.forEach((cuota, idx) => {
        cuota.numero = idx + 1;
      });
      // Actualizar el número de cuotas
      this.scheduleForm.numeroCuotas = this.scheduleForm.cuotas.length.toString();
    }
  }

  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadMontoNegociadoFromOutput(fieldId: string) {
    // Buscar el campo en customerOutputFields
    const field = this.customerOutputFields().find((f: any) => f.id === fieldId);
    if (!field) return;

    // Obtener el valor del campo usando la ruta del field
    const fieldPath = field.field.split('.');
    let value: any = this.customerData();

    for (const key of fieldPath) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        value = null;
        break;
      }
    }

    if (value) {
      this.scheduleForm.montoNegociado = value.toString();
    }
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
      const allTypifications = this.managementClassifications();

      // TIPIFICACIÓN: La hoja/leaf (última selección)
      const lastSelectedId = selected[selected.length - 1];
      managementClassification = allTypifications.find((c: any) => c.id.toString() === lastSelectedId);

      // CLASIFICACIÓN: La categoría padre de la tipificación
      // Si la tipificación tiene parent_id, buscar ese parent como clasificación
      // Si es root (sin parent), usar el mismo como clasificación
      if (managementClassification?.parentId) {
        const parentId = managementClassification.parentId;
        contactClassification = allTypifications.find((c: any) => c.id.toString() === parentId.toString());
      } else {
        // Si no tiene padre, usar la misma como clasificación
        contactClassification = managementClassification;
      }
    } else {
      // Sistema simple
      contactClassification = this.contactClassifications().find((c: any) => c.id === this.managementForm.resultadoContacto);
      managementClassification = this.managementClassifications().find((g: any) => g.id === this.managementForm.tipoGestion);
    }

    // Obtener IDs de las 3 tipificaciones seleccionadas
    const selectedClassifs = this.selectedClassifications();
    const typificationLevel1Id = Number(selectedClassifs[0]);
    const typificationLevel2Id = Number(selectedClassifs[1]);
    const typificationLevel3Id = Number(selectedClassifs[2]);

    const request: CreateManagementRequest = {
      customerId: String(this.customerData().id),  // Usar ID numérico convertido a string
      advisorId: 'ADV-001',

      // Multi-tenant fields
      tenantId: this.selectedTenantId!,
      portfolioId: this.selectedPortfolioId!,
      subPortfolioId: null,  // TODO: Obtener del contexto cuando esté disponible
      campaignId: Number(this.campaign().id),

      // Jerarquía de tipificaciones (3 niveles)
      typificationLevel1Id,
      typificationLevel2Id,
      typificationLevel3Id,

      observations: this.managementForm.observaciones,
      dynamicFields: this.dynamicFieldValues() // Incluir campos dinámicos
    };

    this.managementService.createManagement(request).subscribe({
      next: (response) => {
        this.managementId = response.managementId;

        if (this.callStartTime && this.callActive()) {
          this.registerCallToBackend(response.managementId);
        }

        // NOTA: Los pagos ahora se registran automáticamente en el backend desde dynamicFields
        // El backend detecta clasificaciones con requiresPayment=true y procesa los campos
        // monto_pagado, metodo_pago, numero_operacion, fecha_pago, etc.
        // Ya no es necesario llamar a registerPaymentToBackend() aquí

        // El cronograma se crea automáticamente en el backend desde dynamicFields
        // No es necesario llamar a createScheduleToBackend() aquí

        this.onSaveSuccess(contactClassification?.label || '', managementClassification?.label || '-');
      },
      error: (error) => {
        console.error('Error al guardar gestión:', error);
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
        if (!this.callActive()) {
          const endCallRequest: EndCallRequest = {
            endTime: new Date().toISOString()
          };
          this.managementService.endCall(managementId, endCallRequest).subscribe({
            next: () => {},
            error: (err) => console.error('Error al finalizar llamada:', err)
          });
        }
      },
      error: (error) => {
        console.error('Error al registrar llamada:', error);
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
      next: (response) => {},
      error: (error) => {
        console.error('Error al registrar pago:', error);
      }
    });
  }

  private createScheduleToBackend(managementId: string) {
    if (this.scheduleForm.cuotas.length === 0) return;

    // Validar que todas las cuotas tengan monto y fecha
    const hasInvalidInstallments = this.scheduleForm.cuotas.some(
      cuota => !cuota.monto || !cuota.fechaVencimiento
    );

    if (hasInvalidInstallments) {
      alert('⚠️ Por favor complete todos los montos y fechas de las cuotas');
      return;
    }

    const scheduleRequest: any = {
      customerId: this.customerData().id_cliente,
      managementId: managementId,
      scheduleType: this.scheduleForm.tipoCronograma,
      negotiatedAmount: this.scheduleForm.montoNegociado ? parseFloat(this.scheduleForm.montoNegociado) : null,
      installments: this.scheduleForm.cuotas.map(cuota => ({
        installmentNumber: cuota.numero,
        amount: parseFloat(cuota.monto),
        dueDate: cuota.fechaVencimiento
      }))
    };

    this.paymentScheduleService.createPaymentSchedule(scheduleRequest).subscribe({
      next: (response) => {},
      error: (error) => {
        console.error('Error al crear cronograma:', error);
        alert('⚠️ Error al crear el cronograma de pagos');
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

    // Ocultar mensaje de éxito
    setTimeout(() => {
      this.showSuccess.set(false);
    }, 3000);
  }

  private validateForm(): boolean {
    const newErrors: ValidationErrors = {};

    // 1. Validar clasificación (sistema jerárquico o simple)
    if (this.usesHierarchicalClassifications()) {
      // Sistema jerárquico: verificar que se haya seleccionado clasificación completa
      const selected = this.selectedClassifications();
      if (selected.length === 0 || !selected[selected.length - 1]) {
        newErrors['typification'] = 'Debe seleccionar una clasificación';
      } else {
        // TEMPORAL: No verificar isLeaf, verificar si hay hijos disponibles
        const lastSelectedId = selected[selected.length - 1];
        const all: any[] = this.managementClassifications() as any[];
        const hasChildren = all.some((c: any) => c.parentId && Number(c.parentId) === Number(lastSelectedId));

        if (hasChildren) {
          newErrors['typification'] = 'Debe completar todos los niveles de clasificación';
        }
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
    // NOTA: Los campos de pago ahora son campos dinámicos (monto_pagado, metodo_pago, etc.)
    // Se validan automáticamente en el paso 3 como parte de los campos dinámicos requeridos

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
    this.themeService.toggleTheme();
  }

  /**
   * Obtiene el valor de un campo del cliente usando notación de punto
   * Ejemplo: 'contactInfo.mobilePhone' → customerData.contactInfo.mobilePhone
   */
  getFieldValue(field: string): any {
    const customer = this.customerData();
    if (!customer) return null;

    return field.split('.').reduce((obj: any, key: string) => obj?.[key], customer);
  }

  /**
   * Formatea un valor según su tipo
   */
  formatFieldValue(value: any, format?: string): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    switch (format) {
      case 'currency':
        return 'S/ ' + Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      case 'number':
        return String(value);

      case 'date':
        if (typeof value === 'string') {
          const date = new Date(value);
          return date.toLocaleDateString('es-PE');
        }
        return String(value);

      default:
        return String(value);
    }
  }

  getContactClassificationLabel(id: string): string {
    const typification = this.contactClassifications().find(c => c.id === id);
    if (!typification) return id;

    const label = typification.label || typification.codigo;
    return `[${typification.codigo}] ${label}`;
  }

  getManagementClassificationLabel(id: string): string {
    const typification = this.managementClassifications().find(g => g.id === id);
    if (!typification) return id;

    const label = typification.label || typification.codigo;
    return `[${typification.codigo}] ${label}`;
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
      console.error('addTableRow: columns no es un array válido', columns);
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