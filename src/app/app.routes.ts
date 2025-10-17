import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/collection-management',
    pathMatch: 'full'
  },
  {
    path: 'collection-management',
    loadComponent: () => import('./collection-management/pages/collection-management.page').then(m => m.CollectionManagementPage)
  },
  {
    path: 'maintenance/classifications',
    loadComponent: () => import('./maintenance/components/classification-maintenance/classification-maintenance.component').then(m => m.ClassificationMaintenanceComponent)
  },
  {
    path: 'maintenance/portfolios',
    loadComponent: () => import('./maintenance/components/portfolio-maintenance/portfolio-maintenance.component').then(m => m.PortfolioMaintenanceComponent)
  },
  {
    path: 'maintenance/customer-outputs',
    loadComponent: () => import('./maintenance/components/customer-output-maintenance/customer-output-maintenance.component').then(m => m.CustomerOutputMaintenanceComponent)
  },
  {
    path: '**',
    redirectTo: '/collection-management'
  }
];
