import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Save } from 'lucide-angular';
import { ClassificationService } from '../../services/classification.service';
import { Tenant } from '../../models/tenant.model';
import { Portfolio } from '../../models/portfolio.model';

interface PortfolioForm {
  portfolioCode: string;
  portfolioName: string;
  portfolioType: string;
  parentPortfolioId?: number;
  description: string;
}

@Component({
  selector: 'app-portfolio-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
         (click)="onCancel()">

      <!-- Dialog -->
      <div class="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto transition-all duration-300 transform"
           (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
          <div>
            <h2 class="text-xl font-bold">Crear Nueva Cartera</h2>
            <p class="text-sm text-blue-100 dark:text-blue-200">{{ selectedTenant?.tenantName || 'Cliente' }}</p>
          </div>
          <button
            (click)="onCancel()"
            class="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <lucide-angular name="x" [size]="24"></lucide-angular>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4">
          <!-- Portfolio Code -->
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Código de Cartera <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="form.portfolioCode"
              placeholder="Ej: TRAMO-1, CART-A"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              [class.border-red-500]="errors().portfolioCode"
            />
            @if (errors().portfolioCode) {
              <p class="text-red-500 text-sm mt-1">{{ errors().portfolioCode }}</p>
            }
          </div>

          <!-- Portfolio Name -->
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Nombre de Cartera <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              [(ngModel)]="form.portfolioName"
              placeholder="Ej: Tramo 1, Cartera A"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              [class.border-red-500]="errors().portfolioName"
            />
            @if (errors().portfolioName) {
              <p class="text-red-500 text-sm mt-1">{{ errors().portfolioName }}</p>
            }
          </div>

          <!-- Portfolio Type -->
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Tipo de Cartera
            </label>
            <select
              [(ngModel)]="form.portfolioType"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
              <option value="">-- Seleccionar --</option>
              <option value="CREDIT_CARD">Tarjeta de Crédito</option>
              <option value="PERSONAL_LOAN">Préstamo Personal</option>
              <option value="MORTGAGE">Hipoteca</option>
              <option value="AUTO_LOAN">Préstamo Automotriz</option>
              <option value="COMMERCIAL">Comercial</option>
              <option value="RETAIL">Retail</option>
              <option value="TELECOM">Telecomunicaciones</option>
              <option value="UTILITIES">Servicios Públicos</option>
              <option value="EDUCATION">Educación</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          <!-- Parent Portfolio (for subcarteras) -->
          @if (portfolios.length > 0) {
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                Cartera Padre (Opcional - para subcarteras)
              </label>
              <select
                [(ngModel)]="form.parentPortfolioId"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
                <option [ngValue]="undefined">-- Sin cartera padre --</option>
                @for (portfolio of portfolios; track portfolio.id) {
                  <option [ngValue]="portfolio.id">{{ portfolio.portfolioName }} ({{ portfolio.portfolioCode }})</option>
                }
              </select>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Dejar vacío para crear una cartera principal. Seleccionar una cartera existente para crear una subcartera.
              </p>
            </div>
          }

          <!-- Description -->
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Descripción
            </label>
            <textarea
              [(ngModel)]="form.description"
              rows="3"
              placeholder="Descripción opcional de la cartera..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-gray-50 dark:bg-slate-800 px-6 py-4 flex justify-end gap-3 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
          <button
            (click)="onCancel()"
            class="px-6 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 font-semibold transition-colors flex items-center gap-2">
            <lucide-angular name="x" [size]="16"></lucide-angular>
            Cancelar
          </button>
          <button
            (click)="onSave()"
            [disabled]="saving()"
            class="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
            @if (saving()) {
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Guardando...
            } @else {
              <lucide-angular name="save" [size]="16"></lucide-angular>
              Guardar
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class PortfolioFormDialogComponent {
  @Input() selectedTenant?: Tenant;
  @Input() portfolios: Portfolio[] = [];
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form: PortfolioForm = {
    portfolioCode: '',
    portfolioName: '',
    portfolioType: '',
    description: ''
  };

  saving = signal(false);
  errors = signal<Record<string, string>>({});

  constructor(private classificationService: ClassificationService) {}

  validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!this.form.portfolioCode.trim()) {
      newErrors['portfolioCode'] = 'El código de cartera es requerido';
    }

    if (!this.form.portfolioName.trim()) {
      newErrors['portfolioName'] = 'El nombre de cartera es requerido';
    }

    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  onSave() {
    if (!this.validate() || !this.selectedTenant) return;

    this.saving.set(true);

    const data = {
      tenantId: this.selectedTenant.id,
      portfolioCode: this.form.portfolioCode.trim(),
      portfolioName: this.form.portfolioName.trim(),
      portfolioType: this.form.portfolioType || undefined,
      parentPortfolioId: this.form.parentPortfolioId,
      description: this.form.description.trim() || undefined
    };

    this.classificationService.createPortfolio(data).subscribe({
      next: (portfolio) => {
        this.saving.set(false);
        this.save.emit(portfolio);
      },
      error: (error) => {
        console.error('Error al crear cartera:', error);
        this.saving.set(false);
        alert('Error al crear la cartera. Verifique que el código no esté duplicado.');
      }
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}
