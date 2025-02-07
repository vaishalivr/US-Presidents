<script>
  import { onMount } from "svelte";
  import Circles from "./onePresidentUnit.svelte";
  import { svgWidth } from "../store.js";
  import { presidents, updatePresidents } from "../data/presidentsCircleData";

  let height = window.innerHeight;

  const updateDimensions = () => {
    svgWidth.set(window.innerWidth / 2);
    height = window.innerHeight;
    updatePresidents();
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

  {#each $presidents as circle}
    <Circles
      cx={circle.cx}
      cy={circle.cy}
      parts={circle.parts}
      name={circle.name}
    />
  {/each}
</svg>
