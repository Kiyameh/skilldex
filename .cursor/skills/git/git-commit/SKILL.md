---
name: git-commit
description: Crear commit semántico
disable-model-invocation: true
metadata:
  version: "1.0.0"
  domain: git
---

# Commit Semántico

## Trigger

**NUNCA hacer commits automáticamente.** Solo ejecutar este skill cuando el usuario lo invoque explícitamente con `/git-commit` o tras un `/git-split-commits`

## Proceso

### 1. Analizar cambios (si no se ha hecho ya)

```bash
git status
git diff --staged
git diff
```

### 2. Generar mensaje de commit

Formato: `<tipo>: <descripción>`

**Tipos permitidos:**

- `feature`: Nueva funcionalidad
- `fix`: Corrección de bug
- `refactor`: Cambio de código que no añade funcionalidad ni corrige bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (espacios, comas, etc.)
- `test`: Añadir o modificar tests
- `chore`: Tareas de mantenimiento (deps, config, etc.)

**Descripción:** Descriptivo, primera en mayuscula, sin punto final. Máximo 72 caracteres. En castellano salvo que te pidan lo contrario.

### 3. Mostrar al usuario

Antes de ejecutar, mostrar:

- Archivos que se van a incluir
- Mensaje de commit propuesto

Pedir confirmación o ajustes.

### 4. Ejecutar commit

Solo después de confirmación del usuario:

```bash
git add <archivos>
git commit -m "<mensaje>"
```

## Ejemplos

```
feature: Añade la opción de descargar documentos
fix: Corregir el defecto visual en la tabla precios
refactor: Extraer lógica del componente Card de la página about
docs: Actualizar instrucciones de instalación
```
