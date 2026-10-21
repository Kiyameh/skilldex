---
name: git-create-branch
description: Crear nueva rama
disable-model-invocation: true
metadata:
  version: "1.0.0"
  domain: git
---

# Crear rama

## Trigger

**NUNCA crear ramas automáticamente.** Solo ejecutar este skill cuando el usuario lo invoque explícitamente con `/git-create-branch`

## Proceso

### 1. Analiza propmt del usuario para decidir nombre de la rama

- Nombres descriptivos
- Sin tildes, ñ, ni caracteres especiales
- Palabras separadas por barra baja
- Máximo 6 palabras

```examples
actualizacion_astro_6
rediseno_visual_paginas_blog
migracion_a_cms_strapi
```

### 2. Mostrar al usuario

Antes de ejecutar, mostrar:

- Nombre de la nueva rama
- Nombre de la rama de origen

Pedir confirmación o ajustes.

### 3. Actualizar cambios remotos en main

Solo después de confirmación del usuario:

```bash
git checkout main
git pull origin main
```

## 4. Crear nueva rama

```bash
git checkout -b nombre-de-la-rama
```
