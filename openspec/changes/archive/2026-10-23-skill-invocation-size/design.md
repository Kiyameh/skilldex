# Design

## Context

Ver proposal.md (Why). Discovery ya lee el `SKILL.md` completo con `readFile(..., "utf8")` y lo pasa a `mapFrontmatterToCatalogItem`. `CatalogItem` no tiene tamaño. `SkillCard` revela descripción y Editar con `group-hover` / `group-focus-within`. Live-sync reusa el mismo discovery, así que un recuento en el mapeo se refresca sin un watcher extra.

Este change es independiente de `dashboard-item-presentation`.

## Goals / Non-Goals

**Goals:**
- Contar code points del `SKILL.md` una vez por mapeo y transportar `characterCount`
- Formatear y estimar tokens solo en el Webview
- Pintar la línea en el mismo reveal que la descripción

**Non-Goals:**
- Tokenizers reales, APIs de LLM, o coste por modelo
- Sumar archivos auxiliares de la Skill
- Métrica equivalente en Rules
- Cambiar el color a un token de VS Code

## Decisions

- **Recuento en el Host sobre el string ya leído:** `characterCount = Array.from(fileContents).length` (code points Unicode; un emoji BMP-fuera cuenta 1). No `Buffer.byteLength` (bytes) ni `.length` UTF-16. Extraer un helper puro y testeable (p. ej. `countUnicodeCodePoints`) usado desde el mapeo de skills. Rules no reciben la propiedad.
- **`characterCount` aditivo en `CatalogItem`:** `characterCount?: number`. Type guard: si está presente, entero finito `>= 0`. Los skills del catálogo y del `toggleResult` ok lo incluyen porque re-leen y re-mapean el fichero.
- **Estimación en el Webview:** constante `CHARS_PER_TOKEN = 2.8`. `estimatedTokens = Math.round(characterCount / CHARS_PER_TOKEN)` (en positivos, 1.5 → 2). No enviar tokens por el contrato, para no duplicar la regla de redondeo.
- **Formato `es-ES`:** `characterCount.toLocaleString("es-ES")` y el mismo locale para tokens. Plantilla: `` `${chars} caracteres (~${tokens} tokens)` ``. Cero: `0 caracteres (~0 tokens)`.
- **UI:** un `<p>` (o equivalente semántico de solo lectura) debajo del bloque de descripción, dentro del contenedor que ya abre en hover/focus. Clase `text-blue-500`. Sin `aria-hidden` que quite el dato a lectores de pantalla una vez revelado el grupo; el reveal existente ya limita visibilidad visual.
- **Archivo vacío o skill sin body:** el string leído puede ser `""` → `0`; la línea no se oculta. Si falta `characterCount` en un skill (payload viejo en tests), tratar como `0` en UI para no romper renders.

**Alternativas descartadas:**
- Contar solo el body de gray-matter: subestima la invocación real (el modelo ve el YAML).
- Enviar `tokenEstimate` desde el Host: dos fuentes de verdad para 2.8 y el redondeo.
- Azul vía `--vscode-textLink-foreground`: el usuario pidió `text-blue-500` fijo.

## Risks / Trade-offs

- [`text-blue-500` puede contrastar mal en temas claros/oscuros] → Aceptado; requisito de producto.
- [2.8 chars/token es una heurística grosera frente a BPE] → Aceptado; se muestra con `~`.
- [Array.from no agrupa grafemas (familia + modificador = 2)] → Suficiente para MVP; más simple que `Intl.Segmenter`.
- [Concurrencia con `dashboard-item-presentation` en el mismo `SkillCard`] → Aplicar en el reveal de descripción existente; no depende de version/categoría.

## Migration Plan

- Deploy: change aditivo; clientes que ignoren campos extra siguen funcionando.
- Rollback: revertir el change; no hay persistencia nueva en disco.

## Open Questions

Ninguna.
