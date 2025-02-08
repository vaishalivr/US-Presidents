<script>
  import { onMount } from "svelte";
  import OnePresident from "./onePresidentUnit.svelte";
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

  {#each $presidents as president}
    <OnePresident
      cx={president.cx}
      cy={president.cy}
      parts={president.parts}
      name={president.name}
      status={president.status}
      birthYear={president.birthYear}
      deathYear={president.deathYear}
      presidencyStart={president.presidencyStart}
      presidencyEnd={president.presidencyEnd}
    />
  {/each}
</svg>
