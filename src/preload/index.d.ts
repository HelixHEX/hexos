import type { ElectronAPI } from "@electron-toolkit/preload";
import type { ClientTab } from "../types";

declare global {
	interface Window {
		//biome-ignore lint:
		electronAPI: any;
		electron: ElectronAPI;
		api: unknown;
		tabsApi: {
			getTabs: () => Promise<ClientTab[]>;
		};
	}
}
