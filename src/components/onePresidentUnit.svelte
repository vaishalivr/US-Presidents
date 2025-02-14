<script>
  import { presidents } from "../data/presidentsData";
  import {
    svgWidth,
    svgHeight,
    maxCirclesPerRow,
    totalRows,
  } from "../store.js";
  import { onMount } from "svelte";
  import { get } from "svelte/store";

  let outerRadius = 100;
  let spacing = 60;
  let rowSpacing = 100;
  let titleSpace = 200;

  function updateSvgWidth() {
    let screenWidth = window.innerWidth;

    if (screenWidth > 1024) {
      maxCirclesPerRow.set(3);
    } else if (screenWidth > 768) {
      maxCirclesPerRow.set(2);
    } else {
      maxCirclesPerRow.set(1);
    }
    maxCirclesPerRow.subscribe((value) => {
      let totalCirclesWidth = value * (2 * outerRadius);
      let totalSpacing = (value + 1) * spacing;

      svgWidth.set(totalCirclesWidth + totalSpacing);
    });
  }

  function updateSvgHeight() {
    let totalPresidents = get(presidents).length;

    let rows = Math.ceil(totalPresidents / get(maxCirclesPerRow));
    totalRows.set(rows);

    let totalCirclesHeight = rows * (2 * outerRadius);
    let totalSpacing = rows * rowSpacing;

    svgHeight.set(titleSpace + totalCirclesHeight + totalSpacing);
  }

  onMount(() => {
    updateSvgWidth();
    updateSvgHeight();
  });

  window.addEventListener("resize", () => {
    updateSvgWidth();
    updateSvgHeight();
  });

  $: positions = $presidents.map((_, index) => {
    let row = Math.floor(index / $maxCirclesPerRow);
    let col = index % $maxCirclesPerRow;

    let rowWidth = $maxCirclesPerRow * (outerRadius * 2 + spacing) - spacing;
    let colOffset = ($svgWidth - rowWidth) / 2;

    return {
      cx: col * (outerRadius * 2 + spacing) + outerRadius + colOffset,
      cy: row * (outerRadius * 2 + rowSpacing) + outerRadius + titleSpace,
    };
  });
</script>

{#each positions as position}
  <circle
    cx={position.cx}
    cy={position.cy}
    r={outerRadius}
    stroke="black"
    stroke-width="3px"
    fill="none"
  />
  <line
    x1={position.cx - outerRadius}
    y1={position.cy + outerRadius}
    x2={position.cx + outerRadius}
    y2={position.cy + outerRadius}
    stroke="black"
    stroke-width="3px"
  ></line>
{/each}
