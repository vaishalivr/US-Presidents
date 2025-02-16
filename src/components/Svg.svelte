<script>
  import { onMount } from "svelte";
  import SetSvgWidthAndHeight from "./setSvgWidthAndHeight.svelte";
  import { svgWidth, svgHeight } from "../store.js";
  import GetCirclePositions from "./getCirclePositions.svelte";
</script>

<svg width={$svgWidth} height={$svgHeight}>
  <rect
    width={$svgWidth}
    height={$svgHeight}
    stroke="black"
    stroke-width="3px"
    fill="none"
  ></rect>

  <SetSvgWidthAndHeight />
  <GetCirclePositions />
</svg>
<!-- 
calculate cx and cy for all circles and then make OnePresidentUnit -->
