import { createStore } from "@xstate/store";
import type { Tab } from "../../types";

export const store = createStore({
	context: { tabs: [] as Tab[] },
	on: {},
});
