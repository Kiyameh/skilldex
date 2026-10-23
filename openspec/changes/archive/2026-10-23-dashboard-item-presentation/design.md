# Design

## Context

Ver proposal.md (Why). El catálogo ya llega al Webview como `CatalogItem` plano (`enabled`, `title`, `description`, `globs`). El Host mapea `enabled !== false` y el toggle escribe esa misma clave. Las cards de Rules pintan descripción; las de Skills no agrupan.

El mensaje de toggle sigue transportando un booleano de estado UI; solo cambia el mapeo YAML.

## Goals / Non-Goals

**Goals:**
- Extender `CatalogItem` de forma aditiva (`sections`, `version`, `category`)
- Extraer h2 del cuerpo de Rules con un parser pequeño y testeable
- Agrupar Skills en el Webview a partir de `category` y el orden del array del Host
- Mapear activación Cursor-nativa sin cambiar el discriminante de mensajes

**Non-Goals:**
- Migrar o borrar `enabled` residual
- Clic en secciones, TOC, o `showTextDocument` con fragmento
- Grupos colapsables, agrupación de Rules, o categorías anidadas (`stack/react`)
- Live-sync, create-from-template, o un segundo campo de activación en el contrato

## Decisions

- **Campos aditivos en `CatalogItem`:** `sections?: string[]` (rules; siempre array, vacío si no hay h2), `version?: string`, `category?: string`. Type guards actualizan esos campos opcionales. `enabled` permanece como estado UI.
- **Extracción de h2:** recorrer el body de `gray-matter` línea a línea. Un fence abre/cierra con línea que empieza por ` ``` ` o `~~~` (tras trim). Fuera de fence, una línea que hace match de `^##[ \t]+(.+?)[ \t]*#*[ \t]*$` aporta el título recortado. No contar `###` ni `#`. Constantes nombradas para el empty copy (`No hay secciones`) y el grupo raíz (`Sin categoría`).
- **`metadata.version`:** leer solo `frontmatter.metadata.version` si `metadata` es objeto y `version` es string. No coerción de números YAML. No leer `version` de raíz.
- **Categoría:** relativa POSIX desde `.cursor/skills/`. Si hay un solo segmento de carpeta de skill (`openspec-explore/SKILL.md`) → omitir `category`. Si hay dos o más (`stack/react/foo/SKILL.md`) → `category` = primer segmento (`stack`). El Host no ordena `readdir`.
- **Agrupación UI:** el Webview agrupa el array `skills` establemente: primera aparición de cada categoría define el orden de cabeceras. Skills sin `category` van al grupo `Sin categoría`. Si ese grupo existe, se pinta **primero**; el resto de cabeceras sigue el orden de primera aparición. Title Case: partir el id de carpeta por `-`, capitalizar la primera letra de cada token, unir con espacio (`stack` → `Stack`, `foo-bar` → `Foo Bar`). El literal `Sin categoría` no se transforma.
- **Toggle Rules:** escribir `alwaysApply: true|false`. Leer activo solo si el valor YAML es booleano `true`.
- **Toggle Skills:** escribir `disable-model-invocation: true|false` (clave con guiones). Leer inactivo solo si el valor es booleano `true`; omitido o `false` → activo.
- **No tocar `enabled`:** spread del frontmatter existente + override de la clave nativa; no delete de `enabled`.
- **Contrato de toggle:** se mantiene `webview/toggleEnabled` con `enabled: boolean` = estado UI objetivo. El Host traduce a la clave nativa según `kind`.

**Alternativas descartadas:**
- Agrupar en el Host con un payload anidado: rompe el shape plano que ya consume `useCatalog`.
- Borrar `disable-model-invocation` al activar: el usuario pidió booleanos explícitos, simétrico a `alwaysApply`.
- Parser Markdown completo (remark): exceso para solo h2.

## Risks / Trade-offs

- [alwaysApply false no “apaga” una rule con globs en Cursor] → Aceptado en este MVP; el switch significa always-apply, no “rule muerta”.
- [gray-matter puede reordenar/reformatear YAML al stringify] → Aceptable; mismo riesgo que el toggle actual.
- [h2 en blockquotes u otras extensiones] → Solo se ignoran fences; un `##` citado podría colarse. Suficiente para MVP.
- [Title Case naive no cubre i18n] → Solo aplica a nombres de carpeta; el grupo raíz es literal.

## Migration Plan

- Deploy: el change se aplica sobre el código existente; no hay flag.
- Rollback: revertir el change; los ficheros ya escritos con `alwaysApply` / `disable-model-invocation` siguen siendo válidos para Cursor.
- `enabled` residual: el usuario lo borra a mano; SkillDex lo ignora.

## Open Questions

Ninguna que altere specs. Detalle de CSS muted: clase Tailwind de opacidad ya usada en cards (`opacity-70` / tokens VS Code).
