import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {
  CustomerDisplayService,
  CustomerDisplayConfig,
  CustomerData,
  DisplaySection,
  DisplayField
} from '../../services/customer-display.service';

@Component({
  selector: 'app-customer-info-display',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="customer-info-container" *ngIf="customerData()">
      <div class="customer-header">
        <div class="customer-title">
          <lucide-angular name="user" [size]="24" class="title-icon"></lucide-angular>
          <h2>{{ displayConfig()?.title || 'Información del Cliente' }}</h2>
        </div>
        <div class="customer-status" [class.active]="customerData()?.status === 'ACTIVO'">
          {{ customerData()?.status }}
        </div>
      </div>

      <div class="sections-container">
        <div
          *ngFor="let section of displayConfig()?.sections"
          class="info-section"
          [class.danger]="section.colorClass === 'danger'"
          [class.warning]="section.colorClass === 'warning'"
          [class.success]="section.colorClass === 'success'">

          <h3 class="section-title">{{ section.sectionTitle }}</h3>

          <div class="fields-grid">
            <div
              *ngFor="let field of getSortedFields(section.fields)"
              class="field-item"
              [class.highlight]="field.highlight">

              <label class="field-label">{{ field.label }}</label>
              <div class="field-value">
                {{ getFieldValue(field) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="no-data" *ngIf="!customerData()">
      <lucide-angular name="user-x" [size]="48" class="no-data-icon"></lucide-angular>
      <p>No hay información del cliente disponible</p>
    </div>
  `,
  styles: [`
    .customer-info-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .customer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .customer-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .customer-title h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .title-icon {
      color: white;
    }

    .customer-status {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
    }

    .customer-status.active {
      background: rgba(16, 185, 129, 0.9);
    }

    .sections-container {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .info-section {
      background: #f8fafc;
      border-radius: 8px;
      padding: 1.25rem;
      border-left: 4px solid #667eea;
    }

    .info-section.danger {
      border-left-color: #ef4444;
      background: #fef2f2;
    }

    .info-section.warning {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }

    .info-section.success {
      border-left-color: #10b981;
      background: #f0fdf4;
    }

    .section-title {
      margin: 0 0 1rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }

    .fields-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .field-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .field-item.highlight {
      background: white;
      padding: 0.75rem;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .field-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
    }

    .field-value {
      font-size: 1rem;
      font-weight: 500;
      color: #1e293b;
    }

    .field-item.highlight .field-value {
      font-size: 1.125rem;
      font-weight: 600;
      color: #667eea;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      background: #f8fafc;
      border-radius: 12px;
      border: 2px dashed #cbd5e1;
    }

    .no-data-icon {
      color: #94a3b8;
      margin-bottom: 1rem;
    }

    .no-data p {
      margin: 0;
      color: #64748b;
      font-size: 1rem;
    }
  `]
})
export class CustomerInfoDisplayComponent implements OnInit {
  private customerDisplayService = inject(CustomerDisplayService);

  @Input() customerId?: string;
  @Input() documentCode?: string;
  @Input() tenantId?: number;
  @Input() tenantCode: string = 'FIN-OH';

  customerData = signal<CustomerData | null>(null);
  displayConfig = signal<CustomerDisplayConfig | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadDisplayConfig();
    if (this.customerId) {
      this.loadCustomerById(this.customerId);
    } else if (this.documentCode && this.tenantId) {
      this.loadCustomerByDocument(this.tenantId, this.documentCode);
    }
  }

  private loadDisplayConfig() {
    this.customerDisplayService.getDisplayConfig(this.tenantCode).subscribe({
      next: (config) => {
        this.displayConfig.set(config);
        console.log('✅ Configuración de visualización cargada:', config);
      },
      error: (err) => {
        console.error('❌ Error cargando configuración:', err);
        // Usar configuración por defecto si falla
        this.displayConfig.set(this.getDefaultConfig());
      }
    });
  }

  private loadCustomerById(customerId: string) {
    this.loading.set(true);
    this.customerDisplayService.getCustomerById(customerId).subscribe({
      next: (data) => {
        this.customerData.set(data);
        this.loading.set(false);
        console.log('✅ Datos del cliente cargados:', data);
      },
      error: (err) => {
        this.error.set('Error al cargar datos del cliente');
        this.loading.set(false);
        console.error('❌ Error:', err);
      }
    });
  }

  private loadCustomerByDocument(tenantId: number, documentCode: string) {
    this.loading.set(true);
    this.customerDisplayService.getCustomerByDocumentCode(tenantId, documentCode).subscribe({
      next: (data) => {
        this.customerData.set(data);
        this.loading.set(false);
        console.log('✅ Datos del cliente cargados:', data);
      },
      error: (err) => {
        this.error.set('Error al cargar datos del cliente');
        this.loading.set(false);
        console.error('❌ Error:', err);
      }
    });
  }

  getSortedFields(fields: DisplayField[]): DisplayField[] {
    return [...fields].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getFieldValue(field: DisplayField): string {
    const customer = this.customerData();
    if (!customer) return '-';

    // Mapear campos a sus ubicaciones en el objeto
    const fieldMap: { [key: string]: string } = {
      documentCode: 'documentCode',
      fullName: 'fullName',
      email: 'contactInfo.email',
      mobilePhone: 'contactInfo.mobilePhone',
      primaryPhone: 'contactInfo.primaryPhone',
      alternativePhone: 'contactInfo.alternativePhone',
      address: 'contactInfo.address',
      currentDebt: 'debtInfo.currentDebt',
      daysOverdue: 'debtInfo.daysOverdue',
      accountNumber: 'accountInfo.accountNumber',
      productType: 'accountInfo.productType',
      originalAmount: 'accountInfo.originalAmount',
      disbursementDate: 'accountInfo.disbursementDate',
      termMonths: 'accountInfo.termMonths'
    };

    const path = fieldMap[field.field];
    if (!path) return '-';

    const value = this.customerDisplayService.getNestedValue(customer, path);
    return this.customerDisplayService.formatValue(value, field.format);
  }

  private getDefaultConfig(): CustomerDisplayConfig {
    return {
      title: 'Información del Cliente',
      sections: [
        {
          sectionTitle: 'Datos Personales',
          fields: [
            { field: 'documentCode', label: 'DNI/Documento', displayOrder: 1 },
            { field: 'fullName', label: 'Nombre Completo', displayOrder: 2 }
          ]
        }
      ]
    };
  }
}
