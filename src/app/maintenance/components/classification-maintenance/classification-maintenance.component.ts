import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ClassificationService } from '../../services/classification.service';
import { ThemeService } from '../../../shared/services/theme.service';
import {
  ClassificationCatalog,
  TenantClassificationConfig,
  ClassificationType,
  ClassificationTreeNode
} from '../../models/classification.model';
import { Portfolio } from '../../models/portfolio.model';
import { Tenant } from '../../models/tenant.model';
import { PortfolioFormDialogComponent } from '../portfolio-form-dialog/portfolio-form-dialog.component';
import { ClassificationFormDialogComponent } from '../classification-form-dialog/classification-form-dialog.component';

@Component({
  selector: 'app-classification-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PortfolioFormDialogComponent, ClassificationFormDialogComponent],
  templateUrl: './classification-maintenance.component.html',
  styleUrls: ['./classification-maintenance.component.scss']
})
export class ClassificationMaintenanceComponent implements OnInit {
  selectedTenantId?: number;
  selectedPortfolioId?: number;
  selectedType?: ClassificationType;

  loading = signal(false);
  showSuccess = signal(false);
  showPortfolioDialog = signal(false);
  showClassificationDialog = signal(false);
  classificationDialogMode = signal<'create' | 'edit'>('create');
  selectedClassificationForEdit = signal<ClassificationCatalog | undefined>(undefined);
  parentClassificationForCreate = signal<ClassificationCatalog | undefined>(undefined);

  classificationTypes = Object.values(ClassificationType);
  classifications: ClassificationCatalog[] = [];
  tenantConfigs: TenantClassificationConfig[] = [];
  treeNodes: ClassificationTreeNode[] = [];
  expandedNodes = new Set<number>();
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
    this.selectedPortfolioId = undefined;
    this.portfolios = [];
    this.classifications = [];
    this.treeNodes = [];

    if (this.selectedTenantId) {
      this.loadPortfolios();
      this.loadClassifications();
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

  loadClassifications() {
    if (!this.selectedTenantId) return;

    this.loading.set(true);

    const request$ = this.selectedType
      ? this.classificationService.getClassificationsByType(this.selectedType)
      : this.classificationService.getAllClassifications();

    request$.subscribe({
      next: (data) => {
        this.classifications = data;
        this.loadTenantConfigs();
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error loading classifications:', error);
      }
    });
  }

  loadTenantConfigs() {
    if (!this.selectedTenantId) return;

    const request$ = this.selectedType
      ? this.classificationService.getTenantClassificationsByType(
          this.selectedTenantId,
          this.selectedType,
          this.selectedPortfolioId
        )
      : this.classificationService.getTenantClassifications(
          this.selectedTenantId,
          this.selectedPortfolioId
        );

    request$.subscribe({
      next: (configs) => {
        this.tenantConfigs = configs;
        this.buildTree();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading tenant configs:', error);
        this.buildTree();
        this.loading.set(false);
      }
    });
  }

  buildTree() {
    const configMap = new Map<number, TenantClassificationConfig>();
    this.tenantConfigs.forEach(config => {
      configMap.set(config.classificationId, config);
    });

    const nodeMap = new Map<number, ClassificationTreeNode>();

    this.classifications.forEach(classification => {
      const node: ClassificationTreeNode = {
        classification,
        config: configMap.get(classification.id),
        children: [],
        level: classification.hierarchyLevel
      };
      nodeMap.set(classification.id, node);
    });

    const roots: ClassificationTreeNode[] = [];

    this.classifications.forEach(classification => {
      const node = nodeMap.get(classification.id)!;
      if (classification.parentClassificationId) {
        const parent = nodeMap.get(classification.parentClassificationId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    const sortNodes = (nodes: ClassificationTreeNode[]) => {
      nodes.sort((a, b) => {
        const orderA = a.classification.displayOrder || 0;
        const orderB = b.classification.displayOrder || 0;
        return orderA - orderB;
      });
      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(roots);
    this.treeNodes = roots;
    this.expandAll();
  }

  toggleNode(nodeId: number) {
    if (this.expandedNodes.has(nodeId)) {
      this.expandedNodes.delete(nodeId);
    } else {
      this.expandedNodes.add(nodeId);
    }
  }

  isExpanded(nodeId: number): boolean {
    return this.expandedNodes.has(nodeId);
  }

  expandAll() {
    this.classifications.forEach(c => this.expandedNodes.add(c.id));
  }

  collapseAll() {
    this.expandedNodes.clear();
  }

  onTypeChange() {
    this.loadClassifications();
  }

  onPortfolioChange() {
    this.loadTenantConfigs();
  }

  toggleClassification(node: ClassificationTreeNode, event: Event) {
    if (!this.selectedTenantId) return;

    const target = event.target as HTMLInputElement;
    const enabled = target.checked;

    const action$ = enabled
      ? this.classificationService.enableClassification(
          this.selectedTenantId,
          node.classification.id,
          this.selectedPortfolioId
        )
      : this.classificationService.disableClassification(
          this.selectedTenantId,
          node.classification.id,
          this.selectedPortfolioId
        );

    action$.subscribe({
      next: () => {
        this.showSuccessMessage();
        this.loadTenantConfigs();
      },
      error: (error) => {
        console.error('Error toggling classification:', error);
        target.checked = !enabled;
      }
    });
  }

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }

  openCreatePortfolioDialog() {
    this.showPortfolioDialog.set(true);
  }

  closePortfolioDialog() {
    this.showPortfolioDialog.set(false);
  }

  onPortfolioCreated(portfolio: Portfolio) {
    this.showPortfolioDialog.set(false);
    this.showSuccessMessage();
    // Reload portfolios to include the newly created one
    this.loadPortfolios();
  }

  getSelectedTenant(): Tenant | undefined {
    return this.tenants.find(t => t.id === this.selectedTenantId);
  }

  // Classification dialog methods
  openCreateRootDialog() {
    this.classificationDialogMode.set('create');
    this.selectedClassificationForEdit.set(undefined);
    this.parentClassificationForCreate.set(undefined);
    this.showClassificationDialog.set(true);
  }

  openCreateChildDialog(parent: ClassificationCatalog) {
    this.classificationDialogMode.set('create');
    this.selectedClassificationForEdit.set(undefined);
    this.parentClassificationForCreate.set(parent);
    this.showClassificationDialog.set(true);
  }

  openEditDialog(classification: ClassificationCatalog) {
    this.classificationDialogMode.set('edit');
    this.selectedClassificationForEdit.set(classification);
    this.parentClassificationForCreate.set(undefined);
    this.showClassificationDialog.set(true);
  }

  closeClassificationDialog() {
    this.showClassificationDialog.set(false);
    this.selectedClassificationForEdit.set(undefined);
    this.parentClassificationForCreate.set(undefined);
  }

  onClassificationSaved(classification: ClassificationCatalog) {
    this.showClassificationDialog.set(false);
    this.selectedClassificationForEdit.set(undefined);
    this.parentClassificationForCreate.set(undefined);
    this.showSuccessMessage();
    this.loadClassifications();
  }

  deleteClassification(classification: ClassificationCatalog) {
    if (classification.isSystem) {
      alert('No se pueden eliminar tipificaciones del sistema');
      return;
    }

    if (!confirm(`¿Está seguro de eliminar la tipificación "${classification.name}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    this.classificationService.deleteClassification(classification.id).subscribe({
      next: () => {
        this.showSuccessMessage();
        this.loadClassifications();
      },
      error: (error) => {
        console.error('Error al eliminar tipificación:', error);
        alert('Error al eliminar la tipificación. Puede que tenga dependencias.');
      }
    });
  }

  showSuccessMessage() {
    this.showSuccess.set(true);
    setTimeout(() => this.showSuccess.set(false), 3000);
  }

  getTypeLabel(type: ClassificationType): string {
    const labels: Record<ClassificationType, string> = {
      [ClassificationType.CONTACT_RESULT]: 'Resultado de Contacto',
      [ClassificationType.MANAGEMENT_TYPE]: 'Tipo de Gestión',
      [ClassificationType.PAYMENT_TYPE]: 'Tipo de Pago',
      [ClassificationType.COMPLAINT_TYPE]: 'Tipo de Reclamo',
      [ClassificationType.CUSTOM]: 'Personalizado'
    };
    return labels[type];
  }
}
