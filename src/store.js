import { writable } from "svelte/store";

export const svgWidth = writable(30);
export const svgHeight = writable(30);
export const maxCirclesPerRow = writable(1);
export const totalRows = writable(1);
export const innerRadius = writable(70);
export const outerRadius = writable(100);
export const circleSpacing = writable(100);
export const rowSpacing = writable(200);
export const titleSpace = writable(300);
export const selectedCircleId = writable(null);
export const hoveredIndex = writable(null);
