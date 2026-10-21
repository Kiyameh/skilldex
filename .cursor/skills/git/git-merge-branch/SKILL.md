---
name: git-merge-branch
description: Fusionar rama actual en main de forma segura
disable-model-invocation: true
metadata:
  version: "1.0.0"
  domain: git
---

# Fusionar en Main

## Trigger

**NUNCA realizar merges automáticos.** Solo ejecutar este skill cuando el usuario lo invoque explícitamente con `/git-merge-branch`

## Proceso

### 1. Verificación de Estado

- Antes de proceder, identificar el nombre de la rama actual.
- Identificar el nombre de la rama de destino (habitualmente main o master)
- Verificar si hay cambios sin confirmar

```bash
git status
```

Si los hay, pedir al usuario que haga commit o stash primero.

### 2. Confirmación del Usuario

Mostrar un resumen de la operación:

- Origen: nombre_de_tu_rama
- Destino: nombre_de_la_rama_destino

Pedir confirmación explícita para continuar.

### 3. Sincronización y Fusión

Una vez confirmado, ejecutar la secuencia de comandos segura:

```Bash
# 1. Asegurar que main está al día
git checkout main
git pull origin main

# 2. Fusionar la rama de feature en main
git merge nombre_de_tu_rama

```

### 4. Limpieza (Post-Merge)

Tras el merge exitoso, preguntar al usuario si desea eliminar la rama local que ya ha sido fusionada:

Una vez confimado:

```Bash
git branch -d nombre_de_tu_rama
```
