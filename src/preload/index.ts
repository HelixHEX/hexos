import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Custom APIs for renderer
const api = {
	ipcRenderer: {
		//biome-ignore lint:
		send: (channel: string, ...args: any[]) => {
			if (channel === "get-tabs") {
				console.log("getting-tabs");
				ipcRenderer.invoke(channel);
			} else {
				ipcRenderer.send(channel, ...args);
			}
		},
	},
};

const tabsApi = {
	getTabs: () => ipcRenderer.invoke("get-tabs"),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld("electronAPI", {
			openFile: () => {
				ipcRenderer.invoke("dialog:openFile");
			},
		});
		contextBridge.exposeInMainWorld("electron", electronAPI);
		contextBridge.exposeInMainWorld("api", api);
		contextBridge.exposeInMainWorld("tabsApi", tabsApi);
	} catch (error) {
		console.error(error);
	}
} else {
	// @ts-ignore (define in dts)
	window.electron = electronAPI;
	// @ts-ignore (define in dts)
	window.api = api;
}
