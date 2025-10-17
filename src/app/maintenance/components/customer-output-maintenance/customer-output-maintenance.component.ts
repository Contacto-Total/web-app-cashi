import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ThemeService } from '../../../shared/services/theme.service';
import { Tenant } from '../../models/tenant.model';
import { Portfolio } from '../../models/portfolio.model';
import { ClassificationService } from '../../services/classification.service';
import { CustomerOutputConfigService } from '../../services/customer-output-config.service';

/**
 * Representa un campo del cliente que puede mostrarse en la pantalla de gestión
 *
 * MAPEO CON BACKEND:
 * - Estos campos corresponden a las propiedades de la entidad Customer y sus relaciones:
 *   - Customer.java (com.cashi.customermanagement.domain.model.aggregates.Customer)
 *   - ContactInfo.java (com.cashi.customermanagement.domain.model.entities.ContactInfo)
 *   - DebtInfo.java (com.cashi.customermanagement.domain.model.entities.DebtInfo)
 *   - AccountInfo.java (com.cashi.customermanagement.domain.model.entities.AccountInfo)
 */
interface CustomerField {
  id: string;              // Identificador único del campo
  label: string;           // Etiqueta a mostrar en UI
  field: string;           // Path al campo en el objeto (ej: 'contactInfo.mobilePhone')
  category: 'personal' | 'contact' | 'debt' | 'account';  // Categoría para agrupar
  format?: 'text' | 'currency' | 'number' | 'date';       // Formato de visualización
  isVisible: boolean;      // Si se muestra o no en la pantalla de gestión
  displayOrder: number;    // Orden de visualización (menor = primero)
  highlight: boolean;      // Si se destaca visualmente (fondo, color, etc.)
  size?: 'small' | 'medium' | 'large' | 'full';  // Tamaño del campo en grid (1, 2, 3, 4 columnas)
}

/**
 * Configuración de outputs por tenant/portfolio
 *
 * BACKEND PENDIENTE:
 * Esta configuración debería guardarse en una nueva tabla:
 * - Tabla: customer_output_config
 * - Columnas:
 *   - id (Long, PK)
 *   - tenant_id (Long, FK a tenants)
 *   - portfolio_id (Long, FK a portfolios, nullable)
 *   - fields_config (JSON o Text - serializado de CustomerField[])
 *   - created_at, updated_at
 *
 * O bien, puede guardarse en el JSON de configuración del tenant:
 * - tenant-configurations/{tenant-code}.json
 * - Agregar sección: "customerOutputConfig": { "fields": [...] }
 */
interface CustomerOutputConfig {
  id?: number;
  tenantId: number;
  portfolioId?: number;
  fields: CustomerField[];
}

@Component({
  selector: 'app-customer-output-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './customer-output-maintenance.component.html',
  styleUrls: ['./customer-output-maintenance.component.scss']
})
export class CustomerOutputMaintenanceComponent implements OnInit {
  selectedTenantId?: number;
  selectedPortfolioId?: number;

  loading = signal(false);
  showSuccess = signal(false);

  tenants: Tenant[] = [];
  portfolios: Portfolio[] = [];

  /**
   * CAMPOS DISPONIBLES DEL CLIENTE
   *
   * IMPORTANTE: Estos campos están hardcodeados pero corresponden EXACTAMENTE a:
   *
   * 1. Customer.java (com.cashi.customermanagement.domain.model.aggregates.Customer):
   *    - documentCode → @Column(name = "codigo_documento")
   *    - fullName → @Column(name = "nombre_completo")
   *    - birthDate → @Column(name = "fecha_nacimiento")
   *    - age → @Column(name = "edad")
   *
   * 2. ContactInfo.java (com.cashi.customermanagement.domain.model.entities.ContactInfo):
   *    - mobilePhone → @Column(name = "telefono_celular")
   *    - primaryPhone → @Column(name = "telefono_principal")
   *    - alternativePhone → @Column(name = "telefono_alternativo")
   *    - workPhone → @Column(name = "telefono_trabajo")
   *    - email → @Column(name = "correo_electronico")
   *    - address → @Column(name = "direccion")
   *
   * 3. DebtInfo.java (com.cashi.customermanagement.domain.model.entities.DebtInfo):
   *    - currentDebt → @Column(name = "deuda_actual")
   *    - daysOverdue → @Column(name = "dias_mora")
   *    - capitalBalance → @Column(name = "saldo_capital")
   *    - overdueInterest → @Column(name = "interes_vencido")
   *    - accumulatedLateFees → @Column(name = "moras_acumuladas")
   *    - totalBalance → @Column(name = "saldo_total")
   *
   * 4. AccountInfo.java (com.cashi.customermanagement.domain.model.entities.AccountInfo):
   *    - accountNumber → @Column(name = "numero_cuenta")
   *    - productType → @Column(name = "tipo_producto")
   *    - disbursementDate → @Column(name = "fecha_desembolso")
   *    - originalAmount → @Column(name = "monto_original")
   *    - termMonths → @Column(name = "plazo_meses")
   *    - interestRate → @Column(name = "tasa_interes")
   *
   * ENDPOINT BACKEND RELACIONADO:
   * GET /api/v1/customers/{customerId} → CustomerController.getCustomerById()
   * Retorna: CustomerResource con toda esta información
   */
  availableFields: CustomerField[] = [
    // ============================================
    // DATOS PERSONALES (Customer.java)
    // ============================================
    {
      id: 'documentCode',
      label: 'DNI/Documento',
      field: 'documentCode',  // → Customer.documentCode
      category: 'personal',
      format: 'text',
      isVisible: true,
      displayOrder: 1,
      highlight: false,
      size: 'small'
    },
    {
      id: 'fullName',
      label: 'Nombre Completo',
      field: 'fullName',  // → Customer.fullName
      category: 'personal',
      format: 'text',
      isVisible: true,
      displayOrder: 2,
      highlight: false,
      size: 'small'
    },
    {
      id: 'birthDate',
      label: 'Fecha Nacimiento',
      field: 'birthDate',  // → Customer.birthDate
      category: 'personal',
      format: 'date',
      isVisible: false,
      displayOrder: 3,
      highlight: false,
      size: 'small'
    },
    {
      id: 'age',
      label: 'Edad',
      field: 'age',  // → Customer.age
      category: 'personal',
      format: 'number',
      isVisible: false,
      displayOrder: 4,
      highlight: false,
      size: 'small'
    },

    // ============================================
    // INFORMACIÓN DE CONTACTO (ContactInfo.java)
    // Relación: Customer.contactInfo (@OneToOne)
    // ============================================
    {
      id: 'mobilePhone',
      label: 'Celular',
      field: 'contactInfo.mobilePhone',  // → ContactInfo.mobilePhone
      category: 'contact',
      format: 'text',
      isVisible: true,
      displayOrder: 10,
      highlight: true  // Destacado porque es el contacto principal
    },
    {
      id: 'primaryPhone',
      label: 'Teléfono Principal',
      field: 'contactInfo.primaryPhone',  // → ContactInfo.primaryPhone
      category: 'contact',
      format: 'text',
      isVisible: true,
      displayOrder: 11,
      highlight: false,
      size: 'small'
    },
    {
      id: 'alternativePhone',
      label: 'Teléfono Alternativo',
      field: 'contactInfo.alternativePhone',  // → ContactInfo.alternativePhone
      category: 'contact',
      format: 'text',
      isVisible: false,
      displayOrder: 12,
      highlight: false,
      size: 'small'
    },
    {
      id: 'workPhone',
      label: 'Teléfono Trabajo',
      field: 'contactInfo.workPhone',  // → ContactInfo.workPhone
      category: 'contact',
      format: 'text',
      isVisible: false,
      displayOrder: 13,
      highlight: false,
      size: 'small'
    },
    {
      id: 'email',
      label: 'Email',
      field: 'contactInfo.email',  // → ContactInfo.email
      category: 'contact',
      format: 'text',
      isVisible: true,
      displayOrder: 14,
      highlight: false,
      size: 'small'
    },
    {
      id: 'address',
      label: 'Dirección',
      field: 'contactInfo.address',  // → ContactInfo.address
      category: 'contact',
      format: 'text',
      isVisible: false,
      displayOrder: 15,
      highlight: false,
      size: 'small'
    },

    // ============================================
    // INFORMACIÓN DE DEUDA (DebtInfo.java)
    // Relación: Customer.debtInfo (@OneToOne)
    // ============================================
    {
      id: 'currentDebt',
      label: 'Deuda Actual',
      field: 'debtInfo.currentDebt',  // → DebtInfo.currentDebt
      category: 'debt',
      format: 'currency',
      isVisible: true,
      displayOrder: 20,
      highlight: true  // Destacado porque es crítico para cobranza
    },
    {
      id: 'daysOverdue',
      label: 'Días de Mora',
      field: 'debtInfo.daysOverdue',  // → DebtInfo.daysOverdue
      category: 'debt',
      format: 'number',
      isVisible: true,
      displayOrder: 21,
      highlight: true  // Destacado porque es crítico para cobranza
    },
    {
      id: 'capitalBalance',
      label: 'Saldo Capital',
      field: 'debtInfo.capitalBalance',  // → DebtInfo.capitalBalance
      category: 'debt',
      format: 'currency',
      isVisible: false,
      displayOrder: 22,
      highlight: false,
      size: 'small'
    },
    {
      id: 'overdueInterest',
      label: 'Interés Vencido',
      field: 'debtInfo.overdueInterest',  // → DebtInfo.overdueInterest
      category: 'debt',
      format: 'currency',
      isVisible: false,
      displayOrder: 23,
      highlight: false,
      size: 'small'
    },
    {
      id: 'accumulatedLateFees',
      label: 'Moras Acumuladas',
      field: 'debtInfo.accumulatedLateFees',  // → DebtInfo.accumulatedLateFees
      category: 'debt',
      format: 'currency',
      isVisible: false,
      displayOrder: 24,
      highlight: false,
      size: 'small'
    },
    {
      id: 'totalBalance',
      label: 'Saldo Total',
      field: 'debtInfo.totalBalance',  // → DebtInfo.totalBalance
      category: 'debt',
      format: 'currency',
      isVisible: false,
      displayOrder: 25,
      highlight: false,
      size: 'small'
    },

    // ============================================
    // INFORMACIÓN DE CUENTA (AccountInfo.java)
    // Relación: Customer.accountInfo (@OneToOne)
    // ============================================
    {
      id: 'accountNumber',
      label: 'Número de Cuenta',
      field: 'accountInfo.accountNumber',  // → AccountInfo.accountNumber
      category: 'account',
      format: 'text',
      isVisible: true,
      displayOrder: 30,
      highlight: false,
      size: 'small'
    },
    {
      id: 'productType',
      label: 'Tipo de Producto',
      field: 'accountInfo.productType',  // → AccountInfo.productType
      category: 'account',
      format: 'text',
      isVisible: true,
      displayOrder: 31,
      highlight: false,
      size: 'small'
    },
    {
      id: 'disbursementDate',
      label: 'Fecha Desembolso',
      field: 'accountInfo.disbursementDate',  // → AccountInfo.disbursementDate
      category: 'account',
      format: 'date',
      isVisible: false,
      displayOrder: 32,
      highlight: false,
      size: 'small'
    },
    {
      id: 'originalAmount',
      label: 'Monto Original',
      field: 'accountInfo.originalAmount',  // → AccountInfo.originalAmount
      category: 'account',
      format: 'currency',
      isVisible: true,
      displayOrder: 33,
      highlight: false,
      size: 'small'
    },
    {
      id: 'termMonths',
      label: 'Plazo (meses)',
      field: 'accountInfo.termMonths',  // → AccountInfo.termMonths
      category: 'account',
      format: 'number',
      isVisible: false,
      displayOrder: 34,
      highlight: false,
      size: 'small'
    },
    {
      id: 'interestRate',
      label: 'Tasa de Interés',
      field: 'accountInfo.interestRate',  // → AccountInfo.interestRate
      category: 'account',
      format: 'number',
      isVisible: false,
      displayOrder: 35,
      highlight: false
    }
  ];

  constructor(
    private classificationService: ClassificationService,
    private customerOutputConfigService: CustomerOutputConfigService,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadTenants();
  }

  loadTenants() {
    this.classificationService.getAllTenants().subscribe({
      next: (data) => {
        this.tenants = data;
        if (data.length > 0) {
          this.selectedTenantId = data[0].id;
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
      this.loadConfiguration();
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
    this.loadConfiguration();
  }

  /**
   * Carga la configuración de outputs desde el backend
   *
   * ENDPOINT:
   * GET /api/v1/customer-outputs/config?tenantId={id}&portfolioId={id}
   *
   * LÓGICA:
   * 1. Llama al backend para obtener configuración guardada
   * 2. Si existe → parsea JSON y actualiza availableFields
   * 3. Si no existe (404) → usa valores por defecto de availableFields
   */
  loadConfiguration() {
    if (!this.selectedTenantId) return;

    this.loading.set(true);
    console.log('📥 Cargando configuración guardada...');

    this.customerOutputConfigService.getConfiguration(this.selectedTenantId, this.selectedPortfolioId)
      .subscribe({
        next: (response) => {
          console.log('✅ Configuración encontrada (ID: ' + response.id + ')');
          // Parsear JSON y actualizar availableFields
          try {
            const savedFields = JSON.parse(response.fieldsConfig);
            this.availableFields = savedFields;
            console.log('   → ' + this.availableFields.length + ' campos cargados');
          } catch (error) {
            console.error('❌ Error parseando fieldsConfig:', error);
          }
          this.loading.set(false);
        },
        error: (error) => {
          if (error.status === 404) {
            console.log('⚠️ No hay configuración guardada. Usando valores por defecto.');
          } else {
            console.error('❌ Error cargando configuración:', error);
          }
          this.loading.set(false);
          // Mantener valores por defecto de availableFields
        }
      });
  }

  getFieldsByCategory(category: string): CustomerField[] {
    return this.availableFields
      .filter(f => f.category === category)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getVisibleFields(): CustomerField[] {
    return this.availableFields
      .filter(f => f.isVisible)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  toggleFieldVisibility(field: CustomerField) {
    field.isVisible = !field.isVisible;
  }

  toggleFieldHighlight(field: CustomerField) {
    field.highlight = !field.highlight;
  }

  moveFieldUp(field: CustomerField, fields: CustomerField[], index: number) {
    if (index === 0) return;
    [fields[index - 1], fields[index]] = [fields[index], fields[index - 1]];
    this.reorderFields(fields);
  }

  moveFieldDown(field: CustomerField, fields: CustomerField[], index: number) {
    if (index === fields.length - 1) return;
    [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
    this.reorderFields(fields);
  }

  private reorderFields(fields: CustomerField[]) {
    fields.forEach((field, index) => {
      field.displayOrder = index * 10;
    });
  }

  /**
   * Guarda la configuración de outputs en el backend
   *
   * ENDPOINT:
   * POST /api/v1/customer-outputs/config
   *
   * LÓGICA:
   * 1. Serializa availableFields a JSON
   * 2. Envía al backend
   * 3. Backend decide si crear nueva o actualizar existente
   */
  saveConfiguration() {
    if (!this.selectedTenantId) {
      console.error('❌ No hay tenant seleccionado');
      return;
    }

    this.loading.set(true);
    console.log('💾 Guardando configuración...');

    // Serializar fields a JSON
    const fieldsConfig = JSON.stringify(this.availableFields);

    const request = {
      tenantId: this.selectedTenantId,
      portfolioId: this.selectedPortfolioId,
      fieldsConfig
    };

    this.customerOutputConfigService.saveConfiguration(request)
      .subscribe({
        next: (response) => {
          console.log('✅ Configuración guardada exitosamente (ID: ' + response.id + ')');
          this.loading.set(false);
          this.showSuccessMessage();
        },
        error: (error) => {
          console.error('❌ Error guardando configuración:', error);
          this.loading.set(false);
          alert('Error al guardar la configuración. Revisa la consola para más detalles.');
        }
      });
  }

  showSuccessMessage() {
    this.showSuccess.set(true);
    setTimeout(() => this.showSuccess.set(false), 3000);
  }

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      personal: 'Datos Personales',
      contact: 'Información de Contacto',
      debt: 'Información de Deuda',
      account: 'Información de Cuenta'
    };
    return labels[category] || category;
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      personal: 'user',
      contact: 'phone',
      debt: 'alert-circle',
      account: 'credit-card'
    };
    return icons[category] || 'circle';
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      personal: 'blue',
      contact: 'green',
      debt: 'red',
      account: 'purple'
    };
    return colors[category] || 'gray';
  }
}
