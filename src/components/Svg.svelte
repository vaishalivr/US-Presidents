<script>
  import { onMount } from "svelte";
  import OnePresident from "./onePresidentUnit.svelte";
  import { svgWidth, svgHeight } from "../store.js";
  import { presidents } from "../data/presidentsData";

  $: console.log("svg height", $svgHeight);
  $: console.log("svg width", $svgWidth);

  // const updateDimensions = () => {
  //   svgWidth.set(window.innerWidth / 2);
  // };

  // onMount(() => {
  //   //updatePresidents();
  //   window.addEventListener("resize", updateDimensions);
  //   return () => window.removeEventListener("resize", updateDimensions);
  // });
</script>

<svg width={$svgWidth} height={$svgHeight}>
  <rect
    width={$svgWidth}
    height={$svgHeight}
    stroke="black"
    stroke-width="3px"
    fill="none"
  ></rect>

  {#each $presidents as president}
    <OnePresident />
  {/each}
</svg>
