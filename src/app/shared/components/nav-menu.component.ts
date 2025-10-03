import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar color="primary" class="nav-toolbar">
      <span class="app-name">CASHI</span>

      <div class="nav-links">
        <button mat-button routerLink="/collection-management" routerLinkActive="active">
          <mat-icon>assignment</mat-icon>
          Gestión
        </button>

        <button mat-button [matMenuTriggerFor]="maintenanceMenu">
          <mat-icon>settings</mat-icon>
          Mantenimiento
        </button>
      </div>

      <mat-menu #maintenanceMenu="matMenu">
        <button mat-menu-item routerLink="/maintenance/classifications">
          <mat-icon>category</mat-icon>
          Tipificaciones
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .nav-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      display: flex;
      gap: 20px;
    }

    .app-name {
      font-weight: bold;
      font-size: 20px;
    }

    .nav-links {
      display: flex;
      gap: 8px;
      flex: 1;
    }

    button.active {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class NavMenuComponent {}
