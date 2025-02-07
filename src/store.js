import { writable } from "svelte/store";
export let svgWidth = writable(window.innerWidth / 2);
