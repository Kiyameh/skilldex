---
name: tool-generate-prompt
description: Resume decisiones y contexto de la conversación actual y genera un prompt fiable para otro agente de código en .cursor/prompts/. Usar solo cuando el usuario invoque explícitamente /tool-generate-prompt o pida generar/handoff un prompt de agente.
disable-model-invocation: true
metadata:
  version: "1.0.0"
  domain: tools
---

# Generar Prompt de Agente

## Objetivo

Transferir conocimiento de esta conversación a otro agente de código: sintetizar decisiones y contexto relevante, incorporar instrucciones adicionales del usuario, y escribir un prompt autónomo y ejecutable en `.cursor/prompts/`.

## Cuándo usar

- Solo por invocación manual (`/tool-generate-prompt`, "genera un prompt", "handoff al agente", etc.).
- No generar prompts de forma automática ni proactiva.

## Instrucciones adicionales del usuario

El prompt debe incluir una misión concreta para el agente receptor.

1. Si el usuario ya indicó qué debe hacer el otro agente (tarea, rol, alcance, restricciones), úsalo.
2. Si **no** las aportó, **detente y pregunta** antes de escribir el archivo. Pregunta al menos:
   - ¿Qué debe hacer el agente receptor? (objetivo / primera acción)
   - ¿Hay límites o restricciones extra? (in/out of scope, archivos a tocar/evitar)
   - ¿Rol deseado? (opcional; si no, inferir uno preciso del contexto)
3. No inventar la misión. Esperar respuesta y solo entonces generar el archivo.

## Destino y nombrado

- Carpeta: `.cursor/prompts/` (crearla si no existe).
- Formato: `NN-titulo-corto.md`
  - `NN`: número progresivo de 2 dígitos (`00`, `01`, `02`, …) según los `.md` ya existentes.
  - `titulo-corto`: kebab-case en español, máximo ~6 palabras, que resuma la misión del prompt.
- Ejemplo: `01-implementar-dashboard-rules.md`

### Numeración progresiva

1. Listar `.cursor/prompts/*.md`.
2. Tomar el mayor prefijo numérico existente y sumar 1.
3. Si la carpeta está vacía, empezar en `00`.

## Fiabilidad del prompt (obligatorio)

El archivo debe ser **autónomo**: un agente sin esta conversación debe poder ejecutarlo sin ambigüedad.

Reglas:

- **Español** en todo el prompt (código/nombres de símbolos en inglés si se citan).
- Rol explícito + objetivo medible en la primera sección.
- Contexto mínimo necesario; cero ruido de chat (saludos, tool dumps, repeticiones).
- Decisiones con **qué** y **por qué**; alternativas descartadas solo si evitan que el agente las reabra.
- Límites claros: in-scope / out-of-scope.
- Rutas de archivos concretas cuando existan; no inventar rutas.
- Criterios de aceptación comprobables (lista).
- Instrucciones paso a paso ordenadas; **primera acción requerida** al final.
- Ordenar: no asumir lo no decidido; si falta un dato crítico, indicar que pregunte al usuario antes de actuar.
- Un prompt = una misión. Si hay varias misiones independientes, generar varios archivos con números consecutivos y preguntar antes de dividir.

## Pasos

### 1. Comprobar instrucciones adicionales

Ver sección «Instrucciones adicionales del usuario». Si faltan, preguntar y esperar.

### 2. Extraer de la conversación

Solo lo que el agente receptor necesita:

- Objetivo acordado y resultado esperado
- Decisiones técnicas y de producto (con motivo breve)
- Stack, convenciones y constraints ya fijados
- In-scope / out-of-scope
- Archivos, carpetas o specs relevantes
- Pendientes o riesgos que el receptor debe respetar

Descartar: exploración fallida, debates irrelevantes, código completo (salvo contratos/tipos imprescindibles).

### 3. Sintetizar el prompt

Redactar siguiendo la plantilla de abajo. Preferir listas cortas y encabezados claros (máximo 2–3 niveles).

### 4. Elegir número y título

- Calcular el siguiente `NN`
- `titulo-corto` fiel a la misión (no al tema genérico del chat)
- Si el usuario indica un título, usarlo (adaptado a kebab-case)

### 5. Escribir el archivo

Guardar en `.cursor/prompts/NN-titulo-corto.md`.

### 6. Confirmar al usuario

Indicar la ruta creada y, en una frase, la misión que encapsula. Recordar que puede adjuntar o pegar ese archivo al nuevo agente.

## Plantilla del archivo

```markdown
# [ROL EN MAYÚSCULAS Y MISIÓN BREVE]

## Rol y objetivo

Eres un **[rol preciso]**. Tu objetivo es [resultado medible en una frase].

## Contexto (resumen)

[2–6 frases: qué es el proyecto/tarea y qué se ha acordado ya]

### Decisiones relevantes

- [decisión]: [motivo breve]
- [decisión]: [motivo breve]

### Stack y convenciones

- [solo lo acordado o ya presente en el repo]

## Alcance

### In-scope

1. [ítem concreto]
2. […]

### Out-of-scope

- [prohibido o aplazado]
- […]

## Instrucciones adicionales del usuario

[misión, restricciones y matices que el usuario pidió al generar este prompt; sin diluir]

## Archivos y referencias

- `ruta/relevante` — [para qué]
- [enlaces a specs/chats previos si existen, p. ej. `.cursor/chat/…` o `.cursor/prompts/…`]

## Criterios de aceptación

- [ ] [comprobable]
- [ ] [comprobable]

## Instrucciones de trabajo

1. [paso]
2. [paso]
3. […]

Reglas de ejecución:

- No inventes requisitos ni rutas; si falta un dato crítico, pregunta antes de continuar.
- Respeta in-scope / out-of-scope.
- Código y nombres de símbolos en inglés; comunicación con el usuario en español (si aplica al proyecto).

## Primera acción requerida

[Una sola acción clara con la que debe empezar el agente]
```

## Verificación

- [ ] Invocación explícita del usuario
- [ ] Instrucciones adicionales obtenidas (preguntadas si faltaban)
- [ ] Archivo en `.cursor/prompts/` con prefijo `NN-` correcto (progresivo)
- [ ] Nombre kebab-case y título coherente con la misión
- [ ] Prompt en español, autónomo y sin ruido de chat
- [ ] Decisiones, alcance, criterios y primera acción presentes
- [ ] Usuario informado de la ruta creada
