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
        <div class="relative px-4 py-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="text-2xl">📞</div>
              <div>
                <h1 class="text-lg font-bold">WebPhone Cobranza</h1>
                <p class="text-xs text-blue-200 dark:text-blue-300">Sistema de Llamadas</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <!-- Botón de Dark Mode -->
              <button
                (click)="toggleDarkMode()"
                [class]="'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 border text-sm ' +
                  (themeService.isDarkMode()
                    ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/40 text-yellow-300'
                    : 'bg-blue-500/90 hover:bg-blue-600 border-blue-600 text-white')"
                [attr.aria-label]="themeService.isDarkMode() ? 'Activar modo claro' : 'Activar modo oscuro'"
                title="Cambiar tema"
              >
                @if (themeService.isDarkMode()) {
                  <span>☀️</span>
                  <span class="font-semibold">OSCURO</span>
                } @else {
                  <span>🌙</span>
                  <span class="font-semibold">CLARO</span>
                }
              </button>

              <div class="h-6 w-px bg-white/20"></div>

              <div class="text-right">
                <div class="text-blue-200 dark:text-blue-300 text-xs">Asesor</div>
                <div class="text-sm font-semibold">María González Castro</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido Principal -->
      <div class="flex-1 overflow-auto p-4">
        <div class="max-w-md mx-auto">

          <!-- Webphone con Teclado Numérico -->
          <div class="mb-4">
            <div class="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-3">

              <!-- Estado de Llamada -->
              <div [class]="'p-2 rounded-md mb-3 text-center transition-all duration-300 ' +
                (isInCall()
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700'
                  : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600')">
                @if (isInCall()) {
                  <div class="text-lg">📞</div>
                  <div class="text-sm font-semibold text-green-700 dark:text-green-400">Llamada en Curso</div>
                  <div class="text-xs text-green-600 dark:text-green-300">{{ currentCall()?.phoneNumber }}</div>
                } @else {
                  <div class="text-lg">☎️</div>
                  <div class="text-sm font-semibold text-slate-700 dark:text-slate-300">Listo para Llamar</div>
                }
              </div>

              @if (!isInCall()) {
                <!-- Display del Número Marcado -->
                <div class="mb-3">
                  <div class="bg-slate-100 dark:bg-slate-700 rounded-md p-2 border border-slate-300 dark:border-slate-600">
                    <div class="text-xl font-mono text-center text-slate-800 dark:text-slate-200 min-h-[32px] flex items-center justify-center">
                      {{ dialedNumber() || 'Marca un número' }}
                    </div>
                  </div>
                </div>

                <!-- Teclado Numérico -->
                <div class="grid grid-cols-3 gap-2 mb-3">
                  @for (key of phoneKeys; track key.value) {
                    <button
                      (click)="dialKey(key.value)"
                      class="h-14 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 border border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-lg shadow-sm hover:shadow transition-all duration-200 active:scale-95"
                    >
                      <div class="flex flex-col items-center justify-center">
                        <div class="text-lg font-bold text-slate-800 dark:text-slate-200">{{ key.value }}</div>
                        @if (key.letters) {
                          <div class="text-[10px] text-slate-500 dark:text-slate-400 uppercase">{{ key.letters }}</div>
                        }
                      </div>
                    </button>
                  }
                </div>

                <!-- Botones de Acción -->
                <div class="grid grid-cols-3 gap-2">
                  <!-- Botón Borrar Último -->
                  <button
                    (click)="clearLastDigit()"
                    [disabled]="dialedNumber().length === 0"
                    class="px-2 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white disabled:text-slate-500 rounded-md text-sm font-semibold flex items-center justify-center gap-1 transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    <span>⌫</span>
                    <span>Borrar</span>
                  </button>

                  <!-- Botón Llamar -->
                  <button
                    (click)="makeCall()"
                    [disabled]="dialedNumber().length === 0"
                    class="px-2 py-2 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white disabled:text-slate-500 rounded-md text-sm font-semibold flex items-center justify-center gap-1 transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    <span>📞</span>
                    <span>Llamar</span>
                  </button>

                  <!-- Botón Limpiar -->
                  <button
                    (click)="clearAll()"
                    [disabled]="dialedNumber().length === 0"
                    class="px-2 py-2 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white disabled:text-slate-500 rounded-md text-sm font-semibold flex items-center justify-center gap-1 transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    <span>✖️</span>
                    <span>Limpiar</span>
                  </button>
                </div>
              } @else {
                <!-- Botón Finalizar Llamada -->
                <button
                  (click)="endCall()"
                  class="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <span>📵</span>
                  <span>Finalizar Llamada</span>
                </button>
              }
            </div>
          </div>

          <!-- Información del Cliente (Solo visible si hay llamada) -->
          @if (isInCall() && currentCall()) {
            <div class="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-3 mb-4">
              <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <span>👤</span>
                <span>Información del Cliente</span>
              </h3>

              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div class="text-xs text-slate-500 dark:text-slate-400">Nombre</div>
                  <div class="font-semibold text-slate-800 dark:text-slate-200">{{ currentCall()!.customerName }}</div>
                </div>
                <div>
                  <div class="text-xs text-slate-500 dark:text-slate-400">Documento</div>
                  <div class="font-semibold text-slate-800 dark:text-slate-200">{{ currentCall()!.document }}</div>
                </div>
                <div>
                  <div class="text-xs text-slate-500 dark:text-slate-400">Teléfono</div>
                  <div class="font-semibold text-slate-800 dark:text-slate-200">{{ currentCall()!.phoneNumber }}</div>
                </div>
                <div>
                  <div class="text-xs text-slate-500 dark:text-slate-400">Cartera</div>
                  <div class="font-semibold text-slate-800 dark:text-slate-200">{{ currentCall()!.portfolio }}</div>
                </div>
              </div>

              <!-- Botón para Nueva Gestión -->
              <div class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  (click)="goToCollectionManagement()"
                  class="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <span>📝</span>
                  <span>Iniciar Nueva Gestión de Cobranza</span>
                </button>
              </div>
            </div>
          }

          <!-- Cola de Llamadas Pendientes -->
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-3">
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <span>📋</span>
              <span>Cola de Llamadas ({{ pendingCalls().length }})</span>
            </h3>

            @if (pendingCalls().length === 0) {
              <div class="text-center py-6 text-slate-500 dark:text-slate-400">
                <div class="text-3xl mb-2 opacity-50">📭</div>
                <p class="text-xs">No hay llamadas pendientes</p>
              </div>
            } @else {
              <div class="space-y-2">
                @for (call of pendingCalls(); track call.phoneNumber) {
                  <div class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md border border-slate-200 dark:border-slate-600 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="text-lg">👤</div>
                      <div class="text-xs">
                        <div class="font-semibold text-slate-800 dark:text-slate-200">{{ call.customerName }}</div>
                        <div class="text-slate-500 dark:text-slate-400">{{ call.phoneNumber }} • {{ call.document }}</div>
                      </div>
                    </div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">
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
  dialedNumber = signal('');

  // Configuración del teclado numérico
  phoneKeys = [
    { value: '1', letters: '' },
    { value: '2', letters: 'ABC' },
    { value: '3', letters: 'DEF' },
    { value: '4', letters: 'GHI' },
    { value: '5', letters: 'JKL' },
    { value: '6', letters: 'MNO' },
    { value: '7', letters: 'PQRS' },
    { value: '8', letters: 'TUV' },
    { value: '9', letters: 'WXYZ' },
    { value: '*', letters: '' },
    { value: '0', letters: '+' },
    { value: '#', letters: '' }
  ];

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

  // Agregar dígito al número marcado
  dialKey(key: string) {
    const currentNumber = this.dialedNumber();
    this.dialedNumber.set(currentNumber + key);
  }

  // Borrar último dígito
  clearLastDigit() {
    const currentNumber = this.dialedNumber();
    if (currentNumber.length > 0) {
      this.dialedNumber.set(currentNumber.slice(0, -1));
    }
  }

  // Limpiar todo el número
  clearAll() {
    this.dialedNumber.set('');
  }

  // Realizar llamada con el número marcado
  makeCall() {
    const phoneNumber = this.dialedNumber();
    if (phoneNumber.length > 0) {
      // Buscar en las llamadas pendientes si el número coincide
      const calls = this.pendingCalls();
      const matchingCall = calls.find(call =>
        call.phoneNumber.replace(/\s/g, '').includes(phoneNumber.replace(/\s/g, ''))
      );

      if (matchingCall) {
        // Si encontramos una coincidencia, usar esa información
        this.currentCall.set(matchingCall);
        this.isInCall.set(true);
        // Remover de la lista de pendientes
        this.pendingCalls.set(calls.filter(call => call !== matchingCall));
      } else {
        // Si no encontramos coincidencia, crear una llamada genérica
        this.currentCall.set({
          phoneNumber: phoneNumber,
          customerName: 'Cliente Desconocido',
          document: 'N/A',
          portfolio: 'N/A'
        });
        this.isInCall.set(true);
      }

      // Limpiar el número marcado
      this.dialedNumber.set('');
    }
  }

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
