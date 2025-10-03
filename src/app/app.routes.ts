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
    path: '**',
    redirectTo: '/collection-management'
  }
];
