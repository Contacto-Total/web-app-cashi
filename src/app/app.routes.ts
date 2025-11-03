import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/webphone',
    pathMatch: 'full'
  },
  {
    path: 'webphone',
    loadComponent: () => import('./collection-management/pages/webphone.page').then(m => m.WebphonePage)
  },
  {
    path: 'collection-management',
    loadComponent: () => import('./collection-management/pages/collection-management.page').then(m => m.CollectionManagementPage)
  },
  {
    path: 'maintenance/typifications',
    loadComponent: () => import('./maintenance/components/typification-maintenance/typification-maintenance.component').then(m => m.TypificationMaintenanceComponent)
  },
  {
    path: 'maintenance/setup-wizard',
    loadComponent: () => import('./maintenance/components/setup-wizard/setup-wizard.component').then(m => m.SetupWizardComponent)
  },
  {
    path: 'maintenance/tenants',
    loadComponent: () => import('./maintenance/components/tenant-maintenance/tenant-maintenance.component').then(m => m.TenantMaintenanceComponent)
  },
  {
    path: 'maintenance/portfolios',
    loadComponent: () => import('./maintenance/components/portfolio-maintenance/portfolio-maintenance.component').then(m => m.PortfolioMaintenanceComponent)
  },
  {
    path: 'maintenance/subportfolios',
    loadComponent: () => import('./maintenance/components/subportfolio-maintenance/subportfolio-maintenance.component').then(m => m.SubPortfolioMaintenanceComponent)
  },
  {
    path: 'maintenance/customer-outputs',
    loadComponent: () => import('./maintenance/components/customer-output-maintenance/customer-output-maintenance.component').then(m => m.CustomerOutputMaintenanceComponent)
  },
  {
    path: 'maintenance/header-configuration',
    loadComponent: () => import('./maintenance/components/header-configuration/header-configuration.component').then(m => m.HeaderConfigurationComponent)
  },
  {
    path: 'maintenance/blacklist',
    loadComponent: () => import('./maintenance/components/blacklist-maintenance/blacklist-maintenance.component').then(m => m.BlacklistMaintenanceComponent)
  },
  {
    path: 'maintenance/roles',
    loadComponent: () => import('./maintenance/components/roles-management/roles-management.component').then(m => m.RolesManagementComponent)
  },
  {
    path: 'maintenance/users',
    loadComponent: () => import('./maintenance/components/user-management/user-management.component').then(m => m.UserManagementComponent)
  },
  {
    path: 'data-load/initial',
    loadComponent: () => import('./data-load/components/initial-load/initial-load.component').then(m => m.InitialLoadComponent)
  },
  {
    path: 'data-load/daily',
    loadComponent: () => import('./data-load/components/daily-load/daily-load.component').then(m => m.DailyLoadComponent)
  },
  {
    path: 'customers',
    loadComponent: () => import('./customers/components/customer-view/customer-view.component').then(m => m.CustomerViewComponent)
  },
  {
    path: 'testing/google-drive',
    loadComponent: () => import('./testing/components/google-drive-test.component').then(m => m.GoogleDriveTestComponent)
  },
  {
    path: '**',
    redirectTo: '/collection-management'
  }
];
