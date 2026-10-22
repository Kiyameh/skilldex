import type { WebviewToHostMessage } from "../shared/index.js";

export interface VsCodeWebviewApi {
  postMessage(message: WebviewToHostMessage): void;
  getState(): unknown;
  setState(state: unknown): unknown;
}

declare function acquireVsCodeApi(): VsCodeWebviewApi;

let vsCodeApi: VsCodeWebviewApi | undefined;

export function getVsCodeApi(): VsCodeWebviewApi {
  if (vsCodeApi) return vsCodeApi;
  const api = acquireVsCodeApi();
  vsCodeApi = api;
  return api;
}
