<script>
  import {
    svgWidth,
    svgHeight,
    outerRadius,
    innerRadius,
    maxCirclesPerRow,
    circleSpacing,
    rowSpacing,
    titleSpace,
    totalRows,
    selectedCircleId,
  } from "../store.js";

  import OnePresidentUnit from "./onePresidentUnit.svelte";
  import { presidents } from "../data/presidentsData";
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  let positions = [];

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

  function handleSvgClick() {
    console.log("svg clicked");
    selectedCircleId.set(null);
  }

  function handlePresidentClick(index) {
    popupVisible.set(true);
    console.log("hello");
  }
</script>

<svg
  width={$svgWidth}
  height={$svgHeight}
  on:click={handleSvgClick}
  on:keydown={handleSvgClick}
>
  <rect
    width={$svgWidth}
    height={$svgHeight}
    stroke="black"
    stroke-width="3px"
    fill="none"
  ></rect>

  {#each positions as position, index}
    <OnePresidentUnit
      cx={position.cx}
      cy={position.cy}
      innerRadius={$innerRadius}
      outerRadius={$outerRadius}
      {index}
      on:presidentClick={() => handlePresidentClick(index)}
    />
  {/each}
</svg>
