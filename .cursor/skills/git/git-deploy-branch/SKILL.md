---
name: git-deploy-branch
description: Verificar rama, hacer release menor y desplegar
disable-model-invocation: true
metadata:
  version: "1.0.0"
  domain: git
---

# Deploy de rama actual

## Trigger

**NUNCA ejecutar este flujo automáticamente.** Solo usar este skill cuando el usuario lo invoque explícitamente con `/git-deploy-branch`.

## 1. Comprobar que no hay cambios en curso

- Ejecutar:

```bash
git status
```

- Si hay cambios sin commitear:
  - Detener el proceso.
  - Informar al usuario de que debe hacer commit o stash de los cambios antes de continuar.

## 2. Ejecutar comandos de verificación (en orden)

Verificar si en el proyecto existen comandos de lint, test, build o format.
Ejecutar los comandos que existan en este orden, deteniendo el flujo ante el primer error:

lint > build > test > format

- Si cualquiera de estos comandos devuelve un error (código distinto de 0):
  - Detener inmediatamente el proceso.
  - Comunicar al usuario qué comando ha fallado y el resumen del error.
- Si todos terminan correctamente, continuar.

## 3. Incrementar versión menor en `package.json`

- Leer el campo `version` de `package.json` (formato estándar `MAJOR.MINOR.PATCH`, por ejemplo `4.1.0`).
- Calcular una nueva versión incrementando en **uno** el número menor y reiniciando el contaro de Patch
  - `4.1.0` → `4.2.0`
  - `1.9.3` → `1.10.0`
  - `0.0.1` → `0.1.0`
- Actualizar la versión en `package.json`.

## 4. Añadir cambios y crear commit

- Hacer stage de todos los cambios generados por los comandos anteriores y por la actualización de `package.json`:

```bash
git add .
```

- Construir el mensaje de commit con el siguiente formato exacto:

Formato: `<tipo>: <descripción><versión>`

**Tipo permitido:**

- `version`: Nueva funcionalidad

**Descripción**
Actualización menor a versión

**Versión**
[version-a-la-que-se-cambia]

```bash
git commit -m "version: Actualización menor a versión 4.2.0"
```

- Si el commit falla (por hooks, etc.), detener el proceso y comunicar al usuario el motivo.

## 5. Ejecutar `/git-merge-branch`

- Una vez creado el commit correctamente:
  - Invocar el skill `/git-merge-branch` para fusionar la rama actual en `main` siguiendo su flujo completo:
    - Verificación de estado.
    - Confirmación del usuario (origen y destino).
    - Sincronización y merge.
    - Limpieza de rama.
- Respetar las reglas definidas en `git-merge-branch/SKILL.md` (incluida la confirmación explícita).

## 6. Hacer `git push`

- Tras completar con éxito el flujo de `/git-merge-branch` y encontrarse en la rama `main` con el merge aplicado:

```bash
git push
```

- Confirmar al usuario que:
  - La rama ha sido fusionada.
  - La nueva versión menor ha sido publicada en el remoto.
