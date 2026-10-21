---
name: tool-document-chat
description: Documenta y archiva la conversación actual en markdown legible dentro de .cursor/chat/. Usar solo cuando el usuario invoque explícitamente documentar, archivar o guardar el chat (p. ej. /tool-document-chat).
disable-model-invocation: true
metadata:
  version: "1.0.0"
  domain: tools
---

# Documentar Chat

## Objetivo

Destilar la conversación actual en uno o más archivos Markdown legibles por humanos en `.cursor/chat/`. No es una transcripción literal: sintetiza decisiones, acuerdos, contexto útil y resultados.

## Cuándo usar

- Solo por invocación manual del usuario (`/tool-document-chat`, "archiva este chat", "documenta la conversación", etc.).
- No archivar de forma automática ni proactiva.

## Destino y nombrado

- Carpeta: `.cursor/chat/` (crearla si no existe).
- Formato: `NN-titulo-corto.md`
  - `NN`: número progresivo de 2 dígitos (`01`, `02`, …) según los archivos ya existentes en la carpeta.
  - `titulo-corto`: kebab-case en español, máximo ~6 palabras, que resuma el tema del archivo.
- Ejemplo: `01-estrategias-troceado-mvp.md`

### Numeración progresiva

1. Listar `.cursor/chat/*.md`.
2. Tomar el mayor prefijo numérico existente y sumar 1.
3. Si la carpeta está vacía, empezar en `01`.

### Conversaciones largas (multi-archivo)

Si el contenido destilado supera ~200 líneas o mezcla fases claramente distintas (p. ej. debate + plan + implementación):

1. Dividir en partes coherentes por tema o fase.
2. Asignar números consecutivos a cada parte.
3. Usar el mismo tema base con sufijo de parte cuando ayude: `03-plan-specs-parte-1.md`, `04-plan-specs-parte-2.md`.
4. En cada archivo, enlazar la parte anterior/siguiente si existen.

No volcar el chat completo. Preferir varios archivos densos y legibles a uno monstruoso.

## Pasos

### 1. Revisar la conversación

Extraer solo lo que aportará valor futuro:

- Objetivo o pregunta inicial del usuario
- Decisiones tomadas (y alternativas descartadas, si importan)
- Acuerdos, criterios y límites (in-scope / out-of-scope)
- Resultados concretos (planes, specs, listas, conclusiones)
- Archivos o rutas relevantes mencionadas
- Preguntas abiertas o siguientes pasos

Descartar: saludos, repeticiones, ruido de herramientas, código completo salvo fragmentos imprescindibles para entender una decisión.

### 2. Sintetizar

Redactar en **español**, tono claro y directo:

- Preferir listas y apartados cortos
- Máximo 2–3 niveles de encabezado
- Un archivo = un hilo temático legible en una sentada
- Incluir el "por qué" de las decisiones, no solo el "qué"

### 3. Elegir número y título

- Calcular el siguiente `NN`
- Proponer un `titulo-corto` fiel al contenido
- Si el usuario indica un título, usarlo (adaptado a kebab-case)

### 4. Escribir el archivo

Guardar en `.cursor/chat/NN-titulo-corto.md` con la plantilla de abajo.

### 5. Confirmar al usuario

Indicar la ruta (o rutas) creadas y, en una frase, qué cubre cada archivo.

## Plantilla del archivo

```markdown
# Título legible en español

- **Fecha:** YYYY-MM-DD
- **Contexto:** [una línea: de qué iba la sesión]
- **Parte:** [opcional: N de M, o enlace a parte anterior/siguiente]

## Resumen

[2–5 frases con el hilo principal y el resultado]

## Objetivo

- [qué pedía el usuario]

## Decisiones

- [decisión]: [motivo breve]
- [alternativa descartada]: [por qué]

## Contenido clave

[lo sustancial: planes, criterios, conclusiones, tablas cortas, bullets]

## Archivos y referencias

- `ruta/relevante`

## Pendiente / siguientes pasos

- [si aplica]

## Notas

[solo matices que no encajen arriba; omitir la sección si está vacía]
```

## Verificación

- [ ] Invocación explícita del usuario (no autoarchivo)
- [ ] Archivo(s) en `.cursor/chat/` con prefijo `NN-` correcto
- [ ] Nombre kebab-case y título humano coherente
- [ ] Contenido en español, sintetizado (no transcripción)
- [ ] Conversación larga partida en partes enlazadas si hace falta
- [ ] Usuario informado de las rutas creadas
