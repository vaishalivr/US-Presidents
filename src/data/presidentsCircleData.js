import { writable } from "svelte/store";
import { svgWidth } from "../store.js";
import { get } from "svelte/store";

export const presidents = writable([]);

export const updatePresidents = () => {
  presidents.set([
    {
      cx: get(svgWidth) / 4,
      cy: 200,
      parts: 6,
      name: "name1",
    },
    {
      cx: get(svgWidth) / 2,
      cy: 200,
      parts: 10,
      name: "name2",
    },
    {
      cx: (get(svgWidth) * 3) / 4,
      cy: 200,
      parts: 12,
      name: "name3",
    },
    {
      cx: get(svgWidth) / 4,
      cy: 500,
      parts: 6,
      name: "name4",
    },
  ]);
};
