---
name: open-extension-in-dev
description: Compila Skilldex y abre otra ventana de Cursor como Extension Development Host para que la persona revise la extensión. Usar cuando pidan abrir, lanzar, ver o previsualizar la extensión en desarrollo, el Extension Development Host o Run SkillDex Extension. No usar para recorrer el panel desde el agente.
metadata:
  version: "1.0.0"
  domain: project
---

# Abrir Skilldex en desarrollo

Abre una ventana nueva de Cursor con la extensión local cargada. La persona revisa el panel. El agente no entra en esa ventana.

## Qué lanza

- Configuración de `.vscode/launch.json`: `Run SkillDex Extension`.
- Argumento: `--extensionDevelopmentPath` apuntando a la raíz del repo Skilldex (donde está el `package.json` de la extensión).
- Esa ruta carga el código de `out/` y `dist/webview/`, no un VSIX instalado.

## Pasos

1. Sitúate en la raíz de Skilldex.
2. Compila host y webview. Sin este paso la ventana puede mostrar una UI antigua.

```bash
npm run build
```

3. Elige la carpeta que verá el panel. El host lista `.cursor/rules` y `.cursor/skills` de esa carpeta.
   - Si no indican otra, usa la raíz de Skilldex.
   - `extensionDevelopmentPath` sigue siendo la raíz de Skilldex aunque el catálogo sea de otro workspace.
4. Pide la ventana nueva. El CLI vuelve enseguida: entrega la petición a Cursor y no se queda en primer plano.

```bash
cursor --new-window \
  --extensionDevelopmentPath="<raíz absoluta de skilldex>" \
  "<carpeta absoluta a previsualizar>"
```

5. Para. No lances otra ventana si la persona no dice que la anterior no apareció.

## Invitar a revisar

Di a la persona, en el chat, que mire la ventana cuyo título incluye **Extension Development Host**:

- Icono **SkillDex** en la barra lateral, o el comando **SkillDex: Abrir SkillDex**.
- El catálogo es el de la carpeta abierta en esa ventana.

No abras el panel, no pulses el icono y no recorras skills ni rules.

## Límites

- No uses el navegador, Playwright ni Computer Use sobre Cursor. Computer Use no controla Cursor, y el webview no es una página que el agente deba validar.
- No instales el VSIX para esta revisión. Eso muestra la extensión empaquetada, no el árbol de trabajo.
- En un workspace con varias carpetas, F5 usa `${workspaceFolder}` y puede apuntar a una carpeta que no es Skilldex. El comando de arriba fija la ruta absoluta. Si el CLI no abre la ventana, indica a la persona que lance **Run SkillDex Extension** teniendo Skilldex como carpeta del workspace.
- Una sola ventana. No reintentes el comando para comprobar si se abrió.
