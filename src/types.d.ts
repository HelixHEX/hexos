import type { WebContentsView } from "electron";

interface Tab {
	url: string;
	tabId: string;
	windowId: number;
	view: WebContentsView;
	isVisible: boolean;
}

interface ClientTab {
	id: Tab["tabId"];
	url: Tab["url"];
	isActive: Tab["isVisible"];
	windowId: Tab["windowId"];
}
