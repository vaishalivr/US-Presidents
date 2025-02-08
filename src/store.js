import { writable } from "svelte/store";
export let svgWidth = writable(window.innerWidth / 1.5);
