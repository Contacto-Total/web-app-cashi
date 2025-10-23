import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TypificationService } from '../../services/typification.service';
import { Tenant } from '../../models/tenant.model';
import { Portfolio } from '../../models/portfolio.model';

interface QuickSetupTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  portfolios: Array<{
    code: string;
    name: string;
    type: string;
    subs?: Array<{ code: string; name: string; }>;
  }>;
}

@Component({
  selector: 'app-setup-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">

        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <lucide-angular name="zap" [size]="24"></lucide-angular>
              </div>
              <div>
                <h2 class="text-2xl font-bold">Configuración Express</h2>
                <p class="text-blue-100 text-sm">Configure un cliente de cobranza en 30 segundos</p>
              </div>
            </div>
            <button (click)="close()" class="text-white/80 hover:text-white">
              <lucide-angular name="x" [size]="24"></lucide-angular>
            </button>
          </div>
        </div>

        <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">

          <!-- Step 1: Template Selection -->
          @if (step() === 1) {
            <div class="space-y-4">
              <div class="text-center mb-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">¿Qué tipo de cartera vas a gestionar?</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Selecciona una plantilla para empezar rápido</p>
              </div>

              <div class="grid grid-cols-2 gap-3">
                @for (template of templates; track template.id) {
                  <button (click)="selectTemplate(template)"
                          [class]="'p-4 border-2 rounded-xl text-left transition-all hover:scale-105 ' +
                            (selectedTemplate()?.id === template.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300')">
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        <lucide-angular [name]="template.icon" [size]="20"></lucide-angular>
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-gray-900 dark:text-white text-sm mb-1">{{ template.name }}</h4>
                        <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{{ template.description }}</p>
                      </div>
                    </div>
                  </button>
                }
              </div>
            </div>
          }

          <!-- Step 2: Quick Form -->
          @if (step() === 2) {
            <div class="space-y-4">
              <!-- Tenant Info -->
              <div class="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 class="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <lucide-angular name="building-2" [size]="18" class="text-blue-600"></lucide-angular>
                  Datos del Cliente
                </h3>
                <div class="grid grid-cols-2 gap-3">
                  <input type="text" [(ngModel)]="tenantCode" placeholder="Código (ej: FIN-001) *"
                         class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800">
                  <input type="text" [(ngModel)]="tenantName" placeholder="Nombre (ej: Financiera XYZ) *"
                         class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800">
                </div>
              </div>

              <!-- Preview -->
              <div class="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <lucide-angular name="folder-tree" [size]="18" class="text-green-600"></lucide-angular>
                    Se crearán estas carteras
                  </h3>
                  <span class="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full font-bold">
                    {{ selectedTemplate()?.name }}
                  </span>
                </div>

                <div class="space-y-2">
                  @for (portfolio of selectedTemplate()?.portfolios || []; track $index) {
                    <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div class="flex items-center gap-2 mb-1">
                        <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {{ $index + 1 }}
                        </div>
                        <span class="font-medium text-gray-900 dark:text-white text-sm">{{ portfolio.name }}</span>
                        <span class="text-xs text-gray-500">{{ portfolio.code }}</span>
                      </div>
                      @if (portfolio.subs && portfolio.subs.length > 0) {
                        <div class="ml-8 mt-2 space-y-1">
                          @for (sub of portfolio.subs; track $index) {
                            <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <div class="w-1 h-1 bg-green-500 rounded-full"></div>
                              <span>{{ sub.name }}</span>
                              <span class="text-gray-400">{{ sub.code }}</span>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Step 3: Success -->
          @if (step() === 3) {
            <div class="text-center py-8">
              <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <lucide-angular name="check" [size]="40" class="text-green-600 dark:text-green-400"></lucide-angular>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Listo!</h3>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Cliente configurado con {{ getTotalPortfolios() }} carteras
              </p>
              <button (click)="viewPortfolios()"
                      class="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-bold hover:shadow-lg transition-all">
                Ver Carteras
              </button>
            </div>
          }
        </div>

        <!-- Footer -->
        @if (step() < 3) {
          <div class="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
            @if (step() === 1) {
              <button (click)="close()" class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Cancelar
              </button>
              <button (click)="nextStep()" [disabled]="!selectedTemplate()"
                      class="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all">
                Continuar
              </button>
            }
            @if (step() === 2) {
              <button (click)="previousStep()" class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Atrás
              </button>
              <button (click)="createAll()" [disabled]="!canCreate() || saving()"
                      class="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center gap-2">
                @if (saving()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creando...
                } @else {
                  <lucide-angular name="rocket" [size]="18"></lucide-angular>
                  Crear Todo
                }
              </button>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class SetupWizardComponent implements OnInit {
  step = signal(1);
  selectedTemplate = signal<QuickSetupTemplate | null>(null);
  saving = signal(false);

  tenantCode = '';
  tenantName = '';

  templates: QuickSetupTemplate[] = [
    {
      id: 'credito-consumo',
      name: 'Crédito de Consumo',
      description: 'Préstamos personales por tramos de mora',
      icon: 'credit-card',
      portfolios: [
        {
          code: 'CART-A',
          name: 'Cartera A (0-30 días)',
          type: 'PERSONAL_LOAN',
          subs: [
            { code: 'CART-A-R1', name: 'Región Norte' },
            { code: 'CART-A-R2', name: 'Región Sur' }
          ]
        },
        {
          code: 'CART-B',
          name: 'Cartera B (31-60 días)',
          type: 'PERSONAL_LOAN',
          subs: [
            { code: 'CART-B-R1', name: 'Región Norte' },
            { code: 'CART-B-R2', name: 'Región Sur' }
          ]
        },
        { code: 'CART-C', name: 'Cartera C (61+ días)', type: 'PERSONAL_LOAN' }
      ]
    },
    {
      id: 'tarjetas',
      name: 'Tarjetas de Crédito',
      description: 'Gestión de TC por nivel de riesgo',
      icon: 'wallet',
      portfolios: [
        { code: 'TC-BAJO', name: 'Riesgo Bajo', type: 'CREDIT_CARD' },
        { code: 'TC-MEDIO', name: 'Riesgo Medio', type: 'CREDIT_CARD' },
        { code: 'TC-ALTO', name: 'Riesgo Alto', type: 'CREDIT_CARD' }
      ]
    },
    {
      id: 'retail',
      name: 'Cobranza Retail',
      description: 'Créditos comerciales por categoría',
      icon: 'shopping-cart',
      portfolios: [
        {
          code: 'RET-VIG',
          name: 'Vigentes',
          type: 'RETAIL',
          subs: [
            { code: 'RET-VIG-A', name: 'Segmento A' },
            { code: 'RET-VIG-B', name: 'Segmento B' }
          ]
        },
        { code: 'RET-VEN', name: 'Vencidos', type: 'RETAIL' },
        { code: 'RET-JUD', name: 'Judiciales', type: 'RETAIL' }
      ]
    },
    {
      id: 'custom',
      name: 'Personalizado',
      description: 'Crear carteras manualmente',
      icon: 'settings',
      portfolios: []
    }
  ];

  constructor(
    private typificationService: TypificationService,
    private router: Router
  ) {}

  ngOnInit() {}

  selectTemplate(template: QuickSetupTemplate) {
    this.selectedTemplate.set(template);
  }

  nextStep() {
    if (this.selectedTemplate()?.id === 'custom') {
      // Redirigir a la gestión de carteras para configuración manual
      this.router.navigate(['/maintenance/portfolios']);
      return;
    }
    this.step.set(2);
  }

  previousStep() {
    this.step.set(1);
  }

  canCreate(): boolean {
    return !!(this.tenantCode.trim() && this.tenantName.trim() && this.selectedTemplate());
  }

  async createAll() {
    if (!this.canCreate()) return;

    this.saving.set(true);

    try {
      // Create tenant
      const tenant = await this.createTenant();

      // Create portfolios and sub-portfolios
      await this.createPortfoliosFromTemplate(tenant.id);

      this.saving.set(false);
      this.step.set(3);
    } catch (error) {
      console.error('Error creating setup:', error);
      this.saving.set(false);
      alert('Error al crear la configuración. Verifique que el código no esté duplicado.');
    }
  }

  private createTenant(): Promise<Tenant> {
    return new Promise((resolve, reject) => {
      this.typificationService.createTenant({
        tenantCode: this.tenantCode.trim(),
        tenantName: this.tenantName.trim(),
        countryCode: 'PER',
        timezone: 'America/Lima'
      }).subscribe({
        next: (tenant) => resolve(tenant),
        error: (error) => reject(error)
      });
    });
  }

  private async createPortfoliosFromTemplate(tenantId: number): Promise<void> {
    const template = this.selectedTemplate();
    if (!template) return;

    const portfolioMap = new Map<string, number>();

    // Create main portfolios first
    for (const portfolioData of template.portfolios) {
      const portfolio = await this.createPortfolio(tenantId, portfolioData);
      portfolioMap.set(portfolioData.code, portfolio.id);

      // Create sub-portfolios
      if (portfolioData.subs) {
        for (const sub of portfolioData.subs) {
          await this.createPortfolio(
            tenantId,
            { code: sub.code, name: sub.name, type: portfolioData.type },
            portfolio.id
          );
        }
      }
    }
  }

  private createPortfolio(
    tenantId: number,
    data: { code: string; name: string; type: string },
    parentId?: number
  ): Promise<Portfolio> {
    return new Promise((resolve, reject) => {
      this.typificationService.createPortfolio({
        tenantId,
        portfolioCode: data.code,
        portfolioName: data.name,
        parentPortfolioId: parentId
      }).subscribe({
        next: (portfolio) => resolve(portfolio),
        error: (error) => reject(error)
      });
    });
  }

  getTotalPortfolios(): number {
    const template = this.selectedTemplate();
    if (!template) return 0;

    let total = template.portfolios.length;
    template.portfolios.forEach(p => {
      if (p.subs) total += p.subs.length;
    });
    return total;
  }

  viewPortfolios() {
    this.router.navigate(['/maintenance/portfolios']);
  }

  close() {
    this.router.navigate(['/maintenance/portfolios']);
  }
}
