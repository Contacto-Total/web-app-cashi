import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ThemeService } from '../../shared/services/theme.service';

interface CallInfo {
  phoneNumber: string;
  customerName: string;
  document: string;
  portfolio: string;
}

@Component({
  selector: 'app-webphone',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="h-[100dvh] bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-gray-950 dark:to-black flex flex-col overflow-hidden transition-colors duration-300">

      <!-- Header Principal -->
      <div class="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 text-white shadow-md relative overflow-hidden">
        <div class="relative px-6 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="bg-blue-500 dark:bg-blue-600 p-2 rounded-lg">
                <lucide-angular name="phone" [size]="24"></lucide-angular>
              </div>
              <div>
                <h1 class="text-xl font-bold">WebPhone Cobranza</h1>
                <p class="text-sm text-blue-200 dark:text-blue-300">Sistema de Llamadas</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <!-- Botón de Dark Mode -->
              <button
                (click)="toggleDarkMode()"
                [class]="'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group border ' +
                  (themeService.isDarkMode()
                    ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/40'
                    : 'bg-blue-500/90 hover:bg-blue-600 border-blue-600')"
                [attr.aria-label]="themeService.isDarkMode() ? 'Activar modo claro' : 'Activar modo oscuro'"
                title="Cambiar tema"
              >
                @if (themeService.isDarkMode()) {
                  <lucide-angular name="sun" [size]="20" class="text-yellow-300 group-hover:rotate-45 transition-transform duration-300"></lucide-angular>
                  <span class="text-sm text-yellow-300 font-semibold">OSCURO</span>
                } @else {
                  <lucide-angular name="moon" [size]="20" class="text-white group-hover:rotate-12 transition-transform duration-300"></lucide-angular>
                  <span class="text-sm text-white font-semibold">CLARO</span>
                }
              </button>

              <div class="h-8 w-px bg-white/20"></div>

              <div class="text-right">
                <div class="text-blue-200 dark:text-blue-300 text-xs">Asesor</div>
                <div class="font-semibold">María González Castro</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido Principal -->
      <div class="flex-1 overflow-auto p-6">
        <div class="max-w-7xl mx-auto">

          <!-- Estado de Llamada -->
          <div class="mb-6">
            <div [class]="'p-6 rounded-xl shadow-lg border-2 transition-all duration-300 ' +
              (isInCall()
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700')">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  @if (isInCall()) {
                    <div class="bg-green-500 p-3 rounded-full animate-pulse">
                      <lucide-angular name="phone-call" [size]="32" class="text-white"></lucide-angular>
                    </div>
                  } @else {
                    <div class="bg-slate-300 dark:bg-slate-600 p-3 rounded-full">
                      <lucide-angular name="phone-off" [size]="32" class="text-slate-600 dark:text-slate-300"></lucide-angular>
                    </div>
                  }

                  <div>
                    @if (isInCall()) {
                      <h2 class="text-2xl font-bold text-green-700 dark:text-green-400">Llamada en Curso</h2>
                      <p class="text-sm text-green-600 dark:text-green-300">{{ currentCall()?.phoneNumber }}</p>
                    } @else {
                      <h2 class="text-2xl font-bold text-slate-700 dark:text-slate-300">Sin Llamada Activa</h2>
                      <p class="text-sm text-slate-500 dark:text-slate-400">Esperando siguiente llamada...</p>
                    }
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  @if (isInCall()) {
                    <button
                      (click)="endCall()"
                      class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <lucide-angular name="phone-off" [size]="20"></lucide-angular>
                      Finalizar Llamada
                    </button>
                  } @else {
                    <button
                      (click)="simulateIncomingCall()"
                      class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <lucide-angular name="phone-incoming" [size]="20"></lucide-angular>
                      Simular Llamada Entrante
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Información del Cliente (Solo visible si hay llamada) -->
          @if (isInCall() && currentCall()) {
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
              <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <lucide-angular name="user" [size]="20"></lucide-angular>
                Información del Cliente
              </h3>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">Nombre</div>
                  <div class="text-base font-semibold text-slate-800 dark:text-slate-200">{{ currentCall()!.customerName }}</div>
                </div>
                <div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">Documento</div>
                  <div class="text-base font-semibold text-slate-800 dark:text-slate-200">{{ currentCall()!.document }}</div>
                </div>
                <div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">Teléfono</div>
                  <div class="text-base font-semibold text-slate-800 dark:text-slate-200">{{ currentCall()!.phoneNumber }}</div>
                </div>
                <div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">Cartera</div>
                  <div class="text-base font-semibold text-slate-800 dark:text-slate-200">{{ currentCall()!.portfolio }}</div>
                </div>
              </div>

              <!-- Botón para Nueva Gestión -->
              <div class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  (click)="goToCollectionManagement()"
                  class="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <lucide-angular name="file-plus" [size]="24"></lucide-angular>
                  Iniciar Nueva Gestión de Cobranza
                </button>
              </div>
            </div>
          }

          <!-- Cola de Llamadas Pendientes -->
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <lucide-angular name="list" [size]="20"></lucide-angular>
              Cola de Llamadas ({{ pendingCalls().length }})
            </h3>

            @if (pendingCalls().length === 0) {
              <div class="text-center py-8 text-slate-500 dark:text-slate-400">
                <lucide-angular name="inbox" [size]="48" class="mx-auto mb-2 opacity-50"></lucide-angular>
                <p>No hay llamadas pendientes</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (call of pendingCalls(); track call.phoneNumber) {
                  <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                        <lucide-angular name="user" [size]="20" class="text-blue-600 dark:text-blue-400"></lucide-angular>
                      </div>
                      <div>
                        <div class="font-semibold text-slate-800 dark:text-slate-200">{{ call.customerName }}</div>
                        <div class="text-sm text-slate-500 dark:text-slate-400">{{ call.phoneNumber }} • {{ call.document }}</div>
                      </div>
                    </div>
                    <div class="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">
                      {{ call.portfolio }}
                    </div>
                  </div>
                }
              </div>
            }
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
  `]
})
export class WebphonePage {
  isInCall = signal(false);
  currentCall = signal<CallInfo | null>(null);
  pendingCalls = signal<CallInfo[]>([
    {
      phoneNumber: '+51 987 654 321',
      customerName: 'Juan Pérez López',
      document: '12345678',
      portfolio: 'Consumo'
    },
    {
      phoneNumber: '+51 912 345 678',
      customerName: 'María García Torres',
      document: '87654321',
      portfolio: 'Tarjetas'
    },
    {
      phoneNumber: '+51 998 765 432',
      customerName: 'Carlos Rodríguez Sánchez',
      document: '45678912',
      portfolio: 'Vehicular'
    }
  ]);

  constructor(
    private router: Router,
    public themeService: ThemeService
  ) {}

  simulateIncomingCall() {
    const calls = this.pendingCalls();
    if (calls.length > 0) {
      const nextCall = calls[0];
      this.currentCall.set(nextCall);
      this.isInCall.set(true);
      this.pendingCalls.set(calls.slice(1));
    }
  }

  endCall() {
    this.isInCall.set(false);
    this.currentCall.set(null);
  }

  goToCollectionManagement() {
    // Navegar a la pantalla de gestión de cobranza
    this.router.navigate(['/collection-management']);
  }

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }
}
