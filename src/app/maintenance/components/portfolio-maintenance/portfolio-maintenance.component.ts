import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ClassificationService } from '../../services/classification.service';
import { ThemeService } from '../../../shared/services/theme.service';
import { Portfolio } from '../../models/portfolio.model';
import { Tenant } from '../../models/tenant.model';
import { PortfolioFormDialogComponent } from '../portfolio-form-dialog/portfolio-form-dialog.component';

@Component({
  selector: 'app-portfolio-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PortfolioFormDialogComponent],
  templateUrl: './portfolio-maintenance.component.html',
  styleUrls: ['./portfolio-maintenance.component.scss']
})
export class PortfolioMaintenanceComponent implements OnInit {
  selectedTenantId?: number;

  loading = signal(false);
  showSuccess = signal(false);
  showPortfolioDialog = signal(false);
  portfolioDialogMode = signal<'create' | 'edit'>('create');
  selectedPortfolioForEdit = signal<Portfolio | undefined>(undefined);

  tenants: Tenant[] = [];
  portfolios: Portfolio[] = [];

  constructor(
    private classificationService: ClassificationService,
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
    this.portfolios = [];
    if (this.selectedTenantId) {
      this.loadPortfolios();
    }
  }

  loadPortfolios() {
    if (!this.selectedTenantId) return;

    this.loading.set(true);

    this.classificationService.getPortfoliosByTenant(this.selectedTenantId).subscribe({
      next: (data) => {
        this.portfolios = data;
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error loading portfolios:', error);
      }
    });
  }

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }

  openCreateDialog() {
    this.portfolioDialogMode.set('create');
    this.selectedPortfolioForEdit.set(undefined);
    this.showPortfolioDialog.set(true);
  }

  openEditDialog(portfolio: Portfolio) {
    this.portfolioDialogMode.set('edit');
    this.selectedPortfolioForEdit.set(portfolio);
    this.showPortfolioDialog.set(true);
  }

  closePortfolioDialog() {
    this.showPortfolioDialog.set(false);
    this.selectedPortfolioForEdit.set(undefined);
  }

  onPortfolioSaved(portfolio: Portfolio) {
    this.showPortfolioDialog.set(false);
    this.selectedPortfolioForEdit.set(undefined);
    this.showSuccessMessage();
    this.loadPortfolios();
  }

  deletePortfolio(portfolio: Portfolio) {
    if (!confirm(`¿Está seguro de eliminar la cartera "${portfolio.portfolioName}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    // TODO: Implementar endpoint de eliminación en el backend
    console.warn('Delete portfolio not implemented in backend yet:', portfolio);
    alert('⚠️ Funcionalidad pendiente:\n\nEl endpoint DELETE /api/portfolios/{id} aún no está implementado en el backend.');
  }

  showSuccessMessage() {
    this.showSuccess.set(true);
    setTimeout(() => this.showSuccess.set(false), 3000);
  }

  getSelectedTenant(): Tenant | undefined {
    return this.tenants.find(t => t.id === this.selectedTenantId);
  }
}
