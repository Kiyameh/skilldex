# Tasks

## 1. Contrato y tipos de catálogo

- [x] 1.1 Extender `CatalogItem` con `sections?: string[]`, `version?: string` y `category?: string`, y actualizar type guards para aceptar/rechazar esos campos; verificar con los tests de `type-guards`
- [x] 1.2 Ajustar fixtures de tests compartidos (Host y Webview) para incluir `sections: []` en rules cuando haga falta el shape completo; verificar que `npm run test:unit` no rompe guards ni adapters existentes

## 2. Discovery y mapeo nativo

- [x] 2.1 Extraer headings `##` del body (ignorar fences; no contar `#` ni `###`) y asignar `sections` en items `rule`; verificar con unit tests en `map-frontmatter` / extractor (h2 válidos, h2 en fence, lista vacía)
- [x] 2.2 Mapear `version` solo desde `metadata.version` string y `category` desde el primer segmento bajo `.cursor/skills/` (omitir en skills de raíz); verificar con unit tests de mapeo y de `discover-catalog` (fixture `stack/...` vs raíz)
- [x] 2.3 Derivar `enabled` de `alwaysApply === true` (rules) y de `disable-model-invocation !== true` (skills); ignorar `enabled` YAML; verificar con unit tests de omitido/`false`/`true` y de `enabled` residual
- [x] 2.4 Actualizar tests de integración de discovery en workspace temporal (rule con h2 + skill con `metadata.version` y carpeta de categoría); verificar con `npm run test:integration`

## 3. Persistencia del toggle

- [x] 3.1 Cambiar `setItemEnabled` para escribir `alwaysApply` (rules) o `disable-model-invocation` (skills) con booleanos explícitos, sin crear/borrar/alterar `enabled`; verificar con unit tests de body intacto y de clave `enabled` residual
- [x] 3.2 Actualizar integración de toggle en workspace temporal (skill off → `disable-model-invocation: true`; rule on → `alwaysApply: true`); verificar con `npm run test:integration`

## 4. Cards de Rules y Skills

- [x] 4.1 En `RuleCard`, sustituir la descripción por la lista de `sections` (o `No hay secciones`), globs debajo, sin handlers de clic en secciones; verificar con tests RTL de `rule-card`
- [x] 4.2 En `SkillCard`, mostrar `version` muted a la derecha del nombre solo si existe, manteniendo descripción al hover; verificar con tests RTL (con versión, sin versión, descripción presente)

## 5. Agrupación de Skills

- [x] 5.1 Agrupar `skills` en `SkillsSection` por `category`, cabecera `Sin categoría` primero si aplica, resto por orden de primera aparición, Title Case de carpeta, sin collapse; verificar con tests RTL de `skills-section` (varios grupos, raíz, Title Case `foo-bar` → `Foo Bar`)
- [x] 5.2 Confirmar que `RulesSection` sigue siendo lista plana; verificar que los tests de `rules-section` no introducen cabeceras de categoría

## 6. Comprobación vertical

- [x] 6.1 Ejecutar `npm test` (unit + integration) y `npm run typecheck` / lint del proyecto; verificar salida en verde
- [x] 6.2 No implementar create-from-template ni cambiar live-sync más allá del shape de catálogo que ya consume `host/catalog`; verificar por diff que esos módulos no ganan features nuevas
