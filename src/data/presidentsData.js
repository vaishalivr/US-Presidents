import { writable } from "svelte/store";

export const presidents = writable([
  {
    name: "George Washington",
    status: "dead",
    birthYear: 1732,
    deathYear: 1799,
    presidencyStart: 1789,
    presidencyEnd: 1797,
    parents: "Augustine Washington and Mary Ball Washington",
    keyPolicies: 6,
  },
  {
    name: "John Adams",
    status: "dead",
    birthYear: 1735,
    deathYear: 1826,
    presidencyStart: 1797,
    presidencyEnd: 1801,
    keyPolicies: 16,
  },
  {
    name: "Thomas Jefferson",
    status: "dead",
    birthYear: 1743,
    deathYear: 1826,
    presidencyStart: 1801,
    presidencyEnd: 1809,
    keyPolicies: 12,
  },
  {
    name: "James Madison",
    status: "dead",
    birthYear: 1751,
    deathYear: 1836,
    presidencyStart: 1809,
    presidencyEnd: 1817,
    keyPolicies: 8,
  },
]);
