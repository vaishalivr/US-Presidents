<script>
  import { presidents } from "../data/presidentsData";
  import {
    svgWidth,
    svgHeight,
    maxCirclesPerRow,
    totalRows,
    outerRadius,
    circleSpacing,
    rowSpacing,
    titleSpace,
  } from "../store.js";
  import { onMount } from "svelte";
  import { get } from "svelte/store";

  function updateSvgWidth() {
    let screenWidth = window.innerWidth;

    if (screenWidth > 1024) {
      maxCirclesPerRow.set(3);
    } else if (screenWidth > 768) {
      maxCirclesPerRow.set(2);
    } else {
      maxCirclesPerRow.set(1);
    }
    let totalCirclesWidth = $maxCirclesPerRow * (2 * $outerRadius);
    let totalSpacing = ($maxCirclesPerRow + 1) * $circleSpacing;
    svgWidth.set(totalCirclesWidth + totalSpacing);
  }

  function updateSvgHeight() {
    let totalPresidents = get(presidents).length;

    let rows = Math.ceil(totalPresidents / get(maxCirclesPerRow));
    totalRows.set(rows);

    let totalCirclesHeight = rows * (2 * $outerRadius);
    let totalSpacing = rows * $rowSpacing;

    svgHeight.set($titleSpace + totalCirclesHeight + totalSpacing);
  }

  onMount(() => {
    updateSvgWidth();
    updateSvgHeight();
  });

  window.addEventListener("resize", () => {
    updateSvgWidth();
    updateSvgHeight();
  });
</script>
