<script>
  import { onMount } from "svelte";
  import SetSvgWidthAndHeight from "./setSvgWidthAndHeight.svelte";
  import { svgWidth, svgHeight, outerRadius } from "../store.js";
  import GetCirclePositions from "./getCirclePositions.svelte";
  import { presidents } from "../data/presidentsData";
  let positions = [];
</script>

<SetSvgWidthAndHeight />
<svg width={$svgWidth} height={$svgHeight}>
  <rect
    width={$svgWidth}
    height={$svgHeight}
    stroke="black"
    stroke-width="3px"
    fill="none"
  ></rect>
  <GetCirclePositions bind:positions />

  {#each positions as position, index}
    <circle
      cx={position.cx}
      cy={position.cy}
      r={$outerRadius}
      stroke="black"
      stroke-width="3px"
      fill="none"
    />
    <line
      x1={position.cx - $outerRadius}
      y1={position.cy + $outerRadius * 1.5}
      x2={position.cx + $outerRadius}
      y2={position.cy + $outerRadius * 1.5}
      stroke="black"
      stroke-width="3px"
    />

    <circle
      cx={position.cx - $outerRadius}
      cy={position.cy + $outerRadius * 1.5}
      r="4"
      fill="black"
    />

    <text
      x={position.cx}
      y={position.cy + $outerRadius * 1.5 - 8}
      text-anchor="middle"
      font-size="16px"
      fill="black"
    >
      {$presidents[index].name}
    </text>
  {/each}
</svg>
