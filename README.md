# Cashi - Frontend Angular

Sistema de gestión de cobranzas desarrollado en Angular 20.

## 🚀 Instalación

```bash
npm install
```

## 💻 Desarrollo

```bash
npm start
# o
ng serve
```

Navegar a `http://localhost:4200/`

## 🏗️ Build

```bash
npm run build
# o
ng build
```

Los archivos compilados se guardarán en `dist/`

## 📦 Tecnologías

- **Angular 20.3**
- **TypeScript 5.7**
- **Tailwind CSS 4**
- **lucide-angular 0.544.0** (iconos)
- **Signals API**
- **Standalone Components**

## 📁 Estructura

```
src/app/
├── collection-management/
│   ├── models/
│   │   ├── customer.model.ts
│   │   ├── management.model.ts
│   │   └── system-config.model.ts
│   ├── pages/
│   │   └── collection-management.page.ts
│   └── services/
│       ├── customer.service.ts
│       ├── management.service.ts
│       ├── payment.service.ts
│       └── system-config.service.ts
└── app.config.ts
```

## 🔌 Configuración de API

Editar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

## ✨ Características

- ✅ Gestión de llamadas con temporizador
- ✅ Tipificación de contacto y gestión
- ✅ Registro de pagos y compromisos
- ✅ Historial de gestiones
- ✅ Búsqueda de clientes
- ✅ Interfaz responsive
- ✅ Animaciones fluidas
- ✅ Validación de formularios

## 🎨 Diseño

El sistema utiliza Tailwind CSS con una paleta moderna:

- **Primarios**: Azul (slate/blue)
- **Éxito**: Verde
- **Advertencia**: Amarillo
- **Error**: Rojo

## 🧪 Testing

```bash
ng test
```

## Additional Resources

For more information on using the Angular CLI, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

---

**Versión:** 1.0.0
