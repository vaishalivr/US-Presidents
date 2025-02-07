<script>
  import { onMount } from "svelte";
  import Circles from "./onePresidentUnit.svelte";
  import { svgWidth } from "../store.js";

  let height = window.innerHeight;
  let circles = [];

  const updateDimensions = () => {
    svgWidth.set(window.innerWidth / 2);
    height = window.innerHeight;
    updatePresidents();
  };

  const updatePresidents = () => {
    circles = [
      {
        cx: $svgWidth / 4,
        cy: 200,
        parts: 6,
        name: "name1",
      },
      {
        cx: $svgWidth / 2,
        cy: 200,
        parts: 10,
        name: "name2",
      },
      {
        cx: ($svgWidth * 3) / 4,
        cy: 200,
        parts: 12,
        name: "name3",
      },
      {
        cx: $svgWidth / 4,
        cy: 500,
        parts: 6,
        name: "name4",
      },
    ];
  };

  onMount(() => {
    updatePresidents();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  });
</script>

<svg width={$svgWidth} {height}>
  <rect width={$svgWidth} {height} stroke="black" stroke-width="3px" fill="none"
  ></rect>

  {#each circles as circle}
    <Circles
      cx={circle.cx}
      cy={circle.cy}
      parts={circle.parts}
      name={circle.name}
    />
  {/each}
</svg>
