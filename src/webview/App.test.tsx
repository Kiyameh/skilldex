import { fireEvent, render, screen, within } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HOST_TO_WEBVIEW_MESSAGE_TYPES, WEBVIEW_TO_HOST_MESSAGE_TYPES } from "../shared/index.js";
import { App } from "./App";

const SAMPLE_SKILL = {
  id: ".cursor/skills/demo/SKILL.md",
  kind: "skill" as const,
  path: "/tmp/.cursor/skills/demo/SKILL.md",
  enabled: true,
  title: "demo-skill",
  description: "Demo",
  characterCount: 1024,
};

const ACTIVATED_AT = "2026-10-30T10:08:00.000Z";

const SAMPLE_RULE = {
  id: ".cursor/rules/example.mdc",
  kind: "rule" as const,
  path: "/tmp/.cursor/rules/example.mdc",
  enabled: false,
  title: "example-rule",
  globs: [] as string[],
};

function dispatchHostMessage(data: unknown): void {
  act(() => {
    window.dispatchEvent(new MessageEvent("message", { data }));
  });
}

function dispatchSettings(
  settings: {
    showSkills: boolean;
    showRules: boolean;
    showLiveArea?: boolean;
  } = {
    showSkills: true,
    showRules: true,
  },
): void {
  dispatchHostMessage({
    type: HOST_TO_WEBVIEW_MESSAGE_TYPES.settings,
    showLiveArea: true,
    ...settings,
  });
}

function connectAndLoadCatalog(): void {
  dispatchHostMessage({ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready });
  dispatchSettings();
  dispatchHostMessage({
    type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
    skills: [SAMPLE_SKILL],
    rules: [SAMPLE_RULE],
  });
}

const postMessage = vi.fn();

vi.mock("./vscode-api", () => ({
  getVsCodeApi: () => ({
    postMessage,
    getState: () => undefined,
    setState: (state: unknown) => state,
  }),
}));

describe("App", () => {
  afterEach(() => {
    postMessage.mockReset();
  });

  it("shows disconnected badge by default", () => {
    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("desconectado");
  });

  it("shows the actualizado badge after a host ready message", () => {
    render(<App />);

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready },
        }),
      );
    });

    expect(screen.getByRole("status")).toHaveTextContent("actualizado");
    expect(postMessage).toHaveBeenCalledWith({ type: WEBVIEW_TO_HOST_MESSAGE_TYPES.ready });
  });

  it("requests the catalog after handshake and shows the skills tab by default", () => {
    render(<App />);

    dispatchHostMessage({ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready });

    expect(postMessage).toHaveBeenCalledWith({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.catalogRequest,
    });
    expect(screen.getByText("Catálogo: esperando…")).toBeInTheDocument();

    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
      skills: [SAMPLE_SKILL],
      rules: [SAMPLE_RULE],
    });

    expect(screen.getByText("Catálogo: esperando…")).toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();

    dispatchSettings();

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAccessibleName("Skills");
    expect(tabs[1]).toHaveAccessibleName("Rules");
    expect(screen.getByRole("tab", { name: "Skills", selected: true })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Rules", selected: false })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "demo-skill" })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "example-rule" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Catalog dump")).not.toBeInTheDocument();
    expect(screen.queryByText(/skills \/ .* rules/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Rules" }));

    expect(screen.getByRole("tab", { name: "Rules", selected: true })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "demo-skill" })).not.toBeInTheDocument();
    expect(screen.getByRole("article", { name: "example-rule" })).toBeInTheDocument();
  });

  it("shows the empty state of the selected tab when the catalog is empty", () => {
    render(<App />);

    dispatchHostMessage({ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready });
    dispatchSettings();
    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
      skills: [],
      rules: [],
    });

    const main = screen.getByRole("main", { name: "SkillDex dashboard" });
    expect(within(main).getByText("No hay skills todavía")).toBeInTheDocument();
    expect(within(main).queryByText("No hay rules todavía")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Rules" }));

    expect(within(main).getByText("No hay rules todavía")).toBeInTheDocument();
    expect(within(main).queryByText("No hay skills todavía")).not.toBeInTheDocument();
  });

  it("does not mark handshake connected on catalog messages alone", () => {
    render(<App />);

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
            skills: [],
            rules: [],
          },
        }),
      );
    });

    expect(screen.getByRole("status")).toHaveTextContent("desconectado");
    expect(postMessage).not.toHaveBeenCalled();
  });

  it("optimistically toggles a skill and keeps the state after success", () => {
    render(<App />);
    connectAndLoadCatalog();

    const skillCard = screen.getByRole("article", { name: "demo-skill" });
    fireEvent.click(within(skillCard).getByRole("switch", { name: "Auto" }));

    expect(postMessage).toHaveBeenCalledWith({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.toggleEnabled,
      id: SAMPLE_SKILL.id,
      enabled: false,
    });
    expect(within(skillCard).getByRole("switch", { name: "Manual" })).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: HOST_TO_WEBVIEW_MESSAGE_TYPES.toggleResult,
            ok: true,
            item: { ...SAMPLE_SKILL, enabled: false },
          },
        }),
      );
    });

    expect(within(skillCard).getByRole("switch", { name: "Manual" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("reverts optimistic toggle and shows an error on failure", () => {
    render(<App />);
    connectAndLoadCatalog();

    const skillCard = screen.getByRole("article", { name: "demo-skill" });
    fireEvent.click(within(skillCard).getByRole("switch", { name: "Auto" }));
    expect(within(skillCard).getByRole("switch", { name: "Manual" })).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: HOST_TO_WEBVIEW_MESSAGE_TYPES.toggleResult,
            ok: false,
            id: SAMPLE_SKILL.id,
            enabled: false,
            error: "Permission denied",
          },
        }),
      );
    });

    expect(within(skillCard).getByRole("switch", { name: "Auto" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Permission denied");
  });

  it("posts openItem when Editar is clicked on a skill card", () => {
    render(<App />);
    connectAndLoadCatalog();

    const skillCard = screen.getByRole("article", { name: "demo-skill" });
    fireEvent.click(within(skillCard).getByRole("button", { name: "Editar" }));

    expect(postMessage).toHaveBeenCalledWith({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openItem,
      id: SAMPLE_SKILL.id,
    });
  });

  it("posts openItem when Editar is clicked on a rule card", () => {
    render(<App />);
    connectAndLoadCatalog();

    fireEvent.click(screen.getByRole("tab", { name: "Rules" }));

    const ruleCard = screen.getByRole("article", { name: "example-rule" });
    fireEvent.click(within(ruleCard).getByRole("button", { name: "Editar" }));

    expect(postMessage).toHaveBeenCalledWith({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openItem,
      id: SAMPLE_RULE.id,
    });
  });

  it("shows an alert when openResult fails", () => {
    render(<App />);
    connectAndLoadCatalog();

    const skillCard = screen.getByRole("article", { name: "demo-skill" });
    fireEvent.click(within(skillCard).getByRole("button", { name: "Editar" }));

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            type: HOST_TO_WEBVIEW_MESSAGE_TYPES.openResult,
            ok: false,
            id: SAMPLE_SKILL.id,
            error: "File not found",
          },
        }),
      );
    });

    expect(screen.getByRole("alert")).toHaveTextContent("File not found");
  });

  it("shows a search field without a visible label or submit control", () => {
    render(<App />);
    connectAndLoadCatalog();

    const searchField = screen.getByRole("textbox", { name: "Encuentra algo..." });
    const header = searchField.closest("header");

    expect(searchField).toHaveAttribute("placeholder", "Encuentra algo...");
    expect(searchField).toHaveAttribute("type", "text");
    expect(header).not.toBeNull();
    if (header === null) return;
    expect(header.querySelector("label")).toBeNull();
    expect(within(header).getAllByRole("button")).toHaveLength(1);
    expect(within(header).getByRole("button", { name: "Configuración" })).toBeInTheDocument();
    expect(searchField.previousElementSibling?.tagName).toBe("svg");
    expect(searchField).toHaveClass("pl-9");
  });

  it("filters skills by visible name or description and keeps the query on the rules tab", () => {
    render(<App />);

    dispatchHostMessage({ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready });
    dispatchSettings();

    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
      skills: [
        {
          ...SAMPLE_SKILL,
          id: ".cursor/skills/react/SKILL.md",
          title: "React Conventions",
          description: "Hooks",
          category: "stack",
        },
        {
          ...SAMPLE_SKILL,
          id: ".cursor/skills/acceso/SKILL.md",
          title: "Otra",
          description: "Control de acceso",
          category: "project",
        },
        {
          ...SAMPLE_SKILL,
          id: ".cursor/skills/sin-desc/SKILL.md",
          title: "Sin campo",
          description: undefined,
        },
      ],
      rules: [
        {
          ...SAMPLE_RULE,
          id: ".cursor/rules/ejemplo.mdc",
          title: "Ejemplo",
          description: "filtra por globs",
          globs: ["**/*.ts"],
        },
        {
          ...SAMPLE_RULE,
          id: ".cursor/rules/otra.mdc",
          title: "Otra rule",
        },
      ],
    });

    const searchField = screen.getByRole("textbox", { name: "Encuentra algo..." });

    fireEvent.change(searchField, { target: { value: "react" } });
    expect(screen.getByRole("article", { name: "React Conventions" })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "Otra" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Stack" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Project" })).not.toBeInTheDocument();

    fireEvent.change(searchField, { target: { value: "acceso" } });
    expect(screen.getByRole("article", { name: "Otra" })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "React Conventions" })).not.toBeInTheDocument();

    fireEvent.change(searchField, { target: { value: "descripción" } });
    expect(screen.getByText("No hemos encontrado nada :(")).toBeInTheDocument();
    expect(screen.queryByText("No hay skills todavía")).not.toBeInTheDocument();

    fireEvent.change(searchField, { target: { value: "ejemplo" } });
    fireEvent.click(screen.getByRole("tab", { name: "Rules" }));

    expect(searchField).toHaveValue("ejemplo");
    expect(screen.getByRole("article", { name: "Ejemplo" })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "Otra rule" })).not.toBeInTheDocument();

    fireEvent.change(searchField, { target: { value: "glob" } });
    expect(screen.getByText("No hemos encontrado nada :(")).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "Ejemplo" })).not.toBeInTheDocument();
  });

  it("keeps the catalog empty message when a query is active and there are no items", () => {
    render(<App />);

    dispatchHostMessage({ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready });
    dispatchSettings();
    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
      skills: [],
      rules: [],
    });

    fireEvent.change(screen.getByRole("textbox", { name: "Encuentra algo..." }), {
      target: { value: "react" },
    });

    expect(screen.getByText("No hay skills todavía")).toBeInTheDocument();
    expect(screen.queryByText("No hemos encontrado nada :(")).not.toBeInTheDocument();
  });

  it("requests settings from the header button and keeps it when both sections are hidden", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Configuración" }));
    expect(postMessage).toHaveBeenCalledWith({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openSettings,
    });

    dispatchHostMessage({ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready });
    dispatchSettings({
      showSkills: false,
      showRules: false,
    });

    expect(screen.getByRole("button", { name: "Configuración" })).toBeInTheDocument();
  });

  it("shows the raccoon empty state when both sections are hidden", () => {
    render(<App />);
    dispatchHostMessage({ type: HOST_TO_WEBVIEW_MESSAGE_TYPES.ready });
    dispatchSettings({
      showSkills: false,
      showRules: false,
    });

    expect(
      screen.getByText("No tienes ningún panel seleccionado, así que toma un mapache :D"),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Mapache" })).toHaveClass("w-40");
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(screen.queryByText("No hay skills todavía")).not.toBeInTheDocument();
    expect(screen.queryByText("No hay rules todavía")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ir a la config" }));
    expect(postMessage).toHaveBeenCalledWith({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openSettings,
    });
  });

  it("shows SkillDex and no folder choice when no workspace folder is open", () => {
    render(<App />);
    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.workspaceFolders,
      folders: [],
      selectedId: null,
    });

    const heading = screen.getByRole("heading", { name: "SkillDex" });
    expect(heading.previousElementSibling?.tagName).toBe("svg");
    expect(heading.querySelector("svg")).toBeNull();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Carpeta de análisis/ })).not.toBeInTheDocument();
  });

  it("shows the only folder name and its path without a choice control", () => {
    render(<App />);
    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.workspaceFolders,
      folders: [{ id: "file:///tmp/only", name: "only", path: "/tmp/only" }],
      selectedId: "file:///tmp/only",
    });

    const heading = screen.getByRole("heading", { name: "only" });
    expect(heading).toHaveAttribute("title", "/tmp/only");
    expect(heading).not.toHaveTextContent("SkillDex");
    expect(heading.previousElementSibling?.tagName).toBe("svg");
    expect(heading.querySelector("svg")).toBeNull();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Carpeta de análisis/ })).not.toBeInTheDocument();
  });

  it("lists every open root and asks the host to select the chosen folder", () => {
    render(<App />);
    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.workspaceFolders,
      folders: [
        { id: "file:///tmp/alpha", name: "alpha", path: "/tmp/alpha" },
        { id: "file:///tmp/beta", name: "beta", path: "/repos/beta" },
      ],
      selectedId: "file:///tmp/alpha",
    });

    const chooser = screen.getByRole("button", { name: "Carpeta de análisis: alpha" });
    expect(chooser).toHaveAttribute("aria-haspopup", "listbox");
    expect(chooser).toHaveAttribute("title", "/tmp/alpha");
    expect(chooser).toHaveClass("cursor-pointer");
    expect(chooser.querySelector("svg")).not.toBeNull();
    expect(chooser.closest("h1")?.previousElementSibling?.tagName).toBe("svg");

    fireEvent.click(chooser);

    const options = within(screen.getByRole("listbox")).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(["alpha", "beta"]);

    fireEvent.click(options[1]!);
    expect(postMessage).toHaveBeenCalledWith({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.selectWorkspaceFolder,
      id: "file:///tmp/beta",
    });
    expect(screen.getByRole("button", { name: "Carpeta de análisis: beta" })).toHaveAttribute(
      "title",
      "/repos/beta",
    );
  });

  it("clears the search and drops the previous catalog when the selected folder changes", () => {
    render(<App />);
    connectAndLoadCatalog();

    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.workspaceFolders,
      folders: [
        { id: "file:///tmp/a", name: "alpha", path: "/tmp/a" },
        { id: "file:///tmp/b", name: "beta", path: "/tmp/b" },
      ],
      selectedId: "file:///tmp/a",
    });
    expect(screen.getByRole("article", { name: "demo-skill" })).toBeInTheDocument();

    const searchField = screen.getByRole("textbox", { name: "Encuentra algo..." });
    fireEvent.change(searchField, { target: { value: "demo" } });
    fireEvent.click(
      within(screen.getByRole("article", { name: "demo-skill" })).getByRole("switch"),
    );

    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.workspaceFolders,
      folders: [
        { id: "file:///tmp/a", name: "alpha", path: "/tmp/a" },
        { id: "file:///tmp/b", name: "beta", path: "/tmp/b" },
      ],
      selectedId: "file:///tmp/b",
    });

    expect(screen.queryByRole("article", { name: "demo-skill" })).not.toBeInTheDocument();
    expect(searchField).toHaveValue("");

    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
      skills: [{ ...SAMPLE_SKILL, enabled: true }],
      rules: [],
    });
    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.toggleResult,
      ok: true,
      item: { ...SAMPLE_SKILL, enabled: false },
    });

    const skillCard = screen.getByRole("article", { name: "demo-skill" });
    expect(within(skillCard).getByRole("switch", { name: "Auto" })).toBeInTheDocument();
    expect(searchField).toHaveValue("");
  });

  it("hides Rules when a later snapshot disables that section", () => {
    render(<App />);
    connectAndLoadCatalog();

    dispatchSettings({
      showSkills: true,
      showRules: false,
    });

    expect(screen.getByRole("article", { name: "demo-skill" })).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "example-rule" })).not.toBeInTheDocument();
    expect(screen.queryByText("No hay rules todavía")).not.toBeInTheDocument();
  });

  it("hides the Live area when that preference is off and restores the same chips", () => {
    render(<App />);
    connectAndLoadCatalog();
    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.liveFeed,
      watching: true,
      chips: [
        {
          id: "activation-1",
          name: "demo-skill",
          workspaceName: "demo",
          activatedAt: ACTIVATED_AT,
        },
      ],
    });

    dispatchSettings({ showSkills: true, showRules: true, showLiveArea: false });

    expect(screen.queryByRole("region", { name: "Live" })).not.toBeInTheDocument();
    expect(screen.getByRole("article", { name: "demo-skill" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("actualizado");

    dispatchSettings({ showSkills: true, showRules: true, showLiveArea: true });

    expect(screen.getByRole("list", { name: "Activaciones de skills" })).toHaveTextContent(
      "demo-skill",
    );
  });

  it("starts Live running and empty, then paints the chips of each host snapshot", () => {
    render(<App />);
    connectAndLoadCatalog();

    const chipList = screen.getByRole("list", { name: "Activaciones de skills" });
    expect(screen.getByRole("img", { name: "Live en marcha" })).toBeInTheDocument();
    expect(within(chipList).queryAllByRole("listitem")).toHaveLength(0);

    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.liveFeed,
      watching: true,
      chips: [
        { id: "activation-2", name: "testing", workspaceName: "demo", activatedAt: ACTIVATED_AT },
        {
          id: "activation-1",
          name: "demo-skill",
          workspaceName: "demo",
          activatedAt: ACTIVATED_AT,
        },
      ],
    });

    expect(
      within(chipList)
        .getAllByRole("listitem")
        .map((chip) => chip.textContent),
    ).toEqual(["He usado testing de demo", "He usado demo-skill de demo"]);
  });

  it("sends stop, resume and reset requests from the Live buttons without touching the badge", () => {
    render(<App />);
    connectAndLoadCatalog();
    postMessage.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "Parar Live" }));
    expect(postMessage).toHaveBeenLastCalledWith({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.setLiveWatching,
      watching: false,
    });

    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.liveFeed,
      watching: false,
      chips: [],
    });
    expect(screen.getByRole("img", { name: "Live parado" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("actualizado");

    fireEvent.click(screen.getByRole("button", { name: "Reanudar Live" }));
    expect(postMessage).toHaveBeenLastCalledWith({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.setLiveWatching,
      watching: true,
    });

    fireEvent.click(screen.getByRole("button", { name: "Reiniciar Live" }));
    expect(postMessage).toHaveBeenLastCalledWith({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.resetLiveFeed,
    });
  });

  it("opens the skill document when a live chip is clicked", () => {
    render(<App />);
    connectAndLoadCatalog();
    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.liveFeed,
      watching: true,
      chips: [
        {
          id: "activation-1",
          name: "demo-skill",
          workspaceName: "demo",
          activatedAt: ACTIVATED_AT,
        },
      ],
    });
    postMessage.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "Abrir demo-skill" }));

    expect(postMessage).toHaveBeenCalledWith({
      type: WEBVIEW_TO_HOST_MESSAGE_TYPES.openLiveActivation,
      id: "activation-1",
    });
  });

  it("keeps Live chips when another analysis folder is chosen", () => {
    render(<App />);
    connectAndLoadCatalog();
    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.workspaceFolders,
      folders: [
        { id: "file:///tmp/a", name: "a", path: "/tmp/a" },
        { id: "file:///tmp/b", name: "b", path: "/tmp/b" },
      ],
      selectedId: "file:///tmp/a",
    });
    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.liveFeed,
      watching: true,
      chips: [
        {
          id: "activation-1",
          name: "demo-skill",
          workspaceName: "demo",
          activatedAt: ACTIVATED_AT,
        },
      ],
    });

    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.workspaceFolders,
      folders: [
        { id: "file:///tmp/a", name: "a", path: "/tmp/a" },
        { id: "file:///tmp/b", name: "b", path: "/tmp/b" },
      ],
      selectedId: "file:///tmp/b",
    });
    dispatchHostMessage({
      type: HOST_TO_WEBVIEW_MESSAGE_TYPES.catalog,
      skills: [SAMPLE_SKILL],
      rules: [],
    });

    const chipList = screen.getByRole("list", { name: "Activaciones de skills" });
    expect(within(chipList).getByText("demo-skill")).toBeInTheDocument();
  });
});
