# Tasks

## 1. Shared contract module

- [ ] 1.1 Create `src/shared/messages.ts` (or equivalent) with discriminated unions for Host→Webview and Webview→Host messages including handshake
- [ ] 1.2 Create `src/shared/catalog.ts` with minimal `CatalogItem` / kind `rule` | `skill`, `path`, `enabled`, display placeholders
- [ ] 1.3 Add type guards for incoming messages; forbid `any`

## 2. Host and Webview adapters

- [ ] 2.1 Implement Host adapter: send handshake on panel load; handle Webview replies via `onDidReceiveMessage`
- [ ] 2.2 Implement Webview bridge: listen for handshake, reply, expose typed `postMessage` helpers
- [ ] 2.3 Ensure both builds resolve the shared module (aliases/tsconfig paths)

## 3. Verify vertical slice

- [ ] 3.1 Open panel and confirm handshake completes (log or temporary on-screen ok indicator)
- [ ] 3.2 Confirm shared types are imported from one source by Host and Webview
