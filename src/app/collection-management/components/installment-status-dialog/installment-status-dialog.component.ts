import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { PaymentScheduleService, InstallmentResource, UpdateInstallmentStatusRequest } from '../../services/payment-schedule.service';

@Component({
  selector: 'app-installment-status-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideInUp border border-slate-200 dark:border-slate-700">

          <!-- Header -->
          <div class="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 text-white px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <lucide-angular name="calendar-check" [size]="24"></lucide-angular>
              <div>
                <h2 class="text-lg font-bold">Actualizar Estado de Cuota</h2>
                <p class="text-sm opacity-90">Cuota #{{ installment()?.installmentNumber }}</p>
              </div>
            </div>
            <button
              (click)="close()"
              class="p-2 hover:bg-white/20 rounded-lg transition-colors"
              type="button">
              <lucide-angular name="x" [size]="20"></lucide-angular>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">

            <!-- Información de la cuota -->
            <div class="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-slate-600 dark:text-slate-400">Monto:</span>
                  <span class="font-bold text-purple-900 dark:text-purple-200 ml-2">
                    S/ {{ installment()?.amount | number:'1.2-2' }}
                  </span>
                </div>
                <div>
                  <span class="text-slate-600 dark:text-slate-400">Fecha Vencimiento:</span>
                  <span class="font-bold text-purple-900 dark:text-purple-200 ml-2">
                    {{ formatDate(installment()?.dueDate) }}
                  </span>
                </div>
                <div>
                  <span class="text-slate-600 dark:text-slate-400">Estado Actual:</span>
                  <span class="ml-2 px-2 py-0.5 rounded text-xs font-bold"
                        [class]="getStatusBadgeClass(installment()?.status || 'PENDIENTE')">
                    {{ installment()?.statusDescription || 'Pendiente' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Selector de nuevo estado -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Nuevo Estado
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  (click)="selectedStatus.set('COMPLETADO')"
                  [class]="selectedStatus() === 'COMPLETADO'
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-600 text-green-900 dark:text-green-300'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-green-400'"
                  class="border-2 rounded-lg p-4 flex flex-col items-center gap-2 transition-all">
                  <lucide-angular name="check-circle" [size]="24"></lucide-angular>
                  <span class="text-sm font-bold">Completado</span>
                </button>

                <button
                  type="button"
                  (click)="selectedStatus.set('VENCIDO')"
                  [class]="selectedStatus() === 'VENCIDO'
                    ? 'bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-600 text-red-900 dark:text-red-300'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-red-400'"
                  class="border-2 rounded-lg p-4 flex flex-col items-center gap-2 transition-all">
                  <lucide-angular name="alert-circle" [size]="24"></lucide-angular>
                  <span class="text-sm font-bold">Vencido</span>
                </button>

                <button
                  type="button"
                  (click)="selectedStatus.set('CANCELADO')"
                  [class]="selectedStatus() === 'CANCELADO'
                    ? 'bg-gray-100 dark:bg-gray-700/30 border-gray-500 dark:border-gray-600 text-gray-900 dark:text-gray-300'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-gray-400'"
                  class="border-2 rounded-lg p-4 flex flex-col items-center gap-2 transition-all">
                  <lucide-angular name="x-circle" [size]="24"></lucide-angular>
                  <span class="text-sm font-bold">Cancelado</span>
                </button>
              </div>
            </div>

            <!-- Campos adicionales para COMPLETADO -->
            @if (selectedStatus() === 'COMPLETADO') {
              <div class="space-y-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Fecha de Pago *
                  </label>
                  <input
                    type="datetime-local"
                    [(ngModel)]="paymentDate"
                    class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                           focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                    required>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Monto Pagado *
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-slate-500 dark:text-slate-400">S/</span>
                    <input
                      type="number"
                      step="0.01"
                      [(ngModel)]="amountPaid"
                      class="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg
                             bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                             focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent"
                      required>
                  </div>
                </div>
              </div>
            }

            <!-- Observaciones -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Observaciones
              </label>
              <textarea
                [(ngModel)]="observations"
                rows="3"
                placeholder="Ingrese notas o comentarios adicionales..."
                class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                       focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-transparent
                       placeholder:text-slate-400 dark:placeholder:text-slate-500"></textarea>
            </div>

            <!-- Error message -->
            @if (errorMessage()) {
              <div class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-300 px-4 py-3 rounded-lg flex items-start gap-2">
                <lucide-angular name="alert-triangle" [size]="18" class="flex-shrink-0 mt-0.5"></lucide-angular>
                <span class="text-sm">{{ errorMessage() }}</span>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              (click)="close()"
              class="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300
                     hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
              Cancelar
            </button>
            <button
              type="button"
              (click)="save()"
              [disabled]="!canSave() || isSaving()"
              class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700
                     hover:from-purple-700 hover:to-purple-800 rounded-lg transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600
                     flex items-center gap-2">
              @if (isSaving()) {
                <lucide-angular name="loader-2" [size]="16" class="animate-spin"></lucide-angular>
                <span>Guardando...</span>
              } @else {
                <lucide-angular name="check" [size]="16"></lucide-angular>
                <span>Guardar</span>
              }
            </button>
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
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

    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }

    .animate-slideInUp {
      animation: slideInUp 0.3s ease-out;
    }
  `]
})
export class InstallmentStatusDialogComponent {
  isOpen = signal(false);
  installment = signal<InstallmentResource | null>(null);
  managementId = signal<number>(0);

  selectedStatus = signal<'COMPLETADO' | 'VENCIDO' | 'CANCELADO' | null>(null);
  paymentDate = '';
  amountPaid: number | null = null;
  observations = '';

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  onSave?: (success: boolean) => void;

  canSave = computed(() => {
    if (!this.selectedStatus()) return false;

    if (this.selectedStatus() === 'COMPLETADO') {
      return !!this.paymentDate && this.amountPaid !== null && this.amountPaid > 0;
    }

    return true;
  });

  constructor(private paymentScheduleService: PaymentScheduleService) {
    // Reset form when dialog closes
    effect(() => {
      if (!this.isOpen()) {
        this.resetForm();
      }
    });
  }

  open(installment: InstallmentResource, managementId: number) {
    this.installment.set(installment);
    this.managementId.set(managementId);
    this.isOpen.set(true);

    // Pre-llenar con el monto de la cuota
    this.amountPaid = installment.amount;

    // Pre-llenar fecha actual
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    this.paymentDate = `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  close() {
    this.isOpen.set(false);
  }

  resetForm() {
    this.selectedStatus.set(null);
    this.paymentDate = '';
    this.amountPaid = null;
    this.observations = '';
    this.errorMessage.set(null);
    this.installment.set(null);
    this.managementId.set(0);
  }

  save() {
    const installment = this.installment();
    if (!installment || !this.canSave()) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const request: UpdateInstallmentStatusRequest = {
      status: this.selectedStatus()!,
      observations: this.observations || undefined,
      registeredBy: 'USUARIO' // TODO: Obtener del usuario actual
    };

    // Agregar campos específicos para COMPLETADO
    if (this.selectedStatus() === 'COMPLETADO') {
      request.paymentDate = this.paymentDate;
      request.amountPaid = this.amountPaid!;
    }

    this.paymentScheduleService.updateInstallmentStatus(installment.id, request).subscribe({
      next: () => {
        console.log('✅ Estado de cuota actualizado exitosamente');
        this.isSaving.set(false);
        this.close();
        if (this.onSave) {
          this.onSave(true);
        }
      },
      error: (error) => {
        console.error('❌ Error actualizando estado de cuota:', error);
        this.errorMessage.set('Error al actualizar el estado. Intente nuevamente.');
        this.isSaving.set(false);
        if (this.onSave) {
          this.onSave(false);
        }
      }
    });
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
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