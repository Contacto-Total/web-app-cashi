import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { GoogleDriveService, GoogleDriveFile } from '../services/google-drive.service';

@Component({
  selector: 'app-google-drive-test',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="h-[calc(100dvh-56px)] bg-slate-950 overflow-hidden flex flex-col">
      <div class="flex-1 overflow-y-auto">
        <div class="p-4 max-w-[1600px] mx-auto">
          <!-- Header -->
          <div class="mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <lucide-angular name="hard-drive" [size]="20" class="text-white"></lucide-angular>
              </div>
              <div>
                <h1 class="text-xl font-bold text-white">Google Drive Integration Test</h1>
                <p class="text-sm text-gray-400">Prueba de conexión con Google Drive</p>
              </div>
            </div>
          </div>

          <!-- Service Status -->
          <div class="mb-4">
            <div [class]="serviceStatus()?.initialized ? 'bg-green-900/20 border-green-700/50' : 'bg-amber-900/20 border-amber-700/50'"
                 class="rounded-lg border p-4">
              <div class="flex items-center gap-3">
                <lucide-angular [name]="serviceStatus()?.initialized ? 'check-circle' : 'alert-circle'"
                                [size]="20"
                                [class]="serviceStatus()?.initialized ? 'text-green-400' : 'text-amber-400'">
                </lucide-angular>
                <div>
                  <div [class]="serviceStatus()?.initialized ? 'text-green-400' : 'text-amber-400'"
                       class="text-sm font-semibold">
                    {{ serviceStatus()?.initialized ? 'Servicio Conectado' : 'Servicio No Disponible' }}
                  </div>
                  <div class="text-xs text-gray-400 mt-0.5">{{ serviceStatus()?.message }}</div>
                </div>
                <button (click)="checkStatus()"
                        class="ml-auto px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5">
                  <lucide-angular name="refresh-cw" [size]="14"></lucide-angular>
                  Refrescar
                </button>
              </div>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="mb-4 flex gap-2">
            <div class="relative flex-1">
              <lucide-angular name="search" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></lucide-angular>
              <input type="text"
                     [(ngModel)]="searchQuery"
                     (keyup.enter)="search()"
                     placeholder="Buscar archivos..."
                     class="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500">
            </div>
            <button (click)="search()"
                    [disabled]="!searchQuery.trim()"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded text-sm font-semibold transition-colors flex items-center gap-2">
              <lucide-angular name="search" [size]="16"></lucide-angular>
              Buscar
            </button>
            <button (click)="loadFiles()"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors flex items-center gap-2">
              <lucide-angular name="list" [size]="16"></lucide-angular>
              Listar Todos
            </button>
          </div>

          <!-- Loading State -->
          @if (loading()) {
            <div class="bg-slate-900 rounded-lg border border-slate-800 p-12 text-center">
              <div class="animate-spin mx-auto w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mb-3"></div>
              <p class="text-sm text-gray-400">Cargando archivos...</p>
            </div>
          }

          <!-- Error State -->
          @if (error()) {
            <div class="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-4">
              <div class="flex items-start gap-3">
                <lucide-angular name="alert-circle" [size]="20" class="text-red-400 flex-shrink-0 mt-0.5"></lucide-angular>
                <div>
                  <div class="text-sm font-semibold text-red-400">Error</div>
                  <div class="text-xs text-gray-400 mt-1">{{ error() }}</div>
                </div>
              </div>
            </div>
          }

          <!-- Files List -->
          @if (!loading() && files().length > 0) {
            <div class="bg-slate-900 rounded-lg border border-slate-800">
              <div class="p-3 border-b border-slate-800">
                <div class="flex items-center gap-2">
                  <lucide-angular name="folder" [size]="16" class="text-green-400"></lucide-angular>
                  <h2 class="text-sm font-bold text-white">Archivos</h2>
                  <span class="text-xs text-gray-400">({{ files().length }})</span>
                </div>
              </div>

              <div class="p-3 space-y-1.5 max-h-[calc(100vh-350px)] overflow-y-auto">
                @for (file of files(); track file.id) {
                  <div class="p-3 bg-slate-800 hover:bg-slate-700/50 border border-slate-700 rounded transition-all">
                    <div class="flex items-start gap-3">
                      <!-- Icon -->
                      <div class="w-10 h-10 bg-slate-700 rounded flex items-center justify-center flex-shrink-0">
                        <lucide-angular [name]="getFileIcon(file.fileType)"
                                        [size]="20"
                                        class="text-green-400">
                        </lucide-angular>
                      </div>

                      <!-- File Info -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <h3 class="text-sm font-semibold text-white truncate">{{ file.name }}</h3>
                          <span class="text-xs text-gray-500 uppercase">{{ file.fileType }}</span>
                        </div>
                        <div class="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>{{ file.sizeFormatted }}</span>
                          <span>•</span>
                          <span>{{ formatDate(file.modifiedTime) }}</span>
                        </div>
                        <div class="mt-1 text-xs text-gray-500 font-mono truncate">
                          ID: {{ file.id }}
                        </div>
                      </div>

                      <!-- Actions -->
                      <div class="flex items-center gap-1 flex-shrink-0">
                        @if (file.webViewLink) {
                          <a [href]="file.webViewLink"
                             target="_blank"
                             class="p-2 text-gray-400 hover:text-blue-400 hover:bg-slate-600 rounded transition-colors"
                             title="Ver en Google Drive">
                            <lucide-angular name="external-link" [size]="16"></lucide-angular>
                          </a>
                        }
                        <button (click)="downloadFile(file)"
                                class="p-2 text-gray-400 hover:text-green-400 hover:bg-slate-600 rounded transition-colors"
                                title="Descargar">
                          <lucide-angular name="download" [size]="16"></lucide-angular>
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Empty State -->
          @if (!loading() && !error() && files().length === 0) {
            <div class="bg-slate-900 rounded-lg border border-slate-800 p-12 text-center">
              <lucide-angular name="folder-x" [size]="48" class="text-gray-600 mx-auto mb-3"></lucide-angular>
              <p class="text-sm text-gray-400">No se encontraron archivos</p>
              <p class="text-xs text-gray-500 mt-1">Intenta buscar o listar todos los archivos</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class GoogleDriveTestComponent implements OnInit {
  private driveService = inject(GoogleDriveService);

  files = signal<GoogleDriveFile[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  serviceStatus = signal<{ initialized: boolean; message: string } | null>(null);
  searchQuery = '';

  ngOnInit() {
    this.checkStatus();
  }

  checkStatus() {
    this.driveService.getStatus().subscribe({
      next: (status) => {
        this.serviceStatus.set(status);
        if (status.initialized) {
          this.loadFiles();
        }
      },
      error: (err) => {
        console.error('Error checking status:', err);
        this.error.set('Error al verificar el estado del servicio');
      }
    });
  }

  loadFiles() {
    this.loading.set(true);
    this.error.set(null);
    this.searchQuery = '';

    this.driveService.listFiles().subscribe({
      next: (files) => {
        this.files.set(files);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading files:', err);
        this.error.set(err.error?.error || 'Error al cargar archivos desde Google Drive');
        this.loading.set(false);
      }
    });
  }

  search() {
    const query = this.searchQuery.trim();
    if (!query) return;

    this.loading.set(true);
    this.error.set(null);

    this.driveService.searchFiles(query).subscribe({
      next: (files) => {
        this.files.set(files);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error searching files:', err);
        this.error.set(err.error?.error || 'Error al buscar archivos');
        this.loading.set(false);
      }
    });
  }

  downloadFile(file: GoogleDriveFile) {
    // Check if it's a Google Workspace file (needs export instead of download)
    if (file.mimeType.includes('google-apps')) {
      alert(`Este es un archivo de Google Workspace (${file.fileType}).\n\nNecesita ser exportado a un formato específico (PDF, DOCX, etc.).\n\nPor ahora solo se pueden descargar archivos normales.`);
      return;
    }

    this.driveService.downloadFile(file.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: async (err) => {
        console.error('Error downloading file:', err);

        // Try to read the error blob
        let errorMessage = 'Error al descargar el archivo';
        if (err.error instanceof Blob) {
          try {
            const text = await err.error.text();
            const errorObj = JSON.parse(text);
            errorMessage = errorObj.error || errorMessage;
          } catch (e) {
            // Ignore parse error
          }
        }

        alert(errorMessage);
      }
    });
  }

  getFileIcon(fileType: string): string {
    return this.driveService.getFileIcon(fileType);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }
}
