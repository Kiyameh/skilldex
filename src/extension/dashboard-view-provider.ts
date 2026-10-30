import type { ExtensionContext, WebviewView, WebviewViewProvider } from "vscode";
import { commands, RelativePattern, Uri, window, workspace } from "vscode";
import type { CatalogLiveSync } from "./catalog-live-sync.js";
import { SKILLDEX_CONFIGURATION_SECTION } from "./constants.js";
import { getWebviewHtml } from "./get-webview-html.js";
import {
  postCatalog,
  postWorkspaceFolders,
  startHostMessageHandling,
} from "./host-message-adapter.js";
import type { WatchFiles } from "./live-activation-intake.js";
import type { LiveActivationPaths } from "./live-activation-paths.js";
import { startLiveActivationsSession } from "./live-activations-session.js";
import { readAiToolDirectory, readSkilldexSettings } from "./read-skilldex-settings.js";
import type { SelectedWorkspaceFolder } from "./selected-workspace-folder.js";

const watchFiles: WatchFiles = (baseDirectory, globPattern, onFileChanged) => {
  const watcher = workspace.createFileSystemWatcher(
    new RelativePattern(Uri.file(baseDirectory), globPattern),
  );
  const notify = (uri: Uri): void => onFileChanged(uri.fsPath);
  const created = watcher.onDidCreate(notify);
  const changed = watcher.onDidChange(notify);
  return {
    dispose: () => {
      created.dispose();
      changed.dispose();
      watcher.dispose();
    },
  };
};

function workspacePathsForSlugs(openFolderPaths: string[]): string[] {
  const workspaceFile = workspace.workspaceFile;
  if (workspaceFile?.scheme !== "file") return openFolderPaths;
  return [workspaceFile.fsPath, ...openFolderPaths];
}

export class DashboardViewProvider implements WebviewViewProvider {
  public constructor(
    private readonly extensionContext: ExtensionContext,
    private readonly catalogLiveSync: CatalogLiveSync,
    private readonly selectedWorkspaceFolder: SelectedWorkspaceFolder,
    private readonly liveActivationPaths: LiveActivationPaths,
  ) {}

  public resolveWebviewView(webviewView: WebviewView): void {
    const webviewDistUri = Uri.joinPath(this.extensionContext.extensionUri, "dist", "webview");

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [webviewDistUri],
    };

    webviewView.webview.html = getWebviewHtml(webviewView.webview, this.extensionContext);

    const openFolderPaths = (workspace.workspaceFolders ?? []).map((folder) => folder.uri.fsPath);
    const liveActivations = startLiveActivationsSession({
      spoolPath: this.liveActivationPaths.spoolPath,
      projectsDirectory: this.liveActivationPaths.projectsDirectory,
      workspacePaths: workspacePathsForSlugs(openFolderPaths),
      openFolderPaths,
      watchFiles,
    });

    const messageHandling = startHostMessageHandling(webviewView.webview, {
      getWorkspaceRoot: () => this.selectedWorkspaceFolder.getSelectedFolder()?.uri.fsPath,
      getAiToolDirectory: () =>
        readAiToolDirectory(workspace.getConfiguration(SKILLDEX_CONFIGURATION_SECTION)),
      getWorkspaceFoldersSnapshot: () => this.selectedWorkspaceFolder.getSnapshot(),
      selectWorkspaceFolder: (id) => {
        this.selectedWorkspaceFolder.select(id);
      },
      readSettings: () =>
        readSkilldexSettings(workspace.getConfiguration(SKILLDEX_CONFIGURATION_SECTION)),
      subscribeToConfigurationChanges: (listener) => workspace.onDidChangeConfiguration(listener),
      extensionId: this.extensionContext.extension.id,
      executeCommand: (command, argument) => {
        void commands.executeCommand(command, argument);
      },
      liveFeed: liveActivations.feed,
      openSkillDocument: async (skillFilePath) => {
        await window.showTextDocument(Uri.file(skillFilePath));
      },
      onCatalogPublished: (catalog) => liveActivations.setCatalogSkills(catalog.skills),
    });

    const folderChanges = this.selectedWorkspaceFolder.onDidChange(() => {
      postWorkspaceFolders(webviewView.webview, this.selectedWorkspaceFolder.getSnapshot());
    });

    this.catalogLiveSync.setCatalogSink((catalog) => {
      postCatalog(webviewView.webview, catalog);
      liveActivations.setCatalogSkills(catalog.skills);
    });

    webviewView.onDidDispose(() => {
      folderChanges.dispose();
      this.catalogLiveSync.clearCatalogSink();
      messageHandling.dispose();
      liveActivations.dispose();
    });
  }
}
