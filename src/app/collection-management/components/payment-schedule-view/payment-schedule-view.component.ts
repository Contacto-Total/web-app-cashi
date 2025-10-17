import { Component, Input, signal, computed, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { PaymentScheduleService, PaymentScheduleResource, InstallmentResource, InstallmentStatusHistoryResource } from '../../services/payment-schedule.service';
import { InstallmentStatusDialogComponent } from '../installment-status-dialog/installment-status-dialog.component';

interface InstallmentWithStatus extends InstallmentResource {
  latestStatus?: InstallmentStatusHistoryResource;
}

@Component({
  selector: 'app-payment-schedule-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, InstallmentStatusDialogComponent],
  template: `
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">

      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 text-white px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <lucide-angular name="calendar" [size]="24"></lucide-angular>
            <div>
              <h3 class="text-lg font-bold">Cronograma de Pagos</h3>
              <p class="text-sm opacity-90">{{ installmentsWithStatus().length }} cuotas programadas</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm opacity-90">Monto Total</div>
            <div class="text-2xl font-bold">S/ {{ schedule()?.totalAmount | number:'1.2-2' }}</div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      @if (isLoading()) {
        <div class="p-8 flex items-center justify-center">
          <div class="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <lucide-angular name="loader-2" [size]="20" class="animate-spin"></lucide-angular>
            <span>Cargando estados...</span>
          </div>
        </div>
      }

      <!-- Installments Table -->
      @if (!isLoading() && installmentsWithStatus().length > 0) {
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">#</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Fecha Vencimiento</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Monto</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Estado</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Fecha Pago</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              @for (installment of installmentsWithStatus(); track installment.id) {
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <!-- Número de cuota -->
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <span class="text-xs font-bold text-purple-700 dark:text-purple-300">
                          {{ installment.installmentNumber }}
                        </span>
                      </div>
                    </div>
                  </td>

                  <!-- Fecha Vencimiento -->
                  <td class="px-4 py-3">
                    <div class="text-sm text-slate-900 dark:text-slate-100">
                      {{ formatDate(installment.dueDate) }}
                    </div>
                  </td>

                  <!-- Monto -->
                  <td class="px-4 py-3 text-right">
                    <div class="text-sm font-bold text-slate-900 dark:text-slate-100">
                      S/ {{ installment.amount | number:'1.2-2' }}
                    </div>
                  </td>

                  <!-- Estado -->
                  <td class="px-4 py-3">
                    <div class="flex justify-center">
                      <span class="px-2 py-1 rounded text-xs font-bold"
                            [class]="getStatusBadgeClass(installment.latestStatus?.status || 'PENDIENTE')">
                        {{ installment.latestStatus?.statusDescription || 'Pendiente' }}
                      </span>
                    </div>
                  </td>

                  <!-- Fecha Pago Real -->
                  <td class="px-4 py-3">
                    @if (installment.latestStatus?.actualPaymentDate) {
                      <div class="text-sm text-slate-900 dark:text-slate-100">
                        {{ formatDateTime(installment.latestStatus!.actualPaymentDate!) }}
                      </div>
                    } @else {
                      <div class="text-sm text-slate-400 dark:text-slate-500">-</div>
                    }
                  </td>

                  <!-- Acciones -->
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <!-- Botón editar estado -->
                      <button
                        type="button"
                        (click)="openStatusDialog(installment)"
                        class="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded transition-colors"
                        title="Actualizar estado">
                        <lucide-angular name="edit" [size]="16" class="text-purple-600 dark:text-purple-400"></lucide-angular>
                      </button>

                      <!-- Botón ver historial -->
                      <button
                        type="button"
                        (click)="toggleHistory(installment.id)"
                        [class]="expandedHistory() === installment.id
                          ? 'bg-slate-200 dark:bg-slate-700'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'"
                        class="p-1.5 rounded transition-colors"
                        title="Ver historial">
                        <lucide-angular name="history" [size]="16" class="text-slate-600 dark:text-slate-400"></lucide-angular>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Historial expandible -->
                @if (expandedHistory() === installment.id && installmentHistory()) {
                  <tr>
                    <td colspan="6" class="px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
                      <div class="space-y-2">
                        <div class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          <lucide-angular name="history" [size]="16"></lucide-angular>
                          <span>Historial de Estados</span>
                        </div>

                        @if (isLoadingHistory()) {
                          <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 py-2">
                            <lucide-angular name="loader-2" [size]="14" class="animate-spin"></lucide-angular>
                            <span>Cargando historial...</span>
                          </div>
                        } @else if (installmentHistory() && installmentHistory()!.length > 0) {
                          <div class="space-y-2">
                            @for (historyItem of installmentHistory(); track historyItem.id) {
                              <div class="flex items-start gap-3 text-xs p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                                <div class="flex-shrink-0 w-24 text-slate-600 dark:text-slate-400">
                                  {{ formatDateTime(historyItem.changeDate) }}
                                </div>
                                <div class="flex-1">
                                  <span class="px-2 py-0.5 rounded font-bold"
                                        [class]="getStatusBadgeClass(historyItem.status)">
                                    {{ historyItem.statusDescription }}
                                  </span>
                                  @if (historyItem.amountPaid) {
                                    <span class="ml-2 text-slate-700 dark:text-slate-300">
                                      S/ {{ historyItem.amountPaid | number:'1.2-2' }}
                                    </span>
                                  }
                                  @if (historyItem.observations) {
                                    <div class="mt-1 text-slate-600 dark:text-slate-400">
                                      {{ historyItem.observations }}
                                    </div>
                                  }
                                </div>
                                <div class="flex-shrink-0 text-slate-500 dark:text-slate-500">
                                  {{ historyItem.registeredBy }}
                                </div>
                              </div>
                            }
                          </div>
                        }
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Summary -->
        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <div class="grid grid-cols-4 gap-4 text-sm">
            <div class="text-center">
              <div class="text-slate-600 dark:text-slate-400 mb-1">Completadas</div>
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ summaryStats().completed }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-slate-600 dark:text-slate-400 mb-1">Pendientes</div>
              <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {{ summaryStats().pending }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-slate-600 dark:text-slate-400 mb-1">Vencidas</div>
              <div class="text-2xl font-bold text-red-600 dark:text-red-400">
                {{ summaryStats().overdue }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-slate-600 dark:text-slate-400 mb-1">Canceladas</div>
              <div class="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {{ summaryStats().cancelled }}
              </div>
            </div>
          </div>
        </div>
      }

    </div>

    <!-- Dialog -->
    <app-installment-status-dialog #statusDialog />
  `,
  styles: []
})
export class PaymentScheduleViewComponent implements OnChanges {
  @Input() managementId: string = '';
  @ViewChild('statusDialog') statusDialog!: InstallmentStatusDialogComponent;

  schedule = signal<PaymentScheduleResource | null>(null);
  latestStatuses = signal<InstallmentStatusHistoryResource[]>([]);
  isLoading = signal(false);

  expandedHistory = signal<number | null>(null);
  installmentHistory = signal<InstallmentStatusHistoryResource[] | null>(null);
  isLoadingHistory = signal(false);

  installmentsWithStatus = computed<InstallmentWithStatus[]>(() => {
    const sched = this.schedule();
    const statuses = this.latestStatuses();

    if (!sched) return [];

    return sched.installments.map(installment => {
      const latestStatus = statuses.find(s => s.installmentId === installment.id);
      return {
        ...installment,
        latestStatus
      };
    });
  });

  summaryStats = computed(() => {
    const installments = this.installmentsWithStatus();
    return {
      completed: installments.filter(i => ['COMPLETED', 'COMPLETADO'].includes(i.latestStatus?.status || '')).length,
      pending: installments.filter(i => ['PENDING', 'PENDIENTE'].includes(i.latestStatus?.status || '')).length,
      overdue: installments.filter(i => ['OVERDUE', 'VENCIDO'].includes(i.latestStatus?.status || '')).length,
      cancelled: installments.filter(i => ['CANCELLED', 'CANCELADO'].includes(i.latestStatus?.status || '')).length,
    };
  });

  constructor(private paymentScheduleService: PaymentScheduleService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['managementId'] && this.managementId) {
      this.loadSchedule();
    }
  }

  loadSchedule() {
    this.isLoading.set(true);

    this.paymentScheduleService.getPaymentScheduleByManagementId(this.managementId).subscribe({
      next: (schedule) => {
        console.log('📊 Cronograma cargado:', schedule);
        this.schedule.set(schedule);
        this.loadLatestStatuses();
      },
      error: (error) => {
        console.error('❌ Error cargando cronograma:', error);
        this.isLoading.set(false);
      }
    });
  }

  loadLatestStatuses() {
    this.paymentScheduleService.getLatestStatusByManagement(this.managementId).subscribe({
      next: (statuses) => {
        console.log('📋 Estados más recientes cargados:', statuses);
        this.latestStatuses.set(statuses);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando estados:', error);
        this.isLoading.set(false);
      }
    });
  }

  openStatusDialog(installment: InstallmentWithStatus) {
    this.statusDialog.open(installment, this.managementId);
    this.statusDialog.onSave = (success) => {
      if (success) {
        // Recargar estados
        this.loadLatestStatuses();
        // Recargar historial si está expandido
        if (this.expandedHistory() === installment.id) {
          this.loadInstallmentHistory(installment.id);
        }
      }
    };
  }

  toggleHistory(installmentId: number) {
    if (this.expandedHistory() === installmentId) {
      this.expandedHistory.set(null);
      this.installmentHistory.set(null);
    } else {
      this.expandedHistory.set(installmentId);
      this.loadInstallmentHistory(installmentId);
    }
  }

  loadInstallmentHistory(installmentId: number) {
    this.isLoadingHistory.set(true);
    this.paymentScheduleService.getInstallmentHistory(installmentId).subscribe({
      next: (history) => {
        console.log('📜 Historial de cuota cargado:', history);
        this.installmentHistory.set(history);
        this.isLoadingHistory.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando historial:', error);
        this.isLoadingHistory.set(false);
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'COMPLETADO':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700';
      case 'PENDING':
      case 'PENDIENTE':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700';
      case 'OVERDUE':
      case 'VENCIDO':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700';
      case 'CANCELLED':
      case 'CANCELADO':
        return 'bg-gray-100 dark:bg-gray-700/30 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300';
    }
  }
}
