import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TypificationService } from '../../services/typification.service';
import { ThemeService } from '../../../shared/services/theme.service';
import {
  TypificationCatalog,
  TenantTypificationConfig,
  ClassificationType,
  TypificationTreeNode
} from '../../models/typification.model';
import { Portfolio } from '../../models/portfolio.model';
import { Tenant } from '../../models/tenant.model';
import { TypificationFormDialogComponent } from '../typification-form-dialog/typification-form-dialog.component';
import { CategoryFormDialogComponent } from '../category-form-dialog/category-form-dialog.component';

@Component({
  selector: 'app-typification-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TypificationFormDialogComponent, CategoryFormDialogComponent],
  templateUrl: './typification-maintenance.component.html',
  styleUrls: ['./typification-maintenance.component.scss']
})
export class TypificationMaintenanceComponent implements OnInit {
  selectedTenantId?: number;
  selectedPortfolioId?: number;
  selectedType?: ClassificationType;

  loading = signal(false);
  showSuccess = signal(false);
  showClassificationDialog = signal(false);
  showCategoryDialog = signal(false);
  classificationDialogMode = signal<'create' | 'edit'>('create');
  selectedClassificationForEdit = signal<TypificationCatalog | undefined>(undefined);
  parentClassificationForCreate = signal<TypificationCatalog | undefined>(undefined);

  classificationTypes = Object.values(ClassificationType);
  typifications: TypificationCatalog[] = [];
  tenantConfigs: TenantTypificationConfig[] = [];
  treeNodes: TypificationTreeNode[] = [];
  expandedNodes = new Set<number>();
  tenants: Tenant[] = [];
  portfolios: Portfolio[] = [];

  constructor(
    private classificationService: TypificationService,
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
    this.typifications = [];
    this.treeNodes = [];

    if (this.selectedTenantId) {
      this.loadPortfolios();
      this.loadTypifications();
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

  loadTypifications() {
    if (!this.selectedTenantId) return;

    this.loading.set(true);

    // Load ALL tenant configurations (including disabled) for maintenance view
    const request$ = this.selectedType
      ? this.classificationService.getTenantClassificationsByType(
          this.selectedTenantId,
          this.selectedType,
          this.selectedPortfolioId
        )
      : this.classificationService.getTenantClassifications(
          this.selectedTenantId,
          this.selectedPortfolioId,
          true // includeDisabled = true for maintenance view
        );

    request$.subscribe({
      next: (configs) => {
        this.tenantConfigs = configs;
        // Extract typifications from tenant configs
        this.typifications = configs.map(config => config.typification);
        this.buildTree();
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error loading typifications:', error);
      }
    });
  }

  loadTenantConfigs() {
    // This method is now redundant, keeping for backward compatibility
    // but it's no longer called
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
    const configMap = new Map<number, TenantTypificationConfig>();
    this.tenantConfigs.forEach(config => {
      configMap.set(config.typificationId, config);
    });

    const nodeMap = new Map<number, TypificationTreeNode>();

    this.typifications.forEach(typification => {
      const node: TypificationTreeNode = {
        typification,
        config: configMap.get(typification.id),
        children: [],
        level: typification.hierarchyLevel
      };
      nodeMap.set(typification.id, node);
    });

    const roots: TypificationTreeNode[] = [];

    this.typifications.forEach(typification => {
      const node = nodeMap.get(typification.id)!;
      if (typification.parentTypificationId) {
        const parent = nodeMap.get(typification.parentTypificationId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    const sortNodes = (nodes: TypificationTreeNode[]) => {
      nodes.sort((a, b) => {
        const orderA = a.typification.displayOrder || 0;
        const orderB = b.typification.displayOrder || 0;
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
    this.typifications.forEach(c => this.expandedNodes.add(c.id));
  }

  collapseAll() {
    this.expandedNodes.clear();
  }

  onTypeChange() {
    this.loadTypifications();
  }

  onPortfolioChange() {
    this.loadTypifications();
  }

  toggleTypification(node: TypificationTreeNode, event: Event) {
    if (!this.selectedTenantId) return;

    const target = event.target as HTMLInputElement;
    const enabled = target.checked;

    const action$ = enabled
      ? this.classificationService.enableClassification(
          this.selectedTenantId,
          node.typification.id,
          this.selectedPortfolioId
        )
      : this.classificationService.disableClassification(
          this.selectedTenantId,
          node.typification.id,
          this.selectedPortfolioId
        );

    action$.subscribe({
      next: () => {
        this.showSuccessMessage();
        this.loadTypifications();
      },
      error: (error) => {
        console.error('Error toggling typification:', error);
        target.checked = !enabled;
      }
    });
  }

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }

  // Classification dialog methods
  openCreateRootDialog() {
    this.classificationDialogMode.set('create');
    this.selectedClassificationForEdit.set(undefined);
    this.parentClassificationForCreate.set(undefined);
    this.showClassificationDialog.set(true);
  }

  openCreateChildDialog(parent: TypificationCatalog) {
    this.classificationDialogMode.set('create');
    this.selectedClassificationForEdit.set(undefined);
    this.parentClassificationForCreate.set(parent);
    this.showClassificationDialog.set(true);
  }

  openEditDialog(typification: TypificationCatalog) {
    this.classificationDialogMode.set('edit');
    this.selectedClassificationForEdit.set(typification);
    this.parentClassificationForCreate.set(undefined);
    this.showClassificationDialog.set(true);
  }

  closeClassificationDialog() {
    this.showClassificationDialog.set(false);
    this.selectedClassificationForEdit.set(undefined);
    this.parentClassificationForCreate.set(undefined);
  }

  onClassificationSaved(typification: TypificationCatalog) {
    this.showClassificationDialog.set(false);
    this.selectedClassificationForEdit.set(undefined);
    this.parentClassificationForCreate.set(undefined);
    this.showSuccessMessage();
    this.loadTypifications();
  }

  deleteTypification(typification: TypificationCatalog) {
    if (typification.isSystem) {
      alert('No se pueden eliminar tipificaciones del sistema');
      return;
    }

    if (!confirm(`¿Está seguro de eliminar la tipificación "${typification.name}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    this.classificationService.deleteTypification(typification.id).subscribe({
      next: () => {
        this.showSuccessMessage();
        this.loadTypifications();
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

  // Category dialog methods
  openCreateCategoryDialog() {
    this.showCategoryDialog.set(true);
  }

  closeCategoryDialog() {
    this.showCategoryDialog.set(false);
  }

  onCategorySaved(categoryName: string) {
    this.showCategoryDialog.set(false);
    this.showSuccessMessage();
    // Reload typification types
    this.classificationTypes = Object.values(ClassificationType);
  }

  getTypeLabel(type: ClassificationType): string {
    const labels: Record<ClassificationType, string> = {
      [ClassificationType.CONTACT_RESULT]: 'Resultado de Contacto',
      [ClassificationType.MANAGEMENT_TYPE]: 'Tipo de Gestión',
      [ClassificationType.PAYMENT_TYPE]: 'Tipo de Pago',
      [ClassificationType.COMPLAINT_TYPE]: 'Tipo de Reclamo',
      [ClassificationType.PAYMENT_SCHEDULE]: 'Cronograma de Pagos',
      [ClassificationType.CUSTOM]: 'Personalizado'
    };
    return labels[type];
  }

  /**
   * Mueve un nodo hacia arriba en el orden
   */
  moveUp(node: TypificationTreeNode, siblings: TypificationTreeNode[], index: number, parent: TypificationTreeNode | null) {
    if (index === 0) return; // Ya está al inicio

    // Intercambiar posiciones en el array
    [siblings[index - 1], siblings[index]] = [siblings[index], siblings[index - 1]];

    // Actualizar displayOrder en el backend
    this.updateOrder(siblings);
  }

  /**
   * Mueve un nodo hacia abajo en el orden
   */
  moveDown(node: TypificationTreeNode, siblings: TypificationTreeNode[], index: number, parent: TypificationTreeNode | null) {
    if (index === siblings.length - 1) return; // Ya está al final

    // Intercambiar posiciones en el array
    [siblings[index], siblings[index + 1]] = [siblings[index + 1], siblings[index]];

    // Actualizar displayOrder en el backend
    this.updateOrder(siblings);
  }

  /**
   * Actualiza el orden de los nodos en el backend
   */
  private updateOrder(siblings: TypificationTreeNode[]) {
    // Actualizar displayOrder (espaciado de 10 para permitir inserciones futuras)
    const updates = siblings.map((node, index) => ({
      id: node.typification.id,
      displayOrder: index * 10
    }));

    // Guardar en el backend
    this.classificationService.updateDisplayOrder(updates).subscribe({
      next: () => {
        this.showSuccessMessage();
      },
      error: (error) => {
        console.error('Error al actualizar orden:', error);
        // Recargar para revertir cambios visuales
        this.loadTypifications();
      }
    });
  }
}
