import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { FileSystemService, FolderInfo } from '../../services/file-system.service';

@Component({
  selector: 'app-folder-browser-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- Overlay -->
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
         (click)="onClose()">

      <!-- Modal -->
      <div class="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-slate-700"
           (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <lucide-angular name="folder-tree" [size]="24" class="text-blue-400"></lucide-angular>
            <div>
              <h2 class="text-lg font-bold text-white">Seleccionar Carpeta</h2>
              <p class="text-xs text-gray-400">Navega y selecciona la carpeta a monitorear</p>
            </div>
          </div>
          <button (click)="onClose()"
                  class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <lucide-angular name="x" [size]="20" class="text-gray-400"></lucide-angular>
          </button>
        </div>

        <!-- Ruta actual -->
        <div class="px-6 py-3 bg-slate-900 border-b border-slate-700">
          <div class="flex items-center gap-2">
            <lucide-angular name="map-pin" [size]="14" class="text-gray-500"></lucide-angular>
            <span class="text-xs text-gray-400">Ruta actual:</span>
            <span class="text-xs font-mono text-white">{{ currentPath() || 'Selecciona una unidad' }}</span>
          </div>
        </div>

        <!-- Navegación -->
        @if (currentPath()) {
          <div class="px-6 py-2 bg-slate-900/50 border-b border-slate-700 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <button (click)="goToParent()"
                      [disabled]="!canGoUp()"
                      class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs font-semibold transition-colors flex items-center gap-1">
                <lucide-angular name="arrow-up" [size]="12"></lucide-angular>
                Subir
              </button>
              <button (click)="loadDrives()"
                      class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1">
                <lucide-angular name="hard-drive" [size]="12"></lucide-angular>
                Unidades
              </button>
            </div>
            <button (click)="selectCurrentPath()"
                    class="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5">
              <lucide-angular name="check-circle" [size]="14"></lucide-angular>
              Usar esta carpeta
            </button>
          </div>
        }

        <!-- Lista de carpetas -->
        <div class="flex-1 overflow-y-auto p-4">
          @if (loading()) {
            <div class="flex flex-col items-center justify-center py-12">
              <div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3"></div>
              <p class="text-sm text-gray-400">Cargando...</p>
            </div>
          } @else if (error()) {
            <div class="flex flex-col items-center justify-center py-12">
              <lucide-angular name="alert-circle" [size]="32" class="text-red-400 mb-3"></lucide-angular>
              <p class="text-sm text-red-400 mb-2">{{ error() }}</p>
              <button (click)="loadDrives()"
                      class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold">
                Reintentar
              </button>
            </div>
          } @else if (folders().length === 0) {
            <div class="flex flex-col items-center justify-center py-12">
              <lucide-angular name="folder-x" [size]="32" class="text-gray-600 mb-3"></lucide-angular>
              <p class="text-sm text-gray-400">No hay carpetas disponibles</p>
            </div>
          } @else {
            <div class="space-y-1">
              @for (folder of folders(); track folder.path) {
                <button (click)="browsePath(folder.path)"
                        class="w-full px-4 py-3 rounded-lg border border-slate-700 hover:bg-blue-900/30 hover:border-blue-600 transition-colors text-left flex items-center gap-3 group cursor-pointer">
                  <lucide-angular name="folder"
                                  [size]="18"
                                  class="text-gray-400 group-hover:text-blue-400">
                  </lucide-angular>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-white truncate">{{ folder.name }}</div>
                    <div class="text-xs text-gray-500 font-mono truncate">{{ folder.path }}</div>
                  </div>
                  <lucide-angular name="chevron-right" [size]="16" class="text-gray-500 group-hover:text-blue-400 flex-shrink-0"></lucide-angular>
                </button>
              }
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-700 flex items-center justify-end gap-4 bg-slate-900">
          <button (click)="onClose()"
                  class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium text-sm">
            Cancelar
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class FolderBrowserModalComponent {
  @Output() folderSelected = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  folders = signal<FolderInfo[]>([]);
  currentPath = signal<string>('');
  loading = signal(false);
  error = signal<string>('');

  constructor(private fileSystemService: FileSystemService) {
    this.loadDrives();
  }

  loadDrives() {
    this.loading.set(true);
    this.error.set('');
    this.currentPath.set('');

    this.fileSystemService.getDrives().subscribe({
      next: (drives) => {
        this.folders.set(drives);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las unidades: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  browsePath(path: string) {
    this.loading.set(true);
    this.error.set('');

    this.fileSystemService.browseFolders(path).subscribe({
      next: (folders) => {
        this.folders.set(folders);
        this.currentPath.set(path);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al navegar: ' + (err.error?.error || err.message));
        this.loading.set(false);
      }
    });
  }

  goToParent() {
    const current = this.currentPath();
    if (!current) return;

    // Extraer el directorio padre
    const lastSeparator = Math.max(current.lastIndexOf('\\'), current.lastIndexOf('/'));
    if (lastSeparator > 0) {
      const parent = current.substring(0, lastSeparator);
      this.browsePath(parent);
    } else {
      // Ya estamos en la raíz de una unidad, volver a ver unidades
      this.loadDrives();
    }
  }

  canGoUp(): boolean {
    const current = this.currentPath();
    if (!current) return false;

    // Verificar si no estamos ya en la raíz de una unidad (ej: "C:\")
    return current.length > 3;
  }

  selectCurrentPath() {
    const path = this.currentPath();
    if (path) {
      this.folderSelected.emit(path);
    }
  }

  onClose() {
    this.closed.emit();
  }
}
