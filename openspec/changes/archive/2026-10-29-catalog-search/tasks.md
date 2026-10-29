# Tasks

## 1. Filtro puro

- [x] 1.1 Añadir un helper de Webview que recorte la consulta, compare sin distinguir mayúsculas y devuelva la lista original si la consulta queda vacía. En skills coincide `title ?? id` o `description` (solo si es string). En rules coincide solo `title ?? id`. No usa secciones, globs, categoría ni el relleno `Sin descripción`. Verificar con tests unitarios: nombre de skill, descripción, mayúsculas, rule por título, rule excluida por descripción/globs/secciones, skill sin descripción que no coincide con `Sin descripción`, respaldo `id` cuando falta `title`, consulta vacía y solo espacios

## 2. Campo y listas

- [x] 2.1 Poner en la segunda fila del encabezado de `App` un `input type="text"` sin `<label>` visible ni botón, con `placeholder` y nombre accesible `Encuentra algo...`. El estado de la consulta vive en `App`. Verificar con RTL: placeholder, ausencia de etiqueta visible y de botón
- [x] 2.2 Pasar a Skills y Rules las listas ya filtradas y el recuento sin filtrar. Si la lista visible está vacía y el recuento es 0, mantener `No hay skills todavía` / `No hay rules todavía`. Si el recuento es mayor que 0, mostrar `No hemos encontrado nada :(`. Filtrar antes de agrupar para ocultar categorías sin coincidencias. La consulta se conserva al cambiar de pestaña. Verificar con RTL: coincidencia de skill por nombre y por descripción, rule solo por título, mensaje de sin coincidencias, vacío de catálogo intacto con consulta activa, cabecera de categoría ausente, y la pestaña Rules ya filtrada sin perder el texto

## 3. Comprobación vertical

- [x] 3.1 Ejecutar `npm run test:unit` y `npx tsc --noEmit -p tsconfig.webview.json`; verificar salida en verde
- [x] 3.2 Confirmar que el diff no toca el host, el contrato de mensajes ni `CatalogItem`, y que no vuelve a apilar las dos listas
