import { WebContentsView, type BaseWindow } from "electron";
import { store } from "../index";

const tabs = store.getSnapshot().context.tabs;

export const switchTab = (tabId: string) => {
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

export const createTab = (
	windowId: BaseWindow["id"],
	url,
	message?: string,
) => {
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

export const getTabs = () => {
	const clientTabs = tabs.map((tab) => ({
		id: tab.tabId,
		url: tab.url,
		isActive: tab.isVisible,
		windowId: tab.windowId,
	}));
	return Promise.resolve(clientTabs);
};
