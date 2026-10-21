---
name: tool-context-analysis
description: Análisis completo de contexto
disable-model-invocation: true
metadata:
  version: "1.0.0"
  domain: tools
---

# Análisis Completo de Contexto

## Propósito

**Transparencia absoluta del contexto del agente.**

Este comando proporciona visibilidad total del contexto que el agente está utilizando:

- ¿Qué información tiene el agente disponible?
- ¿Cuánto espacio ocupa cada parte?
- ¿Es el contexto adecuado para la tarea actual?
- ¿Hay información irrelevante que diluya el foco?

## Formato de Salida

El análisis debe incluir:

### 1. Secciones del Contexto

Para cada sección presente:

- Nombre de la sección
- Porcentaje aproximado de ocupación
- Descripción breve del contenido

### 2. Ocupación Visual

```
[Nombre sección]       ████████████░░░░░░░░░░░░░░░░░░░░░░  XX%
[Nombre sección]       ████████░░░░░░░░░░░░░░░░░░░░░░░░░░  XX%
```

Ordenar de mayor a menor porcentaje.

### 3. Análisis Crítico

**Overhead fijo:**

- tool_definitions: X%
- system_prompt: X%
- guidelines: X%
- **Total overhead: X%**

**Contenido útil:**

- Código/archivos: X%
- Reglas del workspace: X%
- Conversación relevante: X%
- **Total útil: X%**

**Desperdicio detectado:**

- Duplicación de datos: X%
- Tool results innecesarios: X%
- **Total desperdicio: X%**

### 4. Evaluación con Semáforo

Usar indicadores:

- 🟢 Verde: Correcto, sin problemas
- 🟡 Amarillo: Atención, puede mejorarse
- 🔴 Rojo: Problema crítico

Evaluar:

- Overhead fijo
- Duplicación de datos
- Adecuación del contexto
- Redundancia
- Colisión semántica

## Notas

- El idioma del análisis es castellano
- Reportar TODO, especialmente lo inesperado
- Ser crítico con duplicaciones y desperdicio
- Cuantificar el impacto real de cada problema
