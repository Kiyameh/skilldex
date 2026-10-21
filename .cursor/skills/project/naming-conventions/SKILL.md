---
name: naming-conventions
description: Convenciones de nombrado
metadata:
  version: "1.0.0"
  domain: project
---

# Convenciones de Nombrado

## Trigger

Usar cuando se crean ficheros, variables, componentes, URLs o cualquier elemento que requiera un nombre.

## UPPERCASE SNAKE

- Constantes globales `const GLOBAL_CONFIG = ....`

## camelCase

- Constantes locales `const objetoVerde = ....` _(con scope limitado)_
- Funciones `crearCosa()`
- Nombres Variables `let objetoAzul = ....`
- Propiedades `firstName: "Jhon"`

## kebab-case

- id en html `id="my-id"`
- urls `/my-profile/`
- nombres de pages `big-page.astro` _(intentar evitar nombres compuestos)_
- directorios `components` _(intentar evitar nombres compuestos)_
- archivos .ts `astro-container` _(intentar evitar nombres compuestos)_

## PascalCase

- Componentes `Button.astro`

## Tests:

- Llamar siempre igual que el objeto que testean, con la coletilla `.test.`
- En la carpeta de paginas (app/pages), empezar por siempre con una barra baja `_mypage.test.ts`
