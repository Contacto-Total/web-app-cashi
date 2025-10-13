# Estandarización de Tipos de Campo

## 🎯 Objetivo

Eliminar la confusión entre tipos de campo en MAYÚSCULAS y minúsculas, estandarizando todo el sistema a **lowercase (minúsculas)**.

## 📋 Cambios Realizados

### 1. Frontend Models

#### `dynamic-field.model.ts`
- ✅ Cambiado de `'TEXT' | 'NUMBER' | 'CURRENCY'...` a `'text' | 'number' | 'currency'...`
- ✅ Agregada documentación que indica sincronización exacta con backend
- ✅ Formato estandarizado: **lowercase en frontend y backend**

#### `field-config.model.ts`
- ✅ Ya estaba en lowercase (correcto)
- ✅ Agregada documentación de sincronización con backend

### 2. Frontend Components

#### `collection-management.page.ts`
- ✅ **Eliminado** el método `mapFieldType()` (ya no necesario)
- ✅ Los tipos del backend se usan directamente con `.toLowerCase()` por seguridad
- ✅ No más conversiones entre formatos

#### `dynamic-field-renderer.component.ts`
- ✅ Ya estaba usando lowercase (correcto)
- ✅ No requiere cambios

#### `field-config-dialog.component.ts`
- ✅ Ahora carga tipos dinámicamente desde el backend
- ✅ Los tipos vienen directamente en lowercase desde la API

### 3. Backend (Ya estaba correcto)

- ✅ `FieldTypeCatalog.typeCode` - usa lowercase
- ✅ `DataSeeder.seedFieldTypes()` - seedea en lowercase
- ✅ `FieldTypeController` - retorna en lowercase
- **No requiere cambios**

## 🔄 Flujo de Datos Estandarizado

```
Backend DB (lowercase)
    ↓
FieldTypeCatalog.typeCode (lowercase: "text", "number", "table")
    ↓
DataSeeder.seedFieldTypes() (seedea en lowercase)
    ↓
FieldTypeController API (GET /api/v1/field-types)
    ↓
Frontend Service (FieldTypeResource)
    ↓
Frontend Models (FieldType = 'text' | 'number' | 'table')
    ↓
Components (usan lowercase directamente)
```

## 📝 Tipos Estandarizados

| Tipo (lowercase) | Descripción | Campo Principal | Columna Tabla |
|------------------|-------------|-----------------|---------------|
| `text` | Campo de texto simple | ✅ | ✅ |
| `textarea` | Área de texto multilínea | ✅ | ✅ |
| `number` | Número entero | ✅ | ✅ |
| `decimal` | Número con decimales | ✅ | ✅ |
| `currency` | Valor monetario | ✅ | ✅ |
| `date` | Selector de fecha | ✅ | ✅ |
| `datetime` | Fecha y hora | ✅ | ✅ |
| `checkbox` | Casilla de verificación | ✅ | ✅ |
| `select` | Lista desplegable | ✅ | ✅ |
| `multiselect` | Selección múltiple | ✅ | ✅ |
| `email` | Dirección de correo | ✅ | ✅ |
| `phone` | Número telefónico | ✅ | ✅ |
| `url` | Dirección web | ✅ | ✅ |
| `json` | Datos estructurados | ✅ | ❌ |
| `table` | Tabla dinámica | ✅ | ❌ |
| `auto-number` | Autonumérico | ❌ | ✅ |

## ✅ Ventajas de la Estandarización

1. **Sin conversiones**: Los tipos fluyen directamente del backend al frontend sin mapeos
2. **Menos errores**: Un solo formato elimina confusiones
3. **Código más limpio**: Eliminado el método `mapFieldType()` de ~20 líneas
4. **Estándar web**: Lowercase es el estándar en REST APIs y JSON
5. **Mantenimiento fácil**: Agregar un nuevo tipo solo requiere actualizar el seeder

## 🔧 Cómo Agregar un Nuevo Tipo de Campo

1. **Backend**: Agregar en `DataSeeder.seedFieldTypes()`:
   ```java
   seedFieldTypeIfNotExists("signature", "Firma Digital", "Campo de firma digital",
       "pen-tool", true, false, 17);
   ```

2. **Frontend**: Agregar en los type definitions:
   ```typescript
   // dynamic-field.model.ts
   export type FieldType =
     | 'text'
     | ...
     | 'signature'; // Firma digital

   // field-config.model.ts
   export type FieldType =
     | 'text'
     | ...
     | 'signature'; // Firma digital
   ```

3. **Componente**: Implementar el renderizado en `DynamicFieldRendererComponent`:
   ```typescript
   @if (field.type === 'signature') {
     <!-- Implementación del campo de firma -->
   }
   ```

4. **Reiniciar backend**: JPA y el seeder actualizarán automáticamente la BD

## 📚 Referencias en el Código

Todos los archivos de modelo ahora incluyen comentarios con referencias explícitas:
- `@backend com.cashi.shared.domain.model.entities.FieldTypeCatalog`
- `@backend com.cashi.systemconfiguration.infrastructure.persistence.DataSeeder.seedFieldTypes()`
- `@backend com.cashi.systemconfiguration.interfaces.rest.controllers.FieldTypeController`

Busca estos comentarios en el código para encontrar las relaciones entre frontend y backend.
