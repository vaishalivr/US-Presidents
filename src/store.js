import { writable } from "svelte/store";
import { onMount } from "svelte";
import { get } from "svelte/store";
import { presidents } from "./data/presidentsData";

export const svgWidth = writable(30);
export const svgHeight = writable(30);
export const maxCirclesPerRow = writable(1);
export const totalRows = writable(1);
export const outerRadius = writable(100);
export const circleSpacing = writable(60);
export const rowSpacing = writable(200);
export const titleSpace = writable(200);
