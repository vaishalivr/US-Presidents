import { writable } from "svelte/store";
import { svgWidth } from "../store.js";
import { get } from "svelte/store";

export const presidents = writable([]);
let extraGap = 20;

export const updatePresidents = () => {
  presidents.set([
    {
      cx: get(svgWidth) / 4 - extraGap,
      cy: 200,
      parts: 6,
      name: "George Washington",
      status: "dead",
      birthYear: 1732,
      deathYear: 1799,
      presidencyStart: 1789,
      presidencyEnd: 1797,
      parents: "Augustine Washington and Mary Ball Washington",
    },
    {
      cx: get(svgWidth) / 2,
      cy: 200,
      parts: 10,
      name: "John Adams",
      status: "dead",
      birthYear: 1735,
      deathYear: 1826,
      presidencyStart: 1797,
      presidencyEnd: 1801,
    },
    {
      cx: (get(svgWidth) * 3) / 4 + extraGap,
      cy: 200,
      parts: 12,
      name: "Thomas Jefferson",
      status: "dead",
      birthYear: 1743,
      deathYear: 1826,
      presidencyStart: 1801,
      presidencyEnd: 1809,
    },
    {
      cx: get(svgWidth) / 4,
      cy: 500,
      parts: 6,
      name: "James Madison",
      status: "alive",
      birthYear: 1751,
      deathYear: 1836,
      presidencyStart: 1809,
      presidencyEnd: 1817,
    },
  ]);
};
