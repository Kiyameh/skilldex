---
name: tool-compact-context
description: Compactar Contexto
disable-model-invocation: true
metadata:
  version: "1.0.0"
  domain: tools
---

# Compactar Contexto

## Objetivo

Compacta todo el contexto actual de la conversación en un resumen conciso que ocupe significativamente menos espacio, preservando los objetivos originales, logros importantes y referencias a archivos relevantes.

## Pasos

### 1. Analizar el contexto actual

Identifica y extrae:

- Objetivos originales de la sesión
- Logros y funcionalidades implementadas
- Decisiones técnicas importantes tomadas
- Problemas resueltos y soluciones aplicadas
- Archivos creados, modificados o referenciados

### 2. Crear resumen compacto

Genera un resumen estructurado que incluya:

**Sección de Objetivos:**

- Lista concisa de objetivos originales (máximo 3-5 puntos)
- Estado de cada objetivo (completado/en progreso/pendiente)

**Sección de Logros:**

- Funcionalidades implementadas resumidas en puntos clave
- Decisiones técnicas relevantes (arquitectura, patrones, convenciones)
- Problemas resueltos con soluciones aplicadas

**Sección de Archivos:**

- Lista de referencias a archivos creados (solo rutas, sin contenido)
- Lista de referencias a archivos modificados (solo rutas, sin contenido)
- Lista de referencias a archivos consultados relevantes (solo rutas, sin contenido)

**Sección de Contexto Técnico:**

- Stack tecnológico utilizado
- Patrones y convenciones aplicadas
- Dependencias o configuraciones relevantes

### 3. Optimizar formato

Estructura el resumen con:

- Máximo 2-3 niveles de anidación
- Listas con viñetas para facilitar lectura
- Referencias a archivos usando formato de ruta relativa o absoluta
- Sin código completo, solo referencias cuando sea necesario para claridad

### 4. Guardar resumen en archivo

- Verifica si el usuario ha indicado un archivo donde volver el resultado.
- Si no lo ha facilitado, detente y preguntalo.
- Almacena el resultado del contexto en la ubicación especificada por el usuario.

### 5. Validar compresión

Verifica que el resumen:

- Ocupa menos del 30% del espacio del contexto original
- Preserva toda la información crítica
- Mantiene referencias a todos los archivos relevantes
- Es comprensible sin necesidad del contexto completo

## Verificación

Lista de checks para validar que el comando se completó correctamente:

- [ ] Resumen ocupa significativamente menos espacio que el contexto original
- [ ] Objetivos originales están claramente identificados y resumidos
- [ ] Logros importantes están documentados de forma concisa
- [ ] Todas las referencias a archivos están incluidas (solo rutas, sin contenido)
- [ ] Decisiones técnicas relevantes están preservadas
- [ ] El resumen es autónomo y comprensible
- [ ] Formato es claro y estructurado
- [ ] Archivo guardado correctamente en la ubicación qeu corresponda

## Formato de Salida Esperado

**Contenido del archivo guardado:**

```markdown
# Resumen Compacto de Sesión

## Objetivos Originales

- [Objetivo 1] - Completado
- [Objetivo 2] - Completado
- [Objetivo 3] - En progreso

## Logros Principales

- [Funcionalidad/Logro 1]
- [Funcionalidad/Logro 2]
- [Decisión técnica importante]

## Archivos Creados

- `ruta/al/archivo/nuevo.tsx`
- `ruta/al/archivo/nuevo.css`

## Archivos Modificados

- `ruta/al/archivo/existente.tsx`
- `ruta/al/archivo/existente.css`

## Archivos Consultados

- `ruta/al/archivo/referencia.tsx`

## Contexto Técnico

- Stack: [tecnologías relevantes]
- Patrones: [patrones aplicados]
- Configuraciones: [configuraciones relevantes]
```
