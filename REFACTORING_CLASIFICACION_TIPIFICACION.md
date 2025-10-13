# Refactoring: Clasificación y Tipificación

## Fecha: 2025-10-13

## Objetivo

Cambiar el sistema completo para usar la nomenclatura correcta:
- **Clasificación** = Categoría/grupo al que pertenece la tipificación
- **Tipificación** = Código específico/hoja (último nivel en jerarquía)

## Problema Anterior

El sistema guardaba códigos hardcodeados (`'CPC'`) que no correspondían al tenant actual, y usaba nombres confusos como `contactResult` y `managementType` sin una semántica clara de qué representaban en el contexto de jerarquías.

## Cambios en Base de Datos

### Nuevas Columnas en Tabla `gestiones`

| Columna Nueva | Tipo | Descripción |
|---------------|------|-------------|
| `codigo_clasificacion` | VARCHAR(50) | Código de la clasificación/categoría |
| `descripcion_clasificacion` | VARCHAR(255) | Descripción de la clasificación |
| `codigo_tipificacion` | VARCHAR(50) | Código de la tipificación específica (hoja) |
| `descripcion_tipificacion` | VARCHAR(255) | Descripción de la tipificación |
| `tipificacion_requiere_pago` | BIT(1) | Si la tipificación requiere pago |
| `tipificacion_requiere_cronograma` | BIT(1) | Si la tipificación requiere cronograma |

### Columnas Legacy Eliminadas

Estas columnas ya no son necesarias en un sistema nuevo:
- ~~`codigo_resultado_contacto`~~
- ~~`descripcion_resultado_contacto`~~
- ~~`codigo_tipo_gestion`~~
- ~~`descripcion_tipo_gestion`~~
- ~~`tipo_gestion_requiere_pago`~~
- ~~`tipo_gestion_requiere_cronograma`~~

## Archivos Modificados

### Backend

#### 1. **Management.java** (Entidad)
**Ubicación**: `web-service-cashi/src/main/java/com/cashi/collectionmanagement/domain/model/aggregates/Management.java`

**Cambios**:
- ✅ Agregados campos: `classificationCode`, `classificationDescription`
- ✅ Agregados campos: `typificationCode`, `typificationDescription`, `typificationRequiresPayment`, `typificationRequiresSchedule`
- ✅ Eliminados campos legacy: `contactResult`, `managementType`
- ✅ Agregados setters: `setClassification()`, `setTypification()`

```java
// CLASIFICACIÓN: Categoría/grupo al que pertenece la tipificación
@Column(name = "codigo_clasificacion", length = 50)
private String classificationCode;

@Column(name = "descripcion_clasificacion", length = 255)
private String classificationDescription;

// TIPIFICACIÓN: Código específico/hoja (último nivel en jerarquía)
@Column(name = "codigo_tipificacion", length = 50)
private String typificationCode;

@Column(name = "descripcion_tipificacion", length = 255)
private String typificationDescription;

@Column(name = "tipificacion_requiere_pago")
private Boolean typificationRequiresPayment;

@Column(name = "tipificacion_requiere_cronograma")
private Boolean typificationRequiresSchedule;

public void setClassification(String code, String description) {
    this.classificationCode = code;
    this.classificationDescription = description;
}

public void setTypification(String code, String description, Boolean requiresPayment, Boolean requiresSchedule) {
    this.typificationCode = code;
    this.typificationDescription = description;
    this.typificationRequiresPayment = requiresPayment;
    this.typificationRequiresSchedule = requiresSchedule;
}
```

#### 2. **CreateManagementCommand.java** (Command)
**Ubicación**: `web-service-cashi/src/main/java/com/cashi/collectionmanagement/domain/model/commands/CreateManagementCommand.java`

**Cambios**:
- ✅ Reemplazados `contactResultCode/Description` y `managementTypeCode/Description`
- ✅ Agregados parámetros: `classificationCode`, `classificationDescription`, `typificationCode`, `typificationDescription`, etc.

```java
public record CreateManagementCommand(
    String customerId,
    String advisorId,
    String campaignId,

    // Clasificación: Categoría/grupo al que pertenece la tipificación
    String classificationCode,
    String classificationDescription,

    // Tipificación: Código específico/hoja (último nivel en jerarquía)
    String typificationCode,
    String typificationDescription,
    Boolean typificationRequiresPayment,
    Boolean typificationRequiresSchedule,

    String observations,
    Map<String, Object> dynamicFields
) {}
```

#### 3. **CreateManagementRequest.java** (Request DTO)
**Ubicación**: `web-service-cashi/src/main/java/com/cashi/collectionmanagement/interfaces/rest/resources/CreateManagementRequest.java`

**Cambios**: Misma estructura que el Command

#### 4. **ManagementResource.java** (Response DTO)
**Ubicación**: `web-service-cashi/src/main/java/com/cashi/collectionmanagement/interfaces/rest/resources/ManagementResource.java`

**Cambios**:
```java
public record ManagementResource(
    // ... otros campos
    // Clasificación: Categoría/grupo al que pertenece la tipificación
    String classificationCode,
    String classificationDescription,

    // Tipificación: Código específico/hoja (último nivel en jerarquía)
    String typificationCode,
    String typificationDescription,
    Boolean typificationRequiresPayment,
    Boolean typificationRequiresSchedule,
    // ... otros campos
) {}
```

#### 5. **ManagementCommandServiceImpl.java** (Service)
**Ubicación**: `web-service-cashi/src/main/java/com/cashi/collectionmanagement/application/internal/commandservices/ManagementCommandServiceImpl.java`

**Cambios**:
- ✅ Llama a `management.setClassification()`
- ✅ Llama a `management.setTypification()`
- ✅ Logs actualizados para mostrar "Clasificación (Categoría)" y "Tipificación (Hoja específica)"

```java
// Clasificación: Categoría/grupo al que pertenece la tipificación
if (command.classificationCode() != null) {
    System.out.println("📁 Clasificación (Categoría):");
    System.out.println("   - Código: " + command.classificationCode());
    System.out.println("   - Descripción: " + command.classificationDescription());
    System.out.println("   - Columnas BD: codigo_clasificacion, descripcion_clasificacion");

    management.setClassification(
        command.classificationCode(),
        command.classificationDescription()
    );
}

// Tipificación: Código específico/hoja (último nivel en jerarquía)
if (command.typificationCode() != null) {
    System.out.println("🏷️  Tipificación (Hoja específica):");
    System.out.println("   - Código: " + command.typificationCode());
    System.out.println("   - Descripción: " + command.typificationDescription());
    System.out.println("   - Requiere Pago: " + command.typificationRequiresPayment());
    System.out.println("   - Requiere Cronograma: " + command.typificationRequiresSchedule());

    management.setTypification(
        command.typificationCode(),
        command.typificationDescription(),
        command.typificationRequiresPayment(),
        command.typificationRequiresSchedule()
    );
}
```

#### 6. **ManagementResourceFromEntityAssembler.java** (Assembler)
**Ubicación**: `web-service-cashi/src/main/java/com/cashi/collectionmanagement/interfaces/rest/transform/ManagementResourceFromEntityAssembler.java`

**Cambios**: Usa los nuevos getters de la entidad

#### 7. **CreateManagementCommandFromResourceAssembler.java** (Assembler)
**Ubicación**: `web-service-cashi/src/main/java/com/cashi/collectionmanagement/interfaces/rest/transform/CreateManagementCommandFromResourceAssembler.java`

**Cambios**: Mapea los nuevos campos del request al command

### Frontend

#### 1. **management.service.ts** (Interfaces TypeScript)
**Ubicación**: `cashi/src/app/collection-management/services/management.service.ts`

**Cambios**:
```typescript
export interface ManagementResource {
  // ... otros campos
  // Clasificación: Categoría/grupo al que pertenece la tipificación
  classificationCode: string;
  classificationDescription: string;

  // Tipificación: Código específico/hoja (último nivel en jerarquía)
  typificationCode: string;
  typificationDescription: string;
  typificationRequiresPayment?: boolean;
  typificationRequiresSchedule?: boolean;
  // ... otros campos
}

export interface CreateManagementRequest {
  // ... otros campos
  // Clasificación: Categoría/grupo al que pertenece la tipificación
  classificationCode: string;
  classificationDescription: string;

  // Tipificación: Código específico/hoja (último nivel en jerarquía)
  typificationCode: string;
  typificationDescription: string;
  typificationRequiresPayment?: boolean;
  typificationRequiresSchedule?: boolean;
  // ... otros campos
}
```

#### 2. **collection-management.page.ts** (Componente Principal)
**Ubicación**: `cashi/src/app/collection-management/pages/collection-management.page.ts`

**Cambios Principales**:

**a) Lógica para extraer Clasificación y Tipificación (líneas 1310-1336)**:
```typescript
if (this.usesHierarchicalClassifications()) {
  // Sistema jerárquico: obtener clasificación (categoría) y tipificación (hoja)
  const selected = this.selectedClassifications();
  const allClassifications = this.managementClassifications();

  // TIPIFICACIÓN: La hoja/leaf (última selección)
  const lastSelectedId = selected[selected.length - 1];
  managementClassification = allClassifications.find((c: any) => c.id.toString() === lastSelectedId);
  console.log('🏷️  Tipificación (hoja/leaf):', managementClassification);

  // CLASIFICACIÓN: La categoría padre de la tipificación
  if (managementClassification?.parentId) {
    const parentId = managementClassification.parentId;
    contactClassification = allClassifications.find((c: any) => c.id.toString() === parentId.toString());
    console.log('📁 Clasificación (categoría):', contactClassification);
  } else {
    // Si no tiene padre, usar la misma como clasificación
    contactClassification = managementClassification;
    console.log('📁 Clasificación (sin padre, usar misma):', contactClassification);
  }
}
```

**b) Request actualizado (líneas 1338-1355)**:
```typescript
const request: CreateManagementRequest = {
  customerId: this.customerData().id_cliente,
  advisorId: 'ADV-001',
  campaignId: this.campaign().id,

  // Clasificación: Categoría/grupo al que pertenece la tipificación
  classificationCode: contactClassification?.codigo || '',
  classificationDescription: contactClassification?.label || '',

  // Tipificación: Código específico/hoja (último nivel en jerarquía)
  typificationCode: managementClassification?.codigo || '',
  typificationDescription: managementClassification?.label || '',
  typificationRequiresPayment: managementClassification?.requiere_pago,
  typificationRequiresSchedule: managementClassification?.requiere_cronograma,

  observations: this.managementForm.observaciones,
  dynamicFields: this.dynamicFieldValues()
};
```

## Funcionamiento

### Escenario de Ejemplo

**Jerarquía de Clasificaciones:**
```
ID=26: "RP - Realiza Pago" (parentId: null)
  └─ ID=27: "PPR - Pago Promesa" (parentId: 26)
     └─ ID=29: "PPRI - Pago Promesa Inmediato" (parentId: 27)
```

**Usuario selecciona hasta el último nivel:**
- Nivel 1: ID=26 "RP - Realiza Pago"
- Nivel 2: ID=27 "PPR - Pago Promesa"
- Nivel 3: ID=29 "PPRI - Pago Promesa Inmediato" ← **HOJA/LEAF**

**Lo que se guarda en BD:**

| Campo | Valor | Explicación |
|-------|-------|-------------|
| `codigo_clasificacion` | `"PPR"` | Código del padre de la hoja (categoría) |
| `descripcion_clasificacion` | `"Pago Promesa"` | Descripción del padre |
| `codigo_tipificacion` | `"PPRI"` | Código de la hoja específica |
| `descripcion_tipificacion` | `"Pago Promesa Inmediato"` | Descripción de la hoja |

## Pasos para Aplicar los Cambios

### 1. Reiniciar Backend

El backend creará automáticamente las nuevas columnas gracias a JPA/Hibernate:

```bash
cd c:\Users\HP\Documents\contacto-total\web-service-cashi
mvn clean install
mvn spring-boot:run
```

Las nuevas columnas se crearán automáticamente en la tabla `gestiones`:
- ✅ `codigo_clasificacion`
- ✅ `descripcion_clasificacion`
- ✅ `codigo_tipificacion`
- ✅ `descripcion_tipificacion`
- ✅ `tipificacion_requiere_pago`
- ✅ `tipificacion_requiere_cronograma`

### 2. Recargar Frontend

```bash
# En VSCode, simplemente recarga el navegador (F5)
# O reinicia el servidor de desarrollo si es necesario
```

### 3. Probar el Flujo

1. **Seleccionar jerarquía completa** hasta llegar a una hoja/leaf
2. **Llenar campos dinámicos** (si los hay)
3. **Guardar gestión**
4. **Verificar logs del backend** (deben mostrar):
   ```
   📁 Clasificación (Categoría):
      - Código: PPR
      - Descripción: Pago Promesa
      - Columnas BD: codigo_clasificacion, descripcion_clasificacion

   🏷️  Tipificación (Hoja específica):
      - Código: PPRI
      - Descripción: Pago Promesa Inmediato
      - Columnas BD: codigo_tipificacion, descripcion_tipificacion, ...
   ```
5. **Verificar en base de datos** tabla `gestiones`:
   - Campo `codigo_clasificacion` debe tener el código del padre
   - Campo `codigo_tipificacion` debe tener el código de la hoja seleccionada

## Ventajas del Nuevo Sistema

✅ **Semántica Clara**: "Clasificación" y "Tipificación" tienen significado específico en el dominio
✅ **Sin Hardcoding**: No más códigos `'CPC'` hardcodeados, todo es dinámico
✅ **Multi-tenant**: Cada tenant tiene sus propias clasificaciones y tipificaciones
✅ **Flexible**: Soporta jerarquías de N niveles
✅ **Auditable**: Se guarda tanto la categoría como el código específico para análisis

## Notas Importantes

- ⚠️ Las columnas legacy (`codigo_resultado_contacto`, etc.) NO se eliminan de la BD automáticamente por seguridad
- ⚠️ Si tienes datos existentes, considera crear un script de migración
- ⚠️ El sistema nuevo NO usa las columnas legacy, solo las nuevas

## Status: ✅ COMPLETADO

Todos los cambios han sido aplicados en backend y frontend. El sistema está listo para reiniciar y probar.
