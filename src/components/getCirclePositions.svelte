<script>
  import {
    maxCirclesPerRow,
    svgWidth,
    outerRadius,
    circleSpacing,
    rowSpacing,
    titleSpace,
  } from "../store.js";
  import { presidents } from "../data/presidentsData.js";

  export let positions = [];

  $: positions = $presidents.map((_, index) => {
    let row = Math.floor(index / $maxCirclesPerRow);
    let col = index % $maxCirclesPerRow;

    let totalCirclesInRow = Math.min(
      $maxCirclesPerRow,
      $presidents.length - row * $maxCirclesPerRow
    );
    let rowWidth =
      totalCirclesInRow * ($outerRadius * 2 + $circleSpacing) - $circleSpacing;

    let colOffset = ($svgWidth - rowWidth) / 2;

    return {
      cx: col * ($outerRadius * 2 + $circleSpacing) + $outerRadius + colOffset,
      cy: row * ($outerRadius * 2 + $rowSpacing) + $outerRadius + $titleSpace,
    };
  });
</script>
