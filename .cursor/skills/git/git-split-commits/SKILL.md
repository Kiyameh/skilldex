---
name: git-split-commits
description: Dividir cambios en varios commits
disable-model-invocation: true
metadata:
  version: "1.0.0"
  domain: git
---

# Dividir cambios en varios commits

## Trigger

**NUNCA hacer commits automáticamente.** Solo ejecutar este skill cuando el usuario lo invoque explícitamente con `/git-split-commits`.

## Proceso

### 1. Analizar cambios

```bash
git status
git diff --staged
git diff
```

### 2. Decide la división en varios commits

- Separar los cambios en diferentes bloques tématicos.
- Los bloque deben de afectar solo a una categoría o a máximo dos categorias relacionadas:

```example
Commit1
 - Cambios en @/schemas y en @/collections
Commit2
 - Cambios en @/components
Commit3
 - Cambios en @/pages
```

- Si un solo commit afecta a más de 12 archivos, dividelo en subcommits

```example
Commit1
 - Cambios en @/schemas y en @/collections
Commit2
 - Cambios en @/components/blog
Commit3
 - Cambios en @/components/onboard
Commit4
 - Cambios en @/pages
```

### 3. Ordena los commits en función de dependencias

- Evita commits que no sean funcionales sin commits futuros.
- Organiza los commits "de dentro, hacía afuera" en la arquitectura

```ejemplo
1. Cambios en el core: schemas/typos/config/coleciones
2. Cambios en las capas medias: servicios/utils
3. Cambios en los componentes
4. Cambios en las páginas
5. Cambios en los tests
```

### 4. Usar skill /git-commit para decidir los nombres de commit

- Consultar la skill git-commit para decidir un nombre apropiado para cada commit
- No ejecutar commits todavía

### 5. Mostrar al usuario

Antes de ejecutar, hacer un resumen con estos datos:

- Tamaño del commit
- Archivos a incluir
- Resumen de los cambios
- Mensaje propuesto

### 6. Ejecutar commit

**Tras la confirmación** ejecutar todos los commits mediante:

```bash
git add <archivos>
git commit -m "<mensaje>"
```
