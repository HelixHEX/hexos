import {
	app,
	ipcMain,
	WebContentsView,
	BaseWindow,
	BaseWindowConstructorOptions,
	dialog,
} from "electron";
import { join } from "node:path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import type { Tab } from "../types";

const windows: BaseWindow[] = [];
const tabs: Tab[] = [];

const views: { [key: string]: WebContentsView } = {};

function createWindow(): void {
	const mainWindow = new BaseWindow({
		tabbingIdentifier: "home",
		width: 1920,
		height: 1080,
		autoHideMenuBar: true,
		...(process.platform === "linux" ? { icon } : {}),
	});
	windows.push(mainWindow);

	const mainWindowView = new WebContentsView({
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			sandbox: false,
		},
	});
	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env.ELECTRON_RENDERER_URL) {
		mainWindowView.webContents.loadURL(process.env.ELECTRON_RENDERER_URL);
	} else {
		mainWindowView.webContents.loadFile(
			join(__dirname, "../renderer/index.html"),
		);
	}
	mainWindowView.setBounds({ x: 0, y: 0, width: 200, height: 1080 });
	mainWindowView.setBackgroundColor("#000");
	mainWindowView.webContents.openDevTools();
	mainWindow.contentView.addChildView(mainWindowView);
	createTab(mainWindow.id, "http://google.com", `tab-${tabs.length + 1}`);

	// mainWindow.addListener("focus", () =>
	// 	createTab(mainWindow.id, "http://google.com", `tab-${tabs.length + 1}`),
	// );

	// !IMPORTANT need to revist
	// mainWindow.on("ready-to-show", () => {
	// 	mainWindow?.show();
	// });

	// !IMPORTNAT I need to re-implement handling opening links
	// mainWindow.webContents.setWindowOpenHandler((details) => {
	// 	shellView.openExternal(details.url);
	// 	return { action: "deny" };
	// });
}

const switchTab = (tabId: string) => {
	// console.log(tabId);
	const tabIndex = tabs.findIndex((tabToFind) => tabToFind.tabId === tabId);
	const tab = tabs[tabIndex];
	if (!tab) {
		console.error("Invalid tabId");
		return;
	}

	//!IMPORTANT will need to improve this
	const currentTabIndex = tabs.findIndex((tab) => tab.isVisible);
	const currentTab = tabs[currentTabIndex];
	if (!currentTab) {
		console.error("Unable to find current tab");
		return;
	}

	console.log(tabs);

	currentTab.view.setVisible(false);
	tabs[currentTabIndex].isVisible = false;

	tab.view.setVisible(true);
	tabs[tabIndex].isVisible = true;
};

const createTab = (windowId: BaseWindow["id"], url, message?: string) => {
	const view = new WebContentsView();
	view.setBounds({ x: 200, y: 0, width: 1720, height: 1080 });
	const window = windows.find((item) => item.id === windowId);

	if (!window) {
		console.log("Unable to find current window");
		return;
	}

	if (tabs.length > 0) {
		const currentTab = tabs.find((tab) => tab.isVisible);
		if (!currentTab) {
			console.log("Unable to find current tab");
			return;
		}
		currentTab.isVisible = false;
		currentTab.view.setVisible(false);
	}

	view.webContents.loadURL(url);
	window.contentView.addChildView(view);
	tabs.push({
		view,
		url,
		windowId,
		tabId: `tab-${tabs.length + 1}`,
		isVisible: true,
	});
};

const getTabs = () => {
	const clientTabs = tabs.map((tab) => ({
		id: tab.tabId,
		url: tab.url,
		isActive: tab.isVisible,
		windowId: tab.windowId,
	}));
	return Promise.resolve(clientTabs);
};

async function handleFileOpen() {
	console.log("hi");
	const { canceled, filePaths } = await dialog.showOpenDialog({});
	if (!canceled) {
		return filePaths[0];
	}
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	// Set app user model id for windows
	electronApp.setAppUserModelId("com.electron");

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on("browser-window-created", (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	//!IMPORTANT LISTEN FOR TABS THAT ARE RUNNING A PROCESS

	// IPC
	ipcMain.on("ping", () => console.log("pong"));
	ipcMain.on("create-window", (_event) => {
		createWindow();
	});
	ipcMain.on("create-tab", (_event, { windowId, url }) => {
		const message = "from browser";
		createTab(windowId, url, message);
	});
	ipcMain.handle("get-tabs", getTabs);
	ipcMain.on("switch-tab", (_event, { tabId }) => {
		switchTab(tabId);
	});
	// ipcMain.handle("dialog:openFile", handleFileOpen);

	createWindow();

	app.on("activate", () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BaseWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
