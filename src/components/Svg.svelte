<script>
  import { onMount } from "svelte";
  import Circles from "./onePresidentUnit.svelte";

  let width = window.innerWidth / 2;

  let height = window.innerHeight;
  let circles = [];

  const updateDimensions = () => {
    width = window.innerWidth / 2;
    console.log(width);
    height = window.innerHeight;
    updateCircles();
  };

  const updateCircles = () => {
    circles = [
      {
        cx: width / 4,
        cy: 200,
      },
      {
        cx: width / 2,
        cy: 200,
      },
      {
        cx: (width * 3) / 4,
        cy: 200,
      },
      {
        cx: width / 4,
        cy: 400,
      },
    ];
  };

  onMount(() => {
    updateCircles();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  });
</script>

<svg {width} {height}>
  <rect {width} {height} stroke="black" stroke-width="3px" fill="none"></rect>

  {#each circles as circle}
    <Circles cx={circle.cx} cy={circle.cy} />
  {/each}
</svg>
