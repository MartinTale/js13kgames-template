import { Signal, createSignal } from "./signals";

const STATE_KEY = "js13kgames-template";

export type Path = "sound" | "screen";

export type State = {
	lastProcessedAt: Signal<number>;
	sound: Signal<boolean | null>;
	level: Signal<number>;
};

export const emptyState: State = {
	lastProcessedAt: createSignal(Date.now()),
	sound: createSignal(null),
	level: createSignal(0),
};

export let state: State;

let stateLoaded = false;
let autoSaveInterval: number;

export function initState() {
	loadState();

	autoSaveInterval = setInterval(saveState, 15000);
	globalThis.onbeforeunload = () => {
		saveState();
	};
}

export function resetState() {
	clearInterval(autoSaveInterval);
	globalThis.onbeforeunload = null;
	localStorage.removeItem(STATE_KEY);

	setTimeout(() => {
		globalThis.location.reload();
	}, 500);
}

function loadState() {
	const encodedState = localStorage.getItem(STATE_KEY);
	const decodedState = encodedState ? atob(encodedState) : "{}";
	const jsonState = JSON.parse(decodedState) as State | undefined;

	state = Object.entries(emptyState).reduce((acc, [key, signal]) => {
		acc[key] = jsonState?.[key] !== undefined ? createSignal(jsonState[key]) : signal;
		return acc;
	}, {} as State);

	stateLoaded = true;
}

function saveState() {
	if (!stateLoaded) {
		return;
	}

	const jsonState = Object.entries(state).reduce(
		(acc, [key, signal]) => {
			acc[key] = signal.value;
			return acc;
		},
		{} as Record<string, any>,
	);

	const encodedState = btoa(JSON.stringify(jsonState));
	localStorage.setItem(STATE_KEY, encodedState);
}
