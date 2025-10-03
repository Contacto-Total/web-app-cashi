import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signal para el estado del modo oscuro
  isDarkMode = signal<boolean>(false);

  constructor() {
    // Cargar preferencia guardada del localStorage
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      // Por defecto SIEMPRE modo claro, ignorar preferencia del sistema
      this.isDarkMode.set(false);
      localStorage.setItem('theme', 'light');
    }

    // Effect para aplicar tema cuando cambie el signal
    effect(() => {
      const isDark = this.isDarkMode(); // Leer el signal para que el effect lo rastree
      const theme = isDark ? 'dark' : 'light';

      // Actualizar clase en el documento
      if (isDark) {
        document.documentElement.classList.add('dark');
        console.log('🌙 Dark mode activado');
      } else {
        document.documentElement.classList.remove('dark');
        console.log('☀️ Light mode activado');
      }

      // Actualizar meta tag color-scheme
      const metaTag = document.querySelector('meta[name="color-scheme"]');
      if (metaTag) {
        metaTag.setAttribute('content', theme);
      }

      console.log('Clases en <html>:', document.documentElement.className);
      console.log('Color scheme:', theme);

      // Guardar en localStorage
      localStorage.setItem('theme', theme);
    });
  }

  toggleTheme() {
    const before = this.isDarkMode();
    console.log('🔄 Toggle theme - antes:', before);
    this.isDarkMode.update(current => !current);
    const after = this.isDarkMode();
    console.log('🔄 Toggle theme - después:', after);

    // Verificar manualmente las clases
    setTimeout(() => {
      const hasClass = document.documentElement.classList.contains('dark');
      console.log('✅ Clase "dark" presente en HTML:', hasClass);
      console.log('📋 Todas las clases:', document.documentElement.className);
    }, 100);
  }
}
