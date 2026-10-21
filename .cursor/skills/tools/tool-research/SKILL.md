---
name: tool-research
description: Obtener contexto para una tarea
disable-model-invocation: true
metadata:
  version: "1.0.0"
  domain: tools
---

# Research

## Objetivo

Obtener el contexto necesario para abordar una tarea específica antes de planificar o ejecutar.

## Cuándo usar

- Al inicio de cualquier tarea nueva
- Cuando no tenemos claro qué archivos están involucrados
- Antes de hacer cambios en código que no conocemos bien

## Proceso

### 1. Entender la tarea

- ¿Qué se pide exactamente?
- ¿Qué tipo de cambio es? (nueva funcionalidad, bug fix, refactor, etc.)
- ¿Hay requisitos implícitos?

### 2. Identificar el alcance

Buscar en el código:

- Archivos directamente relacionados con la tarea
- Dependencias de esos archivos
- Tests existentes relacionados
- Configuraciones relevantes

### 3. Analizar patrones existentes

- ¿Cómo se han resuelto problemas similares en el proyecto?
- ¿Qué convenciones sigue el código existente?
- ¿Hay componentes o utilidades reutilizables?

### 4. Documentar hallazgos

Generar un resumen con:

**Archivos clave:**

- Lista de archivos que se verán afectados
- Archivos de referencia (ejemplos de patrones similares)

**Patrones identificados:**

- Convenciones de código relevantes
- Arquitectura del área afectada

**Dependencias:**

- Módulos o servicios que interactúan con el código
- APIs o contratos que deben respetarse

**Riesgos potenciales:**

- Áreas del código que podrían verse afectadas indirectamente
- Tests que podrían romperse

### 5. Preparar contexto mínimo

Seleccionar **solo** la información necesaria para la siguiente fase:

- No cargar archivos completos si solo necesitamos una parte
- Priorizar referencias sobre contenido completo
- Mantener el contexto lo más ligero posible

## Resultado esperado

Al finalizar, el usuario debe tener:

- Visión clara de qué archivos tocar
- Comprensión de los patrones a seguir
- Lista de riesgos a considerar
- Contexto suficiente para pasar a planificación

## Importante

- **No ejecutar cambios** durante el research
- **No planificar todavía** - solo recopilar información
- Preguntar al usuario si hay dudas sobre el alcance
- Presentar al usuario un resumen ejecutivo breve y conciso de la información obtenida
