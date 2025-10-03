# Módulo de Mantenimiento de Tipificaciones

## Descripción

Módulo completo para gestionar tipificaciones jerárquicas multi-nivel con soporte multi-tenant y multi-cartera.

## Características

### ✅ Gestión Jerárquica
- Soporte para N niveles de jerarquía (1, 2, 3... infinito)
- Árbol visual interactivo con expand/collapse
- Creación de sub-niveles desde cualquier nodo

### ✅ Multi-Tenant
- Configuración específica por cliente (tenant)
- Configuración específica por cartera/sub-cartera
- Nombres, iconos y colores personalizables por tenant

### ✅ Tipos de Clasificación
- Resultado de Contacto (CONTACT_RESULT)
- Tipo de Gestión (MANAGEMENT_TYPE)
- Tipo de Pago (PAYMENT_TYPE)
- Tipo de Reclamo (COMPLAINT_TYPE)
- Personalizado (CUSTOM)

### ✅ Funcionalidades
- **Crear**: Nuevas tipificaciones en cualquier nivel
- **Editar**: Modificar catálogo y configuración del tenant
- **Eliminar**: Borrado lógico (no se puede eliminar tipificaciones del sistema)
- **Habilitar/Deshabilitar**: Toggle por tenant/cartera
- **Personalizar**: Nombres, iconos, colores personalizados
- **Validaciones**: Reglas de validación configurables

## Estructura de Archivos

```
src/app/maintenance/
├── models/
│   └── classification.model.ts          # Interfaces y enums
├── services/
│   └── classification.service.ts        # Servicio HTTP
└── components/
    ├── classification-maintenance/
    │   ├── classification-maintenance.component.ts
    │   ├── classification-maintenance.component.html
    │   └── classification-maintenance.component.scss
    └── classification-form-dialog/
        ├── classification-form-dialog.component.ts
        ├── classification-form-dialog.component.html
        └── classification-form-dialog.component.scss
```

## Navegación

### URL de Acceso
```
http://localhost:4200/maintenance/classifications
```

### Menú de Navegación
- Ubicado en el header de la aplicación
- Menú "Mantenimiento" → "Tipificaciones"

## Uso de la Interfaz

### Filtros
1. **Tipo de Tipificación**: Filtra por tipo específico o muestra todos
2. **Cartera**: Filtra por cartera específica o muestra todas

### Acciones por Nodo
- **Toggle**: Habilitar/deshabilitar para el tenant actual
- **+ (Agregar)**: Crear sub-nivel debajo del nodo actual
- **Editar**: Modificar catálogo y configuración
- **Eliminar**: Borrar tipificación (solo si no es del sistema)

### Crear Tipificación

1. Click en "Nueva Tipificación" (nivel 1) o "+ Agregar" en un nodo (sub-nivel)
2. Llenar formulario en 2 tabs:

#### Tab 1: Datos del Catálogo
- **Código**: Identificador único (requerido, max 20 chars)
- **Nombre**: Nombre descriptivo (requerido)
- **Tipo**: Tipo de clasificación (requerido)
- **Descripción**: Texto descriptivo (opcional)
- **Orden**: Orden de visualización (numérico)
- **Color**: Color en formato hex (#RRGGBB)
- **Icono**: Nombre de Material Icon

#### Tab 2: Configuración del Cliente
- **Habilitado**: Toggle para habilitar en este tenant/cartera
- **Nombre personalizado**: Sobrescribe el nombre del catálogo
- **Icono personalizado**: Sobrescribe el icono
- **Color personalizado**: Sobrescribe el color
- **Validaciones**:
  - Requiere comentario
  - Longitud mínima/máxima del comentario
  - Reglas JSON personalizadas

3. Click en "Crear" o "Actualizar"

## Integración con Backend

### API Base URL
```
http://localhost:8080/api/v1/classifications
```

### Endpoints Utilizados

#### Catálogo
- `GET /api/v1/classifications` - Obtener todas
- `GET /api/v1/classifications/type/{type}` - Por tipo
- `GET /api/v1/classifications/{id}` - Por ID
- `POST /api/v1/classifications` - Crear
- `PUT /api/v1/classifications/{id}` - Actualizar
- `DELETE /api/v1/classifications/{id}` - Eliminar

#### Configuración Tenant
- `GET /api/v1/classifications/tenants/{tenantId}/classifications` - Config por tenant
- `GET /api/v1/classifications/tenants/{tenantId}/classifications/type/{type}` - Por tipo
- `GET /api/v1/classifications/tenants/{tenantId}/classifications/level/{level}` - Por nivel
- `PUT /api/v1/classifications/tenants/{tenantId}/classifications/{classificationId}/config` - Actualizar config
- `POST /api/v1/classifications/tenants/{tenantId}/classifications/{classificationId}/enable` - Habilitar
- `POST /api/v1/classifications/tenants/{tenantId}/classifications/{classificationId}/disable` - Deshabilitar

## Arquitectura Backend

### Entidades Principales
- **ClassificationCatalog**: Catálogo central de tipificaciones
- **TenantClassificationConfig**: Configuración específica por tenant
- **ClassificationDependency**: Dependencias entre clasificaciones
- **ClassificationFieldMapping**: Mapeo de campos dinámicos
- **ClassificationConfigHistory**: Historial de cambios
- **ConfigurationVersion**: Versionado y snapshots

### Repositorios JPA
- ClassificationCatalogRepository
- TenantClassificationConfigRepository
- ClassificationDependencyRepository
- ClassificationFieldMappingRepository
- ClassificationConfigHistoryRepository
- ConfigurationVersionRepository

### Servicios
- **ClassificationCommandServiceImpl**: Operaciones de escritura (CRUD)
- **ClassificationQueryServiceImpl**: Operaciones de lectura

### Controller REST
- **ClassificationManagementController**: 20+ endpoints REST

## Características Técnicas

### Frontend
- **Framework**: Angular 19+ standalone components
- **UI Library**: Angular Material
- **State Management**: Signals
- **Tree Component**: Material Tree con CDK

### Backend
- **Framework**: Spring Boot 3.2.1
- **ORM**: JPA/Hibernate
- **Database**: MySQL 8
- **Architecture**: DDD (Domain-Driven Design)
- **Patterns**: Repository, Service, Strategy, Factory

## Próximos Pasos

1. ✅ Conectar con servicio de autenticación para obtener tenant real
2. ✅ Cargar carteras dinámicamente desde el backend
3. ⏳ Implementar gestión de dependencias entre clasificaciones
4. ⏳ Agregar gestión de versiones y snapshots desde UI
5. ⏳ Implementar búsqueda y filtrado avanzado

## Testing

### Datos de Prueba
El backend incluye un DataSeeder que carga datos de ejemplo al iniciar:
- Tenants de ejemplo
- Carteras jerárquicas
- Campañas
- Clasificaciones básicas

### Flujo de Prueba
1. Iniciar backend: `mvn spring-boot:run`
2. Iniciar frontend: `npm start`
3. Navegar a `/maintenance/classifications`
4. Crear nueva tipificación de nivel 1
5. Agregar sub-niveles
6. Personalizar por tenant
7. Habilitar/deshabilitar

## Notas de Desarrollo

### Normalización Extrema
El diseño está altamente normalizado para soportar:
- Escalabilidad infinita de niveles
- Evitar campos null masivos
- Mantener flexibilidad máxima
- Facilitar mantenimiento futuro

### Metadata-Driven
Todo el sistema es metadata-driven:
- Catálogos centrales
- Configuraciones por tenant
- Reglas de validación dinámicas
- Campos personalizables

### Auditoría Completa
Todos los cambios quedan registrados:
- Quién hizo el cambio
- Cuándo se hizo
- Qué se cambió
- IP y user agent
- Snapshots completos para rollback
