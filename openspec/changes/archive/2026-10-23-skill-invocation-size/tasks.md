# Tasks

## 1. Contrato

- [x] 1.1 Añadir `characterCount?: number` a `CatalogItem` y aceptar en type guards solo enteros finitos `>= 0` cuando el campo está presente (omitido sigue siendo válido); verificar con tests de `type-guards`
- [x] 1.2 Actualizar fixtures de Host/Webview que construyan skills para incluir `characterCount` donde el flujo de catálogo real lo enviaría; verificar que `npm run test:unit` sigue en verde

## 2. Recuento en el Host

- [x] 2.1 Extraer helper puro de code points Unicode (`Array.from(text).length`) y usarlo al mapear skills sobre el string completo del `SKILL.md`; verificar con unit tests (ASCII, emoji fuera de BMP, string vacío, frontmatter+cuerpo)
- [x] 2.2 Mapear `characterCount` solo en skills; omitirlo en rules; verificar con unit tests de `mapFrontmatterToCatalogItem` y con `discover-catalog` (skill con archivo auxiliar extra que no altera el recuento)
- [x] 2.3 Confirmar que toggle success re-mapea el fichero y conserva `characterCount`; verificar en tests existentes de `set-item-enabled` / adapter que el ítem skill resultante incluye el campo

## 3. Formato y card

- [x] 3.1 Implementar formato `es-ES` y `Math.round(characterCount / 2.8)` con constante `CHARS_PER_TOKEN = 2.8` y virgulilla siempre; verificar con unit tests (`1024` → `1.024 caracteres (~366 tokens)`, `0` → `0 caracteres (~0 tokens)`, división exacta conserva `~`)
- [x] 3.2 Pintar la línea en `SkillCard` debajo de la descripción, dentro del reveal hover/focus, con `text-blue-500`; no mostrar en `RuleCard`; verificar con tests RTL (texto, contenedor del reveal, ausencia en rule)

## 4. Comprobación vertical

- [x] 4.1 Ejecutar `npm test` y typecheck/lint; verificar salida en verde
- [x] 4.2 No añadir tokenizer, APIs de LLM ni métrica en Rules; verificar por diff que el alcance se limita a recuento, contrato y `SkillCard`
